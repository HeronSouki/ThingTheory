// Core math, easing, noise and timing helpers shared by every scene.
import { sfx } from './sfx.js';

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => clamp((v - a) / (b - a));
export const remap = (v, a, b, c, d) => lerp(c, d, invLerp(a, b, v));
export const smooth = (t) => t * t * (3 - 2 * t);
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

// ---- easing -------------------------------------------------------------
export const E = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuint: (t) => 1 - Math.pow(1 - t, 5),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outBackBig: (t) => {
    const c1 = 3.0, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  inBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  outElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
  outBounce: (x) => {
    const n1 = 7.5625, d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x;
    if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
    if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  },
};

// progress of an animation starting at t0 lasting d seconds, eased
export const prog = (t, t0, d = 0.4, ease = E.outCubic) => ease(clamp((t - t0) / d));

// visibility envelope: 0 before a, ramps in over fin, holds, ramps out over fout ending at b
export const vis = (t, a, b, fin = 0.25, fout = 0.25) => {
  if (t < a || t > b) return 0;
  const i = fin > 0 ? clamp((t - a) / fin) : 1;
  const o = fout > 0 ? clamp((b - t) / fout) : 1;
  return Math.min(i, o);
};

// pop-in scale with overshoot and pop-out shrink
export const popScale = (t, a, b = Infinity, din = 0.35, dout = 0.2) => {
  if (t < a) return 0;
  if (t > b) return 0;
  if (t < a + 0.5) sfx('pop', 'ps' + a.toFixed(3));
  let s = E.outBack(clamp((t - a) / din));
  if (b !== Infinity) s *= 1 - E.inBack(clamp((t - (b - dout)) / dout));
  return Math.max(0, s);
};

// ---- deterministic randomness --------------------------------------------
export function hash(n) {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}
export function hash2(a, b) {
  return hash(a * 12.9898 + b * 78.233);
}
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// smooth 1D value noise in [-1,1]
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const a = hash(i + seed * 1013), b = hash(i + 1 + seed * 1013);
  return (lerp(a, b, smooth(f)) - 0.5) * 2;
}
export const wiggle = (t, freq = 1, amp = 1, seed = 0) =>
  (noise1(t * freq, seed) * 0.7 + noise1(t * freq * 2.3, seed + 7) * 0.3) * amp;

// ---- colour ---------------------------------------------------------------
function hexToRgb(h) {
  if (h.startsWith('rgb')) {
    const m = h.match(/[\d.]+/g).map(Number);
    return [m[0], m[1], m[2]];
  }
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mixCache = new Map();
export function mix(a, b, t) {
  t = clamp(t);
  if (t <= 0) return a;
  if (t >= 1) return b;
  const key = a + b + Math.round(t * 100);
  let v = mixCache.get(key);
  if (v) return v;
  const A = hexToRgb(a), B = hexToRgb(b);
  const r = Math.round(lerp(A[0], B[0], t)), g = Math.round(lerp(A[1], B[1], t)), bl = Math.round(lerp(A[2], B[2], t));
  v = '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  mixCache.set(key, v);
  return v;
}
export function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ---- narration cues -------------------------------------------------------
// words: [{w, n, s, e}] from episodes/<ep>/words.json
let WORDS = [];
let ENV = [];
export function setNarration(words, env) {
  WORDS = words;
  ENV = env || [];
}
// false until the episode's narration has been aligned (tools/align.py)
export function hasNarration() {
  return WORDS.length > 0;
}
const norm = (s) =>
  s.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean);

// Find a phrase in the narration starting at/after time `after`. Returns {s, e}.
export function findPhrase(phrase, after = 0) {
  const q = norm(phrase);
  for (let i = 0; i < WORDS.length; i++) {
    if (WORDS[i].s < after - 0.05) continue;
    let ok = true;
    for (let j = 0; j < q.length; j++) {
      const w = WORDS[i + j];
      if (!w || w.n !== q[j]) { ok = false; break; }
    }
    if (ok) return { s: WORDS[i].s, e: WORDS[i + q.length - 1].e };
  }
  throw new Error(`cue not found: "${phrase}" after ${after}`);
}
// cue helper bound to a scene start: c('phrase') -> start time, c.e('phrase') -> end time
export function cues(after) {
  const c = (p, a = after) => findPhrase(p, a).s;
  c.e = (p, a = after) => findPhrase(p, a).e;
  return c;
}
export function loudness(t) {
  const i = Math.floor(t * FPS);
  return ENV[i] || 0;
}
