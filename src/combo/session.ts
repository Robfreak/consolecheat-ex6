// One place that turns an input into history, a match result, and the stats.

import { pushHistory, type HistoryEntry } from "./history.ts";
import { applyInput, expire, freshAttempt, type AbortReason, type Attempt } from "./matcher.ts";
import { applyResult, type BestRecord, type Stats } from "./stats.ts";
import type { Step, TrainerInput } from "./types.ts";

export type LastResult =
  | { ok: true; totalFrames: number; gaps: (number | null)[] }
  | { ok: false; reason: AbortReason; frames: number | null; gaps: (number | null)[]; index: number };

export type Session = {
  attempt: Attempt;
  history: HistoryEntry[];
  stats: Stats;
  best: BestRecord;
  last: LastResult | null;
};

export function freshSession(stats: Stats, best: BestRecord): Session {
  return { attempt: freshAttempt(), history: [], stats, best, last: null };
}

function commit(session: Session, attempt: Attempt): Session {
  if (!attempt.finished) return { ...session, attempt };
  const success = attempt.finished.ok;
  const total = attempt.finished.ok ? attempt.finished.totalFrames : null;
  const next = applyResult(session.stats, session.best, success, total);
  const last: LastResult = attempt.finished.ok
    ? { ok: true, totalFrames: attempt.finished.totalFrames, gaps: attempt.gaps }
    : {
        ok: false,
        reason: attempt.finished.reason,
        frames: attempt.finished.frames,
        gaps: attempt.gaps,
        index: attempt.index,
      };
  return { attempt: freshAttempt(), history: session.history, stats: next.stats, best: next.best, last };
}

export function feed(session: Session, steps: readonly Step[], input: TrainerInput, windowFrames: number): Session {
  const history = pushHistory(session.history, input);
  const withHistory = history === session.history ? session : { ...session, history };
  const next = applyInput(steps, withHistory.attempt, input, windowFrames);
  if (!next.finished) {
    if (next === withHistory.attempt && withHistory === session) return session;
    return { ...withHistory, attempt: next };
  }
  return commit({ ...withHistory, attempt: next }, next);
}

/** Same session reference when the window has not run out. */
export function feedClock(session: Session, nowMs: number, windowFrames: number): Session {
  const next = expire(session.attempt, nowMs, windowFrames);
  if (next === session.attempt || !next.finished) return session;
  return commit(session, next);
}
