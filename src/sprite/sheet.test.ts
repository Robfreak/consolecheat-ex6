import assert from "node:assert/strict";
import test from "node:test";
import { createBuffer, getPixel, parseHex, setPixel } from "../draw/buffer.ts";
import { frameFromImage } from "./png.ts";
import { blitSpritesheet, sheetColumnCount, sheetRowCount, sliceSpritesheet } from "./sheet.ts";

function at(buf: Uint8ClampedArray, width: number, x: number, y: number) {
  return getPixel(width, buf, x, y);
}

test("spritesheet layout, transparency, and nearest-neighbour upscale", () => {
  const red = parseHex("#ff004d");
  assert.ok(red);
  const cell = 2;
  const frames = [createBuffer(cell), createBuffer(cell), createBuffer(cell)];
  setPixel(cell, frames[0] ?? createBuffer(cell), 0, 0, { r: 9, g: 8, b: 7, a: 128 });
  setPixel(cell, frames[1] ?? createBuffer(cell), 1, 0, red);
  assert.equal(sheetColumnCount(3, "strip", 4), 3);
  assert.equal(sheetRowCount(3, 3), 1);
  assert.equal(sheetColumnCount(3, "grid", 2), 2);
  assert.equal(sheetRowCount(3, 2), 2);

  const strip = blitSpritesheet(frames, cell, "strip", 2, 1);
  assert.ok(strip);
  assert.equal(strip.width, 6);
  assert.equal(strip.height, 2);
  assert.equal(at(strip.data, strip.width, 0, 0).a, 128);
  assert.equal(at(strip.data, strip.width, 0, 0).r, 9);
  assert.equal(at(strip.data, strip.width, 3, 0).r, 255);
  assert.equal(at(strip.data, strip.width, 3, 0).a, 255);
  assert.equal(at(strip.data, strip.width, 4, 1).a, 0);

  const grid = blitSpritesheet(frames, cell, "grid", 2, 1);
  assert.ok(grid);
  assert.equal(grid.width, 4);
  assert.equal(grid.height, 4);
  assert.equal(at(grid.data, grid.width, 0, 2).a, 0);
  assert.equal(at(grid.data, grid.width, 2, 2).a, 0);
  assert.equal(at(grid.data, grid.width, 3, 2).a, 0);

  const scaled = blitSpritesheet([frames[0] ?? createBuffer(cell)], cell, "strip", 1, 2);
  assert.ok(scaled);
  assert.equal(scaled.cell, 4);
  assert.equal(scaled.width, 4);
  for (let y = 0; y < 2; y += 1) {
    for (let x = 0; x < 2; x += 1) {
      const pixel = at(scaled.data, scaled.width, x, y);
      assert.equal(pixel.a, 128, `${x},${y}`);
      assert.equal(pixel.r, 9);
    }
  }
  assert.equal(at(scaled.data, scaled.width, 2, 0).a, 0);
});

test("png import downscales with nearest neighbour and a sheet slices into cells", () => {
  const src = createBuffer(4);
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      setPixel(4, src, x, y, x < 2 ? { r: 255, g: 0, b: 0, a: 255 } : { r: 0, g: 0, b: 255, a: 200 });
    }
  }
  const frame = frameFromImage(src, 4, 4, 16);
  assert.ok(frame);
  assert.equal(getPixel(16, frame, 0, 0).r, 255);
  assert.equal(getPixel(16, frame, 15, 0).b, 255);
  assert.equal(getPixel(16, frame, 15, 0).a, 200);

  const wide = new Uint8ClampedArray(8 * 4 * 4);
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const i = (y * 8 + x) * 4;
      wide[i] = x < 4 ? 10 : 20;
      wide[i + 3] = x < 4 ? 255 : 0;
    }
  }
  const parts = sliceSpritesheet(wide, 8, 4, 4, 16);
  assert.ok(parts);
  assert.equal(parts.length, 2);
  assert.equal(getPixel(16, parts[0] ?? new Uint8ClampedArray(), 0, 0).r, 10);
  assert.equal(getPixel(16, parts[0] ?? new Uint8ClampedArray(), 0, 0).a, 255);
  assert.equal(getPixel(16, parts[1] ?? new Uint8ClampedArray(), 3, 3).a, 0);
  assert.equal(sliceSpritesheet(wide, 8, 4, 9, 16), null);
});
