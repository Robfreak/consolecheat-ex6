// Sequence matcher.
//
// A step is a direction, a button, or both. The first matching input starts the
// combo. Anything else before that is ignored, so walking around is not a miss.
// After the combo has started, each later step has to land within the frame
// window of the previous accepted step.
//
// Neutral (returning to 5) is ignored. Repeating the direction of the last
// accepted step is ignored, unless the next step is that same direction again.
// A direction+button step is not failed when the direction arrives first: the
// button can complete it while that direction is held, still inside the window.
// A wrong direction, a wrong button, or a late real input aborts and the caller
// resets to step 0.

import type { Direction, Step, TrainerInput } from "./types.ts";
import { framesBetween } from "./timing.ts";

export type AbortReason = "wrong-direction" | "wrong-button" | "late";

export type Finished =
  | { ok: true; totalFrames: number }
  | { ok: false; reason: AbortReason; frames: number | null };

export type Attempt = {
  index: number;
  lastAt: number | null;
  gaps: (number | null)[];
  currentDirection: Direction | null;
  finished: Finished | null;
};

export function freshAttempt(): Attempt {
  return { index: 0, lastAt: null, gaps: [], currentDirection: null, finished: null };
}

export function totalFrames(gaps: readonly (number | null)[]): number {
  return gaps.reduce<number>((sum, gap) => sum + (gap ?? 0), 0);
}

type Kind = "match" | "ignore" | "wrong-direction" | "wrong-button";

export function classify(step: Step, input: TrainerInput, currentDirection: Direction | null): Kind {
  if (input.direction === null && input.button == null) return "ignore";

  const repeated =
    input.button == null &&
    input.direction != null &&
    currentDirection != null &&
    input.direction === currentDirection;
  const sameDirectionAgain = step.direction === input.direction && step.button == null;
  if (repeated && !sameDirectionAgain) return "ignore";

  if (matches(step, input)) return "match";

  if (
    step.direction &&
    step.button &&
    input.button == null &&
    input.direction === step.direction &&
    !input.heldButtons.includes(step.button)
  ) {
    return "ignore";
  }

  if (input.button != null && input.button !== step.button) return "wrong-button";
  if (step.button && input.button === step.button && step.direction && input.heldDirection !== step.direction) {
    return "wrong-direction";
  }
  if (input.direction != null && step.direction && input.direction !== step.direction) return "wrong-direction";
  if (input.direction != null && !step.direction) return "wrong-direction";
  return "ignore";
}

function matches(step: Step, input: TrainerInput): boolean {
  if (step.direction && step.button) {
    const directionOk = input.heldDirection === step.direction;
    const pressed = input.button === step.button;
    const alreadyHeld = input.button == null && input.direction === step.direction && input.heldButtons.includes(step.button);
    return directionOk && (pressed || alreadyHeld);
  }
  if (step.direction && !step.button) {
    return input.button == null && input.direction === step.direction;
  }
  if (!step.direction && step.button) {
    if (input.button !== step.button) return false;
    if (input.direction != null) return false;
    return true;
  }
  return false;
}

function abort(attempt: Attempt, reason: AbortReason, frames: number | null): Attempt {
  return { ...attempt, finished: { ok: false, reason, frames } };
}

export function applyInput(steps: readonly Step[], attempt: Attempt, input: TrainerInput, windowFrames: number): Attempt {
  if (attempt.finished || steps.length === 0 || attempt.index >= steps.length) return attempt;
  const step = steps[attempt.index];
  if (!step) return attempt;
  const kind = classify(step, input, attempt.currentDirection);
  if (kind === "ignore") return attempt;
  if (attempt.index === 0 && kind !== "match") return attempt;

  const gap = attempt.lastAt == null ? null : framesBetween(attempt.lastAt, input.timeMs);
  if (attempt.index > 0 && gap != null && gap > windowFrames) return abort(attempt, "late", gap);
  if (kind === "wrong-direction" || kind === "wrong-button") return abort(attempt, kind, gap);

  const gaps = [...attempt.gaps, gap];
  const index = attempt.index + 1;
  const currentDirection = step.direction ?? attempt.currentDirection;
  if (index >= steps.length) {
    return {
      index,
      lastAt: input.timeMs,
      gaps,
      currentDirection,
      finished: { ok: true, totalFrames: totalFrames(gaps) },
    };
  }
  return { index, lastAt: input.timeMs, gaps, currentDirection, finished: null };
}

/** Abort when the window runs out with no completing input. Neutral waiting still counts. */
export function expire(attempt: Attempt, nowMs: number, windowFrames: number): Attempt {
  if (attempt.finished || attempt.index === 0 || attempt.lastAt == null) return attempt;
  const gap = framesBetween(attempt.lastAt, nowMs);
  if (gap > windowFrames) return abort(attempt, "late", gap);
  return attempt;
}
