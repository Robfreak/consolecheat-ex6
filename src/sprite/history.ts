import { canRedoValue, canUndoValue, commitValue, createValueHistory, redoValue, undoValue, type ValueHistory } from "../draw/history.ts";
import { snapshotsEqual } from "./frames.ts";
import { cloneSnapshot, type FrameSnapshot } from "./model.ts";

export const HISTORY_LIMIT = 80;

export type SpriteHistory = ValueHistory<FrameSnapshot>;

export function createSpriteHistory(present: FrameSnapshot): SpriteHistory {
  return createValueHistory(present, cloneSnapshot);
}

export function commitSprite(history: SpriteHistory, next: FrameSnapshot): SpriteHistory {
  return commitValue(history, next, snapshotsEqual, cloneSnapshot, HISTORY_LIMIT);
}

export function canUndoSprite(history: SpriteHistory): boolean {
  return canUndoValue(history);
}

export function canRedoSprite(history: SpriteHistory): boolean {
  return canRedoValue(history);
}

export function undoSprite(history: SpriteHistory): SpriteHistory {
  return undoValue(history, cloneSnapshot);
}

export function redoSprite(history: SpriteHistory): SpriteHistory {
  return redoValue(history, cloneSnapshot);
}
