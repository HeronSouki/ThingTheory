// Node host: fonts, canvas factory, narration data.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setCanvasFactory } from '../src/engine/env.js';
import { setNarration } from '../src/engine/core.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export { ROOT };

export function setupHost() {
  const F = path.join(ROOT, 'assets/fonts');
  GlobalFonts.registerFromPath(path.join(F, 'Fredoka.ttf'), 'Fredoka');
  GlobalFonts.registerFromPath(path.join(F, 'PatrickHand-Regular.ttf'), 'Patrick Hand');
  GlobalFonts.registerFromPath(path.join(F, 'PermanentMarker-Regular.ttf'), 'Permanent Marker');
  GlobalFonts.registerFromPath(path.join(F, 'LuckiestGuy-Regular.ttf'), 'Luckiest Guy');
  setCanvasFactory((w, h) => createCanvas(w, h));
  const words = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/words.json'), 'utf8'));
  const env = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/envelope.json'), 'utf8'));
  setNarration(words, env);
}
export { createCanvas };
