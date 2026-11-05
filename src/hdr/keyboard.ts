// Keyboard routing. Arrow keys, Esc, and digit keys.
// Esc leaves fullscreen first. The next Esc returns to the list.
// The picker handles its own grid movement.

export type PageId = "home" | "impressum" | "datenschutz";

export type ShortcutContext = {
  page: PageId;
  patternOpen: boolean;
  fullscreen: boolean;
  patternCount: number;
  typing: boolean;
  repeat: boolean;
};

export type ShortcutResult =
  | { type: "ignore" }
  | { type: "close-page" }
  | { type: "exit-fullscreen" }
  | { type: "close-pattern" }
  | { type: "open"; index: number }
  | { type: "step"; direction: "prev" | "next" };

const NUMBER_KEYS: Record<string, number> = {
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "7": 6,
  "8": 7,
  "9": 8,
  "0": 9,
  Digit1: 0,
  Digit2: 1,
  Digit3: 2,
  Digit4: 3,
  Digit5: 4,
  Digit6: 5,
  Digit7: 6,
  Digit8: 7,
  Digit9: 8,
  Digit0: 9,
  Numpad1: 0,
  Numpad2: 1,
  Numpad3: 2,
  Numpad4: 3,
  Numpad5: 4,
  Numpad6: 5,
  Numpad7: 6,
  Numpad8: 7,
  Numpad9: 8,
  Numpad0: 9,
};

export function indexForNumberKey(key: string, patternCount: number): number | null {
  const index = NUMBER_KEYS[key];
  if (index === undefined || index >= patternCount) return null;
  return index;
}

export function isTypingTarget(tagName: string): boolean {
  const tag = tagName.toUpperCase();
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function stepIndex(current: number, direction: "prev" | "next", count: number): number {
  if (count <= 0) return 0;
  const delta = direction === "next" ? 1 : -1;
  return (current + delta + count) % count;
}

/** Move a roving index through the pattern grid. Returns null when the key is not an arrow. */
export function gridMove(current: number, key: string, columns: number, count: number): number | null {
  if (count <= 0) return null;
  const cols = Math.max(1, Math.floor(columns));
  const index = Math.min(Math.max(current, 0), count - 1);
  if (key === "ArrowRight") return Math.min(count - 1, index + 1);
  if (key === "ArrowLeft") return Math.max(0, index - 1);
  if (key === "ArrowDown") return Math.min(count - 1, index + cols);
  if (key === "ArrowUp") return Math.max(0, index - cols);
  return null;
}

export function shortcutResult(key: string, code: string, ctx: ShortcutContext): ShortcutResult {
  if (ctx.typing) return { type: "ignore" };
  if (key === "Escape") {
    if (ctx.page !== "home") return { type: "close-page" };
    if (!ctx.patternOpen) return { type: "ignore" };
    if (ctx.fullscreen) return { type: "exit-fullscreen" };
    return { type: "close-pattern" };
  }
  if (ctx.page !== "home") return { type: "ignore" };

  const jumped = indexForNumberKey(key, ctx.patternCount) ?? indexForNumberKey(code, ctx.patternCount);
  if (jumped !== null) {
    if (ctx.repeat) return { type: "ignore" };
    return { type: "open", index: jumped };
  }

  if (!ctx.patternOpen) return { type: "ignore" };
  if (key === "ArrowRight" || key === "ArrowDown") return { type: "step", direction: "next" };
  if (key === "ArrowLeft" || key === "ArrowUp") return { type: "step", direction: "prev" };
  return { type: "ignore" };
}
