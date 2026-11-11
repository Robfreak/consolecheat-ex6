import assert from "node:assert/strict";
import test from "node:test";
import {
  SAVE_KEY,
  emptyTournament,
  loadTournament,
  parseTournament,
  resetTournament,
  saveTournament,
  type StorageLike,
} from "./storage.ts";

function memory(initial?: Record<string, string>): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial ?? {}));
  return {
    data,
    getItem(key) {
      return data.has(key) ? (data.get(key) ?? null) : null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
  };
}

const live = {
  version: 1,
  name: "Sofa",
  mode: "liga",
  doubleRound: true,
  points: { win: 3, draw: 1, loss: 0 },
  players: [
    { id: "paaaaaaaa", name: "Ada" },
    { id: "pbbbbbbbb", name: "Bea" },
  ],
  phase: "live",
  order: ["pbbbbbbbb", "paaaaaaaa"],
  scores: { r0m0: { home: 2, away: 2 } },
};

test("a tournament round-trips and a reset removes only this key", () => {
  const store = memory({
    "consolecheat-lang": "en",
    "consolecheat-theme": "light",
    "consolecheat-ex6-merkliste-v1": "keep",
  });
  assert.equal(SAVE_KEY, "consolecheat-turnier-v1");
  assert.deepEqual(loadTournament(store), emptyTournament());
  assert.equal(saveTournament(store, live), true);
  assert.deepEqual(loadTournament(store), live);
  assert.equal(resetTournament(store), true);
  assert.equal(store.data.has(SAVE_KEY), false);
  assert.equal(store.data.get("consolecheat-lang"), "en");
  assert.equal(store.data.get("consolecheat-theme"), "light");
  assert.equal(store.data.get("consolecheat-ex6-merkliste-v1"), "keep");
  assert.deepEqual(loadTournament(store), emptyTournament());
});

test("corrupt data falls back to an empty tournament and does not throw", () => {
  for (const raw of [
    "{",
    "null",
    "[]",
    JSON.stringify({ version: 2, name: "x" }),
    JSON.stringify({ ...live, version: 1, players: "no" }),
    JSON.stringify({ ...live, players: [{ id: "paaaaaaaa", name: "Ada" }, { id: "paaaaaaaa", name: "Bea" }] }),
    JSON.stringify({
      ...live,
      players: [
        { id: "paaaaaaaa", name: "Ada" },
        { id: "pbbbbbbbb", name: "Ada" },
      ],
    }),
    JSON.stringify({ ...live, phase: "live", order: ["paaaaaaaa"] }),
    JSON.stringify({ ...live, mode: "cup" }),
    JSON.stringify({ ...live, scores: { r0m0: { home: -1, away: 1 } } }),
  ]) {
    assert.deepEqual(parseTournament(raw), emptyTournament(), raw.slice(0, 80));
  }
  const dropped = parseTournament(JSON.stringify({ ...live, mode: "ko", scores: { r0m0: { home: 1, away: 1 }, r0m1: { home: 2, away: 0 } } }));
  assert.equal(dropped.phase, "live");
  assert.equal(dropped.scores.r0m0, undefined);
  assert.deepEqual(dropped.scores.r0m1, { home: 2, away: 0 });

  const throwing: StorageLike = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
    removeItem() {
      throw new Error("blocked");
    },
  };
  assert.deepEqual(loadTournament(throwing), emptyTournament());
  assert.equal(saveTournament(throwing, live), false);
  assert.equal(resetTournament(throwing), false);
});
