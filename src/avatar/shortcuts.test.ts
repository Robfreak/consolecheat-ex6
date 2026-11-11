import assert from "node:assert/strict";
import test from "node:test";
import { isTypingTarget, shortcutFromKey } from "./shortcuts.ts";

const plain = { metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

test("tool keys and undo or redo shortcuts", () => {
  assert.equal(shortcutFromKey({ ...plain, key: "b" }), "pencil");
  assert.equal(shortcutFromKey({ ...plain, key: "E" }), "eraser");
  assert.equal(shortcutFromKey({ ...plain, key: "g" }), "fill");
  assert.equal(shortcutFromKey({ ...plain, key: "i" }), "eyedropper");
  assert.equal(shortcutFromKey({ ...plain, key: "x" }), "swap");
  assert.equal(shortcutFromKey({ ...plain, key: "z", ctrlKey: true }), "undo");
  assert.equal(shortcutFromKey({ ...plain, key: "z", metaKey: true }), "undo");
  assert.equal(shortcutFromKey({ ...plain, key: "Z", ctrlKey: true, shiftKey: true }), "redo");
  assert.equal(shortcutFromKey({ ...plain, key: "z", metaKey: true, shiftKey: true }), "redo");
  assert.equal(shortcutFromKey({ ...plain, key: "y", ctrlKey: true }), "redo");
  assert.equal(shortcutFromKey({ ...plain, key: "y", metaKey: true }), "redo");
  assert.equal(shortcutFromKey({ ...plain, key: "b", ctrlKey: true }), null);
  assert.equal(shortcutFromKey({ ...plain, key: "b", altKey: true }), null);
  assert.equal(shortcutFromKey({ ...plain, key: "q" }), null);
});

test("shortcuts ignore text fields", () => {
  assert.equal(isTypingTarget({ tagName: "INPUT" }), true);
  assert.equal(isTypingTarget({ tagName: "textarea" }), true);
  assert.equal(isTypingTarget({ tagName: "SELECT" }), true);
  assert.equal(isTypingTarget({ tagName: "div", isContentEditable: true }), true);
  assert.equal(isTypingTarget({ tagName: "CANVAS" }), false);
  assert.equal(isTypingTarget(null), false);
});
