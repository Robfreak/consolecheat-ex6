import { koWinner, resolveBracket, roundCount } from "./bracket.ts";
import { bracketExportSize, leagueExportSize, type ExportModel } from "./export.ts";
import { isBye, leagueLeader, leagueSchedule, leagueTable, realMatches } from "./league.ts";
import { formatDiff, roundName, type Copy } from "./messages.ts";
import { BYE, type Tournament } from "./types.ts";

export function displayTitle(state: Tournament, text: Copy): string {
  const name = state.name.trim();
  return name || text.defaultTitle;
}

export function nameOf(state: Tournament, id: string, text: Copy): string {
  if (id === BYE) return text.bye;
  return state.players.find((player) => player.id === id)?.name ?? id;
}

export function winnerOf(state: Tournament): { id: string; name: string } | null {
  if (state.phase !== "live") return null;
  if (state.mode === "ko") {
    const id = koWinner(resolveBracket(state.order, state.scores));
    if (!id) return null;
    const name = state.players.find((player) => player.id === id)?.name ?? id;
    return { id, name };
  }
  const matches = leagueSchedule(state.order, state.doubleRound);
  const rows = leagueTable(state.players, matches, state.scores, state.points);
  const id = leagueLeader(rows, matches, state.scores);
  if (!id) return null;
  const name = rows.find((row) => row.id === id)?.name ?? id;
  return { id, name };
}

export function toExportModel(state: Tournament, text: Copy): ExportModel {
  const title = displayTitle(state, text);
  const winner = winnerOf(state);
  const winnerLine = winner ? text.winnerTitle.replace("{name}", winner.name) : "";
  if (state.mode === "liga") {
    const matches = leagueSchedule(state.order, state.doubleRound);
    const rows = leagueTable(state.players, matches, state.scores, state.points);
    return {
      kind: "league",
      title,
      modeLabel: text.modeLiga,
      brand: text.brand,
      unofficial: text.unofficial,
      winner: winnerLine,
      columns: [text.colPlayed, text.colWon, text.colDrawn, text.colLost, text.colGoals, text.colDiff, text.colPoints],
      rows: rows.map((row) => ({
        name: row.name,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goals: `${row.goalsFor}:${row.goalsAgainst}`,
        diff: formatDiff(row.goalDiff),
        points: row.points,
      })),
    };
  }
  const matches = resolveBracket(state.order, state.scores);
  const total = roundCount(state.order.length || 2);
  const rounds = Array.from({ length: total }, (_, round) => ({
    title: roundName(text, round, total),
    matches: matches
      .filter((match) => match.round === round)
      .map((match) => {
        const top = match.home === BYE ? text.bye : match.home ? nameOf(state, match.home, text) : text.waiting;
        const bottom = match.away === BYE ? text.bye : match.away ? nameOf(state, match.away, text) : text.waiting;
        const score = match.homeScore !== null && match.awayScore !== null ? `${match.homeScore}:${match.awayScore}` : "";
        return { top, bottom, score };
      }),
  }));
  return {
    kind: "ko",
    title,
    modeLabel: text.modeKo,
    brand: text.brand,
    unofficial: text.unofficial,
    winner: winnerLine,
    playerCount: state.order.length,
    rounds,
  };
}

export function exportPixelSize(state: Tournament): { width: number; height: number } {
  if (state.mode === "liga") return leagueExportSize(state.players.length);
  return bracketExportSize(state.order.length || 2);
}

export function leagueView(state: Tournament) {
  const matches = leagueSchedule(state.order, state.doubleRound);
  return {
    matches,
    real: realMatches(matches),
    rows: leagueTable(state.players, matches, state.scores, state.points),
    bye: isBye,
  };
}
