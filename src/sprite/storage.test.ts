import assert from "node:assert/strict";
import test from "node:test";
import { getPixel, parseHex, setPixel } from "../draw/buffer.ts";
import { AVATAR_KEY } from "./avatar-import.ts";
import { emptyDoc, type SpriteDoc } from "./model.ts";
import { LANG_KEY, SAVE_KEY, THEME_KEY, loadDoc, parseDoc, resetDoc, saveDoc, serializeDoc } from "./storage.ts";

function memory() {
  const data = new Map<string, string>();
  return {
    data,
    getItem(key: string) {
      return data.has(key) ? (data.get(key) ?? null) : null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
  };
}

test("the sprite draft round-trips and a corrupt value falls back", () => {
  const red = parseHex("#ff004d");
  assert.ok(red);
  const doc = emptyDoc(32);
  setPixel(32, doc.frames[0] ?? new Uint8ClampedArray(), 3, 4, red);
  doc.index = 0;
  doc.settings.fps = 12;
  doc.settings.mode = "pingpong";
  doc.settings.onion = true;
  const raw = serializeDoc(doc);
  const back = parseDoc(raw);
  assert.equal(back.size, 32);
  assert.equal(back.frames.length, 1);
  assert.deepEqual(getPixel(32, back.frames[0] ?? new Uint8ClampedArray(), 3, 4), red);
  assert.equal(back.settings.fps, 12);
  assert.equal(back.settings.mode, "pingpong");
  assert.equal(back.settings.onion, true);
  assert.equal(parseDoc(null).frames.length, 1);
  assert.equal(parseDoc("nope").size, 32);
  assert.equal(parseDoc(JSON.stringify({ version: 2, size: 32, frames: ["1:0"] })).frames.length, 1);
  assert.equal(parseDoc(JSON.stringify({ version: 1, size: 32, frames: ["1:0"] })).size, 32);
  assert.doesNotThrow(() => parseDoc("{"));
});

test("save, quota failure, and reset touch only the sprite key", () => {
  const local = memory();
  local.setItem(THEME_KEY, "dark");
  local.setItem(LANG_KEY, "en");
  local.setItem(AVATAR_KEY, "{\"version\":1}");
  local.setItem("consolecheat-ex6-merkliste-v1", "[]");
  const doc: SpriteDoc = emptyDoc(16);
  assert.equal(saveDoc(local, doc), true);
  assert.equal(loadDoc(local).size, 16);
  assert.equal(local.getItem(AVATAR_KEY), "{\"version\":1}");

  const full = memory();
  full.setItem(SAVE_KEY, "keep");
  full.setItem(AVATAR_KEY, "avatar");
  full.setItem = () => {
    throw new Error("quota");
  };
  assert.equal(saveDoc(full, emptyDoc()), false);
  assert.equal(full.getItem(SAVE_KEY), "keep");
  assert.equal(full.getItem(AVATAR_KEY), "avatar");

  assert.equal(resetDoc(local), true);
  assert.equal(local.getItem(SAVE_KEY), null);
  assert.equal(local.getItem(THEME_KEY), "dark");
  assert.equal(local.getItem(LANG_KEY), "en");
  assert.equal(local.getItem(AVATAR_KEY), "{\"version\":1}");
  assert.equal(local.getItem("consolecheat-ex6-merkliste-v1"), "[]");
  assert.equal(loadDoc(local).size, 32);
});
