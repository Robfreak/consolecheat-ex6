import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  LANG_KEY,
  PATTERN_SESSION_KEY,
  THEME_KEY,
  clearHdrData,
  clearPatternId,
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
  assert.equal(PATTERN_SESSION_KEY, "consolecheat-hdr-pattern");
  assert.equal(THEME_KEY, "consolecheat-theme");
  assert.equal(LANG_KEY, "consolecheat-lang");
  const session = new Memory();
  assert.equal(readPatternId(session), null);
  assert.equal(writePatternId(session, "near-black"), true);
  assert.equal(session.getItem(PATTERN_SESSION_KEY), "near-black");
  assert.equal(readPatternId(session), "near-black");
  session.setItem(PATTERN_SESSION_KEY, "not-a-pattern");
  assert.equal(readPatternId(session), null);
  assert.equal(clearPatternId(session), true);
  assert.equal(session.getItem(PATTERN_SESSION_KEY), null);
});

test("clearing this page leaves the backlog and the screen-test pattern", () => {
  const local = new Memory();
  const session = new Memory();
  local.setItem(THEME_KEY, "light");
  local.setItem(LANG_KEY, "en");
  local.setItem("consolecheat-ex6-merkliste-v1", "{\"lists\":true}");
  local.setItem("consolecheat-bildschirm-pattern", "black");
  session.setItem(PATTERN_SESSION_KEY, "pluge");
  assert.equal(clearHdrData(local, session), true);
  assert.equal(local.getItem(THEME_KEY), null);
  assert.equal(local.getItem(LANG_KEY), null);
  assert.equal(session.getItem(PATTERN_SESSION_KEY), null);
  assert.equal(local.getItem("consolecheat-ex6-merkliste-v1"), "{\"lists\":true}");
  assert.equal(local.getItem("consolecheat-bildschirm-pattern"), "black");

  const source = readFileSync(new URL("./storage.ts", import.meta.url), "utf8");
  assert.match(source, /sessionStorage/);
  assert.match(source, /consolecheat-hdr-pattern/);
  assert.doesNotMatch(source, /consolecheat-ex6-merkliste-v1/);
  assert.doesNotMatch(source, /consolecheat-bildschirm-pattern/);
});

test("blocked storage does not throw", () => {
  const storage = new Memory();
  storage.fail = true;
  assert.equal(readPatternId(storage), null);
  assert.equal(writePatternId(storage, "white-clip"), false);
  assert.equal(clearPatternId(storage), false);
  assert.equal(clearHdrData(storage, storage), false);
});
