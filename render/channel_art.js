// Channel branding: profile picture + banner for Thing Theory, drawn with the video's own rig.
//   node render/channel_art.js -> out/channel/
//     pfp.png (800x800), pfp_coral.png, pfp_mustard.png
//     banner.jpg (2560x1440), banner_guides.png (safe-area overlay), preview.png (channel page mockups)
import fs from 'fs';
import path from 'path';
import { loadImage } from '@napi-rs/canvas';
import { setupHost, createCanvas, ROOT } from './host.js';
import { setFrame, P, shape, circle, ellipse, line, tx, text, rrect, glow, swash, font, star } from '../src/engine/draw.js';
import { TAU, hash, rng, lerp } from '../src/engine/core.js';
import { paperOverlay } from '../src/engine/paper.js';
import { drawPerson, COSTUMES } from '../src/chars/person.js';
import { flask, beaker } from '../src/bg.js';
import { drawWorld } from '../src/worldmap.js';

setupHost();
const OUT = path.join(ROOT, 'out', 'channel');
fs.mkdirSync(OUT, { recursive: true });
const T = 7.7;
setFrame(T);

function paper(ctx, w, h, alpha = 0.6) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(paperOverlay(), 0, 0, w, h);
  ctx.restore();
}
function grade(src, w, h, filter = 'saturate(1.12) contrast(1.04)') {
  const c = createCanvas(w, h);
  const g = c.getContext('2d');
  g.filter = filter;
  g.drawImage(src, 0, 0);
  return c;
}
function blob(ctx, x, y, r, color, seed = 1) {
  const pts = [];
  const rr = rng(seed * 31);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    const k = 0.82 + rr() * 0.3;
    pts.push([x + Math.cos(a) * r * k * 1.25, y + Math.sin(a) * r * k]);
  }
  shape(ctx, pts, { fill: color, stroke: null, smooth: true, wob: 2 });
}

// ---- the mascot's face, used for the profile picture -----------------------------------
const CURIOUS = { eyes: 'open', brows: [0.5, 0.0], browTilt: 0, mouth: 'grin' };
// goggles pushed up onto the hair (as in the art-direction sheet) so the eyebrows can act
const SCI = { ...COSTUMES.scientist, goggles: false };
function gogglesUp(ctx, hy) {
  // short side straps + bridge only, so the spiky hair still reads above and around them
  for (const sd of [-1, 1]) line(ctx, [[sd * 40, hy - 66], [sd * 56, hy - 58], [sd * 64, hy - 46]], { color: '#4E5558', lw: 8, outline: 2.5, smooth: true, wob: 0.5 });
  line(ctx, [[-8, hy - 68], [8, hy - 68]], { color: '#4E5558', lw: 7, outline: 2.5, wob: 0.4 });
  for (const sx of [-23, 23]) {
    tx(ctx, { x: sx, y: hy - 68, r: sx < 0 ? -0.12 : 0.12, s: 0.8 }, () => {
      shape(ctx, [[-21, -17], [21, -17], [25, 0], [19, 15], [-19, 15], [-25, 0]], { fill: '#A3AEB2', lw: 6 });
      shape(ctx, [[-14, -10], [14, -10], [16, 0], [12, 9], [-12, 9], [-16, 0]], { fill: '#DCE8EC', lw: 4 });
      line(ctx, [[-8, -5], [2, -5]], { color: P.white, lw: 4, wob: 0 });
    });
  }
}

function pfp(bg, bgD, name) {
  const S = 800;
  const c = createCanvas(S, S);
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(S * 0.42, S * 0.36, 40, S / 2, S / 2, S * 0.62);
  grd.addColorStop(0, bg);
  grd.addColorStop(1, bgD);
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  // soft sun-burst rays behind the head
  g.save();
  g.translate(400, 430);
  g.globalAlpha = 0.12;
  for (let i = 0; i < 16; i++) {
    g.rotate(TAU / 16);
    g.fillStyle = '#FFFFFF';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(700, -70); g.lineTo(700, 70); g.fill();
  }
  g.restore();
  glow(g, 400, 430, 330, '#FFFFFF', 0.35);
  // mascot: head centred inside the circle crop, lab-coat collar along the bottom
  drawPerson(g, { x: 400, y: 470 + 244 * 3.3, s: 3.3, costume: SCI, hat: gogglesUp, headTilt: 6, pose: { aL: [8, -4], aR: [8, -4] }, expr: CURIOUS, t: T, id: 2, noBlink: true, noShadow: true, look: [0.15, -0.05] });
  paper(g, S, S, 0.35);
  const out = grade(c, S, S);
  fs.writeFileSync(path.join(OUT, `${name}.png`), out.toBuffer('image/png'));
  return out;
}

// ---- banner props ---------------------------------------------------------------------------
function trex(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    const G = '#8FBF7F', GD = '#6E9A62', BELLY = '#E3EDC2';
    // neck + body going off to the right
    shape(ctx, [[-20, 40], [60, -30], [260, -20], [420, 60], [460, 420], [40, 420]], { fill: G, lw: 7, smooth: true });
    shape(ctx, [[20, 120], [120, 110], [140, 420], [30, 420]], { fill: BELLY, stroke: null, smooth: true });
    shape(ctx, [[260, -20], [420, 60], [460, 420], [320, 420]], { fill: GD, stroke: null, smooth: true, alpha: 0.6 });
    for (const [a, b, r] of [[200, 40, 22], [280, 90, 16], [330, 20, 18], [240, 150, 14]]) circle(ctx, a, b, r, { fill: GD, stroke: null });
    // tiny waving arm
    const wv = Math.sin(t * 4) * 0.2;
    tx(ctx, { x: 70, y: 120, r: -0.9 + wv }, () => {
      line(ctx, [[0, 0], [-60, -10], [-80, -50]], { color: G, lw: 34, outline: 3.5 });
      line(ctx, [[-80, -50], [-100, -74]], { color: P.white, lw: 9, outline: 2 });
      line(ctx, [[-80, -50], [-108, -56]], { color: P.white, lw: 9, outline: 2 });
    });
    // head (facing left)
    shape(ctx, [[-300, -80], [-310, -20], [-270, 40], [-120, 70], [20, 60], [90, 0], [80, -110], [0, -180], [-140, -190], [-260, -150]], { fill: G, lw: 7, smooth: true });
    shape(ctx, [[0, -180], [80, -110], [90, 0], [20, 60], [30, -60]], { fill: GD, stroke: null, smooth: true, alpha: 0.55 });
    // big friendly grin with teeth
    const grin = [[-290, -12], [-220, 18], [-120, 30], [-20, 18]];
    line(ctx, grin, { lw: 7, smooth: true });
    for (let i = 0; i < 7; i++) {
      const u = 0.1 + i * 0.12;
      const px = lerp(-285, -30, u), py = -10 + Math.sin(u * Math.PI) * 32;
      shape(ctx, [[px - 11, py - 2], [px + 11, py - 2], [px, py + 22]], { fill: P.white, lw: 3.5 });
    }
    // eye + brow + nostril
    ellipse(ctx, -90, -110, 30, 34, { fill: P.white, lw: 6 });
    circle(ctx, -100, -106, 15, { fill: P.ink, stroke: null });
    circle(ctx, -95, -113, 5, { fill: P.white, stroke: null });
    line(ctx, [[-130, -160], [-50, -150]], { lw: 9 });
    ellipse(ctx, -270, -100, 10, 6, { fill: P.ink, stroke: null });
    // blush
    ellipse(ctx, -60, -40, 26, 14, { fill: 'rgba(232,135,122,0.55)', stroke: null });
  });
}
function microscope(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    rrect(ctx, -110, -20, 220, 40, 14, { fill: '#DCD6CA', lw: 6 });
    line(ctx, [[40, -20], [40, -200], [-10, -270]], { color: '#F2EFE6', lw: 44, outline: 3.5 });
    tx(ctx, { x: -40, y: -250, r: -0.6 }, () => {
      rrect(ctx, -30, -120, 60, 200, 16, { fill: '#F2EFE6', lw: 6 });
      rrect(ctx, -22, -150, 44, 40, 8, { fill: '#46525A', lw: 5 });
      rrect(ctx, -16, 70, 32, 50, 6, { fill: '#46525A', lw: 5 });
    });
    rrect(ctx, -90, -110, 120, 24, 8, { fill: '#46525A', lw: 5 });
    circle(ctx, 60, -150, 22, { fill: '#9AA5A8', lw: 5 });
  });
}
function atom(ctx, x, y, s, color) {
  tx(ctx, { x, y, s }, () => {
    for (let i = 0; i < 3; i++) ellipse(ctx, 0, 0, 60, 22, { fill: null, stroke: color, lw: 5, rot: (i * Math.PI) / 3 });
    circle(ctx, 0, 0, 10, { fill: color, stroke: null });
  });
}
function bulb(ctx, x, y, s, color) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-22, 20], [-34, -14], [-28, -44], [0, -60], [28, -44], [34, -14], [22, 20]], { fill: null, stroke: color, lw: 5, smooth: true });
    line(ctx, [[-16, 30], [16, 30]], { color, lw: 5 });
    line(ctx, [[-12, 42], [12, 42]], { color, lw: 5 });
  });
}
function planet(ctx, x, y, s, color) {
  tx(ctx, { x, y, s }, () => {
    circle(ctx, 0, 0, 34, { fill: null, stroke: color, lw: 5 });
    ellipse(ctx, 0, 0, 64, 16, { fill: null, stroke: color, lw: 5, rot: -0.35 });
  });
}
function qmark(ctx, x, y, s, color, r = 0) {
  text(ctx, '?', x, y, { size: 90 * s, font: 'bold', color, r });
}

// ---- banner ---------------------------------------------------------------------------------
const BW = 2560, BH = 1440;
const SAFE = { x: (BW - 1546) / 2, y: (BH - 423) / 2, w: 1546, h: 423 }; // visible on every device
const DESK = { x: 0, y: (BH - 423) / 2, w: BW, h: 423 }; // widest desktop strip

function banner() {
  const c = createCanvas(BW, BH);
  const g = c.getContext('2d');
  const bgr = g.createLinearGradient(0, 0, 0, BH);
  bgr.addColorStop(0, '#F3E7CF');
  bgr.addColorStop(1, '#EADAB9');
  g.fillStyle = bgr;
  g.fillRect(0, 0, BW, BH);
  // faint notebook grid
  g.save();
  g.strokeStyle = 'rgba(160,140,110,0.16)';
  g.lineWidth = 2;
  g.beginPath();
  for (let x = 0; x <= BW; x += 64) { g.moveTo(x, 0); g.lineTo(x, BH); }
  for (let y = 0; y <= BH; y += 64) { g.moveTo(0, y); g.lineTo(BW, y); }
  g.stroke();
  g.restore();
  // TV-only area: the world map on the wall above, a desk edge below
  tx(g, { a: 0.55 }, () => drawWorld(g, { x: 580, y: 70, w: 1400, h: 380 }, { land: '#E0CFA8', stroke: 'rgba(47,59,62,0.45)', lw: 3, wob: 0.3 }));
  shape(g, [[-20, 1000], [BW + 20, 1000], [BW + 20, BH + 20], [-20, BH + 20]], { fill: '#C69F74', lw: 6, wob: 0.5 });
  for (let i = 0; i < 6; i++) line(g, [[-20, 1060 + i * 64], [BW + 20, 1060 + i * 64]], { color: '#AD875F', lw: 4, wob: 0.4 });

  // watercolour washes behind the characters (palette swatches from the art-direction sheet)
  blob(g, 600, 740, 180, 'rgba(156,187,144,0.55)', 2);
  blob(g, 1950, 740, 160, 'rgba(134,168,208,0.5)', 5);
  blob(g, 2440, 700, 170, 'rgba(237,196,104,0.45)', 7);
  blob(g, 150, 760, 150, 'rgba(147,112,148,0.35)', 9);

  // doodles scattered around (kept out of the logo area)
  const dcol = 'rgba(86,102,106,0.45)';
  atom(g, 330, 610, 0.8, dcol);
  bulb(g, 2120, 585, 0.8, dcol);
  qmark(g, 2000, 548, 0.7, 'rgba(95,131,179,0.85)', 0.2);
  star(g, 790, 585, 18, 'rgba(237,196,104,0.95)', 3);
  star(g, 1770, 598, 15, 'rgba(237,196,104,0.95)', 3);
  star(g, 760, 900, 11, 'rgba(232,135,122,0.9)', 3);
  star(g, 1800, 895, 12, 'rgba(232,135,122,0.9)', 3);
  for (const [x, y, s] of [[120, 200, 1.2], [2440, 230, 1.0], [300, 1250, 1.1], [2280, 1260, 1.2], [1280, 1260, 1.0]]) atom(g, x, y, s, 'rgba(86,102,106,0.25)');
  for (const [x, y] of [[420, 330], [2150, 360], [800, 1300], [1800, 1300]]) bulb(g, x, y, 1.2, 'rgba(86,102,106,0.25)');

  // left: desk props (wide desktop / TV) and the scientist raising a flask
  microscope(g, 150, 1000, 1.05);
  beaker(g, 290, 1000, 0.9, P.coral);
  drawPerson(g, {
    x: 625, y: 1000, s: 1.3, costume: SCI, hat: gogglesUp, pose: { aL: [12, -8], aR: [125, 45] }, expr: CURIOUS, t: T, id: 2, noBlink: true, look: [0.55, -0.1],
    holdR: (ctx, hx, hy) => flask(ctx, hx + 6, hy + 30, 0.7, P.sage, T, 1),
  });
  // right: Greg waving, and a T-rex who wandered in (topics go way beyond survival)
  trex(g, 2440, 800, 0.78, T);
  drawPerson(g, { x: 1930, y: 1000, s: 1.26, costume: 'greg', pose: 'wave', expr: 'happy', t: T, id: 1, look: [-0.5, 0] });

  // logo lock-up in the safe area
  const cx = BW / 2;
  tx(g, { x: cx, y: 668, r: -0.025 }, () => {
    g.font = font('marker', 134);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.fillStyle = 'rgba(47,59,62,0.25)';
    g.fillText('THING THEORY', 8, 12);
    g.strokeStyle = P.white;
    g.lineWidth = 18;
    g.strokeText('THING THEORY', 0, 0);
    g.fillStyle = P.ink;
    g.fillText('THING THEORY', 0, 0);
  });
  swash(g, cx - 420, 806, 840, 78, 'rgba(232,135,122,0.92)', 1, 4);
  text(g, 'WEIRD QUESTIONS. ANIMATED ANSWERS.', cx, 809, { size: 46, font: 'bold', color: P.white, stroke: P.ink, sw: 8, r: -0.01 });

  paper(g, BW, BH, 0.55);
  return grade(c, BW, BH);
}

// ---- render outputs ---------------------------------------------------------------------------
const pfpMain = pfp('#8DB3DD', '#4E77A8', 'pfp');
pfp('#F2A294', '#C9614F', 'pfp_coral');
pfp('#F4D27E', '#CF9A36', 'pfp_mustard');
const ban = banner();
fs.writeFileSync(path.join(OUT, 'banner.jpg'), ban.toBuffer('image/jpeg', 92));
fs.writeFileSync(path.join(OUT, 'banner.png'), ban.toBuffer('image/png'));

// safe-area guide overlay
{
  const c = createCanvas(BW, BH);
  const g = c.getContext('2d');
  g.drawImage(ban, 0, 0);
  g.fillStyle = 'rgba(20,25,30,0.45)';
  g.fillRect(0, 0, BW, DESK.y);
  g.fillRect(0, DESK.y + DESK.h, BW, BH - DESK.y - DESK.h);
  g.setLineDash([24, 16]);
  g.lineWidth = 6;
  g.strokeStyle = '#FFD23F';
  g.strokeRect(DESK.x + 3, DESK.y, DESK.w - 6, DESK.h);
  g.strokeStyle = '#FF4136';
  g.strokeRect(SAFE.x, SAFE.y, SAFE.w, SAFE.h);
  g.setLineDash([]);
  g.font = '600 44px Fredoka';
  g.fillStyle = '#FFFFFF';
  g.fillText('TV: full image', 40, 70);
  g.fillStyle = '#FFD23F';
  g.fillText('Desktop (max width)', 40, DESK.y - 20);
  g.fillStyle = '#FF7A70';
  g.fillText('Safe area: every device (1546 x 423)', SAFE.x, SAFE.y + SAFE.h + 60);
  fs.writeFileSync(path.join(OUT, 'banner_guides.png'), c.toBuffer('image/png'));
}

// channel page mockups
{
  const PW = 1920, PH = 1560;
  const c = createCanvas(PW, PH);
  const g = c.getContext('2d');
  g.fillStyle = '#0F0F0F';
  g.fillRect(0, 0, PW, PH);
  const label = (s, x, y) => { g.fillStyle = '#AAAAAA'; g.font = '600 34px Fredoka'; g.fillText(s, x, y); };
  const round = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const avatar = (x, y, d, img) => { g.save(); g.beginPath(); g.arc(x + d / 2, y + d / 2, d / 2, 0, TAU); g.clip(); g.drawImage(img, x, y, d, d); g.restore(); };
  // desktop: banner strip + avatar + name
  label('Desktop channel page (dark mode)', 60, 60);
  const dw = 1800, dh = dw * (423 / 2560);
  g.save(); round(60, 90, dw, dh, 20); g.clip();
  g.drawImage(ban, 0, DESK.y, BW, 423, 60, 90, dw, dh);
  g.restore();
  avatar(60, 90 + dh + 30, 160, pfpMain);
  g.fillStyle = '#F1F1F1'; g.font = '600 56px Fredoka'; g.fillText('Thing Theory', 250, 90 + dh + 95);
  g.fillStyle = '#AAAAAA'; g.font = '400 30px Fredoka'; g.fillText('@thingtheory  •  Weird questions. Animated answers.', 250, 90 + dh + 145);
  g.fillStyle = '#F1F1F1'; round(250, 90 + dh + 170, 190, 56, 28); g.fill();
  g.fillStyle = '#0F0F0F'; g.font = '600 28px Fredoka'; g.fillText('Subscribe', 282, 90 + dh + 208);
  // mobile: only the safe area survives
  const my = 740;
  label('Phone channel page (safe area only)', 60, my);
  const mw = 700, mh = mw * (423 / 1546);
  g.save(); round(60, my + 30, mw, mh, 16); g.clip();
  g.drawImage(ban, SAFE.x, SAFE.y, SAFE.w, SAFE.h, 60, my + 30, mw, mh);
  g.restore();
  avatar(60, my + 30 + mh + 24, 110, pfpMain);
  g.fillStyle = '#F1F1F1'; g.font = '600 40px Fredoka'; g.fillText('Thing Theory', 190, my + 30 + mh + 90);
  // avatar size checks
  label('Profile picture at real sizes', 900, my);
  const sizes = [176, 98, 48, 32, 24];
  let ax = 900;
  for (const d of sizes) { avatar(ax, my + 40 + (176 - d) / 2, d, pfpMain); ax += d + 40; }
  label('Colour options', 900, my + 300);
  const alts = [pfpMain, await loadImage(path.join(OUT, 'pfp_coral.png')), await loadImage(path.join(OUT, 'pfp_mustard.png'))];
  alts.forEach((im, i) => avatar(900 + i * 190, my + 330, 150, im));
  // next to a video in the feed
  label('Next to a video title', 60, 1320);
  avatar(60, 1350, 72, pfpMain);
  g.fillStyle = '#F1F1F1'; g.font = '600 32px Fredoka'; g.fillText('How Long Would You Survive With Nothing?', 150, 1385);
  g.fillStyle = '#AAAAAA'; g.font = '400 26px Fredoka'; g.fillText('Thing Theory  •  placeholder stats', 150, 1425);
  fs.writeFileSync(path.join(OUT, 'preview.png'), c.toBuffer('image/png'));
}
for (const f of fs.readdirSync(OUT)) console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024), 'KB');
