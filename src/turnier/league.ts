import { BYE, type Player, type Points, type Score, type Scores } from "./types.ts";

export type LeagueMatch = {
  id: string;
  round: number;
  index: number;
  leg: 0 | 1;
  home: string;
  away: string;
};

export type TableRow = {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

type Mini = {
  points: number;
  goalDiff: number;
  goalsFor: number;
};

function circle(ids: readonly string[]): Array<Array<{ home: string; away: string }>> {
  const teams = [...ids];
  if (teams.length % 2 === 1) teams.push(BYE);
  const count = teams.length;
  const row = teams.slice();
  const rounds: Array<Array<{ home: string; away: string }>> = [];
  for (let round = 0; round < count - 1; round += 1) {
    const pairs: Array<{ home: string; away: string }> = [];
    for (let index = 0; index < count / 2; index += 1) {
      let home = row[index] ?? BYE;
      let away = row[count - 1 - index] ?? BYE;
      if (home === BYE || away === BYE) {
        const player = home === BYE ? away : home;
        home = player;
        away = BYE;
      }
      pairs.push({ home, away });
    }
    rounds.push(pairs);
    const fixed = row[0] ?? BYE;
    const moving = row.slice(1);
    const tail = moving.pop() ?? BYE;
    moving.unshift(tail);
    row.splice(0, row.length, fixed, ...moving);
  }
  return rounds;
}

export function leagueSchedule(playerIds: readonly string[], doubleRound: boolean): LeagueMatch[] {
  const first = circle(playerIds);
  const legs = doubleRound
    ? [
        ...first.map((round) => ({ leg: 0 as const, pairs: round })),
        ...first.map((round) => ({
          leg: 1 as const,
          pairs: round.map((pair) =>
            pair.home === BYE || pair.away === BYE ? pair : { home: pair.away, away: pair.home },
          ),
        })),
      ]
    : first.map((round) => ({ leg: 0 as const, pairs: round }));

  const matches: LeagueMatch[] = [];
  legs.forEach((leg, round) => {
    leg.pairs.forEach((pair, index) => {
      matches.push({
        id: `r${round}m${index}`,
        round,
        index,
        leg: leg.leg,
        home: pair.home,
        away: pair.away,
      });
    });
  });
  return matches;
}

export function isBye(match: LeagueMatch): boolean {
  return match.home === BYE || match.away === BYE;
}

export function realMatches(matches: readonly LeagueMatch[]): LeagueMatch[] {
  return matches.filter((match) => !isBye(match));
}

export function leagueComplete(matches: readonly LeagueMatch[], scores: Scores): boolean {
  return realMatches(matches).every((match) => scores[match.id] !== undefined);
}

function emptyMini(): Mini {
  return { points: 0, goalDiff: 0, goalsFor: 0 };
}

function addResult(row: TableRow, goalsFor: number, goalsAgainst: number, points: Points): void {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDiff = row.goalsFor - row.goalsAgainst;
  if (goalsFor > goalsAgainst) {
    row.won += 1;
    row.points += points.win;
  } else if (goalsFor === goalsAgainst) {
    row.drawn += 1;
    row.points += points.draw;
  } else {
    row.lost += 1;
    row.points += points.loss;
  }
}

export function leagueTable(
  players: readonly Player[],
  matches: readonly LeagueMatch[],
  scores: Scores,
  points: Points,
): TableRow[] {
  const rows = new Map<string, TableRow>();
  for (const player of players) {
    rows.set(player.id, {
      id: player.id,
      name: player.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    });
  }
  for (const match of matches) {
    if (isBye(match)) continue;
    const score = scores[match.id];
    if (!score) continue;
    const home = rows.get(match.home);
    const away = rows.get(match.away);
    if (!home || !away) continue;
    addResult(home, score.home, score.away, points);
    addResult(away, score.away, score.home, points);
  }

  const list = [...rows.values()];
  const groups = new Map<string, TableRow[]>();
  for (const row of list) {
    const key = `${row.points}\u0000${row.goalDiff}\u0000${row.goalsFor}`;
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }
  const keys = [...groups.keys()].sort((left, right) => {
    const [lp, ld, lf] = left.split("\u0000").map(Number);
    const [rp, rd, rf] = right.split("\u0000").map(Number);
    if ((lp ?? 0) !== (rp ?? 0)) return (rp ?? 0) - (lp ?? 0);
    if ((ld ?? 0) !== (rd ?? 0)) return (rd ?? 0) - (ld ?? 0);
    return (rf ?? 0) - (lf ?? 0);
  });

  const ordered: TableRow[] = [];
  for (const key of keys) {
    const group = groups.get(key) ?? [];
    if (group.length < 2) {
      ordered.push(...group);
      continue;
    }
    const ids = new Set(group.map((row) => row.id));
    const mini = new Map<string, Mini>();
    for (const row of group) mini.set(row.id, emptyMini());
    for (const match of matches) {
      if (isBye(match) || !ids.has(match.home) || !ids.has(match.away)) continue;
      const score = scores[match.id];
      if (!score) continue;
      const home = mini.get(match.home);
      const away = mini.get(match.away);
      if (!home || !away) continue;
      applyMini(home, score.home, score.away, points);
      applyMini(away, score.away, score.home, points);
    }
    group.sort((left, right) => compareMini(mini.get(left.id), mini.get(right.id), left.name, right.name));
    ordered.push(...group);
  }
  return ordered;
}

function applyMini(mini: Mini, goalsFor: number, goalsAgainst: number, points: Points): void {
  mini.goalsFor += goalsFor;
  mini.goalDiff += goalsFor - goalsAgainst;
  if (goalsFor > goalsAgainst) mini.points += points.win;
  else if (goalsFor === goalsAgainst) mini.points += points.draw;
  else mini.points += points.loss;
}

function compareMini(left: Mini | undefined, right: Mini | undefined, leftName: string, rightName: string): number {
  const a = left ?? emptyMini();
  const b = right ?? emptyMini();
  if (a.points !== b.points) return b.points - a.points;
  if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff;
  if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
  return leftName.localeCompare(rightName, "de");
}

export function commitLeagueScore(match: LeagueMatch, score: Score): { ok: true; score: Score } | { ok: false; reason: "bye" | "range" } {
  if (isBye(match)) return { ok: false, reason: "bye" };
  if (!Number.isInteger(score.home) || !Number.isInteger(score.away) || score.home < 0 || score.away < 0 || score.home > 99 || score.away > 99) {
    return { ok: false, reason: "range" };
  }
  return { ok: true, score: { home: score.home, away: score.away } };
}

export function leagueLeader(rows: readonly TableRow[], matches: readonly LeagueMatch[], scores: Scores): string | null {
  if (!leagueComplete(matches, scores) || rows.length === 0) return null;
  return rows[0]?.id ?? null;
}
