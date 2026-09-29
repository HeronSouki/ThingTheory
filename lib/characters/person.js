// One flexible cartoon rig used for Greg, the Thing Theory scientist and every side character.
// Local units: feet at (0,0), character ~340 units tall at scale 1.
import { lerp, TAU, DEG, mix, hash, clamp } from '../engine/core.js';
import { P, line, tx, wobble, tracePath, shape, softShadow, text, circle, ellipse, ellipsePts } from '../engine/draw.js';

export const COSTUMES = {
  greg: {
    hair: { style: 'greg', color: '#5A4033', light: '#77553F' },
    shirt: { color: '#E57F6E', dark: '#C9624F', sleeve: 'short' },
    pants: { color: '#5F82B4', dark: '#46679A' },
    shoes: { style: 'sneaker', color: '#FBF8F1', accent: '#E57F6E' },
    tag: false,
  },
  scientist: {
    hair: { style: 'spiky', color: '#8A5A3B', light: '#B07A52' },
    goggles: true,
    shirt: { color: '#46525A', dark: '#374148', sleeve: 'long' },
    coat: { color: '#F8F5EE', dark: '#DDD6C8' },
    pants: { color: '#7B5C42', dark: '#63493A' },
    shoes: { style: 'boot', color: '#5B4637' },
  },
  juliane: {
    hair: { style: 'long', color: '#6B4A33', light: '#8A6446' },
    shirt: { color: '#EDE3CF', dark: '#D4C6AA', sleeve: 'short' },
    dress: { color: '#9CBB90', dark: '#7FA273' },
    pants: { color: '#F5CBA8', dark: '#E2A985' },
    shoes: { style: 'sandal', color: '#9A6B4A' },
  },
  inuit: {
    hair: { style: 'none', color: '#2C2522' },
    hood: { color: '#8C5E43', fur: '#EFE6D6', furD: '#D2C4AA' },
    shirt: { color: '#8C5E43', dark: '#6F4A34', sleeve: 'long' },
    parka: true,
    pants: { color: '#6F4A34', dark: '#5B3C2A' },
    shoes: { style: 'boot', color: '#EFE6D6' },
    skin: '#E0AE89', skinD: '#C98F6C',
  },
  tuareg: {
    hair: { style: 'none', color: '#222' },
    wrap: { color: '#3F5FA0', dark: '#2E4A82' },
    shirt: { color: '#4F6FB0', dark: '#3D5A94', sleeve: 'long' },
    robe: { color: '#EFE7D6', dark: '#D6CBB4' },
    pants: { color: '#EFE7D6', dark: '#D6CBB4' },
    shoes: { style: 'sandal', color: '#8A5E3C' },
    skin: '#B97E58', skinD: '#9C6545',
  },
  villager: {
    hair: { style: 'short', color: '#1F1A18', light: '#3A302B' },
    shirt: { color: '#EDC468', dark: '#D5A143', sleeve: 'short' },
    pants: { color: '#8E6D8E', dark: '#6F5372' },
    shoes: { style: 'bare', color: '#C08A63' },
    skin: '#C68D63', skinD: '#A8704A',
  },
  villager2: {
    hair: { style: 'long', color: '#1F1A18', light: '#3A302B' },
    shirt: { color: '#E8877A', dark: '#CC6557', sleeve: 'short' },
    dress: { color: '#E8877A', dark: '#CC6557' },
    pants: { color: '#C68D63', dark: '#A8704A' },
    shoes: { style: 'bare', color: '#C08A63' },
    skin: '#C68D63', skinD: '#A8704A',
  },
  soldier: {
    hair: { style: 'short', color: '#4A3A2E' },
    helmet: { color: '#7D7A5A', dark: '#626046' },
    shirt: { color: '#8C8660', dark: '#716C4B', sleeve: 'long' },
    pants: { color: '#7D7856', dark: '#635F43' },
    shoes: { style: 'boot', color: '#4A3A2E' },
  },
  sailor: {
    hair: { style: 'short', color: '#3B2C24' },
    cap: { color: '#FBF8F1' },
    shirt: { color: '#FBF8F1', dark: '#DCD8CE', sleeve: 'long' },
    collar: '#3F5F8E',
    pants: { color: '#3F5F8E', dark: '#324C73' },
    shoes: { style: 'boot', color: '#2F3B3E' },
  },
  caveman: {
    hair: { style: 'shaggy', color: '#4A3428', light: '#664835' },
    shirt: { color: '#B98B5E', dark: '#9A7049', sleeve: 'none' },
    pants: { color: '#B98B5E', dark: '#9A7049' },
    shoes: { style: 'bare', color: '#E2A985' },
    skin: '#E0AE89', skinD: '#C98F6C',
  },
  kid: {
    hair: { style: 'short', color: '#6B4A33', light: '#8A6446' },
    shirt: { color: '#86A8D0', dark: '#5F83B3', sleeve: 'short' },
    pants: { color: '#8E6D8E', dark: '#6F5372' },
    shoes: { style: 'sneaker', color: '#FBF8F1', accent: '#86A8D0' },
  },
  elder: {
    hair: { style: 'bun', color: '#D9D6D0', light: '#F1EFEA' },
    shirt: { color: '#937094', dark: '#6F5372', sleeve: 'long' },
    dress: { color: '#937094', dark: '#6F5372' },
    pants: { color: '#6F5372', dark: '#5A4260' },
    shoes: { style: 'boot', color: '#5B4637' },
  },
};
// the channel mascot as on the profile picture: goggles pushed up so the eyebrows can act
COSTUMES.mascot = { ...COSTUMES.scientist, goggles: 'up' };

export const EXPR = {
  neutral: { eyes: 'open', brows: [0, 0], mouth: 'neutral' },
  smile: { eyes: 'open', brows: [0.1, 0.1], mouth: 'smile' },
  happy: { eyes: 'happy', brows: [0.25, 0.25], mouth: 'grin' },
  grin: { eyes: 'open', brows: [0.2, 0.2], mouth: 'grin' },
  worried: { eyes: 'open', brows: [0.6, 0.6], browTilt: 1, mouth: 'wavy' },
  scared: { eyes: 'wide', brows: [0.7, 0.7], browTilt: 1, mouth: 'teeth' },
  shocked: { eyes: 'wide', brows: [0.8, 0.8], mouth: 'open' },
  surprised: { eyes: 'wide', brows: [0.7, 0.7], mouth: 'o' },
  disgusted: { eyes: 'squint', brows: [-0.3, -0.3], browTilt: -1, mouth: 'wavy', sick: 0.35 },
  deadpan: { eyes: 'half', brows: [0, 0], mouth: 'flat' },
  sad: { eyes: 'open', brows: [0.5, 0.5], browTilt: 1, mouth: 'frown' },
  determined: { eyes: 'open', brows: [-0.2, -0.2], browTilt: -1, mouth: 'smirk' },
  angry: { eyes: 'open', brows: [-0.4, -0.4], browTilt: -1.2, mouth: 'frown' },
  cold: { eyes: 'squint', brows: [0.5, 0.5], browTilt: 1, mouth: 'teeth' },
  hot: { eyes: 'half', brows: [0.4, 0.4], browTilt: 0.8, mouth: 'tongue' },
  sleep: { eyes: 'closed', brows: [0, 0], mouth: 'o' },
  dead: { eyes: 'x', brows: [0, 0], mouth: 'flat' },
  dizzy: { eyes: 'spiral', brows: [0.4, 0.4], mouth: 'wavy' },
  thinking: { eyes: 'open', look: [0.5, -0.9], brows: [0.35, -0.1], mouth: 'smirk' },
  proud: { eyes: 'happy', brows: [0.3, 0.3], mouth: 'smile' },
  nervous: { eyes: 'open', brows: [0.55, 0.55], browTilt: 1, mouth: 'teeth' },
  exhausted: { eyes: 'half', brows: [0.5, 0.5], browTilt: 1, mouth: 'o' },
};

export const POSES = {
  stand: { aL: [12, -8], aR: [12, -8], lL: [4, 0], lR: [4, 0] },
  relaxed: { aL: [8, -4], aR: [8, -4], lL: [3, 0], lR: [3, 0] },
  wave: { aL: [12, -8], aR: [125, 35], lL: [4, 0], lR: [4, 0] },
  armsUp: { aL: [150, 10], aR: [150, 10], lL: [8, 0], lR: [8, 0] },
  panic: { aL: [135, 30], aR: [135, 30], lL: [10, 0], lR: [10, 0] },
  shrug: { aL: [55, 80], aR: [55, 80], lL: [4, 0], lR: [4, 0] },
  hips: { aL: [40, -105], aR: [40, -105], lL: [7, 0], lR: [7, 0] },
  point: { aL: [12, -8], aR: [95, 0], lL: [4, 0], lR: [4, 0] },
  pointUp: { aL: [12, -8], aR: [150, 15], lL: [4, 0], lR: [4, 0] },
  thumbs: { aL: [12, -8], aR: [45, 95], lL: [4, 0], lR: [4, 0], handR: 'thumb' },
  hug: { aL: [30, -120], aR: [30, -120], lL: [2, 0], lR: [2, 0] },
  think: { aL: [30, -110], aR: [25, 130], lL: [4, 0], lR: [4, 0] },
  present: { aL: [12, -8], aR: [65, 20], lL: [4, 0], lR: [4, 0] },
  presentBoth: { aL: [60, 20], aR: [60, 20], lL: [5, 0], lR: [5, 0] },
  cheer: { aL: [160, -10], aR: [160, -10], lL: [12, 0], lR: [12, 0] },
  tread: { aL: [80, -30], aR: [80, -30], lL: [15, 10], lR: [15, 10] },
  facepalm: { aL: [12, -8], aR: [30, 140], lL: [4, 0], lR: [4, 0] },
  holdOut: { aL: [12, -8], aR: [55, 45], lL: [4, 0], lR: [4, 0] },
  holdBoth: { aL: [35, -60], aR: [35, -60], lL: [4, 0], lR: [4, 0] },
  drink: { aL: [12, -8], aR: [40, 130], lL: [4, 0], lR: [4, 0] },
  scratch: { aL: [20, -40], aR: [90, 100], lL: [4, 0], lR: [4, 0] },
};

export function lerpPose(a, b, t) {
  const out = {};
  for (const k of ['aL', 'aR', 'lL', 'lR']) {
    const A = a[k] || [0, 0], B = b[k] || [0, 0];
    out[k] = [lerp(A[0], B[0], t), lerp(A[1], B[1], t)];
  }
  out.handL = t < 0.5 ? a.handL : b.handL;
  out.handR = t < 0.5 ? a.handR : b.handR;
  out.lean = lerp(a.lean || 0, b.lean || 0, t);
  out.crouch = lerp(a.crouch || 0, b.crouch || 0, t);
  return out;
}

// Walk-cycle pose generator (front-ish view). phase in cycles.
export function walkPose(phase, amt = 1) {
  const s = Math.sin(phase * TAU);
  return {
    aL: [10 + s * 22 * amt, -10 - Math.max(0, s) * 20 * amt],
    aR: [10 - s * 22 * amt, -10 - Math.max(0, -s) * 20 * amt],
    lL: [4 + s * 10 * amt, -Math.max(0, -s) * 25 * amt],
    lR: [4 - s * 10 * amt, -Math.max(0, s) * 25 * amt],
    bob: Math.abs(Math.cos(phase * TAU)) * 8 * amt,
  };
}

// Fill with a facet shade clipped inside, then outline (low-poly painterly look)
function faceted(ctx, pts, fill, shade, shadePts, lw = 5, smoothPath = false, wob = 1.3) {
  const q = wobble(ctx, pts, wob);
  ctx.beginPath();
  tracePath(ctx, q, true, smoothPath);
  ctx.fillStyle = fill;
  ctx.fill();
  if (shade && shadePts) {
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    tracePath(ctx, shadePts, true, false);
    ctx.fillStyle = shade;
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    tracePath(ctx, q, true, smoothPath);
  }
  if (lw) {
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

function limb(ctx, pts, color, w, outline = 5) {
  line(ctx, pts, { color, lw: w, outline: outline / 2 + 0.5, wob: 0.8 });
}

function jointChain(x, y, dirSign, a, b, l1, l2) {
  const A = a * DEG, B = (a + b) * DEG;
  // dirSign: -1 for screen-left limb, +1 for screen-right
  const e = [x + dirSign * Math.sin(A) * l1, y + Math.cos(A) * l1];
  const h = [e[0] + dirSign * Math.sin(B) * l2, e[1] + Math.cos(B) * l2];
  return [[x, y], e, h];
}

let blinkSeed = 0;

// goggles resting on the forehead: short side straps + bridge only, so spiky hair still reads
function gogglesUp(ctx, hy) {
  for (const sd of [-1, 1]) line(ctx, [[sd * 40, hy - 66], [sd * 56, hy - 58], [sd * 64, hy - 46]], { color: '#4E5558', lw: 8, outline: 2.5, smooth: true, wob: 0.5 });
  line(ctx, [[-8, hy - 68], [8, hy - 68]], { color: '#4E5558', lw: 7, outline: 2.5, wob: 0.4 });
  for (const sx of [-23, 23]) {
    tx(ctx, { x: sx, y: hy - 68, r: sx < 0 ? -0.12 : 0.12, s: 0.8 }, () => {
      shape(ctx, [[-21, -17], [21, -17], [25, 0], [19, 15], [-19, 15], [-25, 0]], { fill: '#A3AEB2', lw: 6 });
      shape(ctx, [[-14, -10], [14, -10], [16, 0], [12, 9], [-12, 9], [-16, 0]], { fill: '#DCE8EC', lw: 4 });
      line(ctx, [[-8, -5], [2, -5]], { color: P.white, lw: 4, wob: 0 });
    });
  }
}

/**
 * Draw a character.
 * o: { x, y, s, costume, pose, expr, look:[x,y], t, id, flip, tint:{c,k}, shiver, sweat, talk, blush,
 *      shirtless, pantsOff, squash, rot, alpha, eyesClosed, noShadow, holdL(ctx,x,y), holdR(ctx,x,y) }
 * returns world positions of hands and head centre.
 */
export function drawPerson(ctx, o) {
  const C = typeof o.costume === 'string' ? COSTUMES[o.costume] : o.costume || COSTUMES.greg;
  const pose = { ...POSES.stand, ...(typeof o.pose === 'string' ? POSES[o.pose] : o.pose || {}) };
  const ex = { ...EXPR.neutral, ...(typeof o.expr === 'string' ? EXPR[o.expr] : o.expr || {}) };
  const t = o.t || 0;
  const s = o.s ?? 1;
  const id = o.id ?? 1;
  let x = o.x || 0, y = o.y || 0;
  if (o.shiver) x += Math.sin(t * 90 + id) * 2.5 * o.shiver;
  const res = {};

  const skinBase = C.skin || P.skin, skinDBase = C.skinD || P.skinD;
  let skin = skinBase, skinD = skinDBase;
  if (o.tint) { skin = mix(skin, o.tint.c, o.tint.k); skinD = mix(skinD, o.tint.c, o.tint.k); }
  if (ex.sick) { skin = mix(skin, '#A9C98A', ex.sick); skinD = mix(skinD, '#86AD6C', ex.sick); }

  const bob = (pose.bob || 0) + Math.sin(t * 2.2 + id) * 1.5;
  const crouch = pose.crouch || 0;
  const hipY = -108 + crouch + bob * 0.3;

  if (!o.noShadow) softShadow(ctx, x, y + 2, 70 * s, 12 * s, 0.16 * (o.alpha ?? 1));

  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(s * (o.flip ? -1 : 1), s * (o.squash ? 1 / o.squash : 1));
  if (o.squash) ctx.scale(1, o.squash * o.squash);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.translate(0, -bob);

  const lean = (pose.lean || 0) * DEG;
  const pantsC = o.pantsOff ? skin : C.pants.color;
  const pantsD = o.pantsOff ? skinD : C.pants.dark || C.pants.color;

  // ---- legs ----
  const legW = 30;
  const legs = [];
  for (const side of [-1, 1]) {
    const [a, b] = side < 0 ? pose.lL : pose.lR;
    const ch = jointChain(side * 17, hipY + 6, side, a, b, 52 - crouch * 0.25, 50 - crouch * 0.25);
    legs.push(ch);
  }
  const robeLong = C.robe || C.dress;
  for (let i = 0; i < 2; i++) {
    const ch = legs[i];
    const side = i === 0 ? -1 : 1;
    // shoe
    const [fx, fy] = ch[2];
    const [kx, ky] = ch[1];
    const dl = Math.hypot(fx - kx, fy - ky) || 1;
    limb(ctx, [ch[0], ch[1], [fx - ((fx - kx) / dl) * 10, fy - ((fy - ky) / dl) * 10]], pantsC, legW);
    drawShoe(ctx, fx, fy, side, C.shoes, o.tint);
    if (!o.pantsOff && C.shoes.style === 'sneaker') {
      // cuff
      const [kx, ky] = ch[1];
      const dx = fx - kx, dy = fy - ky, L = Math.hypot(dx, dy) || 1;
      const cx = fx - (dx / L) * 12, cy = fy - (dy / L) * 12;
      line(ctx, [[cx - 14, cy], [cx + 14, cy]], { color: pantsD, lw: 5, wob: 0.6 });
    }
  }
  // tag on sneaker
  if (C.tag && o.showTag !== false) {
    const [fx, fy] = legs[1][2];
    line(ctx, [[fx + 10, fy - 4], [fx + 26, fy + 10]], { color: P.ink, lw: 2, wob: 0.4 });
    tx(ctx, { x: fx + 36, y: fy + 18, r: 0.35 }, () => {
      shape(ctx, [[-14, -9], [12, -9], [18, 0], [12, 9], [-14, 9]], { fill: P.mustardL, lw: 2.5, wob: 0.5 });
      text(ctx, 'SALE', -1, 1, { size: 11, font: 'round', color: P.redD });
    });
  }

  ctx.save();
  ctx.translate(0, hipY);
  ctx.rotate(lean);
  ctx.translate(0, -hipY);

  // ---- hips / waist ----
  if (o.pantsOff) {
    // boxers
    shape(ctx, [[-40, hipY - 12], [40, hipY - 12], [44, hipY + 30], [4, hipY + 30], [0, hipY + 14], [-4, hipY + 30], [-44, hipY + 30]], { fill: P.plum, lw: 4.5 });
    for (let i = 0; i < 6; i++) circle(ctx, -30 + (i % 3) * 26 + (i > 2 ? 12 : 0), hipY + (i > 2 ? 18 : 0), 3.5, { fill: P.white, stroke: null, wob: 0 });
  } else if (!robeLong) {
    faceted(ctx, [[-40, hipY - 12], [40, hipY - 12], [42, hipY + 22], [-42, hipY + 22]], pantsC, pantsD, [[8, hipY - 20], [60, hipY - 20], [60, hipY + 30], [18, hipY + 30]], 5);
  }

  // ---- torso ----
  const neckY = hipY - 80;
  const shirtC = o.shirtless ? skin : C.shirt.color;
  const shirtD = o.shirtless ? skinD : C.shirt.dark || C.shirt.color;
  const torso = C.parka
    ? [[-46, neckY - 2], [46, neckY - 2], [54, hipY + 30], [-54, hipY + 30]]
    : [[-35, neckY], [35, neckY], [41, hipY + 2], [-41, hipY + 2]];
  if (robeLong) {
    const R = C.robe || C.dress;
    const bottom = C.robe ? -16 : hipY + 62;
    faceted(ctx, [[-36, neckY + 20], [36, neckY + 20], [C.robe ? 58 : 54, bottom], [C.robe ? -58 : -54, bottom]], R.color, R.dark, [[6, neckY], [80, neckY], [80, 10], [22, 10]], 5);
  }
  faceted(ctx, torso, shirtC, shirtD, [[10, neckY - 10], [60, neckY - 10], [60, hipY + 40], [22, hipY + 40]], 5);
  if (o.shirtless) {
    line(ctx, [[-14, neckY + 30], [-4, neckY + 34]], { lw: 3, color: skinD });
    line(ctx, [[14, neckY + 30], [4, neckY + 34]], { lw: 3, color: skinD });
    circle(ctx, 0, hipY - 14, 2.5, { fill: skinD, stroke: null });
  }
  if (C.collar) shape(ctx, [[-30, neckY], [30, neckY], [22, neckY + 26], [0, neckY + 34], [-22, neckY + 26]], { fill: C.collar, lw: 4 });
  if (C.coat) {
    // open lab coat: two panels
    const cc = C.coat.color, cd = C.coat.dark;
    faceted(ctx, [[-38, neckY - 2], [-8, neckY - 2], [-12, hipY + 20], [-18, hipY + 72], [-50, hipY + 72], [-46, hipY + 10]], cc, cd, [[-60, hipY - 10], [-10, hipY - 10], [-10, hipY + 90], [-60, hipY + 90]], 5);
    faceted(ctx, [[38, neckY - 2], [8, neckY - 2], [12, hipY + 20], [18, hipY + 72], [50, hipY + 72], [46, hipY + 10]], cc, cd, [[20, neckY - 10], [60, neckY - 10], [60, hipY + 90], [30, hipY + 90]], 5);
    // lapels
    shape(ctx, [[-8, neckY - 2], [-24, neckY + 26], [-14, neckY + 30]], { fill: cd, lw: 3.5 });
    shape(ctx, [[8, neckY - 2], [24, neckY + 26], [14, neckY + 30]], { fill: cd, lw: 3.5 });
    // pocket + pen
    line(ctx, [[20, neckY + 30], [20, neckY + 44]], { color: P.coral, lw: 4 });
    shape(ctx, [[14, neckY + 40], [36, neckY + 40], [34, neckY + 58], [16, neckY + 58]], { fill: cc, lw: 3 });
  }
  if (C.parka) {
    line(ctx, [[0, neckY + 10], [0, hipY + 28]], { color: C.shirt.dark, lw: 4 });
    line(ctx, [[-54, hipY + 24], [54, hipY + 24]], { color: C.hood.fur, lw: 10, outline: 2 });
  }

  // ---- arms ----
  const arms = [];
  for (const side of [-1, 1]) {
    const [a, b] = side < 0 ? pose.aL : pose.aR;
    const sx = side * (C.parka ? 42 : 33), sy = neckY + 10;
    arms.push(jointChain(sx, sy, side, a, b, 46, 42));
  }
  const sleeveC = C.coat ? C.coat.color : shirtC;
  for (let i = 0; i < 2; i++) {
    const ch = arms[i];
    const side = i === 0 ? -1 : 1;
    const sleeve = o.shirtless ? 'none' : C.coat ? 'long' : C.shirt.sleeve;
    const armW = C.parka ? 30 : 22;
    limb(ctx, ch, skin, armW);
    if (sleeve === 'long') {
      limb(ctx, [ch[0], ch[1], [lerp(ch[1][0], ch[2][0], 0.8), lerp(ch[1][1], ch[2][1], 0.8)]], sleeveC, armW + 4);
    } else if (sleeve === 'short') {
      limb(ctx, [ch[0], [lerp(ch[0][0], ch[1][0], 0.6), lerp(ch[0][1], ch[1][1], 0.6)]], sleeveC, armW + 6);
    }
    const [hx, hy] = ch[2];
    const hand = i === 0 ? pose.handL : pose.handR;
    const handC = C.parka ? C.hood.fur : skin;
    circle(ctx, hx, hy, 12.5, { fill: handC, lw: 4.5 });
    if (hand === 'thumb') ellipse(ctx, hx + side * 2, hy - 15, 5.5, 9, { fill: handC, lw: 4 });
    if (hand === 'point') ellipse(ctx, hx + side * 14, hy - 2, 10, 5, { fill: handC, lw: 4 });
  }

  // ---- head ----
  const headY = neckY - 56;
  const tilt = (o.headTilt || 0) * DEG;
  ctx.save();
  ctx.translate(0, neckY);
  ctx.rotate(tilt);
  ctx.translate(0, -neckY);
  if (!C.hood && !C.wrap) limb(ctx, [[0, neckY + 4], [0, neckY - 14]], skin, 22);

  const hair = C.hair || {};
  // hair behind head
  if (hair.style === 'long') {
    shape(ctx, [[-62, headY - 20], [-70, headY + 55], [-40, headY + 70], [40, headY + 70], [70, headY + 55], [62, headY - 20], [0, headY - 70]], { fill: hair.color, lw: 5, smooth: true });
  }
  if (hair.style === 'bun') circle(ctx, 0, headY - 64, 26, { fill: hair.color, lw: 5 });
  if (C.hood) {
    circle(ctx, 0, headY + 4, 78, { fill: C.hood.fur, lw: 5 });
    // fur tufts
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU;
      circle(ctx, Math.cos(a) * 74, headY + 4 + Math.sin(a) * 74, 12, { fill: i % 2 ? C.hood.fur : C.hood.furD, lw: 3.5 });
    }
  }
  if (C.wrap) circle(ctx, 0, headY - 4, 68, { fill: C.wrap.color, lw: 5 });

  const look = o.look || ex.look || [0, 0];
  const lx = look[0], ly = look[1];
  // ears
  if (!C.hood && !C.wrap && !C.helmet) {
    circle(ctx, -59 + lx * 6, headY + 4, 12, { fill: skin, lw: 4.5 });
    circle(ctx, 59 + lx * 6, headY + 4, 12, { fill: skin, lw: 4.5 });
  }
  // face
  const headPts = ellipsePts(0, headY, 60, 57);
  faceted(ctx, headPts, skin, skinD, [[20 + lx * 10, headY - 80], [90, headY - 80], [90, headY + 80], [34 + lx * 10, headY + 80]], 5, true, 1.1);
  // blush
  if (o.blush || ex.mouth === 'grin' || ex.eyes === 'happy') {
    ellipse(ctx, -34 + lx * 14, headY + 20, 10, 6, { fill: 'rgba(232,135,122,0.45)', stroke: null, wob: 0 });
    ellipse(ctx, 34 + lx * 14, headY + 20, 10, 6, { fill: 'rgba(232,135,122,0.45)', stroke: null, wob: 0 });
  }
  drawFace(ctx, headY, lx, ly, ex, o, t, id, skinD);

  if (C.wrap) {
    // tagelmust: covers head and lower face, eyes visible through a slit
    shape(ctx, [[-64, headY + 2], [64, headY + 2], [60, headY + 40], [30, headY + 60], [-30, headY + 60], [-60, headY + 40]], { fill: C.wrap.color, lw: 5, smooth: false });
    shape(ctx, [[-66, headY - 20], [-60, headY - 60], [0, headY - 78], [60, headY - 60], [66, headY - 20], [0, headY - 30]], { fill: C.wrap.dark, lw: 5, smooth: true });
    line(ctx, [[-50, headY + 22], [50, headY + 22]], { color: C.wrap.dark, lw: 4 });
  }
  // hair front
  drawHair(ctx, hair, headY, lx, t);
  if (!C.wrap) drawBrows(ctx, headY, lx, ly, ex);
  if (C.goggles === true) {
    line(ctx, [[-60, headY - 30], [60, headY - 30]], { color: '#4E5558', lw: 9, outline: 2, wob: 0.6 });
    for (const sx of [-24, 24]) {
      shape(ctx, [[sx - 20, headY - 48], [sx + 20, headY - 48], [sx + 24, headY - 30], [sx + 18, headY - 14], [sx - 18, headY - 14], [sx - 24, headY - 30]], { fill: '#A3AEB2', lw: 4.5 });
      shape(ctx, [[sx - 13, headY - 41], [sx + 13, headY - 41], [sx + 15, headY - 30], [sx + 11, headY - 20], [sx - 11, headY - 20], [sx - 15, headY - 30]], { fill: '#DCE8EC', lw: 3 });
      line(ctx, [[sx - 7, headY - 36], [sx + 1, headY - 36]], { color: P.white, lw: 3, wob: 0 });
    }
  }
  if (C.helmet) {
    shape(ctx, [[-86, headY - 18], [86, headY - 18], [70, headY - 26], [50, headY - 62], [0, headY - 74], [-50, headY - 62], [-70, headY - 26]], { fill: C.helmet.color, lw: 5, smooth: true });
    line(ctx, [[-88, headY - 18], [88, headY - 18]], { color: C.helmet.dark, lw: 8, outline: 2 });
  }
  if (C.cap) {
    shape(ctx, [[-58, headY - 36], [58, headY - 36], [50, headY - 66], [0, headY - 78], [-50, headY - 66]], { fill: C.cap.color, lw: 5, smooth: true });
    line(ctx, [[-62, headY - 36], [62, headY - 36]], { color: P.blueDD, lw: 8, outline: 2 });
  }
  if (C.goggles === 'up') gogglesUp(ctx, headY);
  if (o.hat) o.hat(ctx, headY);
  // sweat drops
  if (o.sweat) {
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.9 + i * 0.37 + id * 0.1) % 1;
      const sx = [-48, 50, 30][i], sy = headY - 30 + [0, 10, -20][i] + ph * 50;
      drawDrop(ctx, sx, sy, 7 * o.sweat, P.blueL, 1 - ph);
    }
  }
  ctx.restore(); // head tilt
  ctx.restore(); // lean

  // hold props
  const toWorld = (p) => [x + p[0] * s * (o.flip ? -1 : 1), y + (p[1] - bob) * s];
  res.handL = toWorld(arms[0][2]);
  res.handR = toWorld(arms[1][2]);
  res.head = toWorld([0, headY]);
  res.hip = toWorld([0, hipY]);
  res.localHandL = arms[0][2];
  res.localHandR = arms[1][2];
  if (o.holdL) o.holdL(ctx, arms[0][2][0], arms[0][2][1]);
  if (o.holdR) o.holdR(ctx, arms[1][2][0], arms[1][2][1]);
  ctx.restore();
  return res;
}

function drawShoe(ctx, x, y, side, S, tint) {
  if (!S) return;
  const st = S.style;
  if (st === 'bare') {
    ellipse(ctx, x + side * 6, y + 2, 16, 9, { fill: S.color, lw: 4 });
    return;
  }
  if (st === 'sandal') {
    ellipse(ctx, x + side * 6, y + 4, 18, 8, { fill: S.color, lw: 4 });
    ellipse(ctx, x + side * 6, y - 1, 14, 7, { fill: P.skin, lw: 3.5 });
    line(ctx, [[x - 6, y - 4], [x + 14 * side, y - 1]], { color: S.color, lw: 4 });
    return;
  }
  if (st === 'none') return;
  const w = st === 'boot' ? 22 : 24;
  shape(ctx, [[x - w * 0.7 + side * 6, y - 14], [x + w * 0.5 + side * 8, y - 12], [x + w + side * 6, y - 2], [x + w + side * 6, y + 8], [x - w * 0.8 + side * 6, y + 8], [x - w * 0.9 + side * 6, y - 2]], { fill: S.color, lw: 4.5, smooth: true });
  if (st === 'sneaker') {
    line(ctx, [[x - w * 0.8 + side * 6, y + 5], [x + w + side * 6, y + 5]], { color: P.beigeD, lw: 4, wob: 0.5 });
    line(ctx, [[x - 8 + side * 6, y - 6], [x + 10 + side * 6, y - 1]], { color: S.accent, lw: 4, wob: 0.5 });
  }
}

function drawDrop(ctx, x, y, r, color, a = 1) {
  tx(ctx, { a }, () => {
    shape(ctx, [[x, y - r * 1.8], [x + r, y], [x + r * 0.7, y + r * 0.8], [x, y + r], [x - r * 0.7, y + r * 0.8], [x - r, y]], { fill: color, lw: 3, smooth: true });
  });
}
export { drawDrop };

function drawHair(ctx, hair, headY, lx, t) {
  const c = hair.color, l = hair.light || c;
  switch (hair.style) {
    case 'greg': {
      // side-swept mop with a cowlick
      const pts = [[-63, headY - 2], [-66, headY - 30], [-50, headY - 58], [-16, headY - 72], [26, headY - 70], [56, headY - 52], [66, headY - 22], [62, headY - 4],
        [54, headY - 22], [40, headY - 30], [26, headY - 22], [18, headY - 34], [-2, headY - 30], [-16, headY - 38], [-36, headY - 26], [-50, headY - 30]];
      shape(ctx, pts, { fill: c, lw: 5, smooth: true });
      shape(ctx, [[-30, headY - 58], [10, headY - 68], [34, headY - 58], [4, headY - 52]], { fill: l, stroke: null, smooth: true });
      const sway = Math.sin(t * 3) * 3;
      shape(ctx, [[-6, headY - 66], [-2 + sway, headY - 92], [12 + sway, headY - 100], [8, headY - 84], [12, headY - 68]], { fill: c, lw: 4.5, smooth: true });
      break;
    }
    case 'spiky': {
      const pts = [];
      const spikes = 11;
      for (let i = 0; i <= spikes; i++) {
        const a = Math.PI + (i / spikes) * Math.PI;
        const r1 = i % 2 === 0 ? 96 : 60;
        const wob = Math.sin(t * 2 + i) * 2;
        pts.push([Math.cos(a) * (r1 + wob) * 0.95, headY - 8 + Math.sin(a) * (r1 + wob) * 0.9]);
      }
      pts.push([66, headY + 4], [50, headY - 20], [30, headY - 8], [16, headY - 26], [-4, headY - 10], [-20, headY - 28], [-40, headY - 12], [-52, headY - 24], [-68, headY + 6]);
      shape(ctx, pts, { fill: c, lw: 5 });
      shape(ctx, [[-50, headY - 50], [-20, headY - 80], [10, headY - 60], [-20, headY - 40]], { fill: l, stroke: null });
      shape(ctx, [[20, headY - 62], [50, headY - 74], [48, headY - 44]], { fill: l, stroke: null });
      break;
    }
    case 'short': {
      shape(ctx, [[-62, headY - 6], [-60, headY - 44], [-30, headY - 64], [20, headY - 66], [56, headY - 44], [62, headY - 6], [48, headY - 30], [0, headY - 38], [-44, headY - 30]], { fill: c, lw: 5, smooth: true });
      break;
    }
    case 'shaggy': {
      shape(ctx, [[-70, headY + 20], [-72, headY - 40], [-40, headY - 72], [20, headY - 76], [66, headY - 48], [72, headY + 20], [56, headY - 10], [40, headY - 24], [20, headY - 16], [0, headY - 30], [-20, headY - 16], [-40, headY - 26], [-58, headY - 6]], { fill: c, lw: 5, smooth: true });
      break;
    }
    case 'long':
    case 'bun': {
      shape(ctx, [[-64, headY + 6], [-62, headY - 40], [-30, headY - 64], [20, headY - 66], [58, headY - 44], [64, headY + 6], [44, headY - 26], [10, headY - 36], [-30, headY - 30]], { fill: c, lw: 5, smooth: true });
      if (hair.light) shape(ctx, [[-30, headY - 52], [10, headY - 60], [30, headY - 50], [0, headY - 46]], { fill: hair.light, stroke: null, smooth: true });
      break;
    }
    default:
      break;
  }
}


function drawBrows(ctx, headY, lx, ly, ex) {
  const fx = lx * 16, fy = ly * 7;
  const eyeY = headY - 2 + fy;
  const [b1, b2] = ex.brows || [0, 0];
  const tilt = ex.browTilt || 0;
  for (const side of [-1, 1]) {
    const lift = (side < 0 ? b1 : b2) * 10;
    const cx = side * 23 + fx, cy = eyeY - 26 - lift - (ex.eyes === 'wide' ? 4 : 0);
    const inner = tilt * 6;
    line(ctx, [[cx - 12 * side, cy - inner], [cx + 12 * side, cy + inner * 0.25]], { lw: 5, wob: 0.6 });
  }
}

function drawFace(ctx, headY, lx, ly, ex, o, t, id, skinD) {
  const fx = lx * 16, fy = ly * 7;
  const eyeY = headY - 2 + fy;
  // blink
  let eyes = ex.eyes;
  if (eyes === 'open' || eyes === 'wide') {
    const period = 3.3 + hash(id * 3.1) * 1.8;
    const ph = (t + hash(id) * period) % period;
    if (ph < 0.13 && !o.noBlink) eyes = 'closed';
  }
  if (o.eyesClosed) eyes = 'closed';
  const ink = P.ink;
  for (const side of [-1, 1]) {
    const cx = side * 23 + fx, cy = eyeY;
    switch (eyes) {
      case 'open':
      case 'wide':
      case 'half': {
        const wide = eyes === 'wide';
        const rx = wide ? 14 : 12.5, ry = wide ? 18 : 15.5;
        ellipse(ctx, cx, cy, rx, ry, { fill: P.white, lw: 4, wob: 0.6 });
        const pr = wide ? 5.5 : 7;
        const px = cx + lx * 5, py = cy + ly * 5 + 1;
        circle(ctx, px, py, pr, { fill: ink, stroke: null, wob: 0.3 });
        circle(ctx, px + 2.5, py - 3, 2.2, { fill: P.white, stroke: null, wob: 0 });
        if (eyes === 'half') {
          shape(ctx, [[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - 1], [cx - rx - 2, cy - 1]], { fill: skinD, stroke: null, wob: 0 });
          line(ctx, [[cx - rx - 1, cy - 1], [cx + rx + 1, cy - 1]], { lw: 4.5, wob: 0.5 });
        }
        break;
      }
      case 'closed':
        line(ctx, [[cx - 11, cy + 1], [cx + 11, cy + 1]], { lw: 4.5, wob: 0.6 });
        break;
      case 'happy':
        line(ctx, [[cx - 11, cy + 4], [cx, cy - 7], [cx + 11, cy + 4]], { lw: 4.5, smooth: true, wob: 0.6 });
        break;
      case 'squint':
        line(ctx, [[cx + 10 * side, cy - 8], [cx - 8 * side, cy], [cx + 10 * side, cy + 8]], { lw: 4.5, wob: 0.6 });
        break;
      case 'x':
        line(ctx, [[cx - 9, cy - 9], [cx + 9, cy + 9]], { lw: 4.5 });
        line(ctx, [[cx + 9, cy - 9], [cx - 9, cy + 9]], { lw: 4.5 });
        break;
      case 'spiral': {
        const pts = [];
        for (let i = 0; i < 30; i++) {
          const a = i * 0.5 + t * 8 * side, r = i * 0.45;
          pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
        line(ctx, pts, { lw: 3, wob: 0 });
        break;
      }
    }
  }
  // nose
  ellipse(ctx, fx * 1.15, headY + 17 + fy, 6.5, 4.5, { fill: skinD, stroke: null, wob: 0.3 });
  // mouth
  const mx = fx * 1.05, my = headY + 33 + fy * 0.8;
  let m = ex.mouth;
  const talk = o.talk || 0;
  if (talk > 0.08 && (m === 'smile' || m === 'neutral' || m === 'grin' || m === 'smirk')) {
    const open = clamp(talk) * 16;
    shape(ctx, [[mx - 16, my - 2], [mx + 16, my - 2], [mx + 10, my + open * 0.7], [mx, my + open], [mx - 10, my + open * 0.7]], { fill: '#8C3B35', lw: 4, smooth: true, wob: 0.5 });
    return;
  }
  switch (m) {
    case 'smile':
      line(ctx, [[mx - 15, my - 3], [mx, my + 7], [mx + 15, my - 3]], { lw: 4.5, smooth: true, wob: 0.5 });
      break;
    case 'grin':
      shape(ctx, [[mx - 19, my - 5], [mx + 19, my - 5], [mx + 12, my + 10], [mx, my + 15], [mx - 12, my + 10]], { fill: '#8C3B35', lw: 4.5, smooth: true, wob: 0.5 });
      shape(ctx, [[mx - 8, my + 11], [mx + 8, my + 11], [mx, my + 15]], { fill: '#E8877A', stroke: null, smooth: true, wob: 0 });
      break;
    case 'neutral':
      line(ctx, [[mx - 11, my], [mx + 11, my + 1]], { lw: 4.5, smooth: true, wob: 0.5 });
      break;
    case 'flat':
      line(ctx, [[mx - 14, my + 2], [mx + 14, my + 2]], { lw: 4.5, wob: 0.5 });
      break;
    case 'frown':
      line(ctx, [[mx - 14, my + 7], [mx, my - 1], [mx + 14, my + 7]], { lw: 4.5, smooth: true, wob: 0.5 });
      break;
    case 'smirk':
      line(ctx, [[mx - 12, my + 3], [mx + 4, my + 4], [mx + 14, my - 3]], { lw: 4.5, smooth: true, wob: 0.5 });
      break;
    case 'o':
      ellipse(ctx, mx, my + 3, 6, 7, { fill: '#8C3B35', lw: 4, wob: 0.5 });
      break;
    case 'open':
      ellipse(ctx, mx, my + 6, 13, 16, { fill: '#8C3B35', lw: 4.5, wob: 0.5 });
      ellipse(ctx, mx, my + 14, 7, 5, { fill: '#E8877A', stroke: null, wob: 0 });
      break;
    case 'wavy':
      line(ctx, [[mx - 16, my + 4], [mx - 8, my - 1], [mx, my + 4], [mx + 8, my - 1], [mx + 16, my + 4]], { lw: 4.5, smooth: true, wob: 0.5 });
      break;
    case 'teeth': {
      const ch = o.chatter ? Math.sin(t * 60) * 2 : 0;
      shape(ctx, [[mx - 17, my - 4 + ch], [mx + 17, my - 4 + ch], [mx + 17, my + 10], [mx - 17, my + 10]], { fill: P.white, lw: 4, wob: 0.5 });
      line(ctx, [[mx - 17, my + 3], [mx + 17, my + 3]], { lw: 3 });
      for (const dx of [-8, 0, 8]) line(ctx, [[mx + dx, my - 4], [mx + dx, my + 10]], { lw: 2.5 });
      break;
    }
    case 'tongue':
      shape(ctx, [[mx - 14, my - 2], [mx + 14, my - 2], [mx + 10, my + 8], [mx - 10, my + 8]], { fill: '#8C3B35', lw: 4, smooth: true });
      shape(ctx, [[mx - 7, my + 4], [mx + 7, my + 4], [mx + 7, my + 18], [mx, my + 22], [mx - 7, my + 18]], { fill: '#E8877A', lw: 3.5, smooth: true });
      break;
  }
}
