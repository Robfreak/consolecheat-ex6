// JSON export and import for `consolecheat-speedrun` version 1.
// A file that does not parse, or that fails the schema, is refused.
// The caller keeps the current store in that case.

import {
  MAX_ATTEMPTS,
  MAX_LABEL,
  MAX_MS,
  MAX_PROFILES,
  MAX_SPLITS,
  SCHEMA,
  VERSION,
  cleanLabel,
  type Profile,
  type Store,
} from "./model.ts";

export const IMPORT_MAX_BYTES = 256 * 1024;

export type StoreIssue = "broken-json" | "wrong-schema" | "wrong-version" | "invalid" | "oversized" | "blocked";

export type ParseResult = { ok: true; store: Store } | { ok: false; issue: StoreIssue };

const TOP_KEYS = new Set(["schema", "version", "activeProfileId", "profiles"]);
const PROFILE_KEYS = new Set(["id", "game", "category", "attempts", "splits", "pb", "bestSegments", "splitsVersion"]);
const SPLIT_KEYS = new Set(["id", "name"]);

function plain(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function utf8Size(text: string): number {
  return new TextEncoder().encode(text).length;
}

function onlyKeys(value: Record<string, unknown>, allowed: Set<string>): boolean {
  return Object.keys(value).every((key) => allowed.has(key));
}

function finiteMs(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= MAX_MS;
}

export function exportJson(store: Store): string {
  return `${JSON.stringify(store, null, 2)}\n`;
}

export function parseStore(text: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, issue: "broken-json" };
  }
  if (!plain(parsed) || !onlyKeys(parsed, TOP_KEYS)) return { ok: false, issue: "invalid" };
  if (!Object.hasOwn(parsed, "schema")) return { ok: false, issue: "invalid" };
  if (parsed.schema !== SCHEMA) return { ok: false, issue: "wrong-schema" };
  if (!Object.hasOwn(parsed, "version") || parsed.version !== VERSION) return { ok: false, issue: "wrong-version" };
  if (typeof parsed.activeProfileId !== "string" || !Array.isArray(parsed.profiles)) return { ok: false, issue: "invalid" };
  if (parsed.profiles.length < 1 || parsed.profiles.length > MAX_PROFILES) return { ok: false, issue: "invalid" };

  const profiles: Profile[] = [];
  const ids = new Set<string>();
  for (const row of parsed.profiles) {
    const profile = parseProfile(row);
    if (!profile) return { ok: false, issue: "invalid" };
    if (ids.has(profile.id)) return { ok: false, issue: "invalid" };
    ids.add(profile.id);
    profiles.push(profile);
  }
  if (!ids.has(parsed.activeProfileId)) return { ok: false, issue: "invalid" };
  return {
    ok: true,
    store: {
      schema: SCHEMA,
      version: VERSION,
      activeProfileId: parsed.activeProfileId,
      profiles,
    },
  };
}

function parseProfile(value: unknown): Profile | null {
  if (!plain(value) || !onlyKeys(value, PROFILE_KEYS)) return null;
  const id = cleanLabel(value.id);
  const game = cleanLabel(value.game);
  const category = cleanLabel(value.category);
  if (!id || !game || !category) return null;
  if (typeof value.attempts !== "number" || !Number.isInteger(value.attempts) || value.attempts < 0 || value.attempts > MAX_ATTEMPTS) {
    return null;
  }
  if (typeof value.splitsVersion !== "number" || !Number.isInteger(value.splitsVersion) || value.splitsVersion < 1 || value.splitsVersion > 1_000_000) {
    return null;
  }
  if (!Array.isArray(value.splits) || value.splits.length > MAX_SPLITS) return null;
  const splits: { id: string; name: string }[] = [];
  const splitIds = new Set<string>();
  for (const split of value.splits) {
    if (!plain(split) || !onlyKeys(split, SPLIT_KEYS)) return null;
    const splitId = cleanLabel(split.id);
    const name = cleanLabel(split.name, MAX_LABEL);
    if (!splitId || !name || splitIds.has(splitId)) return null;
    splitIds.add(splitId);
    splits.push({ id: splitId, name });
  }
  if (!Array.isArray(value.bestSegments) || value.bestSegments.length !== splits.length) return null;
  const bestSegments: (number | null)[] = [];
  for (const gold of value.bestSegments) {
    if (gold === null) {
      bestSegments.push(null);
      continue;
    }
    if (!finiteMs(gold)) return null;
    bestSegments.push(gold);
  }
  let pb: number[] | null = null;
  if (value.pb !== null) {
    if (!Array.isArray(value.pb) || value.pb.length !== splits.length) return null;
    const times: number[] = [];
    for (const time of value.pb) {
      if (!finiteMs(time)) return null;
      if (times.length > 0 && time < times[times.length - 1]!) return null;
      times.push(time);
    }
    pb = times;
  }
  return {
    id,
    game,
    category,
    attempts: value.attempts,
    splits,
    pb,
    bestSegments,
    splitsVersion: value.splitsVersion,
  };
}

export function validateImport(text: string, byteLength = utf8Size(text)): ParseResult {
  if (byteLength > IMPORT_MAX_BYTES || utf8Size(text) > IMPORT_MAX_BYTES) return { ok: false, issue: "oversized" };
  return parseStore(text);
}

/** A refused file returns the current store unchanged. */
export function importInto(current: Store, text: string, byteLength?: number): { store: Store; issue: StoreIssue | null } {
  const result = validateImport(text, byteLength);
  if (!result.ok) return { store: current, issue: result.issue };
  return { store: result.store, issue: null };
}
