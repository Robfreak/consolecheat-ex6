import type { Step } from "./types.ts";

export type BuiltinId = "hadouken" | "shoryuken" | "tatsu" | "halfcircle" | "doubleqcf" | "spin" | "chain";

export type BuiltinCombo = {
  id: BuiltinId;
  steps: readonly Step[];
};

const step = (direction: Step["direction"], button: Step["button"] = null): Step => ({ direction, button });

// Built-ins are fixed. They can be trained and they can hold best values.
// They cannot be edited or deleted. Customs live in localStorage, not here.
export const BUILTINS: readonly BuiltinCombo[] = [
  {
    id: "hadouken",
    steps: [step(2), step(3), step(6, "square")],
  },
  {
    id: "shoryuken",
    steps: [step(6), step(2), step(3, "triangle")],
  },
  {
    id: "tatsu",
    steps: [step(2), step(1), step(4, "circle")],
  },
  {
    id: "halfcircle",
    steps: [step(4), step(1), step(2), step(3), step(6, "square")],
  },
  {
    id: "doubleqcf",
    steps: [step(2), step(3), step(6), step(2), step(3), step(6, "triangle")],
  },
  {
    id: "spin",
    steps: [step(6), step(3), step(2), step(1), step(4), step(7), step(8, "cross")],
  },
  {
    id: "chain",
    steps: [step(null, "square"), step(null, "square"), step(null, "triangle"), step(null, "cross")],
  },
];

const ids = new Set<string>(BUILTINS.map((combo) => combo.id));

export function isBuiltinId(id: string): id is BuiltinId {
  return ids.has(id);
}

export function builtinById(id: string): BuiltinCombo | null {
  return BUILTINS.find((combo) => combo.id === id) ?? null;
}
