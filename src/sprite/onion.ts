import { createBuffer, getPixel, setPixel, type Rgba } from "../draw/buffer.ts";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function over(dst: Rgba, src: Rgba, opacity: number): Rgba {
  const sa = (src.a / 255) * clamp01(opacity);
  const da = dst.a / 255;
  const outA = sa + da * (1 - sa);
  if (outA <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: Math.round((src.r * sa + dst.r * da * (1 - sa)) / outA),
    g: Math.round((src.g * sa + dst.g * da * (1 - sa)) / outA),
    b: Math.round((src.b * sa + dst.b * da * (1 - sa)) / outA),
    a: Math.round(outA * 255),
  };
}

/**
 * Previous frame, then the next frame when asked, then the current frame on top.
 * Onion layers use `opacity`. Current pixels use their own alpha, so transparent
 * cells of the frame being edited show the onion skin underneath.
 */
export function compositeOnion(
  size: number,
  current: Uint8ClampedArray,
  previous: Uint8ClampedArray | null,
  next: Uint8ClampedArray | null,
  opacity: number,
  showNext: boolean,
): Uint8ClampedArray {
  const out = createBuffer(size);
  const count = size * size;
  for (let i = 0; i < count; i += 1) {
    const x = i % size;
    const y = (i - x) / size;
    let pixel: Rgba = { r: 0, g: 0, b: 0, a: 0 };
    if (previous) pixel = over(pixel, getPixel(size, previous, x, y), opacity);
    if (showNext && next) pixel = over(pixel, getPixel(size, next, x, y), opacity);
    pixel = over(pixel, getPixel(size, current, x, y), 1);
    setPixel(size, out, x, y, pixel);
  }
  return out;
}
