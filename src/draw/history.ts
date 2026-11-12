export type ValueHistory<T> = {
  past: T[];
  present: T;
  future: T[];
};

export function createValueHistory<T>(present: T, clone: (value: T) => T): ValueHistory<T> {
  return { past: [], present: clone(present), future: [] };
}

/** Identical values are ignored and the same history object is returned. */
export function commitValue<T>(
  history: ValueHistory<T>,
  next: T,
  equal: (a: T, b: T) => boolean,
  clone: (value: T) => T,
  limit: number,
): ValueHistory<T> {
  if (equal(history.present, next)) return history;
  const past = history.past.concat(clone(history.present));
  const trimmed = past.length > limit ? past.slice(past.length - limit) : past;
  return { past: trimmed, present: clone(next), future: [] };
}

export function canUndoValue<T>(history: ValueHistory<T>): boolean {
  return history.past.length > 0;
}

export function canRedoValue<T>(history: ValueHistory<T>): boolean {
  return history.future.length > 0;
}

export function undoValue<T>(history: ValueHistory<T>, clone: (value: T) => T): ValueHistory<T> {
  const previous = history.past[history.past.length - 1];
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: clone(previous),
    future: [clone(history.present), ...history.future],
  };
}

export function redoValue<T>(history: ValueHistory<T>, clone: (value: T) => T): ValueHistory<T> {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: history.past.concat(clone(history.present)),
    present: clone(next),
    future: history.future.slice(1),
  };
}
