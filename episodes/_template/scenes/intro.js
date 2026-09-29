// 0:00 - 0:20  Example scene: copy this pattern for every scene of the episode.
//
// A scene returns shots { a, b, draw(ctx, t) }. Times come from the narration, never typed in:
// c('phrase') is when those words start, c.e('phrase') when they end. Until the voice-over is
// recorded and aligned, at() falls back to a draft time so the scene still renders.
import { cues, hasNarration, prog, popScale, E } from '#lib/engine/core.js';
import { P, text, tag } from '#lib/engine/draw.js';
import { drawPerson } from '#lib/characters/person.js';
import { notebookBG, labBG } from '#lib/world/backgrounds.js';
import { keys, withCam, speech } from '#lib/ui.js';
import { wipeShot } from '#lib/kit.js';
import { lightBulb, flask } from '#lib/props/index.js';

export function build() {
  const c = cues(0);
  const at = (phrase, draft) => (hasNarration() ? c(phrase) : draft);
  const shots = [];

  const tHello = at('meet greg', 0.5);
  const tIdea = at('had an idea', 4);
  const tLab = at('the lab', 9);
  const tEnd = at('see you next time', 18);

  // ---------- A: Greg has an idea ----------
  shots.push({
    a: 0, b: tLab,
    draw(ctx, t) {
      notebookBG(ctx, t);
      const z = keys(t, [[0, 1.1], [tIdea, 1.1], [tIdea + 0.6, 1.25]]);
      withCam(ctx, { x: 960, y: 600, z }, () => {
        const idea = t > tIdea;
        drawPerson(ctx, { x: 960, y: 900, s: 1.5, costume: 'greg', pose: idea ? 'pointUp' : 'wave', expr: idea ? 'happy' : 'smile', t, id: 1 });
        if (idea) lightBulb(ctx, 1080, 420, popScale(t, tIdea), true);
        text(ctx, 'GREG', 640, 380, { size: 120, font: 'marker', color: P.coral, stroke: P.ink, sw: 10, s: E.outBack(prog(t, tHello, 0.5)), r: -0.06 });
      });
    },
  });
  shots.push(wipeShot(tLab, P.blueD, 3));

  // ---------- B: the scientist explains ----------
  shots.push({
    a: tLab, b: tEnd + 2,
    draw(ctx, t) {
      labBG(ctx, t);
      drawPerson(ctx, { x: 700, y: 900, s: 1.45, costume: 'scientist', pose: 'present', expr: 'grin', t, id: 2 });
      flask(ctx, 1250, 900, 1.4, P.green, t, 1);
      speech(ctx, 'science!', 900, 380, prog(t, tLab + 0.8, 0.3));
      tag(ctx, 'THING THEORY', 1500, 200, { s: popScale(t, tEnd), size: 60, bg: P.mustard });
    },
  });
  return shots;
}
