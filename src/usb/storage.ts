// What this page stores.
//
// Check marks and the chosen console (PS4, PS5, or both) use localStorage key
// `consolecheat-usb-checks-v1` (JSON: version 1, console, checked ids).
// The key is written when a box changes, the console tab changes, or checks are cleared.
// A missing key is not created until then. A value that does not parse, or a different
// version, is left untouched until the person changes something on the page.
// Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`.
// This module never reads or writes the Merkliste key or the screen-test pattern key.
// A session store is not used. The stick is not read.

import { isConsoleFilter, type ConsoleFilter } from "./checklist.ts";

export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";
export const CHECKS_KEY = "consolecheat-usb-checks-v1";
export const CHECKS_VERSION = 1;

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type LoadedChecks = {
  console: ConsoleFilter;
  checked: string[];
  persist: boolean;
};

function blank(): LoadedChecks {
  return { console: "both", checked: [], persist: false };
}

export function parseChecks(raw: string | null): LoadedChecks {
  if (raw === null) return blank();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return blank();
  }
  if (!data || typeof data !== "object") return blank();
  const record = data as Record<string, unknown>;
  if (record.version !== CHECKS_VERSION) return blank();
  if (typeof record.console !== "string" || !isConsoleFilter(record.console)) return blank();
  if (!Array.isArray(record.checked) || record.checked.length > 200) return blank();
  const checked: string[] = [];
  for (const id of record.checked) {
    if (typeof id !== "string" || id.length === 0 || id.length > 80) return blank();
    if (!checked.includes(id)) checked.push(id);
  }
  return { console: record.console, checked, persist: true };
}

export function loadChecks(local: StorageLike): LoadedChecks {
  try {
    return parseChecks(local.getItem(CHECKS_KEY));
  } catch {
    return blank();
  }
}

export function saveChecks(local: StorageLike, consoleId: ConsoleFilter, checked: readonly string[]): boolean {
  try {
    local.setItem(CHECKS_KEY, JSON.stringify({ version: CHECKS_VERSION, console: consoleId, checked }));
    return true;
  } catch {
    return false;
  }
}

export function clearUsbData(local: StorageLike): boolean {
  try {
    local.removeItem(CHECKS_KEY);
    local.removeItem(THEME_KEY);
    local.removeItem(LANG_KEY);
    return true;
  } catch {
    return false;
  }
}
