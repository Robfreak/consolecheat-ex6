// Keyboard and gamepad mapping for the reaction duel.
// Standard Gamepad mapping: button 0 cross, button 1 circle, button 2 square, button 3 triangle.
// Connected pads are ordered by their gamepad index. The first is player 1,
// the second is player 2. A pad that appears already holding a button is
// seeded and does not fire until that button is released and pressed again.
// Disconnect removes that pad from the edge memory.

import type { FaceSymbol, InputStyle, PlayerId, PressInput } from "./rules.ts";

export type Pad = {
  index: number;
  id: string;
  connected: boolean;
  buttons: readonly { pressed: boolean }[];
};

export type PadPress = { player: PlayerId; input: PressInput };

const p1Match: Record<string, FaceSymbol> = {
  w: "triangle",
  W: "triangle",
  a: "square",
  A: "square",
  s: "cross",
  S: "cross",
  d: "circle",
  D: "circle",
};

const p2Match: Record<string, FaceSymbol> = {
  i: "triangle",
  I: "triangle",
  j: "square",
  J: "square",
  k: "cross",
  K: "cross",
  l: "circle",
  L: "circle",
  ArrowUp: "triangle",
  ArrowLeft: "square",
  ArrowDown: "cross",
  ArrowRight: "circle",
};

export function symbolForButton(index: number): FaceSymbol | null {
  if (index === 0) return "cross";
  if (index === 1) return "circle";
  if (index === 2) return "square";
  if (index === 3) return "triangle";
  return null;
}

export function keyToPress(key: string, style: InputStyle): { player: PlayerId; input: PressInput } | null {
  if (style === "easy") {
    if (key === "a" || key === "A") return { player: "p1", input: "any" };
    if (key === "l" || key === "L") return { player: "p2", input: "any" };
    return null;
  }
  const first = p1Match[key];
  if (first) return { player: "p1", input: first };
  const second = p2Match[key];
  if (second) return { player: "p2", input: second };
  return null;
}

export function isTypingTarget(tagName: string): boolean {
  return tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA";
}

export function keyboardPress(
  key: string,
  style: InputStyle,
  options?: { repeat?: boolean; tag?: string },
): { player: PlayerId; input: PressInput } | null {
  if (options?.repeat) return null;
  if (options?.tag && isTypingTarget(options.tag)) return null;
  return keyToPress(key, style);
}

export function assignPads(pads: readonly (Pad | null)[]): { p1: Pad | null; p2: Pad | null } {
  const connected = pads.filter((pad): pad is Pad => pad !== null && pad.connected);
  connected.sort((a, b) => a.index - b.index);
  return { p1: connected[0] ?? null, p2: connected[1] ?? null };
}

function faceDown(pad: Pad): boolean[] {
  return [0, 1, 2, 3].map((index) => pad.buttons[index]?.pressed === true);
}

export function risingSymbols(prev: readonly boolean[], next: readonly boolean[]): FaceSymbol[] {
  const found: FaceSymbol[] = [];
  for (let index = 0; index < 4; index += 1) {
    if (next[index] === true && prev[index] !== true) {
      const symbol = symbolForButton(index);
      if (symbol) found.push(symbol);
    }
  }
  return found;
}

export function pollPads(
  pads: readonly (Pad | null)[],
  memory: Map<number, boolean[]>,
  style: InputStyle,
): PadPress[] {
  const { p1, p2 } = assignPads(pads);
  const events: PadPress[] = [];
  const active: number[] = [];
  for (const { player, pad } of [
    { player: "p1" as const, pad: p1 },
    { player: "p2" as const, pad: p2 },
  ]) {
    if (!pad) continue;
    active.push(pad.index);
    const next = faceDown(pad);
    const prev = memory.get(pad.index);
    memory.set(pad.index, next);
    if (!prev) continue;
    for (const symbol of risingSymbols(prev, next)) {
      events.push({ player, input: style === "easy" ? "any" : symbol });
    }
  }
  for (const index of [...memory.keys()]) {
    if (!active.includes(index)) memory.delete(index);
  }
  return events;
}

type GamepadLike = {
  index: number;
  id: string;
  connected: boolean;
  buttons: readonly { pressed: boolean }[];
};

export function readNavigatorPads(nav: {
  getGamepads?: () => readonly (GamepadLike | null)[] | null;
}): (Pad | null)[] {
  try {
    const list = nav.getGamepads?.() ?? null;
    if (!list) return [];
    return Array.from(list).map((pad) => {
      if (!pad) return null;
      return { index: pad.index, id: pad.id, connected: pad.connected, buttons: pad.buttons };
    });
  } catch {
    return [];
  }
}
