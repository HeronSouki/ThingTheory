// Frame renderer: draws the whole video at time t (seconds) onto a 1920x1080 canvas context.
import { setFrame, fillScreen, P, baseT } from './engine/draw.js';
import { applyPaper } from './engine/paper.js';
import { buildTimeline } from './timeline.js';
import { setShot } from './engine/sfx.js';

let TL = null;
export const END_TIME = 596.5;

export function getTimeline() {
  if (!TL) TL = buildTimeline();
  return TL;
}

export function renderFrame(ctx, t) {
  const tl = getTimeline();
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
