// 0:34 - 1:06  Quick rules + the rule of threes.
import { E, H, W, cues, prog, lerp, loudness, popScale, clamp } from '#lib/engine/core.js';
import { P, star, tx, rrect, shape, line, text, arrow, tag, stamp, glow, vgrad } from '#lib/engine/draw.js';
import { drawPerson } from '#lib/characters/person.js';
import { notebookBG, jungleBG, labBG } from '#lib/world/backgrounds.js';
import { withCam, keys, zzz, numberBadge, skull, paintWipe } from '#lib/ui.js';
import { lungs, house, waterDrop, drumstick, stick, clipboard, bellCurve, couch, tv, stone, jar, stoneAxe, helicopter, chalkboard } from '#lib/props/index.js';

const RULES3 = [
  { n: '3', unit: 'MINUTES', what: 'without AIR', c: P.blue, cD: P.blueD, icon: (g, t) => lungs(g, 0, 0, 1.1, t) },
  { n: '3', unit: 'HOURS', what: 'without SHELTER', sub: '(in bad weather)', c: P.mustard, cD: P.mustardD, icon: (g) => house(g, 0, -10, 1.05) },
  { n: '3', unit: 'DAYS', what: 'without WATER', c: '#7FB6C9', cD: '#4F8FA6', icon: (g) => waterDrop(g, 0, 0, 1.05) },
  { n: '3', unit: 'WEEKS', what: 'without FOOD', c: P.coral, cD: P.coralD, icon: (g) => drumstick(g, 0, 0, 1.0) },
];
export function ruleCard(ctx, i, x, y, s, t, opt = {}) {
  const R = RULES3[i];
  tx(ctx, { x, y, s, r: opt.r || 0 }, () => {
    rrect(ctx, -185 + 10, -250 + 14, 370, 540, 30, { fill: 'rgba(20,25,30,0.25)', stroke: null, wob: 0 });
    rrect(ctx, -185, -250, 370, 540, 30, { fill: P.white, lw: 6 });
    rrect(ctx, -185, -250, 370, 210, 30, { fill: R.c, stroke: null, wob: 0.5 });
    shape(ctx, [[-185, -80], [185, -80], [185, -40], [-185, -40]], { fill: R.c, stroke: null, wob: 0 });
    rrect(ctx, -185, -250, 370, 540, 30, { fill: null, lw: 6 });
    line(ctx, [[-185, -40], [185, -40]], { lw: 5 });
    tx(ctx, { y: -145 }, () => R.icon(ctx, t));
    const big = opt.override ? opt.override : R.n;
    text(ctx, big, 0, 60, { size: 150, font: 'bold', color: R.cD, stroke: P.ink, sw: 8 });
    text(ctx, opt.unitOverride || R.unit, 0, 150, { size: 54, font: 'bold', color: P.ink });
    text(ctx, R.what, 0, 205, { size: 40, font: 'hand', color: P.inkL });
    if (opt.extra) opt.extra(ctx);
  });
}

export function build() {
  const c = cues(33);
  const shots = [];
  const tRules = c('quick rules'), tAvg = c('greg is an average guy'), tShow = c('he\'s watched exactly');
  const tAsleep = c('fell asleep'), tHalf = c('halfway through');
  const tZero = c('he starts with zero tools'), tBut = c('but if he can make');
  const tRocks = c('rocks'), tSticks = c('sticks'), tDesp = c('pure desperation'), tCounts = c('that counts');
  const tNobody = c('and nobody is coming'), tScore = c('to score him'), tRot = c('rule of threes');
  const tAir = c('three minutes without air'), tShelter = c('three hours without shelter'), tBad = c('in bad weather');
  const tWater = c('three days without water'), tFood = c('three weeks without food');
  const tRemember = c('remember that list'), tOrder = c('it\'s basically the order'), tKill = c('tries to kill you');
  const tForest = c('first stop');

  // Quick rules + average guy
  shots.push({
    a: tRules, b: tShow,
    draw(ctx, t) {
      notebookBG(ctx, t);
      const avg = prog(t, tAvg - 0.2, 0.6);
      withCam(ctx, { x: 960 + avg * 0, y: 540, z: 1 }, () => {
        // clipboard slides out left as the bell curve arrives
        const cbx = lerp(620, -500, avg);
        clipboard(ctx, cbx, 560, prog(t, tRules, 0.45, E.outBack), -0.04, ['1. Greg is average', '2. Zero tools', '3. Crafting counts', '4. No rescue'], prog(t, tRules + 0.3, 0.9));
        drawPerson(ctx, {
          x: lerp(1420, 2400, avg), y: 900, s: 1.35, costume: 'scientist', pose: 'present', expr: 'smile', t, id: 2, look: [-0.5, 0], talk: loudness(t),
        });
        if (avg > 0) {
          tx(ctx, { x: lerp(1800, 0, avg) }, () => {
            bellCurve(ctx, 960, 820, 1300, 420, prog(t, tAvg, 0.7));
            text(ctx, 'survival skills', 960, 890, { size: 48, font: 'hand', color: P.inkL });
            arrow(ctx, 1110, 890, 1240, 890, { bend: 0, lw: 5, head: 16, color: P.inkL });
            text(ctx, 'none', 330, 860, { size: 40, font: 'hand', color: P.inkL });
            text(ctx, 'expert', 1590, 860, { size: 40, font: 'hand', color: P.inkL });
            const gp = prog(t, tAvg + 0.5, 0.45, E.outBounce);
            drawPerson(ctx, { x: 960, y: lerp(0, 400, gp), s: 0.9, costume: 'greg', pose: 'thumbs', expr: 'smile', t, id: 1, noShadow: true });
            tag(ctx, 'AVERAGE GUY', 1330, 250, { size: 56, s: popScale(t, tAvg + 0.7, Infinity, 0.4), bg: P.mustardL, r: 0.05 });
            arrow(ctx, 1220, 290, 1060, 330, { p: prog(t, tAvg + 0.9, 0.3), bend: 0.2 });
          });
        }
      });
    },
  });

  // Survival show on the couch
  shots.push({
    a: tShow, b: tZero,
    draw(ctx, t) {
      notebookBG(ctx, t, { color: '#EFE6D6' });
      // wallpaper-ish room
      shape(ctx, [[-50, 820], [W + 50, 820], [W + 50, H + 50], [-50, H + 50]], { fill: '#C69F74', stroke: P.ink, lw: 5, wob: 0.4 });
      const asleep = t > tAsleep;
      const zoom = keys(t, [[tShow, 1.0], [tAsleep, 1.0], [tAsleep + 0.6, 1.12]]);
      withCam(ctx, { x: 960, y: 560, z: zoom }, () => {
        const prog01 = asleep ? Math.min(0.5, 0.35 + (t - tAsleep) * 0.1) : 0.05 + (t - tShow) * 0.1;
        tv(ctx, 520, 560, 1.05, t, (g) => {
          tx(g, { s: 0.23, x: -220, y: -130 }, () => jungleBG(g, t, { noFrame: true }));
          const hx = Math.sin(t * 2) * 30;
          drawPerson(g, { x: hx, y: 110, s: 0.55, costume: { hair: { style: 'short', color: '#6B4A33' }, shirt: { color: '#9A8A5E', dark: '#7D6F48', sleeve: 'short' }, pants: { color: '#6E5A48' }, shoes: { style: 'boot', color: '#4A3A2E' } }, pose: 'point', expr: 'grin', t, id: 9, hat: (gg, hy) => { shape(gg, [[-90, hy - 36], [90, hy - 36], [60, hy - 50], [44, hy - 86], [-44, hy - 86], [-60, hy - 50]], { fill: '#B08A5A', lw: 5 }); } });
          text(g, 'SURVIVE!', 0, -95, { size: 44, font: 'bold', color: P.mustard, stroke: P.ink, sw: 7, r: -0.05 });
        }, prog01);
        couch(ctx, 1320, 800, 1.1);
        drawPerson(ctx, {
          x: 1320, y: 870, s: 1.15, costume: 'greg', pose: { aL: [20, -40], aR: [20, -40], lL: [10, -10], lR: [10, -10], crouch: 30 },
          expr: asleep ? 'sleep' : 'smile', t, id: 1, look: asleep ? [0, 0] : [-0.7, 0], headTilt: asleep ? 14 : 0, noShadow: true,
        });
        rrect(ctx, 1320 - 190, 870 - 108, 380, 64, 26, { fill: P.plumL, lw: 5 });
        if (asleep) zzz(ctx, 1400, 440, t);
        tag(ctx, 'EPISODES WATCHED: 1', 1320, 190, { size: 50, s: popScale(t, tShow + 0.9, Infinity, 0.4), bg: P.white, r: -0.03 });
        if (t > tHalf) {
          text(ctx, 'halfway', 520, 350, { size: 44, font: 'hand', color: P.red, stroke: P.white, sw: 8, s: popScale(t, tHalf, Infinity, 0.3) });
        }
      });
    },
  });

  // Inventory: zero tools -> rocks, sticks, pure desperation -> crafting counts
  shots.push({
    a: tZero, b: tNobody,
    draw(ctx, t) {
      notebookBG(ctx, t);
      withCam(ctx, { x: 960, y: 540, z: 1 }, () => {
        drawPerson(ctx, { x: 330, y: 930, s: 1.3, costume: 'greg', pose: t < tBut ? 'shrug' : t > tCounts ? 'cheer' : 'stand', expr: t < tBut ? 'deadpan' : t > tCounts ? 'happy' : 'smile', t, id: 1, look: [0.6, 0] });
        const bx = 620, by = 330, sz = 190;
        text(ctx, 'INVENTORY', bx, by - 150, { size: 60, font: 'bold', color: P.ink, align: 'left' });
        for (let i = 0; i < 6; i++) {
          const x = bx + i * (sz + 18), y = by;
          rrect(ctx, x, y - sz / 2, sz, sz, 20, { fill: '#E9DFCC', lw: 5 });
          rrect(ctx, x + 10, y - sz / 2 + 10, sz - 20, sz - 20, 14, { fill: null, stroke: 'rgba(47,59,62,0.2)', lw: 3 });
        }
        const zeroP = popScale(t, tZero + 0.3, tBut + 0.2, 0.4, 0.2);
        if (zeroP > 0) stamp(ctx, '0 TOOLS', bx + 3 * (sz + 18) - 10, by, { p: prog(t, tZero + 0.3, 0.4), size: 90, color: P.red, a: zeroP });
        const items = [
          [tRocks, (g, x, y) => stone(g, x, y, 1.3)],
          [tSticks, (g, x, y) => stick(g, x, y, 150, -0.6, 1)],
          [tDesp, (g, x, y) => jar(g, x, y + 8, 0.95, t)],
        ];
        items.forEach(([ta, fn], i) => {
          const s = popScale(t, ta, Infinity, 0.4);
          tx(ctx, { x: bx + i * (sz + 18) + sz / 2, y: by, s }, () => fn(ctx, 0, 0));
          const lbl = ['rocks', 'sticks', 'pure desperation'][i];
          text(ctx, lbl, bx + i * (sz + 18) + sz / 2, by + 135, { size: 40, font: 'hand', color: P.inkL, s, maxW: 200 });
        });
        // crafting recipe
        if (t > tCounts - 0.3) {
          const cp = prog(t, tCounts - 0.3, 0.5);
          const y = 720;
          tx(ctx, { a: clamp(cp * 2) }, () => {
            rrect(ctx, 620, y - 140, 1180, 280, 30, { fill: P.white, lw: 5 });
            text(ctx, 'CRAFTING', 660, y - 105, { size: 40, font: 'bold', color: P.inkL, align: 'left' });
            stone(ctx, 760, y + 10, 1.2);
            text(ctx, '+', 900, y + 10, { size: 100, font: 'bold' });
            stick(ctx, 1060, y + 10, 160, -0.5, 1);
            text(ctx, '=', 1230, y + 10, { size: 100, font: 'bold' });
            const ap = popScale(t, tCounts + 0.2, Infinity, 0.5);
            tx(ctx, { x: 1400, y: y + 20, s: ap }, () => { glow(ctx, 0, -20, 150, P.mustardL, 0.8); stoneAxe(ctx, 0, 0, 1, 0.3); });
            if (t > tCounts + 0.5) stamp(ctx, 'COUNTS ✓', 1640, y, { p: prog(t, tCounts + 0.5, 0.35), size: 64, color: P.greenD, r: 0.1 });
          });
        }
      });
    },
  });

  // Nobody is coming to save him
  shots.push({
    a: tNobody, b: tScore,
    draw(ctx, t) {
      vgrad(ctx, -50, H + 50, [[0, '#CFE3EC'], [1, '#F1EBD9']]);
      shape(ctx, [[-50, 860], [W + 50, 860], [W + 50, H + 50], [-50, H + 50]], { fill: '#A7C58F', stroke: null, wob: 0 });
      const lt = t - tNobody;
      const hx = lerp(-400, 2400, clamp(lt / 1.9));
      drawPerson(ctx, { x: 820, y: 900, s: 1.3, costume: 'greg', pose: lt < 1.1 ? (Math.sin(t * 14) > 0 ? 'cheer' : 'wave') : 'stand', expr: lt < 1.1 ? 'happy' : 'sad', t, id: 1, look: [lt < 1.1 ? (hx - 820) / 1200 : 0.8, -0.5], squash: lt < 1.1 ? 1 + Math.abs(Math.sin(t * 7)) * 0.04 : 1 });
      helicopter(ctx, hx, 240 + Math.sin(t * 3) * 14, 1, t);
      if (lt > 1.1) stamp(ctx, 'NO RESCUE', 1350, 560, { p: prog(lt, 1.1, 0.35), size: 110 });
    },
  });

  // Rule of threes: chalkboard intro
  shots.push({
    a: tScore, b: tAir,
    draw(ctx, t) {
      labBG(ctx, t, { noMap: true });
      chalkboard(ctx, 760, 380, 1000, 520, (g) => {
        text(g, 'THE RULE', 760, 260, { size: 110, font: 'marker', color: '#F2F2EA', a: prog(t, tRot - 0.3, 0.3), s: prog(t, tRot - 0.3, 0.4, E.outBack) });
        text(g, 'OF 3s', 760, 420, { size: 170, font: 'marker', color: P.mustardL, a: prog(t, tRot, 0.3), s: prog(t, tRot, 0.45, E.outBackBig), r: -0.04 });
        text(g, 'scoring system:', 460, 160, { size: 44, font: 'hand', color: 'rgba(242,242,234,0.8)', a: prog(t, tScore, 0.3) });
      });
      drawPerson(ctx, { x: 1520, y: 960, s: 1.4, costume: 'scientist', pose: 'point', expr: 'grin', t, id: 2, look: [-0.6, -0.2], flip: true, talk: loudness(t) });
    },
  });

  // The four cards
  shots.push({
    a: tAir, b: tForest,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.coral });
      text(ctx, 'THE RULE OF THREES', 960, 120, { size: 84, font: 'marker', color: P.ink });
      const ts = [tAir, tShelter, tWater, tFood];
      const orderP = (i) => prog(t, tOrder + 0.25 + i * 0.45, 0.35);
      const remember = prog(t, tRemember, 0.4);
      ts.forEach((ta, i) => {
        const s = popScale(t, ta, Infinity, 0.45);
        if (s <= 0) return;
        const hl = t >= ta && t < (ts[i + 1] || tRemember);
        const x = 300 + i * 440;
        const y = 560 + (hl ? -18 : 0) + Math.sin(t * 1.5 + i) * 4;
        ruleCard(ctx, i, x, y, s * (hl ? 1.06 : 1), t, {
          r: [-0.03, 0.02, -0.02, 0.03][i],
          extra: (g) => {
            if (i === 1 && t > tBad) text(g, '(in bad weather)', 0, 250, { size: 40, font: 'hand', color: P.coralD, a: prog(t, tBad, 0.3) });
            const op = orderP(i);
            if (op > 0) {
              numberBadge(g, i + 1, -160, -230, 52, P.ink, E.outBack(op));
              tx(g, { x: 150, y: -225, s: E.outBack(op), r: 0.2 }, () => skull(g, 0, 0, 36, P.white));
            }
          },
        });
      });
      if (remember > 0) {
        const s = E.outBack(remember);
        tx(ctx, { x: 960, y: 960, s, r: -0.02 }, () => {
          rrect(ctx, -420, -55, 840, 110, 20, { fill: P.mustardL, lw: 5 });
          text(ctx, 'REMEMBER THIS LIST', 0, 4, { size: 58, font: 'bold', color: P.ink });
          star(ctx, -360, 0, 28, P.mustard);
          star(ctx, 360, 0, 28, P.mustard);
        });
      }
      if (t > tKill - 0.2) {
        const a = prog(t, tKill - 0.2, 0.3);
        text(ctx, "nature's hit list", 960, 1030, { size: 44, font: 'hand', color: P.redD, a });
      }
    },
  });
  shots.push({ a: tForest - 0.35, b: tForest + 0.35, draw(ctx, t) { paintWipe(ctx, (t - (tForest - 0.35)) / 0.35, P.sageD, 5); } });
  return shots;
}
