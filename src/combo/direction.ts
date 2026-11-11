// 8-way direction from a keyboard, a D-pad, or a stick.
// Opposite directions cancel (neutral SOCD), so holding left and right is neutral
// and holding down plus right is down-right. Diagonals are just both axes at once.
// The stick uses a deadzone. Values inside it, including the deadzone itself, are neutral.
// Gamepad Y is the standard mapping: negative is up, positive is down.

import { DEADZONE, type Direction } from "./types.ts";

export type Axis = { up: boolean; down: boolean; left: boolean; right: boolean };

const KEY_AXIS: Record<string, keyof Axis> = {
  w: "up",
  W: "up",
  ArrowUp: "up",
  s: "down",
  S: "down",
  ArrowDown: "down",
  a: "left",
  A: "left",
  ArrowLeft: "left",
  d: "right",
  D: "right",
  ArrowRight: "right",
};

export function emptyAxis(): Axis {
  return { up: false, down: false, left: false, right: false };
}

export function axisToDirection(axis: Axis): Direction | null {
  const up = axis.up && !axis.down;
  const down = axis.down && !axis.up;
  const left = axis.left && !axis.right;
  const right = axis.right && !axis.left;
  if (down && left) return 1;
  if (down && right) return 3;
  if (up && left) return 7;
  if (up && right) return 9;
  if (down) return 2;
  if (left) return 4;
  if (right) return 6;
  if (up) return 8;
  return null;
}

export function axisFromKeys(keys: readonly string[]): Axis {
  const axis = emptyAxis();
  for (const key of keys) {
    const part = KEY_AXIS[key];
    if (part) axis[part] = true;
  }
  return axis;
}

export function directionFromKeys(keys: readonly string[]): Direction | null {
  return axisToDirection(axisFromKeys(keys));
}

export function isDirectionKey(key: string): boolean {
  return KEY_AXIS[key] !== undefined;
}

export function stickToDirection(x: number, y: number, deadzone = DEADZONE): Direction | null {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return axisToDirection({
    left: x < -deadzone,
    right: x > deadzone,
    up: y < -deadzone,
    down: y > deadzone,
  });
}

export function dpadToDirection(buttons: readonly { pressed: boolean }[]): Direction | null {
  return axisToDirection({
    up: buttons[12]?.pressed === true,
    down: buttons[13]?.pressed === true,
    left: buttons[14]?.pressed === true,
    right: buttons[15]?.pressed === true,
  });
}

/** Any held D-pad button wins over the stick, including a cancelled pair that resolves to neutral. */
export function padDirection(
  buttons: readonly { pressed: boolean }[],
  axes: readonly number[],
  deadzone = DEADZONE,
): Direction | null {
  const dpadHeld = [12, 13, 14, 15].some((index) => buttons[index]?.pressed === true);
  if (dpadHeld) return dpadToDirection(buttons);
  return stickToDirection(axes[0] ?? 0, axes[1] ?? 0, deadzone);
}
