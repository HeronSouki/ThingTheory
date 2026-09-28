// Render still frames or a contact sheet for review.
//   node render/still.js 12.5 30 61            -> PNGs in ./out/stills
//   node render/still.js --sheet 60 150 24     -> contact sheet of 24 frames between 60s and 150s
import { setupHost, createCanvas, ROOT } from './host.js';
import { renderFrame } from '../src/main.js';
import fs from 'fs';
import path from 'path';

setupHost();
const args = process.argv.slice(2);
const outDir = process.env.OUT || path.join(ROOT, 'out', 'stills');
fs.mkdirSync(outDir, { recursive: true });
const c = createCanvas(1920, 1080);
const ctx = c.getContext('2d');

if (args[0] === '--sheet') {
  const [a, b, n] = [parseFloat(args[1]), parseFloat(args[2]), parseInt(args[3] || '16', 10)];
  const cols = n <= 9 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const tw = 1920 / cols, th = 1080 / cols;
  const sheet = createCanvas(1920, th * rows);
  const sc = sheet.getContext('2d');
  for (let i = 0; i < n; i++) {
    const t = a + ((b - a) * i) / Math.max(1, n - 1);
    renderFrame(ctx, t);
    sc.drawImage(c, (i % cols) * tw, Math.floor(i / cols) * th, tw, th);
    sc.fillStyle = 'rgba(0,0,0,0.6)';
    sc.fillRect((i % cols) * tw, Math.floor(i / cols) * th, 110, 34);
    sc.fillStyle = '#fff';
    sc.font = '26px Fredoka';
    sc.fillText(t.toFixed(2), (i % cols) * tw + 8, Math.floor(i / cols) * th + 26);
  }
  const f = path.join(outDir, `sheet_${a}_${b}.png`);
  fs.writeFileSync(f, sheet.toBuffer('image/png'));
  console.log(f);
} else {
  for (const s of args) {
    const t = parseFloat(s);
    const t0 = Date.now();
    renderFrame(ctx, t);
    const f = path.join(outDir, `still_${t.toFixed(2)}.png`);
    fs.writeFileSync(f, c.toBuffer('image/png'));
    console.log(f, Date.now() - t0, 'ms');
  }
}
