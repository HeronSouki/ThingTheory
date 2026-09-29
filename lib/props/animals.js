// Animals and critters. Most take (ctx, x, y, s, t, ...): t drives idle motion (wings, legs, tails).
import { TAU, lerp } from '../engine/core.js';
import { tx, line, ellipse, circle, P, shape, rrect, text } from '../engine/draw.js';

// ---- rainforest --------------------------------------------------------------------------
export function jaguar(ctx, x, y, s, t, opt = {}) {
  tx(ctx, { x, y, s, sx: opt.flip ? -1 : 1 }, () => {
    const walk = opt.walk ? Math.sin(t * 8) : 0;
    const legs = [[-110, 1], [-70, -1], [70, 1], [110, -1]];
    for (const [lx, ph] of legs) line(ctx, [[lx, 0], [lx + walk * 18 * ph, 90]], { color: '#E4B25C', lw: 30, outline: 2.5 });
    line(ctx, [[-150, -10], [-230, -40], [-260, -110]], { color: '#E4B25C', lw: 22, outline: 2.5, smooth: true });
    ellipse(ctx, 0, 0, 170, 70, { fill: '#EDC06A', lw: 5 });
    ellipse(ctx, 0, 34, 120, 26, { fill: '#F6E2B8', stroke: null });
    const sp = [[-90, -30], [-40, -40], [10, -30], [60, -40], [100, -20], [-60, 10], [0, 0], [50, 10], [-120, 0]];
    for (const [a, b] of sp) { circle(ctx, a, b, 12, { fill: null, stroke: '#5A4033', lw: 5 }); circle(ctx, a, b, 4, { fill: '#5A4033', stroke: null }); }
    // head
    tx(ctx, { x: 170, y: -40, r: opt.headR || 0 }, () => {
      circle(ctx, -20, -54, 20, { fill: '#EDC06A', lw: 4.5 });
      circle(ctx, 40, -54, 20, { fill: '#EDC06A', lw: 4.5 });
      circle(ctx, 10, 0, 64, { fill: '#EDC06A', lw: 5 });
      ellipse(ctx, 26, 26, 38, 26, { fill: '#F6E2B8', lw: 4 });
      circle(ctx, 30, 14, 9, { fill: '#8C3B35', lw: 3 });
      if (opt.yawn) {
        ellipse(ctx, 26, 40, 22, 20 * opt.yawn + 2, { fill: '#8C3B35', lw: 4 });
      }
      if (opt.bored) {
        line(ctx, [[-14, -14], [8, -14]], { lw: 5 });
        line(ctx, [[34, -14], [56, -14]], { lw: 5 });
      } else if (opt.angry) {
        ellipse(ctx, -2, -12, 11, 12, { fill: P.mustardL, lw: 4 });
        ellipse(ctx, 46, -12, 11, 12, { fill: P.mustardL, lw: 4 });
        line(ctx, [[-2, -20], [-2, -4]], { lw: 5 });
        line(ctx, [[46, -20], [46, -4]], { lw: 5 });
        line(ctx, [[-16, -30], [10, -22]], { lw: 5 });
        line(ctx, [[60, -30], [34, -22]], { lw: 5 });
        shape(ctx, [[0, 40], [14, 66], [26, 44], [38, 66], [50, 40]], { fill: P.white, lw: 3.5 });
      } else {
        circle(ctx, -2, -12, 7, { fill: P.ink, stroke: null });
        circle(ctx, 46, -12, 7, { fill: P.ink, stroke: null });
      }
    });
  });
}
export function anaconda(ctx, x, y, s, t, opt = {}) {
  tx(ctx, { x, y, s, sx: opt.flip ? -1 : 1 }, () => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      pts.push([-300 + u * 520, Math.sin(u * 7 + t * 2) * 40 * (1 - u * 0.3) - u * u * 120]);
    }
    line(ctx, pts, { color: '#7F8F4E', lw: 66, outline: 3, smooth: true });
    for (let i = 1; i < 23; i += 2) circle(ctx, pts[i][0], pts[i][1] - 6, 11, { fill: '#3F4A2A', stroke: null });
    const [hx, hy] = pts[24];
    tx(ctx, { x: hx + 20, y: hy - 30, r: opt.headR || -0.3 }, () => {
      ellipse(ctx, 20, 0, 70, 44, { fill: '#8C9C5A', lw: 5 });
      if (opt.angry) {
        ellipse(ctx, 30, -18, 12, 13, { fill: P.mustardL, lw: 4 });
        line(ctx, [[30, -26], [30, -10]], { lw: 5 });
        line(ctx, [[12, -36], [44, -28]], { lw: 5 });
        const tg = Math.sin(t * 18) * 8;
        line(ctx, [[86, 10], [120, 14 + tg], [130, 4 + tg]], { color: P.red, lw: 5 });
        line(ctx, [[120, 14 + tg], [130, 24 + tg]], { color: P.red, lw: 5 });
      } else if (opt.bored) {
        line(ctx, [[18, -18], [42, -18]], { lw: 5 });
      } else {
        circle(ctx, 30, -16, 7, { fill: P.ink, stroke: null });
      }
      line(ctx, [[50, 18], [84, 14]], { lw: 4 });
    });
  });
}
export function mosquito(ctx, x, y, s, t, opt = {}) {
  tx(ctx, { x, y, s, r: opt.r || 0 }, () => {
    const f = Math.sin(t * 60);
    ellipse(ctx, -10, -40, 50, 18 + f * 8, { fill: 'rgba(220,235,245,0.75)', lw: 3, rot: -0.5 });
    ellipse(ctx, 20, -40, 50, 18 - f * 8, { fill: 'rgba(220,235,245,0.75)', lw: 3, rot: 0.4 });
    for (let i = 0; i < 3; i++) line(ctx, [[-10 + i * 14, 6], [-40 + i * 30, 60], [-60 + i * 40, 90]], { lw: 3.5 });
    ellipse(ctx, -50, 0, 50, 16, { fill: '#6E6460', lw: 4.5, rot: 0.2 });
    for (let i = 0; i < 3; i++) line(ctx, [[-80 + i * 20, -12], [-80 + i * 20, 12]], { color: '#A99E96', lw: 3 });
    circle(ctx, 10, -4, 20, { fill: '#6E6460', lw: 4.5 });
    circle(ctx, 40, -10, 16, { fill: '#6E6460', lw: 4.5 });
    circle(ctx, 46, -14, 6, { fill: P.red, stroke: null });
    line(ctx, [[54, -6], [110, 14]], { lw: 3.5 });
    if (opt.grin) line(ctx, [[34, 0], [44, 4], [52, 0]], { lw: 3 });
    if (opt.suitcase) {
      line(ctx, [[0, 10], [0, 50]], { lw: 3 });
      tx(ctx, { x: 0, y: 70, r: Math.sin(t * 4) * 0.1 }, () => {
        rrect(ctx, -60, -20, 120, 76, 10, { fill: '#8A5A3B', lw: 4.5 });
        rrect(ctx, -18, -34, 36, 18, 6, { fill: null, lw: 4 });
        rrect(ctx, -48, 0, 96, 30, 5, { fill: P.white, lw: 3 });
        text(ctx, 'DISEASE', 0, 16, { size: 22, font: 'bold', color: P.red });
      });
    }
  });
}
export function wasp(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    const f = Math.sin(t * 55);
    ellipse(ctx, -6, -34, 34, 14 + f * 6, { fill: 'rgba(220,235,245,0.75)', lw: 3, rot: -0.6 });
    ellipse(ctx, 16, -34, 34, 14 - f * 6, { fill: 'rgba(220,235,245,0.75)', lw: 3, rot: 0.5 });
    ellipse(ctx, -34, 4, 38, 24, { fill: P.mustard, lw: 4.5 });
    for (let i = 0; i < 3; i++) line(ctx, [[-54 + i * 16, -18], [-54 + i * 16, 24]], { lw: 6 });
    shape(ctx, [[-70, 4], [-96, 10], [-72, 14]], { fill: P.ink, lw: 2 });
    circle(ctx, 12, 0, 14, { fill: P.mustard, lw: 4 });
    circle(ctx, 32, -4, 14, { fill: P.mustard, lw: 4 });
    line(ctx, [[30, -6], [42, -10]], { lw: 4 });
    line(ctx, [[22, -22], [36, -24]], { lw: 3 });
  });
}
export function ant(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) line(ctx, [[-10 + i * 20, 0], [-20 + i * 26, sd * 36 + Math.sin(t * 14 + i) * 5]], { lw: 4 });
    circle(ctx, -50, 0, 26, { fill: '#B8452F', lw: 4.5 });
    circle(ctx, 0, 0, 16, { fill: '#B8452F', lw: 4.5 });
    circle(ctx, 40, 0, 22, { fill: '#B8452F', lw: 4.5 });
    const m = Math.abs(Math.sin(t * 6)) * 0.4;
    line(ctx, [[58, -8], [86, -20 - m * 20], [80, -2]], { lw: 5 });
    line(ctx, [[58, 8], [86, 20 + m * 20], [80, 2]], { lw: 5 });
    circle(ctx, 48, -8, 5, { fill: P.white, stroke: null });
  });
}
export function botfly(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    const f = Math.sin(t * 50);
    ellipse(ctx, -10, -30, 30, 14 + f * 5, { fill: 'rgba(220,235,245,0.75)', lw: 3, rot: -0.5 });
    ellipse(ctx, 14, -30, 30, 14 - f * 5, { fill: 'rgba(220,235,245,0.75)', lw: 3, rot: 0.5 });
    circle(ctx, 0, 0, 34, { fill: '#6F7A8A', lw: 4.5 });
    for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; line(ctx, [[Math.cos(a) * 32, Math.sin(a) * 32], [Math.cos(a) * 42, Math.sin(a) * 42]], { lw: 3 }); }
    circle(ctx, 22, -8, 12, { fill: P.red, lw: 3 });
    // egg bubble
    tx(ctx, { x: 70, y: -60 }, () => {
      shape(ctx, [[-20, 0], [20, 0], [0, 30]], { fill: P.white, lw: 3 });
      circle(ctx, 0, -10, 34, { fill: P.white, lw: 4 });
      ellipse(ctx, 0, -10, 12, 16, { fill: '#F2EAD0', lw: 3 });
    });
  });
}
export function parrot(ctx, x, y, s, t, flip = false) {
  tx(ctx, { x, y, s, sx: flip ? -1 : 1 }, () => {
    shape(ctx, [[-20, 40], [-40, 120], [0, 110], [10, 40]], { fill: P.blueD, lw: 4.5 });
    ellipse(ctx, 0, 0, 44, 62, { fill: P.red, lw: 5 });
    shape(ctx, [[-30, -10], [-50, 40], [-10, 50]], { fill: P.mustard, lw: 4 });
    circle(ctx, 10, -60, 34, { fill: P.red, lw: 5 });
    circle(ctx, 18, -64, 12, { fill: P.white, lw: 3 });
    circle(ctx, 20, -64, 5, { fill: P.ink, stroke: null });
    const o = Math.abs(Math.sin(t * 12)) * 12;
    shape(ctx, [[36, -70], [66, -60], [40, -46]], { fill: '#E8D9B0', lw: 4 });
    shape(ctx, [[38, -46 + o * 0.2], [56, -40 + o], [36, -40 + o * 0.5]], { fill: '#C9B98E', lw: 3.5 });
  });
}
export function frog(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    ellipse(ctx, 0, 0, 70, 44, { fill: '#4FA3D9', lw: 5 });
    for (const [a, b] of [[-30, -10], [10, 10], [30, -14], [-10, 20]]) circle(ctx, a, b, 9, { fill: P.ink, stroke: null });
    circle(ctx, -30, -40, 18, { fill: '#4FA3D9', lw: 4.5 });
    circle(ctx, 30, -40, 18, { fill: '#4FA3D9', lw: 4.5 });
    circle(ctx, -30, -42, 8, { fill: P.ink, stroke: null });
    circle(ctx, 30, -42, 8, { fill: P.ink, stroke: null });
    line(ctx, [[-60, 30], [-90, 50]], { color: '#4FA3D9', lw: 14, outline: 2 });
    line(ctx, [[60, 30], [90, 50]], { color: '#4FA3D9', lw: 14, outline: 2 });
  });
}
export function agouti(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    const k = Math.sin(t * 20);
    line(ctx, [[-40, 20], [-60 + k * 20, 60]], { color: '#9A6B3E', lw: 14, outline: 2 });
    line(ctx, [[40, 20], [60 - k * 20, 60]], { color: '#9A6B3E', lw: 14, outline: 2 });
    ellipse(ctx, 0, 0, 80, 44, { fill: '#B98352', lw: 5 });
    circle(ctx, 70, -20, 30, { fill: '#B98352', lw: 5 });
    circle(ctx, 60, -50, 10, { fill: '#B98352', lw: 4 });
    circle(ctx, 80, -24, 5, { fill: P.ink, stroke: null });
    for (let i = 0; i < 3; i++) line(ctx, [[-100 - i * 30, -20 + i * 20], [-150 - i * 30, -20 + i * 20]], { lw: 4, alpha: 0.6 });
  });
}

// ---- desert ------------------------------------------------------------------------------
export function lizard(ctx, x, y, s, t, walk = 0, flip = false) {
  tx(ctx, { x, y, s, sx: flip ? -1 : 1 }, () => {
    const k = Math.sin(t * 14) * walk;
    for (const [lx, ph] of [[-40, 1], [40, -1]]) {
      line(ctx, [[lx, 0], [lx - 18 + k * 14 * ph, 34]], { color: '#A7B86A', lw: 12, outline: 2 });
      line(ctx, [[lx + 10, 0], [lx + 28 - k * 14 * ph, 34]], { color: '#A7B86A', lw: 12, outline: 2 });
    }
    line(ctx, [[-70, 0], [-160, 10 + Math.sin(t * 3) * 10], [-210, -10]], { color: '#B9C97A', lw: 18, outline: 2.5, smooth: true });
    ellipse(ctx, 0, 0, 80, 28, { fill: '#B9C97A', lw: 5 });
    for (let i = 0; i < 4; i++) circle(ctx, -40 + i * 24, -6, 5, { fill: '#8C9C54', stroke: null });
    ellipse(ctx, 92, -12, 40, 24, { fill: '#B9C97A', lw: 5 });
    circle(ctx, 104, -22, 8, { fill: P.white, lw: 3 });
    circle(ctx, 106, -22, 3.5, { fill: P.ink, stroke: null });
    line(ctx, [[112, -4], [128, -6]], { lw: 3 });
  });
}

// ---- ocean -------------------------------------------------------------------------------
export function sharkFin(ctx, x, y, s, flip = false) {
  tx(ctx, { x, y, s, sx: flip ? -1 : 1 }, () => {
    shape(ctx, [[-60, 0], [10, -130], [30, -120], [60, 0]], { fill: '#7C8B99', lw: 5, smooth: false });
    shape(ctx, [[10, -130], [30, -120], [60, 0], [24, 0]], { fill: '#667482', stroke: null });
    ellipse(ctx, 0, 4, 90, 12, { fill: 'rgba(255,255,255,0.6)', stroke: null });
  });
}
export function shark(ctx, x, y, s, t, opt = {}) {
  tx(ctx, { x, y, s, sx: opt.flip ? -1 : 1 }, () => {
    shape(ctx, [[-200, 0], [-270, -60], [-250, 0], [-270, 60]], { fill: '#7C8B99', lw: 5 });
    shape(ctx, [[-220, 0], [-100, -60], [60, -70], [180, -20], [200, 10], [120, 50], [-80, 50]], { fill: '#8E9DAB', lw: 5, smooth: true });
    shape(ctx, [[-80, 40], [120, 50], [200, 10], [150, 40], [0, 60]], { fill: '#E8EDF0', stroke: null, smooth: true });
    shape(ctx, [[-20, -60], [20, -140], [60, -66]], { fill: '#7C8B99', lw: 5 });
    shape(ctx, [[0, 40], [-40, 100], [40, 50]], { fill: '#7C8B99', lw: 4.5 });
    circle(ctx, 130, -10, 10, { fill: P.ink, stroke: null });
    if (opt.bored) line(ctx, [[118, -18], [142, -18]], { lw: 5 });
    line(ctx, [[130, 30], [180, 20]], { lw: 4 });
  });
}

// ---- camel -------------------------------------------------------------------------------
export function camel(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    const k = Math.sin(t * 6);
    for (const [lx, ph] of [[-80, 1], [-50, -1], [60, 1], [90, -1]]) line(ctx, [[lx, -60], [lx + k * 14 * ph, 60]], { color: '#C9955E', lw: 20, outline: 2.5 });
    shape(ctx, [[-120, -60], [-100, -140], [-50, -170], [-10, -120], [30, -180], [80, -140], [110, -70], [60, -40], [-100, -40]], { fill: '#D9A86A', lw: 5, smooth: true });
    line(ctx, [[100, -90], [160, -160], [190, -170]], { color: '#D9A86A', lw: 34, outline: 3, smooth: true });
    ellipse(ctx, 200, -170, 40, 24, { fill: '#D9A86A', lw: 5 });
    circle(ctx, 208, -180, 5, { fill: P.ink, stroke: null });
    rrect(ctx, -60, -190, 110, 40, 12, { fill: P.coral, lw: 4.5 });
  });
}

// ---- bugs: grub, beetle, worm, ... -------------------------------------------------------
export function bug(ctx, kind, x, y, s, t, seed = 0) {
  tx(ctx, { x, y, s, r: Math.sin(t * 3 + seed) * 0.08 }, () => {
    if (kind === 'beetle') {
      for (let i = -1; i <= 1; i++) for (const sd of [-1, 1]) line(ctx, [[sd * 30, i * 18], [sd * 58, i * 22 + Math.sin(t * 12 + i) * 5]], { lw: 4 });
      ellipse(ctx, 0, 6, 40, 46, { fill: '#4F7A55', lw: 5 });
      line(ctx, [[0, -30], [0, 50]], { lw: 3.5 });
      circle(ctx, 0, -44, 20, { fill: '#2F3B3E', lw: 4 });
      circle(ctx, -8, -46, 5, { fill: P.white, stroke: null });
      circle(ctx, 8, -46, 5, { fill: P.white, stroke: null });
    } else if (kind === 'grub') {
      const pts = [];
      for (let i = 0; i <= 6; i++) pts.push([-60 + i * 20, Math.sin(i * 0.9 + t * 5) * 6]);
      line(ctx, pts, { color: '#F1E1BE', lw: 46, outline: 3, smooth: true });
      for (let i = 1; i < 6; i++) line(ctx, [[-60 + i * 20, -16], [-60 + i * 20, 16]], { color: '#D9C49A', lw: 3 });
      circle(ctx, 62, 0, 18, { fill: '#B8773F', lw: 4 });
      circle(ctx, 66, -4, 4, { fill: P.ink, stroke: null });
    } else {
      // cricket
      line(ctx, [[-20, 10], [-60, -30], [-70, 20]], { lw: 5 });
      line(ctx, [[30, -20], [80, -70]], { lw: 3 });
      line(ctx, [[34, -24], [90, -40]], { lw: 3 });
      ellipse(ctx, 0, 0, 50, 22, { fill: '#8A6A3A', lw: 5 });
      circle(ctx, 42, -6, 16, { fill: '#6E5230', lw: 4 });
      circle(ctx, 48, -10, 4, { fill: P.white, stroke: null });
    }
  });
}

// ---- moth --------------------------------------------------------------------------------
export function moth(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    const f = Math.abs(Math.sin(t * 30));
    ellipse(ctx, -14, -4, 18, 10 * f + 3, { fill: '#C9C1B3', lw: 3, rot: -0.4 });
    ellipse(ctx, 14, -4, 18, 10 * f + 3, { fill: '#C9C1B3', lw: 3, rot: 0.4 });
    ellipse(ctx, 0, 0, 5, 12, { fill: '#8C8272', lw: 3 });
  });
}

// ---- microbes / parasites ----------------------------------------------------------------
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

// ---- dinosaur ----------------------------------------------------------------------------
export function trex(ctx, x, y, s, t) {
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
