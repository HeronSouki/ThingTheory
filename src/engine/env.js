// Canvas factory injected by the host (Node renderer or browser preview).
let factory = null;
export function setCanvasFactory(f) {
  factory = f;
}
export function makeCanvas(w, h) {
  if (!factory) throw new Error('canvas factory not set');
  return factory(w, h);
}
