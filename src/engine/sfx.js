// Sound-effect event registry. Drawing helpers call sfx(type, key) whenever an element is
// visible; the earliest time each (shot, type, key) is seen becomes a sound cue.
const events = new Map();
let shotIdx = -1;
let enabled = true;
let T = 0;

export function setSfxTime(t) {
  T = t;
}
export function setShot(i) {
  shotIdx = i;
}
export function setSfxEnabled(v) {
  enabled = v;
}
export function sfx(type, key = '', vol = 1) {
  if (!enabled || shotIdx < 0) return;
  const k = `${shotIdx}|${type}|${key}`;
  const e = events.get(k);
  if (!e || T < e.t) events.set(k, { t: T, type, vol });
}
export function sfxEvents() {
  return [...events.entries()].map(([k, e]) => ({ key: k, ...e }));
}
