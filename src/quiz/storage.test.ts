import assert from "node:assert/strict";
import test from "node:test";
import {
  BEST_KEY,
  clearQuizData,
  considerBest,
  emptyBest,
  LANG_KEY,
  loadBest,
  parseBest,
  resetBest,
  saveBest,
  THEME_KEY,
  type StorageLike,
} from "./storage.ts";

function memory(initial: Record<string, string> = {}): StorageLike & { dump(): Record<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? (data.get(key) as string) : null),
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
    dump: () => Object.fromEntries(data),
  };
}

test("the best score key is consolecheat-quiz-best-v1 and reset removes only that key", () => {
  assert.equal(BEST_KEY, "consolecheat-quiz-best-v1");
  const store = memory({
    [BEST_KEY]: JSON.stringify({ version: 1, bestScore: 40, bestStreak: 2 }),
    [LANG_KEY]: "en",
    [THEME_KEY]: "light",
    "consolecheat-ex6-merkliste-v1": "{\"keep\":true}",
    "consolecheat-bildschirm-pattern": "black",
  });
  assert.deepEqual(loadBest(store).best, { version: 1, bestScore: 40, bestStreak: 2 });
  assert.equal(loadBest(store).persist, true);
  assert.equal(resetBest(store), true);
  assert.equal(store.getItem(BEST_KEY), null);
  assert.equal(store.getItem(LANG_KEY), "en");
  assert.equal(store.getItem("consolecheat-ex6-merkliste-v1"), "{\"keep\":true}");
  assert.equal(store.getItem("consolecheat-bildschirm-pattern"), "black");
  const cleared = memory({
    [BEST_KEY]: "{}",
    [LANG_KEY]: "de",
    [THEME_KEY]: "dark",
    "consolecheat-ex6-merkliste-v1": "stay",
  });
  assert.equal(clearQuizData(cleared), true);
  assert.equal(cleared.getItem(BEST_KEY), null);
  assert.equal(cleared.getItem(LANG_KEY), null);
  assert.equal(cleared.getItem(THEME_KEY), null);
  assert.equal(cleared.getItem("consolecheat-ex6-merkliste-v1"), "stay");
});

test("a missing or foreign value is left untouched until a better run is saved", () => {
  const missing = memory();
  assert.deepEqual(loadBest(missing), { best: emptyBest(), persist: false });
  assert.deepEqual(missing.dump(), {});
  const foreign = memory({ [BEST_KEY]: JSON.stringify({ version: 2, bestScore: 9, bestStreak: 9 }) });
  assert.equal(parseBest(foreign.getItem(BEST_KEY)).persist, false);
  assert.equal(loadBest(foreign).persist, false);
  assert.equal(foreign.getItem(BEST_KEY)?.includes('"version":2'), true);
  const broken = memory({ [BEST_KEY]: "{no" });
  assert.equal(loadBest(broken).persist, false);
  assert.equal(broken.getItem(BEST_KEY), "{no");

  const next = considerBest(emptyBest(), 250, 4);
  assert.equal(next.improvedScore, true);
  assert.equal(next.improvedStreak, true);
  assert.deepEqual(next.best, { version: 1, bestScore: 250, bestStreak: 4 });
  assert.equal(saveBest(foreign, next.best), true);
  assert.deepEqual(loadBest(foreign).best, next.best);
  const same = considerBest(next.best, 250, 4);
  assert.equal(same.improvedScore, false);
  assert.equal(same.improvedStreak, false);
  const scoreOnly = considerBest(next.best, 300, 1);
  assert.equal(scoreOnly.improvedScore, true);
  assert.equal(scoreOnly.improvedStreak, false);
  assert.equal(scoreOnly.best.bestStreak, 4);
  assert.equal(scoreOnly.best.bestScore, 300);
  assert.equal(considerBest(next.best, 0, 0).improvedScore, false);
});
