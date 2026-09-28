// Shared scene helpers: level cards, portal drops, dust puffs, sunglasses, sepia.
import { P, shape, circle, ellipse, line, tx, text, glow, rrect, baseT } from '../engine/draw.js';
import { W, H, E, clamp, lerp, prog, TAU, hash } from '../engine/core.js';
import { levelCard, portal, survivalClock, paintWipe } from '../ui.js';
import { forestBG, jungleBG, desertBG, oceanBG, arcticBG, waterFront } from '../bg.js';
import { drawPerson } from '../chars/person.js';
import { sfx } from '../engine/sfx.js';

export const LEVELS = {
  forest: { num: 1, name: 'THE FOREST', sub: 'a.k.a. the tutorial level', c1: '#8DB580', c2: '#5E8A5E', skulls: 1, clock: '#6FA062' },
  jungle: { num: 2, name: 'THE AMAZON', sub: 'rainforest', c1: '#6FA37A', c2: '#3F6F55', skulls: 2, clock: '#4F8F63' },
  desert: { num: 3, name: 'THE SAHARA', sub: 'desert', c1: '#EDBE6A', c2: '#D08A4C', skulls: 3, clock: '#D5A143' },
  ocean: { num: 4, name: 'THE PACIFIC', sub: 'middle of the ocean', c1: '#6F9FD0', c2: '#3F5F8E', skulls: 4, clock: '#5F83B3' },
  arctic: { num: 5, name: 'NORTHERN\nCANADA', sub: 'in January', c1: '#9DB7D6', c2: '#6D7FA8', skulls: 5, clock: '#6F86B0', nameSize: 130 },
};

function iconScene(kind) {
  return (ctx, t) => {
    tx(ctx, { s: 0.3, x: -288, y: -190 }, () => {
      if (kind === 'forest') forestBG(ctx, t);
      if (kind === 'jungle') jungleBG(ctx, t, { rain: 0.6 });
      if (kind === 'desert') desertBG(ctx, t);
      if (kind === 'ocean') oceanBG(ctx, t, { horizon: 480 });
      if (kind === 'arctic') arcticBG(ctx, t, { storm: 1 });
      if (kind === 'ocean') {
        drawPerson(ctx, { x: 960, y: 820, s: 1.2, costume: 'greg', pose: 'tread', expr: 'worried', t, id: 5, noShadow: true });
        waterFront(ctx, t, 700);
      } else {
        drawPerson(ctx, { x: 960, y: 900, s: 1.5, costume: 'greg', pose: kind === 'forest' ? 'thumbs' : kind === 'arctic' ? 'hug' : 'stand', expr: kind === 'forest' ? 'smile' : kind === 'arctic' ? 'cold' : kind === 'desert' ? 'hot' : 'worried', t, id: 5, shiver: kind === 'arctic' ? 1 : 0, sweat: kind === 'desert' || kind === 'jungle' ? 1 : 0, tint: kind === 'arctic' ? { c: '#9DB8E0', k: 0.3 } : null });
      }
    });
  };
}

export function levelShot(kind, a, b) {
  const L = LEVELS[kind];
  return {
    a, b,
    draw(ctx, t) {
      levelCard(ctx, t, a, b, { ...L, icon: iconScene(kind) });
    },
  };
}

export function wipeShot(at, color, seed = 1, d = 0.35) {
  return { a: at - d, b: at + d, draw(ctx, t) { paintWipe(ctx, (t - (at - d)) / d, color, seed); } };
}

export function clockShot(kind, a, b, value, sub, opt = {}) {
  const L = LEVELS[kind];
  return { a, b, draw(ctx, t) { survivalClock(ctx, t, a, b, { value, sub, color: L.clock, ...opt }); } };
}

// Greg falls out of a portal. Returns {y, squash, visible, pose}
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

// cute wiggly critter (parasite / bacteria) with a face
export function critter(ctx, x, y, s, t, color, seed = 0, opt = {}) {
  tx(ctx, { x, y, s, r: Math.sin(t * 2 + seed) * 0.3 }, () => {
    const pts = [];
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const r = 40 * (1 + Math.sin(a * 3 + t * 4 + seed) * 0.12);
      pts.push([Math.cos(a) * r * 1.2, Math.sin(a) * r]);
    }
    shape(ctx, pts, { fill: color, lw: 4.5, smooth: true });
    // cilia
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + t;
      line(ctx, [[Math.cos(a) * 48, Math.sin(a) * 40], [Math.cos(a) * 60, Math.sin(a) * 50]], { lw: 3 });
    }
    if (opt.shades) {
      shape(ctx, [[-30, -16], [30, -16], [28, -2], [-28, -2]], { fill: P.ink, lw: 2 });
      for (const sx of [-14, 14]) ellipse(ctx, sx, -6, 12, 9, { fill: '#2B3437', lw: 3 });
    } else {
      circle(ctx, -12, -8, 8, { fill: P.white, lw: 3 });
      circle(ctx, 12, -8, 8, { fill: P.white, lw: 3 });
      circle(ctx, -11, -7, 3.5, { fill: P.ink, stroke: null });
      circle(ctx, 13, -7, 3.5, { fill: P.ink, stroke: null });
    }
    line(ctx, [[-12, 12], [0, 18], [12, 10]], { lw: 3.5, smooth: true });
  });
}
