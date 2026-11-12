import { downscaleNearest } from "../draw/scale.ts";
import { canvasFromRgba, canvasToPngBlob, downloadBlob, readImageFile } from "../draw/png.ts";
import type { CanvasSize, PlayMode, SheetLayout, Upscale } from "./model.ts";
import { blitSpritesheet, spriteMeta, type SpriteMeta } from "./sheet.ts";

export { readImageFile };

export function frameFromImage(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  dstSize: CanvasSize,
): Uint8ClampedArray | null {
  return downscaleNearest(data, width, height, dstSize);
}

export async function downloadRgbaPng(pixels: Uint8ClampedArray, width: number, height: number, filename: string): Promise<boolean> {
  const canvas = canvasFromRgba(pixels, width, height);
  if (!canvas) return false;
  const blob = await canvasToPngBlob(canvas);
  if (!blob) return false;
  downloadBlob(blob, filename);
  return true;
}

export function currentFrameFilename(size: number): string {
  return `consolecheat-sprite-frame-${size}.png`;
}

export function sheetFilename(cell: number): string {
  return `consolecheat-sprite-sheet-${cell}.png`;
}

export const META_FILENAME = "consolecheat-sprite.json";

export async function downloadCurrentFrame(frame: Uint8ClampedArray, size: CanvasSize, scale: Upscale): Promise<boolean> {
  const sheet = blitSpritesheet([frame], size, "strip", 1, scale);
  if (!sheet) return false;
  return downloadRgbaPng(sheet.data, sheet.width, sheet.height, currentFrameFilename(sheet.cell));
}

export async function downloadSpritesheet(
  frames: readonly Uint8ClampedArray[],
  size: CanvasSize,
  layout: SheetLayout,
  columns: number,
  scale: Upscale,
): Promise<boolean> {
  const sheet = blitSpritesheet(frames, size, layout, columns, scale);
  if (!sheet) return false;
  return downloadRgbaPng(sheet.data, sheet.width, sheet.height, sheetFilename(sheet.cell));
}

export function downloadMeta(meta: SpriteMeta): void {
  const blob = new Blob([JSON.stringify(spriteMeta(meta))], { type: "application/json" });
  downloadBlob(blob, META_FILENAME);
}

export function metaFor(options: {
  size: CanvasSize;
  count: number;
  fps: number;
  columns: number;
  mode: PlayMode;
  layout: SheetLayout;
}): SpriteMeta {
  return spriteMeta({
    frameSize: options.size,
    count: options.count,
    fps: options.fps,
    columns: options.columns,
    mode: options.mode,
    layout: options.layout,
  });
}
