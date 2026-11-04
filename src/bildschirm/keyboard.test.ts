import assert from "node:assert/strict";
import test from "node:test";
import { gridMove, indexForNumberKey, isTypingTarget, shortcutResult, stepIndex, type ShortcutContext } from "./keyboard.ts";
import { patterns } from "./patterns.ts";

const home: ShortcutContext = {
  page: "home",
  patternOpen: false,
  fullscreen: false,
  patternCount: patterns.length,
  typing: false,
  repeat: false,
};

test("number keys and numpad jump to the first ten patterns", () => {
  assert.equal(indexForNumberKey("1", patterns.length), 0);
  assert.equal(indexForNumberKey("0", patterns.length), 9);
  assert.equal(indexForNumberKey("Numpad5", patterns.length), 4);
  assert.equal(indexForNumberKey("Digit9", patterns.length), 8);
  assert.equal(indexForNumberKey("6", 5), null);
  assert.equal(shortcutResult("3", "", home).type, "open");
  const opened = shortcutResult("0", "Digit0", home);
  assert.deepEqual(opened, { type: "open", index: 9 });
  assert.equal(patterns[9]?.id, "gradient-v");
  assert.equal(shortcutResult("3", "", { ...home, repeat: true }).type, "ignore");
  assert.equal(shortcutResult("a", "KeyA", home).type, "ignore");
});

test("arrows move the open pattern and wrap, and the list keeps its own grid", () => {
  const open = { ...home, patternOpen: true };
  assert.deepEqual(shortcutResult("ArrowRight", "", open), { type: "step", direction: "next" });
  assert.deepEqual(shortcutResult("ArrowDown", "", open), { type: "step", direction: "next" });
  assert.deepEqual(shortcutResult("ArrowLeft", "", open), { type: "step", direction: "prev" });
  assert.deepEqual(shortcutResult("ArrowUp", "", open), { type: "step", direction: "prev" });
  assert.equal(shortcutResult("ArrowRight", "", home).type, "ignore");
  assert.equal(stepIndex(0, "prev", patterns.length), patterns.length - 1);
  assert.equal(stepIndex(patterns.length - 1, "next", patterns.length), 0);
  assert.equal(gridMove(0, "ArrowRight", 1, 15), 1);
  assert.equal(gridMove(0, "ArrowDown", 1, 15), 1);
  assert.equal(gridMove(0, "ArrowDown", 3, 15), 3);
  assert.equal(gridMove(1, "ArrowUp", 3, 15), 0);
  assert.equal(gridMove(14, "ArrowRight", 3, 15), 14);
  assert.equal(gridMove(0, "Enter", 3, 15), null);
});

test("escape leaves fullscreen before the pattern, and ignores typing targets", () => {
  const open = { ...home, patternOpen: true, fullscreen: true };
  assert.equal(shortcutResult("Escape", "", open).type, "exit-fullscreen");
  assert.equal(shortcutResult("Escape", "", { ...open, fullscreen: false }).type, "close-pattern");
  assert.equal(shortcutResult("Escape", "", home).type, "ignore");
  assert.equal(shortcutResult("Escape", "", { ...home, page: "datenschutz" }).type, "close-page");
  assert.equal(shortcutResult("1", "", { ...home, page: "impressum" }).type, "ignore");
  assert.equal(isTypingTarget("select"), true);
  assert.equal(shortcutResult("ArrowDown", "", { ...open, typing: true }).type, "ignore");
});
