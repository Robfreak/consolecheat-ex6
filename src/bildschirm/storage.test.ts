import assert from "node:assert/strict";
import test from "node:test";
import {
  LANG_KEY,
  PATTERN_SESSION_KEY,
  THEME_KEY,
  clearPatternId,
  clearScreenData,
  readPatternId,
  writePatternId,
  type StorageLike,
} from "./storage.ts";

class Memory implements StorageLike {
  readonly map = new Map<string, string>();
  fail = false;
  getItem(key: string) {
    if (this.fail) throw new Error("blocked");
    return this.map.has(key) ? (this.map.get(key) ?? null) : null;
  }
  setItem(key: string, value: string) {
    if (this.fail) throw new Error("blocked");
    this.map.set(key, value);
  }
  removeItem(key: string) {
    if (this.fail) throw new Error("blocked");
    this.map.delete(key);
  }
}

test("the last pattern is a session id and unknown values are ignored", () => {
  assert.equal(PATTERN_SESSION_KEY, "consolecheat-bildschirm-pattern");
  assert.equal(THEME_KEY, "consolecheat-theme");
  assert.equal(LANG_KEY, "consolecheat-lang");
  const session = new Memory();
  assert.equal(readPatternId(session), null);
  assert.equal(writePatternId(session, "red"), true);
  assert.equal(session.getItem(PATTERN_SESSION_KEY), "red");
  assert.equal(readPatternId(session), "red");
  session.setItem(PATTERN_SESSION_KEY, "not-a-pattern");
  assert.equal(readPatternId(session), null);
  assert.equal(clearPatternId(session), true);
  assert.equal(session.getItem(PATTERN_SESSION_KEY), null);
});

test("clearing screen data leaves the backlog key alone", () => {
  const local = new Memory();
  const session = new Memory();
  const backlog = "consolecheat-ex6-merkliste-v1";
  local.setItem(THEME_KEY, "dark");
  local.setItem(LANG_KEY, "en");
  local.setItem(backlog, "{\"lists\":true}");
  session.setItem(PATTERN_SESSION_KEY, "black");
  assert.equal(clearScreenData(local, session), true);
  assert.equal(local.getItem(THEME_KEY), null);
  assert.equal(local.getItem(LANG_KEY), null);
  assert.equal(session.getItem(PATTERN_SESSION_KEY), null);
  assert.equal(local.getItem(backlog), "{\"lists\":true}");
});

test("blocked storage does not throw", () => {
  const storage = new Memory();
  storage.fail = true;
  assert.equal(readPatternId(storage), null);
  assert.equal(writePatternId(storage, "white"), false);
  assert.equal(clearPatternId(storage), false);
  assert.equal(clearScreenData(storage, storage), false);
});
