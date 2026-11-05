import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copy, initialLang, languageOptions } from "./messages.ts";
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
    assert.ok(String(english).length > 0, key);
  }
  assert.equal(copy.de.title, "HDR- und Helligkeits-Hilfe");
  assert.equal(copy.en.title, "HDR and brightness helper");
  assert.equal(copy.de.toolsHeading, "Weitere Werkzeuge");
  assert.equal(copy.en.toolsHeading, "Other tools");
  assert.notEqual(copy.de.lede, copy.en.lede);
  for (const id of PATTERN_IDS) {
    assert.ok(copy.de.patterns[id].name.length > 0);
    assert.ok(copy.en.patterns[id].hint.length > 0);
  }
});

test("guide i18n keys state the HDR limits in both languages", () => {
  const guideKeys = [
    "heading",
    "canHeading",
    "canIntro",
    "canBlack",
    "canPluge",
    "canWhite",
    "canGray",
    "cannotHeading",
    "cannotIntro",
    "cannotPeak",
    "cannotPq",
    "cannotCert",
    "cannotConsole",
    "howHeading",
    "how1",
    "how2",
    "how3",
    "how4",
    "how5",
    "screenHeading",
    "screenBody",
    "screenLink",
  ] as const;
  const noteKeys = ["heading", "body", "probeLabel", "high", "standard", "unknown", "notCertified"] as const;
  assert.deepEqual(Object.keys(copy.de.guide).sort(), [...guideKeys].sort());
  assert.deepEqual(Object.keys(copy.en.guide).sort(), [...guideKeys].sort());
  assert.deepEqual(Object.keys(copy.de.hdrNote).sort(), [...noteKeys].sort());
  assert.deepEqual(Object.keys(copy.en.hdrNote).sort(), [...noteKeys].sort());

  for (const lang of ["de", "en"] as const) {
    const text = `${JSON.stringify(copy[lang].guide)}\n${JSON.stringify(copy[lang].hdrNote)}`;
    assert.match(text, /PQ/);
    assert.match(text, /EOTF/);
    assert.match(text, /nits/i);
    assert.match(text, /dynamic-range:\s*high/);
    assert.match(copy[lang].guide.canBlack, /0\s*%/);
    assert.match(copy[lang].guide.canBlack, /5\s*%/);
    assert.match(copy[lang].guide.screenBody, /Bildschirm|screen test/i);
  }
  assert.equal(copy.de.guide.screenLink, "Zum Bildschirm-Test");
  assert.equal(copy.en.guide.screenLink, "Open the screen test");
  assert.match(copy.de.hdrNote.notCertified, /kein Zertifikat/);
  assert.match(copy.en.hdrNote.notCertified, /not a certification/);
  assert.match(copy.de.guide.cannotPq, /PQ EOTF/);
  assert.match(copy.en.guide.cannotPeak, /nits/);
  assert.notEqual(copy.de.guide.cannotIntro, copy.en.guide.cannotIntro);
});

test("privacy copy names Art. 6, the session pattern, and the rights from the other tools", () => {
  const legal = readFileSync(new URL("./legal.tsx", import.meta.url), "utf8");
  assert.match(legal, /Art\. 6 Abs\. 1 lit\. f DSGVO/);
  assert.match(legal, /sessionStorage/);
  assert.match(legal, /consolecheat-hdr-pattern/);
  assert.match(legal, /keine personenbezogenen Daten/i);
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
});
