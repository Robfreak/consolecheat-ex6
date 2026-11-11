// Attempt state machine. Display code calls these with a timestamp from
// performance.now(). Nothing here adds up frame deltas.

import {
  activeProfile,
  cloneProfile,
  elapsedMs,
  freshRun,
  isNewGold,
  isPbCandidate,
  segmentTime,
  withActive,
  type Completed,
  type Profile,
  type Run,
  type Store,
} from "./model.ts";

export type RunAction = "start-split" | "undo" | "skip" | "pause" | "reset" | "save-pb" | "decline-pb";

export type RunEvent =
  | { kind: "start" }
  | { kind: "split"; index: number; time: number; delta: number | null; gold: boolean }
  | { kind: "skip"; index: number }
  | { kind: "undo" }
  | { kind: "pause" }
  | { kind: "resume" }
  | { kind: "reset" }
  | { kind: "finish"; time: number; pb: boolean }
  | { kind: "save-pb" }
  | { kind: "decline-pb" };

export type RunResult = {
  store: Store;
  run: Run;
  event: RunEvent | null;
};

function same(store: Store, run: Run): RunResult {
  return { store, run, event: null };
}

function lastNumeric(completed: readonly Completed[]): number {
  for (let index = completed.length - 1; index >= 0; index -= 1) {
    const time = completed[index];
    if (typeof time === "number") return time;
  }
  return 0;
}

function commitGolds(profile: Profile, completed: readonly Completed[]): Profile {
  const best = profile.bestSegments.slice();
  for (let index = 0; index < profile.splits.length; index += 1) {
    const segment = segmentTime(completed, index);
    if (segment == null) continue;
    const gold = best[index];
    if (gold == null || segment < gold) best[index] = segment;
  }
  return { ...profile, bestSegments: best };
}

function finish(store: Store, run: Run, profile: Profile, completed: Completed[]): RunResult {
  const nextProfile = commitGolds(profile, completed);
  const nextRun: Run = { ...run, phase: "finished", pausedAt: null, completed };
  return {
    store: withActive(store, nextProfile),
    run: nextRun,
    event: { kind: "finish", time: lastNumeric(completed), pb: isPbCandidate(nextProfile, nextRun) },
  };
}

export function dispatch(store: Store, run: Run, action: RunAction, now: number): RunResult {
  const profile = activeProfile(store);
  if (action === "reset") return { store, run: freshRun(), event: { kind: "reset" } };
  if (action === "save-pb") return savePb(store, run, profile);
  if (action === "decline-pb") {
    if (!isPbCandidate(profile, run) || run.pbDeclined) return same(store, run);
    return { store, run: { ...run, pbDeclined: true }, event: { kind: "decline-pb" } };
  }
  if (action === "pause") return togglePause(store, run, now);
  if (action === "undo") return undo(store, run, profile);
  if (action === "skip") return skip(store, run, profile);
  return startOrSplit(store, run, profile, now);
}

function startOrSplit(store: Store, run: Run, profile: Profile, now: number): RunResult {
  if (run.phase === "idle") {
    if (profile.splits.length === 0) return same(store, run);
    const nextProfile = cloneProfile(profile);
    nextProfile.attempts += 1;
    return {
      store: withActive(store, nextProfile),
      run: {
        phase: "running",
        startedAt: now,
        pausedAt: null,
        completed: [],
        pbSaved: false,
        pbDeclined: false,
        goldSnapshot: profile.bestSegments.slice(),
        pbSnapshot: profile.pb ? profile.pb.slice() : null,
      },
      event: { kind: "start" },
    };
  }
  if (run.phase !== "running" || run.startedAt == null) return same(store, run);
  const index = run.completed.length;
  if (index >= profile.splits.length) return same(store, run);
  const time = Math.max(elapsedMs(run, now), lastNumeric(run.completed));
  const completed: Completed[] = [...run.completed, time];
  if (completed.length === profile.splits.length) return finish(store, run, profile, completed);
  const pb = run.pbSnapshot;
  const delta = pb && typeof pb[index] === "number" ? time - pb[index] : null;
  const gold = isNewGold(run.goldSnapshot ?? profile.bestSegments, completed, index);
  return {
    store,
    run: { ...run, completed },
    event: { kind: "split", index, time, delta, gold },
  };
}

function skip(store: Store, run: Run, profile: Profile): RunResult {
  if (run.phase !== "running") return same(store, run);
  const index = run.completed.length;
  if (index >= profile.splits.length) return same(store, run);
  const completed: Completed[] = [...run.completed, "skip"];
  if (completed.length === profile.splits.length) return finish(store, run, profile, completed);
  return { store, run: { ...run, completed }, event: { kind: "skip", index } };
}

function undo(store: Store, run: Run, profile: Profile): RunResult {
  if (run.completed.length === 0 || run.phase === "idle") return same(store, run);
  const wasFinished = run.phase === "finished";
  const completed = run.completed.slice(0, -1);
  let nextProfile = profile;
  if (wasFinished) {
    nextProfile = cloneProfile(profile);
    if (run.goldSnapshot) nextProfile.bestSegments = run.goldSnapshot.slice();
    if (run.pbSaved) nextProfile.pb = run.pbSnapshot ? run.pbSnapshot.slice() : null;
  }
  return {
    store: nextProfile === profile ? store : withActive(store, nextProfile),
    run: {
      ...run,
      completed,
      phase: wasFinished ? "running" : run.phase,
      pbSaved: wasFinished ? false : run.pbSaved,
      pbDeclined: wasFinished ? false : run.pbDeclined,
    },
    event: { kind: "undo" },
  };
}

function togglePause(store: Store, run: Run, now: number): RunResult {
  if (run.phase === "running" && run.startedAt != null) {
    return { store, run: { ...run, phase: "paused", pausedAt: now }, event: { kind: "pause" } };
  }
  if (run.phase === "paused" && run.startedAt != null && run.pausedAt != null) {
    const pausedFor = Math.max(0, now - run.pausedAt);
    return {
      store,
      run: { ...run, phase: "running", startedAt: run.startedAt + pausedFor, pausedAt: null },
      event: { kind: "resume" },
    };
  }
  return same(store, run);
}

function savePb(store: Store, run: Run, profile: Profile): RunResult {
  if (!isPbCandidate(profile, run)) return same(store, run);
  const times = run.completed.filter((item): item is number => typeof item === "number");
  if (times.length !== profile.splits.length) return same(store, run);
  const nextProfile = cloneProfile(profile);
  nextProfile.pb = times.slice();
  return {
    store: withActive(store, nextProfile),
    run: { ...run, pbSaved: true },
    event: { kind: "save-pb" },
  };
}
