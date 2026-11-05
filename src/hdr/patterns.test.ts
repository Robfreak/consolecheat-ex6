import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  codeForPercent,
  grayHex,
  patterns,
  previewStyle,
  rampColumnCode,
} from "./patterns.ts";

test("brightness patterns cover 0–5% bars, PLUGE, clipping, and a grayscale ramp", () => {
  assert.deepEqual(
    patterns.map((pattern) => pattern.id),
    ["near-black", "near-white", "pluge", "black-crush", "white-clip", "gray-ramp"],
  );
  assert.deepEqual(
    patterns.map((pattern) => pattern.number),
    ["1", "2", "3", "4", "5", "6"],
  );

  assert.deepEqual([0, 1, 2, 3, 4, 5].map(codeForPercent), [0, 3, 5, 8, 10, 13]);
  assert.equal(grayHex(0), "#000000");
  assert.equal(grayHex(16), "#101010");
  assert.equal(grayHex(235), "#ebebeb");
  assert.equal(grayHex(255), "#ffffff");

  const nearBlack = patterns.find((pattern) => pattern.id === "near-black");
  const nearWhite = patterns.find((pattern) => pattern.id === "near-white");
  assert.equal(nearBlack?.kind, "steps");
  assert.equal(nearWhite?.kind, "steps");
  if (nearBlack?.kind !== "steps" || nearWhite?.kind !== "steps") return;
  assert.deepEqual(
    nearBlack.steps.map((step) => step.label),
    ["0%", "1%", "2%", "3%", "4%", "5%"],
  );
  assert.equal(nearBlack.steps[0]?.color, "#000000");
  assert.equal(nearBlack.steps[1]?.color, "#030303");
  assert.equal(nearBlack.steps[5]?.color, "#0d0d0d");
  assert.equal(nearWhite.steps[0]?.color, "#ffffff");
  assert.equal(nearWhite.steps.at(-1)?.label, "95%");
  assert.ok(nearWhite.steps.some((step) => step.color !== "#ffffff"));

  const pluge = patterns.find((pattern) => pattern.id === "pluge");
  assert.equal(pluge?.kind, "pluge");
  if (pluge?.kind !== "pluge") return;
  assert.equal(pluge.field, "#000000");
  assert.equal(pluge.reference, "#ffffff");
  assert.deepEqual(
    pluge.bars.map((bar) => bar.code),
    [0, 2, 4],
  );
  assert.equal(pluge.bars[0]?.color, "#000000");
  assert.notEqual(pluge.bars[1]?.color, "#000000");

  const crush = patterns.find((pattern) => pattern.id === "black-crush");
  const clip = patterns.find((pattern) => pattern.id === "white-clip");
  assert.equal(crush?.kind, "steps");
  assert.equal(clip?.kind, "steps");
  if (crush?.kind !== "steps" || clip?.kind !== "steps") return;
  assert.deepEqual(crush.steps.map((step) => step.code).filter((code) => code === 0 || code === 16), [0, 16]);
  assert.deepEqual(clip.steps.map((step) => step.code).filter((code) => code === 235 || code === 255), [235, 255]);
  assert.equal(clip.steps.find((step) => step.code === 235)?.color, "#ebebeb");

  const ramp = patterns.find((pattern) => pattern.id === "gray-ramp");
  assert.equal(ramp?.kind, "ramp");
  if (ramp?.kind !== "ramp") return;
  assert.deepEqual(
    ramp.ticks.map((tick) => tick.code),
    [0, 16, 128, 235, 255],
  );
  assert.deepEqual(
    ramp.patches.map((patch) => patch.label),
    ["20%", "50%", "80%"],
  );
  assert.equal(ramp.patches[1]?.color, "#808080");
  assert.equal(rampColumnCode(0, 256), 0);
  assert.equal(rampColumnCode(255, 256), 255);
  assert.equal(rampColumnCode(128, 256), 128);
});

test("previews are local css and the ramp is painted in this folder", () => {
  for (const pattern of patterns) {
    const painted = Object.values(previewStyle(pattern)).join(" ");
    assert.ok(painted.length > 0, pattern.id);
    assert.doesNotMatch(painted, /https?:/i);
    assert.match(painted, /#(?:[0-9a-f]{6}|[0-9a-f]{3})/i);
  }
  const view = readFileSync(new URL("./pattern-view.tsx", import.meta.url), "utf8");
  assert.match(view, /<canvas/);
  assert.match(view, /rampColumnCode/);
  assert.doesNotMatch(view, /https?:/);
  assert.doesNotMatch(view, /from ["']\.\.\//);
});
