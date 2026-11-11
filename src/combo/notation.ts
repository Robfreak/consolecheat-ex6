import type { Direction, FaceButton, Step } from "./types.ts";

export const DIRECTION_GLYPH: Record<Direction, string> = {
  1: "↙",
  2: "↓",
  3: "↘",
  4: "←",
  6: "→",
  7: "↖",
  8: "↑",
  9: "↗",
};

export const BUTTON_GLYPH: Record<FaceButton, string> = {
  square: "□",
  triangle: "△",
  cross: "×",
  circle: "○",
};

export function stepGlyph(step: Step): string {
  const direction = step.direction ? DIRECTION_GLYPH[step.direction] : "";
  const button = step.button ? BUTTON_GLYPH[step.button] : "";
  return `${direction}${button}`;
}

export function comboGlyph(steps: readonly Step[]): string {
  return steps.map(stepGlyph).join(" ");
}
