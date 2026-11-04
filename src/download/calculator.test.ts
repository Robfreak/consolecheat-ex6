import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

test("the calculator shows the default duration and recalculates from its inputs", async () => {
  const dir = mkdtempSync(join(fileURLToPath(new URL("../../node_modules/", import.meta.url)), "download-calc-"));
  const outfile = join(dir, "render.mjs");
  try {
    await esbuild.build({
      stdin: {
        contents: `
          import { createElement } from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { Calculator } from "./calculator.tsx";
          import { copy } from "./messages.ts";
          export function render(lang, props) {
            const text = copy[lang];
            return renderToStaticMarkup(createElement(Calculator, {
              text,
              lang,
              onSizeRaw() {},
              onSizeUnit() {},
              onSpeedRaw() {},
              onSpeedUnit() {},
              ...props,
            }));
          }
        `,
        resolveDir: fileURLToPath(new URL(".", import.meta.url)),
        sourcefile: "calculator-render.tsx",
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
      render: (lang: "de" | "en", props: Record<string, string>) => string;
    };
    const defaults = { sizeRaw: "50", sizeUnit: "GB", speedRaw: "100", speedUnit: "Mbps" };
    const de = rendered.render("de", defaults);
    const en = rendered.render("en", defaults);

    assert.match(de, /for="game-size"/);
    assert.match(de, /id="game-size"/);
    assert.match(de, /Spielgröße/);
    assert.match(de, /Leitung \/ Geschwindigkeit/);
    assert.match(de, /for="line-speed"/);
    assert.match(de, /id="size-unit"/);
    assert.match(de, /id="speed-unit"/);
    assert.match(de, /Mbit\/s/);
    assert.match(de, /MB\/s/);
    assert.match(de, /aria-pressed="true"[^>]*>50 GB</);
    assert.match(de, /aria-pressed="false"[^>]*>20 GB</);
    assert.match(de, /aria-pressed="true"[^>]*>100 Mbit\/s</);
    assert.match(de, /aria-pressed="false"[^>]*>250 Mbit\/s</);
    assert.match(de, />80 GB</);
    assert.match(de, />100 GB</);
    assert.match(de, />50 Mbit\/s</);
    assert.match(de, />1000 Mbit\/s</);
    assert.match(de, /id="download-result"/);
    assert.match(de, /role="status"/);
    assert.match(de, /1 Stunde 6 Minuten 40 Sekunden/);
    assert.match(de, /50 GB × 8 Bit\/Byte ÷ 100 Mbit\/s ≈ 4\.000 s/);
    assert.match(de, /1 Byte = 8 Bit/);
    assert.match(de, /Overhead/);
    assert.doesNotMatch(de, /aria-invalid/);
    assert.doesNotMatch(de, /playstation|ps store|webmail/i);

    assert.match(en, /Game size/);
    assert.match(en, /Line speed/);
    assert.match(en, /1 hour 6 minutes 40 seconds/);
    assert.match(en, /50 GB × 8 bits\/byte ÷ 100 Mbit\/s ≈ 4,000 s/);
    assert.match(en, /Common game sizes/);
    assert.match(en, /Common line speeds/);

    const megabyte = rendered.render("de", { sizeRaw: "1", sizeUnit: "MB", speedRaw: "1", speedUnit: "MBps" });
    assert.match(megabyte, /1 Sekunde/);
    assert.match(megabyte, /1 MB × 8 Bit\/Byte ÷ \(1 MB\/s × 8\) ≈ 1 s/);
    assert.match(megabyte, /aria-pressed="false"[^>]*>50 GB</);
    assert.match(megabyte, /aria-pressed="false"[^>]*>100 Mbit\/s</);

    const empty = rendered.render("de", { ...defaults, sizeRaw: "" });
    assert.match(empty, /Größe und Geschwindigkeit eintragen/);
    assert.doesNotMatch(empty, /Bit\/Byte/);

    const invalid = rendered.render("en", { ...defaults, speedRaw: "fast" });
    assert.match(invalid, /aria-invalid="true"/);
    assert.match(invalid, /Enter a number from 0 up/);
    assert.doesNotMatch(invalid, /bits\/byte/);

    const zero = rendered.render("de", { ...defaults, speedRaw: "0" });
    assert.match(zero, /Die Geschwindigkeit ist 0/);
    assert.doesNotMatch(zero, /Bit\/Byte/);

    const zeroSize = rendered.render("de", { ...defaults, sizeRaw: "0" });
    assert.match(zeroSize, /0 Sekunden/);
    assert.match(zeroSize, /0 GB × 8 Bit\/Byte/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
