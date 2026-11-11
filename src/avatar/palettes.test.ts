import assert from "node:assert/strict";
import test from "node:test";
import { paletteColors, paletteIds } from "./palettes.ts";

test("switching palette changes the swatches", () => {
  assert.deepEqual(paletteIds, ["pico8", "gb", "nes", "c64"]);
  assert.equal(paletteColors("pico8").length, 16);
  assert.equal(paletteColors("gb").length, 4);
  assert.equal(paletteColors("nes").length, 16);
  assert.equal(paletteColors("c64").length, 16);
  assert.equal(paletteColors("pico8")[8], "#ff004d");
  assert.equal(paletteColors("gb")[0], "#0f380f");
  assert.equal(paletteColors("gb")[3], "#9bbc0f");
  assert.equal(paletteColors("c64")[6], "#352879");
  assert.notDeepEqual(paletteColors("pico8"), paletteColors("nes"));
  assert.notDeepEqual(paletteColors("pico8"), paletteColors("c64"));
  for (const id of paletteIds) {
    const colors = paletteColors(id);
    assert.equal(new Set(colors).size, colors.length, id);
    for (const color of colors) assert.match(color, /^#[0-9a-f]{6}$/);
  }
});
