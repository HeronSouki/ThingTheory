// Render worker (spawned by render.js).
//   scan mode:   node render/worker.js <episode> scan   <start> <end> <index> <count> <events.json>
//                renders every frame on a tiny canvas only to collect sound-effect cues
//   stream mode: node render/worker.js <episode> stream <start> <end> <index> <count> <scale>
//                renders frames index, index+count, ... and writes raw RGBA frames to stdout
import fs from 'fs';
import { loadEpisode, createCanvas } from './host.js';
import { setBaseScale } from '#lib/engine/draw.js';
import { sfxEvents, setSfxEnabled } from '#lib/engine/sfx.js';

const [episode, mode, a, b, idx, cnt, extra] = process.argv.slice(2);
const FPS = 30;
const F0 = parseInt(a, 10), F1 = parseInt(b, 10), I = parseInt(idx, 10), N = parseInt(cnt, 10);

const { renderFrame } = await loadEpisode(episode, { quiet: true });

if (mode === 'scan') {
  setBaseScale(1 / 16);
  const canvas = createCanvas(120, 68);
  const ctx = canvas.getContext('2d');
  for (let f = F0 + I; f < F1; f += N) {
    renderFrame(ctx, f / FPS);
    canvas.data();
  }
  fs.writeFileSync(extra, JSON.stringify(sfxEvents()));
} else {
  setSfxEnabled(false);
  const scale = parseFloat(extra || '1');
  setBaseScale(scale);
  const w = Math.round(1920 * scale), h = Math.round(1080 * scale);
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const out = process.stdout;
  const frameBytes = w * h * 4;
  for (let f = F0 + I; f < F1; f += N) {
    renderFrame(ctx, f / FPS);
    const buf = Buffer.from(canvas.data());
    if (!out.write(buf) || out.writableLength > frameBytes * 2) {
      await new Promise((res) => out.once('drain', res));
    }
  }
  await new Promise((res) => out.end(res));
}
