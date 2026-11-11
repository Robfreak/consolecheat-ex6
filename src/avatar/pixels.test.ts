import assert from "node:assert/strict";
import test from "node:test";
import {
  PIXEL_COUNT,
  SIZE,
  TRANSPARENT,
  cellFromOffset,
  createBuffer,
  decodePixels,
  encodePixels,
  floodFill,
  flipHorizontal,
  flipVertical,
  getPixel,
  linePoints,
  parseHex,
  setPixel,
  strokeOnto,
} from "./pixels.ts";

const red = parseHex("#ff004d");
const black = parseHex("#000000");

test("pencil draws and the eraser restores transparency", () => {
  assert.ok(red);
  const buf = createBuffer();
  strokeOnto(buf, 2, 3, 2, 8, red, false);
  assert.equal(getPixel(buf, 2, 5).a, 255);
  assert.equal(getPixel(buf, 2, 5).r, 255);
  assert.equal(getPixel(buf, 2, 5).g, 0);
  assert.equal(getPixel(buf, 2, 5).b, 77);
  assert.equal(getPixel(buf, 3, 5).a, 0);
  strokeOnto(buf, 2, 3, 2, 8, TRANSPARENT, false);
  assert.equal(getPixel(buf, 2, 5).a, 0);
  assert.equal(getPixel(buf, 2, 5).r, 0);
});

test("a fast stroke interpolates so consecutive pixels touch", () => {
  const points = linePoints(0, 0, 47, 13);
  assert.deepEqual(points[0], [0, 0]);
  assert.deepEqual(points[points.length - 1], [47, 13]);
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1] ?? [0, 0];
    const [x1, y1] = points[i] ?? [0, 0];
    const gap = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    assert.equal(gap, 1, `${x0},${y0} -> ${x1},${y1}`);
  }
  assert.ok(red);
  const buf = createBuffer();
  strokeOnto(buf, 0, 10, 63, 10, red, false);
  for (let x = 0; x < SIZE; x += 1) assert.equal(getPixel(buf, x, 10).a, 255, `gap at ${x}`);
});

test("horizontal symmetry paints the mirrored column", () => {
  assert.ok(red);
  const buf = createBuffer();
  strokeOnto(buf, 1, 4, 3, 6, red, true);
  assert.equal(getPixel(buf, 1, 4).a, 255);
  assert.equal(getPixel(buf, SIZE - 1 - 1, 4).r, 255);
  assert.equal(getPixel(buf, SIZE - 1 - 3, 6).a, 255);
});

test("eyedropper reads the pixel, including a transparent cell", () => {
  assert.ok(red);
  const buf = createBuffer();
  setPixel(buf, 8, 9, red);
  assert.deepEqual(getPixel(buf, 8, 9), red);
  assert.deepEqual(getPixel(buf, 0, 0), TRANSPARENT);
});

test("flood fill is 4-neighbour and does not cross a diagonal", () => {
  assert.ok(red && black);
  const buf = createBuffer();
  setPixel(buf, 1, 0, black);
  setPixel(buf, 0, 1, black);
  const result = floodFill(buf, 0, 0, red);
  assert.equal(result.painted, 1);
  assert.equal(getPixel(buf, 0, 0).r, 255);
  assert.equal(getPixel(buf, 1, 1).a, 0);
  assert.deepEqual(getPixel(buf, 1, 0), black);
});

test("flood fill of the whole canvas stays iterative and bounded", () => {
  assert.ok(red);
  const buf = createBuffer();
  const result = floodFill(buf, 63, 63, red);
  assert.equal(result.painted, PIXEL_COUNT);
  assert.equal(result.steps, PIXEL_COUNT);
  assert.ok(result.steps <= PIXEL_COUNT);
  assert.equal(getPixel(buf, 0, 0).a, 255);
  assert.equal(getPixel(buf, 32, 32).b, 77);
  const again = floodFill(buf, 0, 0, red);
  assert.deepEqual(again, { painted: 0, steps: 0 });
});

test("flip horizontal and vertical move pixels and keep alpha", () => {
  assert.ok(red);
  const buf = createBuffer();
  setPixel(buf, 0, 1, { r: 9, g: 8, b: 7, a: 128 });
  const horizontal = flipHorizontal(buf);
  assert.deepEqual(getPixel(horizontal, SIZE - 1, 1), { r: 9, g: 8, b: 7, a: 128 });
  assert.equal(getPixel(horizontal, 0, 1).a, 0);
  const vertical = flipVertical(buf);
  assert.deepEqual(getPixel(vertical, 0, SIZE - 1 - 1), { r: 9, g: 8, b: 7, a: 128 });
  assert.equal(getPixel(buf, 0, 1).a, 128);
});

test("pixel encoding round-trips and rejects a short or broken string", () => {
  assert.ok(red);
  const buf = createBuffer();
  setPixel(buf, 4, 5, red);
  setPixel(buf, 6, 5, { r: 1, g: 2, b: 3, a: 40 });
  const encoded = encodePixels(buf);
  assert.match(encoded, /:0/);
  const back = decodePixels(encoded);
  assert.ok(back);
  assert.deepEqual(getPixel(back, 4, 5), red);
  assert.equal(getPixel(back, 6, 5).a, 40);
  assert.equal(decodePixels("1:0"), null);
  assert.equal(decodePixels("nope"), null);
  assert.equal(decodePixels("4096:zz"), null);
  assert.equal(decodePixels(""), null);
});

test("display coordinates map into the 64 grid and reject the outside", () => {
  assert.deepEqual(cellFromOffset(0, 0, 320, 320), { x: 0, y: 0 });
  assert.deepEqual(cellFromOffset(319, 319, 320, 320), { x: 63, y: 63 });
  assert.equal(cellFromOffset(320, 10, 320, 320), null);
  assert.equal(cellFromOffset(-1, 10, 320, 320), null);
  assert.equal(cellFromOffset(10, 10, 0, 320), null);
});
