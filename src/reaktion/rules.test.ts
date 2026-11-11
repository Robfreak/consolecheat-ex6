import assert from "node:assert/strict";
import { describe, mock } from "node:test";
import test from "node:test";
import {
  advance,
  applyPress,
  applyReveal,
  applyTimeout,
  ANSWER_WINDOW_MS,
  createSession,
  DELAY_MAX_MS,
  DELAY_MIN_MS,
  pickDelay,
  pickSymbol,
  scheduleReveal,
  SOLO_ROUNDS,
  summarizeSolo,
  type Session,
} from "./rules.ts";

function duel(goal: 3 | 5 = 3, style: "match" | "easy" = "match", symbol: "cross" | "circle" | "square" | "triangle" = "cross"): Session {
  return createSession({ now: 0, delayMs: DELAY_MIN_MS, symbol, mode: "duel", style, goal });
}

function solo(symbol: "cross" | "circle" | "square" | "triangle" = "cross", style: "match" | "easy" = "match"): Session {
  return createSession({ now: 0, delayMs: DELAY_MIN_MS, symbol, mode: "solo", style, goal: 3 });
}

test("the delay stays inside 1.5–4 s and the symbol is one of the four", () => {
  assert.equal(pickDelay(() => 0), DELAY_MIN_MS);
  assert.equal(pickDelay(() => 0.999999), DELAY_MAX_MS);
  assert.equal(pickDelay(() => -2), DELAY_MIN_MS);
  assert.equal(pickDelay(() => 4), DELAY_MAX_MS);
  assert.equal(pickSymbol(() => 0), "cross");
  assert.equal(pickSymbol(() => 0.25), "circle");
  assert.equal(pickSymbol(() => 0.5), "square");
  assert.equal(pickSymbol(() => 0.75), "triangle");
  assert.equal(pickSymbol(() => 0.999999), "triangle");
});

test("a press before the symbol is a false start and does not count as a time", () => {
  let session = solo("triangle");
  const early = applyReveal(session, DELAY_MIN_MS - 1);
  assert.equal(early, session);
  session = applyPress(session, DELAY_MIN_MS - 1, "p1", "triangle");
  assert.equal(session.round.phase, "resolved");
  assert.equal(session.round.outcome?.kind, "false-start");
  if (session.round.outcome?.kind === "false-start") assert.equal(session.round.outcome.awardedTo, null);
  assert.equal(session.soloRows[0]?.kind, "false-start");
  assert.equal(session.soloRows[0]?.ms, null);
  const summary = summarizeSolo(session.soloRows);
  assert.equal(summary.validCount, 0);
  assert.equal(summary.averageMs, null);
  assert.equal(summary.bestMs, null);
  const again = applyPress(session, DELAY_MIN_MS, "p1", "triangle");
  assert.equal(again, session);
});

test("a matching press at the reveal timestamp is 0 ms and a later one is the delta", () => {
  let session = applyReveal(solo("cross"), DELAY_MIN_MS);
  assert.equal(session.round.phase, "live");
  assert.equal(session.round.revealedAt, DELAY_MIN_MS);
  session = applyPress(session, DELAY_MIN_MS, "p1", "cross");
  assert.equal(session.round.outcome?.kind, "correct");
  if (session.round.outcome?.kind === "correct") assert.equal(session.round.outcome.ms, 0);

  let later = applyReveal(solo("circle"), 2000);
  later = applyPress(later, 2180, "p1", "circle");
  if (later.round.outcome?.kind === "correct") assert.equal(later.round.outcome.ms, 180);
  const summary = summarizeSolo([
    { symbol: "cross", kind: "correct", ms: 100 },
    { symbol: "circle", kind: "correct", ms: 101 },
    { symbol: "square", kind: "wrong", ms: null },
    { symbol: "triangle", kind: "false-start", ms: null },
    { symbol: "cross", kind: "miss", ms: null },
  ]);
  assert.equal(summary.averageMs, 101);
  assert.equal(summary.bestMs, 100);
  assert.equal(summary.validCount, 2);
});

test("the wrong button is a miss and is left out of the solo average", () => {
  let session = applyReveal(solo("triangle"), DELAY_MIN_MS);
  session = applyPress(session, DELAY_MIN_MS + 90, "p1", "cross");
  assert.equal(session.round.outcome?.kind, "wrong");
  assert.equal(session.soloRows[0]?.ms, null);
  session = advance(session, 4000, DELAY_MIN_MS, "square");
  session = applyReveal(session, 4000 + DELAY_MIN_MS);
  session = applyPress(session, 4000 + DELAY_MIN_MS + 200, "p1", "square");
  const summary = summarizeSolo(session.soloRows);
  assert.equal(summary.validCount, 1);
  assert.equal(summary.averageMs, 200);
  assert.equal(summary.bestMs, 200);
});

test("solo ignores player 2 and easy mode accepts any press after the signal", () => {
  let session = applyReveal(solo("triangle"), DELAY_MIN_MS);
  const ignored = applyPress(session, DELAY_MIN_MS + 20, "p2", "triangle");
  assert.equal(ignored, session);
  session = applyPress(session, DELAY_MIN_MS + 40, "p1", "any");
  assert.equal(session.round.outcome?.kind, "wrong");

  let easy = applyReveal(solo("triangle", "easy"), DELAY_MIN_MS);
  const tooSoon = createSession({ now: 0, delayMs: DELAY_MIN_MS, symbol: "triangle", mode: "solo", style: "easy", goal: 3 });
  const jumped = applyPress(tooSoon, 10, "p1", "any");
  assert.equal(jumped.round.outcome?.kind, "false-start");
  easy = applyPress(easy, DELAY_MIN_MS + 33, "p1", "any");
  assert.equal(easy.round.outcome?.kind, "correct");
  if (easy.round.outcome?.kind === "correct") assert.equal(easy.round.outcome.ms, 33);
});

test("a duel false start gives the point to the opponent", () => {
  let session = duel(5, "match", "circle");
  session = applyPress(session, 10, "p1", "circle");
  assert.equal(session.round.outcome?.kind, "false-start");
  assert.equal(session.scores.p2, 1);
  assert.equal(session.scores.p1, 0);
  assert.equal(session.duelRows[0]?.reason, "false-start");
  assert.equal(session.duelRows[0]?.winner, "p2");
  assert.equal(session.duelRows[0]?.ms, null);
  assert.equal(session.finished, false);
  const second = applyPress(session, 20, "p2", "cross");
  assert.equal(second, session);
});

test("the first correct press wins the duel round and a wrong press locks that player", () => {
  let session = applyReveal(duel(), DELAY_MIN_MS);
  session = applyPress(session, DELAY_MIN_MS + 50, "p1", "circle");
  assert.equal(session.round.phase, "live");
  assert.equal(session.round.locked.p1, "wrong");
  assert.equal(session.scores.p1, 0);
  const locked = applyPress(session, DELAY_MIN_MS + 80, "p1", "cross");
  assert.equal(locked, session);
  session = applyPress(session, DELAY_MIN_MS + 120, "p2", "cross");
  assert.equal(session.round.outcome?.kind, "correct");
  if (session.round.outcome?.kind === "correct") {
    assert.equal(session.round.outcome.player, "p2");
    assert.equal(session.round.outcome.ms, 120);
  }
  assert.equal(session.scores.p2, 1);
});

test("both wrong presses score nothing, and a timeout scores nothing", () => {
  let session = applyReveal(duel(), DELAY_MIN_MS);
  session = applyPress(session, DELAY_MIN_MS + 10, "p1", "circle");
  session = applyPress(session, DELAY_MIN_MS + 20, "p2", "square");
  assert.equal(session.round.outcome?.kind, "miss");
  assert.equal(session.scores.p1, 0);
  assert.equal(session.scores.p2, 0);
  assert.equal(session.duelRows[0]?.winner, null);

  let quiet = applyReveal(duel(), DELAY_MIN_MS);
  const still = applyTimeout(quiet, DELAY_MIN_MS + ANSWER_WINDOW_MS - 1);
  assert.equal(still, quiet);
  quiet = applyTimeout(quiet, DELAY_MIN_MS + ANSWER_WINDOW_MS);
  assert.equal(quiet.round.outcome?.kind, "miss");
  assert.equal(quiet.duelRows[0]?.ms, null);
  assert.equal(quiet.scores.p1 + quiet.scores.p2, 0);
});

test("first to N ends the duel and further presses do not add points", () => {
  let session = duel(3);
  for (let i = 0; i < 3; i += 1) {
    session = applyReveal(session, session.round.startedAt + DELAY_MIN_MS);
    session = applyPress(session, session.round.revealedAt! + 200, "p2", "cross");
    if (i < 2) session = advance(session, session.round.revealedAt! + 2000, DELAY_MIN_MS, "cross");
  }
  assert.equal(session.scores.p2, 3);
  assert.equal(session.scores.p1, 0);
  assert.equal(session.matchWinner, "p2");
  assert.equal(session.finished, true);
  assert.equal(session.duelRows.length, 3);
  const stuck = applyPress(session, 99_000, "p1", "cross");
  assert.equal(stuck, session);
  assert.equal(advance(session, 99_000, DELAY_MIN_MS, "circle"), session);

  let five = duel(5);
  for (let i = 0; i < 3; i += 1) {
    five = applyReveal(five, five.round.startedAt + DELAY_MIN_MS);
    five = applyPress(five, five.round.revealedAt! + 10, "p1", "cross");
    five = advance(five, five.round.revealedAt! + 1000, DELAY_MIN_MS, "cross");
  }
  assert.equal(five.finished, false);
  assert.equal(five.scores.p1, 3);
  assert.equal(five.roundNumber, 4);
});

test("solo finishes after 5 rounds", () => {
  let session = solo();
  for (let i = 0; i < SOLO_ROUNDS; i += 1) {
    session = applyReveal(session, session.round.startedAt + DELAY_MIN_MS);
    session = applyPress(session, session.round.revealedAt! + 100 + i, "p1", "cross");
    if (i < SOLO_ROUNDS - 1) session = advance(session, session.round.revealedAt! + 500, DELAY_MIN_MS, "cross");
  }
  assert.equal(session.finished, true);
  assert.equal(session.soloRows.length, 5);
  const summary = summarizeSolo(session.soloRows);
  assert.equal(summary.bestMs, 100);
  assert.equal(summary.validCount, 5);
});

describe("reveal delay", { concurrency: false }, () => {
  test("the symbol stays hidden until the timer fires, and an early press is a false start", () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      let now = 5_000;
      let session = createSession({ now, delayMs: 1_500, symbol: "triangle", mode: "solo", style: "match", goal: 3 });
      let revealed = false;
      const cancel = scheduleReveal(
        session.round.delayMs,
        () => now,
        (fn, ms) => setTimeout(fn, ms),
        (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
        (at) => {
          revealed = true;
          session = applyReveal(session, at);
        },
      );
      now = 6_000;
      mock.timers.tick(1_000);
      assert.equal(revealed, false);
      assert.equal(session.round.phase, "waiting");
      session = applyPress(session, now, "p1", "triangle");
      assert.equal(session.round.outcome?.kind, "false-start");
      cancel();
      now = 8_000;
      mock.timers.tick(2_000);
      assert.equal(revealed, false);
      assert.equal(session.round.phase, "resolved");
    } finally {
      mock.timers.reset();
    }
  });

  test("when the timer fires, a matching press records the milliseconds", () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      let now = 0;
      let session = createSession({ now, delayMs: 2_000, symbol: "circle", mode: "duel", style: "match", goal: 3 });
      scheduleReveal(
        2_000,
        () => now,
        (fn, ms) => setTimeout(fn, ms),
        (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
        (at) => {
          session = applyReveal(session, at);
        },
      );
      now = 2_000;
      mock.timers.tick(2_000);
      assert.equal(session.round.phase, "live");
      assert.equal(session.round.revealedAt, 2_000);
      session = applyPress(session, 2_180, "p1", "circle");
      assert.equal(session.round.outcome?.kind, "correct");
      if (session.round.outcome?.kind === "correct") assert.equal(session.round.outcome.ms, 180);
      assert.equal(session.scores.p1, 1);
      session = applyPress(session, 2_190, "p2", "circle");
      assert.equal(session.scores.p2, 0);
    } finally {
      mock.timers.reset();
    }
  });
});
