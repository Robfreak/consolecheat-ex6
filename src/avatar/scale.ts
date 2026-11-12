import { downscaleNearest as downscaleSized, upscaleNearest as upscaleSized } from "../draw/scale.ts";
import { SIZE } from "./pixels.ts";

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
  return upscaleSized(src, SIZE, factor);
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
  return downscaleSized(src, srcW, srcH, dst);
}
