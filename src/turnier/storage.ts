// What this page stores.
//
// The current tournament uses localStorage key `consolecheat-turnier-v1`.
// The JSON shape is:
//
//   {
//     "version": 1,
//     "name": "Couch-Turnier",
//     "mode": "ko" | "liga",
//     "doubleRound": false,
//     "points": { "win": 3, "draw": 1, "loss": 0 },
//     "players": [{ "id": "pxxxxxxxx", "name": "Ada" }],
//     "phase": "setup" | "live",
//     "order": ["pxxxxxxxx"],
//     "scores": { "r0m0": { "home": 2, "away": 1 } }
//   }
//
// The key is written when the tournament changes. A missing key is not created
// on load. A value that does not parse, a different version, or a shape this
// page does not understand falls back to an empty setup and does not throw.
// **Neues Turnier** and the Datenschutz reset remove only `consolecheat-turnier-v1`.
// Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`.
// This module never reads or writes the Merkliste key or the screen-test pattern key.

import { playerIssue } from "./players.ts";
// Setup may still contain a duplicate or a blank row. Those are refused only when the draw starts.
// A live tournament with a duplicate name, the wrong count, or a blank name is corrupt.
import { createId } from "./shuffle.ts";
import {
  DEFAULT_POINTS,
  MAX_PLAYERS,
  MAX_TITLE,
  isPlayerId,
  isPointValue,
  isScore,
  type Mode,
  type Player,
  type Points,
  type Scores,
  type Tournament,
} from "./types.ts";

export const SAVE_KEY = "consolecheat-turnier-v1";
export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const MATCH_ID = /^r\d+m\d+$/;

export function emptyTournament(): Tournament {
  return {
    version: 1,
    name: "",
    mode: "ko",
    doubleRound: false,
    points: { ...DEFAULT_POINTS },
    players: [],
    phase: "setup",
    order: [],
    scores: {},
  };
}

export function freshSetup(): Tournament {
  return {
    ...emptyTournament(),
    players: [
      { id: createId(), name: "" },
      { id: createId(), name: "" },
    ],
  };
}

function isMode(value: unknown): value is Mode {
  return value === "ko" || value === "liga";
}

function readPoints(value: unknown): Points | null {
  if (!value || typeof value !== "object") return null;
  const points = value as Points;
  if (!isPointValue(points.win) || !isPointValue(points.draw) || !isPointValue(points.loss)) return null;
  return { win: points.win, draw: points.draw, loss: points.loss };
}

function readPlayers(value: unknown): Player[] | null {
  if (!Array.isArray(value) || value.length > MAX_PLAYERS) return null;
  const players: Player[] = [];
  const ids = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const player = item as Player;
    if (!isPlayerId(player.id) || ids.has(player.id)) return null;
    if (typeof player.name !== "string" || player.name.length > 32) return null;
    ids.add(player.id);
    players.push({ id: player.id, name: player.name });
  }
  return players;
}

function readScores(value: unknown, mode: Mode): Scores | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const scores: Scores = {};
  for (const [key, score] of Object.entries(value)) {
    if (!MATCH_ID.test(key) || !isScore(score)) return null;
    if (mode === "ko" && score.home === score.away) continue;
    scores[key] = { home: score.home, away: score.away };
  }
  return scores;
}

/** Corrupt, foreign, or partial data becomes an empty tournament. Never throws. */
export function parseTournament(raw: string | null): Tournament {
  if (raw == null) return emptyTournament();
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return emptyTournament();
    const record = data as Record<string, unknown>;
    if (record.version !== 1) return emptyTournament();
    if (typeof record.name !== "string" || record.name.length > MAX_TITLE) return emptyTournament();
    if (!isMode(record.mode) || typeof record.doubleRound !== "boolean") return emptyTournament();
    const points = readPoints(record.points);
    const players = readPlayers(record.players);
    const scores = readScores(record.scores, record.mode);
    if (!points || !players || !scores) return emptyTournament();
    if (record.phase !== "setup" && record.phase !== "live") return emptyTournament();
    if (record.phase === "setup") {
      if (!Array.isArray(record.order) || record.order.length > 0) return emptyTournament();
      return {
        version: 1,
        name: record.name,
        mode: record.mode,
        doubleRound: record.doubleRound,
        points,
        players,
        phase: "setup",
        order: [],
        scores: {},
      };
    }
    if (!Array.isArray(record.order) || record.order.length !== players.length) return emptyTournament();
    const order = record.order.filter(isPlayerId);
    if (order.length !== players.length) return emptyTournament();
    const expected = new Set(players.map((player) => player.id));
    if (order.some((id) => !expected.has(id)) || new Set(order).size !== order.length) return emptyTournament();
    if (players.some((player) => player.name.trim().length === 0)) return emptyTournament();
    if (playerIssue(players)) return emptyTournament();
    return {
      version: 1,
      name: record.name,
      mode: record.mode,
      doubleRound: record.doubleRound,
      points,
      players,
      phase: "live",
      order,
      scores,
    };
  } catch {
    return emptyTournament();
  }
}

export function serializeTournament(tournament: Tournament): string {
  return JSON.stringify({
    version: 1,
    name: tournament.name,
    mode: tournament.mode,
    doubleRound: tournament.doubleRound,
    points: tournament.points,
    players: tournament.players,
    phase: tournament.phase,
    order: tournament.order,
    scores: tournament.scores,
  });
}

export function loadTournament(local: StorageLike): Tournament {
  try {
    return parseTournament(local.getItem(SAVE_KEY));
  } catch {
    return emptyTournament();
  }
}

export function saveTournament(local: StorageLike, tournament: Tournament): boolean {
  try {
    local.setItem(SAVE_KEY, serializeTournament(tournament));
    return true;
  } catch {
    return false;
  }
}

/** Removes only `consolecheat-turnier-v1`. Language and theme stay. */
export function resetTournament(local: StorageLike): boolean {
  try {
    local.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}
