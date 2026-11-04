/**
 * Vendor the Title-ID-Finder search and its catalog into this repo.
 *
 * Source of truth (copied at maintainer time, never requested by the site):
 *   Repository: https://github.com/Robfreak/consolecheat-ex1
 *   src/search.ts        -> src/search.ts
 *   public/titles.json   -> public/titles.json
 *
 * The catalog inside titles.json is generated from the MIT-licensed list
 * https://github.com/andshrew/PlayStation-Titles (see THIRD_PARTY_NOTICES.md
 * and the `source` / `commit` fields in the JSON). This script does not
 * download anything. Point it at a local checkout:
 *
 *   node scripts/sync-from-ex1.mjs --from ../consolecheat-ex1
 *   EX1_DIR=/path/to/consolecheat-ex1 node scripts/sync-from-ex1.mjs
 *
 * It also writes vendor/ex1/PROVENANCE.json with the ex1 commit it copied.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const SOURCE_REPO = "https://github.com/Robfreak/consolecheat-ex1";

const files = [
  ["src/search.ts", "src/search.ts"],
  ["public/titles.json", "public/titles.json"],
];

function sourceDir() {
  const flag = process.argv.indexOf("--from");
  if (flag >= 0 && process.argv[flag + 1]) return resolve(process.argv[flag + 1]);
  if (process.env.EX1_DIR) return resolve(process.env.EX1_DIR);
  return resolve(root, "../consolecheat-ex1");
}

function git(dir, args) {
  return execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
}

const from = sourceDir();
for (const [src] of files) {
  readFileSync(resolve(from, src));
}

let commit = "";
let committedAt = "";
try {
  commit = git(from, ["rev-parse", "HEAD"]);
  committedAt = git(from, ["log", "-1", "--format=%cI"]);
} catch (error) {
  console.error(`ex1 checkout is not a git repo: ${from}`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

for (const [src, dest] of files) {
  const target = resolve(root, dest);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(resolve(from, src), target);
}

const titles = JSON.parse(readFileSync(resolve(root, "public/titles.json"), "utf8"));
const search = readFileSync(resolve(root, "src/search.ts"), "utf8");
if (titles.format !== 2 || typeof titles.names !== "string" || typeof titles.skus !== "string" || typeof titles.commit !== "string") {
  console.error("public/titles.json is not a format-2 Title-ID-Finder catalog");
  process.exit(1);
}
if (!search.includes("function foldRoman") || !search.includes("export function searchIndex")) {
  console.error("src/search.ts does not look like the Title-ID-Finder search");
  process.exit(1);
}

const provenance = {
  repository: SOURCE_REPO,
  commit,
  committedAt,
  copiedAt: new Date().toISOString().slice(0, 10),
  files: files.map(([src, dest]) => ({ from: src, to: dest })),
  catalog: {
    upstream: titles.source,
    commit: titles.commit,
    license: titles.license,
    format: titles.format,
    generated: titles.generated,
    games: titles.games,
    ids: titles.ids,
  },
  runtime:
    "The site loads public/titles.json from its own host. It does not request consolecheat-ex1, PlayStation-Titles, or any other origin for this data.",
};

const provenancePath = resolve(root, "vendor/ex1/PROVENANCE.json");
mkdirSync(dirname(provenancePath), { recursive: true });
writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
console.log(`vendored ex1 ${commit.slice(0, 12)} from ${from}`);
