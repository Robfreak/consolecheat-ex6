import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
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
    assert.ok(String(english).length > 0, key);
  }
  assert.equal(copy.de.title, "Audio-Kanal-Test");
  assert.equal(copy.en.title, "Audio channel test");
  assert.equal(copy.de.toolsHeading, "Weitere Werkzeuge");
  assert.equal(copy.en.toolsHeading, "Other tools");
  assert.equal(copy.de.channelLeft, "Links");
  assert.equal(copy.de.channelRight, "Rechts");
  assert.equal(copy.de.channelBoth, "Beide");
  assert.equal(copy.de.channelCenter, "Mitte");
  assert.equal(copy.en.channelLeft, "Left");
  assert.equal(copy.en.channelRight, "Right");
  assert.equal(copy.en.channelBoth, "Both");
  assert.equal(copy.en.channelCenter, "Center");
  assert.equal(copy.de.soundTone, "Ton");
  assert.equal(copy.en.soundTone, "Tone");
  assert.equal(copy.de.soundPink, "Rosa Rauschen");
  assert.equal(copy.en.soundPink, "Pink noise");
  assert.equal(copy.de.soundBeep, "Piep");
  assert.equal(copy.en.soundBeep, "Beep");
  assert.equal(copy.de.stop, "Stopp");
  assert.equal(copy.en.stop, "Stop");
  assert.match(copy.de.instructionHeadphones, /Kopfhörer/);
  assert.match(copy.en.instructionHeadphones, /headphones/i);
  assert.match(copy.de.instructionSwap, /vertauscht/);
  assert.match(copy.en.instructionSwap, /swapped/);
  assert.match(copy.de.instructionCaveat, /Durchleitung/);
  assert.match(copy.en.instructionCaveat, /passthrough/i);
  assert.match(copy.de.statusSuspended, /klicken/i);
  assert.match(copy.en.statusSuspended, /click/i);
  assert.match(copy.de.statusIdle, /Klick/);
  assert.match(copy.de.keyboardHint, /Esc/);
  assert.match(copy.en.keyboardHint, /Esc/);
  assert.notEqual(copy.de.statusBoth, copy.en.statusBoth);
  assert.doesNotMatch(`${copy.de.title}${copy.en.title}${copy.de.lede}${copy.en.lede}`, /webmail/i);
});

test("privacy copy names Art. 6, on-device Web Audio, and the shared language keys", () => {
  const legal = readFileSync(new URL("./legal.tsx", import.meta.url), "utf8");
  assert.match(legal, /Art\. 6 Abs\. 1 lit\. f DSGVO/);
  assert.match(legal, /Web Audio/);
  assert.match(legal, /OscillatorNode/);
  assert.match(legal, /BufferSource/);
  assert.match(legal, /verlässt\s+das Gerät nicht/);
  assert.match(legal, /does not leave the device/);
  assert.match(legal, /kein Mikrofon/);
  assert.match(legal, /sessionStorage/);
  assert.match(legal, /wird nicht verwendet/);
  assert.match(legal, /werden nicht gespeichert/);
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
  assert.doesNotMatch(legal, /getUserMedia/);
});
