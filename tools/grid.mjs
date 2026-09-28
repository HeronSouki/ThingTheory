// Compose existing still PNGs into one grid image for quick review: node tools/grid.mjs out.png a.png b.png ...
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
const files = process.argv.slice(3);
const out = process.argv[2];
const cols = Math.ceil(Math.sqrt(files.length));
const tw = 1920 / cols, th = 1080 / cols;
const rows = Math.ceil(files.length / cols);
const c = createCanvas(1920, th * rows); const g = c.getContext('2d');
for (let i = 0; i < files.length; i++) { const im = await loadImage(files[i]); g.drawImage(im, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); }
fs.writeFileSync(out, c.toBuffer('image/png'));
