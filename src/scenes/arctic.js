// 7:29 - 9:02  Level 5: Northern Canada in January.
import { P, shape, circle, ellipse, line, tx, text, tag, stamp, rrect, arrow, crossOut, checkMark, glow, swash, fillScreen, vgrad, measure, star, ellipsePts } from '../engine/draw.js';
import { W, H, E, clamp, lerp, prog, vis, popScale, cues, wiggle, TAU, hash, rng, mix } from '../engine/core.js';
import { drawPerson, walkPose } from '../chars/person.js';
import { withCam, keys, thoughtBubble, inset, panel, banner, meter, sparkle, comicBurst, burstLines, calendarPage, skull, speech, flash, shake, thermometer, numberBadge, countdown, stopwatch } from '../ui.js';
import { arcticBG, notebookBG, blowingSnow, pine } from '../bg.js';
import { callout, bigHand, infinity } from '../props.js';
import { levelShot, wipeShot, clockShot, portalDrop, dustPuff, dim, LEVELS } from './common.js';
import { ruleCard } from './rules.js';

const GROUND = 850;
const COLD = { c: '#9DB8E0', k: 0.35 };

function snowflake(ctx, x, y, r, rot = 0, color = P.white) {
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
function iceCube(ctx, x, y, s, t, face = true) {
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
function snowDrift(ctx, x, y, s, t, cave = 0, opt = {}) {
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

export function build() {
  const c = cues(449);
  const shots = [];
  const tCanada = c('northern canada'), tJan = c('january'), tMinus = c('minus forty degrees'), tNo = c('and no don\'t ask'), tAsk = c('don\'t ask');
  const tCF = c('whether that\'s celsius'), tOne = c('minus forty is the one'), tBoth = c('both scales agree'), tAgree = c('they agree it\'s bad'), tBad = c('bad', 461.4);
  const tShirt = c('greg is wearing a t shirt'), tRemember = c('remember the rule of threes'), tGives = c('it gives you three hours'), tDoesnt = c('greg doesn\'t get');
  const tWind = c('at minus forty with'), tFrost = c('bare skin can get frostbite'), tTen = c('under ten minutes');
  const tNumb = c('his fingers go numb'), tWhite = c('then white'), tStop = c('then stop working'), tTools = c('and his fingers are the only');
  const tTenMin = c('so greg has about ten'), tSnow = c('and the only thing around'), tTwist = c('here\'s the twist'), tAnswer = c('the snow is the answer');
  const tFresh = c('fresh snow is mostly'), tAirW = c('trapped air'), tInsul = c('great insulator');
  const tDigs = c('say greg digs'), tHollow = c('and hollows out'), tCurl = c('just big enough');
  const tInside = c('the inside can stay'), tOutside = c('even when it\'s minus'), tDiff = c('that\'s a forty degree');
  const tBuilt = c('built by hand'), tKill = c('trying to kill him');
  const tEat = c('should he eat snow'), tNoW = c('no', 515), tMelt = c('his body has to melt'), tLike = c('it\'s like trying to warm'), tLiterally = c('because it is literally');
  const tEven = c('but even in the cave'), tIce = c('lying on ice'), tTee = c('in a t shirt', 527), tNoFood = c('with no food'), tStill = c('close to freezing is still');
  const tClock = c('survival clock'), tHours = c('it\'s the only place'), tCounted = c('counted in hours'), tFinal = c('final scoreboard');

  // ---- level card with a shivering tint ----
  shots.push(levelShot('arctic', tCanada, tJan));
  shots.push(wipeShot(tJan, '#EEF3F6', 29, 0.25));

  // countdown HUD shown from "10 minutes of working hands" until the cave is dug
  const hudOn = (t) => t > tTenMin && t < tInside;
  const hud = (ctx, t) => {
    if (!hudOn(t)) return;
    const secs = 600 - (t - tTenMin) * 22;
    countdown(ctx, 1680, 110, secs, 0.8 * popScale(t, tTenMin, tInside, 0.35, 0.3), P.red);
    text(ctx, 'working hands left', 1680, 196, { size: 42, font: 'hand', color: P.ink, stroke: P.white, sw: 8, a: prog(t, tTenMin + 0.3, 0.3) * (1 - prog(t, tInside - 0.3, 0.3)) });
  };

  // ---- arrival: January, -40, don't ask ----
  shots.push({
    a: tJan, b: tOne,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 560, z: 1.1 }, () => {
        arcticBG(ctx, t, { storm: 1 });
        const d = portalDrop(ctx, t, tJan - 0.3, 700, GROUND, 150);
        if (d.visible) drawPerson(ctx, { x: 700, y: d.y, s: 1.15, costume: 'greg', pose: !d.landed ? 'panic' : 'hug', expr: !d.landed ? 'shocked' : 'cold', t, id: 1, squash: d.squash, shiver: d.landed ? 1 : 0, chatter: true, tint: { c: '#9DB8E0', k: prog(t, tJan + 0.8, 3) * 0.4 } });
        dustPuff(ctx, 700, GROUND, tJan + 0.5, t, 1, 'rgba(250,252,255,0.95)');
      });
      calendarPage(ctx, 1250, 380, popScale(t, tJan + 0.1, Infinity, 0.45) * 0.95, 'JANUARY', '1', { color: P.blueD, r: 0.06 });
      if (t > tMinus - 0.2) {
        const tp = prog(t, tMinus - 0.2, 1.0, E.outBounce);
        thermometer(ctx, 1640, 800, 560, lerp(0.7, 0.02, tp), { color: P.blueD, bulb: 56, w: 48 });
        text(ctx, '-40°', 1640, 180, { size: 130, font: 'bold', color: P.blueDD, stroke: P.white, sw: 12, s: popScale(t, tMinus + 0.3, Infinity, 0.4) });
      }
      if (t > tNo) {
        tx(ctx, { x: 1000, y: 820, s: popScale(t, tNo, Infinity, 0.4) }, () => {
          speech(ctx, '°C or °F?', 0, 0, 1, { size: 64, tailX: -120 });
        });
        if (t > tAsk) stamp(ctx, "DON'T ASK", 1000, 820, { p: prog(t, tAsk, 0.3), size: 90, r: -0.12, bg: P.white });
      }
    },
  });

  // ---- both scales agree ----
  shots.push({
    a: tOne, b: tShirt,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.blueD });
      const bad = t > tAgree;
      text(ctx, 'THE ONE TEMPERATURE WHERE', 960, 120, { size: 60, font: 'bold', a: prog(t, tOne, 0.3) });
      text(ctx, 'BOTH SCALES AGREE', 960, 200, { size: 76, font: 'marker', s: popScale(t, tBoth - 0.3, Infinity, 0.4) });
      const thermo = (x, lbl, i) => {
        const s = popScale(t, tOne + 0.2 + i * 0.2, Infinity, 0.45);
        tx(ctx, { x, y: 0, s: 1 }, () => {
          if (s <= 0) return;
          tx(ctx, { x: 0, y: 820, s }, () => thermometer(ctx, 0, 0, 500, 0.12, { color: P.blueD, bulb: 60, w: 54, face: bad ? 'bad' : 'ok' }));
          text(ctx, lbl, 0, 330, { size: 90, font: 'bold', color: P.blueDD, s });
        });
      };
      thermo(640, '°C', 0);
      thermo(1280, '°F', 1);
      if (t > tBoth - 0.2) {
        const lp = prog(t, tBoth - 0.2, 0.5);
        line(ctx, [[700, 760], [lerp(700, 1220, lp), 760]], { lw: 6, dash: [16, 14], color: P.red });
        text(ctx, '-40° = -40°', 960, 720, { size: 70, font: 'bold', color: P.red, stroke: P.white, sw: 10, s: popScale(t, tBoth + 0.2, Infinity, 0.4) });
      }
      if (bad) {
        speech(ctx, 'bad.', 470, 520, prog(t, tBad - 0.2, 0.3), { size: 70, tailX: 60 });
        speech(ctx, 'very bad.', 1480, 520, prog(t, tBad, 0.3), { size: 64, tailX: -80 });
      }
    },
  });

  // ---- t-shirt + rule of threes callback ----
  shots.push({
    a: tShirt, b: tWind,
    draw(ctx, t) {
      if (t < tRemember) {
        withCam(ctx, { x: 960, y: 560, z: 1.45 }, () => {
          arcticBG(ctx, t, { storm: 1.2 });
          drawPerson(ctx, { x: 960, y: GROUND, s: 1.15, costume: 'greg', pose: 'hug', expr: 'cold', t, id: 1, shiver: 1.3, chatter: true, tint: { c: '#9DB8E0', k: 0.45 } });
          for (let i = 0; i < 6; i++) line(ctx, [[900 + i * 22, 500], [900 + i * 22, 525 + (i % 2) * 12]], { color: '#E6F2FA', lw: 5, outline: 1.5 });
        });
        callout(ctx, 'a t-shirt.', 1400, 360, 1030, 560, prog(t, tShirt + 0.3, 0.6), { size: 70 });
        return;
      }
      withCam(ctx, { x: 960, y: 560, z: 1 }, () => arcticBG(ctx, t, { storm: 1 }));
      dim(ctx, 0.35);
      const cs = popScale(t, tRemember, Infinity, 0.45);
      const crossed = t > tDoesnt;
      ruleCard(ctx, 1, 960, 560, cs * 1.35, t, {
        r: -0.03,
        override: crossed ? '10' : '3',
        unitOverride: crossed ? 'MINUTES?' : 'HOURS',
        extra: (g) => { if (crossed) { crossOut(g, 0, 60, 90, prog(t, tDoesnt, 0.3)); } },
      });
      if (t > tGives) text(ctx, 'without shelter', 960, 1000, { size: 64, font: 'hand', color: P.white, stroke: P.ink, sw: 9, a: prog(t, tGives, 0.3) });
      if (crossed) stamp(ctx, 'NOT FOR GREG', 1500, 300, { p: prog(t, tDoesnt + 0.2, 0.35), size: 80, r: 0.12, bg: P.white });
    },
  });

  // ---- wind + frostbite in 10 minutes ----
  shots.push({
    a: tWind, b: tNumb,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 560, z: 1.2 }, () => {
        arcticBG(ctx, t, { storm: 1.6 });
        drawPerson(ctx, { x: 820, y: GROUND, s: 1.15, costume: 'greg', pose: 'hug', expr: 'cold', t, id: 1, shiver: 1.4, chatter: true, tint: { c: '#9DB8E0', k: 0.5 }, rot: -0.08 });
        for (let i = 0; i < 8; i++) {
          const ph = (t * 1.3 + i / 8) % 1;
          const y = 300 + i * 70;
          line(ctx, [[lerp(-200, 2200, ph), y], [lerp(-200, 2200, ph) + 260, y + 10]], { color: 'rgba(255,255,255,0.8)', lw: 6 });
        }
      });
      text(ctx, 'a little wind', 480, 180, { size: 70, font: 'hand', color: P.white, stroke: P.ink, sw: 9, a: prog(t, tWind + 0.9, 0.3) });
      if (t > tFrost) {
        tag(ctx, 'FROSTBITE', 1450, 330, { size: 80, font: 'bold', bg: P.blueD, color: P.white, s: popScale(t, tFrost + 0.4, Infinity, 0.4) });
        countdown(ctx, 1450, 560, t > tTen ? 600 - (t - tTen) * 2 : 600, popScale(t, tTen, Infinity, 0.4), P.blueL);
        text(ctx, 'under 10 minutes', 1450, 700, { size: 56, font: 'hand', color: P.white, stroke: P.ink, sw: 8, a: prog(t, tTen + 0.2, 0.3) });
      }
    },
  });

  // ---- fingers: numb, white, stop working; only tools ----
  shots.push({
    a: tNumb, b: tTenMin,
    draw(ctx, t) {
      notebookBG(ctx, t, { color: '#E7EEF2' });
      if (t < tTools) {
        const st = t < tWhite ? 0 : t < tStop ? 1 : 2;
        const k = st === 0 ? prog(t, tNumb, 0.8) * 0.4 : st === 1 ? 0.4 + prog(t, tWhite, 0.6) * 0.4 : 1;
        const skin = mix(P.skin, '#E9EEF4', clamp(k * 1.2));
        const finger = st === 2 ? '#B7C6D8' : mix(P.skin, '#F2F5F8', clamp(k * 1.3));
        tx(ctx, { x: 700, y: 640, r: st === 2 ? wiggle(t, 1, 0.02) : Math.sin(t * 30) * 0.01 }, () => bigHand(ctx, 0, 0, 2.2, skin, mix(P.skinD, '#C9D3DE', k), { fingerC: finger, frost: st === 2 }));
        const labels = [[tNumb, 'numb', P.blueL], [tWhite, 'white', P.white], [tStop, 'stop working', P.blueD]];
        labels.forEach(([ta, lbl, col], i) => {
          if (t < ta) return;
          const y = 300 + i * 200;
          tag(ctx, `${i + 1}. ${lbl}`, 1450, y, { size: 76, font: 'bold', s: popScale(t, ta, Infinity, 0.4), bg: col, color: i === 2 ? P.white : P.ink });
        });
        return;
      }
      // fingers are his only tools
      text(ctx, "GREG'S TOOLS", 960, 170, { size: 90, font: 'marker', s: popScale(t, tTools, Infinity, 0.4) });
      const sz = 200;
      for (let i = 0; i < 6; i++) {
        const x = 960 + (i - 2.5) * (sz + 24), y = 500;
        rrect(ctx, x - sz / 2, y - sz / 2, sz, sz, 20, { fill: '#E9DFCC', lw: 5 });
        if (i === 0) tx(ctx, { x, y: y + 40, s: popScale(t, tTools + 0.4, Infinity, 0.4) * 0.5 }, () => bigHand(ctx, 0, 0, 1, P.skin, P.skinD));
      }
      text(ctx, '10 fingers', 960 - 2.5 * (sz + 24), 660, { size: 50, font: 'hand', a: prog(t, tTools + 0.5, 0.3) });
      text(ctx, '(that was it)', 960, 820, { size: 64, font: 'hand', color: P.inkL, a: prog(t, tTools + 1.2, 0.3) });
    },
  });

  // ---- 10 minutes to save his life; only snow around ----
  shots.push({
    a: tTenMin, b: tTwist,
    draw(ctx, t) {
      const camX = t < tSnow ? 960 : 960 + (t - tSnow) * 500;
      withCam(ctx, { x: camX, y: 560, z: 1.1 }, () => {
        arcticBG(ctx, t, { storm: 1.2, camX });
        drawPerson(ctx, { x: 820, y: GROUND, s: 1.15, costume: 'greg', pose: t < tSnow ? 'panic' : 'hug', expr: t < tSnow ? 'scared' : 'cold', t, id: 1, shiver: 1.2, chatter: true, tint: { c: '#9DB8E0', k: 0.5 }, look: t > tSnow ? [0.8, 0] : [0, 0] });
      });
      if (t > tSnow) {
        [['snow', 0.2], ['more snow', 0.8], ['also snow', 1.4]].forEach(([s, dt], i) => {
          tag(ctx, s, 600 + i * 450, 300 + (i % 2) * 120, { size: 64, s: popScale(t, tSnow + dt, Infinity, 0.4), bg: P.white, r: (i - 1) * 0.06 });
        });
      } else {
        text(ctx, '10 MINUTES', 960, 250, { size: 130, font: 'bold', color: P.red, stroke: P.ink, sw: 12, s: popScale(t, tTenMin + 0.8, Infinity, 0.4) });
        text(ctx, 'to save his own life', 960, 370, { size: 70, font: 'hand', color: P.white, stroke: P.ink, sw: 9, a: prog(t, tTenMin + 1.6, 0.4) });
      }
      hud(ctx, t);
    },
  });

  // ---- twist: snow is the answer; trapped air ----
  shots.push({
    a: tTwist, b: tDigs,
    draw(ctx, t) {
      const spin = prog(t, tTwist, 0.9, E.inOutCubic);
      withCam(ctx, { x: 960, y: 540, z: 1 + Math.sin(spin * Math.PI) * 0.3, r: spin * TAU }, () => {
        notebookBG(ctx, t, { color: '#E3EEF5' });
        if (t < tFresh) {
          const s = popScale(t, tAnswer, Infinity, 0.5);
          glow(ctx, 960, 540, 420 * s, '#FFF2B8', 0.8);
          snowflake(ctx, 960, 560, 230 * s, t * 0.3, '#CFE6F5');
        }
      });
      if (t < tAnswer) text(ctx, 'PLOT TWIST', 960, 540, { size: 170, font: 'bold', color: P.mustard, stroke: P.ink, sw: 14, s: popScale(t, tTwist + 0.4, Infinity, 0.4), r: -0.05 });
      if (t > tAnswer && t < tFresh) text(ctx, 'THE SNOW IS THE ANSWER', 960, 150, { size: 90, font: 'bold', color: P.blueDD, stroke: P.white, sw: 10, s: popScale(t, tAnswer + 0.2, Infinity, 0.4) });
      if (t > tFresh) {
        inset(ctx, 760, 560, 380, prog(t, tFresh - 0.2, 0.45), (g) => {
          g.fillStyle = '#BFD9EA'; g.fillRect(-400, -400, 800, 800);
          const r2 = rng(12);
          for (let i = 0; i < 26; i++) {
            const x = (r2() - 0.5) * 720, y = (r2() - 0.5) * 720;
            snowflake(g, x, y, 34 + r2() * 20, r2() * 3 + t * 0.2, '#F7FBFE');
          }
          if (t > tAirW) for (let i = 0; i < 14; i++) {
            const x = (hash(i * 4.1) - 0.5) * 600, y = (hash(i * 2.3) - 0.5) * 600;
            circle(g, x, y, 22 * clamp((t - tAirW) * 3 - i * 0.1), { fill: null, stroke: P.blueD, lw: 4 });
          }
        }, { handle: true });
        tag(ctx, 'mostly trapped air', 1450, 400, { size: 64, s: popScale(t, tAirW, Infinity, 0.4), bg: P.blueL });
        tag(ctx, 'GREAT INSULATOR', 1450, 620, { size: 72, font: 'bold', s: popScale(t, tInsul, Infinity, 0.4), bg: P.mustardL });
      }
      hud(ctx, t);
    },
  });

  // ---- dig a snow cave ----
  shots.push({
    a: tDigs, b: tInside,
    draw(ctx, t) {
      const cross = t > tHollow + 0.4;
      withCam(ctx, { x: 960, y: 580, z: 1.05 }, () => {
        arcticBG(ctx, t, { storm: 0.8 });
        const cave = cross ? prog(t, tHollow + 0.4, 1.2) : 0;
        snowDrift(ctx, 1100, 900, 1.1, t, cave);
        if (!cross) {
          const dk = Math.sin(t * 14);
          drawPerson(ctx, { x: 520 + prog(t, tDigs + 0.8, 1.5) * 120, y: GROUND + 10, s: 1.1, costume: 'greg', pose: { aL: [80 + dk * 30, 40], aR: [80 - dk * 30, 40], crouch: 20 }, expr: 'determined', t, id: 1, tint: COLD, shiver: 0.5, look: [0.7, 0] });
          for (let i = 0; i < 10; i++) {
            const ph = ((t - tDigs) * 2 + i / 10) % 1;
            circle(ctx, 640 - ph * 380, 700 - Math.sin(ph * Math.PI) * 260, 12, { fill: P.white, lw: 2.5 });
          }
        } else {
          // Greg curled up inside the cave
          drawPerson(ctx, { x: 1100 + 80, y: 900 - 90, s: 0.7, costume: 'greg', pose: { aL: [30, -130], aR: [30, -130], lL: [60, -120], lR: [60, -120] }, expr: t > tCurl ? 'smile' : 'cold', t, id: 1, rot: -Math.PI / 2, noShadow: true, tint: COLD, shiver: 0.4 });
          tag(ctx, 'snow cave', 1100, 360, { size: 70, font: 'marker', s: popScale(t, tHollow + 0.6, Infinity, 0.4), bg: P.white });
        }
      });
      if (t < tHollow) text(ctx, 'DIG!', 960, 200, { size: 130, font: 'bold', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tDigs + 0.4, Infinity, 0.35) * (1 + Math.sin(t * 16) * 0.04) });
      if (t > tCurl) text(ctx, 'just big enough to curl up in', 960, 1000, { size: 60, font: 'hand', color: P.ink, stroke: P.white, sw: 9, a: prog(t, tCurl, 0.3) });
      hud(ctx, t);
    },
  });

  // ---- inside vs outside; 40 degree difference; built from the killer ----
  shots.push({
    a: tInside, b: tEat,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 560, z: 1.0 }, () => {
        arcticBG(ctx, t, { storm: 1.2 });
        const angry = t > tKill ? prog(t, tKill, 0.4) : 0;
        snowDrift(ctx, 960, 920, 1.25, t, 1, { face: angry });
        drawPerson(ctx, { x: 960 + 90, y: 920 - 100, s: 0.78, costume: 'greg', pose: { aL: [30, -130], aR: [30, -130], lL: [60, -120], lR: [60, -120] }, expr: 'smile', t, id: 1, rot: -Math.PI / 2, noShadow: true, tint: { c: '#9DB8E0', k: 0.25 } });
      });
      const inP = popScale(t, tInside + 0.3, Infinity, 0.4);
      thermometer(ctx, 700, 700, 300, 0.62, { color: P.mustardD, bulb: 36, w: 32 });
      tag(ctx, 'INSIDE: ~0°', 700, 300, { size: 64, font: 'bold', s: inP, bg: P.mustardL });
      if (t > tOutside) {
        const oS = popScale(t, tOutside, Infinity, 0.4);
        thermometer(ctx, 1640, 700, 300, 0.03, { color: P.blueD, bulb: 36, w: 32 });
        tag(ctx, 'OUTSIDE: -40°', 1640, 300, { size: 64, font: 'bold', s: oS, bg: P.blueL });
      }
      if (t > tDiff && t < tBuilt) {
        const p = prog(t, tDiff, 0.5);
        line(ctx, [[760, 520], [1580, 520]], { lw: 8, p, color: P.red });
        text(ctx, '40° DIFFERENCE', 1170, 440, { size: 90, font: 'bold', color: P.red, stroke: P.white, sw: 10, s: popScale(t, tDiff + 0.3, Infinity, 0.4) });
      }
      if (t > tBuilt) {
        tag(ctx, 'built by hand', 1170, 440, { size: 64, s: popScale(t, tBuilt, Infinity, 0.4), bg: P.white });
        if (t > tKill) tag(ctx, 'out of the thing trying to kill him', 960, 130, { size: 58, s: popScale(t, tKill, Infinity, 0.4), bg: P.coralL });
      }
    },
  });

  // ---- eat snow? no. melt, burns heat, literally eating ice ----
  shots.push({
    a: tEat, b: tEven,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 520, z: 1.45 }, () => {
        arcticBG(ctx, t, { storm: 0.8 });
        const eating = t > tLike;
        drawPerson(ctx, {
          x: 820, y: GROUND, s: 1.1, costume: 'greg', pose: 'drink', expr: t > tNoW && !eating ? 'sad' : eating ? { eyes: 'squint', mouth: 'teeth', brows: [0.5, 0.5], browTilt: 1 } : 'thinking', t, id: 1, tint: COLD, shiver: 0.8,
          holdR: (g, hx, hy) => {
            if (eating) iceCube(g, hx + 10, hy - 30, 0.5, t, false);
            else circle(g, hx + 10, hy - 20, 30 * (1 - prog(t, tMelt + 0.5, 3.0) * 0.6), { fill: P.snow, lw: 4.5 });
          },
        });
      });
      if (t < tNoW) text(ctx, 'eat snow for water?', 1280, 320, { size: 70, font: 'hand', color: P.ink, stroke: P.white, sw: 10, s: popScale(t, tEat + 0.3, Infinity, 0.4) });
      if (t > tNoW && t < tLike) {
        text(ctx, 'NO.', 1350, 300, { size: 200, font: 'bold', color: P.red, stroke: P.ink, sw: 14, s: popScale(t, tNoW, Infinity, 0.3) });
        if (t > tMelt) {
          meter(ctx, 1080, 560, 560, 64, 0.7 - prog(t, tMelt + 0.3, 3.0) * 0.55, P.coral, 'BODY HEAT', { size: 52, stroke: P.white });
          tag(ctx, 'melting snow burns heat', 1360, 780, { size: 54, s: popScale(t, tMelt + 0.6, Infinity, 0.4), bg: P.white });
        }
      }
      if (t > tLike) {
        tag(ctx, 'warming up by eating ice', 1320, 280, { size: 60, s: popScale(t, tLike + 0.2, Infinity, 0.4), bg: P.white });
        if (t > tLiterally) stamp(ctx, 'LITERALLY', 1320, 500, { p: prog(t, tLiterally + 0.4, 0.35), size: 110, color: P.blueD, r: -0.1 });
      }
    },
  });

  // ---- still freezing ----
  shots.push({
    a: tEven, b: tHours,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.blueD });
      snowDrift(ctx, 960, 980, 1.6, t, 1);
      drawPerson(ctx, { x: 960 + 110, y: 980 - 130, s: 1.0, costume: 'greg', pose: { aL: [30, -130], aR: [30, -130], lL: [60, -120], lR: [60, -120] }, expr: 'cold', t, id: 1, rot: -Math.PI / 2, noShadow: true, tint: { c: '#9DB8E0', k: 0.45 }, shiver: 1, chatter: true });
      callout(ctx, 'lying on ice', 380, 560, 700, 880, prog(t, tIce, 0.5), { size: 56 });
      callout(ctx, 'in a t-shirt', 960, 300, 1000, 780, prog(t, tTee, 0.5), { size: 56 });
      callout(ctx, 'no food to burn', 1560, 520, 1180, 800, prog(t, tNoFood, 0.5), { size: 56, bend: -0.2 });
      if (t > tStill) {
        thermometer(ctx, 1700, 900, 300, 0.5, { color: P.blueD, bulb: 34, w: 30 });
        stamp(ctx, 'STILL FREEZING', 960, 140, { p: prog(t, tStill + 0.8, 0.35), size: 100, color: P.blueD, r: -0.06, bg: P.white });
      }
    },
  });
  shots.push(clockShot('arctic', tClock, tHours, 'A FEW\nHOURS', '(maybe one night if he digs fast)', { size: 110, textColor: P.redD }));

  // ---- counted in hours ----
  shots.push({
    a: tHours, b: tFinal,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.plum });
      text(ctx, 'THE CLOCKS SO FAR', 960, 130, { size: 76, font: 'marker' });
      const clocks = [['forest', 'forever', P.greenD], ['jungle', 'weeks', '#4F8F63'], ['desert', 'days', P.mustardD], ['ocean', 'a day', P.blueD], ['arctic', 'HOURS', P.redD]];
      clocks.forEach(([k, unit, col], i) => {
        const x = 260 + i * 350, y = 520;
        const s = popScale(t, tHours + i * 0.2, Infinity, 0.4);
        const hl = i === 4 && t > tCounted;
        tx(ctx, { x, y, s: s * (hl ? 1.25 + Math.sin(t * 8) * 0.03 : 1) }, () => {
          stopwatch(ctx, 0, 0, 110, t, i === 4 ? t * 2 : 0.1 + i * 0.15, LEVELS[k].clock);
        });
        text(ctx, unit, x, y + 220, { size: hl ? 86 : 64, font: 'bold', color: col, s });
      });
    },
  });
  return shots;
}
