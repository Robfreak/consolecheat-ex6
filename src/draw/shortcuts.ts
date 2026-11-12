export type DrawShortcut = "undo" | "redo" | "pencil" | "eraser" | "fill" | "eyedropper" | "swap";

export function drawShortcutFromKey(event: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): DrawShortcut | null {
  const mod = event.metaKey || event.ctrlKey;
  const key = event.key;
  if (mod && !event.altKey && (key === "z" || key === "Z")) return event.shiftKey ? "redo" : "undo";
  if (mod && !event.altKey && !event.shiftKey && (key === "y" || key === "Y")) return "redo";
  if (mod || event.altKey) return null;
  switch (key.toLowerCase()) {
    case "b":
      return "pencil";
    case "e":
      return "eraser";
    case "g":
      return "fill";
    case "i":
      return "eyedropper";
    case "x":
      return "swap";
    default:
      return null;
  }
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;
  const el = target as { tagName?: string; isContentEditable?: boolean };
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable === true;
}
