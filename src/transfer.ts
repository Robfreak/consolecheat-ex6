import {
  IMPORT_MAX_BYTES,
  LISTS,
  MAX_PER_LIST,
  SCHEMA,
  VERSION,
  cleanNote,
  countEntries,
  emptyLists,
  makeEntry,
  sameGame,
  type Entry,
  type ListId,
  type ListsFile,
} from "./lists.ts";

export type ImportIssue = "broken-json" | "wrong-schema" | "wrong-version" | "foreign" | "oversized" | "invalid-entry";

export type ImportResult = { ok: true; file: ListsFile } | { ok: false; issue: ImportIssue };

const TOP_KEYS = new Set(["schema", "version", "lists"]);
const ENTRY_KEYS = new Set(["titleIds", "name", "note"]);

function plain(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function utf8Size(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function exportJson(file: ListsFile): string {
  const lists = {} as Record<ListId, Entry[]>;
  for (const list of LISTS) {
    lists[list] = file.lists[list].map((entry) => ({
      titleIds: [...entry.titleIds],
      name: entry.name,
      note: entry.note,
    }));
  }
  return `${JSON.stringify({ schema: SCHEMA, version: VERSION, lists }, null, 2)}\n`;
}

export function validateImport(text: string, byteLength = utf8Size(text)): ImportResult {
  if (byteLength > IMPORT_MAX_BYTES || utf8Size(text) > IMPORT_MAX_BYTES) return { ok: false, issue: "oversized" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, issue: "broken-json" };
  }
  if (!plain(parsed)) return { ok: false, issue: "foreign" };
  const keys = Object.keys(parsed);
  if (!Object.hasOwn(parsed, "schema")) return { ok: false, issue: "foreign" };
  if (parsed.schema !== SCHEMA) return { ok: false, issue: "wrong-schema" };
  if (!Object.hasOwn(parsed, "version") || parsed.version !== VERSION) return { ok: false, issue: "wrong-version" };
  if (keys.some((key) => !TOP_KEYS.has(key)) || !Object.hasOwn(parsed, "lists") || !plain(parsed.lists)) {
    return { ok: false, issue: "foreign" };
  }
  const listKeys = Object.keys(parsed.lists);
  if (listKeys.length !== LISTS.length || LISTS.some((list) => !Object.hasOwn(parsed.lists as object, list))) {
    return { ok: false, issue: "foreign" };
  }

  const file = emptyLists();
  for (const list of LISTS) {
    const rows = (parsed.lists as Record<string, unknown>)[list];
    if (!Array.isArray(rows) || rows.length > MAX_PER_LIST) return { ok: false, issue: "invalid-entry" };
    const accepted: Entry[] = [];
    for (const row of rows) {
      if (!plain(row)) return { ok: false, issue: "invalid-entry" };
      if (Object.keys(row).some((key) => !ENTRY_KEYS.has(key))) return { ok: false, issue: "invalid-entry" };
      if (typeof row.name !== "string" || !Array.isArray(row.titleIds) || typeof row.note !== "string") {
        return { ok: false, issue: "invalid-entry" };
      }
      const note = cleanNote(row.note);
      if (!note.ok) return { ok: false, issue: "invalid-entry" };
      const entry = makeEntry({ titleIds: row.titleIds as string[], name: row.name, note: row.note });
      if (!entry) return { ok: false, issue: "invalid-entry" };
      if (accepted.some((have) => sameGame(have.titleIds, entry.titleIds))) return { ok: false, issue: "invalid-entry" };
      accepted.push(entry);
    }
    file.lists[list] = accepted;
  }
  return { ok: true, file };
}

export function mergeLists(current: ListsFile, incoming: ListsFile): ListsFile {
  const next = structuredClone(current);
  for (const list of LISTS) {
    for (const entry of incoming.lists[list]) {
      let home: { list: ListId; index: number } | null = null;
      for (const candidate of LISTS) {
        const index = next.lists[candidate].findIndex((have) => sameGame(have.titleIds, entry.titleIds));
        if (index >= 0) {
          home = { list: candidate, index };
          break;
        }
      }
      if (!home) {
        next.lists[list].push({ titleIds: [...entry.titleIds], name: entry.name, note: entry.note });
        continue;
      }
      const existing = next.lists[home.list][home.index];
      if (existing && !existing.note && entry.note) existing.note = entry.note;
    }
  }
  return next;
}

export function applyImport(current: ListsFile, incoming: ListsFile, mode: "merge" | "replace"): ListsFile {
  if (mode === "replace") return structuredClone(incoming);
  return mergeLists(current, incoming);
}

/** Anything other than merge or replace leaves the current lists untouched. */
export function resolveImport(current: ListsFile, incoming: ListsFile, choice: string): ListsFile {
  if (choice === "merge" || choice === "replace") return applyImport(current, incoming, choice);
  return current;
}

export function hasEntries(file: ListsFile): boolean {
  return countEntries(file) > 0;
}
