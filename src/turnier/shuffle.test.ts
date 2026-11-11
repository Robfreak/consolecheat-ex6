import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createId, nextUnit, shuffleIds, type RandomSource } from "./shuffle.ts";

function permutation(source: readonly string[], result: readonly string[]): boolean {
  if (source.length !== result.length) return false;
  const counts = new Map<string, number>();
  for (const item of source) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of result) {
    const left = counts.get(item);
    if (!left) return false;
    counts.set(item, left - 1);
  }
  return [...counts.values()].every((count) => count === 0);
}

test("shuffle is a permutation and the random source decides the order", () => {
  for (let count = 2; count <= 16; count += 1) {
    const items = Array.from({ length: count }, (_, index) => `p${index}`);
    assert.equal(permutation(items, shuffleIds(items, () => 0)), true);
    assert.equal(permutation(items, shuffleIds(items, () => 0.999)), true);
  }
  const items = ["a", "b", "c", "d", "e"];
  assert.deepEqual(shuffleIds(items, () => 0), ["b", "c", "d", "e", "a"]);
  assert.deepEqual(shuffleIds(items, () => 0.999), items);
});

test("the draw reads crypto.getRandomValues", () => {
  const source = readFileSync(new URL("./shuffle.ts", import.meta.url), "utf8");
  assert.match(source, /getRandomValues/);
  const seen: Uint32Array[] = [];
  const fake: RandomSource = {
    getRandomValues(buffer) {
      seen.push(buffer);
      buffer[0] = 0x80000000;
      return buffer;
    },
  };
  assert.equal(nextUnit(fake), 0.5);
  assert.equal(seen.length, 1);
  assert.equal(seen[0]?.length, 1);

  const calls: number[] = [];
  const order = shuffleIds(["a", "b", "c", "d"], () => {
    calls.push(1);
    return nextUnit(fake);
  });
  assert.equal(permutation(["a", "b", "c", "d"], order), true);
  assert.ok(calls.length >= 3);

  const id = createId(() => 0);
  assert.equal(id, "paaaaaaaa");
  assert.match(createId(nextUnit), /^p[a-z0-9]{8}$/);
});
