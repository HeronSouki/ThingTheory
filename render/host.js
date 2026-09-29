// Node host: fonts, canvas factory and episode lookup shared by every render/tool script.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { setCanvasFactory } from '#lib/engine/env.js';
import { setNarration } from '#lib/engine/core.js';
import { createRenderer } from '#lib/renderer.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const EPISODES = path.join(ROOT, 'episodes');
export { createCanvas };

let fontsReady = false;
export function setupHost() {
  if (fontsReady) return;
  const F = path.join(ROOT, 'assets/fonts');
  GlobalFonts.registerFromPath(path.join(F, 'Fredoka.ttf'), 'Fredoka');
  GlobalFonts.registerFromPath(path.join(F, 'PatrickHand-Regular.ttf'), 'Patrick Hand');
  GlobalFonts.registerFromPath(path.join(F, 'PermanentMarker-Regular.ttf'), 'Permanent Marker');
  GlobalFonts.registerFromPath(path.join(F, 'LuckiestGuy-Regular.ttf'), 'Luckiest Guy');
  setCanvasFactory((w, h) => createCanvas(w, h));
  fontsReady = true;
}

// Every episode folder (episodes/NNN-slug), oldest first. Folders starting with _ are skipped.
export function listEpisodes() {
  return fs.readdirSync(EPISODES, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && fs.existsSync(path.join(EPISODES, e.name, 'episode.json')))
    .map((e) => e.name)
    .sort();
}

// Finds an episode by folder name or unique prefix ("001", "001-greg"); no argument = newest.
export function resolveEpisode(query) {
  const all = listEpisodes();
  if (!all.length) throw new Error('no episodes found in episodes/');
  if (!query) return episodeInfo(all[all.length - 1]);
  const hits = all.filter((n) => n === query || n.startsWith(query) || n.split('-').slice(1).join('-').startsWith(query));
  if (hits.length !== 1) throw new Error(hits.length ? `"${query}" matches ${hits.join(', ')}` : `no episode matches "${query}" (have: ${all.join(', ')})`);
  return episodeInfo(hits[0]);
}

function episodeInfo(id) {
  const dir = path.join(EPISODES, id);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'episode.json'), 'utf8'));
  return { id, dir, meta, end: meta.end, out: path.join(ROOT, 'out', id), file: (f) => path.join(dir, f) };
}

// Fonts + narration timing + the episode's timeline. Returns the episode info plus
// { renderFrame(ctx, t), timeline() }.
export async function loadEpisode(query, { quiet = false } = {}) {
  setupHost();
  const ep = resolveEpisode(query);
  const read = (f) => JSON.parse(fs.readFileSync(ep.file(f), 'utf8'));
  if (fs.existsSync(ep.file('words.json'))) setNarration(read('words.json'), read('envelope.json'));
  else {
    setNarration([], []);
    if (!quiet) console.warn(`${ep.id}: narration not aligned yet (npm run align -- --ep ${ep.id}); scenes use draft times`);
  }
  const mod = await import(pathToFileURL(ep.file('index.js')).href);
  return { ...ep, ...createRenderer(mod.build) };
}

// Tiny flag parser: --name value / --flag, the rest are positional.
export function parseArgs(argv = process.argv.slice(2)) {
  const flags = {}, rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { rest.push(a); continue; }
    const [k, v] = a.slice(2).split('=');
    if (v !== undefined) flags[k] = v;
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) flags[k] = argv[++i];
    else flags[k] = true;
  }
  return { flags, rest };
}
