import { SIZE, createBuffer } from "./pixels.ts";

export const EXPORT_SIZES = [64, 256, 512, 1024] as const;

export type ExportSize = (typeof EXPORT_SIZES)[number];

export function isExportSize(value: number): value is ExportSize {
  return (EXPORT_SIZES as readonly number[]).includes(value);
}

export function exportFilename(size: number): string {
  return `consolecheat-avatar-${size}.png`;
}

/** Nearest-neighbour upscale of a 64×64 RGBA buffer. Factor 1 returns a copy. Alpha is copied as-is. */
export function upscaleNearest(src: Uint8ClampedArray, factor: number): Uint8ClampedArray {
  if (!Number.isInteger(factor) || factor < 1) throw new Error("factor");
  if (src.length < SIZE * SIZE * 4) throw new Error("buffer");
  const outW = SIZE * factor;
  const out = new Uint8ClampedArray(outW * outW * 4);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const si = (y * SIZE + x) * 4;
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

export function upscaleTo(src: Uint8ClampedArray, size: ExportSize): Uint8ClampedArray {
  return upscaleNearest(src, size / SIZE);
}

/**
 * Downscale an RGBA image to 64×64 with nearest-neighbour.
 * Each destination pixel samples the source pixel under its center.
 */
export function downscaleNearest(
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  dst: number = SIZE,
): Uint8ClampedArray | null {
  if (!Number.isInteger(srcW) || !Number.isInteger(srcH) || srcW < 1 || srcH < 1) return null;
  if (!Number.isInteger(dst) || dst < 1) return null;
  if (src.length < srcW * srcH * 4) return null;
  const out = dst === SIZE ? createBuffer() : new Uint8ClampedArray(dst * dst * 4);
  for (let y = 0; y < dst; y += 1) {
    const sy = Math.min(srcH - 1, Math.floor((y + 0.5) * srcH / dst));
    for (let x = 0; x < dst; x += 1) {
      const sx = Math.min(srcW - 1, Math.floor((x + 0.5) * srcW / dst));
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
