// Timing windows and score.
//
// The audio clock is compared with the chart after the calibration offset:
//   delta = songMs - offsetMs - noteMs
// A positive offset means the player taps late, so those taps move back
// toward the note. Perfect is ±45 ms (300 points). Gut is ±100 ms (100 points).
// Anything later than the Gut window is Verpasst and is applied by the caller
// once the window has passed. A press outside the window does not consume a note.
//
// Combo counts Perfect and Gut. The points added on top of the base are
// 10 per note already in the combo for Perfect, and 5 for Gut. Verpasst
// scores 0 and sets the combo back to 0. Accuracy is the share of notes
// that were Perfect or Gut, in percent with one decimal.

import type { Note } from "./beatmap.ts";

export const PERFECT_MS = 45;
export const GOOD_MS = 100;
export const PERFECT_POINTS = 300;
export const GOOD_POINTS = 100;
export const PERFECT_COMBO_STEP = 10;
export const GOOD_COMBO_STEP = 5;

export type JudgementName = "perfect" | "good" | "miss";

export type Tally = {
  score: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  good: number;
  miss: number;
};

export function emptyTally(): Tally {
  return { score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, miss: 0 };
}

export function judgeDelta(deltaMs: number): JudgementName {
  const abs = Math.abs(deltaMs);
  if (abs <= PERFECT_MS) return "perfect";
  if (abs <= GOOD_MS) return "good";
  return "miss";
}

export function hitDeltaMs(songMs: number, noteMs: number, offsetMs: number): number {
  return songMs - offsetMs - noteMs;
}

export function pointsFor(kind: JudgementName, comboBefore: number): number {
  if (kind === "miss") return 0;
  const base = kind === "perfect" ? PERFECT_POINTS : GOOD_POINTS;
  const step = kind === "perfect" ? PERFECT_COMBO_STEP : GOOD_COMBO_STEP;
  return base + comboBefore * step;
}

export function applyJudgement(tally: Tally, kind: JudgementName): { tally: Tally; gained: number } {
  if (kind === "miss") {
    return {
      tally: { ...tally, combo: 0, miss: tally.miss + 1 },
      gained: 0,
    };
  }
  const gained = pointsFor(kind, tally.combo);
  const combo = tally.combo + 1;
  return {
    tally: {
      score: tally.score + gained,
      combo,
      maxCombo: Math.max(tally.maxCombo, combo),
      perfect: tally.perfect + (kind === "perfect" ? 1 : 0),
      good: tally.good + (kind === "good" ? 1 : 0),
      miss: tally.miss,
    },
    gained,
  };
}

export function judgedCount(tally: Tally): number {
  return tally.perfect + tally.good + tally.miss;
}

/** Percent of notes that were Perfect or Gut, one decimal. 0 when nothing is judged yet. */
export function accuracyOf(tally: Tally): number {
  const total = judgedCount(tally);
  if (total === 0) return 0;
  return Math.round(((tally.perfect + tally.good) * 1000) / total) / 10;
}

export type HitPick = {
  index: number;
  deltaMs: number;
  kind: JudgementName;
};

/** Closest unjudged note in the lane whose delta is still inside the Gut window. */
export function pickNote(
  notes: readonly Note[],
  judged: ReadonlySet<number>,
  lane: number,
  songMs: number,
  offsetMs: number,
): HitPick | null {
  let best: HitPick | null = null;
  for (let index = 0; index < notes.length; index += 1) {
    if (judged.has(index)) continue;
    const note = notes[index];
    if (!note || note.lane !== lane) continue;
    const deltaMs = hitDeltaMs(songMs, note.timeMs, offsetMs);
    if (Math.abs(deltaMs) > GOOD_MS) continue;
    const kind = judgeDelta(deltaMs);
    if (kind === "miss") continue;
    if (!best || Math.abs(deltaMs) < Math.abs(best.deltaMs)) best = { index, deltaMs, kind };
  }
  return best;
}

/** Notes whose Gut window has closed and that were not hit. */
export function dueMisses(
  notes: readonly Note[],
  judged: ReadonlySet<number>,
  songMs: number,
  offsetMs: number,
): number[] {
  const adjusted = songMs - offsetMs;
  const found: number[] = [];
  for (let index = 0; index < notes.length; index += 1) {
    if (judged.has(index)) continue;
    const note = notes[index];
    if (!note) continue;
    if (adjusted > note.timeMs + GOOD_MS) found.push(index);
  }
  return found;
}
