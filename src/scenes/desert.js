// 4:24 - 5:48  Level 3: the Sahara.
import { P, shape, circle, ellipse, line, tx, text, tag, stamp, rrect, arrow, crossOut, checkMark, glow, swash, fillScreen, vgrad, measure, star } from '../engine/draw.js';
import { W, H, E, clamp, lerp, prog, vis, popScale, cues, wiggle, TAU, hash, rng, mix, rgba } from '../engine/core.js';
import { drawPerson, walkPose } from '../chars/person.js';
import { withCam, keys, thoughtBubble, inset, panel, banner, meter, sparkle, comicBurst, burstLines, calendarPage, skull, speech, flash, shake, thermometer, numberBadge, heatWaves, irisWipe } from '../ui.js';
import { desertBG, notebookBG, bigLeaf, rock, cloud } from '../bg.js';
import { callout } from '../props.js';
import { levelShot, wipeShot, clockShot, portalDrop, dustPuff, sepia, dim, sunglasses } from './common.js';
import { drawWorld, drawRegion, USA, SAHARA, proj, pin } from '../worldmap.js';

const GROUND = 850;

function bottle(ctx, x, y, s, level) {
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
function lizard(ctx, x, y, s, t, walk = 0, flip = false) {
  tx(ctx, { x, y, s, sx: flip ? -1 : 1 }, () => {
    const k = Math.sin(t * 14) * walk;
    for (const [lx, ph] of [[-40, 1], [40, -1]]) {
      line(ctx, [[lx, 0], [lx - 18 + k * 14 * ph, 34]], { color: '#A7B86A', lw: 12, outline: 2 });
      line(ctx, [[lx + 10, 0], [lx + 28 - k * 14 * ph, 34]], { color: '#A7B86A', lw: 12, outline: 2 });
    }
    line(ctx, [[-70, 0], [-160, 10 + Math.sin(t * 3) * 10], [-210, -10]], { color: '#B9C97A', lw: 18, outline: 2.5, smooth: true });
    ellipse(ctx, 0, 0, 80, 28, { fill: '#B9C97A', lw: 5 });
    for (let i = 0; i < 4; i++) circle(ctx, -40 + i * 24, -6, 5, { fill: '#8C9C54', stroke: null });
    ellipse(ctx, 92, -12, 40, 24, { fill: '#B9C97A', lw: 5 });
    circle(ctx, 104, -22, 8, { fill: P.white, lw: 3 });
    circle(ctx, 106, -22, 3.5, { fill: P.ink, stroke: null });
    line(ctx, [[112, -4], [128, -6]], { lw: 3 });
  });
}
function stomach(ctx, x, y, s, t) {
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
function manual(ctx, x, y, s, open) {
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
function oasis(ctx, x, y, s, t) {
  tx(ctx, { x, y, s }, () => {
    ellipse(ctx, 0, 0, 200, 50, { fill: '#8CC4E0', lw: 5 });
    for (const [px, h, a] of [[-120, 260, -0.15], [110, 300, 0.1], [20, 220, 0.05]]) {
      line(ctx, [[px, -10], [px + Math.sin(a) * h, -h]], { color: '#A37A52', lw: 18, outline: 2.5 });
      for (let k = 0; k < 5; k++) bigLeaf(ctx, px + Math.sin(a) * h, -h, 140, -Math.PI / 2 + (k - 2) * 0.7 + Math.PI * (k > 2 ? 0 : 0), '#6FA062', '#4F8250', t, k, { veins: false, width: 0.25 });
    }
  });
}

export function build() {
  const c = cues(264);
  const shots = [];
  const tSahara = c('the sahara'), tSize = c('it\'s about the size'), tUS = c('united states'), tMiddle = c('and greg is right');
  const t45 = c('forty five degrees'), t113 = c('which is one hundred'), tHeat = c('in heat like this'), tLiter = c('a liter of water'), tHour = c('every hour');
  const tInstinct = c('so his first instinct'), tWalk = c('walk and find water'), tFast = c('fast', 282.5), tDie = c('that\'s exactly how'), tDie2 = c('die out here');
  const tShould = c('what greg should do'), tBack = c('backwards');
  const t1 = c('one do nothing'), tNothing = c('do nothing'), tShade = c('find shade'), tDig = c('or dig'), tFoot = c('just a foot under'), tCooler = c('way cooler');
  const t2 = c('two keep his clothes'), tCover = c('covering up'), tSlows = c('and slows down'), tShirtless = c('shirtless greg'), tDead = c('is dead greg');
  const t3 = c('three don\'t eat'), tDigest = c('digesting food'), tLizard = c('so even if a lizard'), tLunch = c('lunch could');
  const t4 = c('four only move'), tSunDown = c('once the sun goes down'), tDrop = c('can drop more than'), tRoast = c('greg goes from roasting'), tShiver = c('to shivering'), tSame = c('in the same t shirt');
  const tMil = c('military survival guides'), tNoWater = c('with no water'), tResting = c('resting in the shade'), tTwo = c('a person lasts about two');
  const tWalkSun = c('walking around in the sun'), tOne = c('about one', 336);
  const tOasis = c('and the nearest oasis'), tKm = c('hundreds of kilometers');
  const tClock = c('survival clock'), tTwoBad = c('two days sounds bad'), tVacation = c('the next place makes it'), tVac2 = c('vacation'), tOcean = c('greg opens his eyes');

  shots.push(levelShot('desert', tSahara, tSize));
  shots.push(wipeShot(tSize, '#D08A4C', 19, 0.3));

  // ---- size comparison map ----
  const tLand = tMiddle + 1.1;
  shots.push({
    a: tSize, b: tLand,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: P.mustardD });
      const zoom = prog(t, tMiddle, 1.0, E.inOutCubic);
      const SX = 600, SY = 580;
      withCam(ctx, { x: lerp(960, SX, zoom), y: lerp(540, SY - 40, zoom), z: lerp(1, 1.7, zoom) }, () => {
        const k = 15; // px per degree (same scale for both shapes)
        const over = prog(t, tUS + 0.4, 0.9, E.inOutCubic);
        const sp = popScale(t, tSize, Infinity, 0.45);
        tx(ctx, { x: SX, y: SY, s: sp }, () => drawRegion(ctx, SAHARA, 0, 0, k, { fill: P.sand, lw: 6 }));
        text(ctx, 'SAHARA', SX, SY + 10, { size: 64, font: 'bold', color: P.mustardD, s: sp * (1 - zoom), stroke: P.white, sw: 8 });
        if (t > tUS - 0.2) {
          const up = popScale(t, tUS - 0.2, Infinity, 0.45);
          const ux = lerp(1380, SX, over);
          tx(ctx, { x: ux, y: SY, s: up, a: 1 - zoom }, () => {
            drawRegion(ctx, USA, 0, 0, k, { fill: rgba(P.blue, lerp(1, 0.3, over)), stroke: 'rgba(0,0,0,0)', lw: 1 });
            drawRegion(ctx, USA, 0, 0, k, { fill: 'rgba(0,0,0,0)', stroke: over > 0.2 ? P.blueDD : P.ink, lw: 6 });
          });
          text(ctx, 'USA', ux, lerp(SY + 10, SY - 150, over), { size: 64, font: 'bold', color: P.blueDD, s: up * (1 - zoom), stroke: P.white, sw: 8 });
        }
        if (over > 0.5 && zoom < 0.5) text(ctx, 'ABOUT THE SAME SIZE', 1260, 580, { size: 76, font: 'bold', color: P.ink, s: popScale(t, tUS + 0.8, Infinity, 0.35), a: 1 - zoom * 2, maxW: 640 });
        if (t > tMiddle) {
          const gs = popScale(t, tMiddle + 0.3, Infinity, 0.4);
          pin(ctx, SX, SY, P.red, 0.8 * gs);
          text(ctx, 'GREG', SX, SY - 90, { size: 40, font: 'bold', color: P.red, s: gs, stroke: P.white, sw: 6 });
        }
      });
      text(ctx, 'THE SAHARA vs THE USA', 960, 120, { size: 70, font: 'marker', a: 1 - zoom });
      if (t > tMiddle + 0.4) text(ctx, 'Greg is right in the middle', 960, 960, { size: 64, font: 'hand', stroke: P.white, sw: 10, s: popScale(t, tMiddle + 0.4, Infinity, 0.4) });
    },
  });

  // ---- arrival + heat ----
  shots.push({
    a: tLand, b: tInstinct,
    draw(ctx, t) {
      withCam(ctx, { x: 900, y: 560, z: 1.1 }, () => {
        desertBG(ctx, t, {});
        const d = portalDrop(ctx, t, tLand - 0.3, 760, GROUND, 150);
        const sweating = t > tHeat;
        if (d.visible) drawPerson(ctx, { x: 760, y: d.y, s: 1.15, costume: 'greg', pose: !d.landed ? 'panic' : sweating ? 'relaxed' : 'stand', expr: !d.landed ? 'shocked' : 'hot', t, id: 1, squash: d.squash, sweat: d.landed ? (sweating ? 1.6 : 1) : 0, tint: { c: '#F09080', k: 0.15 } });
        dustPuff(ctx, 760, GROUND, tLand + 0.5, t, 1, 'rgba(240,210,160,0.9)');
        heatWaves(ctx, 760, 400, t);
        if (t < tHeat) {
          const tp = prog(t, t45 - 0.3, 1.2, E.outCubic);
          thermometer(ctx, 1360, 820, 520, 0.2 + tp * 0.72, { color: P.red, bulb: 56, w: 50 });
          if (t > t45) text(ctx, '45°C', 1580, 400, { size: 110, font: 'bold', color: P.red, stroke: P.white, sw: 10, s: popScale(t, t45 + 0.4, Infinity, 0.4) });
          if (t > t113) text(ctx, '= 113°F', 1600, 540, { size: 80, font: 'bold', color: P.coralD, stroke: P.white, sw: 10, s: popScale(t, t113 + 0.2, Infinity, 0.4) });
        } else {
          const lvl = 1 - (((t - tLiter) * 0.35) % 1);
          bottle(ctx, 1320, 640, popScale(t, tLiter - 0.3, Infinity, 0.4) * 1.3, t > tLiter ? lvl : 1);
          if (t > tHour) {
            tag(ctx, '1 liter of sweat / hour', 1320, 330, { size: 58, s: popScale(t, tHour, Infinity, 0.4), bg: P.blueL });
          }
          for (let i = 0; i < 6; i++) {
            const ph = (t * 1.1 + i / 6) % 1;
            circle(ctx, 700 + i * 24, 520 + ph * 300, 8, { fill: P.blueL, lw: 2.5, alpha: 1 - ph });
          }
        }
      });
    },
  });

  // ---- instinct: walk fast ... that's how people die ----
  shots.push({
    a: tInstinct, b: tShould,
    draw(ctx, t) {
      const frozen = t > tDie;
      const tt = frozen ? tDie : t;
      const camX = 960 + (tt - tInstinct) * 260;
      withCam(ctx, { x: camX, y: 560, z: 1.1 }, () => {
        desertBG(ctx, tt, { camX });
        const gx = camX - 120;
        drawPerson(ctx, { x: gx, y: GROUND, s: 1.15, costume: 'greg', pose: walkPose(tt * 2.2, 1.2), expr: 'determined', t: tt, id: 1, sweat: 1.4, look: [0.7, 0] });
        if (t > tWalk && !frozen) for (let i = 0; i < 4; i++) line(ctx, [[gx - 140 - i * 40, 600 + i * 50], [gx - 240 - i * 40, 600 + i * 50]], { lw: 5, alpha: 0.5 });
        if (t > tWalk - 0.3 && !frozen) thoughtBubble(ctx, gx + 300, 330, 340, 200, prog(t, tWalk - 0.3, 0.4), gx + 60, 460, (g) => {
          text(g, 'FIND WATER', 0, -10, { size: 50, font: 'bold', color: P.blueD });
          text(g, 'FAST!', 0, 44, { size: 44, font: 'bold', color: P.red });
        });
      });
      if (frozen) {
        sepia(ctx, 0.75 * prog(t, tDie, 0.2));
        stamp(ctx, 'WRONG MOVE', 960, 300, { p: prog(t, tDie + 0.2, 0.35), size: 120, r: -0.1 });
        if (t > tDie2) tx(ctx, { x: 960, y: 560 }, () => skull(ctx, 0, 0, 90 * popScale(t, tDie2 - 0.2, Infinity, 0.4)));
      }
    },
  });

  // ---- backwards ----
  shots.push({
    a: tShould, b: t1,
    draw(ctx, t) {
      withCam(ctx, { x: 960, y: 560, z: 1.1 }, () => {
        desertBG(ctx, t, {});
        const mx = 960 - (t - tShould) * 120;
        drawPerson(ctx, { x: mx, y: GROUND, s: 1.15, costume: 'greg', pose: walkPose(t * 1.6, 0.8), expr: 'thinking', t, id: 1, sweat: 1, look: [0.6, 0] });
      });
      const f = prog(t, tBack, 0.6, E.inOutCubic);
      const sx = Math.cos(f * Math.PI);
      tx(ctx, { x: 960, y: 250, sx: sx === 0 ? 0.001 : -sx, s: popScale(t, tShould + 0.3, Infinity, 0.4) }, () => {
        text(ctx, 'BACKWARDS', 0, 0, { size: 150, font: 'bold', color: P.mustard, stroke: P.ink, sw: 12 });
      });
      text(ctx, 'sounds completely', 960, 110, { size: 60, font: 'hand', color: P.white, stroke: P.ink, sw: 8, a: prog(t, tShould + 0.8, 0.3) });
    },
  });

  // rule badge (top-left)
  const ruleBadge = (ctx, t, n, str, ta, color = P.mustardD) => {
    const s = popScale(t, ta, Infinity, 0.45);
    tx(ctx, { x: 120, y: 120, s }, () => {
      rrect(ctx, -10, -64, 780, 128, 30, { fill: P.white, lw: 6 });
      numberBadge(ctx, n, 50, 0, 62, color);
      text(ctx, str, 140, 6, { size: 72, font: 'bold', color: P.ink, align: 'left', maxW: 620 });
    });
  };

  // ---- rule 1: do nothing, shade or dig, cooler sand ----
  shots.push({
    a: t1, b: t2,
    draw(ctx, t) {
      if (t < tFoot) {
        withCam(ctx, { x: 960, y: 560, z: 1.12 }, () => {
          desertBG(ctx, t, { noRocks: true });
          rock(ctx, 1320, 870, 3.2, '#C9A27A', '#A9825D');
          const digging = t > tDig;
          if (!digging) {
            drawPerson(ctx, { x: 1180, y: GROUND + 10, s: 1.1, costume: 'greg', pose: { aL: [150, 60], aR: [150, 60] }, expr: 'sleep', t, id: 1, rot: -Math.PI / 2 * prog(t, tNothing, 0.5), noShadow: true });
            if (t > tNothing + 0.6) text(ctx, 'z', 1000, 700 - ((t * 60) % 60), { size: 50, font: 'bold', color: P.blueD });
          } else {
            const dk = Math.sin(t * 12);
            drawPerson(ctx, { x: 760, y: GROUND + 30, s: 1.1, costume: 'greg', pose: { aL: [60 + dk * 30, 40], aR: [60 - dk * 30, 40], crouch: 30 }, expr: 'determined', t, id: 1, look: [0, 0.6] });
            ellipse(ctx, 760, GROUND + 40, 200, 30, { fill: '#D9A95E', lw: 4 });
            for (let i = 0; i < 8; i++) {
              const ph = ((t - tDig) * 1.8 + i / 8) % 1;
              circle(ctx, 760 + (i % 2 ? 1 : -1) * ph * 260, GROUND - Math.sin(ph * Math.PI) * 200, 10, { fill: P.sand, lw: 2.5 });
            }
          }
          if (t > tShade && !digging) tag(ctx, 'shade', 1320, 560, { size: 56, s: popScale(t, tShade, Infinity, 0.4), bg: P.white });
        });
        ruleBadge(ctx, t, 1, 'DO NOTHING', t1);
        return;
      }
      // cross-section: surface hot, a foot down cooler
      notebookBG(ctx, t, { header: P.mustardD });
      const gy = 420;
      vgrad(ctx, gy, H + 50, [[0, '#F0C27A'], [0.35, '#E3B26E'], [1, '#C99A63']]);
      // temperature tint layers
      ctx.fillStyle = 'rgba(219,86,70,0.28)'; ctx.fillRect(0, gy, W, 70);
      ctx.fillStyle = 'rgba(95,131,179,0.22)'; ctx.fillRect(0, gy + 230, W, 300);
      for (let i = 0; i < 40; i++) circle(ctx, hash(i) * W, gy + 40 + hash(i * 3) * 600, 4, { fill: '#C9955A', stroke: null, wob: 0 });
      line(ctx, [[-50, gy], [W + 50, gy]], { lw: 6 });
      // trench with Greg lying in it
      shape(ctx, [[520, gy], [1400, gy], [1340, gy + 250], [580, gy + 250]], { fill: '#D9A868', lw: 5 });
      drawPerson(ctx, { x: 1180, y: gy + 175, s: 0.95, costume: 'greg', pose: { aL: [150, 60], aR: [150, 60] }, expr: 'proud', t, id: 1, rot: -Math.PI / 2, noShadow: true });
      // sun
      glow(ctx, 1650, 150, 260, '#FFE9A8', 0.8);
      circle(ctx, 1650, 150, 80, { fill: P.mustardL, lw: 5 });
      heatWaves(ctx, 300, gy - 30, t, 'rgba(219,86,70,0.9)');
      tag(ctx, 'SURFACE: scorching', 300, gy - 150, { size: 54, s: popScale(t, tFoot, Infinity, 0.4), bg: P.coralL });
      // ruler
      line(ctx, [[1520, gy], [1520, gy + 250]], { lw: 8, color: P.inkL });
      for (let i = 0; i <= 5; i++) line(ctx, [[1500, gy + i * 50], [1540, gy + i * 50]], { lw: 4 });
      text(ctx, '1 foot', 1640, gy + 125, { size: 54, font: 'hand', s: popScale(t, tFoot + 0.4, Infinity, 0.4) });
      tag(ctx, 'WAY COOLER', 960, gy + 420, { size: 70, font: 'bold', s: popScale(t, tCooler, Infinity, 0.4), bg: P.blueL, color: P.blueDD });
      ruleBadge(ctx, t, 1, 'DO NOTHING', t1);
    },
  });

  // ---- rule 2: keep clothes on ----
  shots.push({
    a: t2, b: t3,
    draw(ctx, t) {
      const shirtless = t > tShirtless;
      withCam(ctx, { x: 960, y: 560, z: 1.15 }, () => {
        desertBG(ctx, t, {});
        drawPerson(ctx, {
          x: 900, y: GROUND, s: 1.2, costume: 'greg', t, id: 1,
          pose: shirtless ? (t > tDead ? 'stand' : { aL: [100, 110], aR: [100, 110] }) : 'hips', expr: shirtless ? (t > tDead ? 'dead' : 'grin') : 'determined',
          shirtless, tint: shirtless ? { c: '#E0604A', k: clamp((t - tShirtless) / 1.2) * 0.55 } : null, sweat: 1,
        });
        if (!shirtless && t > tCover) {
          // sun rays bouncing off the shirt
          for (let i = 0; i < 4; i++) {
            const ph = (t * 0.8 + i / 4) % 1;
            const x0 = 1500 - i * 60, y0 = 120;
            const hx = 920 + (i - 1.5) * 20, hy = 640;
            const pIn = clamp(ph * 2), pOut = clamp(ph * 2 - 1);
            line(ctx, [[x0, y0], [lerp(x0, hx, pIn), lerp(y0, hy, pIn)]], { color: P.mustardD, lw: 7 });
            if (pOut > 0) arrow(ctx, hx, hy, lerp(hx, hx + 500, pOut), lerp(hy, hy - 300, pOut), { color: P.mustardD, lw: 7, bend: 0, head: 18 });
          }
          if (t > tSlows) tag(ctx, 'less sweat lost', 560, 380, { size: 56, s: popScale(t, tSlows, Infinity, 0.4), bg: P.blueL });
        }
        if (shirtless && t < tDead) for (let i = 0; i < 4; i++) sparkle(ctx, 900 + Math.cos(i * 1.7) * 200, 560 + Math.sin(i * 2.3) * 140, 18 * Math.abs(Math.sin(t * 5 + i)), P.white);
      });
      if (shirtless) {
        text(ctx, 'SHIRTLESS GREG', 1400, 380, { size: 80, font: 'bold', color: P.coral, stroke: P.ink, sw: 10, s: popScale(t, tShirtless, Infinity, 0.4), r: 0.05 });
        if (t > tDead) {
          stamp(ctx, 'DEAD GREG', 1400, 560, { p: prog(t, tDead, 0.35), size: 110, r: -0.1 });
          skull(ctx, 1400, 790, 70 * popScale(t, tDead + 0.2, Infinity, 0.4));
        }
      }
      ruleBadge(ctx, t, 2, 'KEEP CLOTHES ON', t2);
    },
  });

  // ---- rule 3: don't eat ----
  shots.push({
    a: t3, b: t4,
    draw(ctx, t) {
      if (t < tLizard) {
        notebookBG(ctx, t, { header: P.mustardD });
        stomach(ctx, 760, 600, popScale(t, tDigest - 0.3, Infinity, 0.4) * 1.5, t);
        if (t > tDigest) {
          tag(ctx, 'digesting food', 1350, 480, { size: 60, s: popScale(t, tDigest, Infinity, 0.4) });
          tag(ctx, '= uses up water', 1350, 620, { size: 60, s: popScale(t, tDigest + 0.8, Infinity, 0.4), bg: P.blueL });
        }
        if (t < tDigest) drawPerson(ctx, { x: 960, y: 960, s: 1.2, costume: 'greg', pose: 'hug', expr: 'sad', t, id: 1 });
        ruleBadge(ctx, t, 3, "DON'T EAT", t3);
        return;
      }
      withCam(ctx, { x: 960, y: 580, z: 1.2 }, () => {
        desertBG(ctx, t, {});
        const lx = keys(t, [[tLizard, 1900], [tLizard + 1.6, 1200, E.outCubic]]);
        drawPerson(ctx, { x: 820, y: GROUND, s: 1.15, costume: 'greg', pose: 'stand', expr: t > tLunch ? { eyes: 'open', mouth: 'grin', brows: [-0.2, -0.2], browTilt: -1 } : 'surprised', t, id: 1, look: [0.8, 0.5], sweat: 0.8 });
        lizard(ctx, lx, GROUND - 30, 1.1, t, t < tLizard + 1.6 ? 1 : 0, true);
        if (t > tLunch) {
          // the lizard holds up a sign
          tx(ctx, { x: lx + 20, y: GROUND - 250, s: popScale(t, tLunch + 0.3, Infinity, 0.4), r: 0.06 }, () => {
            line(ctx, [[0, 60], [0, 190]], { color: '#8A6448', lw: 12, outline: 2 });
            rrect(ctx, -180, -70, 360, 140, 14, { fill: P.white, lw: 5 });
            text(ctx, 'bad idea,', 0, -22, { size: 50, font: 'hand' });
            text(ctx, 'trust me', 0, 32, { size: 50, font: 'hand' });
          });
          thoughtBubble(ctx, 560, 330, 300, 200, prog(t, tLunch, 0.3), 780, 480, (g) => lizard(g, 0, 10, 0.7, t));
        }
      });
      ruleBadge(ctx, t, 3, "DON'T EAT", t3);
    },
  });

  // ---- rule 4: move at night; temp drop; roasting vs shivering ----
  shots.push({
    a: t4, b: tMil,
    draw(ctx, t) {
      if (t < tRoast) {
        const night = prog(t, t4 + 0.6, 2.2, E.inOutSine);
        withCam(ctx, { x: 960, y: 560, z: 1.1 }, () => {
          desertBG(ctx, t, { night });
          const walking = night > 0.8;
          drawPerson(ctx, { x: walking ? 700 + (t - t4 - 2.8) * 60 : 700, y: GROUND, s: 1.1, costume: 'greg', pose: walking ? walkPose(t * 1.2) : 'stand', expr: night > 0.8 ? 'cold' : 'hot', t, id: 1, shiver: night > 0.8 ? 0.8 : 0, tint: { c: '#9DB8E0', k: night * 0.3 } });
        });
        if (t > tSunDown) {
          const drop = prog(t, tDrop - 0.2, 1.2);
          thermometer(ctx, 1500, 800, 480, lerp(0.9, 0.35, drop), { color: mix(P.red, P.blueD, drop), bulb: 50, w: 44 });
          if (t > tDrop) text(ctx, '-20°+', 1680, 500, { size: 90, font: 'bold', color: P.blueDD, stroke: P.white, sw: 10, s: popScale(t, tDrop + 0.3, Infinity, 0.4) });
        }
        ruleBadge(ctx, t, 4, 'MOVE AT NIGHT', t4);
        return;
      }
      // split screen
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip();
      withCam(ctx, { x: 960, y: 560, z: 1.2 }, () => {
        desertBG(ctx, t, {});
        drawPerson(ctx, { x: 560, y: GROUND, s: 1.1, costume: 'greg', pose: 'relaxed', expr: 'hot', t, id: 1, sweat: 2, tint: { c: '#E0604A', k: 0.4 } });
        heatWaves(ctx, 560, 440, t);
      });
      ctx.restore();
      if (t > tShiver - 0.3) {
        const slide = (1 - prog(t, tShiver - 0.3, 0.4)) * W / 2;
        ctx.save();
        ctx.beginPath(); ctx.rect(W / 2 + slide, 0, W / 2, H); ctx.clip();
        withCam(ctx, { x: 960 - slide / 1.2, y: 560, z: 1.2 }, () => {
          desertBG(ctx, t, { night: 1 });
          drawPerson(ctx, { x: 1360, y: GROUND, s: 1.1, costume: 'greg', pose: 'hug', expr: 'cold', t, id: 1, shiver: 1, chatter: true, tint: { c: '#9DB8E0', k: 0.4 } });
        });
        ctx.restore();
        line(ctx, [[W / 2 + slide, -20], [W / 2 + slide, H + 20]], { lw: 10 });
      }
      text(ctx, 'ROASTING', 480, 160, { size: 96, font: 'bold', color: P.coral, stroke: P.ink, sw: 10, s: popScale(t, tRoast + 0.2, Infinity, 0.4) });
      if (t > tShiver) text(ctx, 'SHIVERING', 1440, 160, { size: 96, font: 'bold', color: P.blueL, stroke: P.ink, sw: 10, s: popScale(t, tShiver, Infinity, 0.4) });
      if (t > tSame) tag(ctx, 'same day. same t-shirt.', 960, 980, { size: 60, s: popScale(t, tSame, Infinity, 0.4) });
    },
  });

  // ---- military guides: 2 days resting vs 1 day walking ----
  shots.push({
    a: tMil, b: tOasis,
    draw(ctx, t) {
      notebookBG(ctx, t, { header: '#6F7A4E' });
      const open = prog(t, tNoWater - 0.2, 0.3);
      const mp = popScale(t, tMil, Infinity, 0.45);
      tx(ctx, { x: 420, y: 560, s: mp * 0.9, r: -0.04 }, () => manual(ctx, 0, 0, 1, open > 0.5 ? 1 : 0));
      text(ctx, 'MILITARY SURVIVAL GUIDES:', 1180, 170, { size: 60, font: 'bold', color: '#4A5234', s: mp });
      text(ctx, 'no water, extreme heat', 1180, 240, { size: 50, font: 'hand', a: prog(t, tNoWater, 0.3) });
      // bars
      const bars = [[tResting, 'resting in shade', tTwo, 2, P.sageD], [tWalkSun, 'walking in the sun', tOne, 1, P.coralD]];
      bars.forEach(([ta, lbl, tv, days, col], i) => {
        if (t < ta) return;
        const y = 440 + i * 250;
        const bp = prog(t, tv - 0.3, 0.8, E.outCubic);
        text(ctx, lbl, 880, y - 60, { size: 54, font: 'hand', align: 'left', a: prog(t, ta, 0.3) });
        tx(ctx, { x: 880, y, s: 1 }, () => {
          rrect(ctx, 0, -40, 880, 80, 20, { fill: P.white, lw: 5 });
          if (bp > 0) rrect(ctx, 8, -32, (864 * days / 2) * bp, 64, 16, { fill: col, stroke: null, wob: 0.5 });
          rrect(ctx, 0, -40, 880, 80, 20, { fill: null, lw: 5 });
        });
        if (bp > 0.6) text(ctx, days === 2 ? '~2 DAYS' : '~1 DAY', 880 + (864 * days / 2) * bp + (days === 2 ? -150 : 90), y + 4, { size: 58, font: 'bold', color: days === 2 ? P.white : P.coralD, stroke: P.ink, sw: days === 2 ? 7 : 0 });
      });
      drawPerson(ctx, { x: 1680, y: 1060, s: 0.8, costume: 'greg', pose: t > tWalkSun ? 'facepalm' : 'hug', expr: 'worried', t, id: 1, sweat: 1 });
    },
  });

  // ---- oasis far away ----
  shots.push({
    a: tOasis, b: tTwoBad,
    draw(ctx, t) {
      const z = keys(t, [[tOasis, 1.6], [tKm, 0.55]]);
      withCam(ctx, { x: keys(t, [[tOasis, 700], [tKm, 1500]]), y: 560, z }, () => {
        tx(ctx, { x: 0 }, () => { for (let k = -1; k < 3; k++) tx(ctx, { x: k * 1900 }, () => desertBG(ctx, t, { noRocks: true, camX: 960 })); });
        drawPerson(ctx, { x: 700, y: GROUND, s: 1.1, costume: 'greg', pose: 'pointUp', expr: 'sad', t, id: 1, look: [0.8, 0] });
        oasis(ctx, 3300, GROUND + 40, 1.3, t);
        const dp = prog(t, tKm - 0.4, 1.2);
        line(ctx, [[820, GROUND + 60], [3100, GROUND + 60]], { lw: 10, dash: [30, 26], p: dp, color: P.redD });
      });
      if (t > tKm) text(ctx, 'HUNDREDS OF KILOMETERS', 960, 200, { size: 90, font: 'bold', color: P.white, stroke: P.ink, sw: 12, s: popScale(t, tKm, Infinity, 0.4) });
      if (t < tKm) tag(ctx, 'nearest oasis?', 1300, 300, { size: 60, s: popScale(t, tOasis + 0.3, tKm, 0.4) });
    },
  });
  shots.push(clockShot('desert', tClock, tTwoBad, 'ABOUT\n2 DAYS', '(less if he goes for a walk)', { size: 110 }));

  // ---- two days sounds bad / vacation ----
  shots.push({
    a: tTwoBad, b: tOcean,
    draw(ctx, t) {
      const vac = t > tVacation;
      withCam(ctx, { x: 960, y: 580, z: 1.2 }, () => {
        desertBG(ctx, t, {});
        if (!vac) {
          drawPerson(ctx, { x: 960, y: GROUND, s: 1.15, costume: 'greg', pose: 'hug', expr: 'sad', t, id: 1, sweat: 1 });
        } else {
          // beach umbrella and chair
          line(ctx, [[1150, GROUND + 20], [1100, 440]], { lw: 10, color: P.inkL });
          shape(ctx, [[820, 500], [1100, 380], [1380, 520], [1100, 470]], { fill: P.coral, lw: 5, smooth: true });
          shape(ctx, [[1000, 450], [1100, 380], [1200, 470], [1100, 460]], { fill: P.white, stroke: null, smooth: true });
          line(ctx, [[760, GROUND], [860, GROUND - 90], [1060, GROUND - 90], [1120, GROUND - 200]], { lw: 12, color: P.blueD, outline: 2 });
          drawPerson(ctx, { x: 960, y: GROUND - 40, s: 1.1, costume: 'greg', pose: { aL: [150, 60], aR: [40, 110] }, expr: 'proud', t, id: 1, rot: -0.35, noShadow: true, hat: sunglasses });
        }
      });
      if (vac) {
        // postcard frame
        ctx.save();
        ctx.strokeStyle = P.white;
        ctx.lineWidth = 40;
        ctx.strokeRect(20, 20, W - 40, H - 40);
        ctx.restore();
        text(ctx, 'Wish you were here!', 480, 170, { size: 90, font: 'marker', color: P.white, stroke: P.ink, sw: 10, r: -0.06, s: popScale(t, tVacation + 0.2, Infinity, 0.4) });
        stamp(ctx, 'VACATION?', 1500, 880, { p: prog(t, tVac2, 0.35), size: 90, color: P.blueD, r: 0.12 });
      }
      if (!vac) text(ctx, 'two days...', 960, 240, { size: 90, font: 'hand', color: P.white, stroke: P.ink, sw: 10, a: prog(t, tTwoBad, 0.3) });
      // iris out to black before the ocean
      irisWipe(ctx, prog(t, tOcean - 0.7, 0.6), 960, 540);
    },
  });
  return shots;
}
