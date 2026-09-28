// Pre-rendered paper grain + vignette overlay, applied on top of every frame.
import { makeCanvas } from './env.js';
import { W, H, rng } from './core.js';
import { baseT } from './draw.js';

let paper = null;
export function paperOverlay() {
  if (paper) return paper;
  const c = makeCanvas(W, H);
  const g = c.getContext('2d');
  const img = g.createImageData(W, H);
  const d = img.data;
  const r = rng(7);
  // coarse blotches (low-frequency) via a small random grid, bilinear sampled
  const GW = 48, GH = 27;
  const grid = new Float32Array((GW + 1) * (GH + 1)).map(() => r());
  const sample = (x, y) => {
    const gx = (x / W) * GW, gy = (y / H) * GH;
    const ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
    const a = grid[iy * (GW + 1) + ix], b = grid[iy * (GW + 1) + ix + 1];
    const c2 = grid[(iy + 1) * (GW + 1) + ix], d2 = grid[(iy + 1) * (GW + 1) + ix + 1];
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c2 * (1 - fx) + d2 * fx) * fy;
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const grain = r();
      const blot = sample(x, y);
      // multiply layer: near-white with faint warm grain
      const v = 255 - grain * 16 - blot * 12;
      d[i] = v;
      d[i + 1] = v - 3;
      d[i + 2] = v - 9;
      d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  // paper fibres
  g.globalAlpha = 0.05;
  g.strokeStyle = '#6b5a40';
  g.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    const x = r() * W, y = r() * H, a = r() * Math.PI * 2, l = 6 + r() * 22;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + 0.5) * l * 0.5, y + Math.sin(a + 0.5) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  g.globalAlpha = 1;
  // vignette
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
  vg.addColorStop(0, 'rgba(255,255,255,0)');
  vg.addColorStop(1, 'rgba(120,100,80,0.28)');
  g.fillStyle = vg;
  g.fillRect(0, 0, W, H);
  paper = c;
  return paper;
}

export function applyPaper(ctx) {
  ctx.save();
  baseT(ctx);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(paperOverlay(), 0, 0);
  ctx.restore();
}
