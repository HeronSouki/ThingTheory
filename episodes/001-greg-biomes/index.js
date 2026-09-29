// Episode 001: How long would Greg last? Five biomes, zero supplies.
// Scenes run in this order; each exports build() -> shots timed from narration cues.
import * as intro from './scenes/intro.js';
import * as rules from './scenes/rules.js';
import * as forest from './scenes/forest.js';
import * as jungle from './scenes/jungle.js';
import * as desert from './scenes/desert.js';
import * as ocean from './scenes/ocean.js';
import * as arctic from './scenes/arctic.js';
import * as outro from './scenes/outro.js';

export const scenes = [intro, rules, forest, jungle, desert, ocean, arctic, outro];

export function build() {
  const shots = [];
  for (const m of scenes) shots.push(...m.build());
  return shots;
}
