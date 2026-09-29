// Episode 001 thumbnails, built from the same characters and world as the video.
//   npm run thumbnails -- --ep 001  -> out/001-greg-biomes/thumbnails/
//
// Design rules used for every variant: one focal point, a big readable face with a strong
// emotion, at most three words, saturated colour contrast, and a check at phone size.
import { H, W, hash } from '#lib/engine/core.js';
import { tx, line, circle, ellipse, shape, P, glow, vgrad } from '#lib/engine/draw.js';
import { drawPerson } from '#lib/characters/person.js';
import { forestBG, arcticBG, blowingSnow, cloud, waterFront } from '#lib/world/backgrounds.js';
import { countdown } from '#lib/ui.js';
import { shiverTicks, breath, vignette, headline, redCircle } from '#lib/thumbkit.js';
import { campfire, bigHand, sharkFin } from '#lib/props/index.js';

export const T = 12.3; // fixed "time" for boil/idle poses

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

// name -> output file, label -> caption on the review sheet
export const thumbnails = [
  { name: 'thumb_1_forever-vs-hours', label: '1. FOREVER vs HOURS', draw: thumb1 },
  { name: 'thumb_2_ten-minutes', label: '2. 10:00 LEFT', draw: thumb2 },
  { name: 'thumb_3_no-way-out', label: '3. NO WAY OUT', draw: thumb3 },
];
