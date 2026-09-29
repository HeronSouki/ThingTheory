// Thumbnail toolkit: loud typography and attention devices for YouTube thumbnails.
// Draw in 1920x1080 world units; render/thumbnails.js grades and exports at 1280x720.
import { W, H, TAU } from './engine/core.js';
import { line, P, font, circle } from './engine/draw.js';

// Chunky headline: hard 3D extrude + thick ink outline + fill (reads at 168px wide)
export function headline(ctx, str, x, y, size, fill, opt = {}) {
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

export function vignette(ctx, strength = 0.55, color = '10,15,25') {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(1, `rgba(${color},${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function redCircle(ctx, x, y, rx, ry) {
  const pts = [];
  for (let i = 0; i <= 44; i++) {
    const a = -0.4 + (i / 40) * TAU;
    const k = 1 + (i / 44) * 0.08;
    pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]);
  }
  line(ctx, pts, { color: P.white, lw: 34, smooth: true, wob: 2 });
  line(ctx, pts, { color: '#E8322A', lw: 20, smooth: true, wob: 2 });
}
export function redArrow(ctx, x1, y1, x2, y2, bend = 0.25) {
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

// ---- cold / panic accents --------------------------------------------------------
export function shiverTicks(ctx, x, y, r) {
  for (const sd of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const a = sd < 0 ? Math.PI + (i - 1) * 0.35 : (i - 1) * 0.35;
      const x0 = x + Math.cos(a) * r, y0 = y + Math.sin(a) * r;
      const x1 = x + Math.cos(a) * (r + 60), y1 = y + Math.sin(a) * (r + 60);
      line(ctx, [[x0, y0], [x1, y1]], { color: P.white, lw: 14, outline: 3, wob: 1 });
    }
  }
}
export function breath(ctx, x, y, s) {
  for (let i = 0; i < 3; i++) circle(ctx, x + i * 50 * s, y - i * 18 * s, (26 + i * 12) * s, { fill: 'rgba(245,250,255,0.85)', stroke: null, wob: 1 });
}
