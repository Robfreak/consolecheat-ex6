import assert from "node:assert/strict";
import test from "node:test";
import { BUILTINS, type BuiltinCombo } from "./combos.ts";
import { pushHistory } from "./history.ts";
import { applyInput, expire, freshAttempt, type Attempt } from "./matcher.ts";
import { frameMs, framesBetween, withinWindow } from "./timing.ts";
import type { Direction, FaceButton, Step, TrainerInput } from "./types.ts";

function dir(direction: Direction, timeMs: number): TrainerInput {
  return { timeMs, direction, heldDirection: direction, heldButtons: [] };
}

function btn(button: FaceButton, timeMs: number, heldDirection: Direction | null = null): TrainerInput {
  return { timeMs, button, heldDirection, heldButtons: [button] };
}

function play(steps: readonly Step[], inputs: readonly TrainerInput[], windowFrames = 12): Attempt {
  return inputs.reduce((attempt, input) => applyInput(steps, attempt, input, windowFrames), freshAttempt());
}

function successInputs(steps: readonly Step[], gapFrames = 4): TrainerInput[] {
  const inputs: TrainerInput[] = [];
  let frames = 0;
  for (const step of steps) {
    const timeMs = frameMs(frames);
    if (step.direction && step.button) {
      inputs.push(dir(step.direction, timeMs));
      frames += 1;
      inputs.push(btn(step.button, frameMs(frames), step.direction));
    } else if (step.direction) {
      inputs.push(dir(step.direction, timeMs));
    } else if (step.button) {
      inputs.push(btn(step.button, timeMs));
    }
    frames += gapFrames;
  }
  return inputs;
}

function tolerantInputs(steps: readonly Step[]): TrainerInput[] {
  const inputs: TrainerInput[] = [];
  let frames = 0;
  let current: Direction | null = null;
  for (const step of steps) {
    if (inputs.length > 0) {
      inputs.push({ timeMs: frameMs(frames), direction: null, heldDirection: null, heldButtons: [] });
      frames += 1;
      if (current) {
        inputs.push(dir(current, frameMs(frames)));
        frames += 1;
      }
    }
    const timeMs = frameMs(frames);
    if (step.direction && step.button) {
      inputs.push(dir(step.direction, timeMs));
      frames += 1;
      inputs.push(btn(step.button, frameMs(frames), step.direction));
    } else if (step.direction) {
      inputs.push(dir(step.direction, timeMs));
    } else if (step.button) {
      inputs.push(btn(step.button, timeMs));
    }
    current = step.direction ?? current;
    frames += 3;
  }
  return inputs;
}

function secondInput(step: Step, timeMs: number): TrainerInput {
  if (step.direction && step.button) return btn(step.button, timeMs, step.direction);
  if (step.direction) return dir(step.direction, timeMs);
  return btn(step.button ?? "square", timeMs);
}

test("frame gaps at 60 fps follow the timestamps and the window edge", () => {
  assert.equal(framesBetween(0, 0), 0);
  assert.equal(framesBetween(0, frameMs(1)), 1);
  assert.equal(framesBetween(0, frameMs(12)), 12);
  assert.equal(framesBetween(0, frameMs(13)), 13);
  assert.equal(framesBetween(0, 1000), 60);
  assert.equal(framesBetween(50, 40), 0);
  assert.equal(withinWindow(12, 12), true);
  assert.equal(withinWindow(13, 12), false);
  assert.equal(withinWindow(null, 12), null);
  assert.equal(withinWindow(4, 4), true);
  assert.equal(withinWindow(5, 4), false);
  assert.equal(withinWindow(30, 30), true);
});

test("every built-in combo succeeds, aborts on a wrong input, aborts when late, and tolerates neutral and repeats", () => {
  for (const combo of BUILTINS) {
    const done = play(combo.steps, successInputs(combo.steps, 4), 12);
    assert.equal(done.finished?.ok, true, combo.id);
    if (done.finished?.ok) assert.ok(done.finished.totalFrames > 0, combo.id);

    const tolerated = play(combo.steps, tolerantInputs(combo.steps), 12);
    assert.equal(tolerated.finished?.ok, true, `${combo.id} tolerance`);

    const started = play(combo.steps, successInputs(combo.steps, 4).slice(0, 1), 12);
    assert.equal(started.index, 1, combo.id);
    assert.equal(started.finished, null, combo.id);
    const wrong = applyInput(combo.steps, started, wrongInput(combo), 12);
    assert.equal(wrong.finished?.ok, false, combo.id);
    if (wrong.finished && !wrong.finished.ok) {
      assert.ok(wrong.finished.reason === "wrong-direction" || wrong.finished.reason === "wrong-button", combo.id);
    }

    const late = applyInput(combo.steps, started, secondInput(combo.steps[1]!, frameMs(13)), 12);
    assert.equal(late.finished?.ok, false, `${combo.id} late`);
    if (late.finished && !late.finished.ok) assert.equal(late.finished.reason, "late", combo.id);

    const expired = expire(started, frameMs(13), 12);
    assert.equal(expired.finished?.ok, false, `${combo.id} expire`);
    if (expired.finished && !expired.finished.ok) {
      assert.equal(expired.finished.reason, "late");
      assert.equal(expired.finished.frames, 13);
    }
    const idle = freshAttempt();
    assert.equal(expire(idle, frameMs(40), 12), idle);
  }
});

function wrongInput(combo: BuiltinCombo): TrainerInput {
  if (combo.id === "chain") return btn("circle", frameMs(4));
  return dir(8, frameMs(4));
}

test("a configurable window accepts the same gaps at 30 frames and rejects them at 4", () => {
  const steps = BUILTINS[0]!.steps;
  const inputs = [dir(2, 0), dir(3, frameMs(5)), btn("square", frameMs(10), 6)];
  assert.equal(play(steps, inputs, 30).finished?.ok, true);
  assert.equal(play(steps, inputs, 5).finished?.ok, true);
  const tight = play(steps, inputs, 4);
  assert.equal(tight.finished?.ok, false);
  if (tight.finished && !tight.finished.ok) assert.equal(tight.finished.reason, "late");
});

test("neutral and a repeated direction do not abort, even outside the window, and the real step still can", () => {
  const steps = BUILTINS[0]!.steps;
  let attempt = applyInput(steps, freshAttempt(), dir(2, 0), 12);
  attempt = applyInput(steps, attempt, { timeMs: frameMs(30), direction: null, heldDirection: null, heldButtons: [] }, 12);
  assert.equal(attempt.finished, null);
  assert.equal(attempt.index, 1);
  attempt = applyInput(steps, attempt, dir(2, frameMs(40)), 12);
  assert.equal(attempt.finished, null);
  assert.equal(attempt.index, 1);

  const late = applyInput(steps, attempt, dir(3, frameMs(41)), 12);
  assert.equal(late.finished?.ok, false);
  if (late.finished && !late.finished.ok) assert.equal(late.finished.reason, "late");

  let onTime = applyInput(steps, freshAttempt(), dir(2, 0), 12);
  onTime = applyInput(steps, onTime, dir(2, frameMs(3)), 12);
  onTime = applyInput(steps, onTime, dir(3, frameMs(6)), 12);
  assert.equal(onTime.index, 2);
  onTime = applyInput(steps, onTime, dir(6, frameMs(8)), 12);
  assert.equal(onTime.index, 2);
  assert.equal(onTime.finished, null);
  onTime = applyInput(steps, onTime, btn("square", frameMs(10), 6), 12);
  assert.equal(onTime.finished?.ok, true);

  const earlyButton = applyInput(steps, freshAttempt(), btn("cross", 0), 12);
  assert.equal(earlyButton.index, 0);
  assert.equal(earlyButton.finished, null);
});

test("hadouken frame gaps are the rounded 60 fps distance from the previous accepted step", () => {
  const steps = BUILTINS[0]!.steps;
  let attempt = applyInput(steps, freshAttempt(), dir(2, 0), 12);
  attempt = applyInput(steps, attempt, dir(3, frameMs(6)), 12);
  attempt = applyInput(steps, attempt, btn("square", frameMs(6 + 7), 6), 12);
  assert.deepEqual(attempt.gaps, [null, 6, 7]);
  assert.equal(attempt.finished?.ok, true);
  if (attempt.finished?.ok) assert.equal(attempt.finished.totalFrames, 13);
  assert.equal(attempt.gaps.filter((gap) => gap != null && gap <= 12).length, 2);
});

test("the input history keeps the last 20 inputs with frame gaps and skips neutral", () => {
  let history = pushHistory([], dir(2, 0));
  history = pushHistory(history, { timeMs: frameMs(3), direction: null, heldDirection: null, heldButtons: [] });
  assert.equal(history.length, 1);
  history = pushHistory(history, btn("square", frameMs(4), 2));
  assert.equal(history[1]?.button, "square");
  assert.equal(history[1]?.frames, 4);
  for (let index = 0; index < 25; index += 1) {
    history = pushHistory(history, dir(index % 2 === 0 ? 6 : 4, frameMs(10 + index)));
  }
  assert.equal(history.length, 20);
  assert.equal(history[19]?.timeMs, frameMs(10 + 24));
});
