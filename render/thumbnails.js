// Renders an episode's YouTube thumbnails plus a review sheet (feed, sidebar and phone sizes).
//   node render/thumbnails.js [--ep 001] -> out/<episode>/thumbnails/
//     <name>.png (1920x1080), <name>.jpg (1280x720, what you upload), review_sheet.png
// The designs live in episodes/<episode>/thumbnails.js, which exports
//   T (the frozen animation time) and thumbnails: [{ name, label, draw(ctx) }].
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { loadImage } from '@napi-rs/canvas';
import { loadEpisode, createCanvas, parseArgs } from './host.js';
import { W, H, TAU } from '#lib/engine/core.js';
import { setFrame, fillScreen, P } from '#lib/engine/draw.js';
import { applyPaper } from '#lib/engine/paper.js';

const CHANNEL = 'Thing Theory';
const { flags } = parseArgs();
const ep = await loadEpisode(flags.ep);
const { T, thumbnails } = await import(pathToFileURL(ep.file('thumbnails.js')).href);
const OUT = path.join(ep.out, 'thumbnails');
fs.mkdirSync(OUT, { recursive: true });

const big = createCanvas(W, H);
const g = big.getContext('2d');
const graded = createCanvas(W, H);
const gg = graded.getContext('2d');
const small = createCanvas(1280, 720);
const sg = small.getContext('2d');
const files = [];
for (const { name, label, draw } of thumbnails) {
  setFrame(T);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  fillScreen(g, P.paper);
  draw(g);
  g.save();
  g.globalAlpha = 0.45; // lighter paper grain than the video: thumbnails need punch
  applyPaper(g);
  g.restore();
  // colour grade: a touch more saturation and contrast
  gg.filter = 'saturate(1.18) contrast(1.06)';
  gg.drawImage(big, 0, 0);
  gg.filter = 'none';
  fs.writeFileSync(path.join(OUT, `${name}.png`), graded.toBuffer('image/png'));
  sg.drawImage(graded, 0, 0, 1280, 720);
  const jpg = small.toBuffer('image/jpeg', 92);
  fs.writeFileSync(path.join(OUT, `${name}.jpg`), jpg);
  files.push({ name, label: label || name, jpg: path.join(OUT, `${name}.jpg`), kb: Math.round(jpg.length / 1024) });
  console.log(`${name}: 1920x1080 png + 1280x720 jpg (${Math.round(jpg.length / 1024)} KB)${jpg.length > 2e6 ? '  WARNING: over the 2 MB upload limit' : ''}`);
}

// ---- review sheet: how they look in a feed, sidebar and on a phone -----------------------
const TITLE = ep.meta.title;
const secs = Math.round(ep.end);
const DURATION = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
const n = files.length;
const colW = Math.min(620, Math.floor(1800 / n));
const sheet = createCanvas(1920, 750 + n * 250);
const c = sheet.getContext('2d');
c.fillStyle = '#FFFFFF';
c.fillRect(0, 0, sheet.width, sheet.height);
c.fillStyle = '#0F0F0F';
c.font = '600 44px Fredoka';
c.fillText('Home feed (desktop)', 60, 70);
const imgs = [];
for (const f of files) imgs.push(await loadImage(f.jpg));
imgs.forEach((im, i) => {
  const x = 60 + i * colW, y = 110, w = colW - 40, h = Math.round(w * 9 / 16);
  c.save();
  rounded(c, x, y, w, h, 18);
  c.clip();
  c.drawImage(im, x, y, w, h);
  c.restore();
  c.fillStyle = 'rgba(0,0,0,0.8)';
  rounded(c, x + w - 80, y + h - 36, 70, 28, 6);
  c.fill();
  c.fillStyle = '#fff';
  c.font = '600 20px Fredoka';
  c.fillText(DURATION, x + w - 68, y + h - 15);
  c.fillStyle = '#0F0F0F';
  c.font = '600 28px Fredoka';
  c.fillText(TITLE, x + 70, y + h + 44, w - 70);
  c.fillStyle = '#606060';
  c.font = '400 24px Fredoka';
  c.fillText(`${CHANNEL} • 1.2M views • 2 days ago`, x + 70, y + h + 82);
  c.fillStyle = ['#E8877A', '#86A8D0', '#EDC468', '#8DB580'][i % 4];
  c.beginPath(); c.arc(x + 28, y + h + 56, 24, 0, TAU); c.fill();
});
c.fillStyle = '#0F0F0F';
c.font = '600 44px Fredoka';
c.fillText('Suggested sidebar', 60, 640);
c.fillText('Phone search result', 1060, 640);
imgs.forEach((im, i) => {
  const x = 60, y = 680 + i * 250;
  c.save(); rounded(c, x, y, 402, 226, 12); c.clip(); c.drawImage(im, x, y, 402, 226); c.restore();
  c.fillStyle = '#0F0F0F';
  c.font = '600 26px Fredoka';
  wrap(c, TITLE, 360).slice(0, 2).forEach((l, k) => c.fillText(l, x + 420, y + 36 + k * 34));
  c.fillStyle = '#606060';
  c.font = '400 22px Fredoka';
  c.fillText(CHANNEL, x + 420, y + 106);
  // tiny
  const tx0 = 1060, ty0 = 680 + i * 250;
  c.save(); rounded(c, tx0, ty0, 168, 94, 8); c.clip(); c.drawImage(im, tx0, ty0, 168, 94); c.restore();
  c.fillStyle = '#0F0F0F';
  c.font = '600 22px Fredoka';
  c.fillText(files[i].label, tx0 + 190, ty0 + 40);
  c.fillStyle = '#606060';
  c.font = '400 20px Fredoka';
  c.fillText(`${files[i].kb} KB jpg, 1280x720`, tx0 + 190, ty0 + 72);
});
fs.writeFileSync(path.join(OUT, 'review_sheet.png'), sheet.toBuffer('image/png'));
console.log('review sheet written');

function wrap(ctx, str, maxW) {
  const lines = [''];
  for (const word of str.split(' ')) {
    const tryLine = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word;
    if (ctx.measureText(tryLine).width > maxW && lines[lines.length - 1]) lines.push(word);
    else lines[lines.length - 1] = tryLine;
  }
  return lines;
}
function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
