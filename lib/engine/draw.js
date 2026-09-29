// Drawing primitives with a hand-drawn "line boil": every outline gets a tiny jitter
// that changes 8 times a second, like frames of traditional animation.
import { hash2, clamp, lerp, TAU, W, H, rgba, E } from './core.js';
import { sfx, setSfxTime } from './sfx.js';

export const P = {
  paper: '#F5EDDF', paper2: '#EBE0CB', paperD: '#DCCFB6',
  ink: '#2F3B3E', inkL: '#56666A',
  sage: '#9CBB90', sageD: '#6F9869', sageDD: '#4F7A55', sageL: '#C7DABA',
  blue: '#86A8D0', blueD: '#5F83B3', blueDD: '#3F5F8E', blueL: '#BFD4EA',
  coral: '#E8877A', coralD: '#CC6557', coralL: '#F4B9AD',
  mustard: '#EDC468', mustardD: '#D5A143', mustardL: '#F6DD9E',
  beige: '#DDCCB2', beigeD: '#BEA686',
  plum: '#937094', plumD: '#6F5372', plumL: '#C2A7C1',
  white: '#FCF9F2', snow: '#F4F8FB', ice: '#D6E7F2', iceD: '#A9C6DC',
  red: '#DB5646', redD: '#B23B2E', green: '#6DAE69', greenD: '#4E8E4B',
  sky: '#CFE3EC', skyD: '#A9CBDD',
  skin: '#F5CBA8', skinD: '#E2A985',
  sand: '#EFCB86', sandD: '#DDAA5E', sandL: '#F7E0AE',
  sea: '#4E86B5', seaD: '#355F8C', seaL: '#7FB0D6',
  shadow: 'rgba(47,59,62,0.18)',
};

export const FONTS = {
  hand: '"Patrick Hand"',
  marker: '"Permanent Marker"',
  bold: '"Luckiest Guy"',
  round: 'Fredoka',
};

let BS = 1; // base output scale (1 = 1920x1080)
export function setBaseScale(s) {
  BS = s;
}
export function baseT(ctx) {
  ctx.setTransform(BS, 0, 0, BS, 0, 0);
}

let BF = 0; // boil frame
let SC = 0; // shape counter (resets every frame)
let TIME = 0;
export function setFrame(t) {
  TIME = t;
  setSfxTime(t);
  BF = Math.floor(t * 8);
  SC = 0;
}
export const now = () => TIME;

function tscale(ctx) {
  const m = ctx.getTransform();
  return (Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1) / BS;
}

// coarse device-space position, used to tell repeated sound cues apart
export function devKey(ctx, x, y) {
  const m = ctx.getTransform();
  return `${Math.round((m.a * x + m.c * y + m.e) / BS / 60)},${Math.round((m.b * x + m.d * y + m.f) / BS / 60)}`;
}

export function wobble(ctx, pts, amp = 1.4) {
  if (!amp) return pts;
  const k = amp / tscale(ctx);
  const id = SC++ * 17.13;
  const out = new Array(pts.length);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    out[i] = [p[0] + (hash2(id + i, BF) - 0.5) * 2 * k, p[1] + (hash2(id + i + 0.5, BF + 91) - 0.5) * 2 * k];
  }
  return out;
}

// Build a canvas path through points; smooth=true gives a Catmull-Rom spline.
export function tracePath(ctx, pts, closed = true, smoothPath = false) {
  const n = pts.length;
  if (n < 2) return;
  ctx.moveTo(pts[0][0], pts[0][1]);
  if (!smoothPath || n < 3) {
    for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (closed) ctx.closePath();
    return;
  }
  const get = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}

// Generic filled + outlined shape.
// opt: fill, stroke (default ink), lw, closed, smooth, wob, alpha, dash
export function shape(ctx, pts, opt = {}) {
  const { fill = null, stroke = P.ink, lw = 5, closed = true, smooth: sm = false, wob = 1.3, alpha = 1, join = 'round' } = opt;
  const q = wobble(ctx, pts, wob);
  ctx.beginPath();
  tracePath(ctx, q, closed, sm);
  if (alpha !== 1) { ctx.save(); ctx.globalAlpha *= alpha; }
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke && lw > 0) {
    ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = join; ctx.lineCap = 'round';
    ctx.stroke();
  }
  if (alpha !== 1) ctx.restore();
}

export function ellipsePts(x, y, rx, ry, rot = 0, n = 0, a0 = 0, a1 = TAU) {
  n = n || Math.round(clamp((rx + ry) / 5, 14, 44));
  const pts = [];
  const full = Math.abs(a1 - a0 - TAU) < 1e-6;
  const cnt = full ? n : n + 1;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  for (let i = 0; i < cnt; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
    pts.push([x + px * cr - py * sr, y + px * sr + py * cr]);
  }
  return pts;
}
export function circle(ctx, x, y, r, opt = {}) {
  shape(ctx, ellipsePts(x, y, r, r), { smooth: true, ...opt });
}
export function ellipse(ctx, x, y, rx, ry, opt = {}) {
  shape(ctx, ellipsePts(x, y, rx, ry, opt.rot || 0), { smooth: true, ...opt });
}
export function rrectPts(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  const pts = [];
  const corner = (cx, cy, a0) => {
    for (let i = 0; i <= 4; i++) {
      const a = a0 + (Math.PI / 2) * (i / 4);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return pts;
}
export function rrect(ctx, x, y, w, h, r, opt = {}) {
  shape(ctx, rrectPts(x, y, w, h, r), opt);
}

// Polyline trimmed to fraction p of its length (for draw-on animations).
export function partial(pts, p) {
  if (p >= 1) return pts;
  if (p <= 0) return [pts[0], pts[0]];
  let total = 0;
  const seg = [];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    total += d;
  }
  let target = total * p;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (target <= seg[i - 1]) {
      const f = target / seg[i - 1];
      out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]);
      return out;
    }
    target -= seg[i - 1];
    out.push(pts[i]);
  }
  return out;
}

// Stroked line; outline=true draws an ink under-stroke so the line reads as a filled tube.
export function line(ctx, pts, opt = {}) {
  const { color = P.ink, lw = 5, outline = 0, smooth: sm = false, wob = 1.2, alpha = 1, cap = 'round', p = 1, dash = null } = opt;
  let q = p < 1 ? partial(pts, p) : pts;
  q = wobble(ctx, q, wob);
  if (alpha !== 1) { ctx.save(); ctx.globalAlpha *= alpha; }
  ctx.lineCap = cap; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  if (outline) {
    ctx.beginPath(); tracePath(ctx, q, false, sm);
    ctx.strokeStyle = P.ink; ctx.lineWidth = lw + outline * 2; ctx.stroke();
  }
  ctx.beginPath(); tracePath(ctx, q, false, sm);
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
  if (dash) ctx.setLineDash([]);
  if (alpha !== 1) ctx.restore();
}

// transform helper: x,y translate; s (or sx/sy) scale; r rotate (radians); a alpha
export function tx(ctx, o, fn) {
  ctx.save();
  if (o.x || o.y) ctx.translate(o.x || 0, o.y || 0);
  if (o.r) ctx.rotate(o.r);
  const sx = (o.sx ?? 1) * (o.s ?? 1), sy = (o.sy ?? 1) * (o.s ?? 1);
  if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
  if (o.a !== undefined) ctx.globalAlpha *= clamp(o.a);
  if (ctx.globalAlpha > 0.003 && sx !== 0 && sy !== 0) fn(ctx);
  ctx.restore();
}

export function softShadow(ctx, x, y, rx, ry, a = 0.18) {
  ctx.save();
  ctx.fillStyle = `rgba(47,59,62,${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function glow(ctx, x, y, r, color, a = 0.6) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// ---- text -----------------------------------------------------------------
export function font(kind, size) {
  const f = FONTS[kind] || kind;
  const weight = kind === 'round' ? '600 ' : '';
  return `${weight}${size}px ${f}`;
}

// opt: size, font, color, align, base, stroke, sw, a, r, s, shadow, maxW
export function text(ctx, str, x, y, opt = {}) {
  const { size = 48, font: f = 'hand', color = P.ink, align = 'center', base = 'middle', stroke = null, sw = 8,
    a = 1, r = 0, s = 1, shadow = false, maxW = 0 } = opt;
  if (a <= 0.003 || s <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  if (r) ctx.rotate(r);
  if (s !== 1) ctx.scale(s, s);
  ctx.globalAlpha *= a;
  ctx.font = font(f, size);
  ctx.textAlign = align;
  ctx.textBaseline = base;
  let sc = 1;
  if (maxW) {
    const w = ctx.measureText(str).width;
    if (w > maxW) sc = maxW / w;
    if (sc !== 1) ctx.scale(sc, sc);
  }
  if (shadow) {
    ctx.fillStyle = 'rgba(47,59,62,0.25)';
    ctx.fillText(str, 4, 6);
  }
  if (stroke) {
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke;
    ctx.lineWidth = sw;
    ctx.strokeText(str, 0, 0);
  }
  ctx.fillStyle = color;
  ctx.fillText(str, 0, 0);
  ctx.restore();
}
export function measure(ctx, str, f, size) {
  ctx.save();
  ctx.font = font(f, size);
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}

// Paper label chip with text. opt: size, font, bg, color, pad, r(rotation), s(scale), a
export function tag(ctx, str, x, y, opt = {}) {
  const { size = 44, font: f = 'hand', bg = P.white, color = P.ink, pad = 18, r = 0, s = 1, a = 1, lw = 4, border = P.ink } = opt;
  if (s <= 0.001 || a <= 0.003) return;
  if (opt.sfx !== false) sfx('pop', str);
  const w = measure(ctx, str, f, size) + pad * 2;
  const h = size * 1.15 + pad * 0.6;
  tx(ctx, { x, y, r, s, a }, () => {
    rrect(ctx, -w / 2 + 4, -h / 2 + 6, w, h, h * 0.3, { fill: 'rgba(47,59,62,0.2)', stroke: null, wob: 0 });
    rrect(ctx, -w / 2, -h / 2, w, h, h * 0.3, { fill: bg, stroke: border, lw });
    text(ctx, str, 0, size * 0.04, { size, font: f, color });
  });
  return w;
}

// Rubber-stamp text that slams in. p = 0..1 progress of slam.
export function stamp(ctx, str, x, y, opt = {}) {
  const { size = 90, color = P.red, r = -0.12, p = 1, font: f = 'bold', a = 1, bg = null } = opt;
  if (p <= 0 || a <= 0) return;
  sfx('stamp', str);
  const check = str.endsWith(' ✓');
  if (check) str = str.slice(0, -2);
  const s = lerp(2.2, 1, E.outCubic(clamp(p * 1.3)));
  const al = clamp(p * 3) * a;
  const tw = measure(ctx, str, f, size);
  const w = tw + size * 0.6 + (check ? size * 0.9 : 0);
  const h = size * 1.3;
  tx(ctx, { x, y, r, s, a: al }, () => {
    if (bg) rrect(ctx, -w / 2, -h / 2, w, h, 14, { fill: bg, stroke: null, wob: 0 });
    rrect(ctx, -w / 2, -h / 2, w, h, 14, { fill: null, stroke: color, lw: 9, wob: 2 });
    const off = check ? -size * 0.45 : 0;
    text(ctx, str, off, size * 0.08, { size, font: f, color });
    if (check) {
      const cx = off + tw / 2 + size * 0.5, r = size * 0.32;
      line(ctx, [[cx - r, 0], [cx - r * 0.3, r * 0.7], [cx + r, -r * 0.8]], { color, lw: size * 0.14, wob: 1.5 });
    }
  });
}

export function star(ctx, x, y, r, color = '#EDC468', lw = 3) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  shape(ctx, pts, { fill: color, lw, wob: 0.8 });
}

// Hand-drawn arrow from (x1,y1) to (x2,y2) with a bend. p = draw-on progress.
export function arrow(ctx, x1, y1, x2, y2, opt = {}) {
  const { bend = 0.2, color = P.ink, lw = 6, p = 1, head = 22, a = 1 } = opt;
  if (p <= 0 || a <= 0) return;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const cx = mx - dy * bend, cy = my + dx * bend;
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    pts.push([
      (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2,
      (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2,
    ]);
  }
  const q = partial(pts, p);
  ctx.save();
  ctx.globalAlpha *= a;
  line(ctx, q, { color, lw, wob: 1 });
  if (p > 0.85) {
    const n = q.length;
    const [ex, ey] = q[n - 1];
    const [px, py] = q[Math.max(0, n - 3)];
    const ang = Math.atan2(ey - py, ex - px);
    const hs = head * clamp((p - 0.85) / 0.15);
    line(ctx, [[ex + Math.cos(ang + 2.5) * hs, ey + Math.sin(ang + 2.5) * hs], [ex, ey], [ex + Math.cos(ang - 2.5) * hs, ey + Math.sin(ang - 2.5) * hs]], { color, lw, wob: 1 });
  }
  ctx.restore();
}

// Big red hand-drawn X over a region
export function crossOut(ctx, x, y, r, p = 1, opt = {}) {
  const { color = P.red, lw = 14 } = opt;
  if (p > 0) sfx('scribble', devKey(ctx, x, y));
  const p1 = clamp(p * 2), p2 = clamp(p * 2 - 1);
  if (p1 > 0) line(ctx, [[x - r, y - r], [x + r, y + r]], { color, lw, p: p1, wob: 2 });
  if (p2 > 0) line(ctx, [[x + r, y - r], [x - r, y + r]], { color, lw, p: p2, wob: 2 });
}
export function checkMark(ctx, x, y, r, p = 1, opt = {}) {
  const { color = P.green, lw = 14 } = opt;
  if (p > 0) sfx('ding', devKey(ctx, x, y));
  line(ctx, [[x - r, y], [x - r * 0.3, y + r * 0.7], [x + r, y - r * 0.8]], { color, lw, p, wob: 2 });
}

// Paint-swash underline / highlighter stroke behind titles
export function swash(ctx, x, y, w, h, color, p = 1, seed = 1) {
  if (p <= 0) return;
  const pts = [];
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x + w * t * p, y - h / 2 + Math.sin(t * 7 + seed) * h * 0.08 + (hash2(seed, i) - 0.5) * h * 0.12]);
  }
  for (let i = n; i >= 0; i--) {
    const t = i / n;
    pts.push([x + w * t * p, y + h / 2 + Math.sin(t * 5 + seed * 2) * h * 0.08 + (hash2(seed + 3, i) - 0.5) * h * 0.12]);
  }
  shape(ctx, pts, { fill: color, stroke: null, smooth: true, wob: 1.5 });
}

export function fillScreen(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(-50, -50, W + 100, H + 100);
}

export function vgrad(ctx, y0, y1, stops, x0 = -50, x1 = W + 50) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}
