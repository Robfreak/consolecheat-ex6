import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  COLOR_STOPS,
  SHARPNESS,
  checkerStyle,
  checkerTileRgba,
  devicePixelOn,
  gradientImage,
  patterns,
  previewStyle,
} from "./patterns.ts";

test("catalog covers colors, gradients, pixels, black level, motion, and sharpness", () => {
  assert.deepEqual(
    patterns.slice(0, 6).map((pattern) => pattern.id),
    ["black", "white", "red", "green", "blue", "gray"],
  );
  const solids = patterns.filter((pattern) => pattern.kind === "solid");
  assert.deepEqual(
    solids.map((pattern) => (pattern.kind === "solid" ? pattern.color : "")),
    ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#808080"],
  );
  const horizontal = patterns.find((pattern) => pattern.id === "gradient-h");
  const vertical = patterns.find((pattern) => pattern.id === "gradient-v");
  assert.equal(horizontal?.kind, "gradient");
  assert.equal(vertical?.kind, "gradient");
  if (horizontal?.kind !== "gradient" || vertical?.kind !== "gradient") return;
  assert.equal(horizontal.direction, "to right");
  assert.equal(vertical.direction, "to bottom");
  assert.match(gradientImage("to right"), /^linear-gradient\(to right,/);
  assert.match(gradientImage("to bottom"), /to bottom/);
  for (const stop of COLOR_STOPS) assert.match(gradientImage("to right"), new RegExp(stop));

  const nearBlack = patterns.find((pattern) => pattern.id === "near-black");
  const nearWhite = patterns.find((pattern) => pattern.id === "near-white");
  assert.equal(nearBlack?.kind, "bands");
  assert.equal(nearWhite?.kind, "bands");
  if (nearBlack?.kind !== "bands" || nearWhite?.kind !== "bands") return;
  assert.equal(nearBlack.bands[0]?.color, "#000000");
  assert.ok(nearBlack.bands.some((band) => band.color !== "#000000"));
  assert.equal(nearWhite.bands[0]?.color, "#ffffff");
  assert.ok(nearWhite.bands.some((band) => band.color !== "#ffffff"));

  assert.equal(patterns.some((pattern) => pattern.kind === "checker"), true);
  assert.equal(patterns.some((pattern) => pattern.kind === "pixels"), true);
  assert.equal(patterns.some((pattern) => pattern.kind === "motion" && pattern.motion === "bar"), true);
  assert.equal(patterns.some((pattern) => pattern.kind === "motion" && pattern.motion === "scroll"), true);
  assert.equal(patterns.some((pattern) => pattern.kind === "sharpness"), true);
  assert.deepEqual(
    patterns.filter((pattern) => pattern.number !== null).map((pattern) => pattern.number),
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  );
});

test("checkerboard and the one-pixel grid are black and white", () => {
  const style = checkerStyle(64);
  assert.match(style.backgroundColor ?? "", /#ffffff/);
  assert.match(style.backgroundImage ?? "", /#000000/);
  assert.match(style.backgroundSize ?? "", /64px 64px/);
  assert.equal(devicePixelOn(0, 0), true);
  assert.equal(devicePixelOn(1, 0), false);
  assert.equal(devicePixelOn(0, 1), false);
  assert.equal(devicePixelOn(1, 1), true);
  const tile = checkerTileRgba();
  assert.equal(tile.length, 16);
  assert.equal(tile[0], 255);
  assert.equal(tile[4], 0);
  assert.ok(SHARPNESS.de.length > 20);
  assert.ok(SHARPNESS.en.length > 20);
  assert.ok(SHARPNESS.sizes.length >= 4);
});

test("every pattern has a local preview and motion css stays in this folder", () => {
  for (const pattern of patterns) {
    const preview = previewStyle(pattern);
    const painted = Object.values(preview).join(" ");
    assert.ok(painted.length > 0, pattern.id);
    assert.doesNotMatch(painted, /https?:/i);
  }
  const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  assert.match(css, /@keyframes bildschirm-bar/);
  assert.match(css, /@keyframes bildschirm-scroll/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /data-motion="play"/);
  assert.doesNotMatch(css, /fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr/);
});
