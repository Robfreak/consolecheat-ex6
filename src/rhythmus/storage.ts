// Highscores and the latency offset for this page.
//
// localStorage key `consolecheat-rhythmus-v1` (JSON):
// {
//   version: 1,
//   offsetMs: number,          // integer, -200..200, 0 if never calibrated
//   scores: {
//     "<songId>:<difficulty>": { score, accuracy, maxCombo }
//   }
// }
// songId is nachtmarkt, neonbahn, or hafenlicht.
// difficulty is leicht, mittel, or schwer.
// score and maxCombo are integers >= 0. accuracy is 0..100 with at most one decimal.
//
// The key is written when a finished song stores a better score, or when the
// offset changes. A missing key is not created before that. A value that does
// not parse, a different version, or a value that does not match this shape
// is left untouched until a new score is stored, the offset changes, or the
// reset button removes the key. Reset removes only this key.
//
// A finished run replaces the stored score for that song and difficulty when
// its score is higher. The same score replaces it when the max combo is higher.
// The same score and combo replace it when the accuracy is higher.
//
// Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`.
// This module never reads the Merkliste key or the screen-test pattern key.
// sessionStorage is not used. Nothing is uploaded.

import type { Difficulty } from "./beatmap.ts";
import { isDifficulty } from "./beatmap.ts";
import type { SongId } from "./songs.ts";
import { isSongId } from "./songs.ts";

export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";
export const SAVE_KEY = "consolecheat-rhythmus-v1";
export const SAVE_VERSION = 1;
export const OFFSET_MIN = -200;
export const OFFSET_MAX = 200;

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type HighScore = {
  score: number;
  accuracy: number;
  maxCombo: number;
};

export type ScoreId = `${SongId}:${Difficulty}`;

export type RhythmSave = {
  version: typeof SAVE_VERSION;
  offsetMs: number;
  scores: Partial<Record<ScoreId, HighScore>>;
};

export function scoreId(songId: SongId, difficulty: Difficulty): ScoreId {
  return `${songId}:${difficulty}`;
}

export function emptySave(): RhythmSave {
  return { version: SAVE_VERSION, offsetMs: 0, scores: {} };
}

export function clampOffset(ms: number): number {
  if (!Number.isFinite(ms)) return 0;
  return Math.min(OFFSET_MAX, Math.max(OFFSET_MIN, Math.round(ms)));
}

function isAccuracy(value: unknown): value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) return false;
  return Math.abs(value * 10 - Math.round(value * 10)) < 1e-6;
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 10_000_000;
}

function parseScore(value: unknown): HighScore | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (!isCount(record.score) || !isAccuracy(record.accuracy) || !isCount(record.maxCombo)) return null;
  if (Object.keys(record).length !== 3) return null;
  return { score: record.score, accuracy: record.accuracy, maxCombo: record.maxCombo };
}

export function parseSave(raw: string | null): { save: RhythmSave; persist: boolean } {
  if (raw === null) return { save: emptySave(), persist: false };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { save: emptySave(), persist: false };
  }
  if (!data || typeof data !== "object") return { save: emptySave(), persist: false };
  const record = data as Record<string, unknown>;
  if (record.version !== SAVE_VERSION) return { save: emptySave(), persist: false };
  if (!Number.isInteger(record.offsetMs) || (record.offsetMs as number) < OFFSET_MIN || (record.offsetMs as number) > OFFSET_MAX) {
    return { save: emptySave(), persist: false };
  }
  if (!record.scores || typeof record.scores !== "object" || Array.isArray(record.scores)) {
    return { save: emptySave(), persist: false };
  }
  const scores: RhythmSave["scores"] = {};
  for (const [key, value] of Object.entries(record.scores as Record<string, unknown>)) {
    const parts = key.split(":");
    if (parts.length !== 2) return { save: emptySave(), persist: false };
    const songId = parts[0] ?? "";
    const difficulty = parts[1] ?? "";
    if (!isSongId(songId) || !isDifficulty(difficulty)) return { save: emptySave(), persist: false };
    const parsed = parseScore(value);
    if (!parsed) return { save: emptySave(), persist: false };
    scores[scoreId(songId, difficulty)] = parsed;
  }
  return { save: { version: SAVE_VERSION, offsetMs: record.offsetMs as number, scores }, persist: true };
}

export function loadSave(local: StorageLike): { save: RhythmSave; persist: boolean } {
  try {
    return parseSave(local.getItem(SAVE_KEY));
  } catch {
    return { save: emptySave(), persist: false };
  }
}

export function isBetterScore(current: HighScore | undefined, next: HighScore): boolean {
  if (!current) return true;
  if (next.score !== current.score) return next.score > current.score;
  if (next.maxCombo !== current.maxCombo) return next.maxCombo > current.maxCombo;
  return next.accuracy > current.accuracy;
}

export function withScore(save: RhythmSave, id: ScoreId, next: HighScore): { save: RhythmSave; improved: boolean } {
  const current = save.scores[id];
  if (!isBetterScore(current, next)) return { save, improved: false };
  return { save: { ...save, scores: { ...save.scores, [id]: next } }, improved: true };
}

export function withOffset(save: RhythmSave, offsetMs: number): RhythmSave {
  return { ...save, offsetMs: clampOffset(offsetMs) };
}

function writeSave(local: StorageLike, save: RhythmSave): boolean {
  try {
    const scores: Record<string, HighScore> = {};
    for (const [key, value] of Object.entries(save.scores)) {
      if (!value) continue;
      scores[key] = { score: value.score, accuracy: value.accuracy, maxCombo: value.maxCombo };
    }
    local.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, offsetMs: save.offsetMs, scores }));
    return true;
  } catch {
    return false;
  }
}

export function saveState(local: StorageLike, save: RhythmSave): boolean {
  return writeSave(local, save);
}

export function resetSave(local: StorageLike): boolean {
  try {
    local.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearRhythmData(local: StorageLike): boolean {
  try {
    local.removeItem(SAVE_KEY);
    local.removeItem(THEME_KEY);
    local.removeItem(LANG_KEY);
    return true;
  } catch {
    return false;
  }
}

export const CALIBRATION_BPM = 100;
export const CALIBRATION_BEATS = 8;

/** Beat times in milliseconds, starting `leadMs` after `originMs`. */
export function calibrationBeats(originMs: number, leadMs = 600): number[] {
  const beat = 60_000 / CALIBRATION_BPM;
  return Array.from({ length: CALIBRATION_BEATS }, (_, index) => originMs + leadMs + index * beat);
}

/**
 * Median of (tap - nearest beat) for taps within 250 ms of a beat.
 * Returns null when fewer than 4 taps land near a beat.
 * The result is the offset to store: positive when the taps are late.
 */
export function offsetFromTaps(tapMs: readonly number[], beatMs: readonly number[]): number | null {
  if (beatMs.length === 0) return null;
  const deltas: number[] = [];
  for (const tap of tapMs) {
    let nearest = beatMs[0] ?? 0;
    let best = Math.abs(tap - nearest);
    for (const beat of beatMs) {
      const distance = Math.abs(tap - beat);
      if (distance < best) {
        best = distance;
        nearest = beat;
      }
    }
    const delta = tap - nearest;
    if (Math.abs(delta) <= 250) deltas.push(delta);
  }
  if (deltas.length < 4) return null;
  deltas.sort((a, b) => a - b);
  const mid = deltas.length % 2 === 1 ? deltas[(deltas.length - 1) / 2] : ((deltas[deltas.length / 2 - 1] ?? 0) + (deltas[deltas.length / 2] ?? 0)) / 2;
  return clampOffset(mid ?? 0);
}
