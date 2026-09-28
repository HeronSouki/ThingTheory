// Reusable on-screen graphics: title cards, the survival clock, meters, bubbles, transitions.
import { baseT, P, shape, circle, ellipse, line, tx, text, tag, stamp, rrect, rrectPts, glow, measure, swash, fillScreen, vgrad, arrow, ellipsePts, softShadow } from './engine/draw.js';
import { W, H, E, clamp, lerp, prog, vis, popScale, TAU, hash, mix, rgba, wiggle } from './engine/core.js';
import { sfx } from './engine/sfx.js';

export function withCam(ctx, c, fn) {
  ctx.save();
  ctx.translate(W / 2 + (c.sx || 0), H / 2 + (c.sy || 0));
  const z = c.z ?? 1;
  ctx.scale(z, z);
  if (c.r) ctx.rotate(c.r);
  ctx.translate(-(c.x ?? W / 2), -(c.y ?? H / 2));
  fn();
  ctx.restore();
}

// Piecewise keyframes: keys = [[t, value, ease?], ...]; value number or array
export function keys(t, ks) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1];
      const [t1, v1, ease = E.inOutCubic] = ks[i];
      const f = ease(clamp((t - t0) / (t1 - t0)));
      if (Array.isArray(v0)) return v0.map((v, j) => lerp(v, v1[j], f));
      return lerp(v0, v1, f);
    }
  }
  return ks[ks.length - 1][1];
}

// handheld drift + impact shake
export function drift(t, amt = 1) {
  return { dx: wiggle(t, 0.25, 10 * amt, 3), dy: wiggle(t, 0.2, 6 * amt, 9), dr: wiggle(t, 0.15, 0.006 * amt, 5) };
}
export function shake(t, t0, dur = 0.4, amp = 16) {
  const k = clamp((t - t0) / dur);
  if (k <= 0 || k >= 1) return [0, 0];
  const f = (1 - k) * amp;
  return [Math.sin(t * 90) * f, Math.cos(t * 77) * f * 0.7];
}

// ---- skull / icons -------------------------------------------------------------
export function skull(ctx, x, y, r, color = P.white, a = 1) {
  tx(ctx, { x, y, s: r / 40, a }, () => {
    shape(ctx, [[-36, -8], [-34, -34], [-12, -48], [12, -48], [34, -34], [36, -8], [26, 10], [22, 30], [-22, 30], [-26, 10]], { fill: color, lw: 5, smooth: true });
    ellipse(ctx, -14, -8, 10, 11, { fill: P.ink, stroke: null });
    ellipse(ctx, 14, -8, 10, 11, { fill: P.ink, stroke: null });
    shape(ctx, [[0, 6], [-5, 15], [5, 15]], { fill: P.ink, stroke: null });
    for (const dx of [-10, 0, 10]) line(ctx, [[dx, 22], [dx, 32]], { lw: 4 });
  });
}

export function stopwatch(ctx, x, y, r, t, spin = 0, color = P.coral) {
  // spin: hand angle in turns
  line(ctx, [[x, y - r - 4], [x, y - r - 24]], { lw: 12, outline: 2.5, color: P.inkL });
  rrect(ctx, x - 22, y - r - 44, 44, 20, 8, { fill: color, lw: 4.5 });
  line(ctx, [[x + r * 0.72, y - r * 0.72], [x + r * 0.86, y - r * 0.86]], { lw: 10, outline: 2.5, color: P.inkL });
  circle(ctx, x, y, r, { fill: color, lw: 6 });
  circle(ctx, x, y, r * 0.82, { fill: P.white, lw: 4.5 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const r1 = r * (i % 3 === 0 ? 0.6 : 0.68);
    line(ctx, [[x + Math.cos(a) * r1, y + Math.sin(a) * r1], [x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74]], { lw: i % 3 === 0 ? 5 : 3, wob: 0.5 });
  }
  const a = spin * TAU - Math.PI / 2;
  line(ctx, [[x, y], [x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62]], { lw: 7, color: P.red, wob: 0.5 });
  circle(ctx, x, y, 8, { fill: P.ink, stroke: null });
}

// ---- level title card -------------------------------------------------------------
// o: { num, name, sub, c1, c2, skulls, icon(ctx) }
export function levelCard(ctx, t, t0, t1, o) {
  const lt = t - t0;
  sfx('level', o.name);
  vgrad(ctx, -50, H + 50, [[0, o.c1], [1, o.c2]], -50, W + 50);
  // big faint number
  text(ctx, String(o.num), W - 330 + wiggle(t, 0.3, 8), 560, { size: 900, font: 'marker', color: 'rgba(255,255,255,0.12)', s: lerp(1.2, 1, prog(lt, 0, 1.2)) });
  // diagonal stripes
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i = -6; i < 20; i++) {
    const x = i * 160 + ((lt * 60) % 160);
    shape(ctx, [[x, -50], [x + 60, -50], [x - 540, H + 50], [x - 600, H + 50]], { fill: P.white, stroke: null, wob: 0 });
  }
  ctx.restore();
  // emblem
  const es = popScale(lt, 0.05, Infinity, 0.5);
  if (o.icon) {
    tx(ctx, { x: 470, y: 540, s: es, r: (1 - es) * 0.4 }, () => {
      circle(ctx, 10, 16, 250, { fill: 'rgba(47,59,62,0.2)', stroke: null, wob: 0 });
      circle(ctx, 0, 0, 250, { fill: P.paper, lw: 7 });
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, 238, 0, TAU);
      ctx.clip();
      o.icon(ctx, t);
      ctx.restore();
      circle(ctx, 0, 0, 238, { fill: null, lw: 5 });
    });
  }
  const tx0 = 830;
  const lvS = popScale(lt, 0.15, Infinity, 0.4);
  tx(ctx, { x: tx0 + 110, y: 330, s: lvS, r: -0.04 }, () => tag(ctx, `LEVEL ${o.num}`, 0, 0, { size: 60, font: 'bold', bg: P.ink, color: P.white, border: P.ink }));
  const nameP = prog(lt, 0.3, 0.5, E.outBack);
  const lines = o.name.split('\n');
  lines.forEach((ln, i) => {
    const p = prog(lt, 0.3 + i * 0.12, 0.5, E.outBack);
    text(ctx, ln, tx0 + (1 - p) * 300, 470 + i * 150, { size: o.nameSize || 150, font: 'marker', color: P.white, align: 'left', a: clamp(p * 2), stroke: P.ink, sw: 14, shadow: true, maxW: 1020 });
  });
  const sy = 470 + lines.length * 150 + 10;
  swash(ctx, tx0, sy - 40, 980, 18, 'rgba(255,255,255,0.5)', prog(lt, 0.55, 0.5), o.num);
  // difficulty skulls
  text(ctx, 'DANGER', tx0, sy + 40, { size: 44, font: 'bold', color: P.white, align: 'left', a: prog(lt, 0.7, 0.3) });
  for (let i = 0; i < 5; i++) {
    const s = popScale(lt, 0.8 + i * 0.1, Infinity, 0.35);
    const on = i < o.skulls;
    tx(ctx, { x: tx0 + 250 + i * 90, y: sy + 36, s, r: on ? wiggle(t, 2, 0.08, i) : 0 }, () => skull(ctx, 0, 0, 34, on ? P.white : 'rgba(255,255,255,0.25)'));
  }
  if (o.sub) text(ctx, o.sub, tx0, sy + 130, { size: 50, font: 'hand', color: P.white, align: 'left', a: prog(lt, 1.0, 0.4) });
}

// ---- survival clock verdict -----------------------------------------------------------
// o: { value, sub, color }
export function survivalClock(ctx, t, t0, t1, o) {
  const lt = t - t0;
  sfx('clock', o.value);
  const inP = prog(lt, 0, 0.45, E.outBack);
  const outP = prog(t, t1 - 0.3, 0.3, E.inBack);
  const a = clamp(lt / 0.25) * (1 - outP);
  // dim
  ctx.save();
  ctx.fillStyle = `rgba(35,45,50,${0.55 * a})`;
  ctx.fillRect(-50, -50, W + 100, H + 100);
  ctx.restore();
  const s = inP * (1 - outP);
  if (s <= 0) return;
  tx(ctx, { x: W / 2, y: H / 2 + 20, s, r: (1 - inP) * -0.1 }, () => {
    rrect(ctx, -700 + 12, -290 + 18, 1400, 580, 44, { fill: 'rgba(20,25,30,0.3)', stroke: null, wob: 0 });
    rrect(ctx, -700, -290, 1400, 580, 44, { fill: P.paper, lw: 7 });
    rrect(ctx, -700, -290, 1400, 120, 44, { fill: o.color, lw: 0, stroke: null });
    shape(ctx, [[-700, -210], [700, -210], [700, -170], [-700, -170]], { fill: o.color, stroke: null, wob: 0 });
    rrect(ctx, -700, -290, 1400, 580, 44, { fill: null, lw: 7 });
    line(ctx, [[-700, -170], [700, -170]], { lw: 6 });
    text(ctx, 'SURVIVAL CLOCK', 0, -226, { size: 76, font: 'bold', color: P.white, stroke: P.ink, sw: 10 });
    // stopwatch spinning then stopping
    const settle = prog(lt, 0.3, 1.1, E.outCubic);
    const spin = settle * (o.turns || 5.3);
    const sw = 1 + (lt > 1.4 ? Math.sin((lt - 1.4) * 30) * 0.04 * Math.max(0, 1 - (lt - 1.4) * 3) : 0);
    tx(ctx, { x: -450, y: 70, s: sw }, () => stopwatch(ctx, 0, 0, 150, t, spin, o.color));
    // verdict
    const vp = prog(lt, 1.2, 0.35, E.outBackBig);
    const lines = o.value.split('\n');
    lines.forEach((ln, i) => {
      text(ctx, ln, 230, 40 + (i - (lines.length - 1) / 2) * 130, { size: o.size || 120, font: 'bold', color: o.textColor || P.ink, s: vp, maxW: 820, a: clamp(vp * 2) });
    });
    if (o.sub) text(ctx, o.sub, 230, 210, { size: 48, font: 'hand', color: P.inkL, a: prog(lt, 1.8, 0.4), maxW: 820 });
  });
}

// ---- banners & cards ----------------------------------------------------------------
export function banner(ctx, str, x, y, p, color = P.green, opt = {}) {
  if (p <= 0) return;
  sfx(color === P.red ? 'bad' : 'good', str);
  const size = opt.size || 90;
  const w = measure(ctx, str, 'bold', size) + 120;
  const h = size * 1.35;
  tx(ctx, { x, y, s: E.outBack(clamp(p)), r: opt.r ?? -0.03 }, () => {
    // ribbon tails
    shape(ctx, [[-w / 2 - 60, -h * 0.3], [-w / 2 + 20, -h * 0.3], [-w / 2 + 20, h * 0.6], [-w / 2 - 60, h * 0.6], [-w / 2 - 30, h * 0.15]], { fill: mix(color, '#000000', 0.25), lw: 5 });
    shape(ctx, [[w / 2 + 60, -h * 0.3], [w / 2 - 20, -h * 0.3], [w / 2 - 20, h * 0.6], [w / 2 + 60, h * 0.6], [w / 2 + 30, h * 0.15]], { fill: mix(color, '#000000', 0.25), lw: 5 });
    rrect(ctx, -w / 2, -h / 2, w, h, 16, { fill: color, lw: 6 });
    text(ctx, str, 0, size * 0.06, { size, font: 'bold', color: P.white, stroke: P.ink, sw: 9 });
  });
}

export function problemCard(ctx, t, t0, num, str, color = P.blueD) {
  const lt = t - t0;
  if (lt >= 0) sfx('swoosh', str);
  const p = prog(lt, 0, 0.45, E.outBack);
  tx(ctx, { x: W / 2, y: 190, s: p, r: -0.02 }, () => {
    const w = 1100, h = 190;
    rrect(ctx, -w / 2 + 10, -h / 2 + 14, w, h, 30, { fill: 'rgba(20,25,30,0.3)', stroke: null, wob: 0 });
    rrect(ctx, -w / 2, -h / 2, w, h, 30, { fill: P.paper, lw: 7 });
    rrect(ctx, -w / 2, -h / 2, 260, h, 30, { fill: color, lw: 7 });
    text(ctx, 'PROBLEM', -w / 2 + 130, -38, { size: 38, font: 'bold', color: P.white });
    text(ctx, '#' + num, -w / 2 + 130, 34, { size: 96, font: 'bold', color: P.white, stroke: P.ink, sw: 8 });
    text(ctx, str, 130, 8, { size: 96, font: 'marker', color: P.ink, maxW: 780 });
  });
}

// numbered rule item (desert do's)
export function numberBadge(ctx, n, x, y, r, color, s = 1) {
  tx(ctx, { x, y, s }, () => {
    circle(ctx, 4, 6, r, { fill: 'rgba(20,25,30,0.25)', stroke: null, wob: 0 });
    circle(ctx, 0, 0, r, { fill: color, lw: 6 });
    text(ctx, String(n), 0, r * 0.08, { size: r * 1.25, font: 'bold', color: P.white, stroke: P.ink, sw: 7 });
  });
}

// ---- meters ----------------------------------------------------------------------
export function meter(ctx, x, y, w, h, v, color, label = null, opt = {}) {
  rrect(ctx, x, y, w, h, h / 2, { fill: opt.bg || P.white, lw: 5 });
  const vv = clamp(v);
  if (vv > 0.01) rrect(ctx, x + 6, y + 6, (w - 12) * vv, h - 12, (h - 12) / 2, { fill: color, stroke: null, wob: 0.5 });
  rrect(ctx, x, y, w, h, h / 2, { fill: null, lw: 5 });
  if (label) text(ctx, label, x, y - 34, { size: opt.size || 44, font: 'bold', color: opt.labelColor || P.ink, align: 'left', stroke: opt.stroke || null, sw: 8 });
}

export function thermometer(ctx, x, y, h, v, opt = {}) {
  const { color = P.red, bulb = 46, w = 40, label = null, face = null, scale = null } = opt;
  rrect(ctx, x - w / 2, y - h, w, h, w / 2, { fill: P.white, lw: 6 });
  circle(ctx, x, y + bulb * 0.5, bulb, { fill: color, lw: 6 });
  const fillH = (h - 20) * clamp(v);
  rrect(ctx, x - w / 2 + 9, y - fillH - 10, w - 18, fillH + 30, (w - 18) / 2, { fill: color, stroke: null, wob: 0.3 });
  circle(ctx, x, y + bulb * 0.5, bulb - 8, { fill: color, stroke: null, wob: 0 });
  for (let i = 1; i < 8; i++) line(ctx, [[x + w / 2 - 12, y - (h * i) / 8], [x + w / 2, y - (h * i) / 8]], { lw: 3 });
  if (face) {
    // cute face on the bulb
    const fy = y + bulb * 0.5;
    if (face === 'bad') {
      line(ctx, [[x - 20, fy - 12], [x - 8, fy - 8]], { lw: 4 });
      line(ctx, [[x + 20, fy - 12], [x + 8, fy - 8]], { lw: 4 });
      circle(ctx, x - 13, fy - 2, 4, { fill: P.ink, stroke: null });
      circle(ctx, x + 13, fy - 2, 4, { fill: P.ink, stroke: null });
      line(ctx, [[x - 12, fy + 18], [x, fy + 12], [x + 12, fy + 18]], { lw: 4, smooth: true });
    } else {
      circle(ctx, x - 13, fy - 4, 4, { fill: P.ink, stroke: null });
      circle(ctx, x + 13, fy - 4, 4, { fill: P.ink, stroke: null });
      line(ctx, [[x - 12, fy + 10], [x, fy + 17], [x + 12, fy + 10]], { lw: 4, smooth: true });
    }
  }
  if (label) text(ctx, label, x, y + bulb * 1.5 + 44, { size: 56, font: 'bold', color: P.ink, stroke: P.white, sw: 10 });
}

// ---- bubbles ---------------------------------------------------------------------------
export function thoughtBubble(ctx, x, y, w, h, p, fromX, fromY, content) {
  if (p <= 0) return;
  sfx('bubble', `${Math.round(x)}`);
  const s = E.outBack(clamp(p));
  for (let i = 0; i < 3; i++) {
    const f = (i + 1) / 4;
    const bp = clamp(p * 3 - i * 0.4);
    circle(ctx, lerp(fromX, x, f), lerp(fromY, y + h * 0.4, f), (10 + i * 8) * bp, { fill: P.white, lw: 4.5 });
  }
  tx(ctx, { x, y, s }, () => {
    const pts = [];
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      pts.push([Math.cos(a) * w * 0.5, Math.sin(a) * h * 0.5]);
      const a2 = ((i + 0.5) / n) * TAU;
      pts.push([Math.cos(a2) * w * 0.58, Math.sin(a2) * h * 0.6]);
    }
    shape(ctx, pts, { fill: P.white, lw: 5, smooth: true });
    if (content) content(ctx);
  });
}

export function speech(ctx, str, x, y, p, opt = {}) {
  if (p <= 0) return;
  sfx('bubble', str);
  const size = opt.size || 52;
  const w = measure(ctx, str, opt.font || 'hand', size) + 60;
  const h = size * 1.6;
  const tailX = opt.tailX ?? -w * 0.25, tailY = opt.tailY ?? h * 0.9;
  tx(ctx, { x, y, s: E.outBack(clamp(p)), r: opt.r || 0 }, () => {
    const body = rrectPts(-w / 2, -h / 2, w, h, h * 0.45);
    shape(ctx, body, { fill: opt.bg || P.white, lw: 5 });
    shape(ctx, [[tailX - 18, h / 2 - 4], [tailX + 18, h / 2 - 4], [tailX + tailY * 0.1 - 20, tailY]], { fill: opt.bg || P.white, lw: 5 });
    line(ctx, [[tailX - 15, h / 2 - 3], [tailX + 15, h / 2 - 3]], { color: opt.bg || P.white, lw: 9, wob: 0 });
    text(ctx, str, 0, size * 0.05, { size, font: opt.font || 'hand', color: opt.color || P.ink });
  });
}

// Circular magnifier inset. content drawn in local coords centred at 0,0 with radius r.
export function inset(ctx, x, y, r, p, content, opt = {}) {
  if (p <= 0) return;
  sfx('swoosh', `inset${Math.round(r)}`);
  const s = E.outBack(clamp(p));
  tx(ctx, { x, y, s }, () => {
    if (opt.handle) {
      line(ctx, [[r * 0.7, r * 0.7], [r * 1.25, r * 1.25]], { lw: 34, outline: 3, color: '#8A6448' });
    }
    circle(ctx, 10, 14, r + 6, { fill: 'rgba(20,25,30,0.25)', stroke: null, wob: 0 });
    circle(ctx, 0, 0, r + 12, { fill: opt.ring || P.ink, stroke: null, wob: 0.5 });
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.clip();
    ctx.fillStyle = opt.bg || P.paper;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    content(ctx);
    // glass shine
    ctx.globalAlpha = 0.25;
    shape(ctx, [[-r * 0.7, -r * 0.3], [-r * 0.3, -r * 0.75], [-r * 0.15, -r * 0.62], [-r * 0.58, -r * 0.15]], { fill: P.white, stroke: null, wob: 0 });
    ctx.restore();
    circle(ctx, 0, 0, r, { fill: null, lw: 6 });
  });
}

// Framed postcard / panel with content
export function panel(ctx, x, y, w, h, p, content, opt = {}) {
  if (p <= 0) return;
  sfx('card', `${opt.caption || ''}${Math.round(w)}`);
  const s = opt.noPop ? p : E.outBack(clamp(p));
  tx(ctx, { x, y, s, r: opt.r || 0 }, () => {
    rrect(ctx, -w / 2 + 10, -h / 2 + 14, w, h, 18, { fill: 'rgba(20,25,30,0.28)', stroke: null, wob: 0 });
    rrect(ctx, -w / 2, -h / 2, w, h, 18, { fill: opt.frame || P.white, lw: 6 });
    const m = opt.margin ?? 16;
    ctx.save();
    ctx.beginPath();
    const ip = rrectPts(-w / 2 + m, -h / 2 + m, w - m * 2, h - m * 2 - (opt.caption ? 60 : 0), 10);
    ctx.moveTo(ip[0][0], ip[0][1]);
    ip.forEach((q) => ctx.lineTo(q[0], q[1]));
    ctx.closePath();
    ctx.clip();
    ctx.translate(0, opt.caption ? -30 : 0);
    content(ctx, w - m * 2, h - m * 2 - (opt.caption ? 60 : 0));
    ctx.restore();
    shape(ctx, rrectPts(-w / 2 + m, -h / 2 + m, w - m * 2, h - m * 2 - (opt.caption ? 60 : 0), 10), { fill: null, lw: 4 });
    if (opt.caption) text(ctx, opt.caption, 0, h / 2 - 42, { size: 46, font: 'hand', color: P.ink, maxW: w - 40 });
  });
}

// ---- transitions --------------------------------------------------------------------------
// Brush-stroke wipe: p 0->1 covers screen left->right, 1->2 reveals continuing right.
export function paintWipe(ctx, p, color = P.ink, seed = 1) {
  if (p <= 0 || p >= 2) return;
  sfx('whoosh', `wipe${seed}`);
  ctx.save();
  baseT(ctx);
  const lead = p <= 1 ? E.inOutCubic(p) : 1;
  const trail = p <= 1 ? 0 : E.inOutCubic(p - 1);
  const x1 = -300 + lead * (W + 700);
  const x0 = -300 + trail * (W + 700);
  const pts = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const y = -60 + (i * (H + 120)) / n;
    pts.push([x1 + Math.sin(i * 1.7 + seed) * 60 + hash(i + seed) * 70, y]);
  }
  for (let i = n; i >= 0; i--) {
    const y = -60 + (i * (H + 120)) / n;
    pts.push([x0 - 300 + Math.sin(i * 1.3 + seed * 2) * 60 + hash(i + seed * 3) * 70, y]);
  }
  shape(ctx, pts, { fill: color, stroke: null, smooth: true, wob: 2 });
  ctx.restore();
}

export function irisWipe(ctx, p, x = W / 2, y = H / 2, color = '#1E2629') {
  // p: 0 open -> 1 closed
  if (p <= 0) return;
  ctx.save();
  baseT(ctx);
  const r = (1 - E.inOutCubic(clamp(p))) * 1300;
  ctx.beginPath();
  ctx.rect(-10, -10, W + 20, H + 20);
  ctx.arc(x, y, Math.max(0.1, r), 0, TAU, true);
  ctx.fillStyle = color;
  ctx.fill('evenodd');
  ctx.restore();
}

export function flash(ctx, a, color = '#FFFFFF') {
  if (a <= 0) return;
  ctx.save();
  baseT(ctx);
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// speed/impact lines radiating from a point
export function burstLines(ctx, x, y, r0, r1, p, color = P.ink, n = 14) {
  if (p <= 0 || p >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + hash(i) * 0.3;
    const a0 = r0 + (r1 - r0) * E.outCubic(p);
    const a1 = a0 + 60 * (1 - p);
    line(ctx, [[x + Math.cos(a) * a0, y + Math.sin(a) * a0], [x + Math.cos(a) * a1, y + Math.sin(a) * a1]], { color, lw: 6, alpha: 1 - p });
  }
}

// comic "BOOM"-style burst
export function comicBurst(ctx, str, x, y, r, p, color = P.mustard, opt = {}) {
  if (p <= 0) return;
  sfx('boom', str);
  const s = E.outBackBig(clamp(p));
  tx(ctx, { x, y, s, r: opt.r ?? -0.08 }, () => {
    const pts = [];
    const n = 16;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * TAU;
      const rr = i % 2 ? r * 0.72 : r * (1 + hash(i) * 0.15);
      pts.push([Math.cos(a) * rr * 1.25, Math.sin(a) * rr]);
    }
    shape(ctx, pts, { fill: color, lw: 7 });
    text(ctx, str, 0, 8, { size: opt.size || r * 0.62, font: 'bold', color: opt.textColor || P.white, stroke: P.ink, sw: 10 });
  });
}

// Portal ring used to drop Greg into each biome
export function portal(ctx, x, y, r, p, t) {
  if (p <= 0) return;
  const s = E.outBack(clamp(p));
  tx(ctx, { x, y, sx: s, sy: s * 0.36 }, () => {
    glow(ctx, 0, 0, r * 1.6, '#C9B6F2', 0.6);
    circle(ctx, 0, 0, r, { fill: '#6F5A9C', lw: 8 });
    for (let i = 0; i < 4; i++) {
      const rr = r * (0.85 - i * 0.18);
      const pts = [];
      for (let k = 0; k <= 40; k++) {
        const a = (k / 40) * TAU;
        pts.push([Math.cos(a + t * (2 + i)) * rr, Math.sin(a + t * (2 + i)) * rr]);
      }
      line(ctx, pts.slice(0, 26), { color: i % 2 ? '#D9C9FF' : '#A48BDA', lw: 10, wob: 1 });
    }
    circle(ctx, 0, 0, r * 0.3, { fill: '#2A2140', stroke: null });
  });
}

export function sparkle(ctx, x, y, r, color = P.white, a = 1) {
  if (r <= 0.5) return;
  tx(ctx, { a }, () => shape(ctx, [[x, y - r], [x + r * 0.25, y - r * 0.25], [x + r, y], [x + r * 0.25, y + r * 0.25], [x, y + r], [x - r * 0.25, y + r * 0.25], [x - r, y], [x - r * 0.25, y - r * 0.25]], { fill: color, lw: 3 }));
}

export function zzz(ctx, x, y, t) {
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.5 + i / 3) % 1;
    text(ctx, 'z', x + ph * 60 + Math.sin(ph * 6) * 10, y - ph * 120, { size: 40 + ph * 40, font: 'bold', color: P.blueD, a: Math.sin(ph * Math.PI), stroke: P.white, sw: 6 });
  }
}

export function heatWaves(ctx, x, y, t, color = 'rgba(232,135,122,0.8)', n = 3) {
  for (let i = 0; i < n; i++) {
    const pts = [];
    const ph = (t * 0.8 + i / n) % 1;
    for (let k = 0; k <= 8; k++) pts.push([x - 50 + i * 50 + Math.sin(k * 1.2 + t * 6) * 8, y - k * 12 - ph * 40]);
    line(ctx, pts, { color, lw: 5, smooth: true, alpha: Math.sin(ph * Math.PI) });
  }
}

// digital countdown display
export function countdown(ctx, x, y, secs, s = 1, color = P.red) {
  const m = Math.max(0, Math.floor(secs / 60)), sc = Math.max(0, Math.floor(secs % 60));
  const str = `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
  tx(ctx, { x, y, s }, () => {
    rrect(ctx, -170, -70, 340, 140, 24, { fill: '#2B3437', lw: 6 });
    rrect(ctx, -150, -52, 300, 104, 14, { fill: '#1C2326', stroke: null });
    text(ctx, str, 0, 6, { size: 96, font: 'round', color });
  });
}

// calendar page
export function calendarPage(ctx, x, y, s, top, big, opt = {}) {
  if (s > 0.01) sfx('pop', top);
  tx(ctx, { x, y, s, r: opt.r || 0 }, () => {
    rrect(ctx, -160 + 8, -180 + 12, 320, 360, 22, { fill: 'rgba(20,25,30,0.25)', stroke: null, wob: 0 });
    rrect(ctx, -160, -180, 320, 360, 22, { fill: P.white, lw: 6 });
    rrect(ctx, -160, -180, 320, 100, 22, { fill: opt.color || P.red, lw: 6 });
    for (const dx of [-80, 80]) rrect(ctx, dx - 10, -205, 20, 50, 8, { fill: P.inkL, lw: 4 });
    text(ctx, top, 0, -126, { size: 54, font: 'bold', color: P.white, maxW: 280 });
    text(ctx, big, 0, 60, { size: opt.bigSize || 130, font: 'bold', color: P.ink, maxW: 280 });
  });
}
