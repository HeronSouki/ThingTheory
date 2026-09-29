// Episode NNN: <one-line premise>.
// Scenes run in this order; each exports build() -> shots timed from narration cues.
import * as intro from './scenes/intro.js';

export const scenes = [intro];

export function build() {
  const shots = [];
  for (const m of scenes) shots.push(...m.build());
  return shots;
}
