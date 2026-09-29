// Nature props: snow and ice, forest-floor bits, oasis, storms, trees.
import { E, clamp } from '../engine/core.js';
import { tx, P, line, shape, circle, ellipse, rrect } from '../engine/draw.js';
import { bigLeaf, cloud } from '../world/backgrounds.js';

// ---- snow & ice --------------------------------------------------------------------------
export function snowflake(ctx, x, y, r, rot = 0, color = P.white) {
  tx(ctx, { x, y, r: rot }, () => {
    for (let i = 0; i < 3; i++) {
      tx(ctx, { r: (i * Math.PI) / 3 }, () => {
        line(ctx, [[0, -r], [0, r]], { color, lw: r * 0.14, outline: 2 });
        for (const sd of [-1, 1]) {
          line(ctx, [[-r * 0.25, sd * r * 0.7], [0, sd * r * 0.5], [r * 0.25, sd * r * 0.7]], { color, lw: r * 0.1 });
        }
      });
    }
  });
}
export function iceCube(ctx, x, y, s, t, face = true) {
  tx(ctx, { x, y, s, r: Math.sin(t * 2) * 0.05 }, () => {
    shape(ctx, [[-60, -40], [0, -70], [60, -40], [60, 40], [0, 70], [-60, 40]], { fill: '#DCEEF8', lw: 5 });
    shape(ctx, [[-60, -40], [0, -70], [60, -40], [0, -10]], { fill: '#F4FAFD', lw: 3.5 });
    shape(ctx, [[0, -10], [60, -40], [60, 40], [0, 70]], { fill: '#BFDCEB', stroke: null });
    shape(ctx, [[-60, -40], [0, -70], [60, -40], [60, 40], [0, 70], [-60, 40]], { fill: null, lw: 5 });
    if (face) {
      circle(ctx, -22, 16, 5, { fill: P.ink, stroke: null });
      circle(ctx, 16, 10, 5, { fill: P.ink, stroke: null });
      line(ctx, [[-20, 36], [-4, 30], [12, 32]], { lw: 3.5, smooth: true });
    }
  });
}
// snow drift / cave cross-section. cave: 0..1 hollowed amount
export function snowDrift(ctx, x, y, s, t, cave = 0, opt = {}) {
  tx(ctx, { x, y, s }, () => {
    const pts = [[-620, 0], [-520, -180], [-300, -330], [0, -380], [320, -320], [540, -170], [640, 0]];
    shape(ctx, pts, { fill: '#F6FAFC', lw: 6, smooth: true });
    shape(ctx, [[0, -380], [320, -320], [540, -170], [640, 0], [200, 0]], { fill: '#DCE9F2', stroke: null, smooth: true });
    shape(ctx, pts, { fill: null, lw: 6, smooth: true });
    if (opt.face) {
      const a = opt.face;
      tx(ctx, { a }, () => {
        line(ctx, [[-150, -345], [-70, -320]], { lw: 12 });
        line(ctx, [[150, -345], [70, -320]], { lw: 12 });
        circle(ctx, -100, -295, 16, { fill: P.ink, stroke: null });
        circle(ctx, 100, -295, 16, { fill: P.ink, stroke: null });
        line(ctx, [[-60, -235], [0, -255], [60, -235]], { lw: 10, smooth: true });
      });
    }
    if (cave > 0) {
      const c = E.outCubic(clamp(cave));
      ellipse(ctx, 0, -100 * c, 330 * c, 110 * c, { fill: '#9FBFD6', lw: 5 });
      ellipse(ctx, 0, -70 * c, 300 * c, 70 * c, { fill: '#B7D2E4', stroke: null });
      // entrance tunnel
      shape(ctx, [[-640, 0], [-560, -70 * c], [-300, -80 * c], [-300, 0]], { fill: '#9FBFD6', lw: 5 });
    }
  });
}

// ---- forest floor ------------------------------------------------------------------------
export function stump(ctx, x, y, s = 1) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-60, 0], [-50, -110], [50, -110], [60, 0], [80, 10], [-80, 10]], { fill: '#8A6448', lw: 5 });
    shape(ctx, [[10, -110], [50, -110], [60, 0], [80, 10], [20, 10]], { fill: '#6E523E', stroke: null });
    ellipse(ctx, 0, -110, 50, 16, { fill: '#D9B98A', lw: 4.5 });
    ellipse(ctx, 0, -110, 26, 8, { fill: null, stroke: '#B38D63', lw: 3 });
  });
}
export function stream(ctx, t, y0 = 900, h = 120) {
  const top = [], bot = [];
  for (let i = 0; i <= 30; i++) {
    const x = -600 + i * 110;
    top.push([x, y0 + Math.sin(i * 0.7) * 16]);
    bot.unshift([x, y0 + h + Math.sin(i * 0.5 + 1) * 18]);
  }
  shape(ctx, [...top, ...bot], { fill: '#8CBCD8', lw: 5, smooth: true, wob: 0.6 });
  for (let k = 0; k < 7; k++) {
    const ph = ((t * 0.35 + k / 7) % 1);
    const x = -300 + ph * 2600;
    const y = y0 + 25 + (k % 3) * 30;
    line(ctx, [[x, y], [x + 60, y - 4], [x + 120, y]], { color: 'rgba(255,255,255,0.8)', lw: 4, smooth: true });
  }
}
export function cattailPlant(ctx, x, wy, t) {
  const sway = Math.sin(t * 1.4) * 0.03;
  tx(ctx, { x, y: wy, r: sway }, () => {
    for (const [a, l] of [[-0.25, 380], [0.18, 420], [-0.1, 300], [0.3, 330]]) {
      shape(ctx, [[-6, 0], [Math.sin(a) * l, -l], [6 + Math.sin(a) * l * 0.4, -l * 0.4], [8, 0]], { fill: P.sageD, lw: 4, smooth: true });
    }
    line(ctx, [[0, 0], [0, -470]], { color: '#7E9A5E', lw: 10, outline: 2 });
    rrect(ctx, -22, -440, 44, 140, 22, { fill: '#7A4E32', lw: 5 });
    line(ctx, [[0, -440], [0, -500]], { color: '#7E9A5E', lw: 6, outline: 2 });
  });
}
export function potato(ctx, x, y, s, t, face = true) {
  tx(ctx, { x, y, s, r: Math.sin(t * 2) * 0.05 }, () => {
    shape(ctx, [[-70, -10], [-50, -45], [0, -52], [55, -40], [75, 0], [50, 40], [-10, 46], [-60, 30]], { fill: '#D9B27A', lw: 5, smooth: true });
    for (const [a, b] of [[-40, -20], [30, 20], [10, -30], [-20, 26]]) circle(ctx, a, b, 4, { fill: '#B38D63', stroke: null });
    if (face) {
      circle(ctx, -18, -6, 6, { fill: P.ink, stroke: null });
      circle(ctx, 18, -6, 6, { fill: P.ink, stroke: null });
      line(ctx, [[-14, 12], [0, 20], [14, 12]], { lw: 4, smooth: true });
    }
  });
}

// ---- oasis -------------------------------------------------------------------------------
export function oasis(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    ellipse(ctx, 0, 0, 200, 50, { fill: '#8CC4E0', lw: 5 });
    for (const [px, h, a] of [[-120, 260, -0.15], [110, 300, 0.1], [20, 220, 0.05]]) {
      line(ctx, [[px, -10], [px + Math.sin(a) * h, -h]], { color: '#A37A52', lw: 18, outline: 2.5 });
      for (let k = 0; k < 5; k++) bigLeaf(ctx, px + Math.sin(a) * h, -h, 140, -Math.PI / 2 + (k - 2) * 0.7 + Math.PI * (k > 2 ? 0 : 0), '#6FA062', '#4F8250', t, k, { veins: false, width: 0.25 });
    }
  });
}

// ---- storms & tall trees -----------------------------------------------------------------
export function stormCloud(ctx, x, y, s) {
  cloud(ctx, x, y, s, '#6F7890', '#566078');
}
export function bolt(ctx, x, y, s, a = 1) {
  tx(ctx, { x, y, s, a }, () => {
    shape(ctx, [[0, 0], [40, 0], [16, 70], [50, 70], [-20, 190], [0, 100], [-30, 100]], { fill: P.mustardL, lw: 5 });
  });
}
export function tallTree(ctx, x, y, h, t) {
  line(ctx, [[x, y], [x + 10, y - h]], { color: '#8A6448', lw: 40, outline: 3 });
  for (let i = 0; i < 4; i++) circle(ctx, x - 60 + i * 44, y - h - 20 + (i % 2) * 20, 70, { fill: i % 2 ? '#4F8250' : '#6FA062', lw: 5 });
  for (let i = 0; i < 3; i++) circle(ctx, x - 40 + i * 40, y - h + 30, 16, { fill: P.coral, lw: 4 });
}
