// Split and profile editing. Structural edits are refused while the timer is
// running or paused, and while a finished run is still waiting on the PB offer.
// Adding, removing, or reordering splits clears the personal best. Gold segments
// stay with the split they belong to. A rename keeps both.

import {
  activeProfile,
  cleanLabel,
  cloneProfile,
  freshRun,
  isPbCandidate,
  MAX_PROFILES,
  MAX_SPLITS,
  withActive,
  type Profile,
  type Run,
  type Store,
} from "./model.ts";

export type EditReason = "running" | "pb-pending" | "invalid" | "missing" | "limit" | "last";

export type EditResult = { ok: true; store: Store; run: Run } | { ok: false; reason: EditReason; store: Store; run: Run };

function locked(store: Store, run: Run, profile: Profile): EditResult | null {
  if (run.phase === "running" || run.phase === "paused") return { ok: false, reason: "running", store, run };
  if (run.phase === "finished" && isPbCandidate(profile, run) && !run.pbDeclined) {
    return { ok: false, reason: "pb-pending", store, run };
  }
  return null;
}

function accepted(store: Store, run: Run, profile: Profile, structural: boolean): EditResult {
  const nextRun = structural && run.phase === "finished" ? freshRun() : run;
  return { ok: true, store: withActive(store, profile), run: nextRun };
}

export function editingLocked(store: Store, run: Run): boolean {
  return locked(store, run, activeProfile(store)) !== null;
}

export function updateProfile(store: Store, run: Run, game: string, category: string): EditResult {
  const profile = activeProfile(store);
  const block = locked(store, run, profile);
  if (block) return block;
  const nextGame = cleanLabel(game);
  const nextCategory = cleanLabel(category);
  if (!nextGame || !nextCategory) return { ok: false, reason: "invalid", store, run };
  const next = cloneProfile(profile);
  next.game = nextGame;
  next.category = nextCategory;
  return accepted(store, run, next, false);
}

export function addSplit(store: Store, run: Run, name: string, id: string): EditResult {
  const profile = activeProfile(store);
  const block = locked(store, run, profile);
  if (block) return block;
  const label = cleanLabel(name);
  const splitId = cleanLabel(id);
  if (!label || !splitId) return { ok: false, reason: "invalid", store, run };
  if (profile.splits.length >= MAX_SPLITS) return { ok: false, reason: "limit", store, run };
  if (profile.splits.some((split) => split.id === splitId)) return { ok: false, reason: "invalid", store, run };
  const next = cloneProfile(profile);
  next.splits.push({ id: splitId, name: label });
  next.bestSegments.push(null);
  next.pb = null;
  next.splitsVersion += 1;
  return accepted(store, run, next, true);
}

export function renameSplit(store: Store, run: Run, id: string, name: string): EditResult {
  const profile = activeProfile(store);
  const block = locked(store, run, profile);
  if (block) return block;
  const label = cleanLabel(name);
  if (!label) return { ok: false, reason: "invalid", store, run };
  const index = profile.splits.findIndex((split) => split.id === id);
  if (index < 0) return { ok: false, reason: "missing", store, run };
  const next = cloneProfile(profile);
  next.splits[index] = { id, name: label };
  return accepted(store, run, next, false);
}

export function moveSplit(store: Store, run: Run, id: string, direction: -1 | 1): EditResult {
  const profile = activeProfile(store);
  const block = locked(store, run, profile);
  if (block) return block;
  const index = profile.splits.findIndex((split) => split.id === id);
  const target = index + direction;
  if (index < 0) return { ok: false, reason: "missing", store, run };
  if (target < 0 || target >= profile.splits.length) return { ok: true, store, run };
  const next = cloneProfile(profile);
  const [split] = next.splits.splice(index, 1);
  const [gold] = next.bestSegments.splice(index, 1);
  next.splits.splice(target, 0, split!);
  next.bestSegments.splice(target, 0, gold ?? null);
  next.pb = null;
  next.splitsVersion += 1;
  return accepted(store, run, next, true);
}

export function deleteSplit(store: Store, run: Run, id: string): EditResult {
  const profile = activeProfile(store);
  const block = locked(store, run, profile);
  if (block) return block;
  const index = profile.splits.findIndex((split) => split.id === id);
  if (index < 0) return { ok: false, reason: "missing", store, run };
  const next = cloneProfile(profile);
  next.splits.splice(index, 1);
  next.bestSegments.splice(index, 1);
  next.pb = null;
  next.splitsVersion += 1;
  return accepted(store, run, next, true);
}

export function addProfile(store: Store, run: Run, profile: Profile): EditResult {
  const block = locked(store, run, activeProfile(store));
  if (block) return block;
  if (store.profiles.length >= MAX_PROFILES) return { ok: false, reason: "limit", store, run };
  const game = cleanLabel(profile.game);
  const category = cleanLabel(profile.category);
  const id = cleanLabel(profile.id);
  if (!game || !category || !id) return { ok: false, reason: "invalid", store, run };
  if (store.profiles.some((item) => item.id === id)) return { ok: false, reason: "invalid", store, run };
  if (profile.splits.length < 1 || profile.splits.length > MAX_SPLITS) return { ok: false, reason: "invalid", store, run };
  const splits: { id: string; name: string }[] = [];
  for (const split of profile.splits) {
    const splitId = cleanLabel(split.id);
    const name = cleanLabel(split.name);
    if (!splitId || !name || splits.some((item) => item.id === splitId)) return { ok: false, reason: "invalid", store, run };
    splits.push({ id: splitId, name });
  }
  const created: Profile = {
    id,
    game,
    category,
    attempts: 0,
    splits,
    pb: null,
    bestSegments: splits.map(() => null),
    splitsVersion: 1,
  };
  return {
    ok: true,
    store: { ...store, activeProfileId: created.id, profiles: [...store.profiles, created] },
    run: freshRun(),
  };
}

export function deleteProfile(store: Store, run: Run, id: string): EditResult {
  const block = locked(store, run, activeProfile(store));
  if (block) return block;
  if (store.profiles.length <= 1) return { ok: false, reason: "last", store, run };
  const index = store.profiles.findIndex((profile) => profile.id === id);
  if (index < 0) return { ok: false, reason: "missing", store, run };
  const profiles = store.profiles.filter((profile) => profile.id !== id);
  const activeProfileId = store.activeProfileId === id ? profiles[0]!.id : store.activeProfileId;
  return { ok: true, store: { ...store, profiles, activeProfileId }, run: freshRun() };
}

export function selectProfile(store: Store, run: Run, id: string): EditResult {
  const block = locked(store, run, activeProfile(store));
  if (block) return block;
  if (!store.profiles.some((profile) => profile.id === id)) return { ok: false, reason: "missing", store, run };
  if (store.activeProfileId === id) return { ok: true, store, run };
  return { ok: true, store: { ...store, activeProfileId: id }, run: freshRun() };
}
