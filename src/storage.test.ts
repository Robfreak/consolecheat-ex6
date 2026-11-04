import assert from "node:assert/strict";
import test from "node:test";
import { LANG_KEY, SCHEMA, STORAGE_KEY, THEME_KEY, VERSION, addToList, emptyLists } from "./lists.ts";
import { clearStoredData, loadLists, saveLists, type StorageLike } from "./storage.ts";
import { exportJson } from "./transfer.ts";

class MemoryStorage implements StorageLike {
  readonly map = new Map<string, string>();
  getItem(key: string) {
    return this.map.has(key) ? (this.map.get(key) ?? null) : null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

function storedGame() {
  const added = addToList(emptyLists(), "wishlist", {
    titleIds: ["CUSA07820"],
    name: "The Last of Us Part II",
    note: "später",
  });
  assert.equal(added.ok, true);
  if (!added.ok) throw new Error("setup");
  return added.file;
}

test("lists round-trip through the versioned localStorage key", () => {
  const storage = new MemoryStorage();
  const file = storedGame();
  assert.match(STORAGE_KEY, /v1$/);
  assert.equal(saveLists(storage, file).ok, true);
  assert.equal(storage.map.has(STORAGE_KEY), true);
  assert.equal(storage.map.has("consolecheat-ex6-merkliste-v0"), false);
  const raw = storage.getItem(STORAGE_KEY) ?? "";
  assert.match(raw, new RegExp(`"schema": "${SCHEMA}"`));
  assert.match(raw, new RegExp(`"version": ${VERSION}`));

  const loaded = loadLists(storage);
  assert.equal(loaded.ok, true);
  assert.equal(loaded.persist, true);
  assert.equal(loaded.reason, "stored");
  assert.deepEqual(loaded.file, file);
});

test("an empty list removes the key instead of keeping a document", () => {
  const storage = new MemoryStorage();
  saveLists(storage, storedGame());
  assert.equal(saveLists(storage, emptyLists()).ok, true);
  assert.equal(storage.getItem(STORAGE_KEY), null);
  const loaded = loadLists(storage);
  assert.equal(loaded.reason, "empty");
  assert.equal(loaded.persist, true);
});

test("a different version is not loaded and is not overwritten", () => {
  const storage = new MemoryStorage();
  const foreign = JSON.stringify({
    schema: SCHEMA,
    version: 2,
    lists: emptyLists().lists,
  });
  storage.setItem(STORAGE_KEY, foreign);
  storage.setItem("consolecheat-ex6-merkliste-v0", exportJson(storedGame()));
  const loaded = loadLists(storage);
  assert.equal(loaded.ok, false);
  assert.equal(loaded.persist, false);
  assert.equal(loaded.reason, "version");
  assert.equal(loaded.file.lists.wishlist.length, 0);
  assert.equal(storage.getItem(STORAGE_KEY), foreign);
  assert.match(storage.getItem("consolecheat-ex6-merkliste-v0") ?? "", /CUSA07820/);
});

test("corrupt storage is left in place", () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, "{not json");
  const loaded = loadLists(storage);
  assert.equal(loaded.reason, "corrupt");
  assert.equal(loaded.persist, false);
  assert.equal(storage.getItem(STORAGE_KEY), "{not json");
});

test("a full or disabled store is reported and does not throw", () => {
  const full: StorageLike = {
    getItem: () => null,
    setItem: () => {
      const error = new Error("quota");
      error.name = "QuotaExceededError";
      throw error;
    },
    removeItem: () => undefined,
  };
  const saved = saveLists(full, storedGame());
  assert.deepEqual(saved, { ok: false, reason: "full" });

  const disabled: StorageLike = {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("denied");
    },
    removeItem: () => {
      throw new Error("denied");
    },
  };
  assert.equal(loadLists(disabled).reason, "disabled");
  assert.equal(loadLists(disabled).persist, false);
  assert.deepEqual(saveLists(disabled, storedGame()), { ok: false, reason: "disabled" });
  assert.deepEqual(clearStoredData(disabled), { ok: false, reason: "disabled" });
});

test("delete removes the list, the theme, and the language, and nothing else", () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, exportJson(storedGame()));
  storage.setItem(THEME_KEY, "dark");
  storage.setItem(LANG_KEY, "en");
  storage.setItem("unrelated", "keep");
  assert.equal(clearStoredData(storage).ok, true);
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.equal(storage.getItem(THEME_KEY), null);
  assert.equal(storage.getItem(LANG_KEY), null);
  assert.equal(storage.getItem("unrelated"), "keep");
});
