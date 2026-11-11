import assert from "node:assert/strict";
import test from "node:test";
import { activeProfile, createDefaultStore, SAVE_KEY } from "./model.ts";
import { clearSpeedrunData, LANG_KEY, loadStore, saveStore, THEME_KEY, type StorageLike } from "./storage.ts";

function memory(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key]! : null;
    },
    setItem(key, value) {
      data[key] = value;
    },
    removeItem(key) {
      delete data[key];
    },
  };
}

test("profiles, bests, and attempts round-trip under the documented key", () => {
  const local = memory();
  const first = loadStore(local);
  assert.equal(first.persist, false);
  assert.equal(local.getItem(SAVE_KEY), null);
  const store = createDefaultStore();
  const profile = activeProfile(store);
  profile.attempts = 3;
  profile.pb = [1000, 2000, 3000];
  profile.bestSegments = [1000, 900, 800];
  assert.equal(saveStore(local, store), true);
  assert.equal(local.getItem(SAVE_KEY)?.includes("consolecheat-speedrun"), true);
  const loaded = loadStore(local);
  assert.equal(loaded.persist, true);
  assert.equal(activeProfile(loaded.store).attempts, 3);
  assert.deepEqual(activeProfile(loaded.store).pb, [1000, 2000, 3000]);
  assert.deepEqual(activeProfile(loaded.store).bestSegments, [1000, 900, 800]);
  assert.equal(SAVE_KEY, "consolecheat-speedrun-v1");
});

test("broken storage is left in place and a reset removes only this page's keys", () => {
  const broken = memory({ [SAVE_KEY]: "{", [LANG_KEY]: "en", [THEME_KEY]: "light", "consolecheat-ex6-merkliste-v1": "keep" });
  const loaded = loadStore(broken);
  assert.equal(loaded.persist, false);
  assert.equal(loaded.issue, "broken-json");
  assert.equal(broken.getItem(SAVE_KEY), "{");
  assert.equal(activeProfile(loaded.store).game, "Beispielspiel");
  assert.equal(clearSpeedrunData(broken), true);
  assert.equal(broken.getItem(SAVE_KEY), null);
  assert.equal(broken.getItem(LANG_KEY), null);
  assert.equal(broken.getItem(THEME_KEY), null);
  assert.equal(broken.getItem("consolecheat-ex6-merkliste-v1"), "keep");
});

test("a throwing store does not wipe the in-memory profile", () => {
  const local: StorageLike = {
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
  const loaded = loadStore(local);
  assert.equal(loaded.issue, "blocked");
  assert.equal(saveStore(local, loaded.store), false);
  assert.equal(clearSpeedrunData(local), false);
  assert.equal(activeProfile(loaded.store).id, "profile-default");
});
