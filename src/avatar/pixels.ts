// 64×64 RGBA buffer. Row-major, 4 bytes per pixel, alpha 0 = transparent.
// Drawing, flood fill, and flips mutate or return buffers. They do not touch the DOM.
// The algorithms live in src/draw so Sprite-Animator can reuse them at 16, 32, and 64.

import {
  TRANSPARENT as CLEAR,
  buffersEqual as buffersEqualSized,
  cellFromOffset as cellFromOffsetSized,
  cloneBuffer as cloneBufferSized,
  createBuffer as createBufferSized,
  decodePixels as decodePixelsSized,
  encodePixels as encodePixelsSized,
  floodFill as floodFillSized,
  flipHorizontal as flipHorizontalSized,
  flipVertical as flipVerticalSized,
  getPixel as getPixelSized,
  inBounds as inBoundsSized,
  linePoints as linePointsSized,
  mirrorX as mirrorXSized,
  offset as offsetSized,
  paintPoints as paintPointsSized,
  parseHex as parseHexSized,
  sameColor as sameColorSized,
  setPixel as setPixelSized,
  strokeOnto as strokeOntoSized,
  toHex as toHexSized,
  type FillResult,
  type Rgba,
} from "../draw/buffer.ts";

export const SIZE = 64;
export const PIXEL_COUNT = SIZE * SIZE;
export const BYTES = PIXEL_COUNT * 4;

export type { FillResult, Rgba };

export const TRANSPARENT: Rgba = CLEAR;

export function createBuffer(): Uint8ClampedArray {
  return createBufferSized(SIZE);
}

export function cloneBuffer(src: Uint8ClampedArray): Uint8ClampedArray {
  return cloneBufferSized(src);
}

export function inBounds(x: number, y: number): boolean {
  return inBoundsSized(SIZE, x, y);
}

export function offset(x: number, y: number): number {
  return offsetSized(SIZE, x, y);
}

export function getPixel(buf: Uint8ClampedArray, x: number, y: number): Rgba {
  return getPixelSized(SIZE, buf, x, y);
}

export function setPixel(buf: Uint8ClampedArray, x: number, y: number, color: Rgba): void {
  setPixelSized(SIZE, buf, x, y, color);
}

export function sameColor(a: Rgba, b: Rgba): boolean {
  return sameColorSized(a, b);
}

export function buffersEqual(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  return buffersEqualSized(a, b);
}

export function parseHex(hex: string): Rgba | null {
  return parseHexSized(hex);
}

export function toHex(color: Rgba): string {
  return toHexSized(color);
}

export function mirrorX(x: number): number {
  return mirrorXSized(SIZE, x);
}

/** Map a point inside a displayed rectangle to a pixel. `localX`/`localY` are relative to the top-left. */
export function cellFromOffset(
  localX: number,
  localY: number,
  width: number,
  height: number,
): { x: number; y: number } | null {
  return cellFromOffsetSized(SIZE, localX, localY, width, height);
}

/**
 * Bresenham, inclusive of both ends. Consecutive points are at most one pixel apart
 * (including diagonally), so a fast stroke has no gaps.
 */
export function linePoints(x0: number, y0: number, x1: number, y1: number): Array<[number, number]> {
  return linePointsSized(x0, y0, x1, y1);
}

export function paintPoints(
  buf: Uint8ClampedArray,
  points: ReadonlyArray<readonly [number, number]>,
  color: Rgba,
  symmetry: boolean,
): void {
  paintPointsSized(SIZE, buf, points, color, symmetry);
}

/** Paint the interpolated segment from (x0, y0) to (x1, y1), including both ends. */
export function strokeOnto(
  buf: Uint8ClampedArray,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Rgba,
  symmetry: boolean,
): void {
  strokeOntoSized(SIZE, buf, x0, y0, x1, y1, color, symmetry);
}

/**
 * 4-neighbour flood fill. Iterative (an array used as a stack), never recursive.
 * Each pixel is pushed at most once. `steps` is therefore at most 64×64, so a full-canvas
 * fill cannot overflow the call stack or grow without a bound.
 */
export function floodFill(buf: Uint8ClampedArray, x: number, y: number, color: Rgba): FillResult {
  return floodFillSized(SIZE, buf, x, y, color);
}

export function flipHorizontal(src: Uint8ClampedArray): Uint8ClampedArray {
  return flipHorizontalSized(SIZE, src);
}

export function flipVertical(src: Uint8ClampedArray): Uint8ClampedArray {
  return flipVerticalSized(SIZE, src);
}

/**
 * Compact run-length encoding, row-major.
 * Runs are separated by commas. Each run is `COUNT:PAYLOAD`.
 * PAYLOAD is `0` for a fully transparent pixel (0,0,0,0), otherwise 8 hex digits RRGGBBAA.
 * The runs cover exactly 4096 pixels.
 */
export function encodePixels(buf: Uint8ClampedArray): string {
  return encodePixelsSized(SIZE, buf);
}

export function decodePixels(text: string): Uint8ClampedArray | null {
  return decodePixelsSized(SIZE, text);
}
