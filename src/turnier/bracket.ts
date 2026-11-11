import { BYE, type Score, type Scores, type Slot } from "./types.ts";

export type KoMatch = {
  id: string;
  round: number;
  index: number;
  home: Slot;
  away: Slot;
  homeScore: number | null;
  awayScore: number | null;
};

export type KoCommit =
  | { ok: true; scores: Scores; cleared: string[] }
  | { ok: false; reason: "draw" | "range" | "bye" | "not-ready" | "missing" }
  | { ok: false; reason: "confirm"; cleared: string[] };

export function bracketSize(count: number): number {
  let size = 1;
  while (size < count) size *= 2;
  return size;
}

export function roundCount(count: number): number {
  let rounds = 0;
  let size = bracketSize(count);
  while (size > 1) {
    size /= 2;
    rounds += 1;
  }
  return rounds;
}

function isPlayer(slot: Slot): slot is string {
  return typeof slot === "string" && slot !== BYE;
}

/** Bye slots are spread one per match so a bye never meets a bye. */
export function firstRoundSlots(playerIds: readonly string[]): Slot[] {
  const count = playerIds.length;
  const size = bracketSize(count);
  const matches = size / 2;
  const byes = size - count;
  const byeMatches = new Set<number>();
  for (let i = 0; i < byes; i += 1) {
    byeMatches.add(Math.floor((i * matches) / byes));
  }
  const slots: Slot[] = Array.from({ length: size }, () => null);
  let cursor = 0;
  for (let match = 0; match < matches; match += 1) {
    const home = match * 2;
    const away = home + 1;
    if (byeMatches.has(match)) {
      slots[home] = playerIds[cursor] ?? null;
      slots[away] = BYE;
      cursor += 1;
    } else {
      slots[home] = playerIds[cursor] ?? null;
      slots[away] = playerIds[cursor + 1] ?? null;
      cursor += 2;
    }
  }
  return slots;
}

function emptyMatches(playerIds: readonly string[]): KoMatch[] {
  const size = bracketSize(playerIds.length);
  const rounds = roundCount(playerIds.length);
  const slots = firstRoundSlots(playerIds);
  const matches: KoMatch[] = [];
  for (let round = 0; round < rounds; round += 1) {
    const count = size / 2 / 2 ** round;
    for (let index = 0; index < count; index += 1) {
      matches.push({
        id: `r${round}m${index}`,
        round,
        index,
        home: round === 0 ? (slots[index * 2] ?? null) : null,
        away: round === 0 ? (slots[index * 2 + 1] ?? null) : null,
        homeScore: null,
        awayScore: null,
      });
    }
  }
  return matches;
}

function placeWinner(matches: readonly KoMatch[], match: KoMatch, winner: string): void {
  const next = matches.find((item) => item.round === match.round + 1 && item.index === Math.floor(match.index / 2));
  if (!next) return;
  if (match.index % 2 === 0) next.home = winner;
  else next.away = winner;
}

function decide(match: KoMatch, score: Score | undefined): string | null {
  if (match.home === BYE && isPlayer(match.away)) return match.away;
  if (match.away === BYE && isPlayer(match.home)) return match.home;
  if (!isPlayer(match.home) || !isPlayer(match.away) || !score) return null;
  if (score.home === score.away) return null;
  return score.home > score.away ? match.home : match.away;
}

export function resolveBracket(playerIds: readonly string[], scores: Scores): KoMatch[] {
  const matches = emptyMatches(playerIds);
  for (const match of matches) {
    const score = scores[match.id];
    const winner = decide(match, score);
    if (winner && score && isPlayer(match.home) && isPlayer(match.away) && score.home !== score.away) {
      match.homeScore = score.home;
      match.awayScore = score.away;
    }
    if (winner) placeWinner(matches, match, winner);
  }
  return matches;
}

function sameSlots(left: KoMatch, right: KoMatch): boolean {
  return left.home === right.home && left.away === right.away;
}

export function commitKoScore(
  playerIds: readonly string[],
  scores: Scores,
  matchId: string,
  score: Score,
  confirmed: boolean,
): KoCommit {
  if (score.home < 0 || score.away < 0 || score.home > 99 || score.away > 99) return { ok: false, reason: "range" };
  if (!Number.isInteger(score.home) || !Number.isInteger(score.away)) return { ok: false, reason: "range" };
  if (score.home === score.away) return { ok: false, reason: "draw" };

  const before = resolveBracket(playerIds, scores);
  const target = before.find((match) => match.id === matchId);
  if (!target) return { ok: false, reason: "missing" };
  if (target.home === BYE || target.away === BYE) return { ok: false, reason: "bye" };
  if (!isPlayer(target.home) || !isPlayer(target.away)) return { ok: false, reason: "not-ready" };

  const matches = emptyMatches(playerIds);
  const cleared: string[] = [];
  const nextScores: Scores = {};
  for (const match of matches) {
    const previous = before.find((item) => item.id === match.id);
    let used: Score | undefined;
    if (match.id === matchId) used = score;
    else if (scores[match.id] && previous && sameSlots(previous, match)) used = scores[match.id];
    else if (scores[match.id]) cleared.push(match.id);
    const winner = decide(match, used);
    if (used && winner && isPlayer(match.home) && isPlayer(match.away)) {
      match.homeScore = used.home;
      match.awayScore = used.away;
      nextScores[match.id] = used;
    }
    if (winner) placeWinner(matches, match, winner);
  }

  if (cleared.length > 0 && !confirmed) return { ok: false, reason: "confirm", cleared };
  return { ok: true, scores: nextScores, cleared };
}

export function koWinner(matches: readonly KoMatch[]): string | null {
  const final = matches.find((match) => match.round === Math.max(...matches.map((item) => item.round)));
  if (!final) return null;
  return decide(final, final.homeScore !== null && final.awayScore !== null ? { home: final.homeScore, away: final.awayScore } : undefined);
}

export function canRedraw(scores: Scores): boolean {
  return Object.keys(scores).length === 0;
}
