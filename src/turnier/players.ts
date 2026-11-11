import { MAX_NAME, MAX_PLAYERS, MIN_PLAYERS, type Player } from "./types.ts";

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function nameKey(name: string): string {
  return normalizeName(name).toLocaleLowerCase("de");
}

export type PlayerIssue = "count" | "duplicate" | "length";

export function playerIssue(players: readonly Player[]): PlayerIssue | null {
  const filled = players
    .map((player) => ({ ...player, name: normalizeName(player.name) }))
    .filter((player) => player.name.length > 0);
  if (filled.length < MIN_PLAYERS || filled.length > MAX_PLAYERS) return "count";
  if (filled.some((player) => player.name.length > MAX_NAME)) return "length";
  const seen = new Set<string>();
  for (const player of filled) {
    const key = nameKey(player.name);
    if (seen.has(key)) return "duplicate";
    seen.add(key);
  }
  return null;
}

export function duplicateIds(players: readonly Player[]): string[] {
  const first = new Map<string, string>();
  const dupes = new Set<string>();
  for (const player of players) {
    const key = nameKey(player.name);
    if (!key) continue;
    const prior = first.get(key);
    if (prior) {
      dupes.add(prior);
      dupes.add(player.id);
    } else {
      first.set(key, player.id);
    }
  }
  return [...dupes];
}

/** Trimmed players with a name, or null when the list cannot be drawn. */
export function readyPlayers(players: readonly Player[]): Player[] | null {
  if (playerIssue(players)) return null;
  return players
    .map((player) => ({ ...player, name: normalizeName(player.name) }))
    .filter((player) => player.name.length > 0);
}
