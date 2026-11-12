import assert from "node:assert/strict";
import test from "node:test";
import { createBuffer, encodePixels, getPixel, setPixel } from "../draw/buffer.ts";
import { AVATAR_KEY, pixelsFromAvatarDraft, readAvatarDraft } from "./avatar-import.ts";

function avatarJson(pixels: Uint8ClampedArray): string {
  return JSON.stringify({ version: 1, pixels: encodePixels(64, pixels) });
}

test("avatar import reads the draft, resizes a mismatch, and ignores a missing or corrupt key", () => {
  const buf = createBuffer(64);
  setPixel(64, buf, 1, 1, { r: 4, g: 5, b: 6, a: 255 });
  setPixel(64, buf, 11, 11, { r: 9, g: 8, b: 7, a: 128 });
  const raw = avatarJson(buf);

  const same = pixelsFromAvatarDraft(raw, 64);
  assert.equal(same.ok, true);
  if (same.ok) {
    assert.equal(same.resampled, false);
    assert.deepEqual(getPixel(64, same.pixels, 1, 1), { r: 4, g: 5, b: 6, a: 255 });
    assert.equal(getPixel(64, same.pixels, 11, 11).a, 128);
  }

  const small = pixelsFromAvatarDraft(raw, 32);
  assert.equal(small.ok, true);
  if (small.ok) {
    assert.equal(small.resampled, true);
    assert.equal(small.pixels.length, 32 * 32 * 4);
    assert.equal(getPixel(32, small.pixels, 5, 5).a, 128);
  }

  assert.deepEqual(pixelsFromAvatarDraft(null, 32), { ok: false, reason: "missing" });
  assert.deepEqual(pixelsFromAvatarDraft("{", 32), { ok: false, reason: "corrupt" });
  assert.deepEqual(pixelsFromAvatarDraft(JSON.stringify({ version: 2, pixels: "1:0" }), 32), { ok: false, reason: "corrupt" });
  assert.deepEqual(pixelsFromAvatarDraft(JSON.stringify({ version: 1, pixels: "1:0" }), 32), { ok: false, reason: "corrupt" });

  let writes = 0;
  const store = {
    getItem(key: string) {
      return key === AVATAR_KEY ? raw : null;
    },
    setItem() {
      writes += 1;
    },
    removeItem() {
      writes += 1;
    },
  };
  const read = readAvatarDraft(store, 16);
  assert.equal(read.ok, true);
  assert.equal(writes, 0);
  if (read.ok) assert.equal(read.pixels.length, 16 * 16 * 4);
});
