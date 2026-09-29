// Buildings and vehicles.
import { hash, TAU } from '../engine/core.js';
import { tx, P, shape, rrect, line, text, circle } from '../engine/draw.js';

// ---- buildings ---------------------------------------------------------------------------
export function house(ctx, x, y, s = 1, color = P.mustard) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-50, -10], [50, -10], [50, 60], [-50, 60]], { fill: P.beige, lw: 5 });
    shape(ctx, [[-70, -6], [0, -70], [70, -6]], { fill: color, lw: 5 });
    rrect(ctx, -14, 20, 28, 40, 6, { fill: '#8A6448', lw: 4 });
  });
}
export function witchHouse(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-110, 0], [110, 0], [100, -150], [-100, -150]], { fill: '#C69F74', lw: 5 });
    shape(ctx, [[-140, -140], [0, -290], [140, -140]], { fill: P.plum, lw: 5 });
    for (let i = 0; i < 5; i++) circle(ctx, -90 + i * 45, -150, 14, { fill: i % 2 ? P.coral : P.white, lw: 3.5 });
    rrect(ctx, -30, -90, 60, 90, 28, { fill: P.plumD, lw: 4.5 });
    rrect(ctx, 50, -120, 40, 40, 6, { fill: P.mustardL, lw: 4 });
    // chimney smoke
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.4 + i / 4) % 1;
      circle(ctx, 70 + Math.sin(ph * 5) * 20, -260 - ph * 180, 18 + ph * 30, { fill: 'rgba(200,190,210,0.7)', stroke: null, alpha: 1 - ph });
    }
    rrect(ctx, 50, -260, 40, 70, 4, { fill: P.beigeD, lw: 4.5 });
    // witch hat on a hook
    shape(ctx, [[-170, -40], [-110, -40], [-135, -140]], { fill: P.ink, lw: 3 });
    line(ctx, [[-185, -40], [-95, -40]], { lw: 8 });
  });
}
export function igloo(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-200, 0], [-190, -90], [-120, -170], [0, -200], [120, -170], [190, -90], [200, 0]], { fill: '#F4F8FB', lw: 6, smooth: true });
    for (let r = 1; r < 4; r++) line(ctx, [[-200 + r * 12, -r * 50], [200 - r * 12, -r * 50]], { color: '#C9DCE8', lw: 4 });
    shape(ctx, [[-70, 0], [-70, -60], [0, -100], [70, -60], [70, 0]], { fill: '#3F4F5C', lw: 5, smooth: true });
  });
}
export function stiltHouse(ctx, x, y, s, c = P.mustardD) {
  tx(ctx, { x, y, s }, () => {
    for (const lx of [-80, 0, 80]) line(ctx, [[lx, 0], [lx, -120]], { color: '#8A6448', lw: 14, outline: 2 });
    rrect(ctx, -110, -240, 220, 130, 8, { fill: '#C69F74', lw: 5 });
    shape(ctx, [[-150, -230], [0, -340], [150, -230]], { fill: c, lw: 5 });
    rrect(ctx, -30, -210, 60, 100, 6, { fill: '#7A5B45', lw: 4 });
  });
}

// ---- vehicles ----------------------------------------------------------------------------
export function helicopter(ctx, x, y, s, t, flip = false) {
  tx(ctx, { x, y, s, sx: flip ? -1 : 1 }, () => {
    line(ctx, [[-60, 70], [80, 70]], { lw: 7 });
    line(ctx, [[-30, 40], [-40, 70]], { lw: 6 });
    line(ctx, [[40, 40], [50, 70]], { lw: 6 });
    shape(ctx, [[-120, -10], [-300, -30], [-310, -60], [-280, -40], [-120, -40]], { fill: P.red, lw: 5 });
    shape(ctx, [[-130, -60], [60, -80], [120, -40], [120, 20], [60, 46], [-110, 40]], { fill: P.red, lw: 6, smooth: true });
    shape(ctx, [[40, -60], [110, -36], [112, 4], [44, 6]], { fill: P.blueL, lw: 5, smooth: true });
    rrect(ctx, -50, -30, 70, 36, 8, { fill: P.white, stroke: null });
    text(ctx, 'RESCUE', -16, -11, { size: 22, font: 'bold', color: P.red });
    line(ctx, [[0, -80], [0, -100]], { lw: 8 });
    const bl = Math.cos(t * 40) * 240;
    line(ctx, [[-bl, -102], [bl, -102]], { lw: 8, color: P.inkL });
    circle(ctx, -300, -45, 26 * Math.abs(Math.sin(t * 40)), { fill: null, lw: 4 });
  });
}
export function canoe(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-200, -20], [200, -20], [150, 30], [-150, 30]], { fill: '#9A6B3E', lw: 5, smooth: true });
    line(ctx, [[60, -120], [120, 40]], { color: '#8A6448', lw: 10, outline: 2 });
  });
}
export function ship(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-300, 0], [300, 0], [260, 80], [-250, 80]], { fill: P.coralD, lw: 5 });
    line(ctx, [[-290, 20], [290, 20]], { color: P.white, lw: 6 });
    const cols = [P.blue, P.mustard, P.sage, P.coral, P.plum];
    for (let i = 0; i < 8; i++) rrect(ctx, -240 + i * 52, -60 - (i % 2) * 50, 50, 60, 4, { fill: cols[i % 5], lw: 4 });
    rrect(ctx, 180, -160, 90, 160, 8, { fill: P.white, lw: 5 });
    for (let i = 0; i < 3; i++) rrect(ctx, 195 + i * 24, -140, 16, 20, 3, { fill: P.blueL, lw: 2.5 });
    line(ctx, [[230, -160], [230, -220]], { lw: 8 });
  });
}
export function plane(ctx, x, y, s, r, split = 0) {
  tx(ctx, { x, y, s, r }, () => {
    const front = (g) => {
      shape(g, [[0, -40], [220, -40], [300, -10], [310, 20], [260, 40], [0, 40]], { fill: '#F2EFE6', lw: 5, smooth: true });
      shape(g, [[250, -30], [290, -12], [262, -6]], { fill: P.blueL, lw: 3.5 });
      for (let i = 0; i < 5; i++) circle(g, 20 + i * 42, -8, 9, { fill: P.blueL, lw: 3 });
      line(g, [[0, 12], [300, 12]], { color: P.blueD, lw: 6 });
      shape(g, [[60, 10], [180, 10], [110, 110], [70, 110]], { fill: '#DCD8CE', lw: 4.5 });
      circle(g, 120, 50, 16, { fill: '#9AA5A8', lw: 4 });
    };
    const back = (g) => {
      shape(g, [[0, -40], [-220, -30], [-300, -110], [-330, -110], [-300, 30], [0, 40]], { fill: '#F2EFE6', lw: 5 });
      line(g, [[0, 12], [-290, 12]], { color: P.blueD, lw: 6 });
      for (let i = 0; i < 4; i++) circle(g, -30 - i * 42, -8, 9, { fill: P.blueL, lw: 3 });
      shape(g, [[-240, 0], [-320, 0], [-330, 40], [-260, 30]], { fill: '#DCD8CE', lw: 4 });
    };
    tx(ctx, { x: split * 60, y: split * 30, r: split * 0.25 }, () => front(ctx));
    tx(ctx, { x: -split * 80, y: split * 60, r: -split * 0.35 }, () => back(ctx));
    if (split > 0) {
      for (let i = 0; i < 6; i++) {
        const a = hash(i) * TAU;
        const d = split * 160;
        rrect(ctx, Math.cos(a) * d, Math.sin(a) * d + split * 60, 20, 12, 3, { fill: '#DCD8CE', lw: 3 });
      }
    }
  });
}
