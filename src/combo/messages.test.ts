import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { BUILTINS } from "./combos.ts";
import { buttonLabel, comboTitle, copy, directionLabel, fill, formatRate, initialLang, languageOptions, stepPhrase } from "./messages.ts";
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
  assert.equal(copy.de.title, "Combo-Trainer");
  assert.equal(copy.en.title, "Combo trainer");
  assert.equal(copy.de.toolsHeading, "Weitere Werkzeuge");
  assert.equal(copy.en.toolsHeading, "Other tools");
  assert.equal(comboTitle(copy.de, "hadouken"), "Hadouken");
  assert.equal(comboTitle(copy.de, "halfcircle"), "Halbkreis");
  assert.equal(comboTitle(copy.en, "chain"), "Button chain");
  assert.equal(comboTitle(copy.de, "csofa0001", "Sofa"), "Sofa");
  assert.equal(directionLabel(copy.de, 2), "Runter");
  assert.equal(directionLabel(copy.en, 3), "Down-right");
  assert.equal(buttonLabel(copy.de, "square"), "Quadrat");
  assert.equal(buttonLabel(copy.en, "circle"), "Circle");
  assert.equal(stepPhrase(copy.de, 6, "square"), "Rechts + Quadrat");
  assert.equal(formatRate(66.7, "de"), "66,7 %");
  assert.equal(formatRate(100, "en"), "100%");
  assert.equal(fill(copy.de.resultSuccess, { frames: 12 }), "Getroffen. 12 Frames.");
  assert.equal(fill(copy.en.resultLate, { frames: 13, window: 12 }), "Late. 13 frames, window 12.");
  assert.match(copy.de.storageNote, new RegExp(SAVE_KEY));
  assert.match(copy.en.storageNote, new RegExp(SAVE_KEY));
  assert.match(copy.de.legendJkli, /J Quadrat/);
  assert.match(copy.en.legendUijk, /U square/);
  assert.match(copy.de.controls, /W A S D/);
  assert.equal(BUILTINS.every((combo) => combo.id in copy.de.names && combo.id in copy.en.names), true);
  assert.doesNotMatch(`${copy.de.lede}${copy.en.lede}${copy.de.title}`, /webmail/i);
});

test("privacy copy names Art. 6, the combo key, and local-only storage", () => {
  const legal = readFileSync(new URL("./legal.tsx", import.meta.url), "utf8");
  const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
  const editor = readFileSync(new URL("./editor.tsx", import.meta.url), "utf8");
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
  assert.doesNotMatch(legal, /webmail/i);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /:focus-visible/);
  assert.match(app, /aria-live/);
  assert.match(app, /isTypingTarget/);
  assert.match(editor, /htmlFor=/);
  assert.match(app, /footerTools\("combo"/);
});
