import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

function buttonTag(html: string, id: string): string {
  const match = html.match(new RegExp(`<button\\b[^>]*data-testid="${id}"[^>]*>`));
  assert.ok(match, id);
  return match[0];
}

test("channel buttons expose the active side and the instructions in both languages", async () => {
  const dir = mkdtempSync(join(fileURLToPath(new URL("../../node_modules/", import.meta.url)), "audio-render-"));
  const outfile = join(dir, "render.mjs");
  try {
    await esbuild.build({
      stdin: {
        contents: `
          import { createElement } from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { ChannelTester } from "./tester.tsx";
          import { copy } from "./messages.ts";
          function props(lang, extra) {
            const text = copy[lang];
            return {
              text,
              sound: "tone",
              volume: 0.4,
              playing: null,
              status: "idle",
              screenHref: "/consolecheat-ex6/bildschirm/",
              hdrHref: "/consolecheat-ex6/hdr/",
              onChannel() {},
              onSound() {},
              onVolume() {},
              onStop() {},
              ...extra,
            };
          }
          export function render(lang, extra) {
            return renderToStaticMarkup(createElement(ChannelTester, props(lang, extra)));
          }
        `,
        resolveDir: fileURLToPath(new URL(".", import.meta.url)),
        sourcefile: "audio-render.tsx",
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
      render: (lang: "de" | "en", extra?: Record<string, unknown>) => string;
    };

    const idle = rendered.render("de");
    assert.match(idle, /Kopfhörer oder Lautsprecher/);
    assert.match(idle, /vertauscht/);
    assert.match(idle, /TV-Durchleitung/);
    assert.match(idle, /Gestoppt\. Ein Klick/);
    assert.match(idle, /Tastatur: 1 links/);
    assert.match(idle, />Links</);
    assert.match(idle, />Rechts</);
    assert.match(idle, />Beide</);
    assert.match(idle, />Mitte</);
    assert.match(idle, />Ton</);
    assert.match(idle, />Rosa Rauschen</);
    assert.match(idle, />Piep</);
    assert.match(idle, />Stopp</);
    assert.match(idle, /Lautstärke/);
    assert.match(buttonTag(idle, "channel-left"), /aria-pressed="false"/);
    assert.match(buttonTag(idle, "channel-right"), /aria-pressed="false"/);
    assert.match(buttonTag(idle, "channel-both"), /aria-pressed="false"/);
    assert.match(buttonTag(idle, "sound-tone"), /aria-pressed="true"/);
    assert.match(buttonTag(idle, "stop"), /disabled/);
    assert.match(idle, /data-testid="lamp-left"[^>]*data-on="false"|data-on="false"[^>]*data-testid="lamp-left"/);
    assert.match(idle, /href="\/consolecheat-ex6\/bildschirm\/"/);
    assert.match(idle, /href="\/consolecheat-ex6\/hdr\/"/);
    assert.match(idle, /data-testid="screen-test-link"/);
    assert.match(idle, />Zum Bildschirm-Test</);
    assert.match(idle, />Zur HDR-Hilfe</);
    assert.match(idle, /value="40"/);
    assert.doesNotMatch(idle, /webmail|fonts\.googleapis|getUserMedia/i);

    const left = rendered.render("de", { playing: "left", status: "playing" });
    assert.match(buttonTag(left, "channel-left"), /aria-pressed="true"/);
    assert.match(buttonTag(left, "channel-right"), /aria-pressed="false"/);
    assert.match(buttonTag(left, "channel-both"), /aria-pressed="false"/);
    assert.match(left, /Links spielt\./);
    assert.match(left, /data-testid="lamp-left"[^>]*data-on="true"|data-on="true"[^>]*data-testid="lamp-left"/);
    assert.match(left, /data-testid="lamp-right"[^>]*data-on="false"|data-on="false"[^>]*data-testid="lamp-right"/);
    assert.match(left, /data-testid="lamp-center"[^>]*data-on="false"|data-on="false"[^>]*data-testid="lamp-center"/);
    assert.doesNotMatch(buttonTag(left, "stop"), /disabled/);

    const both = rendered.render("en", { playing: "both", status: "playing", sound: "pink" });
    assert.match(both, /Use headphones or speakers/);
    assert.match(both, /swapped/);
    assert.match(both, /TV passthrough/);
    assert.match(both, /Both channels are playing/);
    assert.match(both, />Left</);
    assert.match(both, />Right</);
    assert.match(both, />Both</);
    assert.match(both, />Center</);
    assert.match(both, />Pink noise</);
    assert.match(both, /Open the screen test/);
    assert.match(both, /Open the HDR helper/);
    assert.match(buttonTag(both, "channel-both"), /aria-pressed="true"/);
    assert.match(buttonTag(both, "channel-left"), /aria-pressed="false"/);
    assert.match(buttonTag(both, "sound-pink"), /aria-pressed="true"/);
    assert.match(both, /data-testid="lamp-left"[^>]*data-on="true"|data-on="true"[^>]*data-testid="lamp-left"/);
    assert.match(both, /data-testid="lamp-right"[^>]*data-on="true"|data-on="true"[^>]*data-testid="lamp-right"/);
    assert.match(both, /data-testid="lamp-center"[^>]*data-on="true"|data-on="true"[^>]*data-testid="lamp-center"/);

    const suspended = rendered.render("en", { status: "suspended" });
    assert.match(suspended, /holding the sound until you click/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
