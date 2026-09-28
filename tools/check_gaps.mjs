// Reports time ranges where no (non-transition) shot is active, i.e. blank frames.
import { setupHost } from '../render/host.js';
import { getTimeline, END_TIME } from '../src/main.js';
setupHost();
const tl = getTimeline();
let gapStart = null;
for (let f = 0; f <= Math.ceil(END_TIME * 30); f++) {
  const t = f / 30;
  const active = tl.filter((s) => t >= s.a && t < s.b && (s.b - s.a) > 0.75);
  if (active.length === 0 && gapStart === null) gapStart = t;
  if (active.length > 0 && gapStart !== null) { console.log(`gap ${gapStart.toFixed(2)} - ${t.toFixed(2)}`); gapStart = null; }
  if (active.length > 1) {
    const names = active.map((s) => `${s.a.toFixed(2)}-${s.b.toFixed(2)}`).join(' | ');
    if (f % 1 === 0) console.log(`overlap @${t.toFixed(2)}: ${names}`);
  }
}
if (gapStart !== null) console.log(`gap ${gapStart.toFixed(2)} - end`);
console.log('shots:', tl.length);
