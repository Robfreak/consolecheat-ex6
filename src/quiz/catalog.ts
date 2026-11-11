import raw from "./data/psplus.json" with { type: "json" };

// Local snapshot of Robfreak/consolecheat-ex2 `public/archive.json`.
// Imported at build time. The page does not fetch another origin for this data.

export type Appearance = {
  title: string;
  ym: string;
};

export type Catalog = {
  appearances: Appearance[];
  titles: Map<string, string[]>;
  titlesByMonth: Map<string, string[]>;
  months: string[];
  years: string[];
  singleMonthTitles: string[];
  singleYearTitles: string[];
};

export const snapshotMeta = {
  source: raw.source,
  sourceFile: raw.sourceFile,
  sourceCommit: raw.sourceCommit,
  sourceSite: raw.sourceSite,
  snapshotDate: raw.snapshotDate,
  archiveGenerated: raw.archiveGenerated,
  license: raw.license,
  note: raw.note,
};

const YM = /^\d{4}-(?:0[1-9]|1[0-2])$/;

export function appearancesFromSnapshot(input: unknown): Appearance[] {
  if (!input || typeof input !== "object") throw new Error("snapshot");
  const rows = (input as { appearances?: unknown }).appearances;
  if (!Array.isArray(rows)) throw new Error("appearances");
  const seen = new Set<string>();
  const appearances: Appearance[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") throw new Error("appearance");
    const title = (row as { title?: unknown }).title;
    const ym = (row as { ym?: unknown }).ym;
    if (typeof title !== "string" || title.length === 0 || title.trim() !== title) throw new Error("title");
    if (typeof ym !== "string" || !YM.test(ym)) throw new Error("ym");
    const key = `${title}\0${ym}`;
    if (seen.has(key)) continue;
    seen.add(key);
    appearances.push({ title, ym });
  }
  if (appearances.length === 0) throw new Error("empty");
  return appearances;
}

export function buildCatalog(rows: readonly Appearance[]): Catalog {
  const titles = new Map<string, string[]>();
  const titlesByMonth = new Map<string, string[]>();
  for (const row of rows) {
    const yms = titles.get(row.title);
    if (yms) {
      if (!yms.includes(row.ym)) yms.push(row.ym);
    } else {
      titles.set(row.title, [row.ym]);
    }
    const inMonth = titlesByMonth.get(row.ym);
    if (inMonth) {
      if (!inMonth.includes(row.title)) inMonth.push(row.title);
    } else {
      titlesByMonth.set(row.ym, [row.title]);
    }
  }
  for (const yms of titles.values()) yms.sort();
  const months = [...titlesByMonth.keys()].sort();
  const years = [...new Set(months.map((ym) => ym.slice(0, 4)))].sort();
  const singleMonthTitles: string[] = [];
  const singleYearTitles: string[] = [];
  for (const [title, yms] of titles) {
    if (yms.length === 1) singleMonthTitles.push(title);
    const yearCount = new Set(yms.map((ym) => ym.slice(0, 4))).size;
    if (yearCount === 1) singleYearTitles.push(title);
  }
  singleMonthTitles.sort();
  singleYearTitles.sort();
  return {
    appearances: [...rows],
    titles,
    titlesByMonth,
    months,
    years,
    singleMonthTitles,
    singleYearTitles,
  };
}

export function yearsOfTitle(catalog: Catalog, title: string): string[] {
  const yms = catalog.titles.get(title);
  if (!yms) return [];
  return [...new Set(yms.map((ym) => ym.slice(0, 4)))].sort();
}

export const catalog = buildCatalog(appearancesFromSnapshot(raw));
