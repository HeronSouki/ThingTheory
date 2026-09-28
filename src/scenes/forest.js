// 1:06 - 2:35  Level 1: the forest (the tutorial level).
import { P, shape, circle, ellipse, line, tx, text, tag, stamp, rrect, arrow, crossOut, checkMark, glow, swash, fillScreen, vgrad, measure } from '../engine/draw.js';
import { W, H, E, clamp, lerp, prog, vis, popScale, cues, wiggle, TAU, hash, rng, mix } from '../engine/core.js';
import { drawPerson, walkPose } from '../chars/person.js';
import { withCam, keys, thoughtBubble, inset, panel, banner, meter, sparkle, comicBurst, burstLines, calendarPage, skull } from '../ui.js';
import { forestBG, notebookBG, fern, rock, pine, blobTree } from '../bg.js';
import { house, campfire, stick, flame, callout, infinity } from '../props.js';
import { levelShot, wipeShot, clockShot, portalDrop, dustPuff, sunglasses, sepia, dim, gameTooltip, critter } from './common.js';

const GROUND = 850;

// ---- props -------------------------------------------------------------------
function witchHouse(ctx, x, y, s, t) {
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

function stump(ctx, x, y, s = 1) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-60, 0], [-50, -110], [50, -110], [60, 0], [80, 10], [-80, 10]], { fill: '#8A6448', lw: 5 });
    shape(ctx, [[10, -110], [50, -110], [60, 0], [80, 10], [20, 10]], { fill: '#6E523E', stroke: null });
    ellipse(ctx, 0, -110, 50, 16, { fill: '#D9B98A', lw: 4.5 });
    ellipse(ctx, 0, -110, 26, 8, { fill: null, stroke: '#B38D63', lw: 3 });
  });
}

const leafR = rng(77);
const LEAVES = Array.from({ length: 150 }, () => [leafR(), leafR(), leafR(), leafR()]);
const LEAF_COLS = ['#D9A049', '#C9744F', '#B98B5E', '#E6B866', '#9A7049', '#D48A5A'];

// debris hut in side view. build: 0..3 (pole, ribs, leaves)
function debrisHut(ctx, x0, gy, t, build, opt = {}) {
  const sx = x0, ex = x0 + 700;
  const topY = gy - 115;
  const poleY = (x) => lerp(topY, gy - 6, (x - sx) / (ex - sx));
  stump(ctx, sx, gy);
  const pp = clamp(build);
  if (pp > 0) {
    const dropY = lerp(-400, 0, E.outBounce(pp));
    tx(ctx, { y: dropY }, () => line(ctx, [[sx - 20, topY + 4], [ex, gy - 6]], { color: '#8A6448', lw: 20, outline: 3 }));
  }
  const rp = clamp(build - 1);
  const nr = 9;
  for (let i = 0; i < nr; i++) {
    const f = (i + 0.5) / nr;
    const k = clamp(rp * nr - i);
    if (k <= 0) continue;
    const px = lerp(sx + 40, ex - 60, f);
    const py = poleY(px);
    const len = gy - py + 12;
    tx(ctx, { x: px, y: py - (1 - E.outBack(k)) * 120, a: k }, () => {
      line(ctx, [[-10, -10], [22, len]], { color: i % 2 ? '#9A7452' : '#7E5C40', lw: 11, outline: 2.5 });
    });
  }
  const lp = clamp(build - 2);
  if (lp > 0) leafPile(ctx, sx, ex, gy, poleY, lp, opt.cut);
}
function leafPile(ctx, sx, ex, gy, poleY, g, cut) {
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const x = lerp(sx - 70, ex + 50, i / 20);
    const base = x < sx + 30 ? lerp(gy, poleY(sx) - 40, clamp((x - (sx - 70)) / 100)) : poleY(clamp(x, sx, ex)) - 55;
    const h = lerp(gy, Math.min(gy, base) + Math.sin(i * 1.7) * 10, E.outCubic(g));
    pts.push([x, h]);
  }
  pts.push([ex + 50, gy + 10], [sx - 70, gy + 10]);
  shape(ctx, pts, { fill: '#B98A55', lw: 5, smooth: false });
  // leaf texture
  for (let i = 0; i < LEAVES.length; i++) {
    const [a, b, c, d] = LEAVES[i];
    const x = lerp(sx - 40, ex + 20, a);
    const top = x < sx + 30 ? lerp(gy, poleY(sx) - 30, clamp((x - (sx - 70)) / 100)) : poleY(clamp(x, sx, ex)) - 45;
    const y = lerp(gy, lerp(top, gy, b * 0.85), E.outCubic(g));
    if (y > gy - 4) continue;
    ellipse(ctx, x, y, 16, 8, { fill: LEAF_COLS[i % LEAF_COLS.length], stroke: 'rgba(47,59,62,0.5)', lw: 2, rot: c * 3, wob: 0.4 });
  }
}

function stream(ctx, t, y0 = 900, h = 120) {
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

function cattailPlant(ctx, x, wy, t) {
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
function potato(ctx, x, y, s, t, face = true) {
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
function plate(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    ellipse(ctx, 6, 14, 250, 80, { fill: 'rgba(20,25,30,0.2)', stroke: null, wob: 0 });
    ellipse(ctx, 0, 0, 250, 80, { fill: P.white, lw: 6 });
    ellipse(ctx, 0, 0, 180, 54, { fill: null, stroke: '#D9D3C6', lw: 4 });
  });
}

// Greg lying inside the hut with his head poking out of the entrance
function gregInHut(ctx, t, o = {}) {
  drawPerson(ctx, { x: 640, y: GROUND - 56, s: 0.95, costume: 'greg', t, id: 1, rot: -Math.PI / 2, pose: o.pose || 'stand', expr: o.expr || 'smile', noShadow: true, hat: o.hat, look: [0, 0] });
}

export function build() {
  const c = cues(66);
  const shots = [];
  const tFirst = c('first stop'), tThink = c('think oregon'), tOregon = c('oregon'), tGermany = c('germany'), tWitch = c('fairy tale witch');
  const tLucky = c('honestly greg got lucky'), tLucky2 = c('lucky'), tTut = c('this is the tutorial');
  const tMost = c('most people think'), tFire = c('is fire'), tNot = c('it\'s not'), tShelter = c('it\'s shelter');
  const tBuilds = c('so greg builds'), tProps = c('he props'), tLeans = c('leans smaller'), tBuries = c('and buries');
  const tCrawl = c('then he crawls'), tBurrito = c('human burrito'), tLeaves = c('leaves trap air'), tAir = c('air traps heat');
  const tUgly = c('ugly'), tItchy = c('itchy'), tWorks = c('and it works');
  const tWater = c('water\'s easy'), tPara = c('they might have tiny'), tDoctors = c('what doctors call'), tGastro = c('gastrointestinal');
  const tEveryone = c('and what everyone else'), tBadWeek = c('really bad week'), tBeats = c('but a bad week beats'), tBeats2 = c('beats');
  const tDrinks = c('so he drinks');
  const tFood = c('food is a journey'), tJourney = c('journey'), tCattail = c('cattail roots'), tSwamp = c('swamp potatoes');
  const tBugs = c('and then there are bugs'), tNotOk = c('greg is not okay');
  const tFireH = c('for fire he can try'), tDrill = c('hand drill'), tSpin = c('that means spinning'), tWood = c('another piece of wood'), tFriction = c('friction'), tEmber = c('glowing ember');
  const tPossible = c('it\'s possible'), tFrust = c('it\'s also one of the most'), tHumans = c('humans lived in forests'), tHands = c('nothing but their hands');
  const tCan = c('greg can too'), tClock = c('survival clock'), tIndef = c('indefinitely'), tEnjoy = c('enjoy it buddy'), tDown = c('it\'s all downhill'), tAmazon = c('the amazon rainforest');

  shots.push(levelShot('forest', tFirst, tThink));
  shots.push(wipeShot(tThink, P.sageD, 7, 0.3));

  // ---- arrival, Oregon/Germany/witch, lucky, tutorial ----
  shots.push({
    a: tThink, b: tMost,
    draw(ctx, t) {
      const camX = keys(t, [[tThink, 960], [tWitch, 960], [tWitch + 1.0, 1250], [tLucky, 1250], [tLucky + 0.8, 960]]);
      const camZ = keys(t, [[tThink, 1.0], [tLucky, 1.0], [tLucky + 0.8, 1.4], [tTut, 1.4], [tTut + 0.6, 1.15]]);
      const camY = keys(t, [[tThink, 540], [tLucky, 540], [tLucky + 0.8, 600], [tTut, 600], [tTut + 0.6, 560]]);
      withCam(ctx, { x: camX, y: camY, z: camZ }, () => {
        forestBG(ctx, t, { camX });
        if (t > tWitch - 0.3) {
          const wp = prog(t, tWitch - 0.3, 0.7, E.outBack);
          ctx.save();
          witchHouse(ctx, 1640, 780 + (1 - wp) * 380, 0.9, t);
          ctx.restore();
          pine(ctx, 1500, 800, 380, '#86AA7E', '#6E9469', { trunk: '#6E5A48' });
        }
        const d = portalDrop(ctx, t, tThink, 960, GROUND, 150);
        if (d.visible) {
          const lucky = t > tLucky2;
          drawPerson(ctx, { x: 960, y: d.y, s: 1.1, costume: 'greg', pose: !d.landed ? 'panic' : lucky ? 'thumbs' : 'stand', expr: !d.landed ? 'shocked' : lucky ? 'happy' : 'surprised', t, id: 1, squash: d.squash, look: t > tOregon && t < tLucky ? [0.5, -0.2] : [0, 0] });
        }
        dustPuff(ctx, 960, GROUND, tThink + 0.8, t);
        if (t > tOregon) tag(ctx, 'OREGON', 560, 380, { size: 64, font: 'marker', s: popScale(t, tOregon, tLucky, 0.4), bg: P.white, r: -0.06 });
        if (t > tGermany) tag(ctx, 'GERMANY', 1340, 330, { size: 64, font: 'marker', s: popScale(t, tGermany, tLucky, 0.4), bg: P.white, r: 0.05 });
        if (t > tWitch + 0.4) tag(ctx, 'witch (probably)', 1660, 380, { size: 48, s: popScale(t, tWitch + 0.4, tLucky + 0.5, 0.4), bg: P.plumL, r: -0.04 });
        if (t > tLucky2) {
          const s = popScale(t, tLucky2, tTut, 0.4);
          text(ctx, 'LUCKY!', 1160, 470, { size: 90, font: 'bold', color: P.green, stroke: P.ink, sw: 10, s, r: 0.1 });
          for (let i = 0; i < 5; i++) sparkle(ctx, 960 + Math.cos(i * 1.3) * 200, 560 + Math.sin(i * 2.1) * 150, 20 * s * Math.abs(Math.sin(t * 4 + i)), P.mustardL);
        }
      });
      if (t > tTut) {
        const s = prog(t, tTut, 0.4, E.outBack);
        tx(ctx, { x: 960, y: 110, s }, () => {
          rrect(ctx, -330, -60, 660, 120, 20, { fill: P.mustard, lw: 6 });
          text(ctx, 'TUTORIAL LEVEL', 0, 6, { size: 76, font: 'bold', color: P.white, stroke: P.ink, sw: 9 });
        });
        gameTooltip(ctx, 1450, 880, prog(t, tTut + 0.5, 0.4, E.outBack), 'TIP', 'Press [E] to not die.');
      }
    },
  });

  // ---- fire? no: shelter ----
  shots.push({
    a: tMost, b: tBuilds,
    draw(ctx, t) {
      withCam(ctx, { x: 820, y: 560, z: 1.5 }, () => {
        forestBG(ctx, t, { camX: 820 });
        drawPerson(ctx, { x: 760, y: GROUND, s: 1.1, costume: 'greg', pose: 'think', expr: t > tShelter ? 'happy' : 'thinking', t, id: 1 });
        const bp = prog(t, tMost + 0.2, 0.5);
        thoughtBubble(ctx, 1060, 380, 380, 260, bp, 820, 560, (g) => {
          if (t < tShelter) {
            campfire(g, 0, 60, 0.7, t, 1);
            if (t > tNot) crossOut(g, 0, 10, 100, prog(t, tNot, 0.35));
            if (t < tNot) text(g, '#1?', 130, -70, { size: 56, font: 'bold', color: P.coralD });
          } else {
            const hs = popScale(t, tShelter, Infinity, 0.4);
            tx(g, { s: hs }, () => house(g, 0, 10, 1.3));
            checkMark(g, 120, -60, 40, prog(t, tShelter + 0.3, 0.3));
          }
        });
        if (t > tShelter) text(ctx, 'SHELTER FIRST', 1060, 580, { size: 64, font: 'bold', color: P.white, stroke: P.ink, sw: 10, s: popScale(t, tShelter + 0.2, Infinity, 0.4) });
      });
    },
  });

  // ---- build the debris hut ----
  const HX = 520;
  shots.push({
    a: tBuilds, b: tCrawl,
    draw(ctx, t) {
      const camX = keys(t, [[tBuilds, 1000], [tBuries, 1000], [tBuries + 1, 960]]);
      withCam(ctx, { x: camX, y: 600, z: 1.12 }, () => {
        forestBG(ctx, t, { noTrees: true, camX });
        const build = keys(t, [[tProps, 0], [tProps + 0.8, 1, E.linear], [tLeans, 1], [tLeans + 1.8, 2, E.linear], [tBuries, 2], [tBuries + 2.8, 3, E.outCubic]]);
        debrisHut(ctx, HX, GROUND, t, build);
        // Greg working at the right
        const phase = t < tLeans ? 'pole' : t < tBuries ? 'ribs' : 'leaves';
        const armSwing = Math.sin(t * 6);
        drawPerson(ctx, {
          x: 1450, y: GROUND, s: 1.05, costume: 'greg', flip: true, t, id: 1,
          pose: phase === 'leaves' ? { aL: [60 + armSwing * 40, 20], aR: [60 - armSwing * 40, 20] } : 'holdBoth',
          expr: 'determined',
          holdR: phase === 'ribs' ? (g, hx, hy) => stick(g, hx, hy - 10, 170, 1.2 + armSwing * 0.1, 0.8) : null,
        });
        if (phase === 'leaves') {
          for (let i = 0; i < 10; i++) {
            const ph = ((t - tBuries) * 1.1 + i / 10) % 1;
            const x = lerp(1400, 900 - i * 30, ph), y = 700 - Math.sin(ph * Math.PI) * 220;
            ellipse(ctx, x, y, 16, 8, { fill: LEAF_COLS[i % 6], stroke: P.ink, lw: 2, rot: t * 5 + i });
          }
        }
        if (t < tProps) tag(ctx, 'DEBRIS HUT', 900, 300, { size: 80, font: 'marker', s: popScale(t, tBuilds + 0.3, Infinity, 0.4), bg: P.mustardL });
        const steps = [[tProps, '1. long stick on a stump', 250], [tLeans, '2. lean smaller sticks', 330], [tBuries, '3. bury it in leaves', 410]];
        if (t >= tProps) steps.forEach(([ta, str, y], i) => {
          if (t < ta) return;
          tag(ctx, str, 700, y - 60, { size: 50, s: popScale(t, ta, Infinity, 0.4), bg: i === 2 ? P.mustardL : P.white, r: -0.02 });
        });
      });
    },
  });

  // ---- crawl inside, burrito, cross-section, ugly/itchy/works ----
  shots.push({
    a: tCrawl, b: tWater,
    draw(ctx, t) {
      const inCross = t >= tLeaves && t < tUgly;
      if (!inCross) {
        withCam(ctx, { x: keys(t, [[tCrawl, 900], [tBurrito, 900], [tBurrito + 0.5, 800]]), y: 640, z: keys(t, [[tCrawl, 1.12], [tBurrito, 1.12], [tBurrito + 0.5, 1.45]]) }, () => {
          forestBG(ctx, t, { noTrees: true, camX: 820 });
          const crawl = prog(t, tCrawl, 1.3, E.inOutCubic);
          const inside = t > tCrawl + 1.3;
          stump(ctx, HX, GROUND);
          const walkP = clamp(crawl / 0.65), diveP = clamp((crawl - 0.65) / 0.35);
          if (!inside && diveP > 0) {
            // dive: rotate to horizontal and slide into the entrance (behind the pile)
            drawPerson(ctx, { x: lerp(330, 640, diveP), y: GROUND - 60 * diveP, s: 0.95, costume: 'greg', t, id: 1, pose: 'armsUp', expr: 'happy', rot: -diveP * Math.PI / 2, noShadow: true });
          }
          if (inside) gregInHut(ctx, t, { pose: t > tItchy && t < tWorks ? 'scratch' : 'stand', expr: t > tWorks ? 'happy' : t > tUgly ? 'deadpan' : 'smile' });
          debrisHut(ctx, HX + 20, GROUND, t, 3, {});
          if (!inside && diveP <= 0) {
            drawPerson(ctx, { x: lerp(1450, 330, E.inOutSine(walkP)), y: GROUND + 40, s: 1.05, costume: 'greg', t, id: 1, pose: walkPose(t * 1.6), expr: 'smile', look: [-0.6, 0] });
          }
          if (t > tBurrito - 0.2 && t < tLeaves) {
            inset(ctx, 1150, 380, 190, prog(t, tBurrito - 0.2, 0.4), (g) => {
              vgrad(g, -200, 200, [[0, '#F7E3B5'], [1, '#EAC47E']], -200, 200);
              drawPerson(g, { x: 70, y: 22, s: 0.62, costume: 'greg', pose: 'stand', expr: 'happy', t, id: 1, noShadow: true, rot: -Math.PI / 2 });
              tx(g, { x: 60, y: 20, r: -0.08 }, () => {
                rrect(g, -120, -70, 300, 140, 60, { fill: '#EFD39A', lw: 5 });
                for (let i = 0; i < 5; i++) ellipse(g, -70 + i * 50, -20 + (i % 2) * 30, 12, 7, { fill: '#C9954F', stroke: null, rot: i });
                line(g, [[-120, 0], [-150, -30], [-120, -50]], { color: '#EFD39A', lw: 30, outline: 2.5, smooth: true });
                for (let i = 0; i < 4; i++) ellipse(g, -118, -60 + i * 36, 14, 8, { fill: ['#6FA062', '#D9544A', '#EDC468', '#6FA062'][i], lw: 2.5, rot: i });
              });
            }, { handle: true });
            text(ctx, 'HUMAN BURRITO', 1150, 640, { size: 64, font: 'bold', color: P.mustard, stroke: P.ink, sw: 9, s: popScale(t, tBurrito, Infinity, 0.4), r: -0.04 });
          }
          if (t >= tUgly) {
            stamp(ctx, 'UGLY', 1080, 360, { p: prog(t, tUgly, 0.35), size: 80, color: P.coralD, r: -0.15 });
            if (t > tItchy) stamp(ctx, 'ITCHY', 1320, 470, { p: prog(t, tItchy, 0.35), size: 80, color: P.plum, r: 0.1 });
            if (t > tWorks) stamp(ctx, 'IT WORKS ✓', 1180, 600, { p: prog(t, tWorks, 0.35), size: 84, color: P.greenD, r: -0.05 });
          }
        });
      } else {
        // cross-section diagram
        notebookBG(ctx, t, { header: P.sageD });
        text(ctx, 'HOW A DEBRIS HUT WORKS', 960, 120, { size: 72, font: 'marker' });
        const cx = 960, cy = 700;
        // outer leaf layer (A-frame section)
        const outer = [[cx - 470, cy + 130], [cx, cy - 330], [cx + 470, cy + 130]];
        const innerT = [[cx - 250, cy + 130], [cx, cy - 110], [cx + 250, cy + 130]];
        shape(ctx, outer, { fill: '#C49A62', lw: 6 });
        const r2 = rng(5);
        for (let i = 0; i < 70; i++) {
          const u = r2(), v = r2();
          const x = cx + (u - 0.5) * 900, y = cy + 130 - v * 440;
          const half = (cy + 130 - y) * (470 / 460);
          const halfIn = Math.max(0, (cy + 130 - y) * (250 / 240));
          const inOuter = Math.abs(x - cx) < 470 - half * 1.0 + 0 && Math.abs(x - cx) < (470 - (cy + 130 - y) * 470 / 460);
          const inInner = Math.abs(x - cx) < 250 - (cy + 130 - y) * 250 / 240;
          if (!inOuter || inInner) continue;
          ellipse(ctx, x, y, 18, 9, { fill: LEAF_COLS[i % 6], stroke: 'rgba(47,59,62,0.4)', lw: 2, rot: u * 6 });
        }
        // air pockets
        const ap = prog(t, tLeaves + 0.3, 0.8);
        for (let i = 0; i < 26; i++) {
          const u = hash(i * 3.1), v = hash(i * 7.7);
          const y = cy + 110 - v * 400;
          const hw = 470 - (cy + 130 - y) * 470 / 460, hi = 250 - (cy + 130 - y) * 250 / 240;
          if (hw <= Math.max(hi, 0) + 20) continue;
          const side = u > 0.5 ? 1 : -1;
          const x = cx + side * lerp(Math.max(hi, 0) + 14, hw - 14, hash(i * 1.9));
          circle(ctx, x, y, 11 * clamp(ap * 26 - i), { fill: 'rgba(230,242,250,0.95)', lw: 3 });
        }
        shape(ctx, innerT, { fill: '#F3E9D6', lw: 5 });
        line(ctx, [[cx - 520, cy + 130], [cx + 520, cy + 130]], { lw: 6 });
        // Greg inside (head end view)
        tx(ctx, { x: cx + 40, y: cy + 90, s: 1.35 }, () => {
          ellipse(ctx, 0, 30, 150, 36, { fill: P.coral, lw: 5 });
          circle(ctx, -90, 10, 44, { fill: P.skin, lw: 5 });
          line(ctx, [[-104, 8], [-94, 12]], { lw: 4 });
          line(ctx, [[-82, 8], [-72, 12]], { lw: 4 });
          shape(ctx, [[-130, 0], [-110, -30], [-70, -34], [-50, -10], [-70, -20], [-100, -16]], { fill: '#5A4033', lw: 4, smooth: true });
        });
        // heat arrows bouncing
        if (t > tAir) {
          const hp = t - tAir;
          for (let k = 0; k < 5; k++) {
            const a = -Math.PI / 2 + (k - 2) * 0.45;
            const ph = (hp * 0.7 + k * 0.2) % 1;
            const d = ph < 0.5 ? ph * 2 : 2 - ph * 2;
            const r = 40 + d * 170;
            const x = cx + Math.cos(a) * r, y = cy + 90 + Math.sin(a) * r;
            line(ctx, [[x - 12, y + 10], [x, y], [x + 12, y + 10]], { color: P.red, lw: 6 });
            circle(ctx, x, y, 6, { fill: P.coral, stroke: null });
          }
          tag(ctx, 'heat bounces back', 1450, 520, { size: 48, s: popScale(t, tAir + 0.2, Infinity, 0.4), bg: P.coralL });
        }
        callout(ctx, 'dead leaves', 480, 360, 760, 480, prog(t, tLeaves, 0.6));
        callout(ctx, 'trapped air', 1480, 300, 1150, 520, prog(t, tLeaves + 0.5, 0.6), { bg: P.blueL });
      }
    },
  });

  // ---- water: stream, parasites, gastro distress, bad week, vs, drink ----
  shots.push({
    a: tWater, b: tFood,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 560, z: 1.08 }, () => {
        forestBG(ctx, t, {});
        stream(ctx, t, 940, 150);
        const drinking = t > tDrinks;
        drawPerson(ctx, {
          x: 820, y: 930, s: 1.1, costume: 'greg', t, id: 1,
          pose: drinking ? 'drink' : { aL: [30, 20], aR: [30, 20], lL: [40, -70], lR: [40, -70], crouch: 45 },
          expr: drinking ? 'grin' : t > tEveryone ? 'disgusted' : 'smile', look: drinking ? [0, -0.3] : [0.3, 0.5],
        });
        if (drinking) text(ctx, 'gulp', 1000, 520 + Math.sin(t * 8) * 6, { size: 60, font: 'bold', color: P.blueD, stroke: P.white, sw: 8, s: popScale(t, tDrinks + 0.2, Infinity, 0.3), r: 0.1 });
      });
      if (t > tWater && t < tPara) tag(ctx, 'streams = free water', 1350, 300, { size: 58, s: popScale(t, tWater + 0.5, tPara, 0.4), bg: P.blueL });
      // parasites inset
      if (t >= tPara - 0.2 && t < tGastro - 0.1) {
        inset(ctx, 1360, 420, 250, prog(t, tPara - 0.2, 0.4) * (1 - prog(t, tGastro - 0.4, 0.3)), (g) => {
          fillScreenLocal(g, '#CFE6F0', 260);
          for (let i = 0; i < 6; i++) {
            const x = Math.cos(i * 1.1 + t * 0.4) * 140, y = Math.sin(i * 1.7 + t * 0.5) * 120;
            critter(g, x, y, 0.8, t, ['#B7D98B', '#E8A8C8', '#F2D27A'][i % 3], i);
          }
        }, { handle: true });
        text(ctx, 'tiny parasites', 1360, 740, { size: 60, font: 'hand', color: P.ink, stroke: P.white, sw: 10, a: prog(t, tPara, 0.3) * (1 - prog(t, tGastro - 0.4, 0.3)) });
      }
      if (t >= tDoctors && t < tEveryone) {
        const p = prog(t, tGastro - 0.2, 0.4, E.outBack);
        tx(ctx, { x: 1180, y: 330, s: p, r: -0.03 }, () => {
          rrect(ctx, -520, -110, 1040, 220, 20, { fill: P.white, lw: 6 });
          text(ctx, 'DIAGNOSIS:', -480, -60, { size: 40, font: 'bold', color: P.inkL, align: 'left' });
          text(ctx, 'Gastrointestinal Distress', 0, 30, { size: 84, font: 'marker', color: P.blueDD, maxW: 980 });
        });
      }
      if (t >= tEveryone && t < tBeats) {
        dim(ctx, 0.35 * prog(t, tEveryone, 0.3));
        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        text(ctx, 'A REALLY BAD WEEK', 960, 330, { size: 90, font: 'bold', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tEveryone + 0.2, Infinity, 0.4) });
        days.forEach((d, i) => {
          const x = 960 + (i - 3) * 230, y = 560;
          const s = popScale(t, tEveryone + 0.3 + i * 0.12, Infinity, 0.35);
          tx(ctx, { x, y, s }, () => {
            rrect(ctx, -100, -110, 200, 220, 18, { fill: P.white, lw: 5 });
            rrect(ctx, -100, -110, 200, 60, 18, { fill: P.coral, lw: 5 });
            text(ctx, d, 0, -78, { size: 40, font: 'bold', color: P.white });
            const sp = popScale(t, tBadWeek - 0.3 + i * 0.12, Infinity, 0.3);
            tx(ctx, { y: 30, s: sp }, () => {
              circle(ctx, 0, 0, 48, { fill: '#B9D39A', lw: 4.5 });
              line(ctx, [[-22, -10], [-8, -4]], { lw: 4 });
              line(ctx, [[22, -10], [8, -4]], { lw: 4 });
              line(ctx, [[-20, 22], [-10, 16], [0, 22], [10, 16], [20, 22]], { lw: 4, smooth: true });
            });
          });
        });
      }
      if (t >= tBeats && t < tDrinks) {
        dim(ctx, 0.45);
        const p = prog(t, tBeats, 0.4, E.outBack);
        const win = prog(t, tBeats2, 0.35);
        tx(ctx, { x: 560, y: 540, s: p, r: -0.04 }, () => {
          rrect(ctx, -320, -250, 640, 500, 30, { fill: P.white, lw: 6 });
          text(ctx, 'A BAD WEEK', 0, -180, { size: 70, font: 'bold', color: P.greenD });
          circle(ctx, 0, 20, 110, { fill: '#B9D39A', lw: 5 });
          line(ctx, [[-50, 0], [-20, 10]], { lw: 6 });
          line(ctx, [[50, 0], [20, 10]], { lw: 6 });
          line(ctx, [[-40, 70], [-20, 55], [0, 70], [20, 55], [40, 70]], { lw: 6, smooth: true });
          if (win > 0) { text(ctx, 'WINNER', 0, 190, { size: 64, font: 'bold', color: P.mustardD, stroke: P.ink, sw: 8, s: E.outBack(win) }); }
        });
        tx(ctx, { x: 1360, y: 540, s: p, r: 0.04 }, () => {
          rrect(ctx, -320, -250, 640, 500, 30, { fill: P.white, lw: 6 });
          text(ctx, 'DEAD IN 3 DAYS', 0, -180, { size: 64, font: 'bold', color: P.redD });
          skull(ctx, 0, 30, 110, P.white);
          if (win > 0) crossOut(ctx, 0, 20, 150, win);
        });
        text(ctx, 'VS', 960, 540, { size: 130, font: 'bold', color: P.mustard, stroke: P.ink, sw: 12, s: p });
      }
    },
  });

  // ---- food: journey, cattail swamp potatoes, bugs, not okay ----
  shots.push({
    a: tFood, b: tFireH,
    draw(ctx, t) {
      if (t < tCattail) {
        // epic "journey" title card over the forest at dusk
        withCam(ctx, { x: 960, y: 540, z: keys(t, [[tFood, 1.2], [tCattail, 1.0]]) }, () => {
          forestBG(ctx, t, {});
          ctx.fillStyle = 'rgba(214,122,76,0.35)';
          ctx.fillRect(-500, -500, W + 1000, H + 1000);
          drawPerson(ctx, { x: 960, y: GROUND, s: 1.0, costume: 'greg', t, id: 1, pose: 'hips', expr: 'determined', look: [0.7, -0.3] });
        });
        text(ctx, 'FOOD', 960, 260, { size: 180, font: 'marker', color: P.white, stroke: P.ink, sw: 14, s: popScale(t, tFood, Infinity, 0.45) });
        text(ctx, '~ a journey ~', 960, 400, { size: 80, font: 'hand', color: P.white, stroke: P.ink, sw: 10, a: prog(t, tJourney, 0.4) });
        return;
      }
      if (t < tBugs) {
        // swamp cross-section
        vgrad(ctx, -50, 560, [[0, '#CFE3EC'], [1, '#E9EDD9']]);
        shape(ctx, [[-50, 540], [W + 50, 540], [W + 50, H + 50], [-50, H + 50]], { fill: '#8E7456', stroke: null, wob: 0 });
        const wpts = [];
        for (let i = 0; i <= 20; i++) wpts.push([-50 + i * 101, 540 + Math.sin(i + t * 2) * 5]);
        shape(ctx, [...wpts, [W + 50, 660], [-50, 660]], { fill: 'rgba(120,170,190,0.85)', stroke: null, wob: 0 });
        line(ctx, wpts, { color: P.white, lw: 4, smooth: true });
        text(ctx, 'mud', 200, 900, { size: 50, font: 'hand', color: '#5E4A36' });
        for (let k = 0; k < 3; k++) cattailPlant(ctx, 700 + k * 260, 640, t + k);
        // roots
        for (let k = 0; k < 3; k++) {
          const x = 700 + k * 260;
          line(ctx, [[x, 640], [x - 40, 760], [x + 60, 800], [x + 200, 780]], { color: '#D9C6A2', lw: 14, outline: 2.5, smooth: true, p: prog(t, tCattail + 0.3, 0.8) });
        }
        const ps = popScale(t, tSwamp - 0.2, Infinity, 0.45);
        tx(ctx, { x: 1460, y: 800, s: ps }, () => {
          text(ctx, '=', -170, 0, { size: 120, font: 'bold' });
          potato(ctx, 0, 0, 1.4, t);
        });
        tag(ctx, 'SWAMP POTATO', 1460, 960, { size: 60, font: 'bold', s: ps, bg: P.mustardL, r: 0.03 });
        tag(ctx, 'CATTAIL', 960, 130, { size: 70, font: 'marker', s: popScale(t, tCattail, Infinity, 0.4), bg: P.white });
        return;
      }
      // bugs
      const close = t > tNotOk;
      withCam(ctx, { x: close ? 1000 : 960, y: close ? 560 : 560, z: close ? 1.35 : 1.1 }, () => {
        forestBG(ctx, t, { noTrees: true });
        const pull = prog(t, tNotOk + 2.4, 1.0);
        drawPerson(ctx, { x: 720, y: GROUND, s: 1.1, costume: 'greg', t, id: 1, pose: close ? { aL: [12, -8], aR: [60, 40] } : 'stand', expr: close ? 'disgusted' : 'surprised', look: [0.6, 0.4], shiver: close ? 0.6 : 0, sweat: close ? 0.8 : 0 });
        plate(ctx, 1180 + pull * 200, 800, 1);
        bug(ctx, 'beetle', 1080 + pull * 200, 760, 0.8, t, 1);
        bug(ctx, 'grub', 1200 + pull * 200, 780, 0.8, t, 2);
        bug(ctx, 'cricket', 1300 + pull * 200, 760, 0.8, t, 3);
        if (!close) tag(ctx, "CHEF'S SPECIAL", 1200, 560, { size: 56, s: popScale(t, tBugs + 0.3, Infinity, 0.4), bg: P.white, r: 0.04 });
        if (close) {
          // the grub waves hello
          const wv = Math.sin(t * 8) * 0.4;
          line(ctx, [[1230 + pull * 200, 760], [1260 + pull * 200 + wv * 30, 700]], { lw: 5 });
          speech(ctx, 'hi!', 1320 + pull * 200, 620, prog(t, tNotOk + 0.8, 0.3), { size: 56 });
          text(ctx, 'NOPE.', 620, 400, { size: 100, font: 'bold', color: P.red, stroke: P.ink, sw: 10, s: popScale(t, tNotOk + 1.6, Infinity, 0.4), r: -0.08 });
        }
      });
    },
  });

  // ---- fire: hand drill ----
  shots.push({
    a: tFireH, b: tHumans,
    draw(ctx, t) {
      if (t < tSpin) {
        withCam(ctx, { x: 960, y: 580, z: 1.3 }, () => {
          forestBG(ctx, t, { noTrees: true });
          drawPerson(ctx, { x: 760, y: GROUND, s: 1.05, costume: 'greg', t, id: 1, pose: 'holdOut', expr: 'determined', look: [0.5, 0.3], holdR: (g, hx, hy) => stick(g, hx, hy - 60, 200, Math.PI / 2, 0.8) });
          // fireboard on the ground
          rrect(ctx, 1000, GROUND - 30, 360, 40, 10, { fill: '#B38D63', lw: 5 });
          tag(ctx, 'spindle', 520, 470, { size: 44, s: popScale(t, tDrill + 0.3, Infinity, 0.4) });
          tag(ctx, 'fireboard', 1180, 720, { size: 44, s: popScale(t, tDrill + 0.6, Infinity, 0.4) });
        });
        text(ctx, 'THE HAND DRILL', 960, 150, { size: 100, font: 'marker', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tDrill - 0.1, Infinity, 0.45) });
        return;
      }
      // close-up of the drill
      const frustrated = t > tFrust;
      notebookBG(ctx, t, { color: '#EFE3CC' });
      vgrad(ctx, 700, H + 50, [[0, '#A7C58F'], [1, '#8DB07A']]);
      const spinA = Math.sin(t * 16) * 60;
      const smokeK = clamp((t - tWood) / 2.5) * (frustrated ? 1 - prog(t, tFrust, 0.8) : 1);
      withCam(ctx, { x: 960, y: 560, z: 1 }, () => {
        // board
        rrect(ctx, 460, 760, 1000, 80, 16, { fill: '#B38D63', lw: 6 });
        shape(ctx, [[930, 760], [990, 760], [980, 800], [940, 800]], { fill: '#6E523E', stroke: null });
        // spindle with scrolling stripes
        const sx = 960;
        rrect(ctx, sx - 22, 140, 44, 630, 20, { fill: '#C69F74', lw: 5 });
        ctx.save();
        ctx.beginPath(); ctx.rect(sx - 20, 142, 40, 626); ctx.clip();
        for (let i = 0; i < 16; i++) {
          const y = 140 + ((i * 50 + t * 900) % 700);
          line(ctx, [[sx - 22, y], [sx + 22, y + 26]], { color: '#A7825C', lw: 5, wob: 0.3 });
        }
        ctx.restore();
        // hands
        const hy = keys((t * 0.9) % 1, [[0, 260], [1, 600, E.linear]]);
        for (const sd of [-1, 1]) {
          tx(ctx, { x: sx + sd * 90 + (sd < 0 ? spinA : -spinA), y: hy }, () => {
            line(ctx, [[sd * 70, 60], [sd * 260, 260]], { color: P.coral, lw: 70, outline: 3 });
            rrect(ctx, -70 + sd * 20, -70, 140, 140, 50, { fill: frustrated ? '#EFA48C' : P.skin, lw: 5 });
            for (let f = 0; f < 3; f++) line(ctx, [[sd * -40, -40 + f * 30], [sd * 20, -40 + f * 30]], { color: P.skinD, lw: 4 });
          });
        }
        // smoke
        for (let i = 0; i < 8; i++) {
          const ph = (t * 0.6 + i / 8) % 1;
          circle(ctx, sx + 60 + Math.sin(ph * 6 + i) * 60 + ph * 120, 740 - ph * 380, (20 + ph * 60) * smokeK, { fill: 'rgba(200,200,200,0.8)', stroke: null, alpha: (1 - ph) * smokeK });
        }
        // ember
        if (t > tEmber - 0.2) {
          const alive = frustrated ? 1 - prog(t, tFrust + 0.3, 0.5) : 1;
          const pulse = 1 + Math.sin(t * 9) * 0.15;
          if (alive > 0) {
            glow(ctx, sx, 790, 160 * alive, '#FF9A3C', 0.8 * alive);
            circle(ctx, sx, 790, 16 * pulse * alive * prog(t, tEmber - 0.2, 0.4), { fill: '#FF8A3C', lw: 3 });
          }
          if (frustrated && t > tFrust + 0.3 && t < tFrust + 1.3) text(ctx, 'poof.', sx + 140, 700, { size: 64, font: 'hand', color: P.inkL, a: 1 - prog(t, tFrust + 0.9, 0.4) });
        }
        if (t > tFriction && t < tFrust) text(ctx, 'FRICTION!', 1420, 330, { size: 80, font: 'bold', color: P.coral, stroke: P.ink, sw: 9, s: popScale(t, tFriction, Infinity, 0.35), r: 0.08 + wiggle(t, 3, 0.03) });
        if (t > tEmber) tag(ctx, 'tiny glowing ember', 1450, 640, { size: 50, s: popScale(t, tEmber, tFrust, 0.4), bg: P.mustardL });
        if (t > tPossible && t < tFrust) stamp(ctx, 'POSSIBLE ✓', 480, 360, { p: prog(t, tPossible, 0.3), size: 80, color: P.greenD, r: -0.1 });
        if (frustrated) {
          meter(ctx, 250, 250, 560, 64, prog(t, tFrust + 0.2, 1.6, E.outCubic), P.red, 'FRUSTRATION', { size: 52 });
          if (t > tFrust + 1.8) text(ctx, 'MAX!', 930, 282, { size: 70, font: 'bold', color: P.red, stroke: P.ink, sw: 8, s: popScale(t, tFrust + 1.8, Infinity, 0.3) * (1 + Math.sin(t * 20) * 0.05) });
          drawPerson(ctx, { x: 1560, y: 1010, s: 1.2, costume: 'greg', t, id: 1, pose: 'panic', expr: 'angry', shiver: 1, look: [0, -0.8] });
        }
      });
    },
  });

  // ---- ancient humans / greg can too ----
  shots.push({
    a: tHumans, b: tEnjoy,
    draw(ctx, t) {
      const ancient = t < tCan;
      withCam(ctx, { x: 960, y: 560, z: ancient ? keys(t, [[tHumans, 1.15], [tCan, 1.0]]) : 1.1 }, () => {
        forestBG(ctx, t, { noTrees: true });
        debrisHut(ctx, 260, GROUND, t, 3);
        campfire(ctx, 1080, GROUND + 10, 0.9, t);
        if (ancient) {
          drawPerson(ctx, { x: 860, y: GROUND + 20, s: 0.95, costume: 'caveman', pose: 'holdOut', expr: 'smile', t, id: 21, look: [0.6, 0] });
          drawPerson(ctx, { x: 1300, y: GROUND + 20, s: 0.9, costume: 'caveman', pose: 'wave', expr: 'happy', t, id: 22, look: [-0.6, 0], flip: true });
          drawPerson(ctx, { x: 1520, y: GROUND + 30, s: 0.6, costume: 'caveman', pose: 'cheer', expr: 'happy', t, id: 23 });
        } else {
          drawPerson(ctx, { x: 860, y: GROUND + 20, s: 1.0, costume: 'greg', pose: 'cheer', expr: 'happy', t, id: 1, look: [0.5, 0] });
        }
      });
      if (ancient) {
        sepia(ctx, 0.85);
        // cave-art hand prints
        for (let i = 0; i < 4; i++) {
          const x = [140, 1780, 200, 1720][i], y = [160, 200, 900, 880][i];
          tx(ctx, { x, y, r: i, a: 0.35 }, () => {
            circle(ctx, 0, 0, 34, { fill: '#9A5A3A', stroke: null });
            for (let f = 0; f < 5; f++) rrect(ctx, -30 + f * 14, -80 + Math.abs(f - 2) * 8, 11, 50, 5, { fill: '#9A5A3A', stroke: null });
          });
        }
        text(ctx, 'THOUSANDS OF YEARS', 960, 180, { size: 92, font: 'marker', color: P.white, stroke: '#5E4A36', sw: 12, s: popScale(t, tHumans + 0.8, Infinity, 0.45) });
        if (t > tHands) text(ctx, '(just hands)', 960, 290, { size: 60, font: 'hand', color: P.white, stroke: '#5E4A36', sw: 8, a: prog(t, tHands, 0.3) });
      } else {
        text(ctx, 'GREG CAN TOO!', 960, 200, { size: 100, font: 'bold', color: P.green, stroke: P.ink, sw: 12, s: popScale(t, tCan, Infinity, 0.4), r: -0.04 });
      }
    },
  });
  shots.push(clockShot('forest', tClock, tEnjoy, 'INDEFINITELY', '(until he gets bored)'));
  // infinity symbol on the clock card
  shots.push({ a: tIndef + 0.3, b: tEnjoy, draw(ctx, t) { const p = popScale(t, tIndef + 0.3, tEnjoy, 0.4, 0.3); infinity(ctx, 1190, 460, p * 0.8, P.greenD); } });

  // ---- enjoy it buddy ----
  shots.push({
    a: tEnjoy, b: tDown,
    draw(ctx, t) {
      withCam(ctx, { x: 760, y: 640, z: 1.45 }, () => {
        forestBG(ctx, t, { noTrees: true, camX: 760 });
        gregInHut(ctx, t, { pose: { aL: [150, 60], aR: [150, 60] }, expr: 'proud', hat: sunglasses });
        debrisHut(ctx, HX + 20, GROUND, t, 3);
        campfire(ctx, 1200, GROUND + 10, 0.8, t);
        speech(ctx, 'ahh.', 330, 560, prog(t, tEnjoy + 0.3, 0.3), { size: 60 });
      });
    },
  });

  // ---- downhill from here ----
  shots.push({
    a: tDown, b: tAmazon,
    draw(ctx, t) {
      notebookBG(ctx, t);
      const lt = t - tDown;
      const pts = [[220, 260], [560, 300], [900, 520], [1240, 700], [1600, 900]];
      line(ctx, [[160, 180], [160, 960], [1780, 960]], { lw: 6 });
      text(ctx, 'fun', 120, 560, { size: 50, font: 'hand', r: -Math.PI / 2 });
      text(ctx, 'levels', 960, 1020, { size: 50, font: 'hand' });
      arrow(ctx, 1040, 1020, 1160, 1020, { bend: 0, lw: 5, head: 16 });
      const lp = prog(lt, 0, 1.0, E.inOutCubic);
      line(ctx, pts, { color: P.red, lw: 12, p: lp, smooth: true, outline: 2 });
      ['1', '2', '3', '4', '5'].forEach((n, i) => { if (lp > i / 4 - 0.05) circle(ctx, pts[i][0], pts[i][1], 26, { fill: [P.sage, P.greenD, P.mustard, P.blue, P.plum][i], lw: 5 }); });
      const gp = clamp(lt / 1.8);
      const idx = gp * 4;
      const i0 = Math.min(3, Math.floor(idx)), f = idx - i0;
      const gx = lerp(pts[i0][0], pts[i0 + 1][0], f), gy = lerp(pts[i0][1], pts[i0 + 1][1], f);
      const ang = Math.atan2(pts[i0 + 1][1] - pts[i0][1], pts[i0 + 1][0] - pts[i0][0]);
      drawPerson(ctx, { x: gx, y: gy - 10, s: 0.7, costume: 'greg', t, id: 1, pose: 'panic', expr: 'scared', rot: ang * 0.7, noShadow: true });
      text(ctx, "IT'S ALL DOWNHILL FROM HERE", 1100, 170, { size: 70, font: 'marker', s: popScale(lt, 0.1, Infinity, 0.4) });
    },
  });
  shots.push(wipeShot(tAmazon, '#3F6F55', 11));
  return shots;
}

function fillScreenLocal(g, color, r) {
  g.fillStyle = color;
  g.fillRect(-r, -r, r * 2, r * 2);
}
function speech(ctx, str, x, y, p, opt) {
  return speechBubble(ctx, str, x, y, p, opt);
}
import { speech as speechBubble } from '../ui.js';
