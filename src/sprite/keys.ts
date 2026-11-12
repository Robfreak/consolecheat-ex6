import { drawShortcutFromKey, isTypingTarget, type DrawShortcut } from "../draw/shortcuts.ts";

export type SpriteShortcut =
  | DrawShortcut
  | "play"
  | "prev"
  | "next"
  | "moveLeft"
  | "moveRight"
  | "add"
  | "duplicate"
  | "remove";

export function spriteShortcutFromKey(event: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): SpriteShortcut | null {
  const drawn = drawShortcutFromKey(event);
  if (drawn) return drawn;
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  if (event.key === " " || event.key === "Spacebar") return "play";
  if (event.key === "ArrowLeft" || event.key === "[") return event.shiftKey ? "moveLeft" : "prev";
  if (event.key === "ArrowRight" || event.key === "]") return event.shiftKey ? "moveRight" : "next";
  if (event.shiftKey) return null;
  switch (event.key.toLowerCase()) {
    case "n":
      return "add";
    case "d":
      return "duplicate";
    case "delete":
    case "backspace":
      return "remove";
    default:
      return null;
  }
}

/** Text fields swallow every shortcut. Buttons keep Space and Enter for themselves. */
export function shortcutBlocked(target: EventTarget | null, key: string): boolean {
  if (isTypingTarget(target)) return true;
  if (key !== " " && key !== "Spacebar" && key !== "Enter") return false;
  if (!target || typeof target !== "object") return false;
  const tag = (target as { tagName?: string }).tagName?.toLowerCase();
  return tag === "button" || tag === "a";
}

export { isTypingTarget };
