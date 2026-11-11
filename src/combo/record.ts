// Recording turns live inputs into steps.
// A button pressed while a direction is held becomes one direction+button step.
// If the previous step is that direction alone, it is replaced, so ↓ ↘ → then □
// while holding → is stored as ↓ ↘ →□ and not as an extra step.
// Neutral and a repeated direction with no button are not stored.

import { MAX_STEPS, type Step, type TrainerInput } from "./types.ts";

export function recordInput(steps: readonly Step[], input: TrainerInput): Step[] {
  if (input.button) {
    const step: Step = { direction: input.heldDirection, button: input.button };
    const last = steps[steps.length - 1];
    if (last && last.button == null && last.direction && last.direction === input.heldDirection) {
      return [...steps.slice(0, -1), step];
    }
    if (steps.length >= MAX_STEPS) return steps.slice();
    return [...steps, step];
  }
  if (input.direction) {
    const last = steps[steps.length - 1];
    if (last && last.button == null && last.direction === input.direction) return steps.slice();
    if (steps.length >= MAX_STEPS) return steps.slice();
    return [...steps, { direction: input.direction, button: null }];
  }
  return steps.slice();
}

export function addPaletteStep(steps: readonly Step[], step: Step): Step[] {
  if (step.direction == null && step.button == null) return steps.slice();
  if (steps.length >= MAX_STEPS) return steps.slice();
  return [...steps, { direction: step.direction, button: step.button }];
}

export function removeStep(steps: readonly Step[], index: number): Step[] {
  if (index < 0 || index >= steps.length) return steps.slice();
  return steps.filter((_, item) => item !== index);
}

export function moveStep(steps: readonly Step[], index: number, delta: number): Step[] {
  const nextIndex = index + delta;
  if (index < 0 || index >= steps.length || nextIndex < 0 || nextIndex >= steps.length) return steps.slice();
  const copy = steps.slice();
  const [item] = copy.splice(index, 1);
  if (!item) return steps.slice();
  copy.splice(nextIndex, 0, item);
  return copy;
}
