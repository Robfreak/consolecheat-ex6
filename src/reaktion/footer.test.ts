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
  "Tastenbelegung",
  "HDR/Helligkeit",
  "Audio-Kanal-Test",
  "USB-Stick-Checkliste",
  "PS-Plus-Quiz",
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
  "Button layout",
  "HDR / brightness",
  "Audio channel test",
  "USB stick checklist",
  "PS Plus quiz",
];

test("the reaction duel footer links to the other tools and the in-repo siblings, and omits itself", async () => {
  const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
  const game = readFileSync(new URL("./game.tsx", import.meta.url), "utf8");
  assert.match(app, /footerTools\("reaktion"/);
  assert.match(app, /merkliste: merklisteHref/);
  assert.match(app, /screen: screenHref/);
  assert.match(app, /download: downloadHref/);
  assert.match(app, /buttons: buttonsHref/);
  assert.match(app, /hdr: hdrHref/);
  assert.match(app, /audio: audioHref/);
  assert.match(app, /usb: usbHref/);
  assert.match(app, /bildschirm\//);
  assert.match(app, /download\//);
  assert.match(app, /tasten\//);
  assert.match(app, /hdr\//);
  assert.match(app, /audio\//);
  assert.match(app, /usb\//);
  assert.match(app, /quiz\//);
  assert.match(game, /consolecheat-ex3/);
  assert.doesNotMatch(app, /webmail/i);
  assert.doesNotMatch(game, /webmail/i);
  assert.doesNotMatch(app, /fetch\(/);

  const dir = mkdtempSync(join(fileURLToPath(new URL("../../node_modules/", import.meta.url)), "reaktion-footer-"));
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
            const links = footerTools("reaktion", lang, {
              href: {
                merkliste: "/consolecheat-ex6/",
                screen: "/consolecheat-ex6/bildschirm/",
                download: "/consolecheat-ex6/download/",
                buttons: "/consolecheat-ex6/tasten/",
                hdr: "/consolecheat-ex6/hdr/",
                audio: "/consolecheat-ex6/audio/",
                usb: "/consolecheat-ex6/usb/",
                quiz: "/consolecheat-ex6/quiz/",
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
        sourcefile: "reaktion-footer-render.tsx",
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
    assert.match(de, /href="\/consolecheat-ex6\/tasten\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/hdr\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/audio\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/usb\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/quiz\/"/);
    assert.match(de, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex1\/"/);
    assert.match(de, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex3\/"/);
    assert.match(de, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex5\/"/);
    for (const label of deTools) assert.match(de, new RegExp(`>${label}<`));
    assert.doesNotMatch(de, />Reaktions-Duell</);
    assert.doesNotMatch(de, /href="[^"]*\/reaktion\/"/);

    assert.match(en, /Other tools/);
    assert.match(en, /Back to the backlog/);
    for (const label of enTools) assert.match(en, new RegExp(`>${label}<`));
    assert.doesNotMatch(en, />Reaction duel</);
    assert.equal(en.match(/<a /g)?.length, 3 + deTools.length);
    assert.doesNotMatch(`${de}${en}`, /fonts\.googleapis|cdn\.jsdelivr|unpkg\.com|webmail|target=/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
