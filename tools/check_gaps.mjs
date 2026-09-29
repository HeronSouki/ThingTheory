// Sanity check for an episode's timeline: reports blank stretches, i.e. time ranges where no
// real shot (longer than a 0.75 s transition) is active. Exits 1 if there are any.
//   node tools/check_gaps.mjs [--ep 001] [--overlaps]   (--overlaps also lists layered shots)
import { loadEpisode, parseArgs } from '../render/host.js';

const { flags } = parseArgs();
const { timeline, end, id } = await loadEpisode(flags.ep);
const tl = timeline();
const gaps = [];
let gapStart = null, lastOverlap = '';
for (let f = 0; f <= Math.ceil(end * 30); f++) {
  const t = f / 30;
  const active = tl.filter((s) => t >= s.a && t < s.b && (s.b - s.a) > 0.75);
  if (active.length === 0 && gapStart === null) gapStart = t;
  if (active.length > 0 && gapStart !== null) { gaps.push([gapStart, t]); gapStart = null; }
  if (flags.overlaps && active.length > 1) {
    const names = active.map((s) => `${s.a.toFixed(2)}-${s.b.toFixed(2)}`).join(' | ');
    if (names !== lastOverlap) console.log(`overlap from ${t.toFixed(2)}: ${names}`);
    lastOverlap = names;
  }
}
if (gapStart !== null && gapStart < end - 1 / 30) gaps.push([gapStart, end]);
for (const [a, b] of gaps) console.log(`gap ${a.toFixed(2)} - ${b.toFixed(2)}`);
console.log(`${id}: ${tl.length} shots, ${gaps.length ? gaps.length + ' blank stretch(es)' : 'no blank frames'}`);
process.exitCode = gaps.length ? 1 : 0;
