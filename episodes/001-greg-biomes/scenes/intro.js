// 0:00 - 0:34  Meet Greg, the premise, five places, title.
import { cues, clamp, popScale, W, H, E, prog, lerp, wiggle, TAU } from '#lib/engine/core.js';
import { tx, P, ellipse, text, arrow, circle, crossOut, fillScreen, tag, glow, vgrad } from '#lib/engine/draw.js';
import { sfx } from '#lib/engine/sfx.js';
import { drawPerson } from '#lib/characters/person.js';
import { notebookBG, forestBG, arcticBG, oceanBG, waterFront } from '#lib/world/backgrounds.js';
import { pin, drawWorld, proj, PLACES } from '#lib/world/worldmap.js';
import { keys, withCam, burstLines, panel, countdown, stopwatch, paintWipe } from '#lib/ui.js';
import { knife, signpost, moth, remote, lighter, phone, callout, priceTag, biomeIcon, campfire, bigHand, infinity } from '#lib/props/index.js';

export function build() {
  const c = cues(0);
  const shots = [];

  // ---------- A: This is Greg ----------
  const tFew = c('in a few seconds');
  const tDrop = c('drop greg');
  const tNowhere = c('middle of nowhere');
  const tNothing = c('with nothing');
  const tKnife = c('no knife');
  shots.push({
    a: 0, b: tKnife,
    draw(ctx, t) {
      notebookBG(ctx, t);
      const camZ = keys(t, [[0, 1.12], [tFew, 1.12], [tFew + 0.6, 1.0], [tNothing, 1.0], [tNothing + 0.5, 1.12]]);
      const camX = keys(t, [[0, 960], [tFew, 960], [tFew + 0.6, 1080], [tNothing, 1080], [tNothing + 0.5, 900]]);
      withCam(ctx, { x: camX, y: 560, z: camZ }, () => {
        // Greg is on screen from the very first frame (it doubles as the thumbnail) and does a little hop
        if (t >= 0.25) sfx('pop', 'greg-hop');
        if (t >= tFew - 0.2) sfx('swoosh', 'scientist-in');
        if (t >= tDrop) sfx('stamp', 'drop-button', 0.6);
        const hop = Math.sin(clamp((t - 0.05) / 0.4) * Math.PI);
        const gy = 880 - hop * 60;
        const sq = t < 0.45 ? 1 + hop * 0.06 : 1 - Math.sin(clamp((t - 0.45) / 0.3) * Math.PI) * 0.12;
        const worried = t > tDrop + 0.2 && t < tNothing;
        const pose = t > tNothing ? 'shrug' : t < 1.1 ? 'wave' : worried ? 'hug' : 'stand';
        const expr = t < tFew ? 'happy' : worried ? 'nervous' : t > tNothing ? 'deadpan' : 'smile';
        if (t > tNowhere - 0.1) signpost(ctx, 420, 880, popScale(t, tNowhere - 0.1, Infinity, 0.5), 'NOWHERE');
        drawPerson(ctx, { x: 820, y: gy, s: 1.45, costume: 'greg', pose, expr, t, id: 1, squash: sq, look: worried ? [0.6, 0] : [0, 0], sweat: worried ? 1 : 0 });
        if (t > tNothing) {
          const pp = popScale(t, tNothing, Infinity, 0.3);
          for (const sd of [-1, 1]) ellipse(ctx, 820 + sd * 72, 880 - 150, 20 * pp, 14 * pp, { fill: P.white, lw: 4 });
          const mt = t - tNothing;
          moth(ctx, 820 + 72 + mt * 180, 880 - 160 - mt * 220 + Math.sin(mt * 9) * 20, 1.2, t);
        }
        // label
        const lp = prog(t, -0.5, 0.5);
        if (t < tFew + 0.4) {
          const a = 1 - prog(t, tFew, 0.4);
          tx(ctx, { a }, () => {
            text(ctx, 'GREG', 1240, 360, { size: 140, font: 'marker', color: P.coral, stroke: P.ink, sw: 12, s: E.outBack(lp), r: -0.06 });
            arrow(ctx, 1150, 420, 930, 480, { p: prog(t, -0.4, 0.4), bend: -0.3, lw: 8 });
          });
        }
        // scientist slides in with the DROP button
        if (t > tFew - 0.2) {
          const sp = prog(t, tFew - 0.2, 0.6, E.outBack);
          const pressed = t > tDrop && t < tDrop + 0.3;
          drawPerson(ctx, {
            x: lerp(2200, 1560, sp), y: 880, s: 1.45, costume: 'scientist', pose: { aR: [60, 40], aL: [12, -8] }, expr: 'grin', t, id: 2, look: [-0.5, 0],
            holdR: (g, hx, hy) => remote(g, hx, hy - 20, 1, pressed),
          });
          if (t > tDrop && t < tDrop + 0.6) burstLines(ctx, 1640, 520, 60, 160, (t - tDrop) / 0.6, P.red);
        }
      });
    },
  });

  // ---------- B: no knife, no lighter, no phone / t-shirt, jeans, sneakers ----------
  const tLighter = c('no lighter'), tPhone = c('no phone');
  const tShirt = c('just a t shirt'), tJeans = c('jeans', tShirt), tSneak = c('sneakers', tShirt), tSale = c('on sale', tShirt);
  const tThen = c('then we\'ll do it again');
  shots.push({
    a: tKnife, b: tThen,
    draw(ctx, t) {
      notebookBG(ctx, t);
      const z = keys(t, [[tKnife, 1.0], [tShirt, 1.0], [tShirt + 0.7, 1.55]]);
      const cx = keys(t, [[tKnife, 960], [tShirt, 960], [tShirt + 0.7, 700]]);
      const cy = keys(t, [[tKnife, 560], [tShirt, 560], [tShirt + 0.7, 620]]);
      withCam(ctx, { x: cx, y: cy, z }, () => {
        const gx = 520, gy = 900, s = 1.45;
        drawPerson(ctx, { x: gx, y: gy, s, costume: { ...{}, ...GREG_TAG }, pose: t > tShirt ? 'presentBoth' : 'hips', expr: t > tSale ? 'proud' : t > tShirt ? 'smile' : 'deadpan', t, id: 1, look: t < tShirt ? [0.6, 0] : [0, 0] });
        // items
        const items = [[tKnife, (g, x, y) => knife(g, x, y, 1.1, -0.3)], [tLighter, (g, x, y) => lighter(g, x, y, 1.1, 0.15)], [tPhone, (g, x, y) => phone(g, x, y, 1.05, 0.12)]];
        items.forEach(([ta, fn], i) => {
          const x = 1000 + i * 330, y = 560;
          const s2 = popScale(t, ta, tShirt, 0.35, 0.25);
          if (s2 <= 0) return;
          tx(ctx, { x, y, s: s2 }, () => {
            circle(ctx, 0, 0, 140, { fill: P.white, lw: 5 });
            fn(ctx, 0, 0);
            crossOut(ctx, 0, 0, 110, prog(t, ta + 0.35, 0.3));
          });
          text(ctx, ['KNIFE', 'LIGHTER', 'PHONE'][i], x, y + 200, { size: 54, font: 'bold', color: P.ink, s: s2 });
        });
        // clothing callouts
        const cp = (ta) => prog(t, ta, 0.5);
        callout(ctx, 'T-SHIRT', gx + 330, gy - 330, gx + 60, gy - 210, cp(tShirt + 0.1));
        callout(ctx, 'JEANS', gx + 360, gy - 150, gx + 45, gy - 90, cp(tJeans));
        callout(ctx, 'SNEAKERS', gx - 330, gy - 60, gx - 45, gy - 5, cp(tSneak), { bend: -0.2 });
        if (t > tSale) {
          const ps = popScale(t, tSale, Infinity, 0.4);
          priceTag(ctx, gx - 330, gy + 50, ps, 'SALE!', -0.15 + wiggle(t, 2, 0.05));
        }
      });
    },
  });

  // ---------- C: five places on earth ----------
  const tFive = c('five times'), tFamous = c('five of the most famous');
  const tForever = c('in one of them');
  const M = { x: 60, y: 110, w: 1800, h: 900 };
  const order = ['forest', 'jungle', 'desert', 'ocean', 'arctic'];
  const pinT = (i) => tFive + 0.25 + i * 0.55;
  function mapScene(ctx, t, dim = 0) {
    fillScreen(ctx, '#D6E7EE');
    drawWorld(ctx, M, { sea: '#D6E7EE', land: '#EBDDBE', lw: 3, wob: 0.4, lake: '#D6E7EE' });
    // lat lines
    ctx.save();
    ctx.strokeStyle = 'rgba(95,131,179,0.18)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    for (let la = -40; la <= 80; la += 20) {
      const [, y] = proj(0, la, M);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
    order.forEach((k, i) => {
      const [x, y] = proj(...PLACES[k], M);
      const ta = pinT(i);
      if (t < ta) return;
      const drop = prog(t, ta, 0.35, E.outBounce);
      const py = lerp(y - 300, y, drop);
      pin(ctx, x, py, [P.sageD, P.greenD, P.mustardD, P.blueD, P.plum][i], 1.2);
      const is = popScale(t, ta + 0.3, Infinity, 0.35);
      tx(ctx, { x: x, y: py - 150, s: is * 0.9 }, () => {
        circle(ctx, 0, 0, 62, { fill: P.white, lw: 5 });
        biomeIcon(ctx, k, 0, 4, 0.8, t);
      });
    });
    if (dim > 0) {
      ctx.fillStyle = `rgba(40,50,55,${0.45 * dim})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
  shots.push({
    a: tThen, b: tForever,
    draw(ctx, t) {
      const z = keys(t, [[tThen, 1.25], [tThen + 1.2, 1.0]]);
      withCam(ctx, { x: 960, y: 540, z }, () => mapScene(ctx, t));
      if (t > tFive) {
        const s = popScale(t, tFive, Infinity, 0.4);
        tx(ctx, { x: 1680, y: 930, s, r: -0.1 }, () => {
          circle(ctx, 0, 0, 110, { fill: P.coral, lw: 7 });
          text(ctx, '×5', 0, 8, { size: 120, font: 'bold', color: P.white, stroke: P.ink, sw: 10 });
        });
      }
      if (t > tFamous + 0.4) {
        tag(ctx, '5 of the most famous places on Earth', 960, 90, { size: 56, s: popScale(t, tFamous + 0.4, Infinity, 0.4) });
      }
    },
  });

  // ---------- D: three postcards ----------
  const tFingers = c('in another'), tCalm = c('and one of them looks calm');
  const tPeace = c('peaceful'), tBeaut = c('beautiful');
  const tNothingDo = c('and it\'s the one place'), tAbs = c('absolutely nothing');
  const tLets = c('let\'s find out');
  const cards = [
    { k: 'forest', at: tForever, x: 380, r: -0.05 },
    { k: 'arctic', at: tFingers, x: 960, r: 0.03 },
    { k: 'ocean', at: tCalm, x: 1540, r: -0.03 },
  ];
  function cardContent(k, ctx, t, w, h) {
    tx(ctx, { s: 0.36, x: -W * 0.18, y: -H * 0.2 }, () => {
      if (k === 'forest') {
        forestBG(ctx, t, { noTrees: true });
        campfire(ctx, 1150, 860, 0.9, t);
        drawPerson(ctx, { x: 820, y: 880, s: 1.2, costume: 'greg', pose: 'cheer', expr: 'happy', t, id: 3 });
      } else if (k === 'arctic') {
        arcticBG(ctx, t, { storm: 1 });
      } else {
        oceanBG(ctx, t, { horizon: 560 });
        tx(ctx, { a: 0.9 }, () => glow(ctx, 960, 560, 600, '#FFD9A8', 0.6));
      }
    });
  }
  shots.push({
    a: tForever, b: tLets,
    draw(ctx, t) {
      // background: dimmed map
      const zoomIn = prog(t, tNothingDo - 0.1, 0.8, E.inOutCubic);
      mapScene(ctx, t, 1);
      cards.forEach((cd, i) => {
        const p = prog(t, cd.at, 0.5);
        if (p <= 0) return;
        const focus = i === 2 ? zoomIn : 0;
        const x = lerp(cd.x, 960, focus), y = lerp(560, 540, focus);
        const sc = lerp(1, 4.4, focus);
        const cap = { forest: 'live forever?', arctic: 'fingers: < 10 min', ocean: 'calm. peaceful. beautiful.' }[cd.k];
        const hl = i === 0 ? t < tFingers : i === 1 ? t >= tFingers && t < tCalm : t >= tCalm;
        tx(ctx, { x, y, s: sc * (hl ? 1.06 : 0.94), r: cd.r * (1 - focus) }, () => {
          panel(ctx, 0, 0, 540, 440, p, (g, w, h) => {
            cardContent(cd.k, g, t, w, h);
            if (cd.k === 'arctic') {
              const tint = clamp((t - tFingers) / 3);
              bigHand(g, 0, 150, 0.9, lerpColor(P.skin, '#B9C9DE', tint), lerpColor(P.skinD, '#97A9C4', tint), { fingerC: lerpColor(P.skin, '#E9EEF4', tint), frost: tint > 0.5 });
              countdown(g, 110, -110, 600 - (t - tFingers) * 60, 0.55);
            }
            if (cd.k === 'ocean' && t > tAbs - 0.3) {
              const gp = popScale(t, tAbs - 0.3, Infinity, 0.4);
              drawPerson(g, { x: 0, y: 70, s: 0.18 * gp, costume: 'greg', pose: 'tread', expr: 'worried', t, id: 4, noShadow: true });
              waterFront(g, t, 42, -300, 300, { color: 'rgba(78,134,181,0.9)' });
            }
          }, { caption: focus > 0.3 ? null : cap, r: 0 });
          if (i === 0 && t > tForever + 0.8) infinity(ctx, 190, -170, popScale(t, tForever + 0.8, Infinity, 0.4) * 1.1, P.greenD);
        });
      });
      if (t > tCalm + 0.5 && zoomIn < 0.2) {
        const words = [['calm', tCalm + 0.5], ['peaceful', tPeace], ['beautiful', tBeaut]];
        words.forEach(([w, ta], i) => {
          const s = popScale(t, ta, Infinity, 0.35);
          tag(ctx, w, 1260 + i * 170 - 200, 860 + (i % 2) * 40, { size: 50, s, r: (i - 1) * 0.08, bg: P.blueL });
        });
      }
      if (zoomIn > 0.95) {
        const s = popScale(t, tAbs + 0.2, Infinity, 0.4);
        text(ctx, 'NOTHING', 960, 300, { size: 170, font: 'bold', color: P.white, stroke: P.ink, sw: 14, s, r: -0.03 });
        text(ctx, 'he can do.', 960, 420, { size: 70, font: 'hand', color: P.white, stroke: P.ink, sw: 9, a: prog(t, tAbs + 0.6, 0.4) });
      }
    },
  });

  // ---------- E: title ----------
  const tRules = c('quick rules');
  shots.push({
    a: tLets, b: tRules,
    draw(ctx, t) {
      const lt = t - tLets;
      vgrad(ctx, -50, H + 50, [[0, '#F0C987'], [1, '#E9A07E']]);
      // sunburst
      ctx.save();
      ctx.translate(960, 600);
      ctx.rotate(t * 0.15);
      for (let i = 0; i < 18; i++) {
        ctx.rotate(TAU / 18);
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.0)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1600, -140);
        ctx.lineTo(1600, 140);
        ctx.fill();
      }
      ctx.restore();
      const gp = prog(lt, 0, 0.5, E.outBack);
      drawPerson(ctx, { x: 960, y: 1060 + (1 - gp) * 400, s: 1.35, costume: 'greg', pose: 'hug', expr: 'nervous', t, id: 1, sweat: 1, look: [0, -0.6] });
      text(ctx, 'HOW LONG WOULD', 960, 170, { size: 90, font: 'bold', color: P.white, stroke: P.ink, sw: 12, s: prog(lt, 0.05, 0.4, E.outBack) });
      text(ctx, 'GREG LAST?', 960, 330, { size: 190, font: 'marker', color: P.coral, stroke: P.ink, sw: 16, shadow: true, s: prog(lt, 0.25, 0.5, E.outBackBig), r: -0.03 });
      tx(ctx, { x: 1560, y: 700, s: popScale(lt, 0.6, Infinity, 0.4), r: 0.1 }, () => stopwatch(ctx, 0, 0, 120, t, lt * 1.5, P.sage));
      tag(ctx, 'a Thing Theory experiment', 380, 1010, { size: 44, s: popScale(lt, 0.8, Infinity, 0.4), bg: P.white, r: -0.03 });
    },
  });
  // quick transition into the rules
  shots.push({ a: tRules - 0.35, b: tRules + 0.35, draw(ctx, t) { paintWipe(ctx, (t - (tRules - 0.35)) / 0.35, P.ink, 3); } });
  return shots;
}

const GREG_TAG = { ...{}, hair: { style: 'greg', color: '#5A4033', light: '#77553F' }, shirt: { color: '#E57F6E', dark: '#C9624F', sleeve: 'short' }, pants: { color: '#5F82B4', dark: '#46679A' }, shoes: { style: 'sneaker', color: '#FBF8F1', accent: '#E57F6E' }, tag: true };

function lerpColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
