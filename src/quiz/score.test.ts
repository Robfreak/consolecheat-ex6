import assert from "node:assert/strict";
import test from "node:test";
import { applyAnswer, CLASSIC_LENGTH, ENDLESS_LIVES, newRun, scoreGain, TIMER_SECONDS } from "./score.ts";

test("points, streak bonus, and the timer bonus add up", () => {
  assert.equal(scoreGain("year", 1, false, TIMER_SECONDS), 100);
  assert.equal(scoreGain("which", 1, false, 0), 100);
  assert.equal(scoreGain("month", 1, false, 0), 150);
  assert.equal(scoreGain("year", 2, false, 0), 125);
  assert.equal(scoreGain("year", 4, false, 0), 175);
  assert.equal(scoreGain("month", 3, false, 0), 200);
  assert.equal(scoreGain("year", 1, true, TIMER_SECONDS), 150);
  assert.equal(scoreGain("year", 1, true, 0), 100);
  assert.equal(scoreGain("which", 2, true, TIMER_SECONDS / 2), 150);
});

test("a correct answer raises the streak and a wrong answer clears it", () => {
  let state = newRun("classic");
  let step = applyAnswer(state, { correct: true, kind: "year", timer: false, secondsLeft: 0 });
  assert.equal(step.gained, 100);
  assert.equal(step.state.score, 100);
  assert.equal(step.state.streak, 1);
  assert.equal(step.state.bestStreak, 1);
  assert.equal(step.state.correct, 1);
  assert.equal(step.ended, false);
  step = applyAnswer(step.state, { correct: true, kind: "month", timer: false, secondsLeft: 0 });
  assert.equal(step.gained, 175);
  assert.equal(step.state.streak, 2);
  assert.equal(step.state.bestStreak, 2);
  state = step.state;
  step = applyAnswer(state, { correct: false, kind: "which", timer: false, secondsLeft: 0 });
  assert.equal(step.gained, 0);
  assert.equal(step.state.streak, 0);
  assert.equal(step.state.bestStreak, 2);
  assert.equal(step.state.score, state.score);
  assert.equal(step.state.lives, ENDLESS_LIVES);
  assert.equal(step.ended, false);
});

test("classic ends after 10 answers and endless ends when three lives are gone", () => {
  let state = newRun("classic");
  let ended = false;
  for (let i = 0; i < CLASSIC_LENGTH; i += 1) {
    const step = applyAnswer(state, { correct: i % 2 === 0, kind: "year", timer: false, secondsLeft: 0 });
    state = step.state;
    ended = step.ended;
  }
  assert.equal(state.answered, CLASSIC_LENGTH);
  assert.equal(ended, true);
  assert.equal(state.lives, ENDLESS_LIVES);

  state = newRun("endless");
  for (let i = 0; i < ENDLESS_LIVES; i += 1) {
    const step = applyAnswer(state, { correct: false, kind: "which", timer: true, secondsLeft: 0 });
    state = step.state;
    assert.equal(state.lives, ENDLESS_LIVES - (i + 1));
    assert.equal(step.ended, i === ENDLESS_LIVES - 1);
    assert.equal(state.streak, 0);
  }
  const kept = applyAnswer(newRun("endless"), { correct: true, kind: "year", timer: true, secondsLeft: TIMER_SECONDS });
  assert.equal(kept.ended, false);
  assert.equal(kept.state.lives, ENDLESS_LIVES);
  assert.equal(kept.state.score, 150);
});
