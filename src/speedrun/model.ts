// Speedrun timer math.
//
// The clock is a start timestamp, not a sum of ticks:
//   elapsed = now - startedAt
// while running, and
//   elapsed = pausedAt - startedAt
// while paused. A gap where nothing samples the clock (a background tab)
// still counts, because the next `now` is subtracted from the same start.
// Pause shifts `startedAt` forward on resume so the formula stays the same.
//
// Comparisons follow a LiveSplit-style reading of one run:
// - cumulative delta = this split's time minus the personal best at that split
//   (negative is ahead, positive is behind)
// - previous segment delta = the last finished segment minus that segment of the PB
// - gold = a segment strictly faster than the stored best segment
// - Sum of Best = the sum of those best segments
// - Best Possible Time = the current pace with the current segment replaced by its
//   gold when the gold is still reachable, plus the golds of the splits still ahead

export const SCHEMA = "consolecheat-speedrun";
export const VERSION = 1;
export const SAVE_KEY = "consolecheat-speedrun-v1";

export const MAX_PROFILES = 20;
export const MAX_SPLITS = 64;
export const MAX_LABEL = 80;
export const MAX_ATTEMPTS = 1_000_000;
export const MAX_MS = 1000 * 60 * 60 * 99;

export type Phase = "idle" | "running" | "paused" | "finished";

export type SplitDef = {
  id: string;
  name: string;
};

export type Profile = {
  id: string;
  game: string;
  category: string;
  attempts: number;
  splits: SplitDef[];
  /** Cumulative personal-best times in ms, one per split. Null when there is no complete PB. */
  pb: number[] | null;
  /** Best segment (gold) in ms. Null means that segment has never been timed. */
  bestSegments: (number | null)[];
  splitsVersion: number;
};

export type Completed = number | "skip";

export type Run = {
  phase: Phase;
  /** performance.now() value at the start, shifted forward by time spent paused. */
  startedAt: number | null;
  /** performance.now() value when the current pause began. */
  pausedAt: number | null;
  completed: Completed[];
  pbSaved: boolean;
  pbDeclined: boolean;
  /** Best segments as they were when the attempt started. Gold badges compare to this. */
  goldSnapshot: (number | null)[] | null;
  /** Personal best as it was when the attempt started. */
  pbSnapshot: number[] | null;
};

export type Store = {
  schema: typeof SCHEMA;
  version: typeof VERSION;
  activeProfileId: string;
  profiles: Profile[];
};

export function createId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}-${uuid}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function cleanLabel(value: unknown, max = MAX_LABEL): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > max) return null;
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return null;
  return trimmed;
}

export function createDefaultStore(): Store {
  const profile: Profile = {
    id: "profile-default",
    game: "Beispielspiel",
    category: "Any%",
    attempts: 0,
    splits: [
      { id: "split-intro", name: "Intro" },
      { id: "split-boss", name: "Boss" },
      { id: "split-goal", name: "Ziel" },
    ],
    pb: null,
    bestSegments: [null, null, null],
    splitsVersion: 1,
  };
  return {
    schema: SCHEMA,
    version: VERSION,
    activeProfileId: profile.id,
    profiles: [profile],
  };
}

export function freshRun(): Run {
  return {
    phase: "idle",
    startedAt: null,
    pausedAt: null,
    completed: [],
    pbSaved: false,
    pbDeclined: false,
    goldSnapshot: null,
    pbSnapshot: null,
  };
}

export function activeProfile(store: Store): Profile {
  return store.profiles.find((profile) => profile.id === store.activeProfileId) ?? store.profiles[0]!;
}

export function withActive(store: Store, profile: Profile): Store {
  return {
    ...store,
    profiles: store.profiles.map((item) => (item.id === profile.id ? profile : item)),
  };
}

export function cloneProfile(profile: Profile): Profile {
  return {
    ...profile,
    splits: profile.splits.map((split) => ({ ...split })),
    pb: profile.pb ? profile.pb.slice() : null,
    bestSegments: profile.bestSegments.slice(),
  };
}

export function elapsedMs(run: Run, now: number): number {
  if (run.startedAt == null) return 0;
  if (run.phase === "paused" && run.pausedAt != null) return nonNegative(run.pausedAt - run.startedAt);
  if (run.phase === "running") return nonNegative(now - run.startedAt);
  if (run.phase === "finished") return finalTime(run) ?? 0;
  return 0;
}

export function finalTime(run: Run): number | null {
  for (let index = run.completed.length - 1; index >= 0; index -= 1) {
    const time = run.completed[index];
    if (typeof time === "number") return time;
  }
  return null;
}

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function formatClock(ms: number): string {
  const safe = Number.isFinite(ms) ? Math.max(0, Math.floor(ms)) : 0;
  const totalCs = Math.floor(safe / 10);
  const hundredths = totalCs % 100;
  const totalSeconds = Math.floor(totalCs / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  const ss = String(seconds).padStart(2, "0");
  const cc = String(hundredths).padStart(2, "0");
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${ss}.${cc}`;
  return `${totalMinutes}:${ss}.${cc}`;
}

export function formatDelta(ms: number): string {
  if (!Number.isFinite(ms)) return "0.00";
  const sign = ms < 0 ? "−" : ms > 0 ? "+" : "";
  const magnitude = formatDeltaMagnitude(Math.abs(ms));
  return `${sign}${magnitude}`;
}

function formatDeltaMagnitude(ms: number): string {
  const totalCs = Math.floor(ms / 10);
  const hundredths = totalCs % 100;
  const totalSeconds = Math.floor(totalCs / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  const cc = String(hundredths).padStart(2, "0");
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${String(mins).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${cc}`;
  }
  if (minutes > 0) return `${minutes}:${String(seconds).padStart(2, "0")}.${cc}`;
  return `${seconds}.${cc}`;
}

export function segmentTime(completed: readonly Completed[], index: number): number | null {
  const current = completed[index];
  if (typeof current !== "number") return null;
  if (index === 0) return current;
  const previous = completed[index - 1];
  if (typeof previous !== "number") return null;
  return current - previous;
}

export function pbSegment(pb: readonly number[] | null, index: number): number | null {
  if (!pb || index < 0 || index >= pb.length) return null;
  const current = pb[index];
  if (typeof current !== "number") return null;
  const previous = index === 0 ? 0 : pb[index - 1];
  if (typeof previous !== "number") return null;
  return current - previous;
}

export function comparisonPb(run: Run, profile: Profile): number[] | null {
  if (run.phase === "idle") return profile.pb;
  return run.pbSnapshot;
}

export function comparisonGolds(run: Run, profile: Profile): (number | null)[] {
  if (run.goldSnapshot) return run.goldSnapshot;
  return profile.bestSegments;
}

export function cumulativeDelta(
  pb: readonly number[] | null,
  completed: readonly Completed[],
  index: number,
  liveElapsed: number | null,
): number | null {
  if (!pb || index < 0 || index >= pb.length) return null;
  const pbTime = pb[index];
  if (typeof pbTime !== "number") return null;
  if (index < completed.length) {
    const time = completed[index];
    if (typeof time !== "number") return null;
    return time - pbTime;
  }
  if (liveElapsed == null || index !== completed.length) return null;
  return liveElapsed - pbTime;
}

export function previousSegmentDelta(profile: Profile, run: Run): number | null {
  const pb = comparisonPb(run, profile);
  for (let index = run.completed.length - 1; index >= 0; index -= 1) {
    const segment = segmentTime(run.completed, index);
    const comparison = pbSegment(pb, index);
    if (segment == null || comparison == null) continue;
    return segment - comparison;
  }
  return null;
}

export function isNewGold(golds: readonly (number | null)[], completed: readonly Completed[], index: number): boolean {
  const segment = segmentTime(completed, index);
  if (segment == null) return false;
  const gold = golds[index];
  return gold == null || segment < gold;
}

export function sumOfBest(golds: readonly (number | null)[]): number | null {
  if (golds.length === 0) return 0;
  let sum = 0;
  for (const gold of golds) {
    if (gold == null) return null;
    sum += gold;
  }
  return sum;
}

export function bestPossibleTime(profile: Profile, run: Run, now: number): number | null {
  const golds = comparisonGolds(run, profile);
  const count = profile.splits.length;
  if (count === 0 || golds.length !== count) return null;
  if (run.phase === "idle") return sumOfBest(golds);
  if (run.phase === "finished") return finalTime(run);

  const index = run.completed.length;
  if (index >= count) return null;
  const elapsed = elapsedMs(run, now);
  const previousClean = index === 0 || typeof run.completed[index - 1] === "number";
  const currentGold = golds[index];
  let base = elapsed;
  if (previousClean) {
    if (currentGold == null) return null;
    const previous = index === 0 ? 0 : (run.completed[index - 1] as number);
    if (elapsed - previous < currentGold) base = previous + currentGold;
  }
  for (let ahead = index + 1; ahead < count; ahead += 1) {
    const gold = golds[ahead];
    if (gold == null) return null;
    base += gold;
  }
  return base;
}

export function isPbCandidate(profile: Profile, run: Run): boolean {
  if (run.phase !== "finished" || run.pbSaved) return false;
  if (profile.splits.length === 0 || run.completed.length !== profile.splits.length) return false;
  if (!run.completed.every((item) => typeof item === "number")) return false;
  const final = run.completed[run.completed.length - 1] as number;
  const pb = run.pbSnapshot;
  if (!pb) return true;
  const previous = pb[pb.length - 1];
  return typeof previous === "number" && final < previous;
}

export function hasPendingGolds(profile: Profile, run: Run): boolean {
  if (run.phase !== "running" && run.phase !== "paused") return false;
  const golds = comparisonGolds(run, profile);
  return run.completed.some((_, index) => isNewGold(golds, run.completed, index));
}

export function needsResetConfirm(run: Run, profile: Profile): boolean {
  if (run.phase === "running" || run.phase === "paused") return true;
  if (hasPendingGolds(profile, run)) return true;
  if (isPbCandidate(profile, run) && !run.pbDeclined) return true;
  return false;
}

export function resetKind(run: Run, profile: Profile): "gold" | "mid" | "pb" | null {
  if (!needsResetConfirm(run, profile)) return null;
  if (hasPendingGolds(profile, run)) return "gold";
  if (run.phase === "running" || run.phase === "paused") return "mid";
  return "pb";
}
