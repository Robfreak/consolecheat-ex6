import assert from "node:assert/strict";
import test from "node:test";
import { shortcutBlocked, spriteShortcutFromKey } from "./keys.ts";

const plain = { metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

test("sprite shortcuts cover draw, playback, and frames", () => {
  assert.equal(spriteShortcutFromKey({ ...plain, key: "b" }), "pencil");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "e" }), "eraser");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "g" }), "fill");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "i" }), "eyedropper");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "x" }), "swap");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "z", ctrlKey: true }), "undo");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "z", metaKey: true, shiftKey: true }), "redo");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "y", ctrlKey: true }), "redo");
  assert.equal(spriteShortcutFromKey({ ...plain, key: " " }), "play");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "ArrowLeft" }), "prev");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "ArrowRight", shiftKey: true }), "moveRight");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "n" }), "add");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "d" }), "duplicate");
  assert.equal(spriteShortcutFromKey({ ...plain, key: "Delete" }), "remove");
  assert.equal(shortcutBlocked({ tagName: "INPUT" }, "b"), true);
  assert.equal(shortcutBlocked({ tagName: "BUTTON" }, " "), true);
  assert.equal(shortcutBlocked({ tagName: "BUTTON" }, "b"), false);
  assert.equal(shortcutBlocked({ tagName: "CANVAS" }, "b"), false);
});
