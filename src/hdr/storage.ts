// What this page stores.
//
// The last opened pattern id is optional and uses sessionStorage only, under
// PATTERN_SESSION_KEY. The page reads it once on load. It writes the key only
// after a pattern is opened, and removes the key when the list is shown again.
// Closing the tab drops it. The value is a pattern id such as "near-black",
// not personal data.
//
// Language and appearance reuse the shared consolecheat keys in localStorage,
// the same ones the other tools on this host already use. Nothing else is
// written. This module never reads or writes the Merkliste key or the
// screen-test pattern key.

import { isPatternId, type PatternId } from "./patterns.ts";

export const PATTERN_SESSION_KEY = "consolecheat-hdr-pattern";
export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function readPatternId(storage: StorageLike): PatternId | null {
  let raw: string | null;
  try {
    raw = storage.getItem(PATTERN_SESSION_KEY);
  } catch {
    return null;
  }
  return isPatternId(raw) ? raw : null;
}

export function writePatternId(storage: StorageLike, id: PatternId): boolean {
  try {
    storage.setItem(PATTERN_SESSION_KEY, id);
    return true;
  } catch {
    return false;
  }
}

export function clearPatternId(storage: StorageLike): boolean {
  try {
    storage.removeItem(PATTERN_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearHdrData(local: StorageLike, session: StorageLike): boolean {
  try {
    local.removeItem(THEME_KEY);
    local.removeItem(LANG_KEY);
    session.removeItem(PATTERN_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}
