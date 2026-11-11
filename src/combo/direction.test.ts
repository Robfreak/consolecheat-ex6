import assert from "node:assert/strict";
import test from "node:test";
import { axisToDirection, directionFromKeys, dpadToDirection, padDirection, stickToDirection } from "./direction.ts";

test("keyboard directions resolve WASD, arrows, diagonals, and cancelled opposites", () => {
  assert.equal(directionFromKeys([]), null);
  assert.equal(directionFromKeys(["s"]), 2);
  assert.equal(directionFromKeys(["S"]), 2);
  assert.equal(directionFromKeys(["ArrowDown"]), 2);
  assert.equal(directionFromKeys(["w"]), 8);
  assert.equal(directionFromKeys(["a"]), 4);
  assert.equal(directionFromKeys(["d"]), 6);
  assert.equal(directionFromKeys(["ArrowLeft"]), 4);
  assert.equal(directionFromKeys(["ArrowRight"]), 6);
  assert.equal(directionFromKeys(["ArrowUp"]), 8);

  assert.equal(directionFromKeys(["s", "d"]), 3);
  assert.equal(directionFromKeys(["s", "a"]), 1);
  assert.equal(directionFromKeys(["w", "d"]), 9);
  assert.equal(directionFromKeys(["w", "a"]), 7);
  assert.equal(directionFromKeys(["ArrowDown", "ArrowLeft"]), 1);
  assert.equal(directionFromKeys(["ArrowUp", "ArrowRight"]), 9);
  assert.equal(directionFromKeys(["w", "ArrowRight"]), 9);
  assert.equal(directionFromKeys(["s", "ArrowDown"]), 2);

  assert.equal(directionFromKeys(["w", "s"]), null);
  assert.equal(directionFromKeys(["a", "d"]), null);
  assert.equal(directionFromKeys(["w", "s", "d"]), 6);
  assert.equal(directionFromKeys(["q"]), null);
});

test("the stick uses a deadzone and maps the eight directions, with negative Y as up", () => {
  assert.equal(stickToDirection(0, 0), null);
  assert.equal(stickToDirection(0.5, 0, 0.5), null);
  assert.equal(stickToDirection(-0.5, 0.5, 0.5), null);
  assert.equal(stickToDirection(0.49, 0.49, 0.5), null);
  assert.equal(stickToDirection(0.2, 0, 0.5), null);
  assert.equal(stickToDirection(Number.NaN, 1), null);

  assert.equal(stickToDirection(0.51, 0, 0.5), 6);
  assert.equal(stickToDirection(-0.8, 0), 4);
  assert.equal(stickToDirection(0, 0.8), 2);
  assert.equal(stickToDirection(0, -0.8), 8);
  assert.equal(stickToDirection(0.8, 0.8), 3);
  assert.equal(stickToDirection(-0.9, 0.9), 1);
  assert.equal(stickToDirection(0.9, -0.9), 9);
  assert.equal(stickToDirection(-0.9, -0.9), 7);
  assert.equal(stickToDirection(0.2, 0.9, 0.5), 2);
  assert.equal(stickToDirection(-0.9, 0.2, 0.5), 4);
});

test("the D-pad resolves diagonals, cancels opposites, and wins over the stick", () => {
  const buttons = (down: number[]) => Array.from({ length: 16 }, (_, index) => ({ pressed: down.includes(index) }));
  assert.equal(dpadToDirection(buttons([])), null);
  assert.equal(dpadToDirection(buttons([13])), 2);
  assert.equal(dpadToDirection(buttons([12])), 8);
  assert.equal(dpadToDirection(buttons([14])), 4);
  assert.equal(dpadToDirection(buttons([15])), 6);
  assert.equal(dpadToDirection(buttons([13, 15])), 3);
  assert.equal(dpadToDirection(buttons([13, 14])), 1);
  assert.equal(dpadToDirection(buttons([12, 14])), 7);
  assert.equal(dpadToDirection(buttons([12, 15])), 9);
  assert.equal(dpadToDirection(buttons([12, 13])), null);
  assert.equal(dpadToDirection(buttons([14, 15])), null);

  assert.equal(padDirection(buttons([14]), [0.9, 0]), 4);
  assert.equal(padDirection(buttons([12, 13]), [0.9, 0]), null);
  assert.equal(padDirection(buttons([]), [0.9, 0.9]), 3);
  assert.equal(padDirection(buttons([]), [0.1, 0.1]), null);
  assert.equal(axisToDirection({ up: true, down: false, left: false, right: true }), 9);
});
