// What this page stores.
//
// Best values and custom combos use localStorage key `consolecheat-combo-v1`.
// The JSON shape is:
//
//   {
//     "version": 1,
//     "window": 12,
//     "layout": "jkli" | "uijk",
//     "customs": [
//       {
//         "id": "cxxxxxxxx",
//         "name": "Mein Combo",
//         "window": null,
//         "steps": [{ "direction": 2, "button": null }, { "direction": 6, "button": "square" }]
//       }
//     ],
//     "bests": {
//       "hadouken": { "bestStreak": 3, "bestHitRate": 100, "bestTotalFrames": 18 }
//     },
//     "stats": {
//       "hadouken": { "attempts": 4, "successes": 3, "streak": 2 }
//     }
//   }
//
// `window` is the global frame window (4–30, default 12). A custom `window` of
// null uses that global window. `bestHitRate` is a percent. `bestTotalFrames`
// is the fastest successful combo, or null when there is no success yet.
// Built-in combos are not stored in `customs`. Their bests are stored by id.
//
// The key is written when a combo is saved, a setting changes, or an attempt
// finishes. A missing key is not created on load. A value that does not parse,
// a different version, or a shape this page does not understand falls back to
// the defaults and does not throw.
// Reset removes only `consolecheat-combo-v1`. Language and appearance reuse
// `consolecheat-lang` and `consolecheat-theme`. This module never reads or
// writes the Merkliste key or the screen-test pattern key.

import { isBuiltinId } from "./combos.ts";
import type { CustomCombo, SaveFile } from "./customs.ts";
import { emptyBest, emptyStats, type BestRecord, type Stats } from "./stats.ts";
import {
  MAX_CUSTOMS,
  MAX_NAME,
  MAX_STEPS,
  WINDOW_DEFAULT,
  WINDOW_MAX,
  WINDOW_MIN,
  isStep,
  type LayoutId,
} from "./types.ts";

export const SAVE_KEY = "consolecheat-combo-v1";
export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function defaultFile(): SaveFile {
  return { version: 1, window: WINDOW_DEFAULT, layout: "jkli", customs: [], bests: {}, stats: {} };
}

function isLayout(value: unknown): value is LayoutId {
  return value === "jkli" || value === "uijk";
}

function readWindow(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < WINDOW_MIN || value > WINDOW_MAX) return null;
  return value;
}

function readCustom(value: unknown): CustomCombo | null {
  if (!value || typeof value !== "object") return null;
  const combo = value as CustomCombo;
  if (typeof combo.id !== "string" || !/^c[a-z0-9]{8}$/.test(combo.id) || isBuiltinId(combo.id)) return null;
  if (typeof combo.name !== "string") return null;
  const name = combo.name.trim();
  if (name.length < 1 || name.length > MAX_NAME) return null;
  if (!Array.isArray(combo.steps) || combo.steps.length < 1 || combo.steps.length > MAX_STEPS) return null;
  if (!combo.steps.every((step) => isStep(step))) return null;
  if (combo.window != null && readWindow(combo.window) == null) return null;
  return {
    id: combo.id,
    name,
    window: combo.window == null ? null : combo.window,
    steps: combo.steps.map((step) => ({ direction: step.direction, button: step.button })),
  };
}

function readBest(value: unknown): BestRecord | null {
  if (!value || typeof value !== "object") return null;
  const best = value as BestRecord;
  if (typeof best.bestStreak !== "number" || !Number.isFinite(best.bestStreak) || best.bestStreak < 0) return null;
  if (typeof best.bestHitRate !== "number" || !Number.isFinite(best.bestHitRate) || best.bestHitRate < 0 || best.bestHitRate > 100) {
    return null;
  }
  if (best.bestTotalFrames != null && (typeof best.bestTotalFrames !== "number" || best.bestTotalFrames < 0)) return null;
  return {
    bestStreak: Math.floor(best.bestStreak),
    bestHitRate: best.bestHitRate,
    bestTotalFrames: best.bestTotalFrames == null ? null : Math.floor(best.bestTotalFrames),
  };
}

function readStats(value: unknown): Stats | null {
  if (!value || typeof value !== "object") return null;
  const stats = value as Stats;
  if (typeof stats.attempts !== "number" || typeof stats.successes !== "number" || typeof stats.streak !== "number") return null;
  if (stats.attempts < 0 || stats.successes < 0 || stats.streak < 0) return null;
  if (stats.successes > stats.attempts || stats.streak > stats.successes) return null;
  return {
    attempts: Math.floor(stats.attempts),
    successes: Math.floor(stats.successes),
    streak: Math.floor(stats.streak),
  };
}

function readMap<T>(value: unknown, read: (item: unknown) => T | null): Record<string, T> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const map: Record<string, T> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!/^[a-z0-9]{1,16}$/.test(key)) return null;
    const parsed = read(item);
    if (!parsed) return null;
    map[key] = parsed;
  }
  return map;
}

/** Corrupt, foreign, or partial-but-invalid data becomes the default file. Never throws. */
export function parseFile(raw: string | null): SaveFile {
  if (raw == null) return defaultFile();
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return defaultFile();
    const record = data as Record<string, unknown>;
    if (record.version !== 1) return defaultFile();
    const window = record.window == null ? WINDOW_DEFAULT : readWindow(record.window);
    if (window == null) return defaultFile();
    const layout = record.layout == null ? "jkli" : record.layout;
    if (!isLayout(layout)) return defaultFile();
    if (record.customs != null && !Array.isArray(record.customs)) return defaultFile();
    const customs: CustomCombo[] = [];
    const seen = new Set<string>();
    for (const item of (record.customs as unknown[]) ?? []) {
      const combo = readCustom(item);
      if (!combo || seen.has(combo.id)) return defaultFile();
      seen.add(combo.id);
      customs.push(combo);
      if (customs.length > MAX_CUSTOMS) return defaultFile();
    }
    const bests = record.bests == null ? {} : readMap(record.bests, readBest);
    const stats = record.stats == null ? {} : readMap(record.stats, readStats);
    if (!bests || !stats) return defaultFile();
    return { version: 1, window, layout, customs, bests, stats };
  } catch {
    return defaultFile();
  }
}

export function loadFile(storage: StorageLike): SaveFile {
  try {
    return parseFile(storage.getItem(SAVE_KEY));
  } catch {
    return defaultFile();
  }
}

export function saveFile(storage: StorageLike, file: SaveFile): void {
  storage.setItem(SAVE_KEY, JSON.stringify(file));
}

/** Removes only `consolecheat-combo-v1`. Language and theme stay. */
export function resetCombo(storage: StorageLike): void {
  storage.removeItem(SAVE_KEY);
}

export function withResult(file: SaveFile, id: string, stats: Stats, best: BestRecord): SaveFile {
  return {
    ...file,
    stats: { ...file.stats, [id]: stats },
    bests: { ...file.bests, [id]: best },
  };
}

export { emptyBest, emptyStats };
