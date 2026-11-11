// Reaction duel rules. This module has no DOM and no storage.
//
// A round starts hidden. The symbol (or the Easy signal) is shown only after
// `markRevealed`, which the page schedules for a random delay of 1.5–4 s.
// The page stamps `performance.now()` when the symbol is shown and when the
// player presses. Milliseconds are `press - reveal`, rounded to the nearest ms.
//
// False start: a press while the round is still waiting. The symbol was not
// visible, so the round is lost for that player. In solo it is excluded from
// the average and from best times. In a duel the opponent is awarded the point.
// The first false start decides the round.
//
// Wrong button (symbol matching only): the press does not match the symbol.
// It is a miss, not a time. Solo: the round ends and is excluded from the
// average and from best times. Duel: that player is locked out for the rest of
// the round; the opponent can still win with the matching button. If both
// players miss, nobody scores.
//
// Easy ("Einfach"): the symbol is not matched. Any accepted press after the
// signal is correct. A press before the signal is still a false start.
//
// Solo ignores player 2. A duel ends when one player reaches the goal (3 or 5).
// If nobody answers within ANSWER_WINDOW_MS of the reveal, the round is a miss
// with no time and, in a duel, no point.

export const DELAY_MIN_MS = 1500;
export const DELAY_MAX_MS = 4000;
export const ANSWER_WINDOW_MS = 5000;
export const SETTLE_MS = 1400;
export const SOLO_ROUNDS = 5;
export const DUEL_GOALS = [3, 5] as const;

export const SYMBOLS = ["cross", "circle", "square", "triangle"] as const;

export type FaceSymbol = (typeof SYMBOLS)[number];
export type PlayMode = "solo" | "duel";
export type InputStyle = "match" | "easy";
export type PlayerId = "p1" | "p2";
export type PressInput = FaceSymbol | "any";
export type DuelGoal = (typeof DUEL_GOALS)[number];

export type RoundOutcome =
  | { kind: "correct"; player: PlayerId; ms: number }
  | { kind: "false-start"; player: PlayerId; awardedTo: PlayerId | null }
  | { kind: "wrong"; player: PlayerId }
  | { kind: "miss" };

export type RoundState = {
  mode: PlayMode;
  style: InputStyle;
  phase: "waiting" | "live" | "resolved";
  startedAt: number;
  delayMs: number;
  symbol: FaceSymbol;
  revealedAt: number | null;
  locked: Partial<Record<PlayerId, "wrong">>;
  outcome: RoundOutcome | null;
};

export type SoloRow = {
  symbol: FaceSymbol;
  kind: "correct" | "false-start" | "wrong" | "miss";
  ms: number | null;
};

export type DuelRow = {
  symbol: FaceSymbol;
  winner: PlayerId | null;
  reason: "correct" | "false-start" | "miss";
  ms: number | null;
  actor: PlayerId | null;
};

export type Session = {
  mode: PlayMode;
  style: InputStyle;
  goal: DuelGoal;
  roundNumber: number;
  round: RoundState;
  soloRows: SoloRow[];
  duelRows: DuelRow[];
  scores: Record<PlayerId, number>;
  matchWinner: PlayerId | null;
  finished: boolean;
};

export function clampDelay(ms: number): number {
  if (!Number.isFinite(ms)) return DELAY_MIN_MS;
  return Math.min(DELAY_MAX_MS, Math.max(DELAY_MIN_MS, Math.round(ms)));
}

export function pickDelay(random: () => number): number {
  const raw = random();
  const unit = Number.isFinite(raw) ? Math.min(0.999999, Math.max(0, raw)) : 0;
  return DELAY_MIN_MS + Math.floor(unit * (DELAY_MAX_MS - DELAY_MIN_MS + 1));
}

export function pickSymbol(random: () => number): FaceSymbol {
  const raw = random();
  const unit = Number.isFinite(raw) ? Math.min(0.999999, Math.max(0, raw)) : 0;
  const index = Math.floor(unit * SYMBOLS.length);
  return SYMBOLS[index] ?? "cross";
}

export function isDuelGoal(value: number): value is DuelGoal {
  return value === 3 || value === 5;
}

export function opponent(player: PlayerId): PlayerId {
  return player === "p1" ? "p2" : "p1";
}

export function openRound(args: {
  now: number;
  delayMs: number;
  symbol: FaceSymbol;
  mode: PlayMode;
  style: InputStyle;
}): RoundState {
  return {
    mode: args.mode,
    style: args.style,
    phase: "waiting",
    startedAt: args.now,
    delayMs: clampDelay(args.delayMs),
    symbol: args.symbol,
    revealedAt: null,
    locked: {},
    outcome: null,
  };
}

export function createSession(args: {
  now: number;
  delayMs: number;
  symbol: FaceSymbol;
  mode: PlayMode;
  style: InputStyle;
  goal: DuelGoal;
}): Session {
  return {
    mode: args.mode,
    style: args.style,
    goal: args.goal,
    roundNumber: 1,
    round: openRound(args),
    soloRows: [],
    duelRows: [],
    scores: { p1: 0, p2: 0 },
    matchWinner: null,
    finished: false,
  };
}

export function markRevealed(state: RoundState, now: number): RoundState {
  if (state.phase !== "waiting") return state;
  if (now < state.startedAt + state.delayMs) return state;
  return { ...state, phase: "live", revealedAt: now };
}

function matches(state: RoundState, input: PressInput): boolean {
  if (state.style === "easy") return true;
  return input === state.symbol;
}

function falseStart(state: RoundState, player: PlayerId): RoundState {
  return {
    ...state,
    phase: "resolved",
    outcome: {
      kind: "false-start",
      player,
      awardedTo: state.mode === "duel" ? opponent(player) : null,
    },
  };
}

export function judgePress(state: RoundState, now: number, player: PlayerId, input: PressInput): RoundState {
  if (state.phase === "resolved") return state;
  if (state.mode === "solo" && player === "p2") return state;
  if (state.locked[player]) return state;

  if (state.phase === "waiting" || state.revealedAt === null || now < state.revealedAt) {
    return falseStart(state, player);
  }

  if (matches(state, input)) {
    const ms = Math.max(0, Math.round(now - state.revealedAt));
    return { ...state, phase: "resolved", outcome: { kind: "correct", player, ms } };
  }

  if (state.mode === "solo") {
    return { ...state, phase: "resolved", outcome: { kind: "wrong", player } };
  }

  const locked: RoundState["locked"] = { ...state.locked, [player]: "wrong" };
  if (locked[opponent(player)] === "wrong") {
    return { ...state, locked, phase: "resolved", outcome: { kind: "miss" } };
  }
  return { ...state, locked };
}

export function expireRound(state: RoundState, now: number): RoundState {
  if (state.phase !== "live" || state.revealedAt === null) return state;
  if (now < state.revealedAt + ANSWER_WINDOW_MS) return state;
  return { ...state, phase: "resolved", outcome: { kind: "miss" } };
}

function soloRow(symbol: FaceSymbol, outcome: RoundOutcome): SoloRow {
  if (outcome.kind === "correct") return { symbol, kind: "correct", ms: outcome.ms };
  if (outcome.kind === "false-start") return { symbol, kind: "false-start", ms: null };
  if (outcome.kind === "wrong") return { symbol, kind: "wrong", ms: null };
  return { symbol, kind: "miss", ms: null };
}

function duelRow(symbol: FaceSymbol, outcome: RoundOutcome): DuelRow {
  if (outcome.kind === "correct") {
    return { symbol, winner: outcome.player, reason: "correct", ms: outcome.ms, actor: outcome.player };
  }
  if (outcome.kind === "false-start") {
    return { symbol, winner: outcome.awardedTo, reason: "false-start", ms: null, actor: outcome.player };
  }
  if (outcome.kind === "wrong") {
    return { symbol, winner: null, reason: "miss", ms: null, actor: outcome.player };
  }
  return { symbol, winner: null, reason: "miss", ms: null, actor: null };
}

function seal(session: Session, round: RoundState): Session {
  const outcome = round.outcome;
  if (!outcome) return { ...session, round };
  if (session.mode === "solo") {
    const soloRows = [...session.soloRows, soloRow(round.symbol, outcome)];
    return { ...session, round, soloRows, finished: soloRows.length >= SOLO_ROUNDS };
  }
  const row = duelRow(round.symbol, outcome);
  const scores = { ...session.scores };
  if (row.winner) scores[row.winner] += 1;
  const matchWinner = scores.p1 >= session.goal ? "p1" : scores.p2 >= session.goal ? "p2" : null;
  return {
    ...session,
    round,
    duelRows: [...session.duelRows, row],
    scores,
    matchWinner,
    finished: matchWinner !== null,
  };
}

export function applyReveal(session: Session, now: number): Session {
  if (session.finished) return session;
  const round = markRevealed(session.round, now);
  if (round === session.round) return session;
  return { ...session, round };
}

export function applyPress(session: Session, now: number, player: PlayerId, input: PressInput): Session {
  if (session.finished) return session;
  const round = judgePress(session.round, now, player, input);
  if (round === session.round) return session;
  if (round.phase !== "resolved" || round.outcome === null) return { ...session, round };
  return seal(session, round);
}

export function applyTimeout(session: Session, now: number): Session {
  if (session.finished) return session;
  const round = expireRound(session.round, now);
  if (round === session.round) return session;
  if (round.phase !== "resolved" || round.outcome === null) return { ...session, round };
  return seal(session, round);
}

export function advance(session: Session, now: number, delayMs: number, symbol: FaceSymbol): Session {
  if (session.finished || session.round.phase !== "resolved") return session;
  return {
    ...session,
    roundNumber: session.roundNumber + 1,
    round: openRound({ now, delayMs, symbol, mode: session.mode, style: session.style }),
  };
}

export function summarizeSolo(rows: readonly SoloRow[]): {
  averageMs: number | null;
  bestMs: number | null;
  validCount: number;
} {
  const times = rows.flatMap((row) => (row.kind === "correct" && row.ms !== null ? [row.ms] : []));
  if (times.length === 0) return { averageMs: null, bestMs: null, validCount: 0 };
  const total = times.reduce((sum, ms) => sum + ms, 0);
  return { averageMs: Math.round(total / times.length), bestMs: Math.min(...times), validCount: times.length };
}

export function fastestDuel(rows: readonly DuelRow[]): number | null {
  const times = rows.flatMap((row) => (row.reason === "correct" && row.ms !== null ? [row.ms] : []));
  if (times.length === 0) return null;
  return Math.min(...times);
}

export function scheduleReveal(
  delayMs: number,
  now: () => number,
  setTimer: (callback: () => void, ms: number) => unknown,
  clearTimer: (handle: unknown) => void,
  onReveal: (at: number) => void,
): () => void {
  let done = false;
  const handle = setTimer(() => {
    if (done) return;
    done = true;
    onReveal(now());
  }, delayMs);
  return () => {
    done = true;
    clearTimer(handle);
  };
}
