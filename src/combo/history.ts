import { HISTORY_LIMIT, type Direction, type FaceButton, type TrainerInput } from "./types.ts";
import { framesBetween } from "./timing.ts";

export type HistoryEntry = {
  direction: Direction | null;
  button: FaceButton | null;
  frames: number | null;
  timeMs: number;
};

/** Neutral releases are not shown. The list keeps the last 20 inputs. */
export function pushHistory(history: readonly HistoryEntry[], input: TrainerInput): HistoryEntry[] {
  const direction = input.direction === undefined ? null : input.direction;
  const button = input.button ?? null;
  if (direction == null && button == null) return history.slice();
  const previous = history[history.length - 1];
  const entry: HistoryEntry = {
    direction,
    button,
    frames: previous ? framesBetween(previous.timeMs, input.timeMs) : null,
    timeMs: input.timeMs,
  };
  return [...history, entry].slice(-HISTORY_LIMIT);
}
