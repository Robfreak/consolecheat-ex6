import { createBuffer, getPixel, setPixel } from "../draw/buffer.ts";
import { resampleSquare, upscaleNearest } from "../draw/scale.ts";
import { MAX_FRAMES, type PlayMode, type SheetLayout, type Upscale } from "./model.ts";

export function sheetColumnCount(frameCount: number, layout: SheetLayout, columns: number): number {
  const count = Math.max(1, frameCount);
  if (layout === "strip") return count;
  const wanted = Number.isFinite(columns) ? Math.round(columns) : 1;
  return Math.min(count, Math.max(1, wanted));
}

export function sheetRowCount(frameCount: number, columns: number): number {
  const count = Math.max(1, frameCount);
  const cols = Math.max(1, columns);
  return Math.ceil(count / cols);
}

export type SheetBuffer = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  columns: number;
  rows: number;
  cell: number;
};

function blitCell(
  dst: Uint8ClampedArray,
  dstW: number,
  src: Uint8ClampedArray,
  cell: number,
  originX: number,
  originY: number,
): void {
  for (let y = 0; y < cell; y += 1) {
    for (let x = 0; x < cell; x += 1) {
      const si = (y * cell + x) * 4;
      const di = ((originY + y) * dstW + (originX + x)) * 4;
      dst[di] = src[si] ?? 0;
      dst[di + 1] = src[si + 1] ?? 0;
      dst[di + 2] = src[si + 2] ?? 0;
      dst[di + 3] = src[si + 3] ?? 0;
    }
  }
}

/** Frames in row-major order. Empty cells stay transparent. Each cell is `cell * scale` pixels. */
export function blitSpritesheet(
  frames: readonly Uint8ClampedArray[],
  cell: number,
  layout: SheetLayout,
  columns: number,
  scale: Upscale,
): SheetBuffer | null {
  if (!Number.isInteger(cell) || cell < 1) return null;
  if (frames.length < 1) return null;
  const need = cell * cell * 4;
  if (frames.some((frame) => frame.length < need)) return null;
  const cols = sheetColumnCount(frames.length, layout, columns);
  const rows = sheetRowCount(frames.length, cols);
  const cellOut = cell * scale;
  const width = cols * cellOut;
  const height = rows * cellOut;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    if (!frame) return null;
    const scaled = scale === 1 ? frame : upscaleNearest(frame, cell, scale);
    const col = i % cols;
    const row = Math.floor(i / cols);
    blitCell(data, width, scaled, cellOut, col * cellOut, row * cellOut);
  }
  return { data, width, height, columns: cols, rows, cell: cellOut };
}

function extractCell(src: Uint8ClampedArray, srcW: number, x0: number, y0: number, cell: number): Uint8ClampedArray {
  const out = createBuffer(cell);
  for (let y = 0; y < cell; y += 1) {
    for (let x = 0; x < cell; x += 1) {
      setPixel(cell, out, x, y, getPixel(srcW, src, x0 + x, y0 + y));
    }
  }
  return out;
}

/**
 * Cut a spritesheet into square cells of `cell` pixels and resize each one to `dstSize`.
 * Only complete cells are used. At most `maxFrames` cells, row-major.
 */
export function sliceSpritesheet(
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  cell: number,
  dstSize: number,
  maxFrames = MAX_FRAMES,
): Uint8ClampedArray[] | null {
  if (!Number.isInteger(srcW) || !Number.isInteger(srcH) || srcW < 1 || srcH < 1) return null;
  if (!Number.isInteger(cell) || cell < 1 || !Number.isInteger(dstSize) || dstSize < 1) return null;
  if (src.length < srcW * srcH * 4) return null;
  if (srcW < cell || srcH < cell) return null;
  const cols = Math.floor(srcW / cell);
  const rows = Math.floor(srcH / cell);
  const frames: Uint8ClampedArray[] = [];
  for (let row = 0; row < rows && frames.length < maxFrames; row += 1) {
    for (let col = 0; col < cols && frames.length < maxFrames; col += 1) {
      const tile = extractCell(src, srcW, col * cell, row * cell, cell);
      const resized = resampleSquare(tile, cell, dstSize);
      if (!resized) return null;
      frames.push(resized);
    }
  }
  return frames.length > 0 ? frames : null;
}

export type SpriteMeta = {
  frameSize: number;
  count: number;
  fps: number;
  columns: number;
  mode: PlayMode;
  layout: SheetLayout;
};

export function spriteMeta(meta: SpriteMeta): SpriteMeta {
  return {
    frameSize: meta.frameSize,
    count: meta.count,
    fps: meta.fps,
    columns: meta.columns,
    mode: meta.mode,
    layout: meta.layout,
  };
}
