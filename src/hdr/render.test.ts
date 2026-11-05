import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { copy } from "./messages.ts";
import { pickerItems } from "./picker-model.ts";
import { patterns } from "./patterns.ts";

test("patterns and the guide render in German and English", async () => {
  const dir = mkdtempSync(join(fileURLToPath(new URL("../../node_modules/", import.meta.url)), "hdr-render-"));
  const outfile = join(dir, "render.mjs");
  try {
    await esbuild.build({
      stdin: {
        contents: `
          import { createElement } from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { Guide } from "./guide.tsx";
          import { PatternFill, PatternPicker } from "./pattern-view.tsx";
          import { copy } from "./messages.ts";
          import { patterns } from "./patterns.ts";
          import { pickerItems } from "./picker-model.ts";
          export function renderList(lang) {
            const text = copy[lang];
            return renderToStaticMarkup(createElement(PatternPicker, {
              label: text.patternsHeading,
              items: pickerItems(text),
              columns: 1,
              onOpen() {},
            }));
          }
          export function renderPattern(id, lang) {
            const pattern = patterns.find((item) => item.id === id);
            return renderToStaticMarkup(createElement(PatternFill, {
              pattern,
              whiteChip: copy[lang].whiteChip,
            }));
          }
          export function renderGuide(lang, range) {
            return renderToStaticMarkup(createElement(Guide, {
              text: copy[lang],
              screenHref: "/consolecheat-ex6/bildschirm/",
              range,
            }));
          }
        `,
        resolveDir: fileURLToPath(new URL(".", import.meta.url)),
        sourcefile: "hdr-render.tsx",
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
      renderList: (lang: "de" | "en") => string;
      renderPattern: (id: string, lang: "de" | "en") => string;
      renderGuide: (lang: "de" | "en", range: "high" | "standard" | "unknown") => string;
    };

    for (const lang of ["de", "en"] as const) {
      const list = rendered.renderList(lang);
      assert.match(list, /data-testid="pattern-list"/);
      assert.equal(list.match(/data-pattern="/g)?.length, patterns.length);
      for (const item of pickerItems(copy[lang])) {
        assert.ok(list.includes(item.name), `${lang} ${item.name}`);
        assert.ok(list.includes(`data-pattern="${item.id}"`));
        assert.ok(list.includes(item.description));
      }
      assert.doesNotMatch(list, /https?:/i);

      const guide = rendered.renderGuide(lang, lang === "de" ? "unknown" : "high");
      assert.match(guide, /data-testid="guide"/);
      assert.match(guide, /data-testid="hdr-note"/);
      assert.match(guide, /data-testid="dynamic-range"/);
      assert.match(guide, /data-testid="screen-test-link"/);
      assert.match(guide, /href="\/consolecheat-ex6\/bildschirm\/"/);
      assert.match(guide, new RegExp(copy[lang].guide.screenLink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.match(guide, /PQ/);
      assert.match(guide, /EOTF/);
      assert.match(guide, /dynamic-range:\s*high/);
      assert.doesNotMatch(guide, /fonts\.googleapis|cdn\.jsdelivr|unpkg\.com|webmail/i);
    }

    const german = rendered.renderGuide("de", "standard");
    const english = rendered.renderGuide("en", "high");
    assert.match(german, /Kurzanleitung/);
    assert.match(german, /Zum Bildschirm-Test/);
    assert.match(german, /normalen Dynamikumfang/);
    assert.match(english, /Short guide/);
    assert.match(english, /Open the screen test/);
    assert.match(english, /high dynamic range/);

    const nearBlack = rendered.renderPattern("near-black", "de");
    assert.match(nearBlack, /data-testid="steps"/);
    assert.match(nearBlack, /data-code="0"/);
    assert.match(nearBlack, /#000000/);
    assert.match(nearBlack, /#030303/);
    assert.match(nearBlack, /#0d0d0d/);
    assert.match(nearBlack, />0%</);
    assert.match(nearBlack, />5%</);

    const pluge = rendered.renderPattern("pluge", "de");
    assert.match(pluge, /data-testid="pluge"/);
    assert.match(pluge, /data-code="0"/);
    assert.match(pluge, /data-code="2"/);
    assert.match(pluge, /data-code="4"/);
    assert.match(pluge, /data-outline="true"/);
    assert.match(pluge, />Weiß</);
    assert.match(pluge, /#ffffff/);

    const clip = rendered.renderPattern("white-clip", "en");
    assert.match(clip, /data-code="235"/);
    assert.match(clip, /data-code="255"/);
    assert.match(clip, /#ebebeb/);
    assert.match(clip, /#ffffff/);

    const ramp = rendered.renderPattern("gray-ramp", "en");
    assert.match(ramp, /data-testid="gray-ramp"/);
    assert.match(ramp, /<canvas/);
    assert.match(ramp, /linear-gradient\(to right, #000000, #ffffff\)/);
    assert.match(ramp, /data-code="16"/);
    assert.match(ramp, /data-code="128"/);
    assert.match(ramp, />20%</);
    assert.match(ramp, />50%</);
    assert.match(ramp, />80%</);
    assert.match(ramp, /#808080/);
    assert.doesNotMatch(`${nearBlack}${pluge}${clip}${ramp}`, /https?:/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
