// Visual catalog of the shared library, to browse before writing a new scene.
//   npm run catalog -> out/catalog/props.png       every prop in lib/props, labelled with its name
//                      out/catalog/characters.png  every costume, pose and expression of the rig
import fs from 'fs';
import path from 'path';
import { setupHost, createCanvas, ROOT } from '../render/host.js';
import { setFrame, P, text, fillScreen } from '#lib/engine/draw.js';
import { drawPerson, COSTUMES, POSES, EXPR } from '#lib/characters/person.js';
import * as props from '#lib/props/index.js';

setupHost();
const OUT = path.join(ROOT, 'out', 'catalog');
fs.mkdirSync(OUT, { recursive: true });
const T = 3.3;
setFrame(T);

// props whose arguments differ from the usual (ctx, x, y, s, t)
const ARGS = {
  bug: (f, c) => f(c, 'beetle', 0, 0, 1, T),
  biomeIcon: (f, c) => f(c, 'jungle', 0, 0, 1, T),
  callout: (f, c) => f(c, 'callout', -160, -90, 40, 30, 1),
  stick: (f, c) => f(c, 0, 0, 260),
  tv: (f, c) => f(c, 0, 0, 1, T, (g) => { g.fillStyle = P.blue; g.fillRect(-214, -139, 428, 258); }, 0.4),
  noBadge: (f, c) => f(c, 0, 0, 90, 1),
  bigHand: (f, c) => f(c, 0, 0, 1, P.skin, P.skinD),
  bottle: (f, c) => f(c, 0, 0, 1, 0.6),
  manual: (f, c) => f(c, 0, 0, 1, 0),
  signpost: (f, c) => f(c, 0, 0, 1, 'NOWHERE'),
  clipboard: (f, c) => f(c, 0, 0, 1, 0, ['air', 'shelter', 'water', 'food'], 1),
  bellCurve: (f, c) => f(c, 0, 0, 400, 240, 1),
  chalkboard: (f, c) => f(c, 0, 0, 500, 320, () => {}),
  creditCard: (f, c) => f(c, 0, 0, 1, P.blue, 'CARD'),
  lightBulb: (f, c) => f(c, 0, 0, 1, true),
  cup: (f, c) => f(c, 0, 0, 1, 0.6, '1 L'),
  jeans: (f, c) => f(c, 0, 0, 1, 0, 'flat', T),
  snowflake: (f, c) => f(c, 0, 0, 90),
  stream: (f, c) => f(c, T, 0, 120),
  cattailPlant: (f, c) => f(c, 0, 0, T),
  tallTree: (f, c) => f(c, 0, 0, 600, T),
  flask: (f, c) => f(c, 0, 0, 1, P.green, T),
  beaker: (f, c) => f(c, 0, 0, 1, P.blue),
  critter: (f, c) => f(c, 0, 0, 1, T, P.sage),
  atom: (f, c) => f(c, 0, 0, 1, P.blueD),
  bulbDoodle: (f, c) => f(c, 0, 0, 1, P.mustardD),
  planet: (f, c) => f(c, 0, 0, 1, P.coral),
  qmark: (f, c) => f(c, 0, 0, 1, P.plum),
};

// Draws fn onto a scratch canvas and returns the tight crop of what it drew.
function capture(draw) {
  const S = 1600;
  const c = createCanvas(S, S);
  const g = c.getContext('2d');
  g.translate(S / 2, S * 0.62);
  draw(g);
  const d = c.getContext('2d').getImageData(0, 0, S, S).data;
  let x0 = S, y0 = S, x1 = -1, y1 = -1;
  for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) {
    if (d[(y * S + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return x1 < 0 ? null : { c, x: x0, y: y0, w: x1 - x0 + 2, h: y1 - y0 + 2 };
}

function sheet(items, cols, cw, ch, file, title) {
  const rows = Math.ceil(items.length / cols);
  const out = createCanvas(cols * cw, rows * ch + 110);
  const g = out.getContext('2d');
  fillScreen(g, P.paper);
  g.fillStyle = P.paper;
  g.fillRect(0, 0, out.width, out.height);
  text(g, title, out.width / 2, 55, { size: 60, font: 'bold', color: P.ink, wob: 0 });
  items.forEach(({ name, draw }, i) => {
    const cx = (i % cols) * cw, cy = 110 + Math.floor(i / cols) * ch;
    let cap = null;
    try { setFrame(T); cap = capture(draw); } catch (e) { cap = null; console.warn(`${name}: ${e.message}`); }
    if (cap) {
      const k = Math.min((cw - 30) / cap.w, (ch - 70) / cap.h, 1.2);
      g.drawImage(cap.c, cap.x, cap.y, cap.w, cap.h, cx + (cw - cap.w * k) / 2, cy + 10 + (ch - 70 - cap.h * k) / 2, cap.w * k, cap.h * k);
    }
    text(g, name, cx + cw / 2, cy + ch - 28, { size: 30, font: 'round', color: cap ? P.ink : P.red, wob: 0 });
  });
  fs.writeFileSync(path.join(OUT, file), out.toBuffer('image/png'));
  console.log(`${file}: ${items.length} items`);
}

// default call: (ctx, 0, 0, 1) plus the animation time when the 5th parameter is t
const takesT = (fn) => /^\s*t\b/.test((fn.toString().match(/\(([^)]*)\)/)[1].split(',')[4] || ''));
const propItems = Object.entries(props).map(([name, fn]) => ({
  name,
  draw: (g) => (ARGS[name] ? ARGS[name](fn, g) : takesT(fn) ? fn(g, 0, 0, 1, T) : fn(g, 0, 0, 1)),
}));
sheet(propItems, 10, 300, 280, 'props.png', 'lib/props');

const person = (o) => (g) => drawPerson(g, { x: 0, y: 0, s: 1, t: T, id: 1, noBlink: true, ...o });
const charItems = [
  ...Object.keys(COSTUMES).map((k) => ({ name: k, draw: person({ costume: k }) })),
  ...Object.keys(POSES).map((k) => ({ name: `pose: ${k}`, draw: person({ costume: 'greg', pose: k }) })),
  ...Object.keys(EXPR).map((k) => ({ name: `expr: ${k}`, draw: (g) => drawPerson(g, { x: 0, y: 700, s: 2.6, costume: 'greg', expr: k, t: T, id: 1, noBlink: true, noShadow: true }) })),
];
sheet(charItems, 10, 300, 380, 'characters.png', 'lib/characters/person.js');
