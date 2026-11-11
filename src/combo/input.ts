// Keyboard and gamepad edges.
//
// Directions are the held state each poll, not a single key. Holding down, then
// also right, then releasing down, is ↓ then ↘ then →.
// Buttons are rising edges. A pad that is already held when it is first seen
// is seeded and does not fire until the button is released and pressed again.
// The same is true of a direction that is already held on the first poll.
//
// Layouts, shown in the on-page legend:
//   jkli: J □, K △, L ×, I ○
//   uijk: U □, I △, J ×, K ○
// WASD and the arrow keys are the directions in both layouts.

import { directionFromKeys, padDirection } from "./direction.ts";
import { DEADZONE, type Direction, type FaceButton, type LayoutId, type TrainerInput } from "./types.ts";

const LAYOUTS: Record<LayoutId, Record<string, FaceButton>> = {
  jkli: { j: "square", k: "triangle", l: "cross", i: "circle" },
  uijk: { u: "square", i: "triangle", j: "cross", k: "circle" },
};

export function buttonFromKey(key: string, layout: LayoutId): FaceButton | null {
  return LAYOUTS[layout][key.toLowerCase()] ?? null;
}

export function isTypingTarget(tagName: string): boolean {
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

export function eventsFromKeys(options: {
  held: readonly string[];
  previous: Direction | null;
  keyDown?: string | null;
  repeat?: boolean;
  layout: LayoutId;
  timeMs: number;
  typing?: boolean;
}): { events: TrainerInput[]; direction: Direction | null } {
  if (options.typing) return { events: [], direction: options.previous };
  const direction = directionFromHeld(options.held);
  const button = options.keyDown && !options.repeat ? buttonFromKey(options.keyDown, options.layout) : null;
  const changed = direction !== options.previous;
  if (!changed && !button) return { events: [], direction };
  if (changed && button) {
    return {
      direction,
      events: [
        {
          timeMs: options.timeMs,
          direction,
          button,
          heldDirection: direction,
          heldButtons: [button],
        },
      ],
    };
  }
  if (changed || !button) {
    return {
      direction,
      events: changed ? [{ timeMs: options.timeMs, direction, heldDirection: direction, heldButtons: [] }] : [],
    };
  }
  return {
    direction,
    events: [{ timeMs: options.timeMs, button, heldDirection: direction, heldButtons: [button] }],
  };
}

function directionFromHeld(held: readonly string[]): Direction | null {
  return directionFromKeys(held);
}

const FACE_INDEX: Record<number, FaceButton> = {
  0: "cross",
  1: "circle",
  2: "square",
  3: "triangle",
};

export type PadMemory = {
  direction: Direction | null;
  buttons: boolean[];
};

export type PadSnapshot = {
  index: number;
  id: string;
  connected: boolean;
  buttons: readonly { pressed: boolean }[];
  axes: readonly number[];
};

function faceDown(buttons: readonly { pressed: boolean }[]): boolean[] {
  return [0, 1, 2, 3].map((index) => buttons[index]?.pressed === true);
}

function heldFaces(buttons: readonly boolean[]): FaceButton[] {
  const found: FaceButton[] = [];
  for (let index = 0; index < buttons.length; index += 1) {
    if (buttons[index]) {
      const face = FACE_INDEX[index];
      if (face) found.push(face);
    }
  }
  return found;
}

/** One pad, one poll. The first call seeds memory and emits nothing. */
export function pollPad(
  pad: { buttons: readonly { pressed: boolean }[]; axes: readonly number[] } | null,
  memory: PadMemory | null,
  timeMs: number,
  deadzone = DEADZONE,
): { events: TrainerInput[]; memory: PadMemory | null } {
  if (!pad) return { events: [], memory: null };
  const direction = padDirection(pad.buttons, pad.axes, deadzone);
  const buttons = faceDown(pad.buttons);
  if (!memory) return { events: [], memory: { direction, buttons } };
  const pressed: FaceButton[] = [];
  for (let index = 0; index < 4; index += 1) {
    if (buttons[index] && !memory.buttons[index]) {
      const face = FACE_INDEX[index];
      if (face) pressed.push(face);
    }
  }
  const changed = direction !== memory.direction;
  const heldButtons = heldFaces(buttons);
  const events: TrainerInput[] = [];
  if (changed && pressed.length > 0) {
    const [first, ...rest] = pressed;
    events.push({
      timeMs,
      direction,
      button: first,
      heldDirection: direction,
      heldButtons,
    });
    for (const button of rest) {
      events.push({ timeMs, button, heldDirection: direction, heldButtons });
    }
  } else if (changed) {
    events.push({ timeMs, direction, heldDirection: direction, heldButtons });
  } else {
    for (const button of pressed) {
      events.push({ timeMs, button, heldDirection: direction, heldButtons });
    }
  }
  return { events, memory: { direction, buttons } };
}

export function pollPads(
  pads: readonly (PadSnapshot | null)[],
  memory: Map<number, PadMemory>,
  timeMs: number,
  deadzone = DEADZONE,
): { events: TrainerInput[]; memory: Map<number, PadMemory> } {
  const connected = pads.filter((pad): pad is PadSnapshot => pad !== null && pad.connected);
  connected.sort((a, b) => a.index - b.index);
  const active = connected[0] ?? null;
  const next = new Map<number, PadMemory>();
  if (!active) return { events: [], memory: next };
  const result = pollPad(active, memory.get(active.index) ?? null, timeMs, deadzone);
  if (result.memory) next.set(active.index, result.memory);
  return { events: result.events, memory: next };
}

type GamepadLike = {
  index: number;
  id: string;
  connected: boolean;
  buttons: readonly { pressed: boolean }[];
  axes: readonly number[];
};

export function readNavigatorPads(nav: {
  getGamepads?: () => readonly (GamepadLike | null)[] | null;
}): (PadSnapshot | null)[] {
  try {
    const list = nav.getGamepads?.() ?? null;
    if (!list) return [];
    return Array.from(list).map((pad) => {
      if (!pad) return null;
      return { index: pad.index, id: pad.id, connected: pad.connected, buttons: pad.buttons, axes: pad.axes };
    });
  } catch {
    return [];
  }
}
