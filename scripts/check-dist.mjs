import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const bannedHosts = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdn.jsdelivr.net",
  "unpkg.com",
  "cdnjs.cloudflare.com",
  "googletagmanager.com",
  "google-analytics.com",
  "doubleclick.net",
  "cloudflareinsights.com",
  "use.typekit.net",
  "fontshare.com",
];

const textExt = new Set([".html", ".js", ".css", ".svg", ".json", ".txt"]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

export function findRemoteProblems(root) {
  const files = walk(root);
  const problems = [];
  for (const path of files) {
    const ext = extname(path).toLowerCase();
    if (ext === ".woff") problems.push(`woff fallback shipped: ${path}`);
    if (!textExt.has(ext)) continue;
    const text = readFileSync(path, "utf8");
    for (const host of bannedHosts) {
      if (text.includes(host)) problems.push(`${host} in ${path}`);
    }
    if (/\.woff(?!2)["')]/i.test(text)) problems.push(`woff url in ${path}`);
    if (ext === ".css" && /url\(\s*['"]?https?:/i.test(text)) problems.push(`remote font or image url in ${path}`);
    if (ext === ".html" && /src=["']https?:/i.test(text)) problems.push(`remote script in ${path}`);
  }
  return problems;
}

export function findBuildProblems(root) {
  const problems = findRemoteProblems(root);
  const files = walk(root);
  if (!files.some((path) => path.endsWith(".woff2"))) problems.push("no woff2 font files in dist");
  for (const rel of [
    "index.html",
    join("bildschirm", "index.html"),
    join("download", "index.html"),
    join("tasten", "index.html"),
    join("hdr", "index.html"),
    join("audio", "index.html"),
    join("usb", "index.html"),
    join("reaktion", "index.html"),
    join("quiz", "index.html"),
    join("rhythmus", "index.html"),
    join("speedrun", "index.html"),
    join("avatar", "index.html"),
    join("turnier", "index.html"),
    join("combo", "index.html"),
    join("sprite", "index.html"),
  ]) {
    if (!existsSync(join(root, rel))) problems.push(`missing page ${rel}`);
  }
  return { problems, woff2: files.filter((path) => path.endsWith(".woff2")).length };
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) {
  const root = fileURLToPath(new URL("../dist/", import.meta.url));
  const { problems, woff2 } = findBuildProblems(root);
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`dist offline check ok (${woff2} woff2, index, bildschirm, download, tasten, hdr, audio, usb, reaktion, quiz, rhythmus, speedrun, avatar, turnier, combo, and sprite)`);
}
