import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  activeProfile,
  bestPossibleTime,
  createDefaultStore,
  elapsedMs,
  formatClock,
  formatDelta,
  freshRun,
  isPbCandidate,
  needsResetConfirm,
  previousSegmentDelta,
  resetKind,
  sumOfBest,
  withActive,
  type Profile,
  type Store,
} from "./model.ts";
import { dispatch } from "./run.ts";

function profileWith(patch: Partial<Profile>): Store {
  const store = createDefaultStore();
  const profile = { ...activeProfile(store), ...patch };
  return withActive(store, profile);
}

test("the clock is a start timestamp, including a gap with no samples", () => {
  const store = createDefaultStore();
  const started = dispatch(store, freshRun(), "start-split", 1_000);
  assert.equal(started.run.phase, "running");
  assert.equal(elapsedMs(started.run, 1_000), 0);
  assert.equal(elapsedMs(started.run, 6_000), 5_000);
  assert.equal(elapsedMs(started.run, 1_000 + 120_000), 120_000);
  const board = readFileSync(new URL("./board.tsx", import.meta.url), "utf8");
  assert.match(board, /performance\.now\(\)/);
  assert.match(board, /requestAnimationFrame/);
  assert.match(board, /visibilitychange/);
  assert.doesNotMatch(board, /setInterval/);
  assert.match(board, /aria-live="polite"/);
});

test("pause freezes the clock and a gap while paused does not count", () => {
  let step = dispatch(createDefaultStore(), freshRun(), "start-split", 0);
  step = dispatch(step.store, step.run, "pause", 1_000);
  assert.equal(step.run.phase, "paused");
  assert.equal(elapsedMs(step.run, 1_000), 1_000);
  assert.equal(elapsedMs(step.run, 50_000), 1_000);
  step = dispatch(step.store, step.run, "pause", 50_000);
  assert.equal(step.event?.kind, "resume");
  assert.equal(elapsedMs(step.run, 50_000), 1_000);
  assert.equal(elapsedMs(step.run, 53_000), 4_000);
  const split = dispatch(step.store, step.run, "start-split", 53_000);
  assert.equal(split.run.completed[0], 4_000);
});

test("split, undo, skip, and pause follow the attempt", () => {
  let step = dispatch(createDefaultStore(), freshRun(), "start-split", 0);
  assert.equal(activeProfile(step.store).attempts, 1);
  step = dispatch(step.store, step.run, "start-split", 2_000);
  assert.deepEqual(step.run.completed, [2_000]);
  assert.equal(step.event?.kind, "split");
  step = dispatch(step.store, step.run, "skip", 9_000);
  assert.deepEqual(step.run.completed, [2_000, "skip"]);
  step = dispatch(step.store, step.run, "undo", 9_000);
  assert.deepEqual(step.run.completed, [2_000]);
  assert.equal(step.run.phase, "running");
  const paused = dispatch(step.store, step.run, "pause", 2_500);
  const ignored = dispatch(paused.store, paused.run, "start-split", 8_000);
  assert.equal(ignored.event, null);
  assert.equal(ignored.run.phase, "paused");
  const undonePause = dispatch(paused.store, paused.run, "undo", 8_000);
  assert.deepEqual(undonePause.run.completed, []);
  assert.equal(undonePause.run.phase, "paused");
  step = dispatch(step.store, step.run, "start-split", 5_000);
  step = dispatch(step.store, step.run, "start-split", 9_000);
  assert.equal(step.run.phase, "finished");
  assert.equal(step.run.completed.at(-1), 9_000);
  const undone = dispatch(step.store, step.run, "undo", 9_000);
  assert.equal(undone.run.phase, "running");
  assert.equal(undone.run.completed.length, 2);
});

test("deltas, golds, sum of best, and best possible time", () => {
  const store = profileWith({
    pb: [12_000, 35_000, 70_000],
    bestSegments: [10_000, 20_000, 30_000],
  });
  assert.equal(sumOfBest(activeProfile(store).bestSegments), 60_000);
  let step = dispatch(store, freshRun(), "start-split", 0);
  assert.equal(bestPossibleTime(activeProfile(step.store), step.run, 8_000), 60_000);
  assert.equal(bestPossibleTime(activeProfile(step.store), step.run, 15_000), 65_000);
  step = dispatch(step.store, step.run, "start-split", 15_000);
  assert.equal(step.event?.kind, "split");
  if (step.event?.kind === "split") {
    assert.equal(step.event.delta, 3_000);
    assert.equal(step.event.gold, false);
  }
  assert.equal(previousSegmentDelta(activeProfile(step.store), step.run), 3_000);
  step = dispatch(step.store, step.run, "start-split", 25_000);
  if (step.event?.kind === "split") {
    assert.equal(step.event.delta, 25_000 - 35_000);
    assert.equal(step.event.gold, true);
  }
  assert.equal(previousSegmentDelta(activeProfile(step.store), step.run), 10_000 - 23_000);
  assert.equal(bestPossibleTime(activeProfile(step.store), step.run, 25_000), 55_000);
  step = dispatch(step.store, step.run, "start-split", 60_000);
  assert.equal(step.event?.kind, "finish");
  assert.equal(step.run.phase, "finished");
  const saved = activeProfile(step.store).bestSegments;
  assert.deepEqual(saved, [10_000, 10_000, 30_000]);
  assert.equal(sumOfBest(saved), 50_000);
  assert.equal(isPbCandidate(activeProfile(step.store), step.run), true);
  assert.equal(bestPossibleTime(activeProfile(step.store), step.run, 99_000), 60_000);
});

test("a finish saves golds even when the run is not a personal best, and a faster run can be saved", () => {
  const store = profileWith({
    pb: [5_000, 10_000, 15_000],
    bestSegments: [5_000, 5_000, 5_000],
  });
  let step = dispatch(store, freshRun(), "start-split", 0);
  step = dispatch(step.store, step.run, "start-split", 4_000);
  step = dispatch(step.store, step.run, "start-split", 12_000);
  step = dispatch(step.store, step.run, "start-split", 20_000);
  assert.equal(step.event && step.event.kind === "finish" && step.event.pb, false);
  assert.deepEqual(activeProfile(step.store).bestSegments, [4_000, 5_000, 5_000]);
  assert.deepEqual(activeProfile(step.store).pb, [5_000, 10_000, 15_000]);
  assert.equal(needsResetConfirm(step.run, activeProfile(step.store)), false);

  const faster = profileWith({ pb: [20_000, 40_000, 60_000], bestSegments: [20_000, 20_000, 20_000] });
  let run = dispatch(faster, freshRun(), "start-split", 0);
  run = dispatch(run.store, run.run, "start-split", 10_000);
  run = dispatch(run.store, run.run, "start-split", 20_000);
  run = dispatch(run.store, run.run, "start-split", 30_000);
  assert.equal(isPbCandidate(activeProfile(run.store), run.run), true);
  assert.equal(resetKind(run.run, activeProfile(run.store)), "pb");
  const kept = dispatch(run.store, run.run, "save-pb", 30_000);
  assert.deepEqual(activeProfile(kept.store).pb, [10_000, 20_000, 30_000]);
  assert.equal(needsResetConfirm(kept.run, activeProfile(kept.store)), false);
  const reverted = dispatch(kept.store, kept.run, "undo", 31_000);
  assert.deepEqual(activeProfile(reverted.store).pb, [20_000, 40_000, 60_000]);
  assert.deepEqual(activeProfile(reverted.store).bestSegments, [20_000, 20_000, 20_000]);
});

test("reset asks mid-run and when a gold is still unsaved", () => {
  let step = dispatch(createDefaultStore(), freshRun(), "start-split", 0);
  assert.equal(needsResetConfirm(step.run, activeProfile(step.store)), true);
  assert.equal(resetKind(step.run, activeProfile(step.store)), "mid");
  step = dispatch(step.store, step.run, "start-split", 1_000);
  assert.equal(resetKind(step.run, activeProfile(step.store)), "gold");
  const reset = dispatch(step.store, step.run, "reset", 2_000);
  assert.equal(reset.run.phase, "idle");
  assert.equal(activeProfile(reset.store).attempts, 1);
  assert.deepEqual(activeProfile(reset.store).bestSegments, [null, null, null]);
  assert.equal(needsResetConfirm(freshRun(), activeProfile(storeIdle())), false);
});

test("clock and delta text use hundredths", () => {
  assert.equal(formatClock(0), "0:00.00");
  assert.equal(formatClock(12_340), "0:12.34");
  assert.equal(formatClock(90_000), "1:30.00");
  assert.equal(formatClock(3_661_000), "1:01:01.00");
  assert.equal(formatDelta(-420), "−0.42");
  assert.equal(formatDelta(1_500), "+1.50");
  assert.equal(formatDelta(62_000), "+1:02.00");
  assert.equal(formatDelta(0), "0.00");
});

function storeIdle(): Store {
  return createDefaultStore();
}
