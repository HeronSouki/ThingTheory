// Full render of one episode in one pass:
//   1. parallel "scan" workers collect sound-effect cues (tiny canvas, fast)
//   2. tools/sfx.py synthesizes the SFX track
//   3. parallel "stream" workers render frames; they are interleaved in order into a
//      single ffmpeg process that encodes H.264 and mixes narration + SFX at the same time.
//
//   node render/render.js [--ep 001] [--workers 4] [--scale 1] [--start 0] [--end <episode end>]
//                         [--out out/<episode>/<episode>.mp4] [--no-sfx] [--crf 18] [--preset medium]
//   --ep defaults to the newest episode; --scale below 1 writes <episode>-preview.mp4 instead.
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ROOT, resolveEpisode, parseArgs } from './host.js';
import { FFMPEG } from './ffmpeg.js';

const { flags } = parseArgs();
const opt = (name, def) => (flags[name] !== undefined && flags[name] !== true ? flags[name] : def);
const flag = (name) => flags[name] !== undefined;
const ep = resolveEpisode(flags.ep);
const FPS = 30;
const workers = parseInt(opt('workers', String(Math.max(1, os.cpus().length))), 10);
const scale = parseFloat(opt('scale', '1'));
const start = parseFloat(opt('start', '0'));
const end = parseFloat(opt('end', String(ep.end)));
const out = path.resolve(ROOT, opt('out', path.join(ep.out, `${ep.id}${scale < 1 ? '-preview' : ''}.mp4`)));
const work = path.join(ep.out, 'work');
fs.mkdirSync(work, { recursive: true });
fs.mkdirSync(path.dirname(out), { recursive: true });

const F0 = Math.round(start * FPS), F1 = Math.round(end * FPS);
const nFrames = F1 - F0;
const dur = nFrames / FPS;
const W = Math.round(1920 * scale), H = Math.round(1080 * scale);
const frameBytes = W * H * 4;
const worker = path.join(ROOT, 'render', 'worker.js');
const t0 = Date.now();
const secs = () => ((Date.now() - t0) / 1000).toFixed(0) + 's';

// ---- 1. sound cues ------------------------------------------------------------
let sfxWav = null;
if (!flag('no-sfx')) {
  console.log(`scanning ${nFrames} frames for sound cues...`);
  const evFiles = [];
  await Promise.all(Array.from({ length: workers }, (_, i) => {
    const ev = path.join(work, `ev_${i}.json`);
    evFiles.push(ev);
    return runAsync(process.execPath, [worker, ep.id, 'scan', String(F0), String(F1), String(i), String(workers), ev]);
  }));
  const merged = new Map();
  for (const f of evFiles) for (const e of JSON.parse(fs.readFileSync(f, 'utf8'))) {
    const m = merged.get(e.key);
    if (!m || e.t < m.t) merged.set(e.key, e);
  }
  const events = [...merged.values()].map((e) => ({ ...e, t: e.t - start })).filter((e) => e.t >= 0 && e.t < dur).sort((x, y) => x.t - y.t);
  const evPath = path.join(work, 'sfx_events.json');
  fs.writeFileSync(evPath, JSON.stringify(events));
  sfxWav = path.join(work, 'sfx.wav');
  run('python3', [path.join(ROOT, 'tools', 'sfx.py'), evPath, sfxWav, String(dur)]);
  console.log(`${events.length} cues -> sfx track (${secs()})`);
}

// ---- 2. ffmpeg: raw frames from stdin + narration (+ sfx) -> mp4 -------------------
const narration = ep.file('narration.mp3');
const ffArgs = ['-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-'];
const tracks = [];
if (fs.existsSync(narration)) {
  ffArgs.push('-ss', String(start), '-i', narration);
  tracks.push('nar');
} else console.warn(`${ep.id}: no narration.mp3 yet, rendering without voice-over`);
if (sfxWav) {
  ffArgs.push('-i', sfxWav);
  tracks.push('fx');
}
const filters = tracks.map((name, i) => `[${i + 1}:a]aresample=44100,apad,atrim=0:${dur}[${name}]`);
if (tracks.length === 2) filters.push('[nar][fx]amix=inputs=2:normalize=0:duration=first[mix]');
const amap = tracks.length === 2 ? '[mix]' : tracks.length ? `[${tracks[0]}]` : null;
if (amap) ffArgs.push('-filter_complex', filters.join(';'), '-map', '0:v', '-map', amap, '-c:a', 'aac', '-b:a', '192k');
else ffArgs.push('-map', '0:v', '-an');
ffArgs.push('-c:v', 'libx264', '-preset', opt('preset', 'medium'), '-tune', 'animation', '-crf', opt('crf', scale < 1 ? '23' : '18'),
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-t', String(dur), out);
const ff = spawn(FFMPEG, ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
const ffDone = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));

// ---- 3. interleave frames from parallel workers ---------------------------------
console.log(`${ep.id}: rendering ${nFrames} frames (${dur.toFixed(1)}s) at ${W}x${H} with ${workers} workers`);
const readers = Array.from({ length: workers }, (_, i) => frameReader(spawn(process.execPath, [worker, ep.id, 'stream', String(F0), String(F1), String(i), String(workers), String(scale)], { stdio: ['ignore', 'pipe', 'inherit'] })));
for (let f = 0; f < nFrames; f++) {
  const frame = await readers[f % workers].next();
  if (!frame) throw new Error(`worker ${f % workers} ended early at frame ${f}`);
  if (!ff.stdin.write(frame)) await new Promise((res) => ff.stdin.once('drain', res));
  if (f % 900 === 0) console.log(`  frame ${f}/${nFrames} (${secs()})`);
}
ff.stdin.end();
await ffDone;
console.log(`wrote ${out} (${secs()})`);

// Pulls exact-size frames out of a worker's stdout stream.
function frameReader(proc) {
  const chunks = [];
  let have = 0, ended = false, wake = null;
  proc.stdout.on('data', (d) => {
    chunks.push(d);
    have += d.length;
    if (have > frameBytes * 3) proc.stdout.pause();
    if (wake) { const w = wake; wake = null; w(); }
  });
  proc.stdout.on('end', () => { ended = true; if (wake) { const w = wake; wake = null; w(); } });
  proc.on('close', (c) => { if (c !== 0) console.error(`worker exited with ${c}`); });
  return {
    async next() {
      while (have < frameBytes) {
        if (ended) return null;
        proc.stdout.resume();
        await new Promise((res) => (wake = res));
      }
      const buf = Buffer.allocUnsafe(frameBytes);
      let off = 0;
      while (off < frameBytes) {
        const c = chunks[0];
        const take = Math.min(c.length, frameBytes - off);
        c.copy(buf, off, 0, take);
        off += take;
        if (take === c.length) chunks.shift();
        else chunks[0] = c.subarray(take);
      }
      have -= frameBytes;
      if (have < frameBytes * 2) proc.stdout.resume();
      return buf;
    },
  };
}

function run(cmd, a) {
  const r = spawnSync(cmd, a, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`command failed: ${cmd} ${a.join(' ')}`);
}
function runAsync(cmd, a) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, a, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('close', (c) => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
  });
}
