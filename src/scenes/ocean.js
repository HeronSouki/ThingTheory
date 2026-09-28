// 5:48 - 7:29  Level 4: the middle of the Pacific.
import { P, shape, circle, ellipse, line, tx, text, tag, stamp, rrect, arrow, crossOut, checkMark, glow, swash, fillScreen, vgrad, measure, star } from '../engine/draw.js';
import { W, H, E, clamp, lerp, prog, vis, popScale, cues, wiggle, TAU, hash, rng, mix } from '../engine/core.js';
import { drawPerson, walkPose } from '../chars/person.js';
import { withCam, keys, thoughtBubble, inset, panel, banner, meter, sparkle, comicBurst, burstLines, calendarPage, skull, speech, flash, shake, thermometer, numberBadge, problemCard, irisWipe } from '../ui.js';
import { oceanBG, waterFront, notebookBG, cloud, drawRain } from '../bg.js';
import { callout, stick } from '../props.js';
import { levelShot, wipeShot, clockShot, dim, sunglasses, LEVELS } from './common.js';

const WL = 700; // water line

function floatGreg(ctx, t, x, y, s, o = {}) {
  const bob = Math.sin(t * 1.8) * 8;
  const r = drawPerson(ctx, { x, y: y + bob + 150 * s, s, costume: o.costume || 'greg', id: o.id || 1, pose: o.pose || 'tread', expr: o.expr || 'worried', t, noShadow: true, tint: o.tint, shiver: o.shiver, look: o.look, pantsOff: o.pantsOff, hat: o.hat, chatter: o.chatter, sweat: o.sweat });
  if (o.float) jeansFloat(ctx, x, y + bob - 20 * s, s, t);
  waterFront(ctx, t, y + bob + 10 * s, x - 3200, x + 3200);
  return r;
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
export function jeansFloat(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    for (const sd of [-1, 1]) {
      const pts = [[sd * 30, -150], [sd * 120, -120], [sd * 170, -30], [sd * 190, 40]];
      line(ctx, pts, { color: '#5F82B4', lw: 70, outline: 3, smooth: true });
      line(ctx, pts.map(([a, b]) => [a - sd * 12, b - 14]), { color: '#86A4CF', lw: 12, smooth: true, alpha: 0.8 });
      circle(ctx, sd * 196, 70, 22, { fill: '#46679A', lw: 4.5 });
    }
    line(ctx, [[-40, -160], [40, -160]], { color: '#46679A', lw: 36, outline: 3 });
  });
}
export function sharkFin(ctx, x, y, s, flip = false) {
  tx(ctx, { x, y, s, sx: flip ? -1 : 1 }, () => {
    shape(ctx, [[-60, 0], [10, -130], [30, -120], [60, 0]], { fill: '#7C8B99', lw: 5, smooth: false });
    shape(ctx, [[10, -130], [30, -120], [60, 0], [24, 0]], { fill: '#667482', stroke: null });
    ellipse(ctx, 0, 4, 90, 12, { fill: 'rgba(255,255,255,0.6)', stroke: null });
  });
}
function shark(ctx, x, y, s, t, opt = {}) {
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
function ship(ctx, x, y, s) {
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
function creditCard(ctx, x, y, s, color, label, r = 0) {
  tx(ctx, { x, y, s, r }, () => {
    rrect(ctx, -200, -125, 400, 250, 26, { fill: color, lw: 6 });
    rrect(ctx, -160, -60, 70, 50, 8, { fill: P.mustardL, lw: 4 });
    text(ctx, '**** **** **** 1234', 0, 40, { size: 30, font: 'round', color: P.white });
    text(ctx, label, 0, -95, { size: 36, font: 'bold', color: P.white });
  });
}
function bulb(ctx, x, y, s, on) {
  tx(ctx, { x, y, s }, () => {
    if (on > 0.5) glow(ctx, 0, -20, 180, '#FFE9A0', 0.8);
    shape(ctx, [[-40, 20], [-60, -30], [-50, -80], [0, -110], [50, -80], [60, -30], [40, 20]], { fill: on > 0.5 ? P.mustardL : '#D9D4C8', lw: 5, smooth: true });
    rrect(ctx, -34, 18, 68, 40, 8, { fill: '#9AA5A8', lw: 5 });
    line(ctx, [[-14, 0], [-8, -40], [0, -20], [8, -40], [14, 0]], { lw: 3.5 });
  });
}
function cup(ctx, x, y, s, fill, label) {
  tx(ctx, { x, y, s }, () => {
    shape(ctx, [[-70, -90], [70, -90], [54, 90], [-54, 90]], { fill: 'rgba(230,242,245,0.9)', lw: 5 });
    shape(ctx, [[-62, -40], [62, -40], [54, 90], [-54, 90]], { fill, stroke: null });
    shape(ctx, [[-70, -90], [70, -90], [54, 90], [-54, 90]], { fill: null, lw: 5 });
    if (label) text(ctx, label, 0, 150, { size: 50, font: 'bold' });
  });
}

// "Level" banner used where a full card would interrupt the shot
function levelBanner(ctx, t, t0, kind) {
  const L = LEVELS[kind];
  const p = prog(t, t0, 0.45, E.outBack) * (1 - prog(t, t0 + 2.6, 0.4, E.inBack));
  if (p <= 0) return;
  tx(ctx, { x: 960, y: 150, s: p, r: -0.02 }, () => {
    rrect(ctx, -620 + 10, -95 + 12, 1240, 190, 40, { fill: 'rgba(20,25,30,0.3)', stroke: null, wob: 0 });
    rrect(ctx, -620, -95, 1240, 190, 40, { fill: L.c2, lw: 6 });
    text(ctx, `LEVEL ${L.num}`, -560, -40, { size: 48, font: 'bold', color: P.white, align: 'left' });
    text(ctx, L.name, -560, 34, { size: 96, font: 'marker', color: P.white, align: 'left', stroke: P.ink, sw: 10 });
    for (let i = 0; i < 5; i++) skull(ctx, 250 + i * 72, 0, 28, i < L.skulls ? P.white : 'rgba(255,255,255,0.25)');
  });
}

export function build() {
  const c = cues(348);
  const shots = [];
  const tOpen = c('greg opens his eyes'), tFloat = c('he\'s floating'), tPacific = c('pacific');
  const tBoat = c('no boat'), tLand = c('no land'), tDir = c('nothing in any direction'), tBlue = c('but blue');
  const tMention = c('this is the place i mentioned'), tSticks = c('no sticks'), tStreams = c('no streams'), tShade = c('and no shade');
  const tBigger = c('there\'s just an ocean'), tAllLand = c('all the land'), tTiny = c('and one tiny greg');
  const tP1 = c('problem one'), tTread = c('treading water'), tHours = c('within hours');
  const tJeans = c('but remember greg\'s jeans'), tMoment = c('this is their moment');
  const tOff = c('he takes them off'), tKnot = c('ties a knot'), tSwing = c('swings them'), tAir = c('to catch air'), tSlap = c('and slaps the waist');
  const tBoom = c('boom'), tNoodle = c('a pool noodle'), tNavy = c('the navy has');
  const tP2 = c('problem two'), t25 = c('water pulls heat'), tTimes = c('twenty five times');
  const tFine = c('so even in water'), tColder = c('slowly gets colder'), tColder2 = c('and colder'), tShut = c('until his body starts');
  const tP3 = c('problem three'), tSurround = c('greg is surrounded'), tThirst = c('dying of thirst');
  const tSea = c('seawater is so salty'), tFlush = c('to flush out the salt'), tGives = c('than the seawater gives');
  const tSip = c('every sip'), tCredit = c('it\'s like paying off'), tAnother = c('with another credit card');
  const tSharks = c('sharks'), tLeast = c('honestly they\'re the least');
  const tAvg = c('in average ocean water'), tDay = c('has about a day'), tWarm = c('in warm tropical water'), tThirstDoes = c('before thirst does');
  const tEither = c('either way'), tClever = c('being clever'), tEnding = c('change the ending');
  const tHope = c('his only hope'), tShip = c('a ship passing'), tSpot = c('spot him');
  const tClock = c('survival clock'), tWorse = c('and somehow there\'s still'), tCanada = c('northern canada');

  // ---- eyes open POV ----
  shots.push({
    a: tOpen, b: tFloat,
    draw(ctx, t) {
      const lt = t - tOpen;
      tx(ctx, { r: -0.08 + wiggle(t, 0.5, 0.04), x: 0 }, () => oceanBG(ctx, t, { horizon: 560 + Math.sin(t * 1.8) * 30 }));
      // eyelids: open, blink, open
      const open = lt < 0.6 ? 0 : lt < 1.0 ? prog(lt, 0.6, 0.4) : lt < 1.15 ? 1 - prog(lt, 1.0, 0.15) : prog(lt, 1.15, 0.3);
      const gap = open * 700;
      ctx.fillStyle = '#1E2629';
      ctx.beginPath();
      ctx.moveTo(-50, -50); ctx.lineTo(W + 50, -50); ctx.lineTo(W + 50, 540 - gap);
      ctx.quadraticCurveTo(960, 540 - gap * 1.6 + (1 - open) * 0, -50, 540 - gap);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-50, H + 50); ctx.lineTo(W + 50, H + 50); ctx.lineTo(W + 50, 540 + gap);
      ctx.quadraticCurveTo(960, 540 + gap * 1.6, -50, 540 + gap);
      ctx.closePath(); ctx.fill();
    },
  });

  // ---- floating in the middle of the Pacific; no boat, no land, nothing but blue ----
  shots.push({
    a: tFloat, b: tMention,
    draw(ctx, t) {
      const z = keys(t, [[tFloat, 1.6], [tBoat, 1.6], [tDir, 1.0], [tBlue, 0.6]]);
      withCam(ctx, { x: 960, y: keys(t, [[tFloat, 600], [tDir, 560]]), z }, () => {
        oceanBG(ctx, t, { horizon: 430, camX: 960 });
        floatGreg(ctx, t, 960, WL, 0.9, { expr: t > tBoat ? 'worried' : 'surprised', look: t > tBoat ? [Math.sin(t * 1.5), 0] : [0, 0] });
      });
      if (t > tDir) {
        const gy = 540 + (630 - 560) * z;
        const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        dirs.forEach(([dx, dy], i) => {
          const p = prog(t, tDir + i * 0.15, 0.5);
          const r0 = 90, r1 = dy ? 330 : 640;
          arrow(ctx, 960 + dx * r0, gy + dy * r0 * 0.8, 960 + dx * r1, gy + dy * r1, { p, lw: 10, bend: 0, head: 34, color: P.white });
          if (t > tBlue) text(ctx, 'blue', 960 + dx * (r1 + 130), gy + dy * (r1 + 70), { size: 80, font: 'bold', color: P.blueDD, stroke: P.white, sw: 10, s: popScale(t, tBlue + i * 0.08, Infinity, 0.35) });
        });
      }
      levelBanner(ctx, t, tFloat + 0.4, 'ocean');
      const items = [[tBoat, 'no boat', 460], [tLand, 'no land', 1460]];
      if (t < tDir + 0.3) items.forEach(([ta, lbl, x]) => {
        if (t < ta) return;
        const s = popScale(t, ta, tDir + 0.3, 0.35);
        tag(ctx, lbl, x, 900, { size: 72, font: 'bold', s, bg: P.white });
        crossOut(ctx, x, 900, 110 * s, prog(t, ta + 0.3, 0.3), { lw: 10 });
      });
    },
  });

  // ---- callback postcard + no sticks/streams/shade ----
  shots.push({
    a: tMention, b: tBigger,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 560, z: 0.8 }, () => {
        oceanBG(ctx, t, { horizon: 430 });
        floatGreg(ctx, t, 960, WL, 0.6, { expr: 'sad' });
      });
      if (t < tSticks) {
        panel(ctx, 960, 540, 760, 620, prog(t, tMention, 0.45), (g, w, h) => {
          tx(g, { s: 0.38, x: -W * 0.19, y: -H * 0.23 }, () => {
            oceanBG(g, t, { horizon: 560 });
            glow(g, 960, 560, 600, '#FFD9A8', 0.6);
          });
        }, { caption: 'calm. peaceful. beautiful.', r: -0.03 });
        text(ctx, 'remember?', 1400, 220, { size: 70, font: 'hand', color: P.white, stroke: P.ink, sw: 8, s: popScale(t, tMention + 0.6, Infinity, 0.4), r: 0.1 });
        return;
      }
      const icons = [
        [tSticks, 'sticks', (g) => stick(g, 0, 0, 200, -0.4, 1)],
        [tStreams, 'streams', (g) => { for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 8; i++) pts.push([-90 + i * 22, -40 + k * 40 + Math.sin(i + t * 3) * 10]); line(g, pts, { color: P.blueD, lw: 12, smooth: true, outline: 2 }); } }],
        [tShade, 'shade', (g) => { line(g, [[0, 100], [0, -60]], { lw: 8 }); shape(g, [[-120, -40], [0, -120], [120, -40]], { fill: P.coral, lw: 5, smooth: true }); }],
      ];
      icons.forEach(([ta, lbl, fn], i) => {
        if (t < ta) return;
        const x = 480 + i * 480, y = 500;
        const s = popScale(t, ta, Infinity, 0.4);
        tx(ctx, { x, y, s }, () => {
          circle(ctx, 0, 0, 170, { fill: P.white, lw: 6 });
          fn(ctx);
          crossOut(ctx, 0, 0, 120, prog(t, ta + 0.3, 0.3));
        });
        text(ctx, 'no ' + lbl, x, y + 240, { size: 70, font: 'bold', color: P.white, stroke: P.ink, sw: 10, s });
      });
    },
  });

  // ---- bigger than all the land; one tiny Greg ----
  shots.push({
    a: tBigger, b: tP1,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.blueD });
      const zoom = prog(t, tTiny, 1.2, E.inOutCubic);
      withCam(ctx, { x: lerp(960, 620, zoom), y: lerp(560, 620, zoom), z: lerp(1, 7, E.inCubic(zoom)) }, () => {
        const ps = popScale(t, tBigger, Infinity, 0.5);
        circle(ctx, 620, 580, 420 * ps, { fill: P.sea, lw: 7 });
        for (let k = 0; k < 5; k++) { const pts = []; for (let i = 0; i <= 12; i++) pts.push([320 + i * 50, 420 + k * 70 + Math.sin(i + t * 2 + k) * 8]); line(ctx, pts, { color: 'rgba(255,255,255,0.3)', lw: 5, smooth: true }); }
        if (zoom < 0.3) text(ctx, 'THE PACIFIC', 620, 580, { size: 80, font: 'bold', color: P.white, stroke: P.ink, sw: 10, s: ps });
        if (t > tAllLand - 0.3) {
          const ls = popScale(t, tAllLand - 0.3, Infinity, 0.5);
          tx(ctx, { x: 1460, y: 600, s: ls }, () => {
            circle(ctx, 0, 0, 350, { fill: P.sage, lw: 7 });
            for (let i = 0; i < 6; i++) circle(ctx, Math.cos(i) * 180, Math.sin(i * 1.7) * 160, 60 + (i % 3) * 20, { fill: P.sageD, stroke: null });
            if (zoom < 0.3) text(ctx, 'ALL THE LAND', 0, -30, { size: 64, font: 'bold', color: P.white, stroke: P.ink, sw: 10 });
            if (zoom < 0.3) text(ctx, 'ON EARTH', 0, 50, { size: 64, font: 'bold', color: P.white, stroke: P.ink, sw: 10 });
          });
          if (zoom < 0.2) text(ctx, '>', 1075, 600, { size: 200, font: 'bold', color: P.ink, s: ls });
        }
        if (t > tTiny) {
          const gs = popScale(t, tTiny + 0.4, Infinity, 0.4);
          circle(ctx, 620, 620, 2.2, { fill: P.coral, lw: 0.8 });
          circle(ctx, 620, 620, 12 * gs, { fill: null, stroke: P.red, lw: 1.5 });
        }
      });
      if (t > tTiny + 0.8) {
        tag(ctx, 'Greg (tiny)', 1150, 400, { size: 64, s: popScale(t, tTiny + 0.8, Infinity, 0.4), bg: P.coralL });
        arrow(ctx, 1080, 450, 990, 510, { p: prog(t, tTiny + 1.0, 0.3), lw: 7 });
      }
    },
  });

  // ---- problem 1: staying afloat / treading ----
  shots.push({
    a: tP1, b: tJeans,
    draw(ctx, t) {
      // cross-section: above and below the waterline
      vgrad(ctx, -50, 420, [[0, '#BFDCEB'], [1, '#EEF0E2']]);
      vgrad(ctx, 420, H + 50, [[0, '#7FB0D6'], [1, '#2F5883']]);
      for (let i = 0; i < 12; i++) {
        const ph = (t * 0.3 + i / 12) % 1;
        circle(ctx, 200 + i * 140, H - ph * 700, 6 + (i % 3) * 3, { fill: null, stroke: 'rgba(255,255,255,0.5)', lw: 3 });
      }
      const k = Math.sin(t * 7);
      const tired = prog(t, tTread + 0.5, 2.5);
      drawPerson(ctx, { x: 960, y: 900, s: 1.2, costume: 'greg', t, id: 1, pose: { aL: [80 + k * 25, -30], aR: [80 - k * 25, -30], lL: [10 + k * 12, -20 - k * 20], lR: [10 - k * 12, -20 + k * 20] }, expr: tired > 0.6 ? 'exhausted' : 'nervous', noShadow: true, sweat: tired });
      const wl = [];
      for (let i = 0; i <= 30; i++) wl.push([-50 + i * 68, 420 + Math.sin(i * 0.8 + t * 2) * 8]);
      line(ctx, wl, { color: P.white, lw: 6, smooth: true });
      ctx.fillStyle = 'rgba(78,134,181,0.35)';
      ctx.fillRect(-50, 424, W + 100, H);
      problemCard(ctx, t, tP1, 1, 'STAYING AFLOAT');
      if (t > tTread) {
        meter(ctx, 1340, 560, 480, 60, 1 - tired * 0.92, tired > 0.7 ? P.red : P.green, 'ENERGY', { size: 50, labelColor: P.white, stroke: P.ink });
        if (t > tHours) tag(ctx, 'gone within hours', 1580, 760, { size: 52, s: popScale(t, tHours, Infinity, 0.4) });
      }
    },
  });

  // ---- the jeans' moment ----
  shots.push({
    a: tJeans, b: tOff,
    draw(ctx, t) {
      vgrad(ctx, -50, H + 50, [[0, '#3F5F8E'], [1, '#1F2F4A']]);
      // spotlight rays
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.05 * Math.sin(t * 3);
      ctx.translate(960, -100);
      for (let i = -3; i <= 3; i++) {
        ctx.rotate(0);
        shape(ctx, [[0, 0], [i * 160 - 60, 1300], [i * 160 + 60, 1300]], { fill: '#FFF3C4', stroke: null, wob: 0 });
      }
      ctx.restore();
      glow(ctx, 960, 560, 420, '#FFF3C4', 0.5);
      const js = popScale(t, tJeans + 0.3, Infinity, 0.5);
      jeans(ctx, 960, 540, js * 1.6, Math.sin(t * 2) * 0.05, 'flat', t);
      for (let i = 0; i < 8; i++) sparkle(ctx, 960 + Math.cos(i * 0.8 + t) * 380, 540 + Math.sin(i * 1.3 + t) * 300, 20 * Math.abs(Math.sin(t * 3 + i)), P.mustardL);
      text(ctx, "GREG'S JEANS", 960, 170, { size: 100, font: 'marker', color: P.white, stroke: P.ink, sw: 10, s: popScale(t, tJeans + 0.4, Infinity, 0.4) });
      if (t > tMoment) text(ctx, 'THEIR MOMENT', 960, 940, { size: 110, font: 'bold', color: P.mustard, stroke: P.ink, sw: 12, s: popScale(t, tMoment, Infinity, 0.45) });
    },
  });

  // ---- 4 steps ----
  shots.push({
    a: tOff, b: tBoom,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.blueD });
      text(ctx, 'THE JEANS TRICK', 960, 110, { size: 80, font: 'marker' });
      const steps = [
        [tOff, 'take them off', (g) => { jeans(g, 0, -20 + Math.sin(t * 2) * 10, 1, 0.1, 'flat', t); }],
        [tKnot, 'knot each leg', (g) => { jeans(g, 0, -20, 1, 0, 'knotted', t); }],
        [tSwing, 'swing to catch air', (g) => {
          const a = ((t - tSwing) * 3) % TAU;
          line(g, ellipseArc(0, 20, 150, 90), { lw: 5, dash: [14, 14], color: P.blueD });
          jeans(g, Math.cos(a) * 130, 20 + Math.sin(a) * 70 - 40, 0.7, a + Math.PI / 2, 'knotted', t);
        }],
        [tSlap, 'slap it in the water', (g) => {
          const inf = prog(t, tSlap + 0.6, 0.5);
          ellipse(g, 0, 150, 200, 40, { fill: P.blueL, lw: 4 });
          jeans(g, 0, 20 + (1 - prog(t, tSlap, 0.4, E.inQuad)) * -120, 0.8, Math.PI, inf > 0 ? 'inflated' : 'knotted', t);
          if (t > tSlap + 0.4 && t < tSlap + 1.2) burstLines(g, 0, 140, 60, 220, (t - tSlap - 0.4) / 0.8, P.blueD, 10);
        }],
      ];
      steps.forEach(([ta, lbl, fn], i) => {
        const x = 260 + i * 466, y = 560;
        const p = prog(t, ta, 0.45);
        panel(ctx, x, y, 420, 560, p, (g, w, h) => {
          vgrad(g, -h / 2, h / 2, [[0, '#F2F7FA'], [1, '#DCEAF2']], -w / 2, w / 2);
          fn(g);
        }, { caption: lbl, r: [-0.02, 0.02, -0.015, 0.02][i] });
        numberBadge(ctx, i + 1, x - 170, y - 260, 44, P.blueD, E.outBack(p));
      });
    },
  });

  // ---- boom + pool noodle + navy ----
  shots.push({
    a: tBoom, b: tP2,
    draw(ctx, t) {
      const navy = t > tNavy;
      withCam(ctx, { x: 960, y: 560, z: 1.25 }, () => {
        oceanBG(ctx, t, { horizon: 430 });
        floatGreg(ctx, t, navy ? 700 : 960, WL, 0.9, { float: true, expr: 'proud', pantsOff: true, pose: { aL: [100, 20], aR: [100, 20] } });
        if (navy) floatGreg(ctx, t + 0.5, 1260, WL, 0.9, { float: true, expr: 'grin', costume: 'sailor', id: 44, pose: 'thumbs' });
      });
      if (navy) {
        // sailor badge
        tx(ctx, { x: 1450, y: 330, s: popScale(t, tNavy, Infinity, 0.45), r: 0.08 }, () => {
          circle(ctx, 0, 0, 150, { fill: P.blueDD, lw: 6 });
          circle(ctx, 0, 0, 120, { fill: null, stroke: P.mustard, lw: 6 });
          line(ctx, [[0, -80], [0, 70]], { color: P.mustard, lw: 12, outline: 2 });
          line(ctx, [[-50, -46], [50, -46]], { color: P.mustard, lw: 10, outline: 2 });
          line(ctx, [[-70, 30], [0, 76], [70, 30]], { color: P.mustard, lw: 12, outline: 2, smooth: true });
          circle(ctx, 0, -92, 18, { fill: null, stroke: P.mustard, lw: 8 });
        });
        text(ctx, 'NAVY-APPROVED', 1450, 540, { size: 70, font: 'bold', color: P.white, stroke: P.ink, sw: 10, s: popScale(t, tNavy + 0.3, Infinity, 0.4) });
      } else {
        comicBurst(ctx, 'BOOM!', 1420, 300, 170, prog(t, tBoom, 0.35), P.mustard);
        if (t > tNoodle) tag(ctx, 'a pool noodle shaped like pants', 960, 950, { size: 64, s: popScale(t, tNoodle, Infinity, 0.4), bg: P.mustardL });
      }
    },
  });

  // ---- problem 2: the cold, 25x ----
  shots.push({
    a: tP2, b: tP3,
    draw(ctx, t) {
      if (t < tFine) {
        notebookBG(ctx, t, { header: P.blueD });
        problemCard(ctx, t, tP2, 2, 'THE COLD');
        if (t > t25 - 0.2) {
          const lp = prog(t, t25 - 0.2, 0.45);
          panel(ctx, 520, 650, 700, 560, lp, (g, w, h) => {
            vgrad(g, -h / 2, h / 2, [[0, '#DCEBF3'], [1, '#EEF0E2']], -w / 2, w / 2);
            drawPerson(g, { x: 0, y: 200, s: 0.9, costume: 'greg', pose: 'stand', expr: 'smile', t, id: 1, noShadow: true });
            const ph = (t * 0.6) % 1;
            arrow(g, 60, -60, 60 + ph * 180, -60 - ph * 60, { color: P.red, lw: 8, bend: 0.2, a: 1 - ph });
          }, { caption: 'in AIR: 1x' });
          const rp = prog(t, tTimes - 0.3, 0.45);
          panel(ctx, 1400, 650, 700, 560, rp, (g, w, h) => {
            vgrad(g, -h / 2, h / 2, [[0, '#7FB0D6'], [1, '#3F6F9E']], -w / 2, w / 2);
            drawPerson(g, { x: 0, y: 200, s: 0.9, costume: 'greg', pose: 'hug', expr: 'cold', t, id: 1, noShadow: true, tint: { c: '#9DB8E0', k: 0.3 }, shiver: 1 });
            for (let i = 0; i < 25; i++) {
              const a = (i / 25) * TAU;
              const ph = (t * 0.8 + hash(i)) % 1;
              const r0 = 80 + ph * 200;
              line(g, [[Math.cos(a) * r0, -40 + Math.sin(a) * r0], [Math.cos(a) * (r0 + 30), -40 + Math.sin(a) * (r0 + 30)]], { color: P.red, lw: 6, alpha: 1 - ph });
            }
          }, { caption: 'in WATER: 25x' });
          if (t > tTimes) text(ctx, '25x FASTER', 960, 960, { size: 110, font: 'bold', color: P.red, stroke: P.ink, sw: 12, s: popScale(t, tTimes + 0.3, Infinity, 0.4) });
        }
        return;
      }
      // getting colder, shutting down
      const cold = prog(t, tColder - 0.3, 4.5, E.linear);
      withCam(ctx, { x: 960, y: 560, z: 1.3 }, () => {
        oceanBG(ctx, t, { horizon: 430, dark: cold * 0.4 });
        floatGreg(ctx, t, 820, WL, 0.9, { float: true, pantsOff: true, expr: cold > 0.5 ? 'exhausted' : 'cold', tint: { c: '#9DB8E0', k: cold * 0.5 }, shiver: cold, pose: { aL: [30, -120], aR: [30, -120] } });
      });
      thermometer(ctx, 1500, 820, 520, lerp(0.6, 0.15, cold), { color: mix(P.coral, P.blueD, cold), bulb: 50, w: 44, label: 'BODY TEMP' });
      if (t < tColder) tag(ctx, 'feels fine...', 520, 260, { size: 64, s: popScale(t, tFine + 0.3, tColder, 0.4) });
      if (t > tColder) text(ctx, 'colder', 520, 240, { size: 80, font: 'bold', color: P.blueL, stroke: P.ink, sw: 10, s: popScale(t, tColder + 0.4, Infinity, 0.4) });
      if (t > tColder2) text(ctx, 'and colder', 560, 340, { size: 80, font: 'bold', color: P.blue, stroke: P.ink, sw: 10, s: popScale(t, tColder2 + 0.2, Infinity, 0.4) });
      if (t > tShut) {
        const p = prog(t, tShut, 0.4, E.outBack);
        tx(ctx, { x: 700, y: 620, s: p }, () => {
          rrect(ctx, -380, -140, 760, 280, 20, { fill: '#E9ECEF', lw: 6 });
          rrect(ctx, -380, -140, 760, 64, 20, { fill: P.blueD, lw: 6 });
          text(ctx, 'GREG.exe', -340, -106, { size: 38, font: 'bold', color: P.white, align: 'left' });
          text(ctx, 'Low body heat. Shutting down...', 0, -10, { size: 44, font: 'hand' });
          rrect(ctx, -300, 50, 600, 40, 10, { fill: P.white, lw: 4 });
          rrect(ctx, -296, 54, 592 * prog(t, tShut + 0.3, 1.3), 32, 8, { fill: P.blue, stroke: null });
        });
      }
    },
  });

  // ---- problem 3: thirst ----
  shots.push({
    a: tP3, b: tCredit,
    draw(ctx, t) {
      if (t < tSea) {
        withCam(ctx, { x: 960, y: 580, z: 1.3 }, () => {
          oceanBG(ctx, t, { horizon: 430 });
          floatGreg(ctx, t, 960, WL, 0.9, { float: true, pantsOff: true, expr: t > tThirst ? 'hot' : 'worried' });
        });
        problemCard(ctx, t, tP3, 3, 'THIRST');
        if (t > tSurround) {
          ['water', 'water', 'water', 'water', 'water'].forEach((w, i) => {
            const a = -Math.PI + (i / 4) * Math.PI;
            text(ctx, w, 960 + Math.cos(a) * 640, 760 + Math.sin(a) * -80 + (i % 2) * 120, { size: 56, font: 'hand', color: P.white, stroke: P.blueDD, sw: 8, s: popScale(t, tSurround + i * 0.12, Infinity, 0.3) });
          });
        }
        if (t > tThirst) thoughtBubble(ctx, 1420, 420, 320, 240, prog(t, tThirst, 0.35), 1080, 520, (g) => cup(g, 0, 0, 0.7, P.blueL));
        return;
      }
      notebookBG(ctx, t, { header: P.blueD });
      text(ctx, 'WHY SEAWATER MAKES IT WORSE', 960, 120, { size: 70, font: 'marker' });
      const ip = popScale(t, tSea, Infinity, 0.4);
      cup(ctx, 330, 480, ip * 1.1, '#6FA0C8');
      text(ctx, 'IN: 1 cup', 330, 680, { size: 60, font: 'bold', s: ip, color: P.blueDD });
      for (let i = 0; i < 6; i++) circle(ctx, 300 + (i % 3) * 30, 520 + Math.floor(i / 3) * 30, 6, { fill: P.white, lw: 2 });
      text(ctx, '(salty)', 330, 750, { size: 50, font: 'hand', s: ip });
      arrow(ctx, 480, 480, 740, 480, { p: prog(t, tSea + 0.5, 0.4), lw: 8, bend: -0.1 });
      drawPerson(ctx, { x: 960, y: 820, s: 1.1, costume: 'greg', pose: 'stand', expr: t > tGives ? 'dizzy' : 'thinking', t, id: 1, noShadow: true, pantsOff: true });
      if (t > tFlush) {
        arrow(ctx, 1180, 480, 1440, 480, { p: prog(t, tFlush, 0.4), lw: 8, bend: -0.1 });
        const op = popScale(t, tFlush + 0.2, Infinity, 0.4);
        cup(ctx, 1560, 470, op * 1.1, '#E8D48C');
        cup(ctx, 1720, 470, op * 0.8, '#E8D48C');
        text(ctx, 'OUT: MORE', 1620, 680, { size: 60, font: 'bold', s: op, color: P.coralD });
        text(ctx, '(to flush the salt)', 1620, 750, { size: 50, font: 'hand', s: op });
      }
      if (t > tGives) stamp(ctx, 'NET LOSS', 960, 950, { p: prog(t, tGives + 0.3, 0.35), size: 100 });
      if (t > tSip) {
        meter(ctx, 1320, 260, 500, 56, 0.35 + Math.floor((t - tSip) * 3) * 0.14, P.red, 'THIRST', { size: 44 });
      }
    },
  });

  // ---- credit card ----
  shots.push({
    a: tCredit, b: tSharks,
    draw(ctx, t) {
      notebookBG(ctx, t, { color: '#EEF2F0' });
      const a = popScale(t, tCredit + 0.3, Infinity, 0.4);
      creditCard(ctx, 560, 480, a * 1.1, P.blueD, 'CARD A', -0.08);
      if (t > tAnother - 0.2) {
        creditCard(ctx, 1360, 480, popScale(t, tAnother - 0.2, Infinity, 0.4) * 1.1, P.coralD, 'CARD B', 0.08);
        arrow(ctx, 1150, 400, 790, 400, { p: prog(t, tAnother + 0.2, 0.4), lw: 9, bend: 0.25 });
        text(ctx, 'pays off', 970, 280, { size: 56, font: 'hand', a: prog(t, tAnother + 0.4, 0.3) });
      }
      const debt = Math.floor(500 + Math.max(0, t - tAnother) * 900);
      tx(ctx, { x: 960, y: 860, s: popScale(t, tCredit + 0.6, Infinity, 0.4) }, () => {
        rrect(ctx, -330, -80, 660, 160, 24, { fill: P.white, lw: 6 });
        text(ctx, `DEBT: $${debt.toLocaleString('en-US')}`, 0, 6, { size: 80, font: 'bold', color: P.red });
      });
      text(ctx, 'every sip = more thirst', 960, 120, { size: 64, font: 'hand', a: prog(t, tCredit, 0.3) });
    },
  });

  // ---- sharks ----
  shots.push({
    a: tSharks, b: tAvg,
    draw(ctx, t) {
      if (t < tLeast) {
        const [sx, sy] = shake(t, tSharks, 0.4, 12);
        withCam(ctx, { x: 960, y: 580, z: 1.3, sx, sy }, () => {
          oceanBG(ctx, t, { horizon: 430, dark: 0.3 });
          const a = t * 1.6;
          const fx = 960 + Math.cos(a) * 420, fy = WL + 40 + Math.sin(a) * 60;
          if (Math.sin(a) < 0) sharkFin(ctx, fx, fy, 1, Math.cos(a) > 0);
          floatGreg(ctx, t, 960, WL, 0.9, { float: true, pantsOff: true, expr: 'scared', shiver: 1 });
          if (Math.sin(a) >= 0) sharkFin(ctx, fx, fy, 1.1, Math.cos(a) > 0);
        });
        ctx.save(); ctx.fillStyle = 'rgba(120,20,20,0.18)'; ctx.fillRect(0, 0, W, H); ctx.restore();
        text(ctx, 'SHARKS?!', 960, 200, { size: 140, font: 'bold', color: P.red, stroke: P.ink, sw: 12, s: popScale(t, tSharks, Infinity, 0.3) });
        return;
      }
      notebookBG(ctx, t, { header: P.blueD });
      text(ctx, "GREG'S PROBLEMS (ranked)", 960, 120, { size: 72, font: 'marker' });
      const rows = [['1. the cold', P.blueD, 90], ['2. thirst', P.coralD, 90], ['3. exhaustion', P.mustardD, 90], ['4. ...sharks', P.inkL, 44]];
      rows.forEach(([lbl, col, size], i) => {
        const s = popScale(t, tLeast + i * 0.25, Infinity, 0.4);
        const y = 290 + i * 170 + (i === 3 ? 20 : 0);
        text(ctx, lbl, 400, y, { size, font: 'bold', color: col, align: 'left', s });
      });
      shark(ctx, 1080, 830, 0.55 * popScale(t, tLeast + 1.0, Infinity, 0.4), t, { bored: true });
      speech(ctx, 'fair.', 1300, 720, prog(t, tLeast + 1.4, 0.3), { size: 50 });
    },
  });

  // ---- average vs tropical ----
  shots.push({
    a: tAvg, b: tEither,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.blueD });
      text(ctx, 'HOW LONG IN THE WATER?', 960, 120, { size: 72, font: 'marker' });
      const rows = [[tAvg, 'average ocean water', tDay, 1, P.blueD, '~1 DAY', 'cold & exhaustion win'], [tWarm, 'warm tropical water', tThirstDoes, 2.5, P.coral, '2-3 DAYS', 'thirst wins']];
      rows.forEach(([ta, lbl, tv, days, col, val, why], i) => {
        if (t < ta) return;
        const y = 380 + i * 330;
        text(ctx, lbl, 180, y - 80, { size: 60, font: 'hand', align: 'left', a: prog(t, ta, 0.3) });
        const bp = prog(t, tv - 0.4, 1.0, E.outCubic);
        rrect(ctx, 180, y - 40, 1200, 90, 24, { fill: P.white, lw: 6 });
        if (bp > 0) rrect(ctx, 188, y - 32, (1184 * days / 3) * bp, 74, 18, { fill: col, stroke: null, wob: 0.5 });
        rrect(ctx, 180, y - 40, 1200, 90, 24, { fill: null, lw: 6 });
        if (bp > 0.7) {
          text(ctx, val, 1540, y + 4, { size: 76, font: 'bold', color: col, stroke: P.ink, sw: 4 });
          text(ctx, why, 180 + 1184 * days / 3 + 30, y + 100, { size: 48, font: 'hand', align: 'left', a: prog(t, tv, 0.3), color: P.inkL });
        }
      });
    },
  });

  // ---- clever doesn't change the ending; ship ----
  shots.push({
    a: tEither, b: tWorse,
    draw(ctx, t) {
      const shipShot = t > tHope;
      withCam(ctx, { x: 960, y: 560, z: shipShot ? 1.0 : 1.35 }, () => {
        oceanBG(ctx, t, { horizon: 430 });
        if (shipShot) {
          const sx = keys(t, [[tHope, 300], [tClock + 1, 1500, E.linear]]);
          ship(ctx, sx, 440, 0.35);
        }
        const waving = shipShot && t > tShip;
        floatGreg(ctx, t, shipShot ? 1100 : 960, WL + (shipShot ? 80 : 0), shipShot ? 0.75 : 0.9, {
          float: true, pantsOff: true, expr: waving ? 'grin' : t > tEnding ? 'sad' : 'thinking',
          pose: waving ? (Math.sin(t * 12) > 0 ? 'cheer' : 'armsUp') : { aL: [30, -120], aR: [30, -120] },
        });
        if (!shipShot) {
          const on = t < tEnding + 0.2 ? 1 : (Math.sin(t * 40) > 0.3 && t < tEnding + 0.7 ? 1 : 0);
          bulb(ctx, 960, 330, popScale(t, tClever - 0.2, Infinity, 0.4) * 0.9, on);
        }
      });
      if (!shipShot && t > tEnding + 0.3) text(ctx, 'THE END?', 960, 150, { size: 110, font: 'marker', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tEnding + 0.3, Infinity, 0.4) });
      if (shipShot) {
        tag(ctx, 'only hope: a passing ship', 960, 130, { size: 64, s: popScale(t, tHope + 0.2, Infinity, 0.4), bg: P.white });
        if (t > tSpot) tag(ctx, 'close enough to spot him?', 960, 950, { size: 56, s: popScale(t, tSpot, Infinity, 0.4), bg: P.mustardL });
      }
    },
  });
  shots.push(clockShot('ocean', tClock, tWorse, 'ABOUT\n1 DAY', '(clever pants or not)', { size: 110 }));

  // ---- still one place worse: freeze into the arctic ----
  shots.push({
    a: tWorse, b: tCanada,
    draw(ctx, t) {
      const f = prog(t, tWorse + 0.8, 2.2, E.inCubic);
      withCam(ctx, { x: 960, y: 580, z: 1.3 }, () => {
        oceanBG(ctx, t, { horizon: 430, dark: f * 0.5 });
        floatGreg(ctx, t, 960, WL, 0.9, { float: true, pantsOff: true, expr: f > 0.3 ? 'cold' : 'worried', look: [0, -0.6], tint: { c: '#9DB8E0', k: f * 0.5 }, shiver: f, chatter: true });
        for (let i = 0; i < 30 * f; i++) {
          const x = hash(i * 3.7) * 2200 - 100, y = ((hash(i * 1.9) * 1200 + t * 120) % 1200) - 100;
          circle(ctx, x, y, 5 + hash(i) * 5, { fill: P.white, lw: 2 });
        }
      });
      // ice spreading from the edges
      ctx.save();
      ctx.globalAlpha = f;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        const r = lerp(1300, 700, f);
        shape(ctx, [[960 + Math.cos(a) * 1400, 540 + Math.sin(a) * 1400], [960 + Math.cos(a - 0.2) * r, 540 + Math.sin(a - 0.2) * r], [960 + Math.cos(a + 0.2) * (r + 80), 540 + Math.sin(a + 0.2) * (r + 80)]], { fill: 'rgba(230,242,250,0.9)', stroke: 'rgba(160,190,215,0.9)', lw: 4 });
      }
      ctx.restore();
      text(ctx, 'somehow...', 960, 180, { size: 80, font: 'hand', color: P.white, stroke: P.ink, sw: 10, a: prog(t, tWorse, 0.4) });
      text(ctx, 'ONE PLACE WORSE', 960, 300, { size: 110, font: 'bold', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tWorse + 1.2, Infinity, 0.4) });
    },
  });
  shots.push(wipeShot(tCanada, '#EEF3F6', 23));
  return shots;
}

function ellipseArc(cx, cy, rx, ry) {
  const pts = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * TAU; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry - 40]); }
  return pts;
}
