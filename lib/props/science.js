// Lab glassware and science doodles.
import { tx, shape, line, P, circle, rrect, ellipse, text } from '../engine/draw.js';

// ---- lab glassware -----------------------------------------------------------------------
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

// ---- doodles -----------------------------------------------------------------------------
export function microscope(ctx, x, y, s) {
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
export function atom(ctx, x, y, s, color) {
  tx(ctx, { x, y, s }, () => {
    for (let i = 0; i < 3; i++) ellipse(ctx, 0, 0, 60, 22, { fill: null, stroke: color, lw: 5, rot: (i * Math.PI) / 3 });
    circle(ctx, 0, 0, 10, { fill: color, stroke: null });
  });
}
export function bulbDoodle(ctx, x, y, s, color) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-22, 20], [-34, -14], [-28, -44], [0, -60], [28, -44], [34, -14], [22, 20]], { fill: null, stroke: color, lw: 5, smooth: true });
    line(ctx, [[-16, 30], [16, 30]], { color, lw: 5 });
    line(ctx, [[-12, 42], [12, 42]], { color, lw: 5 });
  });
}
export function planet(ctx, x, y, s, color) {
  tx(ctx, { x, y, s }, () => {
    circle(ctx, 0, 0, 34, { fill: null, stroke: color, lw: 5 });
    ellipse(ctx, 0, 0, 64, 16, { fill: null, stroke: color, lw: 5, rot: -0.35 });
  });
}
export function qmark(ctx, x, y, s, color, r = 0) {
  text(ctx, '?', x, y, { size: 90 * s, font: 'bold', color, r });
}
