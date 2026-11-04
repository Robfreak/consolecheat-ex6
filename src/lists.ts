export const SCHEMA = "consolecheat-ex6-merkliste";
export const VERSION = 1;
export const STORAGE_KEY = "consolecheat-ex6-merkliste-v1";
export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";
export const NOTE_MAX = 280;
export const NAME_MAX = 200;
export const MAX_IDS = 64;
export const MAX_PER_LIST = 2000;
export const IMPORT_MAX_BYTES = 256 * 1024;
export const TITLE_ID = /^(CUSA|PPSA)\d{5}$/;

export const LISTS = ["backlog", "playing", "completed", "wishlist"] as const;
export type ListId = (typeof LISTS)[number];

export type Entry = {
  titleIds: string[];
  name: string;
  note: string;
};

export type ListsFile = {
  schema: typeof SCHEMA;
  version: typeof VERSION;
  lists: Record<ListId, Entry[]>;
};

export type EntryDraft = {
  titleIds: readonly string[];
  name: string;
  note?: string;
};

export function emptyLists(): ListsFile {
  return {
    schema: SCHEMA,
    version: VERSION,
    lists: { backlog: [], playing: [], completed: [], wishlist: [] },
  };
}

export function isListId(value: string): value is ListId {
  return (LISTS as readonly string[]).includes(value);
}

export function codePoints(value: string): number {
  let count = 0;
  for (const _char of value) count += 1;
  return count;
}

export function sameGame(a: readonly string[], b: readonly string[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const set = new Set(a);
  return b.some((id) => set.has(id));
}

export function findGame(file: ListsFile, titleIds: readonly string[], list?: ListId): { list: ListId; index: number } | null {
  const lists = list ? [list] : LISTS;
  for (const id of lists) {
    const index = file.lists[id].findIndex((entry) => sameGame(entry.titleIds, titleIds));
    if (index >= 0) return { list: id, index };
  }
  return null;
}

function cleanName(name: string): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed || codePoints(trimmed) > NAME_MAX) return null;
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return null;
  return trimmed;
}

/** Empty string is a cleared note. Too-long and control characters are refused. */
export function cleanNote(note: string): { ok: true; note: string } | { ok: false; reason: "note-too-long" | "invalid" } {
  if (typeof note !== "string") return { ok: false, reason: "invalid" };
  const trimmed = note.trim();
  let count = 0;
  for (const char of trimmed) {
    count += 1;
    const code = char.codePointAt(0) ?? 0;
    if (code === 127 || (code < 32 && code !== 9 && code !== 10 && code !== 13)) return { ok: false, reason: "invalid" };
  }
  if (count > NOTE_MAX) return { ok: false, reason: "note-too-long" };
  return { ok: true, note: trimmed };
}

function cleanIds(titleIds: readonly string[]): string[] | null {
  if (!Array.isArray(titleIds) || titleIds.length < 1 || titleIds.length > MAX_IDS) return null;
  const out: string[] = [];
  for (const id of titleIds) {
    if (typeof id !== "string" || !TITLE_ID.test(id) || out.includes(id)) return null;
    out.push(id);
  }
  return out;
}

export function makeEntry(input: EntryDraft): Entry | null {
  const titleIds = cleanIds(input.titleIds);
  const name = cleanName(input.name);
  const note = cleanNote(input.note ?? "");
  if (!titleIds || name === null || !note.ok) return null;
  return { titleIds, name, note: note.note };
}

export type AddResult =
  | { ok: true; file: ListsFile }
  | { ok: false; reason: "invalid" | "duplicate" | "elsewhere"; list?: ListId };

export function addToList(file: ListsFile, list: ListId, input: EntryDraft): AddResult {
  const entry = makeEntry(input);
  if (!entry) return { ok: false, reason: "invalid" };
  const found = findGame(file, entry.titleIds);
  if (found) {
    if (found.list === list) return { ok: false, reason: "duplicate" };
    return { ok: false, reason: "elsewhere", list: found.list };
  }
  const next = structuredClone(file);
  next.lists[list].unshift(entry);
  return { ok: true, file: next };
}

export type MoveResult = { ok: true; file: ListsFile } | { ok: false; reason: "missing" | "duplicate" | "invalid" };

export function moveEntry(file: ListsFile, from: ListId, to: ListId, titleIds: readonly string[]): MoveResult {
  if (!titleIds.length) return { ok: false, reason: "invalid" };
  const sourceIndex = file.lists[from].findIndex((entry) => sameGame(entry.titleIds, titleIds));
  if (sourceIndex < 0) return { ok: false, reason: "missing" };
  if (from === to) return { ok: true, file };
  const entry = file.lists[from][sourceIndex];
  if (!entry) return { ok: false, reason: "missing" };
  if (file.lists[to].some((other) => sameGame(other.titleIds, entry.titleIds))) {
    return { ok: false, reason: "duplicate" };
  }
  const next = structuredClone(file);
  const taken = next.lists[from][sourceIndex];
  if (!taken) return { ok: false, reason: "missing" };
  next.lists[from].splice(sourceIndex, 1);
  next.lists[to].unshift(taken);
  return { ok: true, file: next };
}

export function removeEntry(file: ListsFile, list: ListId, titleIds: readonly string[]): MoveResult {
  const index = file.lists[list].findIndex((entry) => sameGame(entry.titleIds, titleIds));
  if (index < 0) return { ok: false, reason: "missing" };
  const next = structuredClone(file);
  next.lists[list].splice(index, 1);
  return { ok: true, file: next };
}

export type NoteResult = { ok: true; file: ListsFile } | { ok: false; reason: "missing" | "note-too-long" | "invalid" };

export function updateNote(file: ListsFile, list: ListId, titleIds: readonly string[], note: string): NoteResult {
  const index = file.lists[list].findIndex((entry) => sameGame(entry.titleIds, titleIds));
  if (index < 0) return { ok: false, reason: "missing" };
  const cleaned = cleanNote(note);
  if (!cleaned.ok) return { ok: false, reason: cleaned.reason };
  const next = structuredClone(file);
  const entry = next.lists[list][index];
  if (!entry) return { ok: false, reason: "missing" };
  entry.note = cleaned.note;
  return { ok: true, file: next };
}

export function countEntries(file: ListsFile): number {
  return LISTS.reduce((sum, list) => sum + file.lists[list].length, 0);
}
