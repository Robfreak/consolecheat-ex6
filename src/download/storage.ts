// What this page stores.
//
// Size and speed are not stored. This module does not keep the numbers at all.
// Language and appearance reuse the shared consolecheat keys in localStorage,
// the same ones the other tools on this host already use. Nothing else is written.
// This module never reads or writes the Merkliste key or the screen-test pattern key.

export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function clearDownloadData(local: StorageLike): boolean {
  try {
    local.removeItem(THEME_KEY);
    local.removeItem(LANG_KEY);
    return true;
  } catch {
    return false;
  }
}
