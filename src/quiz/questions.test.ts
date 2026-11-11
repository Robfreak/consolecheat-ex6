import assert from "node:assert/strict";
import test from "node:test";
import { catalog, snapshotMeta, yearsOfTitle } from "./catalog.ts";
import { archiveHref, formatMonth, generateQuestion, kindAt, mulberry32, questionIssues, type QuestionKind } from "./questions.ts";

test("the snapshot is the PS Plus archive, with real months and no invented rows", () => {
  assert.equal(snapshotMeta.source, "https://github.com/Robfreak/consolecheat-ex2");
  assert.equal(snapshotMeta.sourceFile, "public/archive.json");
  assert.equal(snapshotMeta.sourceCommit, "0c58ca5ccf57b1f75116a29f965b13bd69bd700f");
  assert.equal(snapshotMeta.sourceSite, "https://robfreak.github.io/consolecheat-ex2/");
  assert.equal(snapshotMeta.snapshotDate, "2026-11-11");
  assert.equal(snapshotMeta.archiveGenerated, "2026-10-22");
  assert.match(snapshotMeta.note, /Nothing was invented/);
  assert.equal(catalog.appearances.length, 691);
  assert.equal(catalog.months[0], "2013-11");
  assert.equal(catalog.months.at(-1), "2026-10");
  assert.ok(catalog.titlesByMonth.get("2026-10")?.includes("Earth Defense Force: World Brothers 2"));
  assert.ok(catalog.titlesByMonth.get("2026-10")?.includes("F1 25"));
  assert.ok(catalog.titles.has("Hunt: Showdown 1896"));
  for (const row of catalog.appearances) {
    assert.match(row.ym, /^\d{4}-(?:0[1-9]|1[0-2])$/);
    assert.ok(row.title.length > 0);
    assert.ok(catalog.titles.get(row.title)?.includes(row.ym));
  }
});

test("questions keep the correct answer, unique options, and no ambiguous month", () => {
  const kinds: QuestionKind[] = ["year", "month", "which"];
  for (const kind of kinds) {
    for (let seed = 1; seed <= 40; seed += 1) {
      const question = generateQuestion(catalog, mulberry32(seed * 17 + kind.length), kind);
      assert.deepEqual(questionIssues(catalog, question), [], `${kind} ${seed} ${question.subject}`);
      assert.equal(question.options.includes(question.correct), true);
      assert.equal(new Set(question.options).size, 4);
      if (kind === "year") {
        assert.deepEqual(yearsOfTitle(catalog, question.subject), [question.correct]);
        for (const option of question.options) {
          if (option !== question.correct) assert.equal(yearsOfTitle(catalog, question.subject).includes(option), false);
        }
      }
      if (kind === "month") {
        assert.deepEqual(catalog.titles.get(question.subject), [question.correct]);
      }
      if (kind === "which") {
        const inMonth = new Set(catalog.titlesByMonth.get(question.subject));
        const hits = question.options.filter((option) => inMonth.has(option));
        assert.deepEqual(hits, [question.correct]);
      }
    }
  }
});

test("normal play mixes all three kinds and harder mode drops the year question", () => {
  const mix = new Set(Array.from({ length: 12 }, (_, index) => kindAt(index, false)));
  assert.deepEqual([...mix].sort(), ["month", "which", "year"]);
  const hard = Array.from({ length: 12 }, (_, index) => kindAt(index, true));
  assert.equal(hard.includes("year"), false);
  assert.equal(hard.includes("month"), true);
  assert.equal(hard.includes("which"), true);
});

test("archive links are plain query links and month labels use the snapshot month", () => {
  const href = archiveHref("God of War III Remastered");
  const url = new URL(href);
  assert.equal(`${url.origin}${url.pathname}`, "https://robfreak.github.io/consolecheat-ex2/");
  assert.equal(url.searchParams.get("q"), "God of War III Remastered");
  assert.equal(formatMonth("2018-09"), "September 2018");
  assert.equal(formatMonth("2018-03", ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]), "März 2018");
});
