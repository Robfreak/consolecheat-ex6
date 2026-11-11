import assert from "node:assert/strict";
import test from "node:test";
import {
  assignPads,
  keyboardPress,
  pollPads,
  readNavigatorPads,
  symbolForButton,
  type Pad,
} from "./input.ts";

function pad(index: number, id: string, down: number[], connected = true): Pad {
  const buttons = Array.from({ length: 17 }, (_, button) => ({ pressed: down.includes(button) }));
  return { index, id, connected, buttons };
}

test("keyboard match mode maps WASD and IJKL or arrows to the face symbols", () => {
  assert.deepEqual(keyboardPress("w", "match"), { player: "p1", input: "triangle" });
  assert.deepEqual(keyboardPress("W", "match"), { player: "p1", input: "triangle" });
  assert.deepEqual(keyboardPress("a", "match"), { player: "p1", input: "square" });
  assert.deepEqual(keyboardPress("A", "match"), { player: "p1", input: "square" });
  assert.deepEqual(keyboardPress("s", "match"), { player: "p1", input: "cross" });
  assert.deepEqual(keyboardPress("d", "match"), { player: "p1", input: "circle" });
  assert.deepEqual(keyboardPress("i", "match"), { player: "p2", input: "triangle" });
  assert.deepEqual(keyboardPress("j", "match"), { player: "p2", input: "square" });
  assert.deepEqual(keyboardPress("k", "match"), { player: "p2", input: "cross" });
  assert.deepEqual(keyboardPress("l", "match"), { player: "p2", input: "circle" });
  assert.deepEqual(keyboardPress("L", "match"), { player: "p2", input: "circle" });
  assert.deepEqual(keyboardPress("ArrowUp", "match"), { player: "p2", input: "triangle" });
  assert.deepEqual(keyboardPress("ArrowLeft", "match"), { player: "p2", input: "square" });
  assert.deepEqual(keyboardPress("ArrowDown", "match"), { player: "p2", input: "cross" });
  assert.deepEqual(keyboardPress("ArrowRight", "match"), { player: "p2", input: "circle" });
  assert.equal(keyboardPress("q", "match"), null);
  assert.equal(keyboardPress("a", "match", { repeat: true }), null);
  assert.equal(keyboardPress("a", "match", { tag: "INPUT" }), null);
  assert.equal(keyboardPress("l", "match", { tag: "SELECT" }), null);
  assert.equal(keyboardPress("s", "match", { tag: "TEXTAREA" }), null);
});

test("easy mode is one key per player: A and L, and other keys do not count", () => {
  assert.deepEqual(keyboardPress("a", "easy"), { player: "p1", input: "any" });
  assert.deepEqual(keyboardPress("A", "easy"), { player: "p1", input: "any" });
  assert.deepEqual(keyboardPress("l", "easy"), { player: "p2", input: "any" });
  assert.deepEqual(keyboardPress("L", "easy"), { player: "p2", input: "any" });
  assert.equal(keyboardPress("w", "easy"), null);
  assert.equal(keyboardPress("s", "easy"), null);
  assert.equal(keyboardPress("d", "easy"), null);
  assert.equal(keyboardPress("k", "easy"), null);
  assert.equal(keyboardPress("ArrowDown", "easy"), null);
  assert.equal(keyboardPress("a", "easy", { repeat: true }), null);
});

test("standard gamepad buttons map to cross, circle, square, triangle", () => {
  assert.equal(symbolForButton(0), "cross");
  assert.equal(symbolForButton(1), "circle");
  assert.equal(symbolForButton(2), "square");
  assert.equal(symbolForButton(3), "triangle");
  assert.equal(symbolForButton(4), null);
  assert.equal(symbolForButton(-1), null);
});

test("getGamepads assigns the first connected pad to player 1 and the second to player 2", () => {
  const slots: (Pad | null)[] = [null, pad(1, "Pad B", []), pad(0, "Pad A", [])];
  const nav = { getGamepads: () => slots };
  const read = readNavigatorPads(nav);
  assert.equal(assignPads(read).p1?.id, "Pad A");
  assert.equal(assignPads(read).p2?.id, "Pad B");
  assert.equal(assignPads([null, pad(3, "Only", [])]).p1?.id, "Only");
  assert.equal(assignPads([null, pad(3, "Only", [])]).p2, null);
  assert.equal(assignPads([pad(0, "Gone", [], false), pad(1, "Here", [])]).p1?.id, "Here");

  const memory = new Map<number, boolean[]>();
  assert.deepEqual(pollPads(readNavigatorPads(nav), memory, "match"), []);
  slots[2] = pad(0, "Pad A", [0]);
  assert.deepEqual(pollPads(readNavigatorPads(nav), memory, "match"), [{ player: "p1", input: "cross" }]);
  assert.deepEqual(pollPads(readNavigatorPads(nav), memory, "match"), []);
  slots[1] = pad(1, "Pad B", [2]);
  assert.deepEqual(pollPads(readNavigatorPads(nav), memory, "match"), [{ player: "p2", input: "square" }]);
  slots[2] = pad(0, "Pad A", [4]);
  assert.deepEqual(pollPads(readNavigatorPads(nav), memory, "match"), []);
});

test("easy mode treats any face button as a reaction, and a reconnect does not repeat a held button", () => {
  const slots: (Pad | null)[] = [pad(0, "Pad A", []), pad(1, "Pad B", [])];
  const nav = { getGamepads: () => slots };
  const memory = new Map<number, boolean[]>();
  pollPads(readNavigatorPads(nav), memory, "easy");
  slots[1] = pad(1, "Pad B", [3]);
  assert.deepEqual(pollPads(readNavigatorPads(nav), memory, "easy"), [{ player: "p2", input: "any" }]);

  slots[0] = null;
  slots[1] = null;
  pollPads(readNavigatorPads(nav), memory, "match");
  assert.equal(memory.size, 0);
  slots[0] = pad(0, "Pad A", [1]);
  assert.deepEqual(pollPads(readNavigatorPads(nav), memory, "match"), []);
  slots[0] = pad(0, "Pad A", []);
  pollPads(readNavigatorPads(nav), memory, "match");
  slots[0] = pad(0, "Pad A", [1]);
  assert.deepEqual(pollPads(readNavigatorPads(nav), memory, "match"), [{ player: "p1", input: "circle" }]);
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
