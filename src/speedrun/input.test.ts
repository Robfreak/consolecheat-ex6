import assert from "node:assert/strict";
import test from "node:test";
import { pollPadEdges, shortcutForKey, type PadSnapshot } from "./input.ts";

test("keyboard shortcuts map to the timer and ignore space in a field", () => {
  assert.equal(shortcutForKey(" "), "start-split");
  assert.equal(shortcutForKey("Spacebar"), "start-split");
  assert.equal(shortcutForKey("Backspace"), "undo");
  assert.equal(shortcutForKey("u"), "undo");
  assert.equal(shortcutForKey("U"), "undo");
  assert.equal(shortcutForKey("s"), "skip");
  assert.equal(shortcutForKey("S"), "skip");
  assert.equal(shortcutForKey("r"), "reset");
  assert.equal(shortcutForKey("R"), "reset");
  assert.equal(shortcutForKey("p"), "pause");
  assert.equal(shortcutForKey("P"), "pause");
  assert.equal(shortcutForKey("x"), null);
  assert.equal(shortcutForKey(" ", { repeat: true }), null);
  assert.equal(shortcutForKey(" ", { tag: "INPUT" }), null);
  assert.equal(shortcutForKey(" ", { tag: "textarea" }), null);
  assert.equal(shortcutForKey("s", { tag: "SELECT" }), null);
  assert.equal(shortcutForKey(" ", { tag: "BUTTON" }), null);
  assert.equal(shortcutForKey("r", { tag: "BUTTON" }), "reset");
  assert.equal(shortcutForKey(" ", { dialog: true }), null);
});

function pad(index: number, pressed: Partial<Record<number, boolean>>): PadSnapshot {
  const buttons = Array.from({ length: 16 }, (_, button) => ({ pressed: pressed[button] === true }));
  return { index, connected: true, buttons };
}

test("gamepad edges map cross, circle, square, and options once per press", () => {
  const memory = new Map<number, boolean[]>();
  assert.deepEqual(pollPadEdges([pad(0, { 0: true, 9: true })], memory), []);
  assert.deepEqual(pollPadEdges([pad(0, { 0: true, 9: true })], memory), []);
  assert.deepEqual(pollPadEdges([pad(0, {})], memory), []);
  assert.deepEqual(pollPadEdges([pad(0, { 0: true })], memory), ["start-split"]);
  assert.deepEqual(pollPadEdges([pad(0, { 0: true, 2: true })], memory), ["undo"]);
  assert.deepEqual(pollPadEdges([pad(0, { 1: true })], memory), ["skip"]);
  assert.deepEqual(pollPadEdges([pad(0, { 1: true, 9: true, 3: true })], memory), ["reset"]);
  assert.deepEqual(pollPadEdges([pad(0, { 3: true })], memory), []);

  const second = new Map<number, boolean[]>();
  pollPadEdges([pad(2, {}), pad(1, {})], second);
  assert.deepEqual(pollPadEdges([pad(2, { 0: true }), pad(1, { 0: true })], second), ["start-split"]);
  pollPadEdges([null], second);
  assert.equal(second.size, 0);
});
