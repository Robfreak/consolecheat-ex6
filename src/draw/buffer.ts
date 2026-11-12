// Size-aware RGBA buffer. Row-major, 4 bytes per pixel, alpha 0 = transparent.
// Drawing and flood fill mutate or return buffers. They do not touch the DOM.
// Pixel-Avatar-Studio binds these to 64×64. Sprite-Animator passes 16, 32, or 64.

export type Rgba = { r: number; g: number; b: number; a: number };

export const TRANSPARENT: Rgba = { r: 0, g: 0, b: 0, a: 0 };

export function pixelCount(size: number): number {
  return size * size;
}

export function byteLength(size: number): number {
  return size * size * 4;
}

export function createBuffer(size: number): Uint8ClampedArray {
  return new Uint8ClampedArray(byteLength(size));
}

export function cloneBuffer(src: Uint8ClampedArray): Uint8ClampedArray {
  return new Uint8ClampedArray(src);
}

export function inBounds(size: number, x: number, y: number): boolean {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < size && y < size;
}

export function offset(size: number, x: number, y: number): number {
  return (y * size + x) * 4;
}

export function getPixel(size: number, buf: Uint8ClampedArray, x: number, y: number): Rgba {
  const i = offset(size, x, y);
  return { r: buf[i] ?? 0, g: buf[i + 1] ?? 0, b: buf[i + 2] ?? 0, a: buf[i + 3] ?? 0 };
}

export function setPixel(size: number, buf: Uint8ClampedArray, x: number, y: number, color: Rgba): void {
  if (!inBounds(size, x, y)) return;
  const i = offset(size, x, y);
  buf[i] = color.r;
  buf[i + 1] = color.g;
  buf[i + 2] = color.b;
  buf[i + 3] = color.a;
}

export function sameColor(a: Rgba, b: Rgba): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

export function buffersEqual(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}

export function parseHex(hex: string): Rgba | null {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match?.[1]) return null;
  const n = Number.parseInt(match[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 255 };
}

export function toHex(color: Rgba): string {
  const byte = (n: number) => n.toString(16).padStart(2, "0");
  return `#${byte(color.r)}${byte(color.g)}${byte(color.b)}`;
}

export function mirrorX(size: number, x: number): number {
  return size - 1 - x;
}

/** Map a point inside a displayed rectangle to a pixel. `localX`/`localY` are relative to the top-left. */
export function cellFromOffset(
  size: number,
  localX: number,
  localY: number,
  width: number,
  height: number,
): { x: number; y: number } | null {
  if (!(width > 0) || !(height > 0)) return null;
  if (localX < 0 || localY < 0 || localX >= width || localY >= height) return null;
  const x = Math.min(size - 1, Math.floor((localX / width) * size));
  const y = Math.min(size - 1, Math.floor((localY / height) * size));
  return { x, y };
}

/**
 * Bresenham, inclusive of both ends. Consecutive points are at most one pixel apart
 * (including diagonally), so a fast stroke has no gaps.
 */
export function linePoints(x0: number, y0: number, x1: number, y1: number): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  const cap = dx + dy + 1;
  for (let n = 0; n <= cap; n += 1) {
    points.push([x, y]);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return points;
}

export function paintPoints(
  size: number,
  buf: Uint8ClampedArray,
  points: ReadonlyArray<readonly [number, number]>,
  color: Rgba,
  symmetry: boolean,
): void {
  for (const [x, y] of points) {
    setPixel(size, buf, x, y, color);
    if (symmetry) setPixel(size, buf, mirrorX(size, x), y, color);
  }
}

/** Paint the interpolated segment from (x0, y0) to (x1, y1), including both ends. */
export function strokeOnto(
  size: number,
  buf: Uint8ClampedArray,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Rgba,
  symmetry: boolean,
): void {
  paintPoints(size, buf, linePoints(x0, y0, x1, y1), color, symmetry);
}

export type FillResult = { painted: number; steps: number };

/**
 * 4-neighbour flood fill. Iterative (an array used as a stack), never recursive.
 * Each pixel is pushed at most once. `steps` is therefore at most size×size, so a full-canvas
 * fill cannot overflow the call stack or grow without a bound.
 */
export function floodFill(size: number, buf: Uint8ClampedArray, x: number, y: number, color: Rgba): FillResult {
  const count = pixelCount(size);
  if (!inBounds(size, x, y)) return { painted: 0, steps: 0 };
  const target = getPixel(size, buf, x, y);
  if (sameColor(target, color)) return { painted: 0, steps: 0 };
  const seen = new Uint8Array(count);
  const stack: number[] = [];
  const start = y * size + x;
  seen[start] = 1;
  stack.push(start);
  let painted = 0;
  let steps = 0;
  while (stack.length > 0 && steps < count) {
    const id = stack.pop();
    if (id === undefined) break;
    steps += 1;
    const px = id % size;
    const py = (id - px) / size;
    if (!sameColor(getPixel(size, buf, px, py), target)) continue;
    setPixel(size, buf, px, py, color);
    painted += 1;
    if (px > 0) push(id - 1);
    if (px + 1 < size) push(id + 1);
    if (py > 0) push(id - size);
    if (py + 1 < size) push(id + size);
  }
  return { painted, steps };

  function push(id: number) {
    if (seen[id]) return;
    seen[id] = 1;
    stack.push(id);
  }
}

export function flipHorizontal(size: number, src: Uint8ClampedArray): Uint8ClampedArray {
  const out = createBuffer(size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) setPixel(size, out, mirrorX(size, x), y, getPixel(size, src, x, y));
  }
  return out;
}

export function flipVertical(size: number, src: Uint8ClampedArray): Uint8ClampedArray {
  const out = createBuffer(size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) setPixel(size, out, x, size - 1 - y, getPixel(size, src, x, y));
  }
  return out;
}

function byteHex(n: number): string {
  return n.toString(16).padStart(2, "0");
}

/**
 * Compact run-length encoding, row-major.
 * Runs are separated by commas. Each run is `COUNT:PAYLOAD`.
 * PAYLOAD is `0` for a fully transparent pixel (0,0,0,0), otherwise 8 hex digits RRGGBBAA.
 * The runs cover exactly size×size pixels.
 */
export function encodePixels(size: number, buf: Uint8ClampedArray): string {
  const bytes = byteLength(size);
  const parts: string[] = [];
  let i = 0;
  while (i < bytes) {
    const r = buf[i] ?? 0;
    const g = buf[i + 1] ?? 0;
    const b = buf[i + 2] ?? 0;
    const a = buf[i + 3] ?? 0;
    let count = 1;
    let j = i + 4;
    while (j < bytes && buf[j] === r && buf[j + 1] === g && buf[j + 2] === b && buf[j + 3] === a) {
      count += 1;
      j += 4;
    }
    const payload = a === 0 && r === 0 && g === 0 && b === 0 ? "0" : `${byteHex(r)}${byteHex(g)}${byteHex(b)}${byteHex(a)}`;
    parts.push(`${count}:${payload}`);
    i = j;
  }
  return parts.join(",");
}

export function decodePixels(size: number, text: string, maxLength = 200_000): Uint8ClampedArray | null {
  const count = pixelCount(size);
  if (typeof text !== "string" || text.length === 0 || text.length > maxLength) return null;
  const out = createBuffer(size);
  let written = 0;
  for (const run of text.split(",")) {
    const sep = run.indexOf(":");
    if (sep <= 0) return null;
    const n = Number(run.slice(0, sep));
    const payload = run.slice(sep + 1);
    if (!Number.isInteger(n) || n < 1 || n > count) return null;
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    if (payload !== "0") {
      if (!/^[0-9a-fA-F]{8}$/.test(payload)) return null;
      r = Number.parseInt(payload.slice(0, 2), 16);
      g = Number.parseInt(payload.slice(2, 4), 16);
      b = Number.parseInt(payload.slice(4, 6), 16);
      a = Number.parseInt(payload.slice(6, 8), 16);
    }
    if (written + n > count) return null;
    for (let k = 0; k < n; k += 1) {
      const o = (written + k) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = a;
    }
    written += n;
  }
  if (written !== count) return null;
  return out;
}
