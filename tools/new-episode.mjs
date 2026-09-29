// Scaffolds a new episode from episodes/_template.
//   npm run new-episode -- <slug> ["Working Title"]
//   e.g. npm run new-episode -- deep-ocean "What If You Fell Into The Mariana Trench?"
// Creates episodes/NNN-<slug>/ with the next free number.
import fs from 'fs';
import path from 'path';
import { EPISODES, listEpisodes } from '../render/host.js';

const [slugArg, title = 'Working Title'] = process.argv.slice(2);
if (!slugArg) {
  console.error('usage: npm run new-episode -- <slug> ["Working Title"]');
  process.exit(1);
}
const slug = slugArg.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const last = listEpisodes().map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
const num = String((last.length ? Math.max(...last) : 0) + 1).padStart(3, '0');
const id = `${num}-${slug}`;
const dir = path.join(EPISODES, id);
fs.cpSync(path.join(EPISODES, '_template'), dir, { recursive: true });

const meta = JSON.parse(fs.readFileSync(path.join(dir, 'episode.json'), 'utf8'));
fs.writeFileSync(path.join(dir, 'episode.json'), JSON.stringify({ ...meta, id, title }, null, 2) + '\n');
for (const f of ['index.js', 'thumbnails.js', 'PUBLISH.md']) {
  const p = path.join(dir, f);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('NNN', num).replace('Working Title', title));
}
console.log(`created episodes/${id}/

next:
  1. paste the script into   episodes/${id}/script.txt
  2. add the voice-over as   episodes/${id}/narration.mp3, then: npm run align -- --ep ${num}
  3. write scenes in         episodes/${id}/scenes/ and list them in index.js
  4. set "end" in episode.json to the narration length (seconds)
  5. npm run preview -- --ep ${num}`);
