import assert from "node:assert/strict";
import test from "node:test";
import {
  SAVE_KEY,
  THEME_KEY,
  LANG_KEY,
  calibrationBeats,
  clampOffset,
  clearRhythmData,
  emptySave,
  loadSave,
  offsetFromTaps,
  resetSave,
  saveState,
  scoreId,
  withOffset,
  withScore,
  type StorageLike,
} from "./storage.ts";

function memory(): StorageLike & { dump: Record<string, string> } {
  const dump: Record<string, string> = {};
  return {
    dump,
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(dump, key) ? dump[key]! : null;
    },
    setItem(key, value) {
      dump[key] = value;
    },
    removeItem(key) {
      delete dump[key];
    },
  };
}

test("highscores are kept per song and difficulty, and reset removes only that key", () => {
  const store = memory();
  store.setItem("consolecheat-ex6-merkliste-v1", "keep");
  store.setItem(THEME_KEY, "dark");
  assert.deepEqual(loadSave(store).save, emptySave());
  assert.equal(loadSave(store).persist, false);

  const id = scoreId("nachtmarkt", "leicht");
  let save = emptySave();
  const first = withScore(save, id, { score: 1200, accuracy: 80, maxCombo: 12 });
  assert.equal(first.improved, true);
  save = withOffset(first.save, 35);
  assert.equal(saveState(store, save), true);
  assert.equal(store.dump[SAVE_KEY]?.includes("nachtmarkt:leicht"), true);

  const loaded = loadSave(store);
  assert.equal(loaded.persist, true);
  assert.equal(loaded.save.offsetMs, 35);
  assert.deepEqual(loaded.save.scores[id], { score: 1200, accuracy: 80, maxCombo: 12 });

  const worse = withScore(loaded.save, id, { score: 1000, accuracy: 99, maxCombo: 40 });
  assert.equal(worse.improved, false);
  const sameScore = withScore(loaded.save, id, { score: 1200, accuracy: 70, maxCombo: 20 });
  assert.equal(sameScore.improved, true);
  assert.equal(sameScore.save.scores[id]?.maxCombo, 20);
  const sameCombo = withScore(sameScore.save, id, { score: 1200, accuracy: 90, maxCombo: 20 });
  assert.equal(sameCombo.improved, true);
  const other = withScore(sameCombo.save, scoreId("neonbahn", "schwer"), { score: 50, accuracy: 10, maxCombo: 1 });
  assert.equal(saveState(store, other.save), true);
  assert.equal(loadSave(store).save.scores[id]?.maxCombo, 20);
  assert.equal(loadSave(store).save.scores[scoreId("neonbahn", "schwer")]?.score, 50);

  assert.equal(resetSave(store), true);
  assert.equal(store.getItem(SAVE_KEY), null);
  assert.equal(store.getItem(THEME_KEY), "dark");
  assert.equal(store.getItem("consolecheat-ex6-merkliste-v1"), "keep");
  assert.equal(loadSave(store).persist, false);
});

test("a broken save is left unread and the offset stays inside the slider", () => {
  const store = memory();
  store.setItem(SAVE_KEY, "{");
  assert.equal(loadSave(store).persist, false);
  assert.equal(store.getItem(SAVE_KEY), "{");
  store.setItem(SAVE_KEY, JSON.stringify({ version: 2, offsetMs: 0, scores: {} }));
  assert.equal(loadSave(store).persist, false);
  assert.equal(store.getItem(SAVE_KEY), JSON.stringify({ version: 2, offsetMs: 0, scores: {} }));

  assert.equal(clampOffset(240.4), 200);
  assert.equal(clampOffset(-240), -200);
  assert.equal(clampOffset(Number.NaN), 0);
  const shifted = withOffset(emptySave(), 12.6);
  assert.equal(shifted.offsetMs, 13);
});

test("tap-to-beat calibration uses the late taps and ignores strays", () => {
  const beats = calibrationBeats(0, 0);
  assert.equal(beats.length, 8);
  assert.equal(beats[1]! - beats[0]!, 600);
  const taps = beats.slice(0, 6).map((beat) => beat + 40);
  assert.equal(offsetFromTaps(taps, beats), 40);
  assert.equal(offsetFromTaps([10, 20], beats), null);
  assert.equal(offsetFromTaps(beats.map((beat) => beat + 300), beats), null);
  assert.equal(offsetFromTaps(beats.map((beat) => beat + 240), beats), 200);
});

test("delete on the privacy page removes the rhythm key, language, and theme", () => {
  const store = memory();
  store.setItem(SAVE_KEY, "{}");
  store.setItem(THEME_KEY, "light");
  store.setItem(LANG_KEY, "en");
  store.setItem("consolecheat-ex6-merkliste-v1", "keep");
  assert.equal(clearRhythmData(store), true);
  assert.equal(store.getItem(SAVE_KEY), null);
  assert.equal(store.getItem(THEME_KEY), null);
  assert.equal(store.getItem(LANG_KEY), null);
  assert.equal(store.getItem("consolecheat-ex6-merkliste-v1"), "keep");
});
