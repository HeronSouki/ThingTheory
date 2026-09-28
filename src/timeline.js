// Assembles every scene's shots into one ordered list.
import * as intro from './scenes/intro.js';
import * as rules from './scenes/rules.js';
import * as forest from './scenes/forest.js';
import * as jungle from './scenes/jungle.js';
import * as desert from './scenes/desert.js';
import * as ocean from './scenes/ocean.js';
import * as arctic from './scenes/arctic.js';
import * as outro from './scenes/outro.js';

export function buildTimeline() {
  const shots = [];
  for (const m of [intro, rules, forest, jungle, desert, ocean, arctic, outro]) shots.push(...m.build());
  return shots;
}
