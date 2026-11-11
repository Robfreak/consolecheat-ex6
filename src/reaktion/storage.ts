// Best reaction times for this page.
//
// localStorage key `consolecheat-reaktion-best-v1` (JSON):
// {
//   version: 1,
//   solo: number | null,      // best valid solo time, symbol matching, milliseconds
//   soloEasy: number | null,  // best valid solo time, Easy (Einfach)
//   duel: number | null,      // fastest winning press in a symbol-matching duel
//   duelEasy: number | null   // fastest winning press in an Easy duel
// }
// Lower is better. Only a correct press after the signal is stored.
// A false start, a wrong button, and a timeout are not times.
// The key is written when a round sets a new best. A missing key is not created
// before that. A value that does not parse, or a different version, is left
// untouched until a new best is saved or the reset button removes the key.
// Reset removes only this key. Language and appearance reuse `consolecheat-lang`
// and `consolecheat-theme`. This module never reads the Merkliste key or the
// screen-test pattern key. sessionStorage is not used.

import type { InputStyle, PlayMode } from "./rules.ts";

export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";
export const BEST_KEY = "consolecheat-reaktion-best-v1";
export const BEST_VERSION = 1;

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type BestSlot = "solo" | "soloEasy" | "duel" | "duelEasy";

export type BestTimes = {
  version: typeof BEST_VERSION;
  solo: number | null;
  soloEasy: number | null;
  duel: number | null;
  duelEasy: number | null;
};

const slots: BestSlot[] = ["solo", "soloEasy", "duel", "duelEasy"];

export function emptyBest(): BestTimes {
  return { version: BEST_VERSION, solo: null, soloEasy: null, duel: null, duelEasy: null };
}

export function slotFor(mode: PlayMode, style: InputStyle): BestSlot {
  if (mode === "solo") return style === "easy" ? "soloEasy" : "solo";
  return style === "easy" ? "duelEasy" : "duel";
}

function readSlot(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 60_000) return undefined;
  return value;
}

export function parseBest(raw: string | null): { times: BestTimes; persist: boolean } {
  if (raw === null) return { times: emptyBest(), persist: false };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { times: emptyBest(), persist: false };
  }
  if (!data || typeof data !== "object") return { times: emptyBest(), persist: false };
  const record = data as Record<string, unknown>;
  if (record.version !== BEST_VERSION) return { times: emptyBest(), persist: false };
  const times = emptyBest();
  for (const slot of slots) {
    if (!(slot in record)) {
      times[slot] = null;
      continue;
    }
    const value = readSlot(record[slot]);
    if (value === undefined) return { times: emptyBest(), persist: false };
    times[slot] = value;
  }
  return { times, persist: true };
}

export function loadBest(local: StorageLike): { times: BestTimes; persist: boolean } {
  try {
    return parseBest(local.getItem(BEST_KEY));
  } catch {
    return { times: emptyBest(), persist: false };
  }
}

export function consider(times: BestTimes, slot: BestSlot, ms: number): { times: BestTimes; improved: boolean } {
  if (!Number.isFinite(ms) || ms < 0) return { times, improved: false };
  const rounded = Math.round(ms);
  if (rounded > 60_000) return { times, improved: false };
  const current = times[slot];
  if (current !== null && rounded >= current) return { times, improved: false };
  return { times: { ...times, [slot]: rounded }, improved: true };
}

export function saveBest(local: StorageLike, times: BestTimes): boolean {
  try {
    local.setItem(
      BEST_KEY,
      JSON.stringify({
        version: BEST_VERSION,
        solo: times.solo,
        soloEasy: times.soloEasy,
        duel: times.duel,
        duelEasy: times.duelEasy,
      }),
    );
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

export function clearReaktionData(local: StorageLike): boolean {
  try {
    local.removeItem(BEST_KEY);
    local.removeItem(THEME_KEY);
    local.removeItem(LANG_KEY);
    return true;
  } catch {
    return false;
  }
}
