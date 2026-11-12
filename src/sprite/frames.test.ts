import assert from "node:assert/strict";
import test from "node:test";
import { getPixel, parseHex, strokeOnto } from "../draw/buffer.ts";
import { addEmptyFrame, deleteFrame, duplicateFrame, moveCurrent, moveFrame, paintCurrent, resizeSnapshot } from "./frames.ts";
import { canRedoSprite, canUndoSprite, commitSprite, createSpriteHistory, redoSprite, undoSprite } from "./history.ts";
import { MAX_FRAMES, emptySnapshot } from "./model.ts";

const red = parseHex("#ff004d");

test("frames add, duplicate, delete, and keep one", () => {
  let snap = emptySnapshot(16);
  const added = addEmptyFrame(snap);
  assert.equal(added.changed, true);
  assert.equal(added.snapshot.frames.length, 2);
  assert.equal(added.snapshot.index, 1);
  snap = added.snapshot;
  assert.ok(red);
  snap = paintCurrent(snap, (frame, size) => strokeOnto(size, frame, 1, 1, 1, 1, red, false));
  const copy = duplicateFrame(snap);
  assert.equal(copy.snapshot.frames.length, 3);
  assert.equal(copy.snapshot.index, 2);
  assert.equal(getPixel(16, copy.snapshot.frames[2] ?? new Uint8ClampedArray(), 1, 1).r, 255);
  const removed = deleteFrame(copy.snapshot);
  assert.equal(removed.snapshot.frames.length, 2);
  const last = deleteFrame({ ...removed.snapshot, frames: [removed.snapshot.frames[0] ?? new Uint8ClampedArray()], index: 0 });
  assert.equal(last.changed, false);
  assert.equal(last.reason, "min");
  assert.equal(last.snapshot.frames.length, 1);
});

test("frame count stops at 64", () => {
  let snap = emptySnapshot(16);
  for (let n = 1; n < MAX_FRAMES; n += 1) {
    const next = addEmptyFrame(snap);
    assert.equal(next.changed, true);
    snap = next.snapshot;
  }
  assert.equal(snap.frames.length, MAX_FRAMES);
  const capped = addEmptyFrame(snap);
  assert.equal(capped.changed, false);
  assert.equal(capped.reason, "cap");
  assert.equal(duplicateFrame(snap).reason, "cap");
});

test("reorder by drag index and by move buttons", () => {
  let snap = emptySnapshot(16);
  snap = addEmptyFrame(snap).snapshot;
  snap = addEmptyFrame(snap).snapshot;
  assert.ok(red);
  snap = paintCurrent(snap, (frame, size) => strokeOnto(size, frame, 0, 0, 0, 0, red, false));
  assert.equal(snap.index, 2);
  const moved = moveFrame(snap, 2, 0);
  assert.equal(moved.changed, true);
  assert.equal(moved.snapshot.index, 0);
  assert.equal(getPixel(16, moved.snapshot.frames[0] ?? new Uint8ClampedArray(), 0, 0).a, 255);
  const right = moveCurrent(moved.snapshot, 1);
  assert.equal(right.snapshot.index, 1);
  assert.equal(getPixel(16, right.snapshot.frames[1] ?? new Uint8ClampedArray(), 0, 0).a, 255);
  assert.equal(moveFrame(right.snapshot, 0, 0).changed, false);
  assert.equal(moveCurrent({ ...right.snapshot, index: 0 }, -1).changed, false);
});

test("resize uses nearest neighbour and undo covers draw and frame edits", () => {
  assert.ok(red);
  let history = createSpriteHistory(emptySnapshot(16));
  const drawn = paintCurrent(history.present, (frame, size) => strokeOnto(size, frame, 1, 2, 1, 2, red, false));
  history = commitSprite(history, drawn);
  assert.equal(getPixel(16, history.present.frames[0] ?? new Uint8ClampedArray(), 1, 2).a, 255);
  const grown = resizeSnapshot(history.present, 32);
  assert.ok(grown);
  assert.equal(getPixel(32, grown.frames[0] ?? new Uint8ClampedArray(), 2, 4).r, 255);
  assert.equal(getPixel(32, grown.frames[0] ?? new Uint8ClampedArray(), 3, 5).a, 255);
  assert.equal(getPixel(32, grown.frames[0] ?? new Uint8ClampedArray(), 0, 0).a, 0);
  history = commitSprite(history, grown);
  history = commitSprite(history, addEmptyFrame(history.present).snapshot);
  assert.equal(history.present.frames.length, 2);
  assert.equal(canUndoSprite(history), true);
  history = undoSprite(history);
  assert.equal(history.present.frames.length, 1);
  assert.equal(history.present.size, 32);
  history = undoSprite(history);
  assert.equal(history.present.size, 16);
  assert.equal(getPixel(16, history.present.frames[0] ?? new Uint8ClampedArray(), 1, 2).a, 255);
  history = undoSprite(history);
  assert.equal(getPixel(16, history.present.frames[0] ?? new Uint8ClampedArray(), 1, 2).a, 0);
  assert.equal(canUndoSprite(history), false);
  history = redoSprite(history);
  assert.equal(canRedoSprite(history), true);
  assert.equal(getPixel(16, history.present.frames[0] ?? new Uint8ClampedArray(), 1, 2).b, 77);
  const same = commitSprite(history, history.present);
  assert.equal(same, history);
});
