// 2:35 - 4:24  Level 2: the Amazon rainforest.
import { E, cues, H, W, prog, popScale, lerp, clamp, mix, wiggle, rng } from '#lib/engine/core.js';
import { tx, tag, P, shape, circle, line, rrect, star, text, ellipse, stamp, glow, vgrad, arrow, fillScreen, checkMark } from '#lib/engine/draw.js';
import { drawPerson, walkPose } from '#lib/characters/person.js';
import { jungleBG, bigLeaf, notebookBG, cloud } from '#lib/world/backgrounds.js';
import { keys, withCam, banner, skull, shake, speech, inset, calendarPage, panel, flash } from '#lib/ui.js';
import { wipeShot, portalDrop, dustPuff, sepia, dim } from '#lib/kit.js';
import { levelShot, clockShot } from '../levels.js';
import { jaguar, anaconda, ant, mosquito, plane, parrot, wasp, botfly, frog, critter, tallTree, agouti, bug, stormCloud, bolt, callout } from '#lib/props/index.js';

const GROUND = 850;

function foot(ctx, x, y, s, stage) {
  tx(ctx, { x, y, s }, () => {
    const c = stage === 0 ? P.skin : stage === 1 ? '#EFE2D2' : '#F0B5A0';
    shape(ctx, [[-90, 40], [-100, -10], [-70, -40], [20, -40], [90, -20], [110, 10], [100, 40]], { fill: c, lw: 5, smooth: true });
    for (let i = 0; i < 5; i++) circle(ctx, 104 - i * 4, -34 + i * 16, 14 - i * 1.5, { fill: c, lw: 4 });
    if (stage >= 1) for (let i = 0; i < 6; i++) line(ctx, [[-60 + i * 25, -20], [-50 + i * 25, 0], [-60 + i * 25, 20]], { color: '#BFAE98', lw: 3, smooth: true });
    if (stage >= 2) {
      for (const [a, b] of [[-40, 10], [20, -10], [60, 20]]) circle(ctx, a, b, 16, { fill: 'rgba(219,86,70,0.5)', stroke: null });
      line(ctx, [[-20, 30], [0, 20], [-6, 6], [10, -6]], { color: P.redD, lw: 3 });
    }
  });
}
function seatJuliane(ctx, x, y, s, t, r = 0) {
  tx(ctx, { x, y, s, r }, () => {
    rrect(ctx, -80, -250, 150, 240, 40, { fill: P.blueD, lw: 5 });
    drawPerson(ctx, { x: 0, y: 40, s: 0.8, costume: 'juliane', pose: { aL: [40, 60], aR: [40, 60], crouch: 40 }, expr: 'scared', t, id: 31, noShadow: true });
    rrect(ctx, -100, -60, 200, 70, 22, { fill: P.blue, lw: 5 });
    line(ctx, [[-60, -70], [60, -70]], { color: '#8C969A', lw: 12, outline: 2 });
    rrect(ctx, -14, -80, 28, 22, 4, { fill: '#C4CDD1', lw: 3 });
    rrect(ctx, -110, -130, 30, 110, 12, { fill: P.blue, lw: 4.5 });
    rrect(ctx, 80, -130, 30, 110, 12, { fill: P.blue, lw: 4.5 });
  });
}
function bacon(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    const pts = [], pts2 = [];
    for (let i = 0; i <= 10; i++) { pts.push([-120 + i * 24, Math.sin(i * 1.2) * 16 - 26]); pts2.unshift([-120 + i * 24, Math.sin(i * 1.2) * 16 + 26]); }
    shape(ctx, [...pts, ...pts2], { fill: '#C9644F', lw: 5, smooth: true });
    const mid = pts.map(([a, b]) => [a, b + 24]);
    line(ctx, mid, { color: '#F3CFB5', lw: 10, smooth: true });
  });
}

export function build() {
  const c = cues(154);
  const shots = [];
  const tAmazon = c('the amazon rainforest'), tHot = c('hot'), tWet = c('wet'), tLoud = c('loud'), tBite = c('bite greg'), tSting = c('sting greg'), tEggs = c('lay eggs');
  const tGood = c('good news first'), tEvery = c('water is everywhere'), tRains = c('it rains so much'), tLeaf = c('big leaf'), tMouth = c('mouth open');
  const tBad = c('bad news'), tElse = c('everything else');
  const tThink = c('you\'d think the danger'), tJag = c('jaguars'), tAna = c('anacondas'), tNot = c('it\'s not', 177), tNothing = c('they mostly want');
  const tTiny = c('the real danger is tiny'), tMosq = c('mosquitoes carry disease');
  const tCuts = c('small cuts'), tInfected = c('get infected'), tBecause = c('because a place'), tResort = c('luxury resort');
  const tFeet = c('and then there are his feet'), tWetDay = c('when they\'re wet'), tSoft = c('skin goes soft'), tBreak = c('starts to break down');
  const tWW = c('soldiers in world war'), tTrench = c('trench foot'), tTues = c('the jungle calls it');
  const tFood = c('food', 204), tMost = c('most of it is'), tPoison = c('poisonous'), tRun = c('or running away');
  const tGrubs = c('so greg eats grubs'), tBacon = c('some people say'), tLying = c('those people are lying');
  const tSurvive = c('but people do survive'), t1971 = c('in nineteen seventy one'), tSeventeen = c('a seventeen year old'), tPlane = c('was on a plane'), tBroke = c('broke apart'), tPeru = c('over the peruvian');
  const tFell = c('she fell about'), tKm = c('three kilometers'), tSeat = c('still strapped'), tLived = c('and lived');
  const tThen = c('then with a broken'), tCollar = c('broken collarbone'), tSandal = c('and one sandal'), tWalked = c('she walked out');
  const tEleven = c('it took her'), tTrick = c('her trick'), tDad = c('from her dad'), tStream = c('find a stream'), tFollow = c('follow it downhill');
  const tRivers = c('streams become rivers'), tLive = c('and rivers are where');
  const tPlan = c('so that\'s greg\'s plan'), tFW = c('follow the water'), tEG = c('eat the grubs'), tDGC = c('don\'t get cut');
  const tClock = c('survival clock'), tFast = c('the jungle doesn\'t kill'), tSlowly = c('it kills you slowly'), tBiteT = c('one bite at a time');
  const tNext = c('and if you think the next'), tClose = c('not even close'), tSahara = c('the sahara');

  shots.push(levelShot('jungle', tAmazon, tHot));
  shots.push(wipeShot(tHot, '#3F6F55', 13, 0.3));

  // ---- arrival: hot, wet, loud, bite/sting/eggs ----
  shots.push({
    a: tHot, b: tGood,
    draw(ctx, t) {
      const z = keys(t, [[tHot, 1.0], [tBite - 0.4, 1.0], [tBite, 1.2]]);
      withCam(ctx, { x: 960, y: 560, z }, () => {
        jungleBG(ctx, t, { rain: t > tWet ? prog(t, tWet, 0.6) : 0 });
        const d = portalDrop(ctx, t, tHot - 0.45, 960, GROUND, 150);
        const horror = t > tEggs + 0.3;
        if (d.visible) drawPerson(ctx, { x: 960, y: d.y, s: 1.1, costume: 'greg', pose: !d.landed ? 'panic' : horror ? 'panic' : t > tBite ? 'hug' : 'stand', expr: !d.landed ? 'shocked' : horror ? 'scared' : t > tBite ? 'nervous' : t > tHot ? 'hot' : 'surprised', t, id: 1, squash: d.squash, sweat: t > tHot ? 1 : 0, shiver: horror ? 1 : 0 });
        dustPuff(ctx, 960, GROUND, tHot + 0.35, t, 1, 'rgba(150,190,140,0.8)');
        if (t > tLoud) {
          parrot(ctx, 330, 360, 1, t);
          parrot(ctx, 1620, 300, 0.9, t + 0.5, true);
          const lp = popScale(t, tLoud, Infinity, 0.3);
          text(ctx, 'SQUAWK!', 330, 180, { size: 60, font: 'bold', color: P.red, stroke: P.white, sw: 8, s: lp * (1 + Math.sin(t * 20) * 0.04), r: -0.1 });
          text(ctx, 'HOO HOO!', 1640, 150, { size: 56, font: 'bold', color: P.mustardD, stroke: P.white, sw: 8, s: lp, r: 0.1 });
        }
        if (t > tBite) { tx(ctx, { s: popScale(t, tBite, Infinity, 0.4) }, () => {}); ant(ctx, 660, 820, popScale(t, tBite, Infinity, 0.4) * 1.1, t); }
        if (t > tSting) wasp(ctx, 1280 + Math.sin(t * 3) * 30, 560 + Math.cos(t * 4) * 20, popScale(t, tSting, Infinity, 0.4) * 1.3, t);
        if (t > tEggs) botfly(ctx, 800 + Math.sin(t * 2.5) * 40, 420, popScale(t, tEggs, Infinity, 0.4) * 1.3, t);
      });
      const tags = [[tHot, 'HOT', P.coral, 520], [tWet, 'WET', P.blue, 960], [tLoud, 'LOUD', P.mustard, 1400]];
      if (t < tBite) tags.forEach(([ta, str, col, x]) => { if (t > ta) tag(ctx, str, x, 120, { size: 90, font: 'bold', s: popScale(t, ta, tBite, 0.35), bg: col, color: P.white, r: (x - 960) / 6000 }); });
      if (t > tBite) {
        [[tBite, 'BITE', 560], [tSting, 'STING', 960], [tEggs, 'LAY EGGS IN', 1400]].forEach(([ta, str, x]) => {
          if (t > ta) tag(ctx, str, x, 120, { size: 70, font: 'bold', s: popScale(t, ta, Infinity, 0.35), bg: P.redD, color: P.white });
        });
      }
    },
  });

  // ---- good news: water everywhere / leaf ----
  shots.push({
    a: tGood, b: tBad,
    draw(ctx, t) {
      const leafShot = t > tRains + 0.3;
      withCam(ctx, { x: leafShot ? 900 : 960, y: leafShot ? 520 : 560, z: leafShot ? 1.35 : 1.05 }, () => {
        jungleBG(ctx, t, { rain: t > tEvery ? 1.6 : 0.8 });
        if (!leafShot) {
          drawPerson(ctx, { x: 960, y: GROUND, s: 1.1, costume: 'greg', pose: 'cheer', expr: 'happy', t, id: 1 });
          // puddles
          ellipse(ctx, 700, 900, 160, 26, { fill: 'rgba(140,190,220,0.7)', lw: 3 });
          ellipse(ctx, 1250, 930, 200, 30, { fill: 'rgba(140,190,220,0.7)', lw: 3 });
        } else {
          drawPerson(ctx, { x: 900, y: GROUND, s: 1.1, costume: 'greg', pose: 'hips', expr: t > tMouth - 0.3 ? { eyes: 'happy', mouth: 'open', brows: [0.3, 0.3] } : 'smile', t, id: 1, look: [0.3, -0.8] });
          bigLeaf(ctx, 1500, 150, 800, Math.PI - 0.35, '#4F8250', '#3E6B42', t, 9, { width: 0.4 });
          // stream of water off the leaf tip into Greg's mouth
          const wp = prog(t, tLeaf, 0.5);
          if (wp > 0) {
            const tipX = 760, tipY = 420;
            const pts = [];
            for (let i = 0; i <= 8; i++) pts.push([lerp(tipX, 915, i / 8) + Math.sin(i + t * 10) * 3, lerp(tipY, 480, i / 8)]);
            line(ctx, pts, { color: '#9FC8E4', lw: 12 * wp, outline: 2, smooth: true, p: wp });
            for (let i = 0; i < 4; i++) {
              const ph = (t * 1.5 + i / 4) % 1;
              circle(ctx, lerp(tipX, 915, ph), lerp(tipY, 480, ph), 7, { fill: P.blueL, lw: 2.5 });
            }
          }
        }
      });
      banner(ctx, 'GOOD NEWS', 960, 130, prog(t, tGood, 0.4), P.green);
      if (t > tEvery && !leafShot) text(ctx, 'water: everywhere', 960, 280, { size: 70, font: 'hand', color: P.white, stroke: P.ink, sw: 10, s: popScale(t, tEvery, Infinity, 0.4) });
    },
  });

  // ---- bad news: everything else ----
  shots.push({
    a: tBad, b: tThink,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 560, z: 1.05 }, () => {
        jungleBG(ctx, t, { rain: 0.8 });
        drawPerson(ctx, { x: 960, y: GROUND, s: 1.1, costume: 'greg', pose: 'hug', expr: 'worried', t, id: 1 });
      });
      banner(ctx, 'BAD NEWS', 960, 130, prog(t, tBad, 0.4), P.red);
      if (t > tElse) {
        const icons = [[420, 400, (g) => skull(g, 0, 0, 60)], [1500, 420, (g) => mosquito(g, 0, 0, 0.8, t)], [360, 760, (g) => frog(g, 0, 0, 0.9, t)], [1560, 780, (g) => ant(g, 0, 0, 1, t)], [700, 330, (g) => wasp(g, 0, 0, 1, t)], [1240, 320, (g) => critter(g, 0, 0, 0.9, t, '#B7D98B', 3)]];
        icons.forEach(([x, y, fn], i) => tx(ctx, { x, y, s: popScale(t, tElse + i * 0.08, Infinity, 0.35) }, () => fn(ctx)));
        text(ctx, 'EVERYTHING ELSE', 960, 960, { size: 100, font: 'bold', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tElse, Infinity, 0.4) });
      }
    },
  });

  // ---- jaguars and anacondas ----
  shots.push({
    a: tThink, b: tTiny,
    draw(ctx, t) {
      const scary = t > tJag - 0.2 && t < tNot;
      const bored = t > tNot;
      const leave = prog(t, tNothing + 0.3, 1.4, E.inOutSine);
      const [sx, sy] = shake(t, tJag, 0.35, 14);
      withCam(ctx, { x: 960, y: 560, z: 1.05, sx, sy }, () => {
        jungleBG(ctx, t, {});
        drawPerson(ctx, { x: 960, y: GROUND, s: 1.05, costume: 'greg', pose: scary ? 'panic' : 'stand', expr: scary ? 'scared' : bored ? 'deadpan' : 'worried', t, id: 1, shiver: scary ? 1 : 0, look: bored ? [0.5, 0] : [0, 0] });
        if (t > tJag - 0.2) {
          const jp = prog(t, tJag - 0.2, 0.4, E.outBack);
          jaguar(ctx, lerp(-300, 380, jp) - leave * 900, GROUND - 90, 0.95, t, { angry: scary, bored, yawn: bored ? clamp(Math.sin((t - tNot) * 2)) : 0, flip: leave > 0, walk: leave > 0 && leave < 1 });
        }
        if (t > tAna - 0.1) {
          const ap = prog(t, tAna - 0.1, 0.4, E.outBack);
          anaconda(ctx, lerp(2300, 1560, ap) + leave * 900, GROUND - 40, 0.85, t, { angry: scary, bored, flip: true });
        }
      });
      if (scary) {
        ctx.save();
        ctx.fillStyle = 'rgba(170,30,30,0.22)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        text(ctx, 'DANGER?!', 960, 170, { size: 130, font: 'bold', color: P.red, stroke: P.ink, sw: 12, s: popScale(t, tJag, Infinity, 0.35) * (1 + Math.sin(t * 30) * 0.02) });
      }
      if (bored) {
        stamp(ctx, 'NOPE', 960, 170, { p: prog(t, tNot, 0.3), size: 110 });
        speech(ctx, 'nah.', 540 - leave * 900, 520, prog(t, tNothing, 0.3) * (1 - leave), { size: 60 });
        speech(ctx, 'not hungry.', 1420 + leave * 900, 560, prog(t, tNothing + 0.4, 0.3) * (1 - leave), { size: 50, tailX: 60 });
      }
    },
  });

  // ---- the real danger is tiny + mosquito ----
  shots.push({
    a: tTiny, b: tCuts,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 560, z: 1.1 }, () => {
        jungleBG(ctx, t, {});
        drawPerson(ctx, { x: 820, y: GROUND, s: 1.1, costume: 'greg', pose: 'stand', expr: t > tMosq ? 'worried' : 'thinking', t, id: 1, look: [0.6, -0.2] });
      });
      if (t < tMosq) {
        const mx = keys(t, [[tTiny, 400], [tTiny + 1.2, 1300]]);
        inset(ctx, mx, 420, 170, prog(t, tTiny, 0.35), (g) => {
          tx(g, { s: 2.2, x: -mx * 2.2, y: -420 * 2.2 }, () => { jungleBG(g, t, { noFrame: true }); });
          if (mx > 1100) mosquito(g, 0, 0, 1.2, t, { grin: true });
        }, { handle: true });
        text(ctx, 'THE REAL DANGER IS TINY', 960, 900, { size: 80, font: 'bold', color: P.white, stroke: P.ink, sw: 10, s: popScale(t, tTiny + 0.3, Infinity, 0.4) });
      } else {
        const fx = keys(t, [[tMosq, 2100], [tMosq + 1.6, 1250, E.outCubic]]);
        mosquito(ctx, fx, 420 + Math.sin(t * 4) * 20, 2.2, t, { suitcase: true, grin: true });
        text(ctx, 'MOSQUITOES', 700, 200, { size: 96, font: 'bold', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tMosq, Infinity, 0.4), r: -0.05 });
        text(ctx, 'carry disease (literally)', 700, 300, { size: 58, font: 'hand', color: P.white, stroke: P.ink, sw: 9, a: prog(t, tMosq + 0.6, 0.4) });
      }
    },
  });

  // ---- cuts + bacteria resort ----
  shots.push({
    a: tCuts, b: tFeet,
    draw(ctx, t) {
      notebookBG(ctx, t, { color: '#E9EFE0' });
      // big forearm close-up
      const inf = prog(t, tInfected, 1.2);
      tx(ctx, { x: 520, y: 560 }, () => {
        line(ctx, [[-500, 300], [260, -150]], { color: P.skin, lw: 190, outline: 3 });
        circle(ctx, 300, -175, 110, { fill: P.skin, lw: 6 });
        const cx = -60, cy = 60;
        glow(ctx, cx, cy, 170 * inf, P.red, 0.45 * inf);
        line(ctx, [[cx - 50, cy + 30], [cx + 50, cy - 30]], { color: mix('#C9624F', '#A83A2E', inf), lw: 10 + inf * 8 });
        if (inf > 0.5) for (let i = 0; i < 3; i++) circle(ctx, cx + Math.cos(i * 2) * 40, cy + Math.sin(i * 2) * 30, 10, { fill: '#D9D07A', lw: 2.5, alpha: (inf - 0.5) * 2 });
      });
      tag(ctx, t < tInfected ? 'a tiny cut' : 'infected in DAYS', 520, 200, { size: 64, s: popScale(t, tCuts, Infinity, 0.35), bg: t < tInfected ? P.white : P.coralL });
      if (t > tBecause - 0.2) {
        const p = prog(t, tBecause - 0.2, 0.5);
        inset(ctx, 1320, 520, 380, p, (g) => {
          vgrad(g, -380, 380, [[0, '#F7EBD0'], [1, '#EAD7AE']], -380, 380);
          // pool
          rrect(g, -300, 40, 600, 260, 60, { fill: '#8FD0E8', lw: 6 });
          for (let i = 0; i < 4; i++) line(g, [[-240 + i * 140, 120 + Math.sin(t * 2 + i) * 6], [-180 + i * 140, 116]], { color: P.white, lw: 5 });
          // umbrella
          line(g, [[210, 60], [210, -180]], { lw: 8 });
          shape(g, [[70, -160], [210, -250], [350, -160]], { fill: P.coral, lw: 5 });
          critter(g, -150, 150, 1.0, t, '#B7D98B', 1, { shades: true });
          critter(g, 60, 170, 0.9, t, '#E8A8C8', 2, { shades: true });
          critter(g, 150, -40, 0.9, t, '#F2D27A', 3, { shades: true });
          // drink
          tx(g, { x: 250, y: -40 }, () => { shape(g, [[-20, -40], [20, -40], [8, 20], [-8, 20]], { fill: P.mustardL, lw: 4 }); line(g, [[0, -40], [18, -80]], { color: P.red, lw: 5 }); });
          rrect(g, -250, -280, 420, 100, 16, { fill: P.white, lw: 5 });
          text(g, 'BACTERIA RESORT', -40, -246, { size: 40, font: 'bold', color: P.plumD });
          for (let k = 0; k < 5; k++) star(g, -120 + k * 40, -206, 15, P.mustard, 2.5);
          text(g, 'always hot & wet!', -40, -330, { size: 34, font: 'hand', color: P.inkL });
        });
      }
      if (t > tResort) text(ctx, 'LUXURY RESORT', 1320, 980, { size: 76, font: 'marker', color: P.plumD, stroke: P.white, sw: 10, s: popScale(t, tResort, Infinity, 0.4) });
    },
  });

  // ---- feet ----
  shots.push({
    a: tFeet, b: tFood,
    draw(ctx, t) {
      if (t < tWetDay) {
        withCam(ctx, { x: 960, y: keys(t, [[tFeet, 560], [tFeet + 1.2, 800]]), z: keys(t, [[tFeet, 1.05], [tFeet + 1.2, 1.8]]) }, () => {
          jungleBG(ctx, t, { rain: 1 });
          ellipse(ctx, 960, 870, 260, 40, { fill: 'rgba(140,190,220,0.8)', lw: 3 });
          drawPerson(ctx, { x: 960, y: GROUND + 10, s: 1.1, costume: 'greg', pose: 'stand', expr: 'sad', t, id: 1, look: [0, 0.8] });
          for (let i = 0; i < 4; i++) {
            const ph = (t * 1.2 + i / 4) % 1;
            circle(ctx, 960 + (i - 1.5) * 50 + ph * (i - 1.5) * 40, 860 - Math.sin(ph * Math.PI) * 50, 6, { fill: P.blueL, lw: 2, alpha: 1 - ph });
          }
          text(ctx, 'squish', 1160, 800, { size: 48, font: 'hand', color: P.blueD, stroke: P.white, sw: 6, a: prog(t, tFeet + 0.8, 0.3) });
        });
        return;
      }
      if (t < tWW) {
        notebookBG(ctx, t, { header: P.blueD });
        text(ctx, 'WET FEET, EVERY DAY', 960, 120, { size: 76, font: 'marker' });
        const stages = [[tWetDay, 'normal', 0], [tSoft, 'soft & wrinkly', 1], [tBreak, 'breaking down', 2]];
        stages.forEach(([ta, lbl, st], i) => {
          const s = popScale(t, ta, Infinity, 0.4);
          tx(ctx, { x: 360 + i * 600, y: 520, s }, () => {
            foot(ctx, 0, 0, 2.1, st);
          });
          text(ctx, lbl, 360 + i * 600, 760, { size: 60, font: 'hand', s });
          if (i < 2 && t > stages[i + 1][0]) arrow(ctx, 360 + i * 600 + 220, 520, 360 + (i + 1) * 600 - 220, 520, { p: prog(t, stages[i + 1][0] - 0.2, 0.3), bend: -0.15 });
        });
        return;
      }
      if (t < tTues) {
        // WWI trench (sepia)
        vgrad(ctx, -50, 600, [[0, '#B9B8A8'], [1, '#D8D2BE']]);
        shape(ctx, [[-50, 500], [W + 50, 500], [W + 50, H + 50], [-50, H + 50]], { fill: '#8E7456', stroke: null, wob: 0 });
        for (let i = 0; i < 12; i++) rrect(ctx, -40 + i * 170, 470 - (i % 2) * 20, 180, 70, 30, { fill: '#C9B48E', lw: 5 });
        shape(ctx, [[300, 620], [1620, 620], [1620, H + 50], [300, H + 50]], { fill: '#6E5A48', lw: 5, wob: 0.5 });
        for (let i = 0; i < 8; i++) rrect(ctx, 320 + i * 165, 940, 150, 26, 6, { fill: '#9A7A58', lw: 4 });
        ellipse(ctx, 960, 960, 520, 40, { fill: 'rgba(120,140,140,0.6)', stroke: null });
        drawPerson(ctx, { x: 960, y: 980, s: 1.25, costume: 'soldier', pose: 'hug', expr: 'sad', t, id: 40, shiver: 0.4 });
        sepia(ctx, 0.9);
        text(ctx, 'WORLD WAR I', 960, 170, { size: 80, font: 'marker', color: P.white, stroke: '#5E4A36', sw: 10, s: popScale(t, tWW, Infinity, 0.4) });
        if (t > tTrench - 0.1) stamp(ctx, 'TRENCH FOOT', 960, 330, { p: prog(t, tTrench - 0.1, 0.35), size: 100, color: '#8C3B2E', r: -0.06 });
        return;
      }
      withCam(ctx, { x: 960, y: 560, z: 1.05 }, () => {
        jungleBG(ctx, t, { rain: 1 });
        drawPerson(ctx, { x: 620, y: GROUND, s: 1.1, costume: 'greg', pose: 'shrug', expr: 'deadpan', t, id: 1 });
      });
      calendarPage(ctx, 1260, 520, prog(t, tTues, 0.4, E.outBackBig) * 1.3, 'THE JUNGLE', 'TUESDAY', { bigSize: 76, color: P.greenD, r: 0.06 });
    },
  });

  // ---- food: tree / poison / running; grubs; bacon; lies ----
  shots.push({
    a: tFood, b: tSurvive,
    draw(ctx, t) {
      if (t < tGrubs) {
        withCam(ctx, { x: 960, y: 560, z: 1 }, () => jungleBG(ctx, t, { noFrame: true }));
        dim(ctx, 0.25);
        if (t < tMost) {
          drawPerson(ctx, { x: 960, y: GROUND, s: 1.1, costume: 'greg', pose: 'think', expr: 'thinking', t, id: 1 });
          text(ctx, 'FOOD?', 960, 300, { size: 150, font: 'bold', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tFood, Infinity, 0.4) });
          return;
        }
        const panels = [
          [tMost, 360, '40 m up a tree', (g, w, h) => {
            vgrad(g, -h / 2, h / 2, [[0, '#CFE3C9'], [1, '#9BC08B']], -w / 2, w / 2);
            tallTree(g, 0, 190, 330, t);
            drawPerson(g, { x: -120, y: 190, s: 0.22, costume: 'greg', pose: 'pointUp', expr: 'sad', t, id: 1 });
            line(g, [[140, 180], [140, -140]], { lw: 5 });
            text(g, '40 m', 190, 20, { size: 44, font: 'bold', color: P.redD, r: -Math.PI / 2 });
          }],
          [tPoison, 960, 'poisonous', (g, w, h) => {
            vgrad(g, -h / 2, h / 2, [[0, '#DCE8CF'], [1, '#B5CFA3']], -w / 2, w / 2);
            frog(g, -60, 60, 1.1, t);
            for (let i = 0; i < 5; i++) circle(g, 100 + (i % 3) * 30, -40 + Math.floor(i / 3) * 30, 16, { fill: P.plum, lw: 3.5 });
            skull(g, 110, 110, 40);
          }],
          [tRun, 1560, 'running away', (g, w, h) => {
            vgrad(g, -h / 2, h / 2, [[0, '#E4E9CF'], [1, '#C6D3A8']], -w / 2, w / 2);
            agouti(g, 60 + ((t - tRun) * 120) % 60, 60, 1.1, t);
          }],
        ];
        panels.forEach(([ta, x, cap, fn], i) => panel(ctx, x, 540, 500, 560, prog(t, ta, 0.45), fn, { caption: cap, r: (i - 1) * 0.03 }));
        return;
      }
      withCam(ctx, { x: 960, y: 520, z: 1.3 }, () => {
        jungleBG(ctx, t, {});
        const gag = t > tLying;
        drawPerson(ctx, {
          x: 780, y: GROUND, s: 1.1, costume: 'greg', pose: 'holdOut', expr: gag ? 'disgusted' : t > tBacon ? 'thinking' : 'worried', t, id: 1, look: [0.5, -0.3],
          holdR: (g, hx, hy) => bug(g, 'grub', hx + 30, hy - 30, 0.9, t),
        });
      });
      if (t > tBacon) {
        const s = popScale(t, tBacon, Infinity, 0.4);
        tx(ctx, { x: 1400, y: 360, s }, () => {
          rrect(ctx, -330, -140, 660, 280, 30, { fill: P.white, lw: 6 });
          bug(ctx, 'grub', -200, 0, 1, t);
          text(ctx, '=', -40, 0, { size: 110, font: 'bold' });
          bacon(ctx, 170, 0, 1);
          text(ctx, '?', 300, -110, { size: 90, font: 'bold', color: P.coralD });
        });
      }
      if (t > tLying) {
        stamp(ctx, 'LIES', 1400, 360, { p: prog(t, tLying, 0.35), size: 150, r: -0.15 });
        text(ctx, 'LYING.', 1400, 640, { size: 70, font: 'hand', color: P.white, stroke: P.ink, sw: 8, a: prog(t, tLying + 0.4, 0.3) });
      }
    },
  });

  // ---- TRUE STORY: Juliane Koepcke ----
  shots.push({
    a: tSurvive, b: tPlan,
    draw(ctx, t) {
      // storybook frame
      const story = (fn) => {
        fillScreen(ctx, '#E9DCC0');
        rrect(ctx, 50, 50, W - 100, H - 100, 30, { fill: '#F4EAD5', lw: 6 });
        ctx.save();
        ctx.beginPath();
        ctx.rect(62, 62, W - 124, H - 124);
        ctx.clip();
        fn();
        ctx.restore();
        rrect(ctx, 50, 50, W - 100, H - 100, 30, { fill: null, lw: 8 });
      };
      if (t < t1971) {
        withCam(ctx, { x: 960, y: 560, z: 1 }, () => jungleBG(ctx, t, {}));
        dim(ctx, 0.35);
        drawPerson(ctx, { x: 960, y: GROUND + 60, s: 1.1, costume: 'greg', pose: 'stand', expr: 'surprised', t, id: 1 });
        text(ctx, 'but people DO survive this', 960, 200, { size: 80, font: 'hand', color: P.white, stroke: P.ink, sw: 10, s: popScale(t, tSurvive, Infinity, 0.4) });
        stamp(ctx, 'TRUE STORY', 960, 420, { p: prog(t, tSurvive + 0.8, 0.35), size: 110, color: P.mustard, r: -0.08 });
        return;
      }
      if (t < tPlane) {
        story(() => {
          vgrad(ctx, 0, H, [[0, '#DCE6EA'], [1, '#EDE3CC']]);
          text(ctx, '1971', 560, 520, { size: 300, font: 'marker', color: P.ink, s: prog(t, t1971, 0.5, E.outBack), r: -0.05 });
          if (t > tSeventeen - 0.2) {
            const p = prog(t, tSeventeen - 0.2, 0.5);
            panel(ctx, 1320, 500, 520, 620, p, (g, w, h) => {
              vgrad(g, -h / 2, h / 2, [[0, '#CFE3EC'], [1, '#B8D2C0']], -w / 2, w / 2);
              drawPerson(g, { x: 0, y: 330, s: 1.3, costume: 'juliane', pose: 'stand', expr: 'smile', t, id: 31, noShadow: true });
            }, { caption: 'Juliane Koepcke, 17', r: 0.04 });
          }
        });
        return;
      }
      if (t < tFell) {
        story(() => {
          const stormK = prog(t, tPlane, 1.0);
          vgrad(ctx, 0, H, [[0, mix('#CFE3EC', '#5E6680', stormK)], [1, mix('#EDE3CC', '#8A8FA0', stormK)]]);
          // jungle far below
          shape(ctx, [[0, 880], [W, 880], [W, H], [0, H]], { fill: '#4F7A55', stroke: null, wob: 0 });
          for (let i = 0; i < 20; i++) circle(ctx, i * 100, 880, 60, { fill: i % 2 ? '#5E8B5A' : '#4F7A55', stroke: null });
          for (let i = 0; i < 4; i++) stormCloud(ctx, ((i * 600 - t * 200) % 2400) + 200, 200 + (i % 2) * 120, 1.4);
          const split = prog(t, tBroke, 0.8, E.outCubic);
          const px = 960 + wiggle(t, 2, 20), py = 480 + split * 120;
          plane(ctx, px, py, 1.3, -0.05 + wiggle(t, 3, 0.03), split);
          if (t > tBroke - 0.15 && t < tBroke + 0.4) {
            bolt(ctx, 1000, 80, 1.6);
            flash(ctx, 0.5 * (1 - prog(t, tBroke - 0.15, 0.5)), '#FFFBE0');
          }
          for (let i = 0; i < 3; i++) stormCloud(ctx, ((i * 800 - t * 320) % 2600) + 300, 780, 1.6);
          if (t > tPeru) tag(ctx, 'over the Peruvian jungle', 960, 960, { size: 60, s: popScale(t, tPeru, Infinity, 0.4) });
        });
        return;
      }
      if (t < tThen) {
        story(() => {
          const fallP = clamp((t - tFell) / (tLived - 0.3 - tFell));
          const sky = mix('#AFC8D8', '#D7E6D0', fallP);
          fillScreen(ctx, sky);
          // clouds rushing up
          for (let i = 0; i < 8; i++) {
            const y = ((i * 260 - t * 900) % 1600 + 1600) % 1600 - 200;
            cloud(ctx, 200 + (i * 530) % 1600, y, 1 + (i % 3) * 0.3);
          }
          // canopy arriving at the end
          const canopyY = lerp(H + 400, 820, clamp((fallP - 0.75) / 0.25));
          for (let i = 0; i < 12; i++) circle(ctx, i * 180, canopyY + (i % 2) * 40, 150, { fill: i % 2 ? '#5E8B5A' : '#4F7A55', lw: 5 });
          const landed = t > tLived - 0.3;
          const sy = landed ? 700 : 480 + Math.sin(t * 3) * 20;
          seatJuliane(ctx, 900, sy, 1.1, t, landed ? 0.2 : Math.sin(t * 2) * 0.3);
          if (!landed) for (let i = 0; i < 6; i++) line(ctx, [[760 + i * 50, 220], [760 + i * 50, 120]], { color: 'rgba(255,255,255,0.8)', lw: 5 });
          // altitude meter
          const alt = Math.max(0, Math.round(3000 * (1 - fallP)));
          rrect(ctx, 1480, 180, 300, 620, 24, { fill: P.white, lw: 6 });
          rrect(ctx, 1600, 230, 60, 520, 20, { fill: '#E9E2D2', lw: 4 });
          rrect(ctx, 1600, 230 + 520 * fallP, 60, 520 * (1 - fallP), 20, { fill: P.blue, stroke: null });
          text(ctx, 'ALTITUDE', 1630, 210, { size: 40, font: 'bold' });
          text(ctx, `${alt} m`, 1630, 860, { size: 64, font: 'round', color: P.ink, stroke: P.white, sw: 8 });
          if (t > tSeat) tag(ctx, 'still strapped in her seat', 700, 150, { size: 54, s: popScale(t, tSeat, Infinity, 0.4) });
          if (landed) stamp(ctx, 'SHE LIVED', 700, 400, { p: prog(t, tLived, 0.35), size: 110, color: P.greenD, r: -0.1 });
        });
        return;
      }
      if (t < tTrick) {
        story(() => {
          const camX = (t - tThen) * 160;
          tx(ctx, { x: -camX }, () => {
            jungleBG(ctx, t, { noFrame: true, camX: 960 + camX });
          });
          const days = t > tEleven ? Math.min(11, 1 + Math.floor((t - tEleven) * 8)) : 0;
          const jr = drawPerson(ctx, {
            x: 820, y: GROUND + 40, s: 1.2, costume: 'juliane', pose: { ...walkPose(t * 1.4), aL: [20, -110] }, expr: 'determined', t, id: 31,
          });
          // sling holding the left arm
          const [hx, hy] = jr.handL;
          shape(ctx, [[hx - 40, hy - 30], [hx + 70, hy - 20], [hx + 10, hy + 40]], { fill: P.white, lw: 4.5 });
          line(ctx, [[hx - 30, hy - 26], [820 + 30, GROUND + 40 - 250 * 1.2 + 60]], { color: P.white, lw: 10, outline: 2 });
          callout(ctx, 'broken collarbone', 460, 330, 790, 640, prog(t, tCollar, 0.5), { bend: 0.2 });
          callout(ctx, 'one sandal', 1260, 780, 860, 880, prog(t, tSandal, 0.5), { bend: -0.2 });
          if (t > tEleven) {
            calendarPage(ctx, 1500, 360, popScale(t, tEleven, Infinity, 0.4), 'DAY', String(days), { color: P.greenD });
          }
        });
        return;
      }
      // the stream trick: top-down map
      story(() => {
        fillScreen(ctx, '#6C9A62');
        const r2 = rng(3);
        for (let i = 0; i < 90; i++) circle(ctx, r2() * W, r2() * H, 40 + r2() * 40, { fill: r2() > 0.5 ? '#5E8B5A' : '#79A56C', stroke: null, wob: 0.4 });
        const path = [[200, 180], [420, 300], [560, 480], [820, 560], [1080, 700], [1380, 760], [1700, 900], [2000, 980]];
        const widen = prog(t, tRivers, 1.5);
        const sp = prog(t, tTrick + 0.3, 2.2);
        line(ctx, path, { color: '#8CC4E0', lw: lerp(22, 110, widen), outline: 3, smooth: true, p: sp });
        const jp = popScale(t, tTrick, Infinity, 0.4);
        tx(ctx, { x: 240, y: 150, s: jp }, () => { circle(ctx, 0, 0, 26, { fill: P.sage, lw: 5 }); });
        tag(ctx, 'Juliane', 240, 90, { size: 44, s: jp });
        const fp = prog(t, tFollow, 2.0, E.inOutSine);
        if (fp > 0) {
          // dotted footsteps
          const pts = path.map(([x, y]) => [x + 40, y - 40]);
          line(ctx, pts, { color: P.white, lw: 7, smooth: true, p: fp, dash: [4, 22] });
        }
        if (t > tLive) {
          const vp = popScale(t, tLive, Infinity, 0.45);
          tx(ctx, { x: 1560, y: 690, s: vp }, () => {
            for (let i = 0; i < 4; i++) {
              const hx = (i % 2) * 150 - 60, hy = Math.floor(i / 2) * 120 - 60;
              shape(ctx, [[hx - 50, hy + 20], [hx + 50, hy + 20], [hx + 50, hy - 20], [hx - 50, hy - 20]], { fill: '#C69F74', lw: 4 });
              shape(ctx, [[hx - 64, hy - 14], [hx, hy - 70], [hx + 64, hy - 14]], { fill: P.mustardD, lw: 4 });
            }
          });
          tag(ctx, 'people!', 1560, 520, { size: 60, s: vp, bg: P.mustardL });
        }
        if (t > tDad) {
          tx(ctx, { x: 420, y: 800, s: popScale(t, tDad, Infinity, 0.4), r: -0.05 }, () => {
            rrect(ctx, -260, -110, 520, 220, 16, { fill: '#FFF6D8', lw: 5 });
            text(ctx, "Dad's advice:", 0, -60, { size: 44, font: 'bold', color: P.coralD });
            text(ctx, 'find a stream,', 0, 0, { size: 50, font: 'hand' });
            text(ctx, 'follow it downhill', 0, 54, { size: 50, font: 'hand' });
          });
        }
        if (t > tRivers) tag(ctx, 'stream becomes a river', 900, 420, { size: 56, s: popScale(t, tRivers, Infinity, 0.4) });
      });
    },
  });

  // ---- Greg's plan checklist ----
  shots.push({
    a: tPlan, b: tFast,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 560, z: 1.05 }, () => {
        jungleBG(ctx, t, {});
        drawPerson(ctx, { x: 560, y: GROUND, s: 1.1, costume: 'greg', pose: 'present', expr: 'determined', t, id: 1, look: [0.6, 0] });
      });
      tx(ctx, { x: 1280, y: 540, s: prog(t, tPlan, 0.45, E.outBack), r: 0.03 }, () => {
        rrect(ctx, -380 + 10, -300 + 14, 760, 600, 20, { fill: 'rgba(20,25,30,0.25)', stroke: null, wob: 0 });
        rrect(ctx, -380, -300, 760, 600, 20, { fill: '#FBF6E8', lw: 6 });
        bigLeaf(ctx, 330, -270, 180, -0.7, P.sage, P.sageD, t, 1, { veins: false });
        text(ctx, "GREG'S PLAN", 0, -200, { size: 84, font: 'marker', color: P.ink });
        const items = [[tFW, 'follow the water'], [tEG, 'eat the grubs'], [tDGC, "don't get cut"]];
        items.forEach(([ta, str], i) => {
          const y = -60 + i * 120;
          rrect(ctx, -310, y - 30, 60, 60, 10, { fill: P.white, lw: 4.5 });
          line(ctx, [[-220, y + 40], [320, y + 40]], { color: 'rgba(95,131,179,0.35)', lw: 3 });
          if (t < ta) return;
          text(ctx, str, -220, y, { size: 66, font: 'hand', align: 'left', a: prog(t, ta, 0.3) });
          checkMark(ctx, -280, y, 26, prog(t, ta + 0.15, 0.3), { lw: 11 });
        });
      });
    },
  });
  shots.push(clockShot('jungle', tClock, tFast, 'A FEW WEEKS', '(slowly, one bite at a time)'));

  // ---- one bite at a time ----
  shots.push({
    a: tFast, b: tNext,
    draw(ctx, t) {
      const camX = 960 + (t - tFast) * 90;
      withCam(ctx, { x: camX, y: 560, z: 1.15 }, () => {
        jungleBG(ctx, t, { camX, noFrame: true });
        const gx = camX - 150;
        const bites = t > tSlowly ? Math.floor((t - tSlowly) * 5) : 0;
        const r = rng(9);
        drawPerson(ctx, { x: gx, y: GROUND, s: 1.1, costume: 'greg', pose: walkPose(t * 1.2), expr: bites > 6 ? 'exhausted' : 'determined', t, id: 1, look: [0.6, 0] });
        for (let i = 0; i < Math.min(bites, 30); i++) {
          const bx = gx + (r() - 0.5) * 120, by = GROUND - 60 - r() * 260;
          circle(ctx, bx, by, 7, { fill: P.red, lw: 2.5 });
        }
        for (let i = 0; i < 6; i++) mosquito(ctx, gx + Math.sin(t * 2 + i * 1.3) * 200, 420 + Math.cos(t * 2.4 + i) * 120, 0.5, t + i);
      });
      const bites = t > tSlowly ? Math.floor((t - tSlowly) * 5) : 0;
      if (t > tSlowly) {
        tx(ctx, { x: 1560, y: 170, s: popScale(t, tSlowly, Infinity, 0.4) }, () => {
          rrect(ctx, -220, -70, 440, 140, 24, { fill: P.white, lw: 6 });
          text(ctx, `BITES: ${bites}`, 0, 6, { size: 72, font: 'bold', color: P.red });
        });
      }
      if (t < tSlowly) text(ctx, "the jungle doesn't kill you fast...", 960, 170, { size: 70, font: 'hand', color: P.white, stroke: P.ink, sw: 10, a: prog(t, tFast, 0.4) });
      if (t > tBiteT) text(ctx, 'one bite at a time', 700, 170, { size: 76, font: 'marker', color: P.white, stroke: P.ink, sw: 10, s: popScale(t, tBiteT, Infinity, 0.4) });
    },
  });

  // ---- not even close ----
  shots.push({
    a: tNext, b: tSahara,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.red });
      text(ctx, 'WORST PLACE ON THE LIST?', 960, 130, { size: 76, font: 'marker' });
      const flip = prog(t, tClose, 0.7, E.inOutCubic);
      const rows = [['THE SAHARA?', P.mustardD, 0, 2], ['???', P.blueD, 1, 0], ['???', P.plum, 2, 1]];
      rows.forEach(([lbl, col, from, to], i) => {
        const s = popScale(t, tNext + i * 0.2, Infinity, 0.4);
        const y = 330 + lerp(from, to, flip) * 200;
        const place = flip > 0.5 ? to + 1 : from + 1;
        tx(ctx, { x: 960 + (i === 0 ? Math.sin(flip * Math.PI) * 120 : 0), y, s }, () => {
          rrect(ctx, -540, -80, 1080, 160, 28, { fill: P.white, lw: 6 });
          text(ctx, `#${place}`, -450, 6, { size: 80, font: 'bold', color: col });
          text(ctx, lbl, 20, 6, { size: 72, font: 'bold', color: P.ink });
          if (i > 0 && flip > 0.5) { skull(ctx, 400, 0, 40); skull(ctx, 460, 0, 40); }
        });
      });
      if (flip > 0) stamp(ctx, 'NOT EVEN CLOSE', 1480, 940, { p: prog(t, tClose + 0.3, 0.35), size: 76, r: -0.1 });
    },
  });
  shots.push(wipeShot(tSahara, '#D08A4C', 17));
  return shots;
}
