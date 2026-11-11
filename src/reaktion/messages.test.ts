import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copy, fill, initialLang, languageOptions } from "./messages.ts";
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
  assert.equal(copy.de.title, "Reaktions-Duell");
  assert.equal(copy.en.title, "Reaction duel");
  assert.equal(copy.de.toolsHeading, "Weitere Werkzeuge");
  assert.equal(copy.en.toolsHeading, "Other tools");
  assert.equal(copy.de.symbols.cross, "Kreuz");
  assert.equal(copy.en.symbols.cross, "Cross");
  assert.equal(copy.de.symbols.circle, "Kreis");
  assert.equal(copy.de.symbols.square, "Quadrat");
  assert.equal(copy.de.symbols.triangle, "Dreieck");
  assert.match(copy.de.ruleFalseStart, /Fehlstart/);
  assert.match(copy.en.ruleFalseStart, /false start/i);
  assert.match(copy.de.ruleWrong, /falsche Taste/i);
  assert.match(copy.en.ruleWrong, /wrong button/i);
  assert.match(copy.de.mapP1, /W/);
  assert.match(copy.de.mapP1, /A/);
  assert.match(copy.de.mapP1, /S/);
  assert.match(copy.de.mapP1, /D/);
  assert.match(copy.en.mapP1, /W/);
  assert.match(copy.en.mapP2, /I/);
  assert.match(copy.de.mapP2, /J/);
  assert.match(copy.de.mapP2, /K/);
  assert.match(copy.de.mapP2, /L/);
  assert.match(copy.en.mapP2, /Arrow keys/);
  assert.match(copy.de.mapEasy, /Taste A/);
  assert.match(copy.de.mapEasy, /Taste L/);
  assert.match(copy.en.mapEasy, /A key/);
  assert.match(copy.en.mapEasy, /L key/);
  assert.match(copy.de.mapPad, /Taste 0/);
  assert.match(copy.en.mapPad, /button 0/);
  assert.match(copy.de.storageNote, new RegExp(BEST_KEY));
  assert.match(copy.en.storageNote, new RegExp(BEST_KEY));
  assert.equal(fill(copy.de.falseStartAward, { player: "Spieler 2" }), "Punkt für Spieler 2.");
  assert.equal(fill(copy.en.wins, { player: "Player 1" }), "Player 1 wins");
  assert.doesNotMatch(`${copy.de.lede}${copy.en.lede}${copy.de.title}`, /webmail/i);
});

test("privacy copy names Art. 6, the best-time key, and local-only storage", () => {
  const legal = readFileSync(new URL("./legal.tsx", import.meta.url), "utf8");
  assert.match(legal, /Art\. 6 Abs\. 1 lit\. f DSGVO/);
  assert.match(legal, /Article 6 \(1\) \(f\) GDPR/);
  assert.match(legal, new RegExp(BEST_KEY));
  assert.match(legal, /verlassen den Browser nicht/);
  assert.match(legal, /never leave the browser/);
  assert.match(legal, /sessionStorage/);
  assert.match(legal, /wird nicht verwendet/);
  assert.match(legal, /is not used/);
  assert.match(legal, /keine personenbezogenen Daten/i);
  assert.match(legal, /consolecheat-lang/);
  assert.match(legal, /consolecheat-theme/);
  assert.match(legal, /consolecheat-ex6-merkliste-v1/);
  assert.match(legal, /consolecheat-bildschirm-pattern/);
  assert.match(legal, /Recht auf Auskunft, Berichtigung, Löschung/);
  assert.doesNotMatch(legal, /webmail/i);
});
