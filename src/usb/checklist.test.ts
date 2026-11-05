import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import {
  checklistItems,
  countProgress,
  exportMarkdown,
  exportPlain,
  toggleId,
  visibleItems,
} from "./checklist.ts";
import { copy } from "./messages.ts";

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

test("PS4 and PS5 filters show different update files and keep shared items", () => {
  const ps4 = visibleItems("ps4").map((item) => item.id);
  const ps5 = visibleItems("ps5").map((item) => item.id);
  const both = visibleItems("both").map((item) => item.id);
  assert.ok(ps4.includes("update-ps4"));
  assert.ok(ps4.includes("media-music"));
  assert.equal(ps4.includes("update-ps5"), false);
  assert.ok(ps5.includes("update-ps5"));
  assert.equal(ps5.includes("update-ps4"), false);
  assert.deepEqual(both, checklistItems.map((item) => item.id));
  assert.equal(checklistItems.find((item) => item.id === "update-ps4")?.path, "PS4/UPDATE/PS4UPDATE.PUP");
  assert.equal(checklistItems.find((item) => item.id === "update-ps5")?.path, "PS5/UPDATE/PS5UPDATE.PUP");
  assert.equal(checklistItems.find((item) => item.id === "media-music")?.path, "Music");
  assert.equal(checklistItems.find((item) => item.id === "media-av-contents")?.certainty, "verify");
  assert.equal(checklistItems.some((item) => item.path === "AV_CONTENTS"), false);
  assert.equal(ps4.length, 13);
  assert.equal(ps5.length, 13);
  assert.equal(both.length, 17);
});

test("checks toggle, and progress ignores items hidden by the console filter", () => {
  assert.deepEqual(toggleId([], "media-music"), ["media-music"]);
  assert.deepEqual(toggleId(["media-music", "format-fat"], "media-music"), ["format-fat"]);
  const visible = visibleItems("ps4");
  const counted = countProgress(visible, ["media-music", "update-ps5"]);
  assert.deepEqual(counted, { done: 1, total: 13 });
});

test("plain and Markdown export name the checked items and omit the other console", () => {
  const checked = ["media-music", "format-fat"];
  const plain = exportPlain(copy.de, "ps4", checked);
  const markdown = exportMarkdown(copy.de, "ps4", checked);
  assert.match(plain, /USB-Stick-Checkliste/);
  assert.match(plain, /Konsole: PS4/);
  assert.match(plain, /2 von 13/);
  assert.match(plain, /\[x\] Ordner Music \(Sony-Hilfe\)/);
  assert.match(plain, /Pfad: Music/);
  assert.match(plain, /\[x\] FAT32 oder exFAT/);
  assert.match(plain, /\[ \] Videos in einem Ordner/);
  assert.match(plain, /PS4\/UPDATE\/PS4UPDATE\.PUP/);
  assert.doesNotMatch(plain, /PS5UPDATE/);
  assert.match(plain, /AV_CONTENTS nicht anlegen/);
  assert.match(plain, /Prüfen/);
  assert.match(markdown, /- \[x\] Ordner Music \(Sony-Hilfe\)/);
  assert.match(markdown, /Pfad: `Music`/);
  assert.doesNotMatch(markdown, /PS5UPDATE/);

  const english = exportPlain(copy.en, "both", ["update-ps5"]);
  assert.match(english, /Console: Both/);
  assert.match(english, /1 of 17/);
  assert.match(english, /\[x\] PS5 update file \(Sony support\)/);
  assert.match(english, /\[ \] PS4 update file/);
  assert.match(english, /Do not create AV_CONTENTS/);
  assert.match(english, /Verify on your console \/ official Sony support/);
});

test("the page does not offer a file picker, a USB device API, or a drive scan", () => {
  const here = fileURLToPath(new URL(".", import.meta.url));
  const files = walk(here).filter((path) => /\.(ts|tsx)$/.test(path) && !path.endsWith(".test.ts"));
  for (const path of files) {
    const text = readFileSync(path, "utf8");
    assert.doesNotMatch(text, /navigator\.usb|USBDevice|showDirectoryPicker|webkitdirectory|type=["']file["']|fetch\(/i, path);
    assert.doesNotMatch(text, /webmail/i, path);
  }
});

function itemTag(html: string, id: string): string {
  const match = html.match(new RegExp(`<li\\b[^>]*data-testid="item-${id}"[^>]*>`));
  assert.ok(match, id);
  return match[0];
}

test("the checklist renders items, switches PS4 and PS5, and shows checked items in the export", async () => {
  const dir = mkdtempSync(join(fileURLToPath(new URL("../../node_modules/", import.meta.url)), "usb-render-"));
  const outfile = join(dir, "render.mjs");
  try {
    await esbuild.build({
      stdin: {
        contents: `
          import { createElement } from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import { Checklist } from "./checklist.tsx";
          import { copy } from "./messages.ts";
          export function render(lang, consoleId, checked) {
            return renderToStaticMarkup(createElement(Checklist, {
              text: copy[lang],
              consoleId,
              checked,
              onConsole() {},
              onToggle() {},
              onReset() {},
            }));
          }
        `,
        resolveDir: fileURLToPath(new URL(".", import.meta.url)),
        sourcefile: "usb-render.tsx",
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
      render: (lang: "de" | "en", consoleId: "ps4" | "ps5" | "both", checked: string[]) => string;
    };

    const ps4 = rendered.render("de", "ps4", ["media-music"]);
    assert.match(ps4, /data-testid="usb-checklist"/);
    assert.match(ps4, /Ordner Music/);
    assert.match(ps4, /FAT32 oder exFAT/);
    assert.match(ps4, /AV_CONTENTS nicht anlegen/);
    assert.match(ps4, /PS4\/UPDATE\/PS4UPDATE\.PUP/);
    assert.match(ps4, /Erweiterter Speicher/);
    assert.doesNotMatch(ps4, /data-testid="item-update-ps5"/);
    assert.doesNotMatch(ps4, /PS5UPDATE/);
    assert.match(itemTag(ps4, "media-music"), /data-checked="true"/);
    assert.match(itemTag(ps4, "format-fat"), /data-checked="false"/);
    assert.match(ps4, /data-testid="check-media-music"[^>]*checked|checked[^>]*data-testid="check-media-music"/);
    assert.match(ps4, /aria-selected="true"/);
    assert.match(ps4, /1 von 13/);
    assert.match(ps4, /data-testid="export-preview"[\s\S]*\[x\] Ordner Music/);
    assert.match(ps4, />Text herunterladen</);
    assert.match(ps4, />Markdown herunterladen</);
    assert.match(ps4, />Haken leeren</);
    assert.doesNotMatch(ps4, /webmail|fonts\.googleapis|type="file"/i);

    const ps5 = rendered.render("de", "ps5", []);
    assert.match(ps5, /data-testid="item-update-ps5"/);
    assert.match(ps5, /PS5\/UPDATE\/PS5UPDATE\.PUP/);
    assert.doesNotMatch(ps5, /data-testid="item-update-ps4"/);
    assert.match(ps5, /0 von 13/);
    assert.match(ps5, /data-testid="console-ps5"[^>]*aria-selected="true"|aria-selected="true"[^>]*data-testid="console-ps5"/);

    const english = rendered.render("en", "both", ["update-ps4", "media-av-contents"]);
    assert.match(english, /Music folder/);
    assert.match(english, /Do not create AV_CONTENTS/);
    assert.match(english, /PS4 update file/);
    assert.match(english, /PS5 update file/);
    assert.match(english, /Extended storage/);
    assert.match(english, /2 of 17/);
    assert.match(english, /\[x\] PS4 update file/);
    assert.match(english, /\[x\] Do not create AV_CONTENTS/);
    assert.match(english, /\[ \] Music folder/);
    assert.match(english, />Download text</);
    assert.match(english, />Clear checks</);
    assert.match(english, /Verify/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
