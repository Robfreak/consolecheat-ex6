import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CHECKS_KEY,
  LANG_KEY,
  THEME_KEY,
  clearUsbData,
  loadChecks,
  parseChecks,
  saveChecks,
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

test("checks load, save, and a foreign version stays unread", () => {
  assert.deepEqual(loadChecks(memory()), { console: "both", checked: [], persist: false });
  const store = memory();
  assert.equal(saveChecks(store, "ps4", ["media-music", "media-music", "format-fat"]), true);
  assert.equal(store.writes, 1);
  const loaded = loadChecks(store);
  assert.equal(loaded.persist, true);
  assert.equal(loaded.console, "ps4");
  assert.deepEqual(loaded.checked, ["media-music", "format-fat"]);
  assert.match(store.getItem(CHECKS_KEY) ?? "", /"version":1/);

  const foreign = memory({ [CHECKS_KEY]: JSON.stringify({ version: 2, console: "ps5", checked: ["update-ps5"] }) });
  const ignored = loadChecks(foreign);
  assert.equal(ignored.persist, false);
  assert.deepEqual(ignored.checked, []);
  assert.equal(foreign.writes, 0);
  assert.match(foreign.getItem(CHECKS_KEY) ?? "", /"version":2/);

  assert.equal(parseChecks("{").persist, false);
  assert.equal(parseChecks("null").persist, false);
  assert.equal(parseChecks(JSON.stringify({ version: 1, console: "nope", checked: [] })).persist, false);
});

test("clearing this page removes checks, language, and theme and leaves the other tools", () => {
  const store = memory({
    [CHECKS_KEY]: "{\"version\":1}",
    [THEME_KEY]: "light",
    [LANG_KEY]: "en",
    "consolecheat-ex6-merkliste-v1": "{\"lists\":{}}",
    "consolecheat-bildschirm-pattern": "black",
    "consolecheat-hdr-pattern": "near-black",
  });
  assert.equal(clearUsbData(store), true);
  assert.equal(store.getItem(CHECKS_KEY), null);
  assert.equal(store.getItem(THEME_KEY), null);
  assert.equal(store.getItem(LANG_KEY), null);
  assert.match(store.getItem("consolecheat-ex6-merkliste-v1") ?? "", /lists/);
  assert.equal(store.getItem("consolecheat-bildschirm-pattern"), "black");
  assert.equal(store.getItem("consolecheat-hdr-pattern"), "near-black");

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
  assert.equal(clearUsbData(blocked), false);
  assert.equal(saveChecks(blocked, "both", []), false);

  const source = readFileSync(new URL("./storage.ts", import.meta.url), "utf8");
  const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
  assert.match(source, /consolecheat-usb-checks-v1/);
  assert.doesNotMatch(source, /sessionStorage/);
  assert.doesNotMatch(source, /consolecheat-ex6-merkliste/);
  assert.doesNotMatch(app, /sessionStorage/);
  assert.doesNotMatch(app, /consolecheat-ex6-merkliste/);
  assert.doesNotMatch(app, /consolecheat-bildschirm-pattern/);
  assert.doesNotMatch(app, /navigator\.usb|showDirectoryPicker|type=["']file["']/i);
});
