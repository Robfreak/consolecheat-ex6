import { createBuffer } from "./buffer.ts";

/** Nearest-neighbour upscale of a square RGBA buffer. Factor 1 returns a copy. Alpha is copied as-is. */
export function upscaleNearest(src: Uint8ClampedArray, size: number, factor: number): Uint8ClampedArray {
  if (!Number.isInteger(size) || size < 1) throw new Error("size");
  if (!Number.isInteger(factor) || factor < 1) throw new Error("factor");
  if (src.length < size * size * 4) throw new Error("buffer");
  const outW = size * factor;
  const out = new Uint8ClampedArray(outW * outW * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const si = (y * size + x) * 4;
      const r = src[si] ?? 0;
      const g = src[si + 1] ?? 0;
      const b = src[si + 2] ?? 0;
      const a = src[si + 3] ?? 0;
      for (let dy = 0; dy < factor; dy += 1) {
        const row = (y * factor + dy) * outW * 4;
        for (let dx = 0; dx < factor; dx += 1) {
          const di = row + (x * factor + dx) * 4;
          out[di] = r;
          out[di + 1] = g;
          out[di + 2] = b;
          out[di + 3] = a;
        }
      }
    }
  }
  return out;
}

/**
 * Downscale an RGBA image to a square with nearest-neighbour.
 * Each destination pixel samples the source pixel under its center.
 */
export function downscaleNearest(
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  dst: number,
): Uint8ClampedArray | null {
  if (!Number.isInteger(srcW) || !Number.isInteger(srcH) || srcW < 1 || srcH < 1) return null;
  if (!Number.isInteger(dst) || dst < 1) return null;
  if (src.length < srcW * srcH * 4) return null;
  const out = createBuffer(dst);
  for (let y = 0; y < dst; y += 1) {
    const sy = Math.min(srcH - 1, Math.floor(((y + 0.5) * srcH) / dst));
    for (let x = 0; x < dst; x += 1) {
      const sx = Math.min(srcW - 1, Math.floor(((x + 0.5) * srcW) / dst));
      const si = (sy * srcW + sx) * 4;
      const di = (y * dst + x) * 4;
      out[di] = src[si] ?? 0;
      out[di + 1] = src[si + 1] ?? 0;
      out[di + 2] = src[si + 2] ?? 0;
      out[di + 3] = src[si + 3] ?? 0;
    }
  }
  return out;
}

/** Resize a square buffer to another square size. Same size returns a copy. */
export function resampleSquare(src: Uint8ClampedArray, from: number, to: number): Uint8ClampedArray | null {
  if (from === to) {
    if (src.length < from * from * 4) return null;
    return new Uint8ClampedArray(src.subarray(0, from * from * 4));
  }
  if (to > from && to % from === 0) return upscaleNearest(src, from, to / from);
  return downscaleNearest(src, from, from, to);
}
