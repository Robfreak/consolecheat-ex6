import assert from "node:assert/strict";
import test from "node:test";
import type { Note } from "./beatmap.ts";
import {
  GOOD_MS,
  PERFECT_MS,
  accuracyOf,
  applyJudgement,
  dueMisses,
  emptyTally,
  hitDeltaMs,
  judgeDelta,
  pickNote,
  pointsFor,
} from "./judgement.ts";

test("judgement windows are Perfect, Gut, and Verpasst", () => {
  assert.equal(PERFECT_MS, 45);
  assert.equal(GOOD_MS, 100);
  assert.equal(judgeDelta(0), "perfect");
  assert.equal(judgeDelta(-45), "perfect");
  assert.equal(judgeDelta(45), "perfect");
  assert.equal(judgeDelta(46), "good");
  assert.equal(judgeDelta(-100), "good");
  assert.equal(judgeDelta(100), "good");
  assert.equal(judgeDelta(101), "miss");
  assert.equal(judgeDelta(-140), "miss");
});

test("combo and score follow Perfect, Gut, and a miss", () => {
  assert.equal(pointsFor("perfect", 0), 300);
  assert.equal(pointsFor("perfect", 2), 320);
  assert.equal(pointsFor("good", 2), 110);
  assert.equal(pointsFor("miss", 4), 0);

  let tally = emptyTally();
  tally = applyJudgement(tally, "perfect").tally;
  assert.deepEqual(
    { score: tally.score, combo: tally.combo, maxCombo: tally.maxCombo, perfect: tally.perfect },
    { score: 300, combo: 1, maxCombo: 1, perfect: 1 },
  );
  tally = applyJudgement(tally, "perfect").tally;
  assert.equal(tally.score, 610);
  assert.equal(tally.combo, 2);
  tally = applyJudgement(tally, "good").tally;
  assert.equal(tally.score, 720);
  assert.equal(tally.combo, 3);
  assert.equal(tally.maxCombo, 3);
  assert.equal(tally.good, 1);
  tally = applyJudgement(tally, "miss").tally;
  assert.equal(tally.score, 720);
  assert.equal(tally.combo, 0);
  assert.equal(tally.maxCombo, 3);
  assert.equal(tally.miss, 1);
  tally = applyJudgement(tally, "perfect").tally;
  assert.equal(tally.combo, 1);
  assert.equal(tally.score, 1020);
  assert.equal(accuracyOf(tally), 80);
  assert.equal(accuracyOf(emptyTally()), 0);
});

test("the calibration offset is applied before the window", () => {
  const notes: Note[] = [
    { timeMs: 1000, lane: 0 },
    { timeMs: 1500, lane: 0 },
  ];
  assert.equal(hitDeltaMs(1040, 1000, 40), 0);
  const onTime = pickNote(notes, new Set(), 0, 1040, 40);
  assert.equal(onTime?.index, 0);
  assert.equal(onTime?.kind, "perfect");
  assert.equal(onTime?.deltaMs, 0);

  const early = pickNote(notes, new Set(), 0, 1000, 40);
  assert.equal(early?.kind, "perfect");
  assert.equal(early?.deltaMs, -40);

  assert.equal(pickNote(notes, new Set(), 0, 1160, 0), null);
  const shifted = pickNote(notes, new Set(), 0, 1160, 60);
  assert.equal(shifted?.kind, "good");
  assert.equal(shifted?.deltaMs, 100);

  const judged = new Set<number>([0]);
  const next = pickNote(notes, judged, 0, 1500, 0);
  assert.equal(next?.index, 1);
  assert.equal(pickNote(notes, judged, 1, 1000, 0), null);

  assert.deepEqual(dueMisses(notes, new Set(), 1100, 0), []);
  assert.deepEqual(dueMisses(notes, new Set(), 1101, 0), [0]);
  assert.deepEqual(dueMisses(notes, new Set(), 1160, 60), []);
  assert.deepEqual(dueMisses(notes, new Set(), 1161, 60), [0]);
  assert.deepEqual(dueMisses(notes, new Set([0]), 1601, 0), [1]);
});
