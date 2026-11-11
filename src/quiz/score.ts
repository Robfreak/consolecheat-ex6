import type { QuestionKind } from "./questions.ts";

export type QuizMode = "classic" | "endless";

export const CLASSIC_LENGTH = 10;
export const ENDLESS_LIVES = 3;
export const TIMER_SECONDS = 15;

export type RunState = {
  mode: QuizMode;
  score: number;
  streak: number;
  bestStreak: number;
  lives: number;
  answered: number;
  correct: number;
};

export function newRun(mode: QuizMode): RunState {
  return {
    mode,
    score: 0,
    streak: 0,
    bestStreak: 0,
    lives: ENDLESS_LIVES,
    answered: 0,
    correct: 0,
  };
}

export function scoreGain(kind: QuestionKind, streak: number, timer: boolean, secondsLeft: number): number {
  const base = kind === "month" ? 150 : 100;
  const streakBonus = Math.max(0, streak - 1) * 25;
  if (!timer) return base + streakBonus;
  const clamped = Math.min(TIMER_SECONDS, Math.max(0, secondsLeft));
  const timeBonus = Math.round((clamped / TIMER_SECONDS) * 50);
  return base + streakBonus + timeBonus;
}

export function applyAnswer(
  state: RunState,
  input: { correct: boolean; kind: QuestionKind; timer: boolean; secondsLeft: number },
): { state: RunState; gained: number; ended: boolean } {
  const answered = state.answered + 1;
  if (!input.correct) {
    const lives = state.mode === "endless" ? state.lives - 1 : state.lives;
    const next: RunState = { ...state, answered, streak: 0, lives };
    const ended = state.mode === "classic" ? answered >= CLASSIC_LENGTH : lives <= 0;
    return { state: next, gained: 0, ended };
  }
  const streak = state.streak + 1;
  const gained = scoreGain(input.kind, streak, input.timer, input.secondsLeft);
  const next: RunState = {
    ...state,
    answered,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    score: state.score + gained,
    correct: state.correct + 1,
  };
  const ended = state.mode === "classic" ? answered >= CLASSIC_LENGTH : false;
  return { state: next, gained, ended };
}
