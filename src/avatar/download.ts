import { canvasFromRgba, downloadBlob, readImageFile as readShared } from "../draw/png.ts";
import { SIZE } from "./pixels.ts";
import { exportFilename, upscaleTo, type ExportSize } from "./scale.ts";

export async function readImageFile(file: Blob): Promise<{ data: Uint8ClampedArray; width: number; height: number } | null> {
  return readShared(file);
}

export function downloadPng(pixels: Uint8ClampedArray, size: ExportSize): void {
  const scaled = size === SIZE ? pixels : upscaleTo(pixels, size);
  const canvas = canvasFromRgba(scaled, size, size);
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    downloadBlob(blob, exportFilename(size));
  }, "image/png");
}
