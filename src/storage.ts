import { LANG_KEY, STORAGE_KEY, THEME_KEY, countEntries, emptyLists, type ListsFile } from "./lists.ts";
import { exportJson, validateImport } from "./transfer.ts";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type LoadResult = {
  ok: boolean;
  persist: boolean;
  reason: "empty" | "stored" | "disabled" | "corrupt" | "version";
  file: ListsFile;
};

export type SaveResult = { ok: true } | { ok: false; reason: "full" | "disabled" };

function isQuota(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  const code = "code" in error ? Number(error.code) : Number.NaN;
  return name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED" || code === 22;
}

export function loadLists(storage: StorageLike): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, persist: false, reason: "disabled", file: emptyLists() };
  }
  if (raw === null) return { ok: true, persist: true, reason: "empty", file: emptyLists() };
  const parsed = validateImport(raw);
  if (parsed.ok) return { ok: true, persist: true, reason: "stored", file: parsed.file };
  const reason = parsed.issue === "wrong-version" ? "version" : "corrupt";
  return { ok: false, persist: false, reason, file: emptyLists() };
}

export function saveLists(storage: StorageLike, file: ListsFile): SaveResult {
  try {
    if (countEntries(file) === 0) storage.removeItem(STORAGE_KEY);
    else storage.setItem(STORAGE_KEY, exportJson(file));
    return { ok: true };
  } catch (error) {
    if (isQuota(error)) return { ok: false, reason: "full" };
    return { ok: false, reason: "disabled" };
  }
}

export function clearStoredData(storage: StorageLike): SaveResult {
  try {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(THEME_KEY);
    storage.removeItem(LANG_KEY);
    return { ok: true };
  } catch (error) {
    if (isQuota(error)) return { ok: false, reason: "full" };
    return { ok: false, reason: "disabled" };
  }
}
