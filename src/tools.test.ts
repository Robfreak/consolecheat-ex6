import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { copy } from "./messages.ts";
import { footerTools, toolLinks, type ToolId } from "./tools.ts";

const removedPages = ["bildschirm", "download", "tasten", "hdr", "audio", "usb", "combo", "sprite"] as const;

const expected: { id: ToolId; href: string; de: string; en: string }[] = [
  { id: "finder", href: "https://robfreak.github.io/consolecheat-ex1/", de: "Title-ID-Finder", en: "Title-ID-Finder" },
  { id: "archive", href: "https://robfreak.github.io/consolecheat-ex2/", de: "PS-Plus-Archiv", en: "PS Plus archive" },
  { id: "controller", href: "https://robfreak.github.io/consolecheat-ex3/", de: "Controller-Tester", en: "Controller tester" },
  { id: "save", href: "https://robfreak.github.io/consolecheat-ex4/", de: "Save-Info-Leser", en: "Save info reader" },
  { id: "codes", href: "https://robfreak.github.io/consolecheat-ex5/", de: "Fehlercode-Nachschlager", en: "Error code lookup" },
  { id: "merkliste", href: "https://robfreak.github.io/consolecheat-ex6/", de: "Spiele-Merkliste", en: "Spiele-Merkliste" },
  { id: "screen", href: "https://robfreak.github.io/consolecheat-ex7/", de: "Bildschirm-Test", en: "Screen test" },
  { id: "download", href: "https://robfreak.github.io/consolecheat-ex8/", de: "Download-Zeit-Rechner", en: "Download time calculator" },
  { id: "buttons", href: "https://robfreak.github.io/consolecheat-ex9/", de: "Tastenbelegung", en: "Button layout" },
  { id: "hdr", href: "https://robfreak.github.io/consolecheat-ex10/", de: "HDR/Helligkeit", en: "HDR / brightness" },
  { id: "audio", href: "https://robfreak.github.io/consolecheat-ex11/", de: "Audio-Kanal-Test", en: "Audio channel test" },
  { id: "usb", href: "https://robfreak.github.io/consolecheat-ex12/", de: "USB-Stick-Checkliste", en: "USB stick checklist" },
  { id: "combo", href: "https://robfreak.github.io/consolecheat-ex13/", de: "Combo-Trainer", en: "Combo trainer" },
  { id: "sprite", href: "https://robfreak.github.io/consolecheat-ex14/", de: "Sprite-Animator", en: "Sprite animator" },
];

const footerIds = expected.filter((tool) => tool.id !== "merkliste").map((tool) => tool.id);

test("the merkliste footer points at each sibling and leaves this page out", () => {
  assert.deepEqual(
    toolLinks.map((tool) => ({ id: tool.id, href: tool.href, de: tool.de, en: tool.en })),
    expected,
  );
  assert.equal(toolLinks.find((tool) => tool.id === "finder")?.de, copy.de.finder);
  assert.equal(toolLinks.find((tool) => tool.id === "finder")?.en, copy.en.finder);
  assert.equal(toolLinks.find((tool) => tool.id === "archive")?.de, copy.de.archive);
  assert.equal(toolLinks.find((tool) => tool.id === "archive")?.en, copy.en.archive);
  assert.equal(toolLinks.find((tool) => tool.id === "merkliste")?.de, copy.de.title);
  assert.equal(toolLinks.find((tool) => tool.id === "merkliste")?.en, copy.en.title);

  for (const lang of ["de", "en"] as const) {
    const backlog = footerTools("merkliste", lang);
    assert.deepEqual(
      backlog.map((tool) => tool.id),
      footerIds,
    );
    for (const tool of expected) {
      if (tool.id === "merkliste") {
        assert.equal(backlog.some((link) => link.id === "merkliste"), false);
        continue;
      }
      const link = backlog.find((item) => item.id === tool.id);
      assert.equal(link?.href, tool.href);
      assert.equal(link?.label, tool[lang]);
      assert.match(link?.href ?? "", /^https:\/\/robfreak\.github\.io\/consolecheat-ex\d+\/$/);
    }
    assert.equal(backlog.some((tool) => tool.href.includes("/consolecheat-ex6/")), false);
    assert.equal(backlog.some((tool) => tool.href === "https://consolecheat.com"), false);
  }
});

test("moved pages are gone, and the footer only anchors the new homes", async () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  for (const name of removedPages) {
    assert.equal(existsSync(join(root, name)), false, name);
    assert.equal(existsSync(join(root, "src", name)), false, `src/${name}`);
  }

  const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
  const vite = readFileSync(new URL("../vite.config.ts", import.meta.url), "utf8");
  const pkg = readFileSync(new URL("../package.json", import.meta.url), "utf8");
  const check = readFileSync(new URL("../scripts/check-dist.mjs", import.meta.url), "utf8");
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  assert.match(app, /finderHref\(/);
  assert.match(app, /archiveHref\(/);
  assert.match(app, /footerTools\("merkliste", lang\)/);
  assert.doesNotMatch(app, /bildschirm\/|download\/|tasten\/|\/hdr\/|audio\/|usb\/|combo\/|sprite\//);
  assert.doesNotMatch(app, /fetch\(\s*["']https:\/\/robfreak\.github\.io/);
  assert.doesNotMatch(vite, /bildschirm|download\/index|tasten\/index|hdr\/index|audio\/index|usb\/index/);
  assert.doesNotMatch(pkg, /src\/bildschirm|src\/download|src\/tasten|src\/hdr|src\/audio|src\/usb/);
  assert.match(check, /missing page index\.html/);
  assert.doesNotMatch(check, /missing page .*bildschirm|join\("bildschirm"|join\("download"|join\("tasten"|join\("hdr"|join\("audio"|join\("usb"/);
  assert.doesNotMatch(readme, /Move the|temporary home|\/consolecheat-ex6\/bildschirm\/|\/consolecheat-ex6\/download\/|\/consolecheat-ex6\/tasten\/|\/consolecheat-ex6\/hdr\/|\/consolecheat-ex6\/audio\/|\/consolecheat-ex6\/usb\//);
  for (let n = 7; n <= 14; n += 1) {
    assert.match(readme, new RegExp(`https://github.com/Robfreak/consolecheat-ex${n}`));
    assert.match(readme, new RegExp(`https://robfreak\\.github\\.io/consolecheat-ex${n}/`));
  }

  const dir = mkdtempSync(join(fileURLToPath(new URL("../node_modules/", import.meta.url)), "tool-links-"));
  const outfile = join(dir, "render.mjs");
  try {
    await esbuild.build({
      stdin: {
        contents: `
          import { createElement } from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { ToolLinks } from "./tool-links.tsx";
          import { copy as backlog } from "./messages.ts";
          import { footerTools } from "./tools.ts";
          export function renderBacklog(lang) {
            const text = backlog[lang];
            const links = footerTools("merkliste", lang);
            return renderToStaticMarkup(createElement(ToolLinks, { heading: text.toolsHeading, links }));
          }
        `,
        resolveDir: fileURLToPath(new URL(".", import.meta.url)),
        sourcefile: "tool-render.tsx",
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
    const backlogDe = rendered.renderBacklog("de") as string;
    const backlogEn = rendered.renderBacklog("en") as string;

    assert.match(backlogDe, /Weitere Werkzeuge/);
    assert.match(backlogDe, /aria-labelledby="more-tools-heading"/);
    assert.match(backlogEn, /Other tools/);
    for (const tool of expected) {
      if (tool.id === "merkliste") continue;
      const href = tool.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(backlogDe, new RegExp(`href="${href}"`));
      assert.match(backlogDe, new RegExp(`>${tool.de}<`));
      assert.match(backlogEn, new RegExp(`>${tool.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<`));
    }
    assert.doesNotMatch(backlogDe, /consolecheat-ex6/);
    assert.doesNotMatch(backlogEn, /consolecheat-ex6/);
    assert.doesNotMatch(`${backlogDe}${backlogEn}`, /\/bildschirm\/|\/download\/|\/tasten\/|\/hdr\/|\/audio\/|\/usb\/|\/combo\/|\/sprite\//);
    assert.equal(backlogDe.match(/<a /g)?.length, footerIds.length);
    assert.equal(backlogEn.match(/<a /g)?.length, footerIds.length);
    assert.doesNotMatch(`${backlogDe}${backlogEn}`, /fonts\.googleapis|cdn\.jsdelivr|unpkg\.com|target=/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
