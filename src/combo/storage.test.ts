import assert from "node:assert/strict";
import test from "node:test";
import { BUILTINS } from "./combos.ts";
import { addCustom, deleteCustom, updateCustom, type SaveFile } from "./customs.ts";
import { addPaletteStep, moveStep, recordInput, removeStep } from "./record.ts";
import { freshSession, feed, feedClock } from "./session.ts";
import { emptyBest, emptyStats, hitRate } from "./stats.ts";
import { LANG_KEY, SAVE_KEY, THEME_KEY, defaultFile, loadFile, parseFile, resetCombo, saveFile, type StorageLike } from "./storage.ts";
import { frameMs } from "./timing.ts";
import type { Direction, FaceButton, Step, TrainerInput } from "./types.ts";

function memory(): StorageLike & { dump(): Record<string, string> } {
  const keys = new Map<string, string>();
  return {
    getItem: (key) => keys.get(key) ?? null,
    setItem: (key, value) => {
      keys.set(key, value);
    },
    removeItem: (key) => {
      keys.delete(key);
    },
    dump: () => Object.fromEntries(keys),
  };
}

function dir(direction: Direction, timeMs: number): TrainerInput {
  return { timeMs, direction, heldDirection: direction, heldButtons: [] };
}

function btn(button: FaceButton, timeMs: number, held: Direction | null = null): TrainerInput {
  return { timeMs, button, heldDirection: held, heldButtons: [button] };
}

function runHadouken(windowFrames = 12) {
  const steps = BUILTINS[0]!.steps;
  let session = freshSession(emptyStats(), emptyBest());
  session = feed(session, steps, dir(2, 0), windowFrames);
  session = feed(session, steps, dir(3, frameMs(4)), windowFrames);
  session = feed(session, steps, btn("square", frameMs(8), 6), windowFrames);
  return session;
}

test("hit rate, streak, and best values update from successes and misses", () => {
  const steps = BUILTINS[0]!.steps;
  let session = runHadouken();
  assert.equal(session.last?.ok, true);
  if (session.last?.ok) assert.equal(session.last.totalFrames, 8);
  assert.equal(session.stats.attempts, 1);
  assert.equal(session.stats.successes, 1);
  assert.equal(session.stats.streak, 1);
  assert.equal(hitRate(session.stats), 100);
  assert.equal(session.best.bestStreak, 1);
  assert.equal(session.best.bestHitRate, 100);
  assert.equal(session.best.bestTotalFrames, 8);
  assert.equal(session.attempt.index, 0);

  session = feed(session, steps, dir(2, 1000), 12);
  session = feed(session, steps, dir(4, 1000 + frameMs(4)), 12);
  assert.equal(session.last?.ok, false);
  if (session.last && !session.last.ok) assert.equal(session.last.reason, "wrong-direction");
  assert.equal(session.stats.streak, 0);
  assert.equal(session.stats.attempts, 2);
  assert.equal(hitRate(session.stats), 50);
  assert.equal(session.best.bestStreak, 1);
  assert.equal(session.best.bestHitRate, 100);
  assert.equal(session.best.bestTotalFrames, 8);

  session = feed(session, steps, dir(2, 2000), 12);
  session = feed(session, steps, dir(3, 2000 + frameMs(2)), 12);
  session = feed(session, steps, btn("square", 2000 + frameMs(3), 6), 12);
  assert.equal(session.last?.ok, true);
  if (session.last?.ok) assert.equal(session.last.totalFrames, 3);
  assert.equal(session.best.bestTotalFrames, 3);
  assert.equal(session.stats.streak, 1);
  assert.equal(hitRate(session.stats), 66.7);
  assert.equal(session.best.bestHitRate, 100);

  session = feed(session, steps, dir(2, 3000), 12);
  session = feed(session, steps, dir(3, 3000 + frameMs(2)), 12);
  session = feed(session, steps, btn("square", 3000 + frameMs(3), 6), 12);
  session = feed(session, steps, dir(2, 4000), 12);
  session = feed(session, steps, dir(3, 4000 + frameMs(2)), 12);
  session = feed(session, steps, btn("square", 4000 + frameMs(3), 6), 12);
  assert.equal(session.stats.streak, 3);
  assert.equal(session.best.bestStreak, 3);
  const slower = feed(feed(feed(session, steps, dir(2, 5000), 12), steps, dir(3, 5000 + frameMs(6)), 12), steps, btn("square", 5000 + frameMs(12), 6), 12);
  assert.equal(slower.best.bestTotalFrames, 3);
  assert.equal(slower.best.bestStreak, 4);

  let waiting = feed(freshSession(emptyStats(), emptyBest()), steps, dir(2, 0), 12);
  waiting = feedClock(waiting, frameMs(12), 12);
  assert.equal(waiting.attempt.index, 1);
  waiting = feedClock(waiting, frameMs(13), 12);
  assert.equal(waiting.last?.ok, false);
  assert.equal(waiting.stats.attempts, 1);
  assert.equal(waiting.best.bestTotalFrames, null);
  assert.equal(feedClock(waiting, frameMs(50), 12), waiting);
});

test("custom combos can be recorded or built from the palette, edited, and not deleted when they are built-in", () => {
  let file = defaultFile();
  let steps: Step[] = [];
  steps = recordInput(steps, dir(2, 0));
  steps = recordInput(steps, dir(2, 10));
  steps = recordInput(steps, { timeMs: 20, direction: null, heldDirection: null, heldButtons: [] });
  steps = recordInput(steps, dir(3, 30));
  steps = recordInput(steps, dir(6, 40));
  steps = recordInput(steps, btn("square", 50, 6));
  assert.deepEqual(steps, [
    { direction: 2, button: null },
    { direction: 3, button: null },
    { direction: 6, button: "square" },
  ]);

  let palette: Step[] = [];
  palette = addPaletteStep(palette, { direction: 4, button: null });
  palette = addPaletteStep(palette, { direction: null, button: "circle" });
  palette = addPaletteStep(palette, { direction: null, button: null });
  palette = moveStep(palette, 1, -1);
  palette = removeStep(palette, 1);
  assert.deepEqual(palette, [{ direction: null, button: "circle" }]);

  const added = addCustom(file, { name: "  Sofa-Combo  ", steps, window: 8 }, "csofa0001");
  assert.equal(added.ok, true);
  if (!added.ok) return;
  file = added.file;
  assert.equal(file.customs[0]?.name, "Sofa-Combo");
  assert.equal(file.customs[0]?.window, 8);

  assert.equal(addCustom(file, { name: "", steps, window: null }, "csofa0002").ok, false);
  assert.equal(addCustom(file, { name: "Leer", steps: [], window: null }, "csofa0002").ok, false);
  assert.equal(addCustom(file, { name: "Fenster", steps, window: 3 }, "csofa0002").ok, false);
  assert.equal(addCustom(file, { name: "Doppelt", steps, window: null }, "csofa0001").ok, false);

  const edited = updateCustom(file, "csofa0001", { name: "Sofa-Combo 2", steps: palette, window: null });
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  file = edited.file;
  assert.equal(file.customs[0]?.name, "Sofa-Combo 2");
  assert.equal(file.customs[0]?.window, null);
  assert.equal(file.customs[0]?.steps.length, 1);
  assert.equal(updateCustom(file, "hadouken", { name: "Nein", steps, window: null }).ok, false);
  assert.equal(updateCustom(file, "cmissing1", { name: "Nein", steps, window: null }).ok, false);

  const kept = deleteCustom(file, "hadouken");
  assert.deepEqual(kept, { ok: false, reason: "builtin" });
  assert.equal(file.customs.length, 1);
  assert.equal(deleteCustom(file, "cmissing1").ok, false);
  const removed = deleteCustom(file, "csofa0001");
  assert.equal(removed.ok, true);
  if (!removed.ok) return;
  assert.deepEqual(removed.file.customs, []);
});

test("persistence keeps the combo key, falls back when the data is corrupt, and reset removes only that key", () => {
  const store = memory();
  assert.equal(store.getItem(SAVE_KEY), null);
  assert.deepEqual(loadFile(store), defaultFile());
  assert.equal(store.getItem(SAVE_KEY), null);

  const session = runHadouken();
  let file: SaveFile = {
    ...defaultFile(),
    window: 20,
    layout: "uijk",
    customs: [{ id: "csofa0001", name: "Sofa", steps: [{ direction: 2, button: "cross" }], window: 10 }],
    bests: { hadouken: session.best },
    stats: { hadouken: session.stats },
  };
  saveFile(store, file);
  store.setItem(LANG_KEY, "en");
  store.setItem(THEME_KEY, "dark");
  store.setItem("consolecheat-ex6-merkliste-v1", "{\"version\":1}");
  store.setItem("consolecheat-bildschirm-pattern", "black");

  const loaded = loadFile(store);
  assert.equal(loaded.window, 20);
  assert.equal(loaded.layout, "uijk");
  assert.equal(loaded.customs[0]?.name, "Sofa");
  assert.equal(loaded.bests.hadouken?.bestTotalFrames, 8);
  assert.equal(loaded.stats.hadouken?.successes, 1);
  assert.equal(hitRate(loaded.stats.hadouken!), 100);

  assert.deepEqual(parseFile("not json"), defaultFile());
  assert.deepEqual(parseFile("null"), defaultFile());
  assert.deepEqual(parseFile("{\"version\":2}"), defaultFile());
  assert.deepEqual(parseFile("{\"version\":1,\"customs\":{\"nope\":true}}"), defaultFile());
  assert.deepEqual(parseFile("{\"version\":1,\"window\":\"fast\"}"), defaultFile());
  assert.deepEqual(parseFile("{\"version\":1,\"customs\":[{\"id\":1}]}"), defaultFile());
  assert.deepEqual(parseFile("{\"version\":1,\"bests\":{\"hadouken\":{\"bestStreak\":-1,\"bestHitRate\":0,\"bestTotalFrames\":null}}}"), defaultFile());
  const partial = parseFile("{\"version\":1}");
  assert.equal(partial.window, 12);
  assert.deepEqual(partial.customs, []);

  resetCombo(store);
  assert.equal(store.getItem(SAVE_KEY), null);
  assert.equal(store.getItem(LANG_KEY), "en");
  assert.equal(store.getItem(THEME_KEY), "dark");
  assert.equal(store.getItem("consolecheat-ex6-merkliste-v1"), "{\"version\":1}");
  assert.equal(store.getItem("consolecheat-bildschirm-pattern"), "black");
  assert.deepEqual(loadFile(store), defaultFile());
});
