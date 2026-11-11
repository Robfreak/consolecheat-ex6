// Lane mapping.
//
// Lanes run left to right as △ ○ × □.
// Keyboard, left to right: D F J K.
// Arrow keys follow the symbol's direction, the same as the D-pad:
//   △ up, ○ right, × down, □ left.
// Standard gamepad: button 0 ×, 1 ○, 2 □, 3 △.
// D-pad buttons 12 up, 13 down, 14 left, 15 right are the other way to hit
// the same lane. A pad that is already holding a button when it is first
// seen does not fire until that button is released and pressed again.
// Only the first connected pad is read.

export const laneCount = 4;

export type Lane = 0 | 1 | 2 | 3;

export type FaceSymbol = "triangle" | "circle" | "cross" | "square";

export type LaneInfo = {
  lane: Lane;
  symbol: FaceSymbol;
  button: number;
  dpad: number;
  key: "d" | "f" | "j" | "k";
  arrow: "ArrowUp" | "ArrowRight" | "ArrowDown" | "ArrowLeft";
};

export const lanes: readonly LaneInfo[] = [
  { lane: 0, symbol: "triangle", button: 3, dpad: 12, key: "d", arrow: "ArrowUp" },
  { lane: 1, symbol: "circle", button: 1, dpad: 15, key: "f", arrow: "ArrowRight" },
  { lane: 2, symbol: "cross", button: 0, dpad: 13, key: "j", arrow: "ArrowDown" },
  { lane: 3, symbol: "square", button: 2, dpad: 14, key: "k", arrow: "ArrowLeft" },
];

const keyToLane = new Map<string, Lane>();
const buttonToLane = new Map<number, Lane>();

for (const info of lanes) {
  keyToLane.set(info.key, info.lane);
  keyToLane.set(info.key.toUpperCase(), info.lane);
  keyToLane.set(info.arrow, info.lane);
  buttonToLane.set(info.button, info.lane);
  buttonToLane.set(info.dpad, info.lane);
}

export function laneForKey(key: string): Lane | null {
  const lane = keyToLane.get(key);
  return lane === undefined ? null : lane;
}

export function laneForButton(index: number): Lane | null {
  const lane = buttonToLane.get(index);
  return lane === undefined ? null : lane;
}

export function isTypingTarget(tagName: string): boolean {
  return tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA";
}

export function keyboardLane(key: string, options?: { repeat?: boolean; tag?: string }): Lane | null {
  if (options?.repeat) return null;
  if (options?.tag && isTypingTarget(options.tag)) return null;
  return laneForKey(key);
}

export type PadSnapshot = {
  index: number;
  connected: boolean;
  buttons: readonly { pressed: boolean }[];
};

const watchedButtons = lanes.flatMap((info) => [info.button, info.dpad]);

function pressedRow(pad: PadSnapshot): boolean[] {
  return watchedButtons.map((index) => pad.buttons[index]?.pressed === true);
}

export function risingLanes(prev: readonly boolean[], next: readonly boolean[]): Lane[] {
  const found: Lane[] = [];
  const seen = new Set<Lane>();
  for (let index = 0; index < watchedButtons.length; index += 1) {
    if (next[index] === true && prev[index] !== true) {
      const button = watchedButtons[index];
      if (button === undefined) continue;
      const lane = laneForButton(button);
      if (lane === null || seen.has(lane)) continue;
      seen.add(lane);
      found.push(lane);
    }
  }
  return found;
}

export function firstPad(pads: readonly (PadSnapshot | null)[]): PadSnapshot | null {
  const connected = pads.filter((pad): pad is PadSnapshot => pad !== null && pad.connected);
  connected.sort((a, b) => a.index - b.index);
  return connected[0] ?? null;
}

/** Rising lanes from the first pad. The first sample only seeds the memory. */
export function pollGamepad(
  pads: readonly (PadSnapshot | null)[],
  memory: Map<number, boolean[]>,
): Lane[] {
  const pad = firstPad(pads);
  const active = pad ? [pad.index] : [];
  const events: Lane[] = [];
  if (pad) {
    const next = pressedRow(pad);
    const prev = memory.get(pad.index);
    memory.set(pad.index, next);
    if (prev) events.push(...risingLanes(prev, next));
  }
  for (const index of [...memory.keys()]) {
    if (!active.includes(index)) memory.delete(index);
  }
  return events;
}

export function readNavigatorPads(nav: {
  getGamepads?: () => readonly (PadSnapshot | null)[] | null;
}): (PadSnapshot | null)[] {
  try {
    const list = nav.getGamepads?.() ?? null;
    if (!list) return [];
    return Array.from(list).map((pad) => {
      if (!pad) return null;
      return { index: pad.index, connected: pad.connected, buttons: pad.buttons };
    });
  } catch {
    return [];
  }
}
