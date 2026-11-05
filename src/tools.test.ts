import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { copy } from "./messages.ts";
import { footerTools, toolLinks, type ToolId } from "./tools.ts";

const expected: { id: ToolId; href: string; de: string; en: string }[] = [
  { id: "finder", href: "https://robfreak.github.io/consolecheat-ex1/", de: "Title-ID-Finder", en: "Title-ID-Finder" },
  { id: "archive", href: "https://robfreak.github.io/consolecheat-ex2/", de: "PS-Plus-Archiv", en: "PS Plus archive" },
  { id: "controller", href: "https://robfreak.github.io/consolecheat-ex3/", de: "Controller-Tester", en: "Controller tester" },
  { id: "save", href: "https://robfreak.github.io/consolecheat-ex4/", de: "Save-Info-Leser", en: "Save info reader" },
  { id: "codes", href: "https://robfreak.github.io/consolecheat-ex5/", de: "Fehlercode-Nachschlager", en: "Error code lookup" },
  { id: "merkliste", href: "https://robfreak.github.io/consolecheat-ex6/", de: "Spiele-Merkliste", en: "Spiele-Merkliste" },
  {
    id: "screen",
    href: "https://robfreak.github.io/consolecheat-ex6/bildschirm/",
    de: "Bildschirm-Test",
    en: "Screen test",
  },
  {
    id: "download",
    href: "https://robfreak.github.io/consolecheat-ex6/download/",
    de: "Download-Zeit-Rechner",
    en: "Download time calculator",
  },
  {
    id: "buttons",
    href: "https://robfreak.github.io/consolecheat-ex6/tasten/",
    de: "Tastenbelegung",
    en: "Button layout",
  },
  {
    id: "hdr",
    href: "https://robfreak.github.io/consolecheat-ex6/hdr/",
    de: "HDR/Helligkeit",
    en: "HDR / brightness",
  },
  {
    id: "audio",
    href: "https://robfreak.github.io/consolecheat-ex6/audio/",
    de: "Audio-Kanal-Test",
    en: "Audio channel test",
  },
];

test("every page shares one tool list and leaves the current page out", () => {
  const screenCopy = readFileSync(new URL("./bildschirm/tools.ts", import.meta.url), "utf8");
  const downloadCopy = readFileSync(new URL("./download/tools.ts", import.meta.url), "utf8");
  const tastenCopy = readFileSync(new URL("./tasten/tools.ts", import.meta.url), "utf8");
  const hdrCopy = readFileSync(new URL("./hdr/tools.ts", import.meta.url), "utf8");
  const audioCopy = readFileSync(new URL("./audio/tools.ts", import.meta.url), "utf8");
  const backlogCopy = readFileSync(new URL("./tools.ts", import.meta.url), "utf8");
  const linksCopy = readFileSync(new URL("./tool-links.tsx", import.meta.url), "utf8");
  const screenLinks = readFileSync(new URL("./bildschirm/tool-links.tsx", import.meta.url), "utf8");
  const downloadLinks = readFileSync(new URL("./download/tool-links.tsx", import.meta.url), "utf8");
  const tastenLinks = readFileSync(new URL("./tasten/tool-links.tsx", import.meta.url), "utf8");
  const hdrLinks = readFileSync(new URL("./hdr/tool-links.tsx", import.meta.url), "utf8");
  const audioLinks = readFileSync(new URL("./audio/tool-links.tsx", import.meta.url), "utf8");
  assert.equal(screenCopy, backlogCopy);
  assert.equal(downloadCopy, backlogCopy);
  assert.equal(tastenCopy, backlogCopy);
  assert.equal(hdrCopy, backlogCopy);
  assert.equal(audioCopy, backlogCopy);
  assert.equal(screenLinks, linksCopy);
  assert.equal(downloadLinks, linksCopy);
  assert.equal(tastenLinks, linksCopy);
  assert.equal(hdrLinks, linksCopy);
  assert.equal(audioLinks, linksCopy);
  assert.deepEqual(
    toolLinks.map((tool) => ({ id: tool.id, href: tool.href, de: tool.de, en: tool.en })),
    expected,
  );
  assert.equal(toolLinks.find((tool) => tool.id === "finder")?.de, copy.de.finder);
  assert.equal(toolLinks.find((tool) => tool.id === "finder")?.en, copy.en.finder);
  assert.equal(toolLinks.find((tool) => tool.id === "archive")?.de, copy.de.archive);
  assert.equal(toolLinks.find((tool) => tool.id === "archive")?.en, copy.en.archive);
  assert.equal(toolLinks.find((tool) => tool.id === "screen")?.de, copy.de.screenTest);
  assert.equal(toolLinks.find((tool) => tool.id === "screen")?.en, copy.en.screenTest);
  assert.equal(toolLinks.find((tool) => tool.id === "merkliste")?.de, copy.de.title);
  assert.equal(toolLinks.find((tool) => tool.id === "merkliste")?.en, copy.en.title);

  for (const lang of ["de", "en"] as const) {
    const backlog = footerTools("merkliste", lang, {
      href: {
        screen: "/consolecheat-ex6/bildschirm/",
        download: "/consolecheat-ex6/download/",
        buttons: "/consolecheat-ex6/tasten/",
        hdr: "/consolecheat-ex6/hdr/",
        audio: "/consolecheat-ex6/audio/",
      },
      label: { screen: copy[lang].screenTest },
    });
    assert.deepEqual(
      backlog.map((tool) => tool.id),
      ["finder", "archive", "controller", "save", "codes", "screen", "download", "buttons", "hdr", "audio"],
    );
    assert.equal(backlog.find((tool) => tool.id === "screen")?.href, "/consolecheat-ex6/bildschirm/");
    assert.equal(backlog.find((tool) => tool.id === "download")?.href, "/consolecheat-ex6/download/");
    assert.equal(backlog.find((tool) => tool.id === "buttons")?.href, "/consolecheat-ex6/tasten/");
    assert.equal(backlog.find((tool) => tool.id === "hdr")?.href, "/consolecheat-ex6/hdr/");
    assert.equal(backlog.find((tool) => tool.id === "audio")?.href, "/consolecheat-ex6/audio/");
    assert.equal(backlog.find((tool) => tool.id === "finder")?.href, expected[0]?.href);
    assert.equal(backlog.find((tool) => tool.id === "screen")?.label, copy[lang].screenTest);
    assert.equal(backlog.find((tool) => tool.id === "download")?.label, lang === "de" ? "Download-Zeit-Rechner" : "Download time calculator");
    assert.equal(backlog.find((tool) => tool.id === "buttons")?.label, lang === "de" ? "Tastenbelegung" : "Button layout");
    assert.equal(backlog.find((tool) => tool.id === "hdr")?.label, lang === "de" ? "HDR/Helligkeit" : "HDR / brightness");
    assert.equal(backlog.find((tool) => tool.id === "audio")?.label, lang === "de" ? "Audio-Kanal-Test" : "Audio channel test");
    assert.equal(backlog.some((tool) => tool.href === "https://consolecheat.com"), false);

    const screen = footerTools("screen", lang, {
      href: {
        merkliste: "/consolecheat-ex6/",
        download: "/consolecheat-ex6/download/",
        buttons: "/consolecheat-ex6/tasten/",
        hdr: "/consolecheat-ex6/hdr/",
        audio: "/consolecheat-ex6/audio/",
      },
    });
    assert.deepEqual(
      screen.map((tool) => tool.id),
      ["finder", "archive", "controller", "save", "codes", "merkliste", "download", "buttons", "hdr", "audio"],
    );
    assert.equal(screen.find((tool) => tool.id === "merkliste")?.href, "/consolecheat-ex6/");
    assert.equal(screen.find((tool) => tool.id === "download")?.href, "/consolecheat-ex6/download/");
    assert.equal(screen.find((tool) => tool.id === "buttons")?.href, "/consolecheat-ex6/tasten/");
    assert.equal(screen.find((tool) => tool.id === "hdr")?.href, "/consolecheat-ex6/hdr/");
    assert.equal(screen.find((tool) => tool.id === "audio")?.href, "/consolecheat-ex6/audio/");
    assert.equal(screen.find((tool) => tool.id === "codes")?.href, "https://robfreak.github.io/consolecheat-ex5/");
    assert.equal(screen.some((tool) => tool.id === "screen"), false);
    assert.equal(screen.find((tool) => tool.id === "archive")?.label, expected.find((tool) => tool.id === "archive")?.[lang]);

    const download = footerTools("download", lang, {
      href: {
        merkliste: "/consolecheat-ex6/",
        screen: "/consolecheat-ex6/bildschirm/",
        buttons: "/consolecheat-ex6/tasten/",
        hdr: "/consolecheat-ex6/hdr/",
        audio: "/consolecheat-ex6/audio/",
      },
    });
    assert.deepEqual(
      download.map((tool) => tool.id),
      ["finder", "archive", "controller", "save", "codes", "merkliste", "screen", "buttons", "hdr", "audio"],
    );
    assert.equal(download.find((tool) => tool.id === "merkliste")?.href, "/consolecheat-ex6/");
    assert.equal(download.find((tool) => tool.id === "screen")?.href, "/consolecheat-ex6/bildschirm/");
    assert.equal(download.find((tool) => tool.id === "buttons")?.href, "/consolecheat-ex6/tasten/");
    assert.equal(download.find((tool) => tool.id === "hdr")?.href, "/consolecheat-ex6/hdr/");
    assert.equal(download.find((tool) => tool.id === "audio")?.href, "/consolecheat-ex6/audio/");
    assert.equal(download.some((tool) => tool.id === "download"), false);

    const buttons = footerTools("buttons", lang, {
      href: {
        merkliste: "/consolecheat-ex6/",
        screen: "/consolecheat-ex6/bildschirm/",
        download: "/consolecheat-ex6/download/",
        hdr: "/consolecheat-ex6/hdr/",
        audio: "/consolecheat-ex6/audio/",
      },
    });
    assert.deepEqual(
      buttons.map((tool) => tool.id),
      ["finder", "archive", "controller", "save", "codes", "merkliste", "screen", "download", "hdr", "audio"],
    );
    assert.equal(buttons.some((tool) => tool.id === "buttons"), false);
    assert.equal(buttons.find((tool) => tool.id === "merkliste")?.href, "/consolecheat-ex6/");
    assert.equal(buttons.find((tool) => tool.id === "screen")?.href, "/consolecheat-ex6/bildschirm/");
    assert.equal(buttons.find((tool) => tool.id === "download")?.href, "/consolecheat-ex6/download/");
    assert.equal(buttons.find((tool) => tool.id === "hdr")?.href, "/consolecheat-ex6/hdr/");
    assert.equal(buttons.find((tool) => tool.id === "audio")?.href, "/consolecheat-ex6/audio/");

    const hdr = footerTools("hdr", lang, {
      href: {
        merkliste: "/consolecheat-ex6/",
        screen: "/consolecheat-ex6/bildschirm/",
        download: "/consolecheat-ex6/download/",
        buttons: "/consolecheat-ex6/tasten/",
        audio: "/consolecheat-ex6/audio/",
      },
    });
    assert.deepEqual(
      hdr.map((tool) => tool.id),
      ["finder", "archive", "controller", "save", "codes", "merkliste", "screen", "download", "buttons", "audio"],
    );
    assert.equal(hdr.some((tool) => tool.id === "hdr"), false);
    assert.equal(hdr.find((tool) => tool.id === "screen")?.href, "/consolecheat-ex6/bildschirm/");
    assert.equal(hdr.find((tool) => tool.id === "screen")?.label, lang === "de" ? "Bildschirm-Test" : "Screen test");
    assert.equal(hdr.find((tool) => tool.id === "audio")?.href, "/consolecheat-ex6/audio/");

    const audio = footerTools("audio", lang, {
      href: {
        merkliste: "/consolecheat-ex6/",
        screen: "/consolecheat-ex6/bildschirm/",
        download: "/consolecheat-ex6/download/",
        buttons: "/consolecheat-ex6/tasten/",
        hdr: "/consolecheat-ex6/hdr/",
      },
    });
    assert.deepEqual(
      audio.map((tool) => tool.id),
      ["finder", "archive", "controller", "save", "codes", "merkliste", "screen", "download", "buttons", "hdr"],
    );
    assert.equal(audio.some((tool) => tool.id === "audio"), false);
    assert.equal(audio.find((tool) => tool.id === "screen")?.href, "/consolecheat-ex6/bildschirm/");
    assert.equal(audio.find((tool) => tool.id === "hdr")?.href, "/consolecheat-ex6/hdr/");
  }
});

test("entry links stay, and the footers only anchor the other tools", async () => {
  const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
  const screenApp = readFileSync(new URL("./bildschirm/App.tsx", import.meta.url), "utf8");
  assert.match(app, /finderHref\(/);
  assert.match(app, /archiveHref\(/);
  assert.match(app, /screenTest/);
  assert.match(app, /bildschirm\//);
  assert.match(app, /download\//);
  assert.match(app, /tasten\//);
  assert.match(app, /hdr\//);
  assert.match(app, /audio\//);
  assert.match(screenApp, /footerTools\("screen"/);
  assert.match(screenApp, /download\//);
  assert.match(screenApp, /tasten\//);
  assert.match(screenApp, /hdr\//);
  assert.match(screenApp, /audio\//);
  assert.match(screenApp, /merklisteHref/);
  assert.doesNotMatch(app, /fetch\(\s*["']https:\/\/robfreak\.github\.io/);
  assert.doesNotMatch(screenApp, /fetch\(/);

  const dir = mkdtempSync(join(fileURLToPath(new URL("../node_modules/", import.meta.url)), "tool-links-"));
  const outfile = join(dir, "render.mjs");
  try {
    await esbuild.build({
      stdin: {
        contents: `
          import { createElement } from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { ToolLinks } from "./tool-links.tsx";
          import { SiteFooter } from "./bildschirm/chrome.tsx";
          import { copy as backlog } from "./messages.ts";
          import { copy as screenCopy } from "./bildschirm/messages.ts";
          import { footerTools } from "./tools.ts";
          export function renderBacklog(lang) {
            const text = backlog[lang];
            const links = footerTools("merkliste", lang, {
              href: {
                screen: "/consolecheat-ex6/bildschirm/",
                download: "/consolecheat-ex6/download/",
                buttons: "/consolecheat-ex6/tasten/",
                hdr: "/consolecheat-ex6/hdr/",
                audio: "/consolecheat-ex6/audio/",
              },
              label: { screen: text.screenTest },
            });
            return renderToStaticMarkup(createElement(ToolLinks, { heading: text.toolsHeading, links }));
          }
          export function renderScreen(lang) {
            const text = screenCopy[lang];
            const links = footerTools("screen", lang, {
              href: {
                merkliste: "/consolecheat-ex6/",
                download: "/consolecheat-ex6/download/",
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
    const screenDe = rendered.renderScreen("de") as string;
    const screenEn = rendered.renderScreen("en") as string;

    assert.match(backlogDe, /Weitere Werkzeuge/);
    assert.match(backlogDe, /aria-labelledby="more-tools-heading"/);
    assert.match(backlogDe, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex1\/"/);
    assert.match(backlogDe, /href="https:\/\/robfreak\.github\.io\/consolecheat-ex5\/"/);
    assert.match(backlogDe, /href="\/consolecheat-ex6\/bildschirm\/"/);
    assert.match(backlogDe, /href="\/consolecheat-ex6\/download\/"/);
    assert.match(backlogDe, /href="\/consolecheat-ex6\/tasten\/"/);
    assert.match(backlogDe, /href="\/consolecheat-ex6\/hdr\/"/);
    assert.match(backlogDe, /href="\/consolecheat-ex6\/audio\/"/);
    assert.match(backlogDe, />Bildschirm-Test</);
    assert.match(backlogDe, />Download-Zeit-Rechner</);
    assert.match(backlogDe, />Tastenbelegung</);
    assert.match(backlogDe, />HDR\/Helligkeit</);
    assert.match(backlogDe, />Audio-Kanal-Test</);
    assert.doesNotMatch(backlogDe, /consolecheat-ex6\/"/);
    assert.match(backlogEn, /Other tools/);
    assert.match(backlogEn, />PS Plus archive</);
    assert.match(backlogEn, />Controller tester</);
    assert.match(backlogEn, />Save info reader</);
    assert.match(backlogEn, />Error code lookup</);
    assert.match(backlogEn, />Screen test</);
    assert.match(backlogEn, />Download time calculator</);
    assert.match(backlogEn, />Button layout</);
    assert.match(backlogEn, />HDR \/ brightness</);
    assert.match(backlogEn, />Audio channel test</);
    assert.equal(backlogEn.match(/<a /g)?.length, 10);

    assert.match(screenDe, /Zur Merkliste/);
    assert.match(screenDe, /href="\/consolecheat-ex6\/"/);
    assert.match(screenDe, />Spiele-Merkliste</);
    assert.match(screenDe, /Weitere Werkzeuge/);
    assert.match(screenDe, /href="\/consolecheat-ex6\/download\/"/);
    assert.match(screenDe, /href="\/consolecheat-ex6\/tasten\/"/);
    assert.match(screenDe, /href="\/consolecheat-ex6\/hdr\/"/);
    assert.match(screenDe, /href="\/consolecheat-ex6\/audio\/"/);
    assert.match(screenDe, />Download-Zeit-Rechner</);
    assert.match(screenDe, />Tastenbelegung</);
    assert.match(screenDe, />HDR\/Helligkeit</);
    assert.match(screenDe, />Audio-Kanal-Test</);
    assert.doesNotMatch(screenDe, /bildschirm/);
    assert.match(screenEn, /Back to the backlog/);
    assert.match(screenEn, /Other tools/);
    assert.match(screenEn, />Title-ID-Finder</);
    assert.equal(screenEn.match(/<a /g)?.length, 3 + 10);
    assert.doesNotMatch(`${backlogDe}${backlogEn}${screenDe}${screenEn}`, /fonts\.googleapis|cdn\.jsdelivr|unpkg\.com|target=/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
