// Keyboard and gamepad mapping.
// Space starts or splits. Backspace and U undo. S skips. R resets. P pauses.
// Space is ignored while focus is in a text field, and the other shortcuts are
// ignored there too, so typing a name does not drive the timer.
// Standard Gamepad mapping, edge-triggered: button 0 cross starts or splits,
// button 2 square undoes, button 1 circle skips, button 9 Options resets.
// The first poll of a pad only remembers the held buttons.

export type Shortcut = "start-split" | "undo" | "skip" | "reset" | "pause";

export type PadSnapshot = {
  index: number;
  connected: boolean;
  buttons: readonly { pressed: boolean }[];
};

const WATCHED = [0, 1, 2, 9] as const;

const PAD_ACTION: Record<(typeof WATCHED)[number], Shortcut> = {
  0: "start-split",
  1: "skip",
  2: "undo",
  9: "reset",
};

export function isTypingTarget(tagName: string | undefined): boolean {
  const tag = tagName?.toUpperCase();
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function shortcutForKey(
  key: string,
  options?: { repeat?: boolean; tag?: string; dialog?: boolean },
): Shortcut | null {
  if (options?.repeat || options?.dialog) return null;
  if (isTypingTarget(options?.tag)) return null;
  if ((key === " " || key === "Spacebar") && options?.tag?.toUpperCase() === "BUTTON") return null;
  if (key === " " || key === "Spacebar") return "start-split";
  if (key === "Backspace" || key === "u" || key === "U") return "undo";
  if (key === "s" || key === "S") return "skip";
  if (key === "r" || key === "R") return "reset";
  if (key === "p" || key === "P") return "pause";
  return null;
}

export function readNavigatorPads(nav: {
  getGamepads?: () => readonly (PadSnapshot | null)[] | null;
}): (PadSnapshot | null)[] {
  try {
    const list = nav.getGamepads?.() ?? null;
    if (!list) return [];
    return Array.from(list).map((pad) => {
      if (!pad || pad.connected === false) return null;
      return { index: pad.index, connected: true, buttons: pad.buttons };
    });
  } catch {
    return [];
  }
}

export function pollPadEdges(
  pads: readonly (PadSnapshot | null)[],
  memory: Map<number, boolean[]>,
): Shortcut[] {
  const connected = pads.filter((pad): pad is PadSnapshot => pad !== null && pad.connected);
  connected.sort((a, b) => a.index - b.index);
  const pad = connected[0] ?? null;
  const active = pad ? [pad.index] : [];
  const events: Shortcut[] = [];
  if (pad) {
    const next = WATCHED.map((index) => pad.buttons[index]?.pressed === true);
    const previous = memory.get(pad.index);
    memory.set(pad.index, next);
    if (previous) {
      for (let index = 0; index < WATCHED.length; index += 1) {
        if (next[index] && !previous[index]) {
          const button = WATCHED[index];
          if (button !== undefined) events.push(PAD_ACTION[button]);
        }
      }
    }
  }
  for (const index of [...memory.keys()]) {
    if (!active.includes(index)) memory.delete(index);
  }
  return events;
}
