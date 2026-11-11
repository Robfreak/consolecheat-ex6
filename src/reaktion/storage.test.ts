import assert from "node:assert/strict";
import test from "node:test";
import {
  BEST_KEY,
  clearReaktionData,
  consider,
  emptyBest,
  LANG_KEY,
  loadBest,
  resetBest,
  saveBest,
  slotFor,
  THEME_KEY,
  type StorageLike,
} from "./storage.ts";

function memory(initial: Record<string, string> = {}): StorageLike & { map: Map<string, string>; writes: number } {
  const map = new Map(Object.entries(initial));
  const store = {
    map,
    writes: 0,
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.writes += 1;
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
  };
  return store;
}

test("best times load, save per mode, and a foreign version stays unread", () => {
  assert.equal(BEST_KEY, "consolecheat-reaktion-best-v1");
  assert.deepEqual(loadBest(memory()).times, emptyBest());
  assert.equal(loadBest(memory()).persist, false);
  assert.equal(slotFor("solo", "match"), "solo");
  assert.equal(slotFor("solo", "easy"), "soloEasy");
  assert.equal(slotFor("duel", "match"), "duel");
  assert.equal(slotFor("duel", "easy"), "duelEasy");

  let times = emptyBest();
  const first = consider(times, "solo", 240.4);
  assert.equal(first.improved, true);
  assert.equal(first.times.solo, 240);
  const worse = consider(first.times, "solo", 300);
  assert.equal(worse.improved, false);
  assert.equal(worse.times.solo, 240);
  const tie = consider(first.times, "solo", 240);
  assert.equal(tie.improved, false);
  const easy = consider(first.times, "duelEasy", 180);
  assert.equal(easy.improved, true);
  assert.equal(easy.times.solo, 240);
  assert.equal(easy.times.duelEasy, 180);
  assert.equal(consider(easy.times, "solo", Number.NaN).improved, false);
  assert.equal(consider(easy.times, "solo", -1).improved, false);

  const store = memory();
  assert.equal(saveBest(store, easy.times), true);
  assert.equal(store.writes, 1);
  const loaded = loadBest(store);
  assert.equal(loaded.persist, true);
  assert.equal(loaded.times.solo, 240);
  assert.equal(loaded.times.duelEasy, 180);
  assert.equal(loaded.times.duel, null);
  assert.match(store.getItem(BEST_KEY) ?? "", /"version":1/);

  const foreign = memory({ [BEST_KEY]: JSON.stringify({ version: 2, solo: 10, soloEasy: null, duel: null, duelEasy: null }) });
  const ignored = loadBest(foreign);
  assert.equal(ignored.persist, false);
  assert.equal(ignored.times.solo, null);
  assert.equal(foreign.writes, 0);
  assert.match(foreign.getItem(BEST_KEY) ?? "", /"version":2/);

  const broken = memory({ [BEST_KEY]: "{" });
  assert.equal(loadBest(broken).persist, false);
  assert.equal(broken.getItem(BEST_KEY), "{");
  assert.equal(loadBest(memory({ [BEST_KEY]: JSON.stringify({ version: 1, solo: 1.5, soloEasy: null, duel: null, duelEasy: null }) })).persist, false);
});

test("reset removes only the best-time key, and privacy clear leaves the other tools", () => {
  const store = memory({
    [BEST_KEY]: "{\"version\":1}",
    [THEME_KEY]: "light",
    [LANG_KEY]: "en",
    "consolecheat-ex6-merkliste-v1": "{\"lists\":{}}",
    "consolecheat-bildschirm-pattern": "black",
  });
  assert.equal(resetBest(store), true);
  assert.equal(store.getItem(BEST_KEY), null);
  assert.equal(store.getItem(THEME_KEY), "light");
  assert.equal(store.getItem(LANG_KEY), "en");
  store.setItem(BEST_KEY, "{\"version\":1}");
  assert.equal(clearReaktionData(store), true);
  assert.equal(store.getItem(BEST_KEY), null);
  assert.equal(store.getItem(THEME_KEY), null);
  assert.equal(store.getItem(LANG_KEY), null);
  assert.match(store.getItem("consolecheat-ex6-merkliste-v1") ?? "", /lists/);
  assert.equal(store.getItem("consolecheat-bildschirm-pattern"), "black");

  const blocked: StorageLike = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("blocked");
    },
    removeItem() {
      throw new Error("blocked");
    },
  };
  assert.equal(saveBest(blocked, emptyBest()), false);
  assert.equal(resetBest(blocked), false);
  assert.equal(clearReaktionData(blocked), false);
});
