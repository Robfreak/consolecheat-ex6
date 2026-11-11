// Custom combos are created here. Built-ins are refused by delete and update.

import { isBuiltinId } from "./combos.ts";
import { emptyBest, emptyStats, type BestRecord, type Stats } from "./stats.ts";
import { MAX_CUSTOMS, MAX_NAME, MAX_STEPS, WINDOW_MAX, WINDOW_MIN, isStep, type Step } from "./types.ts";

export type CustomCombo = {
  id: string;
  name: string;
  steps: Step[];
  window: number | null;
};

export type SaveFile = {
  version: 1;
  window: number;
  layout: "jkli" | "uijk";
  customs: CustomCombo[];
  bests: Record<string, BestRecord>;
  stats: Record<string, Stats>;
};

export type Draft = {
  name: string;
  steps: readonly Step[];
  window: number | null;
};

export type DraftIssue = "name" | "steps" | "window" | "full" | "id";

const CUSTOM_ID = /^c[a-z0-9]{8}$/;

export function createId(random: () => number = Math.random): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let index = 0; index < 8; index += 1) {
    id += alphabet[Math.floor(random() * alphabet.length)] ?? "a";
  }
  return id;
}

export function draftIssue(draft: Draft, file: SaveFile, ignoreId?: string): DraftIssue | null {
  const name = draft.name.trim();
  if (name.length < 1 || name.length > MAX_NAME) return "name";
  if (draft.steps.length < 1 || draft.steps.length > MAX_STEPS) return "steps";
  if (draft.steps.some((step) => !isStep(step))) return "steps";
  if (draft.window != null && (!Number.isInteger(draft.window) || draft.window < WINDOW_MIN || draft.window > WINDOW_MAX)) {
    return "window";
  }
  const others = file.customs.filter((combo) => combo.id !== ignoreId);
  if (!ignoreId && others.length >= MAX_CUSTOMS) return "full";
  return null;
}

export function addCustom(file: SaveFile, draft: Draft, id: string): { ok: true; file: SaveFile } | { ok: false; reason: DraftIssue } {
  if (!CUSTOM_ID.test(id) || isBuiltinId(id) || file.customs.some((combo) => combo.id === id)) {
    return { ok: false, reason: "id" };
  }
  const issue = draftIssue(draft, file);
  if (issue) return { ok: false, reason: issue };
  const combo: CustomCombo = {
    id,
    name: draft.name.trim(),
    steps: draft.steps.map((step) => ({ direction: step.direction, button: step.button })),
    window: draft.window,
  };
  return { ok: true, file: { ...file, customs: [...file.customs, combo] } };
}

export function updateCustom(
  file: SaveFile,
  id: string,
  draft: Draft,
): { ok: true; file: SaveFile } | { ok: false; reason: DraftIssue | "builtin" | "missing" } {
  if (isBuiltinId(id)) return { ok: false, reason: "builtin" };
  const index = file.customs.findIndex((combo) => combo.id === id);
  if (index < 0) return { ok: false, reason: "missing" };
  const issue = draftIssue(draft, file, id);
  if (issue) return { ok: false, reason: issue };
  const customs = file.customs.slice();
  customs[index] = {
    id,
    name: draft.name.trim(),
    steps: draft.steps.map((step) => ({ direction: step.direction, button: step.button })),
    window: draft.window,
  };
  return { ok: true, file: { ...file, customs } };
}

export function deleteCustom(
  file: SaveFile,
  id: string,
): { ok: true; file: SaveFile } | { ok: false; reason: "builtin" | "missing" } {
  if (isBuiltinId(id)) return { ok: false, reason: "builtin" };
  if (!file.customs.some((combo) => combo.id === id)) return { ok: false, reason: "missing" };
  const bests = { ...file.bests };
  const stats = { ...file.stats };
  delete bests[id];
  delete stats[id];
  return { ok: true, file: { ...file, customs: file.customs.filter((combo) => combo.id !== id), bests, stats } };
}

export function readStats(file: SaveFile, id: string): Stats {
  return file.stats[id] ?? emptyStats();
}

export function readBest(file: SaveFile, id: string): BestRecord {
  return file.bests[id] ?? emptyBest();
}
