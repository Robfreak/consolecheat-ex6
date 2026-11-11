// Shared tournament types. This folder does not import the Merkliste or the other tools.

export const BYE = "bye" as const;
export type Bye = typeof BYE;
export type Slot = string | Bye | null;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 16;
export const MAX_NAME = 32;
export const MAX_TITLE = 60;
export const MAX_GOALS = 99;
export const MAX_POINT = 20;

export type Mode = "ko" | "liga";

export type Player = {
  id: string;
  name: string;
};

export type Points = {
  win: number;
  draw: number;
  loss: number;
};

export const DEFAULT_POINTS: Points = { win: 3, draw: 1, loss: 0 };

export type Score = {
  home: number;
  away: number;
};

export type Scores = Record<string, Score>;

export type Phase = "setup" | "live";

export type Tournament = {
  version: 1;
  name: string;
  mode: Mode;
  doubleRound: boolean;
  points: Points;
  players: Player[];
  phase: Phase;
  order: string[];
  scores: Scores;
};

export function isGoal(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_GOALS;
}

export function parseGoals(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d{1,2}$/.test(text)) return null;
  const value = Number(text);
  return isGoal(value) ? value : null;
}

export function isScore(value: unknown): value is Score {
  if (!value || typeof value !== "object") return false;
  const score = value as Score;
  return isGoal(score.home) && isGoal(score.away);
}

export function isPointValue(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_POINT;
}

export function isPlayerId(value: unknown): value is string {
  return typeof value === "string" && /^p[a-z0-9]{8}$/.test(value);
}
