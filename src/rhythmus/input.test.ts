import assert from "node:assert/strict";
import test from "node:test";
import {
  keyboardLane,
  laneForButton,
  laneForKey,
  lanes,
  pollGamepad,
  risingLanes,
  type PadSnapshot,
} from "./input.ts";

function pad(index: number, pressed: number[]): PadSnapshot {
  const buttons = Array.from({ length: 16 }, () => ({ pressed: false }));
  for (const button of pressed) {
    const slot = buttons[button];
    if (slot) slot.pressed = true;
  }
  return { index, connected: true, buttons };
}

test("keyboard lanes are D F J K and the arrow keys", () => {
  assert.deepEqual(
    lanes.map((lane) => lane.key),
    ["d", "f", "j", "k"],
  );
  assert.equal(laneForKey("d"), 0);
  assert.equal(laneForKey("D"), 0);
  assert.equal(laneForKey("f"), 1);
  assert.equal(laneForKey("F"), 1);
  assert.equal(laneForKey("j"), 2);
  assert.equal(laneForKey("J"), 2);
  assert.equal(laneForKey("k"), 3);
  assert.equal(laneForKey("K"), 3);
  assert.equal(laneForKey("ArrowUp"), 0);
  assert.equal(laneForKey("ArrowRight"), 1);
  assert.equal(laneForKey("ArrowDown"), 2);
  assert.equal(laneForKey("ArrowLeft"), 3);
  assert.equal(laneForKey("a"), null);
  assert.equal(laneForKey(" "), null);
  assert.equal(keyboardLane("d", { repeat: true }), null);
  assert.equal(keyboardLane("d", { tag: "INPUT" }), null);
  assert.equal(keyboardLane("d", { tag: "BUTTON" }), 0);
});

test("gamepad face buttons and the D-pad map to the same lanes", () => {
  assert.equal(laneForButton(3), 0);
  assert.equal(laneForButton(12), 0);
  assert.equal(laneForButton(1), 1);
  assert.equal(laneForButton(15), 1);
  assert.equal(laneForButton(0), 2);
  assert.equal(laneForButton(13), 2);
  assert.equal(laneForButton(2), 3);
  assert.equal(laneForButton(14), 3);
  assert.equal(laneForButton(4), null);
  assert.equal(laneForButton(11), null);

  const idle = [false, false, false, false, false, false, false, false];
  const cross = [...idle];
  cross[4] = true;
  assert.deepEqual(risingLanes(idle, cross), [2]);
  assert.deepEqual(risingLanes(cross, cross), []);

  const memory = new Map<number, boolean[]>();
  assert.deepEqual(pollGamepad([pad(0, [0])], memory), []);
  assert.deepEqual(pollGamepad([pad(0, [0])], memory), []);
  assert.deepEqual(pollGamepad([pad(0, [])], memory), []);
  assert.deepEqual(pollGamepad([pad(0, [0, 3])], memory), [0, 2]);
  assert.deepEqual(pollGamepad([pad(2, [1]), pad(0, [])], memory), []);
  assert.deepEqual(pollGamepad([null, pad(1, [2])], memory), []);
  assert.deepEqual(pollGamepad([null, pad(1, [])], memory), []);
  assert.deepEqual(pollGamepad([null, pad(1, [2])], memory), [3]);
});
