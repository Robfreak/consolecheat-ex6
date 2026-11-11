import assert from "node:assert/strict";
import test from "node:test";
import { createBuffer, getPixel, setPixel } from "./pixels.ts";
import { EXPORT_SIZES, downscaleNearest, exportFilename, upscaleTo } from "./scale.ts";

test("PNG buffers are 64, 256, 512 and 1024 and keep alpha", () => {
  const buf = createBuffer();
  setPixel(buf, 1, 2, { r: 0, g: 0, b: 0, a: 0 });
  setPixel(buf, 2, 2, { r: 9, g: 8, b: 7, a: 128 });
  setPixel(buf, 3, 2, { r: 255, g: 0, b: 77, a: 255 });
  assert.deepEqual(EXPORT_SIZES, [64, 256, 512, 1024]);
  for (const size of EXPORT_SIZES) {
    const out = upscaleTo(buf, size);
    const factor = size / 64;
    assert.equal(out.length, size * size * 4, String(size));
    assert.equal(exportFilename(size), `consolecheat-avatar-${size}.png`);
    for (let dy = 0; dy < factor; dy += 1) {
      for (let dx = 0; dx < factor; dx += 1) {
        const clear = ((2 * factor + dy) * size + (1 * factor + dx)) * 4;
        assert.equal(out[clear + 3], 0, `clear ${size}`);
        const soft = ((2 * factor + dy) * size + (2 * factor + dx)) * 4;
        assert.equal(out[soft], 9);
        assert.equal(out[soft + 1], 8);
        assert.equal(out[soft + 2], 7);
        assert.equal(out[soft + 3], 128, `alpha ${size}`);
        const solid = ((2 * factor + dy) * size + (3 * factor + dx)) * 4;
        assert.equal(out[solid], 255);
        assert.equal(out[solid + 3], 255);
      }
    }
  }
});

test("import downscales to 64×64 with nearest neighbour and keeps transparency", () => {
  const width = 128;
  const height = 128;
  const src = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (x < width / 2) {
        src[i] = 255;
        src[i + 3] = 255;
      } else {
        src[i + 2] = 255;
        src[i + 3] = 255;
      }
    }
  }
  const clearX = Math.min(width - 1, Math.floor((63 + 0.5) * width / 64));
  const clearY = Math.min(height - 1, Math.floor((0 + 0.5) * height / 64));
  const clear = (clearY * width + clearX) * 4;
  src[clear] = 7;
  src[clear + 1] = 0;
  src[clear + 2] = 0;
  src[clear + 3] = 0;
  const out = downscaleNearest(src, width, height);
  assert.ok(out);
  assert.equal(getPixel(out, 0, 0).r, 255);
  assert.equal(getPixel(out, 31, 10).r, 255);
  assert.equal(getPixel(out, 32, 10).b, 255);
  assert.equal(getPixel(out, 63, 0).a, 0);
  assert.equal(getPixel(out, 63, 1).b, 255);

  const exact = createBuffer();
  setPixel(exact, 5, 6, { r: 4, g: 5, b: 6, a: 200 });
  const same = downscaleNearest(exact, 64, 64);
  assert.ok(same);
  assert.deepEqual(getPixel(same, 5, 6), { r: 4, g: 5, b: 6, a: 200 });
  assert.equal(downscaleNearest(new Uint8ClampedArray(8), 4, 4), null);
  assert.equal(downscaleNearest(src, 0, 10), null);
});
