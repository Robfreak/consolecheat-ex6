import assert from "node:assert/strict";
import test from "node:test";
import { buttonFromKey, eventsFromKeys, isTypingTarget, pollPad, pollPads, readNavigatorPads, type PadSnapshot } from "./input.ts";

function pad(down: number[] = [], axes: number[] = [0, 0], index = 0, connected = true): PadSnapshot {
  const buttons = Array.from({ length: 17 }, (_, button) => ({ pressed: down.includes(button) }));
  return { index, id: `Pad ${index}`, connected, buttons, axes };
}

test("both keyboard layouts map to square, triangle, cross, and circle", () => {
  assert.equal(buttonFromKey("j", "jkli"), "square");
  assert.equal(buttonFromKey("J", "jkli"), "square");
  assert.equal(buttonFromKey("k", "jkli"), "triangle");
  assert.equal(buttonFromKey("l", "jkli"), "cross");
  assert.equal(buttonFromKey("i", "jkli"), "circle");
  assert.equal(buttonFromKey("u", "jkli"), null);

  assert.equal(buttonFromKey("u", "uijk"), "square");
  assert.equal(buttonFromKey("U", "uijk"), "square");
  assert.equal(buttonFromKey("i", "uijk"), "triangle");
  assert.equal(buttonFromKey("j", "uijk"), "cross");
  assert.equal(buttonFromKey("k", "uijk"), "circle");
  assert.equal(buttonFromKey("l", "uijk"), null);
  assert.equal(isTypingTarget("INPUT"), true);
  assert.equal(isTypingTarget("TEXTAREA"), true);
  assert.equal(isTypingTarget("SELECT"), true);
  assert.equal(isTypingTarget("BUTTON"), false);
});

test("held keys resolve diagonals on the way from down to forward, and a text field is ignored", () => {
  let state = eventsFromKeys({ held: ["s"], previous: null, layout: "jkli", timeMs: 0 });
  assert.equal(state.direction, 2);
  assert.equal(state.events[0]?.direction, 2);

  state = eventsFromKeys({ held: ["s", "d"], previous: state.direction, layout: "jkli", timeMs: 30 });
  assert.equal(state.direction, 3);
  assert.equal(state.events[0]?.direction, 3);

  state = eventsFromKeys({ held: ["d"], previous: state.direction, layout: "jkli", timeMs: 60 });
  assert.equal(state.direction, 6);

  state = eventsFromKeys({ held: ["d"], previous: 6, keyDown: "j", layout: "jkli", timeMs: 90 });
  assert.equal(state.events[0]?.button, "square");
  assert.equal(state.events[0]?.heldDirection, 6);
  assert.equal(state.events[0]?.direction, undefined);

  const typed = eventsFromKeys({ held: ["s"], previous: null, keyDown: "j", layout: "jkli", timeMs: 0, typing: true });
  assert.deepEqual(typed.events, []);
  assert.equal(typed.direction, null);

  const repeat = eventsFromKeys({ held: ["j"], previous: null, keyDown: "j", repeat: true, layout: "jkli", timeMs: 0 });
  assert.deepEqual(repeat.events, []);

  const arrows = eventsFromKeys({ held: ["ArrowDown", "ArrowRight"], previous: null, layout: "uijk", timeMs: 0 });
  assert.equal(arrows.direction, 3);
  const other = eventsFromKeys({ held: ["ArrowUp"], previous: 3, keyDown: "u", layout: "uijk", timeMs: 20 });
  assert.equal(other.events[0]?.button, "square");
  assert.equal(other.events[0]?.direction, 8);
});

test("gamepad edges: seed, D-pad diagonal path, face buttons, and a same-poll direction plus button", () => {
  let memory = new Map();
  let polled = pollPads([pad()], memory, 0);
  assert.deepEqual(polled.events, []);
  memory = polled.memory;

  polled = pollPads([pad([13])], memory, 16);
  assert.equal(polled.events.length, 1);
  assert.equal(polled.events[0]?.direction, 2);
  memory = polled.memory;

  polled = pollPads([pad([13, 15])], memory, 32);
  assert.equal(polled.events[0]?.direction, 3);
  memory = polled.memory;

  polled = pollPads([pad([15])], memory, 48);
  assert.equal(polled.events[0]?.direction, 6);
  assert.equal(polled.events[0]?.button, undefined);
  memory = polled.memory;

  polled = pollPads([pad([15])], memory, 64);
  assert.deepEqual(polled.events, []);
  memory = polled.memory;

  polled = pollPads([pad([15, 2])], memory, 80);
  assert.equal(polled.events.length, 1);
  assert.equal(polled.events[0]?.button, "square");
  assert.equal(polled.events[0]?.heldDirection, 6);
  memory = polled.memory;

  polled = pollPads([pad([15, 2])], memory, 96);
  assert.deepEqual(polled.events, []);
  memory = polled.memory;

  polled = pollPads([pad([15])], memory, 112);
  assert.deepEqual(polled.events, []);
  memory = polled.memory;

  polled = pollPads([pad([15, 0])], memory, 128);
  assert.equal(polled.events[0]?.button, "cross");

  const seeded = pollPads([pad([0])], new Map(), 0);
  assert.deepEqual(seeded.events, []);
  const released = pollPads([pad()], seeded.memory, 10);
  const again = pollPads([pad([0])], released.memory, 20);
  assert.equal(again.events[0]?.button, "cross");
});

test("a stick outside the deadzone changes direction, and a disconnect reseeds", () => {
  let memory = new Map();
  let polled = pollPads([pad([], [0, 0])], memory, 0);
  memory = polled.memory;
  polled = pollPads([pad([], [0, 0.9])], memory, 16);
  assert.equal(polled.events[0]?.direction, 2);
  memory = polled.memory;
  polled = pollPads([pad([], [0.2, 0.9])], memory, 32);
  assert.deepEqual(polled.events, []);
  memory = polled.memory;
  polled = pollPads([pad([], [0.9, 0.9])], memory, 48);
  assert.equal(polled.events[0]?.direction, 3);

  const gone = pollPads([pad([], [0.9, 0.9], 0, false)], polled.memory, 64);
  assert.equal(gone.memory.size, 0);
  const returned = pollPads([pad([12])], gone.memory, 80);
  assert.deepEqual(returned.events, []);
  const moved = pollPads([pad()], returned.memory, 96);
  assert.equal(moved.events[0]?.direction, null);
});

test("the same poll can carry a new direction and a new face button, and the first pad wins", () => {
  const memory = new Map();
  const seeded = pollPad({ buttons: pad().buttons, axes: [0, 0] }, null, 0);
  const both = pollPad({ buttons: pad([15, 3]).buttons, axes: [0, 0] }, seeded.memory, 20);
  assert.equal(both.events.length, 1);
  assert.equal(both.events[0]?.direction, 6);
  assert.equal(both.events[0]?.button, "triangle");

  const pads = pollPads([null, pad([13], [0, 0], 2), pad([15], [0, 0], 1)], memory, 0);
  assert.deepEqual(pads.events, []);
  const next = pollPads([null, pad([12], [0, 0], 2), pad([], [0, 0], 1)], pads.memory, 16);
  assert.equal(next.events[0]?.direction, null);
  assert.equal(next.memory.has(1), true);
  assert.equal(next.memory.has(2), false);
});

test("a missing or throwing getGamepads reads as no pads", () => {
  assert.deepEqual(readNavigatorPads({}), []);
  assert.deepEqual(
    readNavigatorPads({
      getGamepads() {
        throw new Error("nope");
      },
    }),
    [],
  );
  assert.deepEqual(readNavigatorPads({ getGamepads: () => null }), []);
});
