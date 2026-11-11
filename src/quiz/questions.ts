import { yearsOfTitle, type Catalog } from "./catalog.ts";

export type QuestionKind = "year" | "month" | "which";

export type Question = {
  kind: QuestionKind;
  subject: string;
  options: string[];
  correct: string;
  linkTitles: string[];
};

export type Rng = () => number;

export const ARCHIVE_ORIGIN = "https://robfreak.github.io/consolecheat-ex2/";

const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;

export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function kindAt(index: number, harder: boolean): QuestionKind {
  if (harder) {
    const hard: QuestionKind[] = ["month", "which", "month", "month", "which"];
    return hard[index % hard.length] ?? "month";
  }
  const mix: QuestionKind[] = ["year", "which", "month", "year", "which"];
  return mix[index % mix.length] ?? "year";
}

export function formatMonth(ym: string, names: readonly string[] = MONTHS_DE): string {
  const [year, month] = ym.split("-");
  const name = names[Number(month) - 1];
  if (!year || !name) return ym;
  return `${name} ${year}`;
}

export function archiveHref(title: string): string {
  const url = new URL(ARCHIVE_ORIGIN);
  url.searchParams.set("q", title);
  return url.toString();
}

export function avoidKey(question: Question): string {
  return `${question.kind}:${question.subject}`;
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}

function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = swap;
  }
  return copy;
}

function sample(rng: Rng, items: readonly string[], count: number, exclude: ReadonlySet<string>): string[] | null {
  const pool = items.filter((item) => !exclude.has(item));
  if (pool.length < count) return null;
  return shuffle(rng, pool).slice(0, count);
}

function monthIndex(ym: string): number {
  const [year, month] = ym.split("-");
  return Number(year) * 12 + Number(month);
}

function yearQuestion(catalog: Catalog, rng: Rng, avoid: ReadonlySet<string>): Question | null {
  const fresh = catalog.singleYearTitles.filter((title) => !avoid.has(`year:${title}`));
  const pool = fresh.length > 0 ? fresh : catalog.singleYearTitles;
  if (pool.length === 0) return null;
  const title = pick(rng, pool);
  const year = yearsOfTitle(catalog, title)[0];
  if (!year) return null;
  const distractors = sample(rng, catalog.years, 3, new Set([year]));
  if (!distractors) return null;
  const options = shuffle(rng, [year, ...distractors]);
  return { kind: "year", subject: title, options, correct: year, linkTitles: [title] };
}

function monthQuestion(catalog: Catalog, rng: Rng, avoid: ReadonlySet<string>): Question | null {
  const fresh = catalog.singleMonthTitles.filter((title) => !avoid.has(`month:${title}`));
  const pool = fresh.length > 0 ? fresh : catalog.singleMonthTitles;
  if (pool.length === 0) return null;
  const title = pick(rng, pool);
  const ym = catalog.titles.get(title)?.[0];
  if (!ym) return null;
  const near = catalog.months.filter((month) => {
    const distance = Math.abs(monthIndex(month) - monthIndex(ym));
    return distance > 0 && distance <= 36;
  });
  const distractors = sample(rng, near.length >= 3 ? near : catalog.months, 3, new Set([ym]));
  if (!distractors) return null;
  const options = shuffle(rng, [ym, ...distractors]);
  return { kind: "month", subject: title, options, correct: ym, linkTitles: [title] };
}

function whichQuestion(catalog: Catalog, rng: Rng, avoid: ReadonlySet<string>): Question | null {
  const fresh = catalog.months.filter((month) => !avoid.has(`which:${month}`));
  const pool = fresh.length > 0 ? fresh : catalog.months;
  if (pool.length === 0) return null;
  const ym = pick(rng, pool);
  const inMonth = catalog.titlesByMonth.get(ym) ?? [];
  if (inMonth.length === 0) return null;
  const correct = pick(rng, inMonth);
  const elsewhere = [...catalog.titles.keys()].filter((title) => !inMonth.includes(title));
  const distractors = sample(rng, elsewhere, 3, new Set([correct]));
  if (!distractors) return null;
  const options = shuffle(rng, [correct, ...distractors]);
  return { kind: "which", subject: ym, options, correct, linkTitles: options };
}

export function questionIssues(catalog: Catalog, question: Question): string[] {
  const issues: string[] = [];
  if (question.options.length !== 4) issues.push("count");
  if (new Set(question.options).size !== 4) issues.push("unique");
  if (!question.options.includes(question.correct)) issues.push("correct-missing");

  if (question.kind === "year") {
    const years = yearsOfTitle(catalog, question.subject);
    if (!catalog.titles.has(question.subject)) issues.push("invented-title");
    if (years.length !== 1) issues.push("ambiguous-year");
    if (years[0] !== question.correct) issues.push("wrong-year");
    for (const option of question.options) {
      if (!catalog.years.includes(option)) issues.push("invented-year");
      if (option !== question.correct && years.includes(option)) issues.push("extra-correct");
    }
    if (question.linkTitles.length !== 1 || question.linkTitles[0] !== question.subject) issues.push("links");
  }

  if (question.kind === "month") {
    const yms = catalog.titles.get(question.subject) ?? [];
    if (!catalog.titles.has(question.subject)) issues.push("invented-title");
    if (yms.length !== 1) issues.push("ambiguous-month");
    if (yms[0] !== question.correct) issues.push("wrong-month");
    for (const option of question.options) {
      if (!catalog.months.includes(option)) issues.push("invented-month");
      if (option !== question.correct && yms.includes(option)) issues.push("extra-correct");
    }
    if (question.linkTitles.length !== 1 || question.linkTitles[0] !== question.subject) issues.push("links");
  }

  if (question.kind === "which") {
    const inMonth = new Set(catalog.titlesByMonth.get(question.subject) ?? []);
    if (!catalog.months.includes(question.subject)) issues.push("invented-month");
    let hits = 0;
    for (const option of question.options) {
      if (!catalog.titles.has(option)) issues.push("invented-title");
      if (inMonth.has(option)) hits += 1;
    }
    if (!inMonth.has(question.correct)) issues.push("wrong-which");
    if (hits !== 1) issues.push("ambiguous-which");
    if (question.linkTitles.join("\0") !== question.options.join("\0")) issues.push("links");
  }

  return issues;
}

export function generateQuestion(catalog: Catalog, rng: Rng, kind: QuestionKind, avoid: ReadonlySet<string> = new Set()): Question {
  const build = kind === "year" ? yearQuestion : kind === "month" ? monthQuestion : whichQuestion;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const question = build(catalog, rng, attempt < 40 ? avoid : new Set());
    if (!question) continue;
    if (questionIssues(catalog, question).length === 0) return question;
  }
  throw new Error(`no ${kind} question`);
}
