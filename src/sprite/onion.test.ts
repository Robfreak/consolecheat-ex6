import assert from "node:assert/strict";
import test from "node:test";
import { createBuffer, getPixel, parseHex, setPixel } from "../draw/buffer.ts";
import { compositeOnion } from "./onion.ts";

test("onion skin composites the previous and optional next frame under the current pixels", () => {
  const red = parseHex("#ff004d");
  const blue = parseHex("#29adff");
  const green = parseHex("#00e436");
  assert.ok(red && blue && green);
  const size = 2;
  const previous = createBuffer(size);
  const current = createBuffer(size);
  const next = createBuffer(size);
  setPixel(size, previous, 0, 0, red);
  setPixel(size, current, 1, 0, blue);
  setPixel(size, next, 0, 1, green);

  const ghost = compositeOnion(size, current, previous, next, 0.5, false);
  const under = getPixel(size, ghost, 0, 0);
  assert.equal(under.r, 255);
  assert.equal(under.g, 0);
  assert.equal(under.b, 77);
  assert.equal(under.a, 128);
  assert.deepEqual(getPixel(size, ghost, 1, 0), blue);
  assert.equal(getPixel(size, ghost, 0, 1).a, 0);
  assert.deepEqual(getPixel(size, current, 0, 0).a, 0);

  const both = compositeOnion(size, current, previous, next, 0.5, true);
  const nextGhost = getPixel(size, both, 0, 1);
  assert.equal(nextGhost.g, 228);
  assert.equal(nextGhost.a, 128);
  assert.deepEqual(getPixel(size, both, 1, 0), blue);
});
