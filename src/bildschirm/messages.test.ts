import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copy, fill, initialLang, languageOptions } from "./messages.ts";
import { PATTERN_IDS } from "./patterns.ts";

function leaves(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => leaves(inner, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

test("German is the default and English has the same copy", () => {
  assert.equal(languageOptions[0]?.id, "de");
  assert.deepEqual(languageOptions.map((item) => item.id), ["de", "en"]);
  assert.equal(initialLang(null), "de");
  assert.equal(initialLang("nope"), "de");
  assert.equal(initialLang("en"), "en");
  assert.deepEqual(leaves(copy.de).sort(), leaves(copy.en).sort());
  for (const key of leaves(copy.de)) {
    const read = (lang: "de" | "en") => key.split(".").reduce<unknown>((node, part) => {
      if (!node || typeof node !== "object") return undefined;
      return (node as Record<string, unknown>)[part];
    }, copy[lang]);
    const german = read("de");
    const english = read("en");
    assert.equal(typeof german, "string", key);
    assert.equal(typeof english, "string", key);
    assert.ok(String(german).length > 0, key);
    assert.ok(String(english).length > 0, key);
  }
  assert.equal(copy.de.title, "Bildschirm-Test");
  assert.notEqual(copy.de.patterns.black.name, copy.en.patterns.black.name);
  assert.equal(fill(copy.de.patternStatus, { name: "Rot", n: 3, total: 15 }), "Rot, 3 von 15");
  for (const id of PATTERN_IDS) {
    assert.ok(copy.de.patterns[id].name.length > 0);
    assert.ok(copy.en.patterns[id].description.length > 0);
  }
});

test("privacy copy names session storage, Art. 6, and the rights from the other tools", () => {
  const legal = readFileSync(new URL("./legal.tsx", import.meta.url), "utf8");
  assert.match(legal, /Art\. 6 Abs\. 1 lit\. f DSGVO/);
  assert.match(legal, /sessionStorage/);
  assert.match(legal, /consolecheat-bildschirm-pattern/);
  assert.match(legal, /keine personenbezogenen Daten/i);
  assert.match(legal, /Recht auf Auskunft, Berichtigung, Löschung/);
  assert.match(legal, /\[Name einsetzen\]/);
  assert.match(legal, /\[insert name\]/);
  assert.doesNotMatch(legal, /webmail/i);
});
