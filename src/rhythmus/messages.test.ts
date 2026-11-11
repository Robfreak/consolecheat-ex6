import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copy, difficultyLabel, fill, initialLang, languageOptions, songText } from "./messages.ts";
import { SAVE_KEY } from "./storage.ts";

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
    const read = (lang: "de" | "en") =>
      key.split(".").reduce<unknown>((node, part) => {
        if (!node || typeof node !== "object") return undefined;
        return (node as Record<string, unknown>)[part];
      }, copy[lang]);
    assert.equal(typeof read("de"), "string", key);
    assert.equal(typeof read("en"), "string", key);
    assert.ok(String(read("de")).length > 0, key);
    assert.ok(String(read("en")).length > 0, key);
  }
  assert.equal(copy.de.title, "Controller-Rhythmus");
  assert.equal(copy.en.title, "Controller rhythm");
  assert.equal(copy.de.toolsHeading, "Weitere Werkzeuge");
  assert.equal(copy.en.toolsHeading, "Other tools");
  assert.equal(copy.de.perfect, "Perfect");
  assert.equal(copy.de.good, "Gut");
  assert.equal(copy.de.miss, "Verpasst");
  assert.equal(copy.en.good, "Good");
  assert.equal(copy.en.miss, "Miss");
  assert.match(copy.de.ruleTiming, /45/);
  assert.match(copy.de.ruleTiming, /100/);
  assert.match(copy.en.ruleTiming, /45/);
  assert.match(copy.de.mappingHint, /D F J K/);
  assert.match(copy.en.mappingHint, /D F J K/);
  assert.match(copy.de.ruleLanes, /D F J K/);
  assert.match(copy.de.storageNote, new RegExp(SAVE_KEY));
  assert.match(copy.en.storageNote, new RegExp(SAVE_KEY));
  assert.equal(songText(copy.de, "nachtmarkt").name, "Nachtmarkt");
  assert.equal(songText(copy.en, "neonbahn").name, "Neon Line");
  assert.equal(difficultyLabel(copy.de, "leicht"), "Leicht");
  assert.equal(difficultyLabel(copy.en, "schwer"), "Hard");
  assert.equal(fill(copy.de.notesLine, { n: 12 }), "12 Noten");
  assert.equal(fill(copy.en.bestLine, { score: "1,200", accuracy: "80.0", combo: 9 }), "1,200 points · 80.0 % · combo 9");
  assert.doesNotMatch(`${copy.de.lede}${copy.en.lede}${copy.de.title}`, /webmail/i);
});

test("privacy copy names Art. 6, the rhythm key, and local-only storage", () => {
  const legal = readFileSync(new URL("./legal.tsx", import.meta.url), "utf8");
  assert.match(legal, /Art\. 6 Abs\. 1 lit\. f DSGVO/);
  assert.match(legal, /Article 6 \(1\) \(f\) GDPR/);
  assert.match(legal, new RegExp(SAVE_KEY));
  assert.match(legal, /verlassen den Browser nicht/);
  assert.match(legal, /never leaves the browser/);
  assert.match(legal, /sessionStorage/);
  assert.match(legal, /wird nicht verwendet/);
  assert.match(legal, /is not used/);
  assert.match(legal, /keine personenbezogenen Daten/i);
  assert.match(legal, /keine Audiodatei/);
  assert.match(legal, /No audio file is loaded/);
  assert.match(legal, /consolecheat-lang/);
  assert.match(legal, /consolecheat-theme/);
  assert.match(legal, /consolecheat-ex6-merkliste-v1/);
  assert.match(legal, /consolecheat-bildschirm-pattern/);
  assert.match(legal, /Recht auf Auskunft, Berichtigung, Löschung/);
  assert.doesNotMatch(legal, /webmail/i);
});
