// Episode NNN thumbnails. npm run thumbnails -- --ep NNN -> out/<episode>/thumbnails/
// Rules that work: one focal point, a big readable face with a strong emotion, at most three
// words, saturated colour contrast, and a check at phone size (see the review sheet).
import { P, vgrad } from '#lib/engine/draw.js';
import { drawPerson } from '#lib/characters/person.js';
import { headline, vignette } from '#lib/thumbkit.js';

export const T = 12.3; // frozen animation time for line boil / idle poses

function thumb1(ctx) {
  vgrad(ctx, -10, 1090, [[0, '#6F9FD0'], [1, '#3F5F8E']]);
  drawPerson(ctx, { x: 620, y: 1500, s: 3.4, costume: 'greg', pose: 'panic', expr: 'shocked', t: T, id: 1, noShadow: true, noBlink: true });
  vignette(ctx, 0.45);
  headline(ctx, 'THREE WORDS', 1340, 300, 170, P.mustardL, { r: 0.04 });
}

export const thumbnails = [
  { name: 'thumb_1_draft', label: '1. DRAFT', draw: thumb1 },
];
