import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

const deTools = [
  "Title-ID-Finder",
  "PS-Plus-Archiv",
  "Controller-Tester",
  "Save-Info-Leser",
  "Fehlercode-Nachschlager",
  "Spiele-Merkliste",
  "Bildschirm-Test",
  "Download-Zeit-Rechner",
  "HDR/Helligkeit",
  "Audio-Kanal-Test",
  "USB-Stick-Checkliste",
  "Reaktions-Duell",
  "PS-Plus-Quiz",
  "Controller-Rhythmus",
  "Speedrun-Timer",
  "Pixel-Avatar-Studio",
  "Couch-Turnier-Planer",
  "Combo-Trainer",
  "Sprite-Animator",
];

const enTools = [
  "Title-ID-Finder",
  "PS Plus archive",
  "Controller tester",
  "Save info reader",
  "Error code lookup",
  "Spiele-Merkliste",
  "Screen test",
  "Download time calculator",
  "HDR / brightness",
  "Audio channel test",
  "USB stick checklist",
  "Reaction duel",
  "PS Plus quiz",
  "Controller rhythm",
  "Speedrun timer",
  "Pixel avatar studio",
  "Couch tournament planner",
  "Combo trainer",
  "Sprite animator",
];

test("the button-layout footer links to the other tools and the in-repo siblings", async () => {
  const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
  assert.match(app, /footerTools\("buttons"/);
  assert.match(app, /merkliste: merklisteHref/);
  assert.match(app, /screen: screenHref/);
  assert.match(app, /download: downloadHref/);
  assert.match(app, /bildschirm\//);
  assert.match(app, /download\//);
  assert.match(app, /hdr\//);
  assert.match(app, /audio\//);
  assert.match(app, /usb\//);
  assert.match(app, /reaktion\//);
  assert.match(app, /quiz\//);
  assert.match(app, /rhythmus\//);
  assert.match(app, /speedrun\//);
  assert.doesNotMatch(app, /webmail/i);
  assert.doesNotMatch(app, /fetch\(/);

  const dir = mkdtempSync(join(fileURLToPath(new URL("../../node_modules/", import.meta.url)), "tasten-footer-"));
  const outfile = join(dir, "render.mjs");
  try {
    await esbuild.build({
      stdin: {
        contents: `
          import { createElement } from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { SiteFooter } from "./chrome.tsx";
          import { copy } from "./messages.ts";
          import { footerTools } from "./tools.ts";
          export function render(lang) {
            const text = copy[lang];
            const links = footerTools("buttons", lang, {
              href: {
                merkliste: "/consolecheat-ex6/",
                screen: "/consolecheat-ex6/bildschirm/",
                download: "/consolecheat-ex6/download/",
                hdr: "/consolecheat-ex6/hdr/",
                audio: "/consolecheat-ex6/audio/",
                usb: "/consolecheat-ex6/usb/",
                reaktion: "/consolecheat-ex6/reaktion/",
                quiz: "/consolecheat-ex6/quiz/",
                rhythmus: "/consolecheat-ex6/rhythmus/",
                speedrun: "/consolecheat-ex6/speedrun/",
                avatar: "/consolecheat-ex6/avatar/",
                turnier: "/consolecheat-ex6/turnier/",
                combo: "/consolecheat-ex6/combo/",
              },
            });
            return renderToStaticMarkup(createElement(SiteFooter, {
              text,
              merklisteHref: "/consolecheat-ex6/",
              tools: links,
              onLegal() {},
            }));
          }
        `,
        resolveDir: fileURLToPath(new URL(".", import.meta.url)),
        sourcefile: "tasten-footer-render.tsx",
        loader: "tsx",
      },
      bundle: true,
      packages: "external",
      format: "esm",
      platform: "node",
      outfile,
      jsx: "automatic",
      logLevel: "silent",
    });
    const rendered = (await import(pathToFileURL(outfile).href)) as {
      render: (lang: "de" | "en") => string;
    };
    const de = rendered.render("de");
    const en = rendered.render("en");

    assert.match(de, /Weitere Werkzeuge/);
    assert.match(de, /Impressum/);
    assert.match(de, /Datenschutz/);
    assert.match(de, /Zur Merkliste/);
    assert.match(de, /href="\/consolecheat-ex6\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/bildschirm\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/download\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/hdr\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/audio\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/usb\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/reaktion\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/quiz\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/rhythmus\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/speedrun\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/avatar\/"/);
    assert.match(de, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex1\/"/);
    assert.match(de, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex3\/"/);
    assert.match(de, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex5\/"/);
    for (const label of deTools) assert.match(de, new RegExp(`>${label}<`));
    assert.doesNotMatch(de, />Tastenbelegung</);
    assert.doesNotMatch(de, /href="[^"]*\/tasten\/"/);

    assert.match(en, /Other tools/);
    assert.match(en, /Back to the backlog/);
    for (const label of enTools) assert.match(en, new RegExp(`>${label}<`));
    assert.doesNotMatch(en, />Button layout</);
    assert.equal(en.match(/<a /g)?.length, 3 + deTools.length);
    assert.doesNotMatch(`${de}${en}`, /fonts\.googleapis|cdn\.jsdelivr|unpkg\.com|webmail|target=/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
