import {
  canRedoValue,
  canUndoValue,
  commitValue,
  createValueHistory,
  redoValue,
  undoValue,
  type ValueHistory,
} from "../draw/history.ts";
import { buffersEqual, cloneBuffer, createBuffer } from "./pixels.ts";

export const HISTORY_LIMIT = 100;

export type History = ValueHistory<Uint8ClampedArray>;

export function createHistory(present: Uint8ClampedArray = createBuffer()): History {
  return createValueHistory(present, cloneBuffer);
}

/** One entry per committed stroke, fill, flip, clear, or import. Identical buffers are ignored. */
export function commit(history: History, next: Uint8ClampedArray): History {
  return commitValue(history, next, buffersEqual, cloneBuffer, HISTORY_LIMIT);
}

export function canUndo(history: History): boolean {
  return canUndoValue(history);
}

export function canRedo(history: History): boolean {
  return canRedoValue(history);
}

export function undo(history: History): History {
  return undoValue(history, cloneBuffer);
}

export function redo(history: History): History {
  return redoValue(history, cloneBuffer);
}
