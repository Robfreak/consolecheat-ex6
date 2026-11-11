import { useEffect, useRef, useState } from "react";
import type { KoMatch } from "./bracket.ts";
import { fill, roundName, type Copy } from "./messages.ts";
import { BYE, parseGoals, type Score, type Slot } from "./types.ts";

export type SaveResult = "ok" | "draw" | "invalid" | "confirm";

export function BracketView({
  matches,
  text,
  nameOf,
  onSave,
}: {
  matches: readonly KoMatch[];
  text: Copy;
  nameOf: (slot: Slot) => string;
  onSave: (matchId: string, score: Score) => SaveResult;
}) {
  const rounds = [...new Set(matches.map((match) => match.round))].sort((a, b) => a - b);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = matches.find((match) => match.id === openId) ?? null;

  return (
    <section aria-labelledby="plan-heading">
      <h2 id="plan-heading" className="font-display text-2xl font-semibold tracking-tight">
        {text.planHeading}
      </h2>
      <p className="mt-2 text-sm text-subtle">{text.scrollHint}</p>
      <div className="bracket-scroll mt-4" data-testid="bracket" tabIndex={0} aria-label={text.planHeading}>
        <div className="bracket">
          {rounds.map((round) => (
            <div key={round} className="bracket-round">
              <h3 className="text-sm font-semibold text-steel">{roundName(text, round, rounds.length)}</h3>
              <div className="bracket-matches">
                {matches
                  .filter((match) => match.round === round)
                  .map((match) => (
                    <MatchCard key={match.id} match={match} text={text} nameOf={nameOf} onOpen={() => setOpenId(match.id)} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {open ? (
        <ScoreDialog
          match={open}
          text={text}
          nameOf={nameOf}
          onClose={() => setOpenId(null)}
          onSave={(score) => {
            const result = onSave(open.id, score);
            if (result === "ok" || result === "confirm") setOpenId(null);
            return result;
          }}
        />
      ) : null}
    </section>
  );
}

function slotLabel(slot: Slot, text: Copy, nameOf: (slot: Slot) => string): string {
  if (slot === BYE) return text.bye;
  if (!slot) return text.waiting;
  return nameOf(slot);
}

function canScore(match: KoMatch): boolean {
  return typeof match.home === "string" && match.home !== BYE && typeof match.away === "string" && match.away !== BYE;
}

function MatchCard({
  match,
  text,
  nameOf,
  onOpen,
}: {
  match: KoMatch;
  text: Copy;
  nameOf: (slot: Slot) => string;
  onOpen: () => void;
}) {
  const home = slotLabel(match.home, text, nameOf);
  const away = slotLabel(match.away, text, nameOf);
  const bye = match.home === BYE || match.away === BYE;
  const ready = canScore(match);
  const homeWon = match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore;
  const awayWon = match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore;
  const body = (
    <>
      <span className={homeWon ? "slot is-winner" : "slot"}>
        <span>{home}</span>
        <span className="num">{match.homeScore === null || bye ? "" : match.homeScore}</span>
      </span>
      <span className={awayWon ? "slot is-winner" : "slot"}>
        <span>{away}</span>
        <span className="num">{match.awayScore === null || bye ? "" : match.awayScore}</span>
      </span>
    </>
  );
  if (!ready) {
    return (
      <div className="match-card" data-testid={`match-${match.id}`} data-bye={bye ? "true" : undefined}>
        {body}
      </div>
    );
  }
  return (
    <button
      type="button"
      className="match-card is-button"
      data-testid={`match-${match.id}`}
      aria-label={fill(text.scoreAction, { home, away })}
      onClick={onOpen}
    >
      {body}
    </button>
  );
}

function ScoreDialog({
  match,
  text,
  nameOf,
  onClose,
  onSave,
}: {
  match: KoMatch;
  text: Copy;
  nameOf: (slot: Slot) => string;
  onClose: () => void;
  onSave: (score: Score) => SaveResult;
}) {
  const homeName = slotLabel(match.home, text, nameOf);
  const awayName = slotLabel(match.away, text, nameOf);
  const [home, setHome] = useState(match.homeScore === null ? "" : String(match.homeScore));
  const [away, setAway] = useState(match.awayScore === null ? "" : String(match.awayScore));
  const [error, setError] = useState("");
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    first.current?.focus();
  }, []);

  function save() {
    const homeScore = parseGoals(home);
    const awayScore = parseGoals(away);
    if (homeScore === null || awayScore === null) {
      setError(text.scoreInvalid);
      return;
    }
    const result = onSave({ home: homeScore, away: awayScore });
    if (result === "draw") setError(text.drawNotAllowed);
    else if (result === "invalid") setError(text.scoreInvalid);
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-title"
        className="panel w-full max-w-lg rounded-xl p-4"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
      >
        <h2 id="score-title" className="font-display text-xl font-semibold tracking-tight">
          {fill(text.scoreAction, { home: homeName, away: awayName })}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium" htmlFor={`home-${match.id}`}>
            {fill(text.homeScore, { name: homeName })}
            <input
              ref={first}
              id={`home-${match.id}`}
              className="field mt-1"
              inputMode="numeric"
              value={home}
              onChange={(event) => setHome(event.target.value)}
            />
          </label>
          <label className="text-sm font-medium" htmlFor={`away-${match.id}`}>
            {fill(text.awayScore, { name: awayName })}
            <input
              id={`away-${match.id}`}
              className="field mt-1"
              inputMode="numeric"
              value={away}
              onChange={(event) => setAway(event.target.value)}
            />
          </label>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-bad">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {text.cancel}
          </button>
          <button type="submit" className="btn btn-primary">
            {text.saveScore}
          </button>
        </div>
      </form>
    </div>
  );
}
