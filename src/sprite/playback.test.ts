import assert from "node:assert/strict";
import test from "node:test";
import { frameIndexAt } from "./playback.ts";

test("preview frame index follows fps for loop and ping-pong", () => {
  const step = 1000 / 8;
  assert.equal(frameIndexAt(0, 8, 4, "loop"), 0);
  assert.equal(frameIndexAt(step - 1, 8, 4, "loop"), 0);
  assert.equal(frameIndexAt(step, 8, 4, "loop"), 1);
  assert.equal(frameIndexAt(step * 4, 8, 4, "loop"), 0);
  assert.equal(frameIndexAt(step * 5, 8, 4, "loop"), 1);
  assert.equal(frameIndexAt(-10, 8, 4, "loop"), 0);
  assert.equal(frameIndexAt(step * 3, 8, 1, "loop"), 0);

  assert.deepEqual(
    [0, 1, 2, 3, 4, 5, 6].map((n) => frameIndexAt(step * n, 8, 4, "pingpong")),
    [0, 1, 2, 3, 2, 1, 0],
  );
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((n) => frameIndexAt(1000 * n, 1, 3, "pingpong")),
    [0, 1, 2, 1, 0],
  );
});
