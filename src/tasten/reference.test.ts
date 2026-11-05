import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { controlsFor, type LayoutId } from "./layout.ts";

function tab(html: string, id: string): string {
  const match = html.match(new RegExp(`<button[^>]*id="${id}"[^>]*>`));
  assert.ok(match, id);
  return match[0];
}

test("both layouts render in German and English, with labels and the controller tester", async () => {
  const dir = mkdtempSync(join(fileURLToPath(new URL("../../node_modules/", import.meta.url)), "tasten-render-"));
  const outfile = join(dir, "render.mjs");
  try {
    await esbuild.build({
      stdin: {
        contents: `
          import { createElement } from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { Reference } from "./reference.tsx";
          import { copy } from "./messages.ts";
          export function render(lang, layout) {
            return renderToStaticMarkup(createElement(Reference, {
              text: copy[lang],
              layout,
              onLayout() {},
            }));
          }
        `,
        resolveDir: fileURLToPath(new URL(".", import.meta.url)),
        sourcefile: "tasten-render.tsx",
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
      render: (lang: "de" | "en", layout: LayoutId) => string;
    };
    const deDs4 = rendered.render("de", "ds4");
    const deDs5 = rendered.render("de", "dualsense");
    const enDs4 = rendered.render("en", "ds4");
    const enDs5 = rendered.render("en", "dualsense");

    for (const html of [deDs4, deDs5, enDs4, enDs5]) {
      assert.match(html, /role="tablist"/);
      assert.match(html, /role="tabpanel"/);
      assert.match(html, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex3\/"/);
      assert.match(html, /aria-label="/);
      assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr|unpkg\.com|cdnjs\.cloudflare|googletagmanager|webmail|target=/i);
    }

    assert.match(tab(deDs4, "tab-ds4"), /aria-selected="true"/);
    assert.match(tab(deDs4, "tab-dualsense"), /aria-selected="false"/);
    assert.match(tab(deDs5, "tab-dualsense"), /aria-selected="true"/);
    assert.match(deDs4, /data-layout="ds4"/);
    assert.match(deDs5, /data-layout="dualsense"/);
    assert.match(deDs4, /Zum Controller-Tester/);
    assert.match(deDs4, /Geschwister/);
    assert.match(enDs4, /Open the controller tester/);
    assert.match(enDs4, /sibling/i);

    for (const id of controlsFor("ds4")) {
      assert.match(deDs4, new RegExp(`href="#control-${id}"`));
      assert.match(deDs4, new RegExp(`id="control-${id}"`));
      assert.match(enDs4, new RegExp(`href="#control-${id}"`));
    }
    for (const id of controlsFor("dualsense")) {
      assert.match(deDs5, new RegExp(`href="#control-${id}"`));
      assert.match(enDs5, new RegExp(`id="control-${id}"`));
    }
    assert.doesNotMatch(deDs4, /id="control-create"/);
    assert.doesNotMatch(deDs4, /id="control-mute"/);
    assert.doesNotMatch(deDs4, /href="#control-create"/);
    assert.doesNotMatch(enDs5, /id="control-share"/);
    assert.doesNotMatch(enDs5, /href="#control-share"/);

    assert.match(deDs4, /aria-label="× Kreuz"/);
    assert.match(deDs4, /aria-label="○ Kreis"/);
    assert.match(deDs4, /aria-label="□ Quadrat"/);
    assert.match(deDs4, /aria-label="△ Dreieck"/);
    assert.match(deDs4, />Steuerkreuz</);
    assert.match(deDs4, />Share</);
    assert.match(deDs4, /L3/);
    assert.match(deDs4, /R3/);
    assert.match(enDs4, /aria-label="× Cross"/);
    assert.match(enDs4, /aria-label="○ Circle"/);
    assert.match(enDs4, /aria-label="□ Square"/);
    assert.match(enDs4, /aria-label="△ Triangle"/);
    assert.match(enDs4, />D-pad</);
    assert.match(enDs4, />Left stick</);
    assert.match(enDs4, />Right stick</);
    assert.match(deDs5, />Create</);
    assert.match(deDs5, />Stummschalten</);
    assert.match(enDs5, />Mute</);
    assert.match(deDs4, /Touchpad/);
    assert.match(deDs4, />Options</);
    assert.match(deDs4, /PS-Taste/);
    assert.match(enDs4, /PS button/);
    assert.match(deDs4, /Unterschiede/);
    assert.match(enDs5, /Differences/);
    assert.match(enDs5, /voice-coil/);
    assert.match(deDs5, /Schwingspulen/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
