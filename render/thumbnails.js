// YouTube thumbnails built from the same characters and world as the video.
//   node render/thumbnails.js  -> out/thumbnails/thumb_{1,2,3}.png (1920x1080), .jpg (1280x720) and a review sheet
//
// Design rules used for every variant: one focal point, a big readable face with a strong
// emotion, at most three words, saturated colour contrast, and a check at phone size.
import fs from 'fs';
import path from 'path';
import { setupHost, createCanvas, ROOT } from './host.js';
import { setFrame, P, shape, circle, ellipse, line, tx, text, rrect, glow, vgrad, fillScreen, font, measure } from '../src/engine/draw.js';
import { W, H, TAU, hash, lerp, rng } from '../src/engine/core.js';
import { applyPaper } from '../src/engine/paper.js';
import { drawPerson } from '../src/chars/person.js';
import { forestBG, arcticBG, oceanBG, blowingSnow, waterFront, pine, cloud } from '../src/bg.js';
import { campfire, bigHand } from '../src/props.js';
import { countdown } from '../src/ui.js';
import { jeansFloat, sharkFin } from '../src/scenes/ocean.js';

setupHost();
const OUT = path.join(ROOT, 'out', 'thumbnails');
fs.mkdirSync(OUT, { recursive: true });
const T = 12.3; // fixed "time" for boil/idle poses

// ---- thumbnail typography -------------------------------------------------------
// Chunky headline: hard 3D extrude + thick ink outline + fill (reads at 168px wide)
function headline(ctx, str, x, y, size, fill, opt = {}) {
  const { r = 0, align = 'center', extrude = size * 0.07, stroke = P.ink, sw = size * 0.2, inner = null } = opt;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  ctx.font = font('bold', size);
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  // soft shadow
  ctx.fillStyle = 'rgba(10,15,20,0.45)';
  ctx.strokeStyle = 'rgba(10,15,20,0.45)';
  ctx.lineWidth = sw;
  ctx.strokeText(str, extrude * 1.6, extrude * 2.2);
  ctx.fillText(str, extrude * 1.6, extrude * 2.2);
  // extrusion
  for (let i = Math.ceil(extrude); i > 0; i -= 2) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = sw;
    ctx.strokeText(str, i * 0.7, i);
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = sw;
  ctx.strokeText(str, 0, 0);
  if (inner) {
    ctx.strokeStyle = inner;
    ctx.lineWidth = sw * 0.35;
    ctx.strokeText(str, 0, 0);
  }
  ctx.fillStyle = fill;
  ctx.fillText(str, 0, 0);
  ctx.restore();
}

function vignette(ctx, strength = 0.55, color = '10,15,25') {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(1, `rgba(${color},${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function redCircle(ctx, x, y, rx, ry) {
  const pts = [];
  for (let i = 0; i <= 44; i++) {
    const a = -0.4 + (i / 40) * TAU;
    const k = 1 + (i / 44) * 0.08;
    pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]);
  }
  line(ctx, pts, { color: P.white, lw: 34, smooth: true, wob: 2 });
  line(ctx, pts, { color: '#E8322A', lw: 20, smooth: true, wob: 2 });
}
function redArrow(ctx, x1, y1, x2, y2, bend = 0.25) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const cx = mx - (y2 - y1) * bend, cy = my + (x2 - x1) * bend;
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    pts.push([(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2]);
  }
  const [ex, ey] = pts[20], [px, py] = pts[17];
  const a = Math.atan2(ey - py, ex - px);
  const head = [[ex + Math.cos(a + 2.5) * 70, ey + Math.sin(a + 2.5) * 70], [ex + Math.cos(a) * 12, ey + Math.sin(a) * 12], [ex + Math.cos(a - 2.5) * 70, ey + Math.sin(a - 2.5) * 70]];
  for (const [c, w] of [[P.white, 40], ['#E8322A', 24]]) {
    line(ctx, pts.slice(0, 19), { color: c, lw: w, smooth: true, wob: 1.5 });
    line(ctx, head, { color: c, lw: w, wob: 1.5 });
  }
}

// frost & icicles drawn on the head (character-local coordinates)
function frozenHat(ctx, hy) {
  // lumpy snow pile on the hair: outlined blobs, then refilled so only the outer edge keeps its line
  const lumps = [[-56, hy - 52, 24], [-28, hy - 68, 28], [4, hy - 74, 30], [34, hy - 68, 27], [58, hy - 50, 22], [-66, hy - 34, 16], [68, hy - 32, 15]];
  for (const [x, y, r] of lumps) circle(ctx, x, y, r, { fill: '#F7FBFF', lw: 6, wob: 0.8 });
  for (const [x, y, r] of lumps) circle(ctx, x, y, r - 3, { fill: '#F7FBFF', stroke: null, wob: 0.8 });
  for (const [x, y, r] of lumps.slice(0, 5)) ellipse(ctx, x + 4, y + r * 0.45, r * 0.7, r * 0.3, { fill: '#CFE3F5', stroke: null, wob: 0.5 });
  // icicles hanging from the fringe
  for (const [x, l] of [[-44, 40], [-20, 26], [6, 36], [30, 24], [50, 32]]) {
    shape(ctx, [[x - 8, hy - 42], [x + 8, hy - 42], [x + 1, hy - 42 + l]], { fill: '#E2F2FF', lw: 3.5, wob: 0.5 });
  }
  // frozen drip under the nose
  shape(ctx, [[-5, hy + 19], [6, hy + 19], [1, hy + 29]], { fill: '#E2F2FF', lw: 3, wob: 0.3 });
  // frosty rim along the jaw
  const rim = [];
  for (let i = 0; i <= 16; i++) { const a = 0.35 + (i / 16) * 2.45; rim.push([Math.cos(a) * 54, hy + Math.sin(a) * 51]); }
  line(ctx, rim, { color: 'rgba(255,255,255,0.75)', lw: 7, smooth: true, wob: 0.6 });
}
function shiverTicks(ctx, x, y, r) {
  for (const sd of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const a = sd < 0 ? Math.PI + (i - 1) * 0.35 : (i - 1) * 0.35;
      const x0 = x + Math.cos(a) * r, y0 = y + Math.sin(a) * r;
      const x1 = x + Math.cos(a) * (r + 60), y1 = y + Math.sin(a) * (r + 60);
      line(ctx, [[x0, y0], [x1, y1]], { color: P.white, lw: 14, outline: 3, wob: 1 });
    }
  }
}
function breath(ctx, x, y, s) {
  for (let i = 0; i < 3; i++) circle(ctx, x + i * 50 * s, y - i * 18 * s, (26 + i * 12) * s, { fill: 'rgba(245,250,255,0.85)', stroke: null, wob: 1 });
}

const FROST = { c: '#5FA0F0', k: 0.62 };
const COLD_FACE = { eyes: 'wide', brows: [0.9, 0.9], browTilt: 1.2, mouth: 'teeth' };
const HAPPY_FACE = { eyes: 'open', brows: [0.45, 0.45], mouth: 'grin' };

// ================================================================================
// 1. FOREVER vs HOURS — split
// ================================================================================
function thumb1(ctx) {
  const splitTop = 1010, splitBot = 870;
  const left = [[-10, -10], [splitTop, -10], [splitBot, H + 10], [-10, H + 10]];
  const right = [[splitTop, -10], [W + 10, -10], [W + 10, H + 10], [splitBot, H + 10]];
  // left: summer forest
  ctx.save();
  ctx.beginPath(); left.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
  tx(ctx, { s: 1.25, x: -260, y: -170 }, () => forestBG(ctx, T, { noTrees: true }));
  glow(ctx, 330, 330, 520, '#FFF1B8', 0.45);
  campfire(ctx, 820, 1020, 1.5, T, 1.1);
  drawPerson(ctx, { x: 430, y: 1560, s: 3.6, costume: 'greg', pose: { aL: [12, -8], aR: [70, 110], handR: 'thumb' }, expr: HAPPY_FACE, t: T, id: 1, noBlink: true, look: [0.15, 0], noShadow: true });
  ctx.restore();
  // right: arctic blizzard
  ctx.save();
  ctx.beginPath(); right.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
  vgrad(ctx, -10, H + 10, [[0, '#3C5E8E'], [1, '#9DB9D8']]);
  tx(ctx, { s: 1.25, x: 380, y: -170 }, () => arcticBG(ctx, T, { storm: 0 }));
  ctx.fillStyle = 'rgba(40,70,120,0.35)';
  ctx.fillRect(0, 0, W, H);
  glow(ctx, 1480, 560, 620, '#CFE6FF', 0.5);
  blowingSnow(ctx, 3.1, 1.2);
  const r = drawPerson(ctx, { x: 1470, y: 1560, s: 3.6, costume: 'greg', pose: 'hug', expr: COLD_FACE, t: T, id: 1, noBlink: true, tint: FROST, hat: frozenHat, noShadow: true });
  shiverTicks(ctx, r.head[0], r.head[1], 250);
  breath(ctx, r.head[0] + 250, r.head[1] + 110, 1.2);
  ctx.restore();
  // split stripe
  line(ctx, [[splitTop, -20], [splitBot, H + 20]], { color: P.ink, lw: 44, wob: 0 });
  line(ctx, [[splitTop, -20], [splitBot, H + 20]], { color: P.white, lw: 22, wob: 1 });
  vignette(ctx, 0.35);
  headline(ctx, 'FOREVER', 470, 150, 190, '#C6F25B', { r: -0.05 });
  headline(ctx, 'HOURS', 1460, 150, 200, '#FF5A4E', { r: 0.04 });
}

// ================================================================================
// 2. 10:00 — frozen close-up + countdown
// ================================================================================
function thumb2(ctx) {
  vgrad(ctx, -10, H + 10, [[0, '#18304F'], [0.6, '#2E5585'], [1, '#6F95C2']]);
  // distant snowy ridge
  tx(ctx, { s: 1.4, x: -400, y: -380 }, () => arcticBG(ctx, T, { storm: 0 }));
  ctx.fillStyle = 'rgba(20,40,80,0.55)';
  ctx.fillRect(0, 0, W, H);
  glow(ctx, 1260, 520, 820, '#BFDDFF', 0.55);
  blowingSnow(ctx, 5.3, 1.6);
  // huge face
  const r = drawPerson(ctx, { x: 1290, y: 2080, s: 6.2, costume: 'greg', pose: 'hug', expr: COLD_FACE, t: T, id: 1, noBlink: true, tint: FROST, hat: frozenHat, noShadow: true, look: [-0.2, 0] });
  shiverTicks(ctx, r.head[0], r.head[1] + 20, 420);
  breath(ctx, r.head[0] - 560, r.head[1] + 180, 1.8);
  // frostbitten hand in the foreground
  tx(ctx, { x: 450, y: 1170, r: -0.18 }, () => bigHand(ctx, 0, 0, 2.3, '#C9DCEF', '#9FB8D2', { fingerC: '#EEF6FD', frost: true }));
  vignette(ctx, 0.6, '5,12,30');
  // countdown
  tx(ctx, { x: 520, y: 330, r: -0.05 }, () => {
    glow(ctx, 0, 0, 560, '#FF3B30', 0.5);
    countdown(ctx, 0, 0, 600, 2.35, '#FF4136');
  });
  headline(ctx, 'LEFT', 520, 640, 190, P.white, { r: -0.05 });
}

// ================================================================================
// 3. NO WAY OUT — beautiful, deadly ocean
// ================================================================================
function thumb3(ctx) {
  const hz = 560;
  vgrad(ctx, -10, hz, [[0, '#E9866E'], [0.55, '#F7B77F'], [1, '#FFE2A6']]);
  glow(ctx, 1640, hz, 700, '#FFE7A8', 0.9);
  circle(ctx, 1640, hz, 150, { fill: '#FFF1C9', stroke: null, wob: 0 });
  for (const [x, y, s] of [[300, 180, 1.3], [980, 110, 0.9], [1750, 230, 1.2]]) cloud(ctx, x, y, s, '#FFD9C0', '#F4B99C');
  vgrad(ctx, hz, H + 10, [[0, '#6FA4C9'], [0.35, '#3B78A9'], [1, '#1D426E']]);
  // sun glitter on the water
  for (let i = 0; i < 90; i++) {
    const y = hz + 8 + Math.pow(hash(i * 2.3), 1.6) * 520;
    const spread = 40 + (y - hz) * 0.55;
    const x = 1640 + (hash(i * 5.1) - 0.5) * spread * 2;
    const w = 20 + hash(i) * 50;
    line(ctx, [[x - w / 2, y], [x + w / 2, y]], { color: 'rgba(255,236,180,0.85)', lw: 5, wob: 0 });
  }
  for (let k = 0; k < 6; k++) {
    const y = hz + 40 + k * k * 14 + k * 30;
    const pts = [];
    for (let i = 0; i <= 30; i++) pts.push([-50 + i * 68, y + Math.sin(i * 0.9 + k) * (4 + k * 2)]);
    line(ctx, pts, { color: 'rgba(255,255,255,0.25)', lw: 3 + k, smooth: true, wob: 0 });
  }
  // shark fin closing in, with a wake
  const fx = 1440, fy = 840;
  for (let i = 0; i < 3; i++) line(ctx, [[fx + 110 + i * 80, fy - 4 + i * 12], [fx + 300 + i * 120, fy + 10 + i * 26]], { color: 'rgba(255,255,255,0.75)', lw: 10 - i * 2, wob: 1 });
  sharkFin(ctx, fx, fy, 2.6, true);
  // Greg, head and shoulders above water, panicking
  const gx = 620, wl = 800, s = 2.35;
  drawPerson(ctx, { x: gx, y: wl + 150 * s, s, costume: 'greg', pose: { aL: [140, 25], aR: [120, 50] }, expr: { eyes: 'wide', brows: [0.9, 0.9], browTilt: 1.1, mouth: 'open' }, t: T, id: 1, noShadow: true, noBlink: true, look: [0.75, 0.15], sweat: 1.2 });
  waterFront(ctx, T, wl + 10 * s, -200, W + 200, { color: 'rgba(52,108,158,0.93)' });
  // splashes around him
  for (const [x, y, r] of [[gx - 250, wl - 10, 22], [gx - 300, wl - 40, 14], [gx + 250, wl - 20, 20], [gx + 300, wl - 50, 12]]) circle(ctx, x, y, r, { fill: '#E6F3FC', lw: 4 });
  vignette(ctx, 0.45, '20,20,40');
  redCircle(ctx, gx + 10, wl - 250, 300, 330);
  headline(ctx, 'NO WAY', 1360, 170, 210, P.white, { r: 0.03 });
  headline(ctx, 'OUT', 1360, 380, 210, '#FFD23F', { r: 0.03 });
}

// ---- render ----------------------------------------------------------------------
const variants = [
  ['thumb_1_forever-vs-hours', thumb1],
  ['thumb_2_ten-minutes', thumb2],
  ['thumb_3_no-way-out', thumb3],
];
const big = createCanvas(W, H);
const g = big.getContext('2d');
const graded = createCanvas(W, H);
const gg = graded.getContext('2d');
const small = createCanvas(1280, 720);
const sg = small.getContext('2d');
const files = [];
for (const [name, fn] of variants) {
  setFrame(T);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  fillScreen(g, P.paper);
  fn(g);
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
  files.push({ name, jpg: path.join(OUT, `${name}.jpg`), kb: Math.round(jpg.length / 1024) });
  console.log(`${name}: 1920x1080 png + 1280x720 jpg (${Math.round(jpg.length / 1024)} KB)`);
}

// ---- review sheet: how they look in a feed, sidebar and on a phone -----------------------
import { loadImage } from '@napi-rs/canvas';
const TITLE = 'How Long Would You Survive With Nothing?';
const sheet = createCanvas(1920, 1500);
const c = sheet.getContext('2d');
c.fillStyle = '#FFFFFF';
c.fillRect(0, 0, 1920, 1500);
c.fillStyle = '#0F0F0F';
c.font = '600 44px Fredoka';
c.fillText('Home feed (desktop)', 60, 70);
const imgs = [];
for (const f of files) imgs.push(await loadImage(f.jpg));
imgs.forEach((im, i) => {
  const x = 60 + i * 620, y = 110;
  c.save();
  rounded(c, x, y, 580, 326, 18);
  c.clip();
  c.drawImage(im, x, y, 580, 326);
  c.restore();
  c.fillStyle = 'rgba(0,0,0,0.8)';
  rounded(c, x + 500, y + 290, 70, 28, 6);
  c.fill();
  c.fillStyle = '#fff';
  c.font = '600 20px Fredoka';
  c.fillText('9:56', x + 512, y + 311);
  c.fillStyle = '#0F0F0F';
  c.font = '600 28px Fredoka';
  c.fillText(TITLE, x + 70, y + 370, 510);
  c.fillStyle = '#606060';
  c.font = '400 24px Fredoka';
  c.fillText('Thing Theory • 1.2M views • 2 days ago', x + 70, y + 408);
  c.fillStyle = ['#E8877A', '#86A8D0', '#EDC468'][i];
  c.beginPath(); c.arc(x + 28, y + 382, 24, 0, TAU); c.fill();
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
  c.fillText('How Long Would You Survive', x + 420, y + 36);
  c.fillText('With Nothing?', x + 420, y + 70);
  c.fillStyle = '#606060';
  c.font = '400 22px Fredoka';
  c.fillText('Thing Theory', x + 420, y + 106);
  // tiny
  const tx0 = 1060, ty0 = 680 + i * 250;
  c.save(); rounded(c, tx0, ty0, 168, 94, 8); c.clip(); c.drawImage(im, tx0, ty0, 168, 94); c.restore();
  c.fillStyle = '#0F0F0F';
  c.font = '600 22px Fredoka';
  c.fillText(['1. FOREVER vs HOURS', '2. 10:00 LEFT', '3. NO WAY OUT'][i], tx0 + 190, ty0 + 40);
  c.fillStyle = '#606060';
  c.font = '400 20px Fredoka';
  c.fillText(`${files[i].kb} KB jpg, 1280x720`, tx0 + 190, ty0 + 72);
});
fs.writeFileSync(path.join(OUT, 'review_sheet.png'), sheet.toBuffer('image/png'));
console.log('review sheet written');

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
