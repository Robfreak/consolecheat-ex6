import { cellFromOffset } from "./buffer.ts";

/** Left button for a mouse, any primary contact for pen and touch. */
export function acceptsDrawPointer(event: { isPrimary: boolean; pointerType: string; button: number }): boolean {
  if (!event.isPrimary) return false;
  if (event.pointerType === "mouse" && event.button !== 0) return false;
  return true;
}

/** Map a pointer's client position into a pixel of a displayed canvas. */
export function cellFromClient(
  size: number,
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } | null {
  return cellFromOffset(size, clientX - rect.left, clientY - rect.top, rect.width, rect.height);
}
