import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copy, languageOptions } from "./messages.ts";

test("German is the default and English has the same copy keys", () => {
  assert.equal(languageOptions[0]?.id, "de");
  assert.deepEqual(languageOptions.map((item) => item.id), ["de", "en"]);
  const german = Object.keys(copy.de).sort();
  const english = Object.keys(copy.en).sort();
  assert.deepEqual(german, english);
  for (const key of german) {
    const de = copy.de[key as keyof typeof copy.de];
    const en = copy.en[key as keyof typeof copy.en];
    assert.equal(typeof de, "string");
    assert.equal(typeof en, "string");
    assert.ok(de.length > 0);
    assert.ok(en.length > 0);
  }
});

test("vendored search and catalog record where they came from", () => {
  const provenance = JSON.parse(readFileSync(new URL("../vendor/ex1/PROVENANCE.json", import.meta.url), "utf8")) as {
    repository: string;
    commit: string;
    catalog: { commit: string; upstream: string };
    runtime: string;
  };
  const titles = JSON.parse(readFileSync(new URL("../public/titles.json", import.meta.url), "utf8")) as {
    commit: string;
    source: string;
  };
  const search = readFileSync(new URL("./search.ts", import.meta.url), "utf8");
  assert.equal(provenance.repository, "https://github.com/Robfreak/consolecheat-ex1");
  assert.match(provenance.commit, /^[0-9a-f]{40}$/);
  assert.equal(provenance.catalog.commit, titles.commit);
  assert.equal(provenance.catalog.upstream, titles.source);
  assert.match(provenance.runtime, /does not request/);
  assert.match(search, /function foldRoman/);
  assert.match(search, /export function searchIndex/);
  assert.equal(copy.de.screenTest, "Bildschirm-Test");
  assert.equal(copy.en.screenTest, "Screen test");
});
