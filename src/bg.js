// Painterly, faceted backgrounds for each biome. Far layers have no ink outline (depth),
// near layers are outlined like the characters.
import { P, shape, circle, ellipse, line, tx, glow, vgrad, ellipsePts, fillScreen, text, rrect } from './engine/draw.js';
import { W, H, rng, lerp, clamp, TAU, mix, hash } from './engine/core.js';
import { drawWorld } from './worldmap.js';

// ---- shared pieces ----------------------------------------------------------
export function pine(ctx, x, baseY, h, c1, c2, opt = {}) {
  const { outline = false, trunk = '#7A5B45', tiers = 3, wob = 0.5, snow = null } = opt;
  const w = h * 0.42;
  const lw = outline ? 4 : 0;
  shape(ctx, [[x - w * 0.07, baseY], [x + w * 0.07, baseY], [x + w * 0.07, baseY - h * 0.2], [x - w * 0.07, baseY - h * 0.2]], { fill: trunk, stroke: outline ? P.ink : null, lw, wob });
  for (let i = 0; i < tiers; i++) {
    const tb = baseY - h * 0.12 - i * h * 0.26;
    const tw = w * (1 - i * 0.22);
    const top = tb - h * 0.45;
    shape(ctx, [[x - tw / 2, tb], [x, top], [x + tw / 2, tb]], { fill: c1, stroke: outline ? P.ink : null, lw, wob });
    shape(ctx, [[x, top], [x + tw / 2, tb], [x + tw * 0.05, tb]], { fill: c2, stroke: null, wob });
    if (snow) shape(ctx, [[x - tw * 0.18, top + h * 0.12], [x, top], [x + tw * 0.2, top + h * 0.12], [x + tw * 0.05, top + h * 0.09], [x - tw * 0.05, top + h * 0.13]], { fill: snow, stroke: null, wob });
  }
}

export function blobTree(ctx, x, baseY, h, c1, c2, opt = {}) {
  const { outline = true, trunk = '#8A6A50', trunkD = '#6E523E', seed = 1, wob = 0.8 } = opt;
  const r = rng(seed * 997);
  const lw = outline ? 4.5 : 0;
  const tw = h * 0.07;
  shape(ctx, [[x - tw, baseY], [x + tw, baseY], [x + tw * 0.7, baseY - h * 0.6], [x - tw * 0.7, baseY - h * 0.6]], { fill: trunk, stroke: outline ? P.ink : null, lw, wob });
  shape(ctx, [[x + tw * 0.1, baseY], [x + tw, baseY], [x + tw * 0.7, baseY - h * 0.6], [x + tw * 0.1, baseY - h * 0.6]], { fill: trunkD, stroke: null, wob });
  const blobs = 4;
  for (let i = 0; i < blobs; i++) {
    const bx = x + (r() - 0.5) * h * 0.45, by = baseY - h * 0.68 - r() * h * 0.22;
    const br = h * (0.2 + r() * 0.1);
    const pts = [];
    const n = 8;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + r() * 0.3;
      const rr = br * (0.8 + r() * 0.3);
      pts.push([bx + Math.cos(a) * rr, by + Math.sin(a) * rr * 0.85]);
    }
    shape(ctx, pts, { fill: i % 2 ? c1 : mix(c1, c2, 0.3), stroke: outline ? P.ink : null, lw, wob });
    shape(ctx, [[bx, by - br * 0.2], [bx + br * 0.9, by - br * 0.1], [bx + br * 0.5, by + br * 0.7], [bx + br * 0.1, by + br * 0.5]], { fill: c2, stroke: null, wob, alpha: 0.7 });
  }
}

function mountainRange(ctx, peaks, baseY, c1, c2, cap = null) {
  for (const [x, h, w] of peaks) {
    const top = baseY - h;
    shape(ctx, [[x - w, baseY], [x - w * 0.1, top + h * 0.05], [x, top], [x + w * 0.15, baseY]], { fill: c1, stroke: null, wob: 0.4 });
    shape(ctx, [[x, top], [x + w, baseY], [x + w * 0.15, baseY]], { fill: c2, stroke: null, wob: 0.4 });
    if (cap) {
      shape(ctx, [[x - w * 0.28, top + h * 0.3], [x, top], [x + w * 0.3, top + h * 0.3], [x + w * 0.12, top + h * 0.24], [x - w * 0.02, top + h * 0.34], [x - w * 0.14, top + h * 0.25]], { fill: cap, stroke: null, wob: 0.4 });
    }
  }
}

function grassTuft(ctx, x, y, s, c) {
  line(ctx, [[x - 8 * s, y], [x - 12 * s, y - 20 * s]], { color: c, lw: 4 * s, wob: 0.5 });
  line(ctx, [[x, y], [x + 1 * s, y - 28 * s]], { color: c, lw: 4 * s, wob: 0.5 });
  line(ctx, [[x + 8 * s, y], [x + 13 * s, y - 18 * s]], { color: c, lw: 4 * s, wob: 0.5 });
}

export function fern(ctx, x, y, s, c, cD, t = 0, seed = 0) {
  const sway = Math.sin(t * 1.3 + seed) * 0.04;
  for (let k = -2; k <= 2; k++) {
    const a = -Math.PI / 2 + k * 0.45 + sway;
    const L = (90 - Math.abs(k) * 12) * s;
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
    const nx = -Math.sin(a), ny = Math.cos(a);
    const pts = [[x, y]];
    const side = [];
    for (let i = 1; i <= 5; i++) {
      const f = i / 5;
      const px = x + (ex - x) * f, py = y + (ey - y) * f;
      const wv = (1 - f) * 16 * s + 4 * s;
      pts.push([px + nx * wv, py + ny * wv]);
      side.unshift([px - nx * wv, py - ny * wv]);
    }
    pts.push([ex, ey], ...side);
    shape(ctx, pts, { fill: k % 2 ? c : cD, stroke: null, smooth: true, wob: 0.5 });
  }
}

export function rock(ctx, x, y, s, c = '#B7AFA3', cD = '#958C80', outline = true) {
  const pts = [[x - 40 * s, y], [x - 34 * s, y - 24 * s], [x - 10 * s, y - 38 * s], [x + 20 * s, y - 32 * s], [x + 42 * s, y - 10 * s], [x + 44 * s, y]];
  shape(ctx, pts, { fill: c, stroke: outline ? P.ink : null, lw: 4 });
  shape(ctx, [[x - 10 * s, y - 38 * s], [x + 20 * s, y - 32 * s], [x + 42 * s, y - 10 * s], [x + 44 * s, y], [x + 4 * s, y]], { fill: cD, stroke: null });
}

// camera-aware layer offset: world content drawn inside withCam; layers with parallax f<1 get shifted
const par = (camX, f) => (camX - W / 2) * (1 - f);

// ---- FOREST -----------------------------------------------------------------
const forestR = rng(11);
const FOREST = {
  far: Array.from({ length: 34 }, (_, i) => [-800 + i * 115 + forestR() * 60, 130 + forestR() * 90]),
  mid: Array.from({ length: 20 }, (_, i) => [-900 + i * 210 + forestR() * 100, 260 + forestR() * 140]),
  tufts: Array.from({ length: 40 }, () => [-900 + forestR() * 3700, 830 + forestR() * 220]),
};
export function forestBG(ctx, t, o = {}) {
  const camX = o.camX ?? W / 2;
  vgrad(ctx, -600, 760, [[0, '#B9D5E4'], [0.65, '#E4ECDC'], [1, '#EFE9D3']], -1400, W + 1400);
  tx(ctx, { x: par(camX, 0.1) }, () => glow(ctx, 1450, 170, 420, '#FFF4CC', 0.75));
  tx(ctx, { x: par(camX, 0.2) }, () => {
    mountainRange(ctx, [[-300, 330, 330], [150, 400, 380], [620, 300, 300], [1050, 430, 400], [1500, 340, 360], [1950, 390, 380], [2400, 320, 330]], 700, '#B7C9D2', '#9FB4C3');
  });
  tx(ctx, { x: par(camX, 0.45) }, () => {
    for (const [x, h] of FOREST.far) pine(ctx, x, 700, h + 60, '#9DB9A0', '#89A78E', { trunk: '#8C9C8A' });
    shape(ctx, [[-1400, 690], [W + 1400, 690], [W + 1400, 760], [-1400, 760]], { fill: '#A6BF9A', stroke: null, wob: 0 });
  });
  tx(ctx, { x: par(camX, 0.7) }, () => {
    shape(ctx, [[-1400, 740], [W + 1400, 740], [W + 1400, 810], [-1400, 810]], { fill: '#98B98A', stroke: null, wob: 0 });
    for (const [x, h] of FOREST.mid) pine(ctx, x, 770, h + 80, '#86AA7E', '#6E9469', { trunk: '#6E5A48' });
  });
  // ground
  const g = [[-1400, 790]];
  for (let i = 0; i <= 40; i++) {
    const x = -1400 + i * ((W + 2800) / 40);
    g.push([x, 790 + Math.sin(i * 0.9) * 10 + Math.sin(i * 2.3) * 5]);
  }
  g.push([W + 1400, H + 300], [-1400, H + 300]);
  shape(ctx, g, { fill: '#A7C58F', stroke: null, wob: 0 });
  vgrad(ctx, 880, H + 300, [[0, 'rgba(111,152,105,0)'], [1, 'rgba(111,152,105,0.55)']], -1400, W + 1400);
  for (const [x, y] of FOREST.tufts) grassTuft(ctx, x, y, 1, '#7EA36F');
  if (!o.noTrees) {
    blobTree(ctx, 20, 870, 640, '#8EB17F', '#6F9869', { seed: 3 });
    blobTree(ctx, 1900, 890, 700, '#96B886', '#6F9869', { seed: 5 });
    fern(ctx, 120, 900, 1.2, '#7FA56F', '#6A9160', t, 1);
    fern(ctx, 1780, 930, 1.4, '#7FA56F', '#6A9160', t, 2);
    rock(ctx, 1600, 880, 1.1);
  }
  // drifting leaves
  for (let i = 0; i < 7; i++) {
    const ph = (t * 0.05 + i * 0.143) % 1;
    const lx = -200 + ((i * 373) % W) + ph * 700 + par(camX, 0.9);
    const ly = 100 + ph * 900 + Math.sin(t * 2 + i) * 30;
    ellipse(ctx, lx, ly, 10, 5, { fill: i % 2 ? P.mustard : '#A9C48E', stroke: null, rot: t * 2 + i, wob: 0 });
  }
}

// ---- JUNGLE -----------------------------------------------------------------
const jr = rng(23);
const JUNGLE = {
  trunks: Array.from({ length: 14 }, (_, i) => [-900 + i * 290 + jr() * 120, 26 + jr() * 30]),
  bushes: Array.from({ length: 22 }, (_, i) => [-1000 + i * 190 + jr() * 80, 120 + jr() * 90]),
  vines: Array.from({ length: 12 }, (_, i) => [-800 + i * 330 + jr() * 150, 250 + jr() * 350]),
};
export function bigLeaf(ctx, x, y, len, ang, c, cD, t = 0, seed = 0, opt = {}) {
  const sway = Math.sin(t * 1.1 + seed) * 0.05;
  const a = ang + sway;
  const wd = len * (opt.width || 0.32);
  tx(ctx, { x, y, r: a }, () => {
    const pts = [[0, 0]];
    const lower = [];
    for (let i = 1; i <= 8; i++) {
      const f = i / 8;
      const w = Math.sin(f * Math.PI) * wd * (1 - f * 0.15);
      pts.push([f * len, -w]);
      lower.unshift([f * len, w]);
    }
    shape(ctx, [...pts, ...lower], { fill: c, lw: opt.outline === false ? 0 : 4.5, stroke: opt.outline === false ? null : P.ink, smooth: true, wob: 0.8 });
    shape(ctx, [[0, 0], ...lower], { fill: cD, stroke: null, smooth: true, wob: 0.8 });
    line(ctx, [[0, 0], [len * 0.95, 0]], { color: cD, lw: 4, wob: 0.5 });
    if (opt.veins !== false) for (let i = 1; i < 7; i++) {
      const f = i / 7.5;
      line(ctx, [[f * len, 0], [f * len + wd * 0.35, -Math.sin(f * Math.PI) * wd * 0.8]], { color: cD, lw: 3, wob: 0.5 });
    }
  });
}
export function jungleBG(ctx, t, o = {}) {
  const camX = o.camX ?? W / 2;
  vgrad(ctx, -600, H + 300, [[0, '#DCE6B4'], [0.45, '#A9C991'], [1, '#5F8C5F']], -1400, W + 1400);
  // light shafts
  tx(ctx, { x: par(camX, 0.2), a: 0.35 + Math.sin(t * 0.7) * 0.05 }, () => {
    for (let i = 0; i < 5; i++) {
      const x = 200 + i * 380;
      shape(ctx, [[x, -200], [x + 120, -200], [x + 420, H + 200], [x + 200, H + 200]], { fill: 'rgba(255,248,210,0.35)', stroke: null, wob: 0 });
    }
  });
  tx(ctx, { x: par(camX, 0.3) }, () => {
    for (const [x, w] of JUNGLE.trunks) {
      shape(ctx, [[x - w, -200], [x + w, -200], [x + w * 1.3, 800], [x - w * 1.3, 800]], { fill: '#95B488', stroke: null, wob: 0.3 });
      shape(ctx, [[x + w * 0.2, -200], [x + w, -200], [x + w * 1.3, 800], [x + w * 0.3, 800]], { fill: '#86A77C', stroke: null, wob: 0.3 });
    }
    for (const [x, r] of JUNGLE.bushes) {
      circle(ctx, x, 700 - r * 0.3, r, { fill: '#89AE7D', stroke: null, wob: 0.3 });
    }
  });
  tx(ctx, { x: par(camX, 0.6) }, () => {
    for (const [x, r] of JUNGLE.bushes) circle(ctx, x + 90, 790 - r * 0.1, r * 1.1, { fill: '#6F9B66', stroke: null, wob: 0.4 });
    for (let i = 0; i < JUNGLE.vines.length; i++) {
      const [x, len] = JUNGLE.vines[i];
      const sw = Math.sin(t * 0.9 + i) * 12;
      const pts = [];
      for (let k = 0; k <= 8; k++) pts.push([x + Math.sin(k * 0.8 + i) * 16 + (sw * k) / 8, -60 + (len * k) / 8]);
      line(ctx, pts, { color: '#5C8452', lw: 6, smooth: true, wob: 0.4 });
      for (let k = 2; k <= 8; k += 2) ellipse(ctx, pts[k][0] + 12, pts[k][1], 14, 7, { fill: '#6FA062', stroke: null, rot: 0.6, wob: 0.3 });
    }
  });
  // ground
  shape(ctx, [[-1400, 800], [W + 1400, 800], [W + 1400, H + 300], [-1400, H + 300]], { fill: '#6C955E', stroke: null, wob: 0 });
  vgrad(ctx, 800, H + 300, [[0, 'rgba(60,90,60,0)'], [1, 'rgba(50,80,55,0.5)']], -1400, W + 1400);
  for (let i = 0; i < 12; i++) fern(ctx, -600 + i * 280 + (i % 3) * 40, 830 + (i % 2) * 40, 1.1, '#5E8B55', '#4D7748', t, i);
  if (!o.noFrame) {
    // framing foreground leaves
    bigLeaf(ctx, -80, 1100, 520, -0.9, '#4F8250', '#3E6B42', t, 1);
    bigLeaf(ctx, -60, 60, 460, 0.35, '#5A8C57', '#467348', t, 2);
    bigLeaf(ctx, W + 80, 1120, 540, -2.3, '#4F8250', '#3E6B42', t, 3);
    bigLeaf(ctx, W + 60, 40, 440, 2.75, '#5A8C57', '#467348', t, 4);
  }
  if (o.rain) drawRain(ctx, t, o.rain);
}

export function drawRain(ctx, t, amt = 1) {
  ctx.save();
  ctx.strokeStyle = 'rgba(230,240,250,0.55)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const n = Math.floor(90 * amt);
  for (let i = 0; i < n; i++) {
    const x0 = hash(i * 3.3) * (W + 400) - 200;
    const sp = 1300 + hash(i * 7.1) * 500;
    const y = ((hash(i * 1.7) * H + t * sp) % (H + 200)) - 100;
    const x = x0 - y * 0.12;
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6, y + 46);
  }
  ctx.stroke();
  ctx.restore();
}

// ---- DESERT -----------------------------------------------------------------
function dune(ctx, cx, cy, wl, wr, baseY, lit, shade) {
  const pts = [[cx - wl, baseY], [cx - wl * 0.55, baseY - (baseY - cy) * 0.5], [cx - wl * 0.15, cy + (baseY - cy) * 0.05], [cx, cy], [cx + wr * 0.35, cy + (baseY - cy) * 0.35], [cx + wr * 0.75, baseY - (baseY - cy) * 0.12], [cx + wr, baseY]];
  shape(ctx, pts, { fill: lit, stroke: null, smooth: true, wob: 0.3 });
  shape(ctx, [[cx, cy], [cx + wr * 0.35, cy + (baseY - cy) * 0.35], [cx + wr * 0.75, baseY - (baseY - cy) * 0.12], [cx + wr, baseY], [cx + wr * 0.1, baseY], [cx + wr * 0.05, cy + (baseY - cy) * 0.5]], { fill: shade, stroke: null, smooth: true, wob: 0.3 });
}
export function desertBG(ctx, t, o = {}) {
  const camX = o.camX ?? W / 2;
  const n = o.night || 0;
  const sky1 = mix('#F4D9A4', '#27304F', n), sky2 = mix('#FAEBCB', '#4C4F7A', n);
  vgrad(ctx, -600, 700, [[0, sky1], [1, sky2]], -1400, W + 1400);
  ctx.fillStyle = sky2;
  ctx.fillRect(-1400, 699, W + 2800, 40);
  if (n > 0.02) {
    tx(ctx, { a: n }, () => {
      for (let i = 0; i < 90; i++) {
        const x = hash(i * 2.1) * (W + 800) - 400, y = hash(i * 5.3) * 600 - 100;
        const tw = 0.5 + 0.5 * Math.sin(t * 3 + i);
        circle(ctx, x, y, 2 + hash(i) * 2.5, { fill: `rgba(255,250,230,${0.4 + tw * 0.6})`, stroke: null, wob: 0 });
      }
      tx(ctx, { x: par(camX, 0.1) }, () => {
        glow(ctx, 1450, 200, 200, '#E8ECFF', 0.35);
        circle(ctx, 1450, 200, 60, { fill: '#F4F1DE', stroke: null, wob: 0 });
        circle(ctx, 1475, 185, 52, { fill: sky1, stroke: null, wob: 0 });
      });
    });
  }
  if (n < 0.98) {
    tx(ctx, { x: par(camX, 0.1), a: 1 - n, y: n * 500 }, () => {
      glow(ctx, 1450, 230, 520, '#FFF1C2', 0.9);
      circle(ctx, 1450, 230, 110, { fill: '#FFF6DA', stroke: null, wob: 0 });
    });
  }
  const dl = (c) => mix(c, '#5B5E8C', n * 0.75);
  tx(ctx, { x: par(camX, 0.25) }, () => {
    dune(ctx, -300, 560, 600, 700, 720, dl('#F0D3A0'), dl('#E0B97E'));
    dune(ctx, 700, 520, 700, 800, 720, dl('#F2D6A4'), dl('#E1BB80'));
    dune(ctx, 1800, 570, 600, 700, 720, dl('#F0D3A0'), dl('#E0B97E'));
    dune(ctx, 2700, 540, 600, 700, 720, dl('#F2D6A4'), dl('#E1BB80'));
  });
  shape(ctx, [[-1400, 715], [W + 1400, 715], [W + 1400, 830], [-1400, 830]], { fill: dl('#EBC98E'), stroke: null, wob: 0 });
  tx(ctx, { x: par(camX, 0.55) }, () => {
    dune(ctx, 100, 640, 700, 900, 820, dl('#EFCB86'), dl('#DAA95F'));
    dune(ctx, 1500, 610, 800, 900, 820, dl('#F1CF8C'), dl('#DCAC63'));
    dune(ctx, -1100, 650, 700, 800, 820, dl('#F1CF8C'), dl('#DCAC63'));
    dune(ctx, 2700, 650, 700, 800, 820, dl('#EFCB86'), dl('#DAA95F'));
  });
  shape(ctx, [[-1400, 800], [0, 780], [900, 800], [1800, 785], [W + 1400, 800], [W + 1400, H + 300], [-1400, H + 300]], { fill: dl('#EDC57C'), stroke: null, smooth: true, wob: 0 });
  // ripples
  for (let i = 0; i < 9; i++) {
    const y = 870 + i * 26;
    line(ctx, [[-600 + (i % 3) * 200, y], [200, y - 6], [900, y + 4], [1600, y - 5], [2500, y]], { color: dl('#DDB06A'), lw: 3, smooth: true, wob: 0.4, alpha: 0.7 });
  }
  if (!o.noRocks) {
    rock(ctx, 260, 900, 0.9, dl('#C9A27A'), dl('#A9825D'));
    rock(ctx, 1700, 940, 0.7, dl('#C9A27A'), dl('#A9825D'));
  }
  if (!n && !o.noShimmer) {
    // heat shimmer
    for (let k = 0; k < 4; k++) {
      const y = 640 + k * 40;
      const pts = [];
      for (let i = 0; i <= 40; i++) pts.push([-400 + i * 70, y + Math.sin(i * 0.9 + t * 4 + k) * 6]);
      line(ctx, pts, { color: 'rgba(255,250,235,0.45)', lw: 3, smooth: true, wob: 0 });
    }
  }
}

// ---- OCEAN ------------------------------------------------------------------
export function cloud(ctx, x, y, s, c = '#FFFFFF', cD = '#E3ECF0') {
  const pts = [[-120, 0], [-110, -30], [-70, -50], [-40, -80], [10, -90], [50, -70], [80, -50], [120, -40], [140, 0]].map(([a, b]) => [x + a * s, y + b * s]);
  shape(ctx, pts, { fill: c, stroke: null, smooth: true, wob: 0.4 });
  shape(ctx, [[-120, 0], [140, 0], [100, -16], [-80, -14]].map(([a, b]) => [x + a * s, y + b * s]), { fill: cD, stroke: null, smooth: true, wob: 0.4 });
}
export function oceanBG(ctx, t, o = {}) {
  const hz = o.horizon ?? 470;
  const camX = o.camX ?? W / 2;
  const dark = o.dark || 0;
  vgrad(ctx, -800, hz, [[0, mix('#BFDCEB', '#4A5A78', dark)], [1, mix('#F1EFDF', '#8D8FA8', dark)]], -2000, W + 2000);
  tx(ctx, { x: par(camX, 0.1) + ((t * 8) % 400) }, () => {
    cloud(ctx, 300, 200, 1.1);
    cloud(ctx, 1200, 130, 0.8);
    cloud(ctx, 1800, 260, 1.3);
    cloud(ctx, -500, 150, 0.9);
  });
  vgrad(ctx, hz, H + 600, [[0, mix('#8DBBDC', '#46607F', dark)], [0.4, mix('#5C93C1', '#35506F', dark)], [1, mix('#3A6A9A', '#243A55', dark)]], -2000, W + 2000);
  // wave bands
  for (let k = 0; k < 9; k++) {
    const y = hz + 20 + k * k * 9 + k * 14;
    const amp = 3 + k * 1.6;
    const pts = [];
    const sp = t * (0.6 + k * 0.1);
    for (let i = 0; i <= 50; i++) {
      const x = -1200 + i * ((W + 2400) / 50);
      pts.push([x, y + Math.sin(i * 0.9 + sp + k) * amp]);
    }
    line(ctx, pts, { color: `rgba(255,255,255,${0.12 + k * 0.03})`, lw: 2 + k * 0.5, smooth: true, wob: 0.3 });
  }
  // sparkles
  for (let i = 0; i < 26; i++) {
    const x = hash(i * 4.7) * (W + 800) - 400, y = hz + 10 + hash(i * 9.1) * (H - hz);
    const tw = Math.max(0, Math.sin(t * 2.5 + i * 1.7));
    const s = tw * 8;
    if (s > 0.5) shape(ctx, [[x, y - s], [x + s * 0.4, y], [x, y + s], [x - s * 0.4, y]], { fill: 'rgba(255,255,255,0.8)', stroke: null, wob: 0 });
  }
}
// front water layer drawn over a floating character; y = water line
export function waterFront(ctx, t, y, x0 = -400, x1 = W + 400, opt = {}) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const x = x0 + (i * (x1 - x0)) / 40;
    pts.push([x, y + Math.sin(i * 0.7 + t * 2.2) * 7 + Math.sin(i * 1.9 - t * 1.4) * 4]);
  }
  shape(ctx, [...pts, [x1, y + 900], [x0, y + 900]], { fill: opt.color || 'rgba(78,134,181,0.82)', stroke: null, smooth: false, wob: 0 });
  line(ctx, pts, { color: 'rgba(255,255,255,0.7)', lw: 5, smooth: true, wob: 0.5 });
}

// ---- ARCTIC -----------------------------------------------------------------
const ar = rng(41);
const ARCTIC = {
  spruce: Array.from({ length: 16 }, (_, i) => [-900 + i * 260 + ar() * 120, 90 + ar() * 90]),
};
export function arcticBG(ctx, t, o = {}) {
  const camX = o.camX ?? W / 2;
  const storm = o.storm ?? 0.6;
  vgrad(ctx, -600, 720, [[0, '#C7D8E6'], [1, '#EEF3F5']], -1400, W + 1400);
  tx(ctx, { x: par(camX, 0.1) }, () => glow(ctx, 500, 380, 380, '#FFF6E0', 0.5));
  tx(ctx, { x: par(camX, 0.2) }, () => {
    mountainRange(ctx, [[-200, 300, 380], [300, 380, 420], [900, 280, 360], [1400, 360, 420], [1950, 300, 380], [2500, 340, 380]], 690, '#DDE8F0', '#B9CDDD', '#F7FAFC');
  });
  tx(ctx, { x: par(camX, 0.5) }, () => {
    for (const [x, h] of ARCTIC.spruce) pine(ctx, x, 720, h + 40, '#8FA6B2', '#7D95A3', { trunk: '#7D8B93', snow: '#F2F6F8', tiers: 3 });
    shape(ctx, [[-1400, 700], [W + 1400, 700], [W + 1400, 820], [-1400, 820]], { fill: '#E4EDF3', stroke: null, wob: 0 });
  });
  // drifts
  const g = [[-1400, 790]];
  for (let i = 0; i <= 30; i++) {
    const x = -1400 + i * ((W + 2800) / 30);
    g.push([x, 790 + Math.sin(i * 1.3) * 18 + Math.sin(i * 0.4) * 12]);
  }
  g.push([W + 1400, H + 300], [-1400, H + 300]);
  shape(ctx, g, { fill: '#F6F9FB', stroke: null, smooth: true, wob: 0 });
  for (let i = 0; i < 8; i++) {
    const x = -600 + i * 420;
    shape(ctx, [[x, 900 + (i % 2) * 60], [x + 180, 870 + (i % 2) * 60], [x + 380, 910 + (i % 2) * 60], [x + 200, 930 + (i % 2) * 60]], { fill: '#DCE9F2', stroke: null, smooth: true, wob: 0.3 });
  }
  if (storm > 0) blowingSnow(ctx, t, storm);
}
export function blowingSnow(ctx, t, amt = 1) {
  ctx.save();
  const n = Math.floor(140 * amt);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < n; i++) {
    const sp = 500 + hash(i * 2.9) * 700;
    const x = ((hash(i * 1.3) * (W + 600) + t * sp) % (W + 600)) - 300;
    const y = hash(i * 5.7) * H + Math.sin(t * 2 + i) * 30 + ((t * 80 * hash(i)) % 200);
    const r = 2 + hash(i * 3.3) * 4;
    ctx.beginPath();
    ctx.ellipse(x, y % H, r * 1.8, r, 0.15, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < n / 8; i++) {
    const sp = 1100 + hash(i * 8.1) * 600;
    const x = ((hash(i * 4.4) * (W + 800) + t * sp) % (W + 800)) - 400;
    const y = hash(i * 6.2) * H;
    ctx.moveTo(x, y);
    ctx.lineTo(x + 120, y + 8);
  }
  ctx.stroke();
  ctx.restore();
}

// ---- LAB (Thing Theory HQ) -----------------------------------------------------
export function labBG(ctx, t, o = {}) {
  fillScreen(ctx, '#EFE2C8');
  // wall panels
  for (let i = 0; i < 9; i++) {
    const x = -200 + i * 300;
    shape(ctx, [[x, -50], [x + 150, -50], [x + 150, 640], [x, 640]], { fill: 'rgba(214,196,160,0.25)', stroke: null, wob: 0 });
  }
  // wainscot
  shape(ctx, [[-400, 640], [W + 400, 640], [W + 400, 860], [-400, 860]], { fill: '#C69F74', stroke: P.ink, lw: 4, wob: 0.4 });
  for (let i = 0; i < 16; i++) line(ctx, [[-300 + i * 160, 650], [-300 + i * 160, 855]], { color: '#AD875F', lw: 4, wob: 0.4 });
  line(ctx, [[-400, 660], [W + 400, 660]], { color: '#AD875F', lw: 6, wob: 0.3 });
  // floor
  shape(ctx, [[-400, 860], [W + 400, 860], [W + 400, H + 300], [-400, H + 300]], { fill: '#B98E66', stroke: P.ink, lw: 4, wob: 0.4 });
  for (let i = 0; i < 6; i++) line(ctx, [[-400, 900 + i * 40], [W + 400, 900 + i * 40]], { color: '#A67C56', lw: 3, wob: 0.4 });
  // world map poster
  if (!o.noMap) {
    const m = { x: 170, y: 110, w: 900, h: 420 };
    rrect(ctx, m.x - 26, m.y - 26, m.w + 52, m.h + 52, 10, { fill: '#8A6448', lw: 5 });
    rrect(ctx, m.x - 8, m.y - 8, m.w + 16, m.h + 16, 4, { fill: '#DCE9EC', lw: 3 });
    drawWorld(ctx, m, { sea: '#CFE2EA', land: '#E9D9B4', lw: 2.5, wob: 0.3, lake: '#CFE2EA' });
    if (o.mapOverlay) o.mapOverlay(ctx, m);
  }
  // shelf with flasks
  const sx = 1280;
  shape(ctx, [[sx, 300], [sx + 520, 300], [sx + 520, 322], [sx, 322]], { fill: '#8A6448', lw: 4 });
  shape(ctx, [[sx, 520], [sx + 520, 520], [sx + 520, 542], [sx, 542]], { fill: '#8A6448', lw: 4 });
  flask(ctx, sx + 80, 300, 1, P.sage, t, 0);
  flask(ctx, sx + 200, 300, 0.8, P.blue, t, 1);
  beaker(ctx, sx + 320, 300, 1, P.coral);
  flask(ctx, sx + 440, 300, 1.1, P.mustard, t, 2);
  // books
  const cols = [P.coral, P.blueD, P.mustardD, P.sageD, P.plum];
  for (let i = 0; i < 5; i++) shape(ctx, [[sx + 40 + i * 38, 520], [sx + 72 + i * 38, 520], [sx + 72 + i * 38, 520 - 110 + (i % 2) * 14], [sx + 40 + i * 38, 520 - 110 + (i % 2) * 14]], { fill: cols[i], lw: 4 });
  beaker(ctx, sx + 360, 520, 0.9, P.plumL);
  flask(ctx, sx + 460, 520, 0.8, P.sage, t, 3);
  // plant
  shape(ctx, [[1830, 860], [1910, 860], [1900, 780], [1840, 780]], { fill: P.coralD, lw: 4.5 });
  for (let i = 0; i < 5; i++) bigLeaf(ctx, 1870, 790, 150, -Math.PI / 2 - 0.9 + i * 0.45, P.sage, P.sageD, t, i, { veins: false });
}
export function flask(ctx, x, y, s, liquid, t = 0, seed = 0) {
  tx(ctx, { x, y, s }, () => {
    const pts = [[-12, -110], [12, -110], [12, -70], [44, -8], [40, 0], [-40, 0], [-44, -8], [-12, -70]];
    shape(ctx, pts, { fill: 'rgba(230,242,245,0.85)', lw: 4.5 });
    shape(ctx, [[-30, -30], [30, -30], [44, -8], [40, 0], [-40, 0], [-44, -8]], { fill: liquid, stroke: null, wob: 0.6 });
    line(ctx, [[-30, -30], [30, -30]], { color: P.ink, lw: 3 });
    shape(ctx, pts, { fill: null, lw: 4.5 });
    line(ctx, [[-16, -110], [16, -110]], { lw: 7 });
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.6 + i * 0.33 + seed * 0.2) % 1;
      circle(ctx, -8 + i * 8, -30 - ph * 100, 4 + ph * 3, { fill: null, stroke: P.ink, lw: 2.5, alpha: 1 - ph });
    }
  });
}
export function beaker(ctx, x, y, s, liquid) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-30, -90], [30, -90], [30, 0], [-30, 0]], { fill: 'rgba(230,242,245,0.85)', lw: 4.5 });
    shape(ctx, [[-30, -45], [30, -45], [30, 0], [-30, 0]], { fill: liquid, stroke: null });
    shape(ctx, [[-30, -90], [30, -90], [30, 0], [-30, 0]], { fill: null, lw: 4.5 });
    for (let i = 0; i < 3; i++) line(ctx, [[18, -75 + i * 18], [30, -75 + i * 18]], { lw: 2.5 });
  });
}

// ---- notebook / diagram board ---------------------------------------------------
export function notebookBG(ctx, t, o = {}) {
  fillScreen(ctx, o.color || '#F6EFE2');
  ctx.save();
  ctx.strokeStyle = 'rgba(160,140,110,0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 0; y <= H; y += 60) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  ctx.restore();
  if (o.header) {
    rrect(ctx, 60, 44, W - 120, 8, 4, { fill: o.header, stroke: null, wob: 0.6 });
  }
}

export function colorBG(ctx, c1, c2) {
  vgrad(ctx, -100, H + 100, [[0, c1], [1, c2]], -100, W + 100);
}
