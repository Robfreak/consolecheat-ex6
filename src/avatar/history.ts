import { cloneBuffer, createBuffer, buffersEqual } from "./pixels.ts";

export const HISTORY_LIMIT = 100;

export type History = {
  past: Uint8ClampedArray[];
  present: Uint8ClampedArray;
  future: Uint8ClampedArray[];
};

export function createHistory(present: Uint8ClampedArray = createBuffer()): History {
  return { past: [], present: cloneBuffer(present), future: [] };
}

/** One entry per committed stroke, fill, flip, clear, or import. Identical buffers are ignored. */
export function commit(history: History, next: Uint8ClampedArray): History {
  if (buffersEqual(history.present, next)) return history;
  const past = history.past.concat(cloneBuffer(history.present));
  const trimmed = past.length > HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT) : past;
  return { past: trimmed, present: cloneBuffer(next), future: [] };
}

export function canUndo(history: History): boolean {
  return history.past.length > 0;
}

export function canRedo(history: History): boolean {
  return history.future.length > 0;
}

export function undo(history: History): History {
  const previous = history.past[history.past.length - 1];
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: cloneBuffer(previous),
    future: [cloneBuffer(history.present), ...history.future],
  };
}

export function redo(history: History): History {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: history.past.concat(cloneBuffer(history.present)),
    present: cloneBuffer(next),
    future: history.future.slice(1),
  };
}
