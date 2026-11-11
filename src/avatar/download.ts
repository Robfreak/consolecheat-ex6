import { SIZE } from "./pixels.ts";
import { exportFilename, upscaleTo, type ExportSize } from "./scale.ts";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_PIXELS = 4_000_000;

export async function readImageFile(file: Blob): Promise<{ data: Uint8ClampedArray; width: number; height: number } | null> {
  if (file.size > MAX_BYTES) return null;
  try {
    const bitmap = await createImageBitmap(file);
    try {
      if (bitmap.width < 1 || bitmap.height < 1 || bitmap.width * bitmap.height > MAX_PIXELS) return null;
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(bitmap, 0, 0);
      const image = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      return { data: image.data, width: bitmap.width, height: bitmap.height };
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
}

export function downloadPng(pixels: Uint8ClampedArray, size: ExportSize): void {
  const scaled = size === SIZE ? pixels : upscaleTo(pixels, size);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.putImageData(new ImageData(new Uint8ClampedArray(scaled), size, size), 0, 0);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportFilename(size);
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
}
