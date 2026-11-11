// Hit rate is successes / attempts, in percent with one decimal.
// Best hit rate is the highest that percent has been after a finished attempt.
// Best streak is the longest run of successes. A miss sets the current streak
// to 0 and leaves the best streak. Fastest total frames is the smallest sum of
// the gaps on a successful combo. A miss does not replace it.

export type Stats = {
  attempts: number;
  successes: number;
  streak: number;
};

export type BestRecord = {
  bestStreak: number;
  bestHitRate: number;
  bestTotalFrames: number | null;
};

export function emptyStats(): Stats {
  return { attempts: 0, successes: 0, streak: 0 };
}

export function emptyBest(): BestRecord {
  return { bestStreak: 0, bestHitRate: 0, bestTotalFrames: null };
}

export function hitRate(stats: Stats): number {
  if (stats.attempts <= 0) return 0;
  return Math.round((stats.successes / stats.attempts) * 1000) / 10;
}

export function applyResult(
  stats: Stats,
  best: BestRecord,
  success: boolean,
  totalFrames: number | null,
): { stats: Stats; best: BestRecord } {
  const next: Stats = {
    attempts: stats.attempts + 1,
    successes: stats.successes + (success ? 1 : 0),
    streak: success ? stats.streak + 1 : 0,
  };
  const rate = hitRate(next);
  let fastest = best.bestTotalFrames;
  if (success && totalFrames != null) {
    fastest = fastest == null ? totalFrames : Math.min(fastest, totalFrames);
  }
  return {
    stats: next,
    best: {
      bestStreak: Math.max(best.bestStreak, next.streak),
      bestHitRate: Math.max(best.bestHitRate, rate),
      bestTotalFrames: fastest,
    },
  };
}
