import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LANG_KEY, THEME_KEY, clearTastenData, type StorageLike } from "./storage.ts";

function memory(initial: Record<string, string> = {}): StorageLike & { map: Map<string, string> } {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem(key) {
      return map.get(key) ?? null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

test("clearing this page removes language and theme and leaves the other tools", () => {
  const store = memory({
    [THEME_KEY]: "light",
    [LANG_KEY]: "en",
    "consolecheat-ex6-merkliste-v1": "{\"lists\":{}}",
    "consolecheat-bildschirm-pattern": "black",
  });
  assert.equal(clearTastenData(store), true);
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
  assert.equal(clearTastenData(blocked), false);

  const source = readFileSync(new URL("./storage.ts", import.meta.url), "utf8");
  const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
  const folder = readFileSync(new URL("./reference.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /sessionStorage/);
  assert.doesNotMatch(source, /consolecheat-ex6-merkliste/);
  assert.doesNotMatch(app, /sessionStorage/);
  assert.doesNotMatch(app, /consolecheat-ex6-merkliste/);
  assert.doesNotMatch(app, /consolecheat-bildschirm-pattern/);
  assert.doesNotMatch(`${source}\n${app}\n${folder}`, /getGamepads|gamepadconnected|gamepaddisconnected/);
  assert.match(app, /useState<LayoutId>\("ds4"\)/);
  assert.doesNotMatch(app, /localStorage\.setItem\([^)]*layout/);
});
