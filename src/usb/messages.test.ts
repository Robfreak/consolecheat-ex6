import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { checklistItems } from "./checklist.ts";
import { copy, initialLang, languageOptions } from "./messages.ts";

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
  assert.equal(copy.de.title, "USB-Stick-Checkliste");
  assert.equal(copy.en.title, "USB stick checklist");
  assert.equal(copy.de.toolsHeading, "Weitere Werkzeuge");
  assert.equal(copy.en.toolsHeading, "Other tools");
  assert.equal(copy.de.consoles.ps4, "PS4");
  assert.equal(copy.de.consoles.ps5, "PS5");
  assert.equal(copy.de.consoles.both, "Beide");
  assert.equal(copy.en.consoles.both, "Both");
  assert.equal(copy.de.progress, "{done} von {total}");
  assert.equal(copy.en.progress, "{done} of {total}");
  assert.match(copy.de.introFat, /FAT32/);
  assert.match(copy.de.introFat, /exFAT/);
  assert.match(copy.en.introFat, /FAT32/);
  assert.match(copy.de.introNoScan, /liest den Stick nicht/);
  assert.match(copy.en.introNoScan, /does not read the stick/);
  assert.match(copy.de.storageNote, /consolecheat-usb-checks-v1/);
  assert.match(copy.en.storageNote, /consolecheat-usb-checks-v1/);
  assert.match(copy.de.items["media-av-contents"].body, /nicht auf den Stick/);
  assert.match(copy.en.items["media-av-contents"].body, /Do not create AV_CONTENTS/);
  assert.match(copy.de.items["update-ps4"].body, /PS4UPDATE\.PUP/);
  assert.match(copy.en.items["update-ps5"].body, /PS5UPDATE\.PUP/);
  assert.match(copy.de.sections.extended, /Erweiterter Speicher/);
  assert.match(copy.en.sections.extended, /Extended storage/);
  for (const item of checklistItems) {
    assert.ok(copy.de.items[item.id].title.length > 0);
    assert.notEqual(copy.de.items[item.id].title, copy.en.items[item.id].title);
  }
  assert.doesNotMatch(`${copy.de.lede}${copy.en.lede}${copy.de.title}${copy.en.title}`, /webmail/i);
});

test("privacy copy names Art. 6, the checks key, and local-only storage", () => {
  const legal = readFileSync(new URL("./legal.tsx", import.meta.url), "utf8");
  assert.match(legal, /Art\. 6 Abs\. 1 lit\. f DSGVO/);
  assert.match(legal, /Article 6 \(1\) \(f\) GDPR/);
  assert.match(legal, /consolecheat-usb-checks-v1/);
  assert.match(legal, /verlassen den Browser nicht/);
  assert.match(legal, /never leave the browser/);
  assert.match(legal, /sessionStorage/);
  assert.match(legal, /wird nicht verwendet/);
  assert.match(legal, /is not used/);
  assert.match(legal, /keine personenbezogenen Daten/i);
  assert.match(legal, /USB-Geräteschnittstelle/);
  assert.match(legal, /no USB device API/);
  assert.match(legal, /consolecheat-lang/);
  assert.match(legal, /consolecheat-theme/);
  assert.match(legal, /consolecheat-ex6-merkliste-v1/);
  assert.match(legal, /consolecheat-bildschirm-pattern/);
  assert.match(legal, /Recht auf Auskunft, Berichtigung, Löschung/);
  assert.match(legal, /Widerspruch/);
  assert.match(legal, /Beschwerde bei einer Aufsichtsbehörde/);
  assert.match(legal, /\[Name einsetzen\]/);
  assert.match(legal, /\[insert name\]/);
  assert.doesNotMatch(legal, /webmail/i);
  assert.doesNotMatch(legal, /navigator\.usb|getUserMedia|type=["']file["']/i);
});
