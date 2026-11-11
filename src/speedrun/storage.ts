// What this page stores.
//
// Profiles, personal bests, best segments, and attempt counts use localStorage
// key `consolecheat-speedrun-v1`. The JSON shape is:
//
//   {
//     "schema": "consolecheat-speedrun",
//     "version": 1,
//     "activeProfileId": "profile-default",
//     "profiles": [
//       {
//         "id": "profile-default",
//         "game": "Beispielspiel",
//         "category": "Any%",
//         "attempts": 0,
//         "splits": [{ "id": "split-intro", "name": "Intro" }],
//         "pb": null,
//         "bestSegments": [null],
//         "splitsVersion": 1
//       }
//     ]
//   }
//
// `pb` is null, or cumulative milliseconds for every split.
// `bestSegments` is the gold for each split, or null when that segment has no gold.
// The key is written when a profile, a split, an attempt, a gold, or a PB changes.
// A missing key is not created until then. A value that does not parse, or a
// different version or schema, is left untouched and the page shows the default
// profile in memory only.
// Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`.
// This module never reads or writes the Merkliste key or the screen-test pattern key.
// The live attempt is not stored. Closing the tab drops it.

import { createDefaultStore, SAVE_KEY, type Store } from "./model.ts";
import { parseStore, type StoreIssue } from "./transfer.ts";

export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";
export { SAVE_KEY };

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type LoadedStore = {
  store: Store;
  persist: boolean;
  issue: StoreIssue | null;
};

export function loadStore(local: StorageLike): LoadedStore {
  let raw: string | null;
  try {
    raw = local.getItem(SAVE_KEY);
  } catch {
    return { store: createDefaultStore(), persist: false, issue: "blocked" };
  }
  if (raw === null) return { store: createDefaultStore(), persist: false, issue: null };
  const parsed = parseStore(raw);
  if (!parsed.ok) return { store: createDefaultStore(), persist: false, issue: parsed.issue };
  return { store: parsed.store, persist: true, issue: null };
}

export function saveStore(local: StorageLike, store: Store): boolean {
  try {
    local.setItem(SAVE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function clearSpeedrunData(local: StorageLike): boolean {
  try {
    local.removeItem(SAVE_KEY);
    local.removeItem(THEME_KEY);
    local.removeItem(LANG_KEY);
    return true;
  } catch {
    return false;
  }
}
