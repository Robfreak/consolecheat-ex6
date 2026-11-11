// Shared shapes for the combo trainer.
// Directions use fighting-game numpad notation (5 is neutral and is never stored):
//   7 8 9
//   4   6
//   1 2 3

export const DIRECTIONS = [1, 2, 3, 4, 6, 7, 8, 9] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const FACE_BUTTONS = ["square", "triangle", "cross", "circle"] as const;
export type FaceButton = (typeof FACE_BUTTONS)[number];

export type Step = {
  direction: Direction | null;
  button: FaceButton | null;
};

export type LayoutId = "jkli" | "uijk";

export const WINDOW_MIN = 4;
export const WINDOW_MAX = 30;
export const WINDOW_DEFAULT = 12;
export const DEADZONE = 0.5;
export const HISTORY_LIMIT = 20;
export const MAX_STEPS = 16;
export const MAX_CUSTOMS = 30;
export const MAX_NAME = 32;

export type TrainerInput = {
  timeMs: number;
  /** Set when the held direction changed. `null` is a return to neutral. Omit when it did not change. */
  direction?: Direction | null;
  /** A face button that just went down. */
  button?: FaceButton;
  /** Direction held after this input. */
  heldDirection: Direction | null;
  /** Face buttons held after this input. */
  heldButtons: readonly FaceButton[];
};

export function isDirection(value: unknown): value is Direction {
  return typeof value === "number" && (DIRECTIONS as readonly number[]).includes(value);
}

export function isFaceButton(value: unknown): value is FaceButton {
  return value === "square" || value === "triangle" || value === "cross" || value === "circle";
}

export function isStep(value: unknown): value is Step {
  if (!value || typeof value !== "object") return false;
  const step = value as Step;
  const directionOk = step.direction === null || isDirection(step.direction);
  const buttonOk = step.button === null || isFaceButton(step.button);
  return directionOk && buttonOk && (step.direction !== null || step.button !== null);
}

export function clampWindow(value: number): number {
  if (!Number.isFinite(value)) return WINDOW_DEFAULT;
  return Math.min(WINDOW_MAX, Math.max(WINDOW_MIN, Math.round(value)));
}
