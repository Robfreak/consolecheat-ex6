import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copy, fill, initialLang, languageOptions, roundName } from "./messages.ts";
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
  assert.equal(copy.de.title, "Couch-Turnier-Planer");
  assert.equal(copy.en.title, "Couch tournament planner");
  assert.equal(copy.de.toolsHeading, "Weitere Werkzeuge");
  assert.equal(copy.en.toolsHeading, "Other tools");
  assert.equal(copy.de.modeKo, "K.-o.");
  assert.equal(copy.de.modeLiga, "Liga");
  assert.deepEqual(
    [copy.de.colPlayed, copy.de.colWon, copy.de.colDrawn, copy.de.colLost, copy.de.colGoals, copy.de.colDiff, copy.de.colPoints],
    ["Sp", "S", "U", "N", "Tore", "Diff", "Pkt"],
  );
  assert.match(copy.de.storageNote, new RegExp(SAVE_KEY));
  assert.match(copy.en.storageNote, new RegExp(SAVE_KEY));
  assert.match(copy.de.exportNote, /consolecheat-turnier\.png/);
  assert.equal(fill(copy.de.winnerTitle, { name: "Ada" }), "Sieger: Ada");
  assert.equal(fill(copy.en.winnerTitle, { name: "Ada" }), "Winner: Ada");
  assert.equal(roundName(copy.de, 0, 1), "Finale");
  assert.equal(roundName(copy.de, 0, 2), "Halbfinale");
  assert.equal(roundName(copy.de, 1, 2), "Finale");
  assert.equal(roundName(copy.de, 0, 4), "Achtelfinale");
  assert.equal(roundName(copy.en, 0, 3), "Quarterfinal");
  assert.doesNotMatch(`${copy.de.lede}${copy.en.lede}${copy.de.title}`, /webmail/i);
});

test("privacy copy names Art. 6, the tournament key, and local-only storage", () => {
  const legal = readFileSync(new URL("./legal.tsx", import.meta.url), "utf8");
  const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
  const setup = readFileSync(new URL("./setup.tsx", import.meta.url), "utf8");
  assert.match(legal, /Art\. 6 Abs\. 1 lit\. f DSGVO/);
  assert.match(legal, /Article 6 \(1\) \(f\) GDPR/);
  assert.match(legal, new RegExp(SAVE_KEY));
  assert.match(legal, /verlassen den Browser nicht/);
  assert.match(legal, /never leave the browser/);
  assert.match(legal, /sessionStorage/);
  assert.match(legal, /wird nicht verwendet/);
  assert.match(legal, /is not used/);
  assert.match(legal, /consolecheat-lang/);
  assert.match(legal, /consolecheat-theme/);
  assert.match(legal, /consolecheat-ex6-merkliste-v1/);
  assert.match(legal, /consolecheat-bildschirm-pattern/);
  assert.match(legal, /Recht auf Auskunft, Berichtigung, Löschung/);
  assert.match(legal, /nur den Schlüssel/);
  assert.match(legal, /Neues Turnier/);
  assert.doesNotMatch(legal, /webmail/i);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /:focus-visible/);
  assert.match(app, /aria-live/);
  assert.match(setup, /htmlFor=/);
  assert.match(app, /footerTools\("turnier"/);
});
