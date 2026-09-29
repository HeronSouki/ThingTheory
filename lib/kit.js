// Generic shot helpers shared by every episode: paint-wipe transitions, portal drops,
// dust puffs, sunglasses, sepia / dim overlays, game-style tooltips.
import { W, prog, E, clamp, lerp, H } from './engine/core.js';
import { tx, P, circle, shape, line, baseT, rrect, text } from './engine/draw.js';
import { sfx } from './engine/sfx.js';
import { portal, paintWipe } from './ui.js';

export function wipeShot(at, color, seed = 1, d = 0.35) {
  return { a: at - d, b: at + d, draw(ctx, t) { paintWipe(ctx, (t - (at - d)) / d, color, seed); } };
}

// A character falls out of a portal onto groundY. Returns {y, squash, visible, pose}
export function portalDrop(ctx, t, t0, x, groundY, portalY = 120, draw = true) {
  const pOpen = prog(t, t0, 0.4, E.outBack) * (1 - prog(t, t0 + 1.2, 0.4, E.inBack));
  if (t >= t0) sfx('portal', `${t0}`);
  if (t >= t0 + 0.8) sfx('thud', `${t0}`);
  if (draw && pOpen > 0) portal(ctx, x, portalY, 170, pOpen, t);
  const fall = clamp((t - (t0 + 0.35)) / 0.45);
  const y = lerp(portalY, groundY, E.inQuad(fall));
  const landT = t - (t0 + 0.8);
  let squash = 1;
  if (fall < 1) squash = 1.15;
  else if (landT < 0.35) squash = 1 - Math.sin((landT / 0.35) * Math.PI) * 0.22;
  return { y, squash, visible: t > t0 + 0.35, landed: fall >= 1, landT };
}

export function dustPuff(ctx, x, y, t0, t, s = 1, color = 'rgba(220,210,190,0.85)') {
  const lt = t - t0;
  if (lt < 0 || lt > 0.8) return;
  const k = lt / 0.8;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    const d = E.outCubic(k) * 150 * s;
    circle(ctx, x + Math.cos(a) * d * 1.3, y + Math.sin(a) * d * 0.25 - 10, (30 + i * 3) * s * (1 - k * 0.6), { fill: color, stroke: null, alpha: 1 - k });
  }
}

export function sunglasses(ctx, hy) {
  shape(ctx, [[-60, hy - 12], [60, hy - 12], [58, hy - 4], [-58, hy - 4]], { fill: P.ink, lw: 3 });
  for (const sx of [-24, 24]) shape(ctx, [[sx - 24, hy - 14], [sx + 24, hy - 14], [sx + 20, hy + 12], [sx - 20, hy + 12]], { fill: '#2B3437', lw: 4, smooth: false });
  line(ctx, [[-40, hy - 8], [-28, hy - 8]], { color: 'rgba(255,255,255,0.6)', lw: 4, wob: 0 });
}

export function sepia(ctx, a = 1) {
  ctx.save();
  baseT(ctx);
  ctx.globalAlpha = a;
  ctx.globalCompositeOperation = 'saturation';
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = '#E8C99A';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function dim(ctx, a) {
  if (a <= 0) return;
  ctx.save();
  baseT(ctx);
  ctx.fillStyle = `rgba(35,45,50,${a})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// "TUTORIAL" style game UI tooltip
export function gameTooltip(ctx, x, y, s, title, body) {
  tx(ctx, { x, y, s }, () => {
    rrect(ctx, -330 + 8, -100 + 10, 660, 200, 20, { fill: 'rgba(20,25,30,0.3)', stroke: null, wob: 0 });
    rrect(ctx, -330, -100, 660, 200, 20, { fill: '#2B3437', lw: 5, stroke: P.mustard });
    text(ctx, title, -300, -52, { size: 44, font: 'bold', color: P.mustard, align: 'left' });
    text(ctx, body, -300, 26, { size: 52, font: 'hand', color: P.white, align: 'left' });
  });
}

