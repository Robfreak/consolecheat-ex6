import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { copy } from "./messages.ts";
import { pickerItems } from "./picker-model.ts";
import { patterns } from "./patterns.ts";

test("pattern list renders in German and English", async () => {
  const dir = mkdtempSync(join(fileURLToPath(new URL("../../node_modules/", import.meta.url)), "bildschirm-render-"));
  const outfile = join(dir, "render.mjs");
  try {
    await esbuild.build({
      stdin: {
        contents: `
          import { createElement } from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { PatternPicker } from "./picker.tsx";
          export function renderList(label, items) {
            return renderToStaticMarkup(createElement(PatternPicker, {
              label,
              items,
              columns: 3,
              onOpen() {},
            }));
          }
        `,
        resolveDir: fileURLToPath(new URL(".", import.meta.url)),
        sourcefile: "render-entry.tsx",
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
    const rendered = await import(pathToFileURL(outfile).href);
    for (const lang of ["de", "en"] as const) {
      const items = pickerItems(copy[lang]);
      const html = rendered.renderList(copy[lang].patternsHeading, items) as string;
      assert.match(html, /data-testid="pattern-list"/);
      assert.equal(html.match(/data-pattern="/g)?.length, patterns.length);
      for (const item of items) {
        assert.ok(html.includes(item.name), `${lang} ${item.name}`);
        assert.ok(html.includes(`data-pattern="${item.id}"`));
        assert.ok(html.includes(item.description));
      }
      assert.doesNotMatch(html, /fonts\.googleapis|cdn\.jsdelivr|unpkg\.com|googletagmanager/i);
    }
    const german = rendered.renderList(copy.de.patternsHeading, pickerItems(copy.de)) as string;
    assert.match(german, /Testbilder/);
    assert.match(german, /aria-keyshortcuts="1"/);
    assert.match(german, /aria-keyshortcuts="0"/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
