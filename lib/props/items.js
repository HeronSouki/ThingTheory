// Everyday objects, tools, icons, callouts and price tags.
import { E, clamp, TAU, lerp } from '../engine/core.js';
import { P, tx, shape, line, rrect, circle, star, glow, text, tag, rrectPts, ellipse } from '../engine/draw.js';
import { sparkle } from '../ui.js';

// ---- everyday items ---------------------------------------------------------------
export function knife(ctx, x, y, s = 1, r = 0) {
  tx(ctx, { x, y, s, r }, () => {
    shape(ctx, [[-10, -20], [120, -16], [150, -2], [120, 12], [-10, 12]], { fill: '#DCE3E6', lw: 5 });
    line(ctx, [[0, -2], [120, -2]], { color: '#B8C3C8', lw: 3 });
    rrect(ctx, -90, -18, 90, 34, 14, { fill: '#8A5A3B', lw: 5 });
    circle(ctx, -60, -1, 4, { fill: P.mustardL, lw: 2 });
    circle(ctx, -30, -1, 4, { fill: P.mustardL, lw: 2 });
  });
}
export function lighter(ctx, x, y, s = 1, r = 0, lit = 0, t = 0) {
  tx(ctx, { x, y, s, r }, () => {
    rrect(ctx, -40, -40, 80, 130, 16, { fill: P.coral, lw: 5 });
    rrect(ctx, -40, -70, 80, 36, 8, { fill: '#C4CDD1', lw: 5 });
    circle(ctx, 16, -76, 12, { fill: '#8C969A', lw: 4 });
    line(ctx, [[-20, -40], [-20, 90]], { color: P.coralL, lw: 6 });
    if (lit) flame(ctx, -8, -80, 0.6 * lit, t);
  });
}
export function phone(ctx, x, y, s = 1, r = 0) {
  tx(ctx, { x, y, s, r }, () => {
    rrect(ctx, -55, -100, 110, 200, 18, { fill: '#39434A', lw: 5 });
    rrect(ctx, -44, -84, 88, 160, 8, { fill: '#9FC5DE', stroke: null });
    // "no signal" bars
    for (let i = 0; i < 4; i++) rrect(ctx, -30 + i * 14, -40 - i * 10, 9, 14 + i * 10, 3, { fill: 'rgba(255,255,255,0.6)', stroke: null, wob: 0 });
    circle(ctx, 0, 88, 6, { fill: '#707A80', stroke: null });
  });
}
export function flame(ctx, x, y, s = 1, t = 0) {
  tx(ctx, { x, y, s }, () => {
    const f = Math.sin(t * 17) * 4, g = Math.cos(t * 13) * 3;
    shape(ctx, [[0, 0], [-40, -30], [-30, -80 + f], [-6, -120 + g], [0, -150 - f], [14, -110], [34, -86 + g], [40, -30]], { fill: P.coral, lw: 5, smooth: true });
    shape(ctx, [[0, -6], [-22, -30], [-16, -66], [2, -96 + f], [18, -64], [22, -30]], { fill: P.mustard, stroke: null, smooth: true });
    shape(ctx, [[0, -10], [-10, -28], [0, -56 + g], [10, -28]], { fill: '#FFF3C4', stroke: null, smooth: true });
  });
}
export function campfire(ctx, x, y, s = 1, t = 0, strength = 1) {
  tx(ctx, { x, y, s }, () => {
    glow(ctx, 0, -60, 300, '#FFC870', 0.5 * strength);
    for (const a of [-0.35, 0.35, 0]) {
      tx(ctx, { r: a }, () => rrect(ctx, -80, -14, 160, 28, 12, { fill: '#8A5A3B', lw: 5 }));
    }
    if (strength > 0) flame(ctx, 0, -10, strength, t);
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.8 + i / 4) % 1;
      circle(ctx, Math.sin(ph * 6 + i) * 30, -120 - ph * 160, 5 * (1 - ph), { fill: P.mustard, stroke: null, wob: 0 });
    }
  });
}
export function stick(ctx, x, y, len, r = 0, s = 1, color = '#8A6448') {
  tx(ctx, { x, y, r, s }, () => {
    line(ctx, [[-len / 2, 0], [len / 2, 0]], { color, lw: 16, outline: 2.5 });
    line(ctx, [[-len * 0.1, 0], [-len * 0.02, -26]], { color, lw: 9, outline: 2.5 });
  });
}
export function stone(ctx, x, y, s = 1, c = '#B7AFA3', cD = '#958C80') {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-44, 10], [-40, -18], [-14, -36], [22, -32], [44, -8], [40, 18], [0, 26]], { fill: c, lw: 5, smooth: true });
    shape(ctx, [[22, -32], [44, -8], [40, 18], [0, 26], [10, -4]], { fill: cD, stroke: null, smooth: true });
  });
}
export function jar(ctx, x, y, s = 1, t = 0, label = 'PURE\nDESPERATION') {
  tx(ctx, { x, y, s }, () => {
    glow(ctx, 0, 0, 120, '#C59BE0', 0.4 + Math.sin(t * 4) * 0.1);
    shape(ctx, [[-50, -60], [50, -60], [56, -40], [56, 70], [44, 82], [-44, 82], [-56, 70], [-56, -40]], { fill: 'rgba(214,236,242,0.85)', lw: 5, smooth: true });
    shape(ctx, [[-50, -10], [50, -10], [52, 70], [42, 78], [-42, 78], [-52, 70]], { fill: P.plumL, stroke: null, smooth: true });
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.7 + i / 4) % 1;
      circle(ctx, -30 + i * 20, 60 - ph * 60, 5, { fill: null, stroke: P.plumD, lw: 2.5, alpha: 1 - ph });
    }
    rrect(ctx, -52, -84, 104, 28, 8, { fill: P.beigeD, lw: 5 });
    rrect(ctx, -46, 6, 92, 58, 6, { fill: P.white, lw: 3.5 });
    const ls = label.split('\n');
    ls.forEach((l, i) => text(ctx, l, 0, 22 + i * 24 - (ls.length - 1) * 4, { size: 20, font: 'bold', color: P.plumD }));
  });
}
export function stoneAxe(ctx, x, y, s = 1, r = 0) {
  tx(ctx, { x, y, s, r }, () => {
    line(ctx, [[0, 80], [0, -70]], { color: '#8A6448', lw: 18, outline: 2.5 });
    shape(ctx, [[-10, -80], [60, -96], [80, -60], [60, -30], [-10, -46]], { fill: '#B7AFA3', lw: 5 });
    line(ctx, [[-14, -70], [14, -54]], { color: P.beige, lw: 6 });
    line(ctx, [[-14, -54], [14, -70]], { color: P.beige, lw: 6 });
  });
}

export function tv(ctx, x, y, s, t, content, progress = 0) {
  tx(ctx, { x, y, s }, () => {
    line(ctx, [[-60, 170], [-90, 240]], { lw: 8 });
    line(ctx, [[60, 170], [90, 240]], { lw: 8 });
    rrect(ctx, -250, -170, 500, 340, 30, { fill: '#6E5A4A', lw: 6 });
    rrect(ctx, -220, -145, 440, 270, 16, { fill: '#26323A', lw: 5 });
    ctx.save();
    ctx.beginPath();
    ctx.rect(-214, -139, 428, 258);
    ctx.clip();
    content && content(ctx);
    // scanlines
    ctx.globalAlpha = 0.08;
    for (let i = -140; i < 120; i += 8) { ctx.fillStyle = '#000'; ctx.fillRect(-214, i, 428, 3); }
    ctx.restore();
    // progress bar
    rrect(ctx, -200, 100, 400, 10, 5, { fill: 'rgba(255,255,255,0.3)', stroke: null, wob: 0 });
    rrect(ctx, -200, 100, 400 * progress, 10, 5, { fill: P.red, stroke: null, wob: 0 });
    circle(ctx, 200, 150, 8, { fill: P.mustard, lw: 3 });
  });
}
export function couch(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    rrect(ctx, -260, -170, 520, 150, 40, { fill: P.plum, lw: 6 });
    rrect(ctx, -300, -80, 600, 110, 36, { fill: P.plumL, lw: 6 });
    rrect(ctx, -320, -140, 90, 200, 36, { fill: P.plum, lw: 6 });
    rrect(ctx, 230, -140, 90, 200, 36, { fill: P.plum, lw: 6 });
    line(ctx, [[-260, 60], [-260, 90]], { lw: 12 });
    line(ctx, [[260, 60], [260, 90]], { lw: 12 });
  });
}

// ---- biome icons & mini scenes ---------------------------------------------------------
export function biomeIcon(ctx, kind, x, y, s = 1, t = 0) {
  tx(ctx, { x, y, s }, () => {
    switch (kind) {
      case 'forest':
        shape(ctx, [[-40, 40], [0, -60], [40, 40]], { fill: P.sageD, lw: 5 });
        shape(ctx, [[0, -60], [40, 40], [4, 40]], { fill: P.sageDD, stroke: null });
        line(ctx, [[0, 40], [0, 60]], { lw: 10, color: '#7A5B45', outline: 2 });
        break;
      case 'jungle':
        for (let i = 0; i < 5; i++) {
          tx(ctx, { r: -1.9 + i * 0.45 }, () => {
            shape(ctx, [[0, 0], [30, -16], [70, -10], [30, 10]], { fill: i % 2 ? '#4F8250' : '#6FA062', lw: 4, smooth: true });
          });
        }
        circle(ctx, 0, 0, 10, { fill: '#7A5B45', lw: 4 });
        break;
      case 'desert':
        circle(ctx, 24, -30, 28, { fill: P.mustard, lw: 4.5 });
        shape(ctx, [[-70, 50], [-20, 0], [20, 20], [70, 50]], { fill: P.sand, lw: 5, smooth: true });
        break;
      case 'ocean':
        for (let k = 0; k < 2; k++) {
          const pts = [];
          for (let i = 0; i <= 10; i++) pts.push([-60 + i * 12, -10 + k * 34 + Math.sin(i * 1.3 + t * 3) * 8]);
          line(ctx, pts, { color: P.blueD, lw: 10, smooth: true, outline: 2 });
        }
        break;
      case 'arctic':
        for (let i = 0; i < 3; i++) {
          tx(ctx, { r: (i * Math.PI) / 3 }, () => {
            line(ctx, [[0, -56], [0, 56]], { color: P.blueD, lw: 9, outline: 2 });
            line(ctx, [[-14, -40], [0, -28], [14, -40]], { color: P.blueD, lw: 6 });
            line(ctx, [[-14, 40], [0, 28], [14, 40]], { color: P.blueD, lw: 6 });
          });
        }
        break;
    }
  });
}

// rule-of-three icons
export function lungs(ctx, x, y, s = 1, t = 0) {
  const br = 1 + Math.sin(t * 3) * 0.05;
  tx(ctx, { x, y, s: s * br }, () => {
    line(ctx, [[0, -60], [0, -10]], { lw: 10, color: P.coralD, outline: 2 });
    for (const sd of [-1, 1]) {
      shape(ctx, [[sd * 12, -20], [sd * 30, -50], [sd * 56, -40], [sd * 66, 10], [sd * 60, 50], [sd * 20, 56], [sd * 12, 20]], { fill: P.coral, lw: 5, smooth: true });
    }
  });
}
export function waterDrop(ctx, x, y, s = 1, color = P.blue) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[0, -70], [30, -20], [44, 14], [30, 46], [0, 58], [-30, 46], [-44, 14], [-30, -20]], { fill: color, lw: 5, smooth: true });
    shape(ctx, [[-20, 10], [-24, 30], [-12, 40]], { fill: null, stroke: P.white, lw: 6, closed: false, smooth: true });
  });
}
export function drumstick(ctx, x, y, s = 1) {
  tx(ctx, { x, y, s, r: -0.6 }, () => {
    line(ctx, [[0, 10], [0, 70]], { color: P.white, lw: 18, outline: 2.5 });
    circle(ctx, -10, 76, 12, { fill: P.white, lw: 4 });
    circle(ctx, 10, 76, 12, { fill: P.white, lw: 4 });
    shape(ctx, [[-40, -10], [-30, -50], [0, -64], [30, -50], [40, -10], [16, 20], [-16, 20]], { fill: '#C9844F', lw: 5, smooth: true });
    shape(ctx, [[10, -54], [30, -40], [34, -12], [18, -30]], { fill: '#E3A66E', stroke: null, smooth: true });
  });
}

// generic label-with-arrow callout
export function callout(ctx, str, tx0, ty0, px, py, p, opt = {}) {
  if (p <= 0) return;
  const s = E.outBack(clamp(p * 1.6));
  tag(ctx, str, tx0, ty0, { size: opt.size || 48, s, r: opt.r || 0, bg: opt.bg || P.white, color: opt.color || P.ink, font: opt.font || 'hand' });
  const ap = clamp(p * 1.6 - 0.4);
  if (ap > 0) {
    const dx = px - tx0, dy = py - ty0;
    const L = Math.hypot(dx, dy);
    const sx = tx0 + (dx / L) * (opt.gap || 70), sy = ty0 + (dy / L) * (opt.gap || 50);
    const ex = px - (dx / L) * 14, ey = py - (dy / L) * 14;
    arrowLine(ctx, sx, sy, ex, ey, ap, opt.bend ?? 0.2);
  }
}
function arrowLine(ctx, x1, y1, x2, y2, p, bend) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const cx = mx - dy * bend, cy = my + dx * bend;
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const t = (i / 14) * p;
    pts.push([(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2]);
  }
  line(ctx, pts, { lw: 6 });
  if (p > 0.9) {
    const [ex, ey] = pts[pts.length - 1];
    const [qx, qy] = pts[pts.length - 3];
    const a = Math.atan2(ey - qy, ex - qx);
    line(ctx, [[ex + Math.cos(a + 2.5) * 20, ey + Math.sin(a + 2.5) * 20], [ex, ey], [ex + Math.cos(a - 2.5) * 20, ey + Math.sin(a - 2.5) * 20]], { lw: 6 });
  }
}

// price tag
export function priceTag(ctx, x, y, s, str = 'SALE!', r = 0.2) {
  tx(ctx, { x, y, s, r }, () => {
    shape(ctx, [[-70, -40], [70, -40], [110, 0], [70, 40], [-70, 40]], { fill: P.mustard, lw: 5 });
    circle(ctx, 80, 0, 8, { fill: P.paper, lw: 3 });
    text(ctx, str, -4, 4, { size: 44, font: 'bold', color: P.redD });
  });
}

// hand (for finger-colour stages) pointing up; c = skin colour
export function bigHand(ctx, x, y, s, c, cD, opt = {}) {
  tx(ctx, { x, y, s, r: opt.r || 0 }, () => {
    const fingers = [[-62, -150, 26], [-22, -178, 26], [18, -172, 25], [54, -140, 23]];
    for (const [fx, fy, w] of fingers) {
      shape(ctx, rrectPts(fx - w / 2 - 2, fy, w + 4, 200, w / 2 + 2), { fill: opt.fingerC || c, lw: 5 });
      if (opt.frost) line(ctx, [[fx - 6, fy + 16], [fx + 6, fy + 10]], { color: P.white, lw: 5 });
    }
    shape(ctx, [[-80, -30], [76, -40], [84, 60], [60, 130], [-60, 130], [-86, 60]], { fill: c, lw: 5, smooth: true });
    shape(ctx, [[-80, 20], [-130, -40], [-150, -60], [-126, -80], [-90, -40], [-60, -10]], { fill: opt.fingerC || c, lw: 5, smooth: true });
    shape(ctx, [[20, -30], [76, -40], [84, 60], [60, 130], [30, 130]], { fill: cD, stroke: null, smooth: true, alpha: 0.6 });
    shape(ctx, [[-80, -30], [76, -40], [84, 60], [60, 130], [-60, 130], [-86, 60]], { fill: null, lw: 5, smooth: true });
  });
}

// crossed-out icon badge
export function noBadge(ctx, x, y, r, p = 1) {
  if (p <= 0) return;
  circle(ctx, x, y, r, { fill: null, stroke: P.red, lw: 12 * clamp(p * 2), alpha: clamp(p * 2) });
  if (p > 0.4) line(ctx, [[x - r * 0.7, y - r * 0.7], [x + r * 0.7, y + r * 0.7]], { color: P.red, lw: 12, p: clamp((p - 0.4) / 0.6) });
}

// lemniscate "infinity" sign drawn as a thick outlined stroke
export function infinity(ctx, x, y, s = 1, color = P.greenD) {
  if (s <= 0) return;
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * TAU;
    const d = 1 + Math.sin(a) * Math.sin(a);
    pts.push([(Math.cos(a) / d) * 70, ((Math.sin(a) * Math.cos(a)) / d) * 70]);
  }
  tx(ctx, { x, y, s }, () => {
    line(ctx, pts, { color: P.white, lw: 34, wob: 0.6, smooth: true });
    line(ctx, pts, { color, lw: 18, outline: 3, smooth: true, wob: 0.6 });
  });
}

// ---- water bottle, stomach, field guide --------------------------------------------------
export function bottle(ctx, x, y, s, level) {
  tx(ctx, { x, y, s }, () => {
    const body = [[-50, -150], [50, -150], [56, -120], [56, 100], [44, 118], [-44, 118], [-56, 100], [-56, -120]];
    shape(ctx, body, { fill: 'rgba(225,240,248,0.9)', lw: 5, smooth: true });
    const top = lerp(110, -130, clamp(level));
    ctx.save();
    ctx.beginPath();
    ctx.rect(-60, top, 120, 240);
    ctx.clip();
    shape(ctx, body, { fill: P.blue, stroke: null, smooth: true });
    ctx.restore();
    line(ctx, [[-54, top], [54, top]], { color: P.blueD, lw: 4 });
    shape(ctx, body, { fill: null, lw: 5, smooth: true });
    rrect(ctx, -30, -200, 60, 50, 10, { fill: P.coral, lw: 5 });
    rrect(ctx, -46, -40, 92, 60, 8, { fill: P.white, lw: 3.5 });
    text(ctx, '1 L', 0, -8, { size: 40, font: 'bold', color: P.blueDD });
  });
}
export function stomach(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    line(ctx, [[-40, -220], [-40, -130]], { color: P.coralL, lw: 40, outline: 3 });
    shape(ctx, [[-60, -140], [40, -150], [130, -80], [140, 40], [60, 120], [-60, 110], [-40, 40], [-100, 0], [-80, -80]], { fill: P.coralL, lw: 6, smooth: true });
    for (let i = 0; i < 3; i++) circle(ctx, -10 + i * 40, 10 + (i % 2) * 30, 20, { fill: P.mustardD, lw: 3.5 });
    for (let i = 0; i < 5; i++) {
      const ph = (t * 0.7 + i / 5) % 1;
      const a = i * 1.25;
      const r = lerp(260, 60, ph);
      const px = Math.cos(a) * r + 20, py = Math.sin(a) * r;
      tx(ctx, { x: px, y: py, s: 0.5 + (1 - ph) * 0.3, a: Math.sin(ph * Math.PI) }, () => {
        shape(ctx, [[0, -30], [20, 0], [14, 20], [0, 26], [-14, 20], [-20, 0]], { fill: P.blue, lw: 4, smooth: true });
      });
    }
  });
}
export function manual(ctx, x, y, s, open) {
  tx(ctx, { x, y, s }, () => {
    if (open < 0.5) {
      rrect(ctx, -180, -240, 360, 480, 16, { fill: '#6F7A4E', lw: 6 });
      rrect(ctx, -140, -150, 280, 150, 10, { fill: '#E9E2C8', lw: 4 });
      text(ctx, 'SURVIVAL', 0, -106, { size: 48, font: 'bold', color: '#4A5234' });
      text(ctx, 'FIELD GUIDE', 0, -48, { size: 38, font: 'bold', color: '#4A5234' });
      star(ctx, 0, 110, 50, P.mustard);
    } else {
      rrect(ctx, -380, -240, 760, 480, 16, { fill: '#6F7A4E', lw: 6 });
      rrect(ctx, -360, -220, 350, 440, 8, { fill: '#F4EEDA', lw: 4 });
      rrect(ctx, 10, -220, 350, 440, 8, { fill: '#F4EEDA', lw: 4 });
      for (let i = 0; i < 9; i++) {
        line(ctx, [[-330, -180 + i * 44], [-40 - (i % 3) * 40, -180 + i * 44]], { color: '#BDB59A', lw: 6 });
      }
    }
  });
}

// ---- remote, signpost --------------------------------------------------------------------
export function remote(ctx, x, y, s, pressed) {
  tx(ctx, { x, y, s, r: -0.2 }, () => {
    rrect(ctx, -34, -40, 68, 110, 14, { fill: '#46525A', lw: 5 });
    circle(ctx, 0, -8 + (pressed ? 4 : 0), 22, { fill: P.red, lw: 5 });
    line(ctx, [[-12, 40], [12, 40]], { color: P.mustard, lw: 5 });
  });
}
export function signpost(ctx, x, y, s, str) {
  tx(ctx, { x, y, s }, () => {
    line(ctx, [[0, 0], [0, -300]], { color: '#8A6448', lw: 22, outline: 2.5 });
    shape(ctx, [[40, -300], [-230, -300], [-270, -260], [-230, -220], [40, -220]], { fill: '#C69F74', lw: 5 });
    text(ctx, str, -110, -258, { size: 50, font: 'marker', color: P.ink });
  });
}

// ---- clipboard, bell curve, chalkboard ---------------------------------------------------
export function clipboard(ctx, x, y, s, r, lines, p) {
  tx(ctx, { x, y, s, r }, () => {
    rrect(ctx, -250 + 10, -330 + 14, 500, 660, 26, { fill: 'rgba(20,25,30,0.25)', stroke: null, wob: 0 });
    rrect(ctx, -250, -330, 500, 660, 26, { fill: '#B98E66', lw: 6 });
    rrect(ctx, -215, -280, 430, 580, 10, { fill: P.white, lw: 5 });
    rrect(ctx, -90, -355, 180, 70, 16, { fill: '#9AA5A8', lw: 5 });
    text(ctx, 'THE RULES', 0, -210, { size: 64, font: 'bold', color: P.coralD });
    lines.forEach((l, i) => {
      const lp = clamp(p * lines.length - i);
      if (lp <= 0) return;
      text(ctx, l, -180, -120 + i * 80, { size: 44, font: 'hand', color: P.ink, align: 'left', a: lp });
      line(ctx, [[-180, -90 + i * 80], [180, -90 + i * 80]], { color: 'rgba(95,131,179,0.35)', lw: 2, wob: 0.3 });
    });
  });
}
export function bellCurve(ctx, x, y, w, h, p) {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const u = (i / 60) * 2 - 1;
    pts.push([x + u * w / 2, y - Math.exp(-u * u * 5) * h]);
  }
  const vis = pts.slice(0, Math.max(2, Math.floor(pts.length * p)));
  shape(ctx, [...vis, [vis[vis.length - 1][0], y], [x - w / 2, y]], { fill: P.blueL, stroke: null, wob: 0.6 });
  line(ctx, vis, { lw: 7, color: P.blueDD, smooth: true });
  line(ctx, [[x - w / 2 - 30, y], [x + w / 2 + 30, y]], { lw: 6 });
}
export function chalkboard(ctx, x, y, w, h, fn) {
  rrect(ctx, x - w / 2 - 22, y - h / 2 - 22, w + 44, h + 44, 14, { fill: '#8A6448', lw: 6 });
  rrect(ctx, x - w / 2, y - h / 2, w, h, 8, { fill: '#3D5A4C', lw: 4 });
  fn && fn(ctx);
}

// ---- credit card, light bulb, cup, jeans -------------------------------------------------
export function creditCard(ctx, x, y, s, color, label, r = 0) {
  tx(ctx, { x, y, s, r }, () => {
    rrect(ctx, -200, -125, 400, 250, 26, { fill: color, lw: 6 });
    rrect(ctx, -160, -60, 70, 50, 8, { fill: P.mustardL, lw: 4 });
    text(ctx, '**** **** **** 1234', 0, 40, { size: 30, font: 'round', color: P.white });
    text(ctx, label, 0, -95, { size: 36, font: 'bold', color: P.white });
  });
}
export function lightBulb(ctx, x, y, s, on) {
  tx(ctx, { x, y, s }, () => {
    if (on > 0.5) glow(ctx, 0, -20, 180, '#FFE9A0', 0.8);
    shape(ctx, [[-40, 20], [-60, -30], [-50, -80], [0, -110], [50, -80], [60, -30], [40, 20]], { fill: on > 0.5 ? P.mustardL : '#D9D4C8', lw: 5, smooth: true });
    rrect(ctx, -34, 18, 68, 40, 8, { fill: '#9AA5A8', lw: 5 });
    line(ctx, [[-14, 0], [-8, -40], [0, -20], [8, -40], [14, 0]], { lw: 3.5 });
  });
}
export function cup(ctx, x, y, s, fill, label) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-70, -90], [70, -90], [54, 90], [-54, 90]], { fill: 'rgba(230,242,245,0.9)', lw: 5 });
    shape(ctx, [[-62, -40], [62, -40], [54, 90], [-54, 90]], { fill, stroke: null });
    shape(ctx, [[-70, -90], [70, -90], [54, 90], [-54, 90]], { fill: null, lw: 5 });
    if (label) text(ctx, label, 0, 150, { size: 50, font: 'bold' });
  });
}
export function jeans(ctx, x, y, s, r = 0, state = 'flat', t = 0) {
  tx(ctx, { x, y, s, r }, () => {
    const puff = state === 'inflated' ? 1 : 0;
    for (const sd of [-1, 1]) {
      const w = 36 + puff * 16;
      const pts = [[sd * 8, -60], [sd * (8 + w * 2), -60], [sd * (14 + w * 2), 150], [sd * 14, 150]];
      shape(ctx, pts, { fill: '#5F82B4', lw: 5, smooth: puff > 0 });
      line(ctx, [[sd * (18 + w), -40], [sd * (22 + w), 140]], { color: '#8FAAD0', lw: 3, dash: [8, 8] });
      if (state !== 'flat') {
        // knot at the cuff
        circle(ctx, sd * (14 + w), 162, 18, { fill: '#46679A', lw: 4.5 });
        line(ctx, [[sd * (4 + w), 176], [sd * (-6 + w), 196]], { color: '#46679A', lw: 8, outline: 2 });
      }
    }
    rrect(ctx, -86 - puff * 30, -90, 172 + puff * 60, 36, 8, { fill: '#46679A', lw: 5 });
    circle(ctx, 0, -72, 7, { fill: P.mustard, lw: 3 });
    if (puff) for (let i = 0; i < 3; i++) sparkle(ctx, -60 + i * 60, -120 + (i % 2) * 20, 12 * Math.abs(Math.sin(t * 4 + i)), P.white);
  });
}

// ---- book, tombstone, heart --------------------------------------------------------------
export function book(ctx, x, y, s, t) {
  tx(ctx, { x, y, s, r: Math.sin(t * 2) * 0.05 }, () => {
    glow(ctx, 0, 0, 140, '#FFE9A0', 0.8);
    shape(ctx, [[-90, -60], [0, -40], [90, -60], [90, 60], [0, 80], [-90, 60]], { fill: P.white, lw: 5 });
    line(ctx, [[0, -40], [0, 80]], { lw: 4 });
    for (let i = 0; i < 3; i++) { line(ctx, [[-70, -20 + i * 26], [-20, -10 + i * 26]], { color: P.inkL, lw: 3 }); line(ctx, [[20, -10 + i * 26], [70, -20 + i * 26]], { color: P.inkL, lw: 3 }); }
  });
}
export function tombstone(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-110, 0], [-110, -200], [-80, -260], [0, -290], [80, -260], [110, -200], [110, 0]], { fill: '#B7B4AC', lw: 6, smooth: true });
    shape(ctx, [[40, -280], [80, -260], [110, -200], [110, 0], [60, 0]], { fill: '#9C9990', stroke: null, smooth: true });
    text(ctx, 'R.I.P.', 0, -200, { size: 46, font: 'bold', color: P.inkL });
    text(ctx, 'GREG', 0, -130, { size: 56, font: 'marker', color: P.ink });
    text(ctx, 'he tried', 0, -70, { size: 40, font: 'hand', color: P.inkL });
    ellipse(ctx, 0, 6, 170, 26, { fill: '#8DB07A', lw: 4 });
  });
}
export function heart(ctx, x, y, s, color = P.coral) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[0, 30], [-40, -4], [-44, -30], [-22, -44], [0, -26], [22, -44], [44, -30], [40, -4]], { fill: color, lw: 4, smooth: true });
  });
}

// ---- plate -------------------------------------------------------------------------------
export function plate(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    ellipse(ctx, 6, 14, 250, 80, { fill: 'rgba(20,25,30,0.2)', stroke: null, wob: 0 });
    ellipse(ctx, 0, 0, 250, 80, { fill: P.white, lw: 6 });
    ellipse(ctx, 0, 0, 180, 54, { fill: null, stroke: '#D9D3C6', lw: 4 });
  });
}
