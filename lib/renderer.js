// Frame renderer: draws an episode at time t (seconds) onto a 1920x1080 canvas context.
import { setFrame, baseT, fillScreen, P } from './engine/draw.js';
import { applyPaper } from './engine/paper.js';
import { setShot } from './engine/sfx.js';

// build() returns the episode's ordered list of shots: { a, b, draw(ctx, t) } (seconds).
// Shots active at t are drawn in list order, so later shots layer on top.
export function createRenderer(build) {
  let TL = null;
  const timeline = () => TL || (TL = build());

  function renderFrame(ctx, t) {
    const tl = timeline();
    setFrame(t);
    baseT(ctx);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    fillScreen(ctx, P.paper);
    for (let i = 0; i < tl.length; i++) {
      const shot = tl[i];
      if (t >= shot.a && t < shot.b) {
        setShot(i);
        ctx.save();
        shot.draw(ctx, t);
        ctx.restore();
      }
    }
    setShot(-1);
    applyPaper(ctx);
  }

  return { timeline, renderFrame };
}
