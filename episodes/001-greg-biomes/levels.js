// Episode 001 format: the five biome "levels", their title cards and survival clocks.
import { tx } from '#lib/engine/draw.js';
import { drawPerson } from '#lib/characters/person.js';
import { forestBG, jungleBG, desertBG, oceanBG, arcticBG, waterFront } from '#lib/world/backgrounds.js';
import { levelCard, survivalClock } from '#lib/ui.js';

export const LEVELS = {
  forest: { num: 1, name: 'THE FOREST', sub: 'a.k.a. the tutorial level', c1: '#8DB580', c2: '#5E8A5E', skulls: 1, clock: '#6FA062' },
  jungle: { num: 2, name: 'THE AMAZON', sub: 'rainforest', c1: '#6FA37A', c2: '#3F6F55', skulls: 2, clock: '#4F8F63' },
  desert: { num: 3, name: 'THE SAHARA', sub: 'desert', c1: '#EDBE6A', c2: '#D08A4C', skulls: 3, clock: '#D5A143' },
  ocean: { num: 4, name: 'THE PACIFIC', sub: 'middle of the ocean', c1: '#6F9FD0', c2: '#3F5F8E', skulls: 4, clock: '#5F83B3' },
  arctic: { num: 5, name: 'NORTHERN\nCANADA', sub: 'in January', c1: '#9DB7D6', c2: '#6D7FA8', skulls: 5, clock: '#6F86B0', nameSize: 130 },
};

function iconScene(kind) {
  return (ctx, t) => {
    tx(ctx, { s: 0.3, x: -288, y: -190 }, () => {
      if (kind === 'forest') forestBG(ctx, t);
      if (kind === 'jungle') jungleBG(ctx, t, { rain: 0.6 });
      if (kind === 'desert') desertBG(ctx, t);
      if (kind === 'ocean') oceanBG(ctx, t, { horizon: 480 });
      if (kind === 'arctic') arcticBG(ctx, t, { storm: 1 });
      if (kind === 'ocean') {
        drawPerson(ctx, { x: 960, y: 820, s: 1.2, costume: 'greg', pose: 'tread', expr: 'worried', t, id: 5, noShadow: true });
        waterFront(ctx, t, 700);
      } else {
        drawPerson(ctx, { x: 960, y: 900, s: 1.5, costume: 'greg', pose: kind === 'forest' ? 'thumbs' : kind === 'arctic' ? 'hug' : 'stand', expr: kind === 'forest' ? 'smile' : kind === 'arctic' ? 'cold' : kind === 'desert' ? 'hot' : 'worried', t, id: 5, shiver: kind === 'arctic' ? 1 : 0, sweat: kind === 'desert' || kind === 'jungle' ? 1 : 0, tint: kind === 'arctic' ? { c: '#9DB8E0', k: 0.3 } : null });
      }
    });
  };
}

export function levelShot(kind, a, b) {
  const L = LEVELS[kind];
  return {
    a, b,
    draw(ctx, t) {
      levelCard(ctx, t, a, b, { ...L, icon: iconScene(kind) });
    },
  };
}

export function clockShot(kind, a, b, value, sub, opt = {}) {
  const L = LEVELS[kind];
  return { a, b, draw(ctx, t) { survivalClock(ctx, t, a, b, { value, sub, color: L.clock, ...opt }); } };
}

