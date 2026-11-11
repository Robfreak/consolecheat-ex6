import { useState } from "react";
import type { LeagueMatch, TableRow } from "./league.ts";
import { formatDiff, fill, type Copy } from "./messages.ts";
import { parseGoals, type Score, type Scores } from "./types.ts";

export function LeagueView({
  matches,
  rows,
  scores,
  text,
  nameOf,
  onSave,
}: {
  matches: readonly LeagueMatch[];
  rows: readonly TableRow[];
  scores: Scores;
  text: Copy;
  nameOf: (id: string) => string;
  onSave: (matchId: string, score: Score) => boolean;
}) {
  const rounds = [...new Set(matches.map((match) => match.round))];
  return (
    <div className="grid gap-8">
      <section aria-labelledby="plan-heading">
        <h2 id="plan-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.planHeading}
        </h2>
        <div className="mt-4 grid gap-4">
          {rounds.map((round) => (
            <section key={round} className="panel rounded-xl p-4" aria-labelledby={`day-${round}`}>
              <h3 id={`day-${round}`} className="font-display text-lg font-semibold">
                {fill(text.matchday, { n: round + 1 })}
              </h3>
              <ul className="mt-3 flex flex-col gap-3">
                {matches
                  .filter((match) => match.round === round)
                  .map((match) =>
                    match.home === "bye" || match.away === "bye" ? (
                      <li key={match.id} className="bye-row" data-testid={`match-${match.id}`}>
                        <span>{nameOf(match.home === "bye" ? match.away : match.home)}</span>
                        <span className="text-steel">{text.bye}</span>
                      </li>
                    ) : (
                      <LeagueScore key={match.id} match={match} score={scores[match.id]} text={text} nameOf={nameOf} onSave={onSave} />
                    ),
                  )}
              </ul>
            </section>
          ))}
        </div>
      </section>
      <section aria-labelledby="table-heading">
        <h2 id="table-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.tableHeading}
        </h2>
        <div className="table-scroll mt-4" tabIndex={0} aria-label={text.tableLabel} data-testid="league-table">
          <table>
            <caption className="sr-only">{text.tableHeading}</caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{text.playersLabel}</th>
                <th scope="col">{text.colPlayed}</th>
                <th scope="col">{text.colWon}</th>
                <th scope="col">{text.colDrawn}</th>
                <th scope="col">{text.colLost}</th>
                <th scope="col">{text.colGoals}</th>
                <th scope="col">{text.colDiff}</th>
                <th scope="col">{text.colPoints}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className={index === 0 && row.played > 0 ? "is-lead" : undefined}>
                  <td>{index + 1}</td>
                  <th scope="row">{row.name}</th>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>
                    {row.goalsFor}:{row.goalsAgainst}
                  </td>
                  <td>{formatDiff(row.goalDiff)}</td>
                  <td>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function LeagueScore({
  match,
  score,
  text,
  nameOf,
  onSave,
}: {
  match: LeagueMatch;
  score: Score | undefined;
  text: Copy;
  nameOf: (id: string) => string;
  onSave: (matchId: string, score: Score) => boolean;
}) {
  const homeName = nameOf(match.home);
  const awayName = nameOf(match.away);
  const [home, setHome] = useState(score ? String(score.home) : "");
  const [away, setAway] = useState(score ? String(score.away) : "");
  const [error, setError] = useState("");
  const homeId = `${match.id}-home`;
  const awayId = `${match.id}-away`;

  function save() {
    const homeScore = parseGoals(home);
    const awayScore = parseGoals(away);
    if (homeScore === null || awayScore === null) {
      setError(text.scoreInvalid);
      return;
    }
    const ok = onSave(match.id, { home: homeScore, away: awayScore });
    setError(ok ? "" : text.scoreInvalid);
  }

  return (
    <li>
      <form
        className="score-line"
        data-testid={`match-${match.id}`}
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <span className="score-name">{homeName}</span>
        <label className="sr-only" htmlFor={homeId}>
          {fill(text.homeScore, { name: homeName })}
        </label>
        <input id={homeId} className="field score-input" inputMode="numeric" value={home} onChange={(event) => setHome(event.target.value)} />
        <span aria-hidden="true">:</span>
        <label className="sr-only" htmlFor={awayId}>
          {fill(text.awayScore, { name: awayName })}
        </label>
        <input id={awayId} className="field score-input" inputMode="numeric" value={away} onChange={(event) => setAway(event.target.value)} />
        <span className="score-name">{awayName}</span>
        <button type="submit" className="btn btn-primary">
          {text.saveScore}
        </button>
      </form>
      {error ? (
        <p role="alert" className="mt-1 text-sm text-bad">
          {error}
        </p>
      ) : null}
    </li>
  );
}
