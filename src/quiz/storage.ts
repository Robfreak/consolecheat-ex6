// Best score and best streak for this page.
//
// localStorage key `consolecheat-quiz-best-v1` (JSON):
// {
//   version: 1,
//   bestScore: number,   // highest score of a finished run
//   bestStreak: number   // longest streak inside a finished run
// }
// The key is written only when a finished run beats one of those values.
// A missing key is not created before that. A value that does not parse, or a
// different version, is left untouched until a new best is saved or the reset
// button removes the key. Reset removes only this key.
// Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`.
// This module never reads the Merkliste key or the screen-test pattern key.
// sessionStorage is not used. Nothing is uploaded.

export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";
export const BEST_KEY = "consolecheat-quiz-best-v1";
export const BEST_VERSION = 1;

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type BestRecord = {
  version: typeof BEST_VERSION;
  bestScore: number;
  bestStreak: number;
};

export function emptyBest(): BestRecord {
  return { version: BEST_VERSION, bestScore: 0, bestStreak: 0 };
}

function readCount(value: unknown, max: number): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > max) return undefined;
  return value;
}

export function parseBest(raw: string | null): { best: BestRecord; persist: boolean } {
  if (raw === null) return { best: emptyBest(), persist: false };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { best: emptyBest(), persist: false };
  }
  if (!data || typeof data !== "object") return { best: emptyBest(), persist: false };
  const record = data as Record<string, unknown>;
  if (record.version !== BEST_VERSION) return { best: emptyBest(), persist: false };
  const bestScore = readCount(record.bestScore, 1_000_000);
  const bestStreak = readCount(record.bestStreak, 100_000);
  if (bestScore === undefined || bestStreak === undefined) return { best: emptyBest(), persist: false };
  return { best: { version: BEST_VERSION, bestScore, bestStreak }, persist: true };
}

export function loadBest(local: StorageLike): { best: BestRecord; persist: boolean } {
  try {
    return parseBest(local.getItem(BEST_KEY));
  } catch {
    return { best: emptyBest(), persist: false };
  }
}

export function considerBest(
  best: BestRecord,
  score: number,
  streak: number,
): { best: BestRecord; improvedScore: boolean; improvedStreak: boolean } {
  if (!Number.isInteger(score) || score < 0 || !Number.isInteger(streak) || streak < 0) {
    return { best, improvedScore: false, improvedStreak: false };
  }
  const improvedScore = score > best.bestScore;
  const improvedStreak = streak > best.bestStreak;
  if (!improvedScore && !improvedStreak) return { best, improvedScore, improvedStreak };
  return {
    best: {
      version: BEST_VERSION,
      bestScore: improvedScore ? score : best.bestScore,
      bestStreak: improvedStreak ? streak : best.bestStreak,
    },
    improvedScore,
    improvedStreak,
  };
}

export function saveBest(local: StorageLike, best: BestRecord): boolean {
  try {
    local.setItem(BEST_KEY, JSON.stringify({ version: BEST_VERSION, bestScore: best.bestScore, bestStreak: best.bestStreak }));
    return true;
  } catch {
    return false;
  }
}

export function resetBest(local: StorageLike): boolean {
  try {
    local.removeItem(BEST_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearQuizData(local: StorageLike): boolean {
  try {
    local.removeItem(BEST_KEY);
    local.removeItem(THEME_KEY);
    local.removeItem(LANG_KEY);
    return true;
  } catch {
    return false;
  }
}
