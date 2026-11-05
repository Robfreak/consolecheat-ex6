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
  "Tastenbelegung",
  "HDR/Helligkeit",
  "Audio-Kanal-Test",
];

const enTools = [
  "Title-ID-Finder",
  "PS Plus archive",
  "Controller tester",
  "Save info reader",
  "Error code lookup",
  "Spiele-Merkliste",
  "Screen test",
  "Button layout",
  "HDR / brightness",
  "Audio channel test",
];

test("the download footer links to the other tools and the in-repo siblings", async () => {
  const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
  assert.match(app, /footerTools\("download"/);
  assert.match(app, /merkliste: merklisteHref/);
  assert.match(app, /screen: screenHref/);
  assert.match(app, /bildschirm\//);
  assert.match(app, /tasten\//);
  assert.match(app, /hdr\//);
  assert.match(app, /audio\//);
  assert.doesNotMatch(app, /webmail/i);
  assert.doesNotMatch(app, /fetch\(/);

  const dir = mkdtempSync(join(fileURLToPath(new URL("../../node_modules/", import.meta.url)), "download-footer-"));
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
            const links = footerTools("download", lang, {
              href: {
                merkliste: "/consolecheat-ex6/",
                screen: "/consolecheat-ex6/bildschirm/",
                buttons: "/consolecheat-ex6/tasten/",
                hdr: "/consolecheat-ex6/hdr/",
                audio: "/consolecheat-ex6/audio/",
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
        sourcefile: "download-footer-render.tsx",
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
    assert.match(de, /href="\/consolecheat-ex6\/tasten\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/hdr\/"/);
    assert.match(de, /href="\/consolecheat-ex6\/audio\/"/);
    assert.match(de, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex1\/"/);
    assert.match(de, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex5\/"/);
    for (const label of deTools) assert.match(de, new RegExp(`>${label}<`));
    assert.doesNotMatch(de, />Download-Zeit-Rechner</);
    assert.doesNotMatch(de, /href="[^"]*\/download\/"/);

    assert.match(en, /Other tools/);
    assert.match(en, /Back to the backlog/);
    for (const label of enTools) assert.match(en, new RegExp(`>${label}<`));
    assert.doesNotMatch(en, />Download time calculator</);
    assert.equal(en.match(/<a /g)?.length, 3 + deTools.length);
    assert.doesNotMatch(`${de}${en}`, /fonts\.googleapis|cdn\.jsdelivr|unpkg\.com|webmail|target=/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
