import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copy, fill, initialLang, languageOptions, modeLine } from "./messages.ts";
import { BEST_KEY } from "./storage.ts";

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
    const german = read("de");
    const english = read("en");
    assert.equal(typeof german, "string", key);
    assert.equal(typeof english, "string", key);
    assert.ok(String(german).length > 0, key);
  }
  assert.equal(copy.de.title, "PS-Plus-Quiz");
  assert.equal(copy.en.title, "PS Plus quiz");
  assert.equal(copy.de.toolsHeading, "Weitere Werkzeuge");
  assert.equal(copy.en.toolsHeading, "Other tools");
  assert.equal(copy.de.yearPrompt, "In welchem Jahr war {title} bei PS Plus?");
  assert.equal(copy.de.monthPrompt, "In welchem Monat und Jahr war {title} bei PS Plus?");
  assert.equal(copy.de.whichPrompt, "Welches dieser Spiele war im {month} dabei?");
  assert.match(copy.en.yearPrompt, /which year/i);
  assert.match(copy.en.monthPrompt, /month and year/i);
  assert.match(copy.en.whichPrompt, /Which of these games/);
  assert.equal(copy.de.months[2], "März");
  assert.equal(copy.en.months[2], "March");
  assert.equal(copy.de.months.length, 12);
  assert.match(copy.de.storageNote, new RegExp(BEST_KEY));
  assert.match(copy.en.storageNote, new RegExp(BEST_KEY));
  assert.match(copy.de.ruleKeys, /1 bis 4/);
  assert.match(copy.de.ruleKeys, /Enter/);
  assert.match(copy.en.ruleKeys, /1 to 4/);
  assert.match(copy.en.ruleKeys, /Enter/);
  assert.equal(fill(copy.de.yearPrompt, { title: "Portal Knights" }), "In welchem Jahr war Portal Knights bei PS Plus?");
  assert.equal(fill(copy.de.pointsGain, { points: 125 }), "+125");
  assert.equal(modeLine(copy.de, "classic", true, true), "Klassisch · Zeitdruck · Schwer");
  assert.equal(modeLine(copy.en, "endless", false, false), "Endless");
  assert.doesNotMatch(`${copy.de.lede}${copy.en.lede}${copy.de.title}`, /webmail/i);
});

test("privacy copy names Art. 6, the best key, and local-only storage", () => {
  const legal = readFileSync(new URL("./legal.tsx", import.meta.url), "utf8");
  assert.match(legal, /Art\. 6 Abs\. 1 lit\. f DSGVO/);
  assert.match(legal, /Article 6 \(1\) \(f\) GDPR/);
  assert.match(legal, new RegExp(BEST_KEY));
  assert.match(legal, /verlassen den Browser nicht/);
  assert.match(legal, /never leaves the browser/);
  assert.match(legal, /sessionStorage/);
  assert.match(legal, /wird nicht verwendet/);
  assert.match(legal, /is not used/);
  assert.match(legal, /keine personenbezogenen Daten/i);
  assert.match(legal, /nicht hoch/);
  assert.match(legal, /does not upload/);
  assert.match(legal, /consolecheat-lang/);
  assert.match(legal, /consolecheat-theme/);
  assert.match(legal, /consolecheat-ex6-merkliste-v1/);
  assert.match(legal, /consolecheat-bildschirm-pattern/);
  assert.match(legal, /Recht auf Auskunft, Berichtigung, Löschung/);
  assert.doesNotMatch(legal, /webmail/i);
});
