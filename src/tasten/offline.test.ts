import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { bannedHosts, findBuildProblems, findRemoteProblems } from "../../scripts/check-dist.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const allowedUrls = [
  "https://consolecheat.com",
  "https://docs.github.com/",
  "https://robfreak.github.io/consolecheat-ex1/",
  "https://robfreak.github.io/consolecheat-ex2/",
  "https://robfreak.github.io/consolecheat-ex3/",
  "https://robfreak.github.io/consolecheat-ex4/",
  "https://robfreak.github.io/consolecheat-ex5/",
  "https://robfreak.github.io/consolecheat-ex6/",
];

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

test("button-layout sources stay inside this folder and name no third party", () => {
  const files = walk(here).filter((path) => /\.(ts|tsx|css)$/.test(path) && !path.endsWith(".test.ts"));
  const html = readFileSync(new URL("../../tasten/index.html", import.meta.url), "utf8");
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  assert.match(html, /src="\/src\/tasten\/main\.tsx"/);
  assert.match(html, /consolecheat-theme/);
  assert.doesNotMatch(html, /webmail/i);
  assert.match(readme, /tasten\/index\.html/);
  assert.match(readme, /src\/tasten/);
  assert.match(readme, /move to own repo later/i);

  const urlRe = /https?:\/\/[^\s"'`)<>]+/g;
  for (const path of files) {
    const text = readFileSync(path, "utf8");
    assert.doesNotMatch(text, /from ["']\.\.\//, path);
    assert.doesNotMatch(text, /getGamepads|gamepadconnected|gamepaddisconnected/, path);
    for (const host of bannedHosts) assert.equal(text.includes(host), false, `${host} in ${path}`);
    for (const match of text.match(urlRe) ?? []) {
      const url = match.replace(/[.,;]+$/, "");
      assert.ok(allowedUrls.some((prefix) => url.startsWith(prefix)), `${url} in ${path}`);
    }
  }
  for (const host of bannedHosts) assert.equal(html.includes(host), false, host);
});

test("the dist checker requires the button-layout page and rejects a third-party host", () => {
  const dir = mkdtempSync(join(tmpdir(), "tasten-dist-"));
  try {
    writeFileSync(join(dir, "app.js"), 'const x = "https://fonts.googleapis.com/css";');
    const flagged = findRemoteProblems(dir);
    assert.ok(flagged.some((problem: string) => problem.includes("fonts.googleapis.com")));

    writeFileSync(join(dir, "index.html"), "<!doctype html>");
    const missing = findBuildProblems(dir);
    assert.ok(missing.problems.some((problem: string) => problem.includes("tasten")));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  const dist = fileURLToPath(new URL("../../dist/", import.meta.url));
  let exists = false;
  try {
    exists = statSync(dist).isDirectory();
  } catch {
    exists = false;
  }
  if (!exists) return;
  const { problems } = findBuildProblems(dist);
  assert.deepEqual(problems, [], problems.join("\n"));
  const pages = walk(dist)
    .filter((path) => extname(path) === ".html")
    .map((path) => path.slice(dist.length).split(/[/\\]/).join("/"));
  assert.ok(pages.includes("tasten/index.html"), pages.join(", "));
});
