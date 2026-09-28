// 9:02 - end  Final scoreboard, the people who actually live there, and the moral.
import { P, shape, circle, ellipse, line, tx, text, tag, stamp, rrect, arrow, crossOut, checkMark, glow, swash, fillScreen, vgrad, measure, star } from '../engine/draw.js';
import { W, H, E, clamp, lerp, prog, vis, popScale, cues, wiggle, TAU, hash, rng, mix, loudness } from '../engine/core.js';
import { drawPerson, walkPose } from '../chars/person.js';
import { withCam, keys, panel, speech, skull, stopwatch, sparkle, flash } from '../ui.js';
import { arcticBG, desertBG, jungleBG, forestBG, oceanBG, notebookBG, labBG, bigLeaf } from '../bg.js';
import { knife, lighter, campfire, biomeIcon, infinity } from '../props.js';
import { LEVELS, dim } from './common.js';
import { drawWorld, proj, PLACES } from '../worldmap.js';

function igloo(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-200, 0], [-190, -90], [-120, -170], [0, -200], [120, -170], [190, -90], [200, 0]], { fill: '#F4F8FB', lw: 6, smooth: true });
    for (let r = 1; r < 4; r++) line(ctx, [[-200 + r * 12, -r * 50], [200 - r * 12, -r * 50]], { color: '#C9DCE8', lw: 4 });
    shape(ctx, [[-70, 0], [-70, -60], [0, -100], [70, -60], [70, 0]], { fill: '#3F4F5C', lw: 5, smooth: true });
  });
}
function camel(ctx, x, y, s, t) {
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
function stiltHouse(ctx, x, y, s, c = P.mustardD) {
  tx(ctx, { x, y, s }, () => {
    for (const lx of [-80, 0, 80]) line(ctx, [[lx, 0], [lx, -120]], { color: '#8A6448', lw: 14, outline: 2 });
    rrect(ctx, -110, -240, 220, 130, 8, { fill: '#C69F74', lw: 5 });
    shape(ctx, [[-150, -230], [0, -340], [150, -230]], { fill: c, lw: 5 });
    rrect(ctx, -30, -210, 60, 100, 6, { fill: '#7A5B45', lw: 4 });
  });
}
function canoe(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-200, -20], [200, -20], [150, 30], [-150, 30]], { fill: '#9A6B3E', lw: 5, smooth: true });
    line(ctx, [[60, -120], [120, 40]], { color: '#8A6448', lw: 10, outline: 2 });
  });
}
function book(ctx, x, y, s, t) {
  tx(ctx, { x, y, s, r: Math.sin(t * 2) * 0.05 }, () => {
    glow(ctx, 0, 0, 140, '#FFE9A0', 0.8);
    shape(ctx, [[-90, -60], [0, -40], [90, -60], [90, 60], [0, 80], [-90, 60]], { fill: P.white, lw: 5 });
    line(ctx, [[0, -40], [0, 80]], { lw: 4 });
    for (let i = 0; i < 3; i++) { line(ctx, [[-70, -20 + i * 26], [-20, -10 + i * 26]], { color: P.inkL, lw: 3 }); line(ctx, [[20, -10 + i * 26], [70, -20 + i * 26]], { color: P.inkL, lw: 3 }); }
  });
}
function tombstone(ctx, x, y, s) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-110, 0], [-110, -200], [-80, -260], [0, -290], [80, -260], [110, -200], [110, 0]], { fill: '#B7B4AC', lw: 6, smooth: true });
    shape(ctx, [[40, -280], [80, -260], [110, -200], [110, 0], [60, 0]], { fill: '#9C9990', stroke: null, smooth: true });
    text(ctx, 'R.I.P.', 0, -200, { size: 46, font: 'bold', color: P.inkL });
    text(ctx, 'GREG', 0, -130, { size: 56, font: 'marker', color: P.ink });
    text(ctx, 'he tried', 0, -70, { size: 40, font: 'hand', color: P.inkL });
    ellipse(ctx, 0, 6, 170, 26, { fill: '#8DB07A', lw: 4 });
  });
}
function heart(ctx, x, y, s, color = P.coral) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[0, 30], [-40, -4], [-44, -30], [-22, -44], [0, -26], [22, -44], [44, -30], [40, -4]], { fill: color, lw: 4, smooth: true });
  });
}

export function build() {
  const c = cues(541);
  const shots = [];
  const tFinal = c('final scoreboard');
  const rows = [
    ['forest', c('forest', 542), c('indefinitely', 543), 'INDEFINITELY', 1.0, 'happy'],
    ['jungle', c('jungle', 545), c('a few weeks', 545), 'A FEW WEEKS', 0.72, 'smile'],
    ['desert', c('desert', 547), c('about two days', 547), '~2 DAYS', 0.5, 'worried'],
    ['ocean', c('ocean', 549), c('about one', 550), '~1 DAY', 0.38, 'scared'],
    ['arctic', c('arctic', 551), c('a few hours', 552), 'A FEW HOURS', 0.2, 'dead'],
  ];
  const tWeird = c('but here\'s the weird part'), tLiving = c('people are living');
  const tInuit = c('the inuit have'), tTuareg = c('the twa reg'), tAmazon = c('whole communities');
  const tTougher = c('they\'re not tougher'), tSomething = c('they just have');
  const tKnow = c('knowledge passed down'), tFigured = c('figured it out');
  const tTurns = c('turns out'), tKnife = c('isn\'t a knife'), tLighter = c('or a lighter'), tPeople = c('it\'s other people');
  const tNice = c('which is a nice thought'), tDead = c('greg is still dead'), tNice2 = c('but it\'s a nice thought');
  const tPick = c('so which biome'), tLonger = c('and would you last'), tBar = c('honestly the bar'), tLow = c('is low'), tComments = c('let me know');
  const END = 596.5;

  // ---- final scoreboard ----
  shots.push({
    a: tFinal, b: tWeird,
    draw(ctx, t) {
      vgrad(ctx, -50, H + 50, [[0, '#2F3B3E'], [1, '#1E2629']]);
      // lights
      for (let i = 0; i < 12; i++) circle(ctx, 80 + i * 160, 40, 10, { fill: Math.sin(t * 6 + i) > 0 ? P.mustardL : '#6E6A5A', stroke: null, wob: 0 });
      text(ctx, 'FINAL SCOREBOARD', 960, 130, { size: 110, font: 'marker', color: P.mustardL, stroke: P.ink, sw: 12, s: prog(t, tFinal, 0.5, E.outBack) });
      rows.forEach(([k, ta, tv, val, frac, expr], i) => {
        const y = 290 + i * 160;
        const s = prog(t, ta - 0.1, 0.4, E.outBack);
        if (s <= 0) return;
        const L = LEVELS[k];
        tx(ctx, { x: 960, y, s }, () => {
          rrect(ctx, -840, -66, 1680, 132, 30, { fill: '#3A474B', lw: 5, stroke: '#56666A' });
          circle(ctx, -770, 0, 52, { fill: P.white, lw: 4 });
          biomeIcon(ctx, k, -770, 4, 0.62, t);
          text(ctx, L.name.replace('\n', ' '), -690, 4, { size: 58, font: 'bold', color: P.white, align: 'left', maxW: 480 });
          const bp = prog(t, tv - 0.2, 0.8, E.outCubic);
          rrect(ctx, -170, -26, 560, 52, 20, { fill: '#2A3336', stroke: null });
          if (bp > 0) rrect(ctx, -170, -26, 560 * frac * bp, 52, 20, { fill: L.clock, lw: 3 });
          if (t > tv) text(ctx, val, 620, 4, { size: 60, font: 'bold', color: i === 4 ? P.coral : P.white, s: popScale(t, tv, Infinity, 0.35), maxW: 380 });
        });
        // tiny Greg reacting per row
        if (t > tv) drawPerson(ctx, { x: 1840, y: y + 60, s: 0.34 * popScale(t, tv, Infinity, 0.4), costume: 'greg', pose: i === 0 ? 'cheer' : i === 4 ? 'stand' : 'hug', expr, t, id: 1, noShadow: true, tint: i === 4 ? { c: '#9DB8E0', k: 0.5 } : null });
      });
      if (t > rows[0][2] + 0.3) infinity(ctx, 1340, 290, popScale(t, rows[0][2] + 0.3, Infinity, 0.4) * 0.45, P.greenD);
    },
  });

  // ---- people live here; map ----
  shots.push({
    a: tWeird, b: tInuit,
    draw(ctx, t) {
      const M = { x: 60, y: 110, w: 1800, h: 900 };
      fillScreen(ctx, '#D6E7EE');
      drawWorld(ctx, M, { sea: '#D6E7EE', land: '#EBDDBE', lw: 3, wob: 0.4, lake: '#D6E7EE' });
      text(ctx, "here's the weird part...", 960, 90, { size: 70, font: 'hand', stroke: P.white, sw: 10, a: prog(t, tWeird, 0.3) });
      const spots = [['arctic', 'inuit'], ['desert', 'tuareg'], ['jungle', 'villager'], ['forest', 'kid']];
      spots.forEach(([k, cos], i) => {
        const [x, y] = proj(...PLACES[k], M);
        const s = popScale(t, tLiving + i * 0.3, Infinity, 0.4);
        if (s <= 0) return;
        circle(ctx, x, y - 40, 70 * s, { fill: P.white, lw: 5 });
        drawPerson(ctx, { x, y: y + 20, s: 0.28 * s, costume: cos, pose: 'wave', expr: 'happy', t, id: 60 + i, noShadow: true });
      });
      const [ox, oy] = proj(...PLACES.ocean, M);
      if (t > tLiving + 1.4) text(ctx, '(not here)', ox, oy, { size: 50, font: 'hand', color: P.blueD, a: prog(t, tLiving + 1.4, 0.3) });
      if (t > tLiving) tag(ctx, 'people live here. right now.', 960, 990, { size: 60, s: popScale(t, tLiving + 0.3, Infinity, 0.4) });
    },
  });

  // ---- Inuit / Tuareg / Amazon ----
  shots.push({
    a: tInuit, b: tTougher,
    draw(ctx, t) {
      if (t < tTuareg) {
        withCam(ctx, { x: 960, y: 560, z: 1.1 }, () => {
          arcticBG(ctx, t, { storm: 0.3 });
          igloo(ctx, 1300, 870, 1.3);
          drawPerson(ctx, { x: 760, y: 870, s: 1.2, costume: 'inuit', pose: 'wave', expr: 'happy', t, id: 61 });
          drawPerson(ctx, { x: 960, y: 880, s: 0.8, costume: { ...{}, hair: { style: 'none' }, hood: { color: '#6F8FB0', fur: '#EFE6D6', furD: '#D2C4AA' }, shirt: { color: '#6F8FB0', dark: '#5A7898', sleeve: 'long' }, parka: true, pants: { color: '#5A4636' }, shoes: { style: 'boot', color: '#EFE6D6' }, skin: '#E0AE89', skinD: '#C98F6C' }, pose: 'cheer', expr: 'happy', t, id: 62 });
        });
        tag(ctx, 'THE INUIT', 960, 150, { size: 80, font: 'marker', s: popScale(t, tInuit, Infinity, 0.4) });
        text(ctx, 'thriving in the Arctic for thousands of years', 960, 260, { size: 56, font: 'hand', color: P.ink, stroke: P.white, sw: 9, a: prog(t, tInuit + 0.8, 0.4) });
        return;
      }
      if (t < tAmazon) {
        const camX = 960 + (t - tTuareg) * 80;
        withCam(ctx, { x: camX, y: 560, z: 1.1 }, () => {
          desertBG(ctx, t, { camX });
          const x = 700 + (t - tTuareg) * 140;
          drawPerson(ctx, { x, y: 870, s: 1.2, costume: 'tuareg', pose: walkPose(t * 1.2), expr: 'smile', t, id: 63, look: [0.6, 0] });
          camel(ctx, x - 330, 870, 1.1, t);
        });
        tag(ctx, 'THE TUAREG', 960, 150, { size: 80, font: 'marker', s: popScale(t, tTuareg, Infinity, 0.4) });
        text(ctx, 'crossing the Sahara', 960, 260, { size: 56, font: 'hand', stroke: P.white, sw: 9, a: prog(t, tTuareg + 0.6, 0.4) });
        return;
      }
      withCam(ctx, { x: 960, y: 560, z: 1.05 }, () => {
        jungleBG(ctx, t, { noFrame: true });
        // river
        vgrad(ctx, 860, 1100, [[0, '#8CC4E0'], [1, '#5E93BE']]);
        line(ctx, [[-100, 860], [2100, 860]], { color: P.white, lw: 5 });
        stiltHouse(ctx, 560, 870, 1.0);
        stiltHouse(ctx, 1380, 870, 1.1, P.coralD);
        canoe(ctx, 960, 930 + Math.sin(t * 2) * 6, 1);
        drawPerson(ctx, { x: 560, y: 640, s: 0.8, costume: 'villager', pose: 'wave', expr: 'happy', t, id: 64 });
        drawPerson(ctx, { x: 1380, y: 630, s: 0.8, costume: 'villager2', pose: 'wave', expr: 'smile', t, id: 65 });
        drawPerson(ctx, { x: 920, y: 900, s: 0.75, costume: 'kid', pose: 'cheer', expr: 'happy', t, id: 66, noShadow: true });
      });
      tag(ctx, 'AMAZON COMMUNITIES', 960, 150, { size: 76, font: 'marker', s: popScale(t, tAmazon, Infinity, 0.4) });
      text(ctx, 'call it home', 960, 260, { size: 56, font: 'hand', stroke: P.white, sw: 9, a: prog(t, tAmazon + 0.8, 0.4) });
    },
  });

  // ---- not tougher; they have something he doesn't; knowledge ----
  shots.push({
    a: tTougher, b: tTurns,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.sageD });
      if (t < tKnow) {
        const people = [['inuit', 360], ['tuareg', 700], ['villager2', 1040], ['greg', 1480]];
        people.forEach(([cos, x], i) => {
          const isG = cos === 'greg';
          drawPerson(ctx, { x, y: 900, s: 1.05, costume: cos, pose: isG ? (t < tSomething ? { aL: [100, 110], aR: [100, 110] } : 'shrug') : 'stand', expr: isG ? (t < tSomething ? 'determined' : 'deadpan') : 'smile', t, id: 70 + i, look: isG ? [-0.4, 0] : [0.4, 0] });
        });
        if (t < tSomething) text(ctx, 'not tougher than Greg', 960, 160, { size: 76, font: 'marker', s: popScale(t, tTougher + 0.3, Infinity, 0.4) });
        else {
          text(ctx, 'they have something he doesn\'t', 960, 160, { size: 70, font: 'marker', s: popScale(t, tSomething, Infinity, 0.4) });
          text(ctx, '?', 1480, 420, { size: 140, font: 'bold', color: P.coralD, s: popScale(t, tSomething + 0.4, Infinity, 0.3) });
        }
        return;
      }
      text(ctx, 'KNOWLEDGE', 960, 150, { size: 110, font: 'marker', color: P.mustardD, s: popScale(t, tKnow, Infinity, 0.45) });
      text(ctx, 'passed down from people who figured it out first', 960, 260, { size: 52, font: 'hand', a: prog(t, tKnow + 0.6, 0.4) });
      const gens = [['elder', 380, 1.1], ['villager', 960, 1.05], ['kid', 1540, 0.8]];
      gens.forEach(([cos, x, s], i) => drawPerson(ctx, { x, y: 940, s, costume: cos, pose: 'holdOut', expr: 'happy', t, id: 80 + i, look: [0.5, 0] }));
      const bpos = keys(t, [[tKnow + 0.4, 0], [tFigured, 1], [tTurns - 0.3, 2]]);
      const bx = lerp(gens[Math.floor(Math.min(1.999, bpos))][1], gens[Math.min(2, Math.floor(Math.min(1.999, bpos)) + 1)][1], bpos % 1 || (bpos >= 2 ? 1 : 0));
      const by = 560 - Math.sin((bpos % 1) * Math.PI) * 180;
      book(ctx, bx + 110, by, 0.9, t);
      for (let i = 0; i < 2; i++) arrow(ctx, gens[i][1] + 160, 700, gens[i + 1][1] - 120, 700, { p: prog(t, tKnow + 0.6 + i * 0.4, 0.4), lw: 7, bend: -0.3 });
    },
  });

  // ---- not a knife or lighter: it's other people ----
  shots.push({
    a: tTurns, b: tDead,
    draw(ctx, t) {
      if (t < tPeople) {
        notebookBG(ctx, t, { header: P.coral });
        text(ctx, 'THE MOST IMPORTANT SURVIVAL TOOL', 960, 150, { size: 64, font: 'bold', s: popScale(t, tTurns, Infinity, 0.4) });
        const items = [[tKnife, 620, (g) => knife(g, 0, 0, 1.3, -0.3)], [tLighter, 1300, (g) => lighter(g, 0, 0, 1.3, 0.1)]];
        items.forEach(([ta, x, fn]) => {
          const s = popScale(t, ta - 0.2, Infinity, 0.4);
          tx(ctx, { x, y: 560, s }, () => { circle(ctx, 0, 0, 200, { fill: P.white, lw: 6 }); fn(ctx); crossOut(ctx, 0, 0, 150, prog(t, ta + 0.3, 0.3)); });
        });
        return;
      }
      // campfire with everyone
      vgrad(ctx, -50, H + 50, [[0, '#2E3553'], [0.6, '#5A4E6E'], [1, '#6E5A4E']]);
      for (let i = 0; i < 70; i++) circle(ctx, hash(i * 2.1) * W, hash(i * 5.3) * 500, 2 + hash(i) * 2, { fill: 'rgba(255,250,230,0.8)', stroke: null, wob: 0 });
      shape(ctx, [[-50, 820], [W + 50, 820], [W + 50, H + 50], [-50, H + 50]], { fill: '#5E6B4E', stroke: null, wob: 0 });
      glow(ctx, 960, 780, 900, '#FFB870', 0.45);
      const circleP = [['scientist', 420, 'wave'], ['inuit', 640, 'cheer'], ['tuareg', 1280, 'wave'], ['villager2', 1500, 'cheer'], ['juliane', 1700, 'wave'], ['villager', 220, 'wave']];
      circleP.forEach(([cos, x, pose], i) => drawPerson(ctx, { x, y: 930, s: 0.95, costume: cos, pose, expr: 'happy', t, id: 90 + i, look: [(960 - x) / 1200, 0] }));
      campfire(ctx, 860, 900, 1.2, t);
      drawPerson(ctx, { x: 1080, y: 1000, s: 1.0, costume: 'greg', pose: 'cheer', expr: 'happy', t, id: 1 });
      text(ctx, "IT'S OTHER PEOPLE", 960, 190, { size: 120, font: 'marker', color: P.mustardL, stroke: P.ink, sw: 12, s: popScale(t, tPeople, Infinity, 0.45) });
      if (t > tNice) {
        for (let i = 0; i < 8; i++) {
          const ph = ((t - tNice) * 0.5 + i / 8) % 1;
          heart(ctx, 300 + i * 190, 800 - ph * 500, 0.8, P.coral);
        }
        text(ctx, 'a nice thought.', 960, 320, { size: 70, font: 'hand', color: P.white, a: prog(t, tNice, 0.4) });
      }
    },
  });

  // ---- Greg is still dead ----
  shots.push({
    a: tDead, b: tPick,
    draw(ctx, t) {
      vgrad(ctx, -50, H + 50, [[0, '#9AA7B0'], [1, '#C9CFC8']]);
      shape(ctx, [[-50, 860], [W + 50, 860], [W + 50, H + 50], [-50, H + 50]], { fill: '#8DB07A', stroke: null, wob: 0 });
      tombstone(ctx, 960, 880, 1.3);
      const gy = 520 + Math.sin(t * 2) * 20;
      tx(ctx, { a: 0.75 }, () => {
        drawPerson(ctx, { x: 1320, y: gy + 300, s: 1.1, costume: 'greg', pose: t > tNice2 ? 'thumbs' : 'relaxed', expr: t > tNice2 ? 'smile' : 'deadpan', t, id: 1, noShadow: true, tint: { c: '#E8F0F8', k: 0.6 },
          hat: (g, hy) => ellipse(g, 0, hy - 110, 60, 16, { fill: null, stroke: P.mustard, lw: 8 }) });
        // wispy tail
        shape(ctx, [[1270, gy + 300], [1370, gy + 300], [1340, gy + 380], [1320, gy + 350], [1300, gy + 400]], { fill: 'rgba(232,240,248,0.9)', lw: 4, smooth: true });
      });
      if (t < tDead + 0.2) flash(ctx, 1 - prog(t, tDead, 0.2));
      text(ctx, 'GREG IS STILL DEAD', 960, 170, { size: 110, font: 'bold', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tDead + 0.1, Infinity, 0.35) });
      if (t > tNice2) speech(ctx, 'nice thought though', 1600, 420, prog(t, tNice2 + 0.4, 0.3), { size: 50, tailX: -100 });
    },
  });

  // ---- which biome would you pick? ----
  shots.push({
    a: tPick, b: tBar,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.mustardD });
      if (t < tLonger) {
        text(ctx, 'WHICH BIOME WOULD YOU PICK?', 960, 150, { size: 80, font: 'marker', s: popScale(t, tPick, Infinity, 0.4) });
        const ks = ['forest', 'jungle', 'desert', 'ocean', 'arctic'];
        ks.forEach((k, i) => {
          const x = 220 + i * 370;
          panel(ctx, x, 580, 330, 420, prog(t, tPick + 0.2 + i * 0.12, 0.4), (g, w, h) => {
            tx(g, { s: 0.2, x: -W * 0.1, y: -H * 0.12 }, () => {
              if (k === 'forest') forestBG(g, t, {});
              if (k === 'jungle') jungleBG(g, t, {});
              if (k === 'desert') desertBG(g, t, {});
              if (k === 'ocean') oceanBG(g, t, { horizon: 480 });
              if (k === 'arctic') arcticBG(g, t, { storm: 1 });
            });
          }, { caption: LEVELS[k].name.replace('\n', ' ').replace('THE ', '').toLowerCase(), r: (i - 2) * 0.02 });
          rrect(ctx, x - 30, 830, 60, 60, 10, { fill: P.white, lw: 5 });
        });
        return;
      }
      text(ctx, 'WOULD YOU LAST LONGER?', 960, 150, { size: 84, font: 'marker', s: popScale(t, tLonger, Infinity, 0.4) });
      tx(ctx, { a: 0.8 }, () => drawPerson(ctx, { x: 560, y: 900, s: 1.3, costume: 'greg', pose: 'shrug', expr: 'deadpan', t, id: 1, tint: { c: '#E8F0F8', k: 0.5 } }));
      text(ctx, 'VS', 960, 600, { size: 160, font: 'bold', color: P.mustard, stroke: P.ink, sw: 12, s: popScale(t, tLonger + 0.3, Infinity, 0.4) });
      // "you": a mystery silhouette
      tx(ctx, { x: 1360, y: 900, s: popScale(t, tLonger + 0.5, Infinity, 0.4) }, () => {
        drawPerson(ctx, { x: 0, y: 0, s: 1.3, costume: { hair: { style: 'short', color: '#3A474B' }, shirt: { color: '#56666A', dark: '#46555A', sleeve: 'short' }, pants: { color: '#46555A' }, shoes: { style: 'sneaker', color: '#56666A', accent: '#46555A' }, skin: '#56666A', skinD: '#46555A' }, pose: 'hips', expr: { eyes: 'closed', mouth: 'flat' }, t, id: 99, noShadow: true });
        text(ctx, '?', 0, -290, { size: 140, font: 'bold', color: P.white, stroke: P.ink, sw: 10 });
      });
      text(ctx, 'YOU', 1360, 1000, { size: 70, font: 'bold', s: popScale(t, tLonger + 0.5, Infinity, 0.4) });
      text(ctx, 'GREG', 560, 1000, { size: 70, font: 'bold' });
    },
  });

  // ---- the bar is low; comments; end card ----
  shots.push({
    a: tBar, b: END,
    draw(ctx, t) {
      if (t < tComments) {
        vgrad(ctx, -50, H + 50, [[0, '#CFE3EC'], [1, '#EEE8D2']]);
        shape(ctx, [[-50, 860], [W + 50, 860], [W + 50, H + 50], [-50, H + 50]], { fill: '#A7C58F', stroke: null, wob: 0 });
        // high-jump stands with the bar on the ground
        for (const x of [560, 1360]) { line(ctx, [[x, 870], [x, 560]], { color: P.inkL, lw: 14, outline: 2 }); line(ctx, [[x - 40, 870], [x + 40, 870]], { lw: 10 }); }
        const drop = prog(t, tLow - 0.2, 0.5, E.outBounce);
        const by = lerp(600, 858, drop);
        line(ctx, [[520, by], [1400, by]], { color: P.coral, lw: 22, outline: 3 });
        for (let i = 0; i < 8; i++) line(ctx, [[560 + i * 110, by - 10], [600 + i * 110, by + 10]], { color: P.white, lw: 8 });
        tag(ctx, 'THE BAR', 960, by - 90, { size: 60, font: 'bold', s: popScale(t, tBar + 0.3, Infinity, 0.4), bg: P.white });
        tx(ctx, { a: 0.75 }, () => drawPerson(ctx, { x: 1640, y: 880, s: 1.0, costume: 'greg', pose: 'shrug', expr: 'deadpan', t, id: 1, tint: { c: '#E8F0F8', k: 0.5 }, hat: (g, hy) => ellipse(g, 0, hy - 110, 60, 16, { fill: null, stroke: P.mustard, lw: 8 }) }));
        text(ctx, 'the bar is low', 960, 200, { size: 100, font: 'marker', color: P.ink, s: popScale(t, tLow, Infinity, 0.4) });
        return;
      }
      // end card in the Thing Theory lab
      labBG(ctx, t, {});
      dim(ctx, 0.3);
      drawPerson(ctx, { x: 1560, y: 1000, s: 1.4, costume: 'scientist', pose: 'wave', expr: 'grin', t, id: 2, look: [-0.4, 0], talk: loudness(t) });
      tx(ctx, { x: 700, y: 260, s: prog(t, tComments, 0.5, E.outBack), r: -0.04 }, () => {
        rrect(ctx, -560 + 12, -150 + 16, 1120, 330, 30, { fill: 'rgba(20,25,30,0.3)', stroke: null, wob: 0 });
        rrect(ctx, -560, -150, 1120, 330, 30, { fill: P.paper, lw: 7 });
        text(ctx, 'THING THEORY', 0, -20, { size: 150, font: 'marker', color: P.ink });
        swash(ctx, -420, 100, 840, 60, 'rgba(232,135,122,0.6)', prog(t, tComments + 0.3, 0.5), 3);
        text(ctx, 'HOW LONG WOULD GREG LAST?', 0, 102, { size: 54, font: 'bold', color: P.ink });
      });
      const comments = [
        ['forest. obviously.', 540, 540, -0.04],
        ['I would last 4 minutes', 860, 700, 0.03],
        ['justice for Greg', 500, 860, 0.02],
      ];
      comments.forEach(([str, x, y, r], i) => speech(ctx, str, x, y, prog(t, tComments + 0.6 + i * 0.5, 0.35), { size: 50, r }));
      tag(ctx, 'tell us in the comments!', 1080, 1010, { size: 54, s: popScale(t, tComments + 2.2, Infinity, 0.4), bg: P.mustardL });
      // fade out at the very end
      const fo = prog(t, END - 0.8, 0.8);
      if (fo > 0) { ctx.save(); ctx.fillStyle = `rgba(20,25,30,${fo})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    },
  });
  return shots;
}
