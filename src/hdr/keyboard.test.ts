import assert from "node:assert/strict";
import test from "node:test";
import { shortcutResult, stepIndex, type ShortcutContext } from "./keyboard.ts";
import { patterns } from "./patterns.ts";

const home: ShortcutContext = {
  page: "home",
  patternOpen: false,
  fullscreen: false,
  patternCount: patterns.length,
  typing: false,
  repeat: false,
};

test("digit keys open a brightness pattern and Esc leaves fullscreen first", () => {
  assert.deepEqual(shortcutResult("1", "", home), { type: "open", index: 0 });
  assert.deepEqual(shortcutResult("6", "Digit6", home), { type: "open", index: 5 });
  assert.equal(patterns[5]?.id, "gray-ramp");
  assert.equal(shortcutResult("0", "", home).type, "ignore");
  assert.equal(shortcutResult("7", "", home).type, "ignore");
  assert.equal(shortcutResult("1", "", { ...home, repeat: true }).type, "ignore");
  assert.equal(shortcutResult("1", "", { ...home, typing: true }).type, "ignore");

  const open = { ...home, patternOpen: true };
  assert.deepEqual(shortcutResult("Escape", "", { ...open, fullscreen: true }), { type: "exit-fullscreen" });
  assert.deepEqual(shortcutResult("Escape", "", open), { type: "close-pattern" });
  assert.deepEqual(shortcutResult("Escape", "", { ...home, page: "datenschutz" }), { type: "close-page" });
  assert.equal(shortcutResult("Escape", "", home).type, "ignore");
  assert.deepEqual(shortcutResult("ArrowRight", "", open), { type: "step", direction: "next" });
  assert.deepEqual(shortcutResult("ArrowUp", "", open), { type: "step", direction: "prev" });
  assert.equal(stepIndex(0, "prev", patterns.length), patterns.length - 1);
  assert.equal(stepIndex(patterns.length - 1, "next", patterns.length), 0);
});
