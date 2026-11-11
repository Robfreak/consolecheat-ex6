import assert from "node:assert/strict";
import test from "node:test";
import { canRedo, canUndo, commit, createHistory, HISTORY_LIMIT, redo, undo } from "./history.ts";
import { createBuffer, getPixel, parseHex, strokeOnto } from "./pixels.ts";

test("one history entry per stroke, then undo and redo", () => {
  const red = parseHex("#ff004d");
  assert.ok(red);
  let history = createHistory();
  const drawn = createBuffer();
  strokeOnto(drawn, 0, 0, 20, 8, red, false);
  history = commit(history, drawn);
  assert.equal(history.past.length, 1);
  assert.equal(canUndo(history), true);
  assert.equal(canRedo(history), false);
  assert.equal(getPixel(history.present, 0, 0).a, 255);

  const same = commit(history, history.present);
  assert.equal(same, history);

  history = undo(history);
  assert.equal(getPixel(history.present, 0, 0).a, 0);
  assert.equal(canRedo(history), true);
  history = redo(history);
  assert.equal(getPixel(history.present, 10, 4).a, 255);

  const other = createBuffer();
  strokeOnto(other, 0, 1, 0, 1, red, false);
  history = undo(history);
  history = commit(history, other);
  assert.equal(canRedo(history), false);
  assert.equal(getPixel(history.present, 0, 1).a, 255);
  assert.equal(getPixel(history.present, 0, 0).a, 0);
});

test("history keeps at most 100 entries and drops the oldest", () => {
  let history = createHistory();
  for (let step = 1; step <= HISTORY_LIMIT + 5; step += 1) {
    const buf = createBuffer();
    buf[0] = step;
    history = commit(history, buf);
  }
  assert.equal(history.past.length, HISTORY_LIMIT);
  assert.equal(history.present[0], HISTORY_LIMIT + 5);
  for (let n = 0; n < HISTORY_LIMIT; n += 1) history = undo(history);
  assert.equal(canUndo(history), false);
  assert.equal(history.present[0], 5);
});
