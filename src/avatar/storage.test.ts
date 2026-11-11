import assert from "node:assert/strict";
import test from "node:test";
import { getPixel, parseHex, setPixel } from "./pixels.ts";
import {
  LANG_KEY,
  SAVE_KEY,
  THEME_KEY,
  emptyDraft,
  loadDraft,
  parseDraft,
  resetDraft,
  saveDraft,
  serializeDraft,
  type StorageLike,
} from "./storage.ts";

function memory(): StorageLike & { dump(): Map<string, string> } {
  const map = new Map<string, string>();
  return {
    getItem: (key) => (map.has(key) ? (map.get(key) ?? null) : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    dump: () => map,
  };
}

test("the draft key round-trips pixels, palette and settings", () => {
  assert.equal(SAVE_KEY, "consolecheat-avatar-v1");
  const store = memory();
  const draft = emptyDraft();
  const red = parseHex("#ff004d");
  assert.ok(red);
  setPixel(draft.pixels, 3, 4, red);
  draft.settings.palette = "gb";
  draft.settings.symmetry = true;
  draft.settings.grid = false;
  draft.settings.zoom = "8";
  draft.settings.tool = "fill";
  draft.settings.recent = ["#1d2b53"];
  assert.equal(saveDraft(store, draft), true);
  const loaded = loadDraft(store);
  assert.deepEqual(getPixel(loaded.pixels, 3, 4), red);
  assert.equal(loaded.settings.palette, "gb");
  assert.equal(loaded.settings.symmetry, true);
  assert.equal(loaded.settings.grid, false);
  assert.equal(loaded.settings.zoom, "8");
  assert.equal(loaded.settings.tool, "fill");
  assert.deepEqual(loaded.settings.recent, ["#1d2b53"]);
  assert.match(serializeDraft(draft), /"version":1/);
  assert.match(store.dump().get(SAVE_KEY) ?? "", /4096|:/);
});

test("corrupt drafts fall back to an empty canvas and do not throw", () => {
  const samples = [
    "{",
    "null",
    "[]",
    "",
    '{"version":2,"pixels":"4096:0"}',
    '{"version":1}',
    '{"version":1,"pixels":"1:0"}',
    '{"version":1,"pixels":"nope"}',
    '{"version":1,"pixels":"4096:0","palette":"nope","tool":"spray"}',
  ];
  for (const raw of samples) {
    const draft = parseDraft(raw);
    assert.equal(getPixel(draft.pixels, 0, 0).a, 0, raw);
    assert.equal(draft.settings.palette, "pico8", raw);
    assert.equal(draft.settings.tool, "pencil", raw);
  }
  assert.equal(getPixel(parseDraft(null).pixels, 10, 10).a, 0);
  const store = memory();
  store.setItem(SAVE_KEY, "{");
  const loaded = loadDraft(store);
  assert.equal(getPixel(loaded.pixels, 1, 1).a, 0);
  assert.equal(store.dump().has(SAVE_KEY), true);
});

test("reset removes only the avatar key", () => {
  const store = memory();
  store.setItem(SAVE_KEY, serializeDraft(emptyDraft()));
  store.setItem(LANG_KEY, "en");
  store.setItem(THEME_KEY, "light");
  store.setItem("consolecheat-ex6-merkliste-v1", "keep");
  assert.equal(resetDraft(store), true);
  assert.equal(store.dump().has(SAVE_KEY), false);
  assert.equal(store.dump().get(LANG_KEY), "en");
  assert.equal(store.dump().get(THEME_KEY), "light");
  assert.equal(store.dump().get("consolecheat-ex6-merkliste-v1"), "keep");
});
