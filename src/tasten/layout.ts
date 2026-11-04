// Static button map for DualShock 4 and DualSense.
// This module does not read a controller and does not touch storage.

export const layouts = ["ds4", "dualsense"] as const;

export type LayoutId = (typeof layouts)[number];

export const controlOrder = [
  "l2",
  "r2",
  "l1",
  "r1",
  "share",
  "create",
  "touchpad",
  "options",
  "dpad",
  "triangle",
  "square",
  "circle",
  "cross",
  "lstick",
  "ps",
  "mute",
  "rstick",
] as const;

export type ControlId = (typeof controlOrder)[number];

export type ControlKind = "shoulder" | "face" | "stick" | "dpad" | "center" | "pad" | "round" | "options";

const both = ["ds4", "dualsense"] as const satisfies readonly LayoutId[];

export const controlLayouts: Record<ControlId, readonly LayoutId[]> = {
  l2: both,
  r2: both,
  l1: both,
  r1: both,
  share: ["ds4"],
  create: ["dualsense"],
  touchpad: both,
  options: both,
  dpad: both,
  triangle: both,
  square: both,
  circle: both,
  cross: both,
  lstick: both,
  ps: both,
  mute: ["dualsense"],
  rstick: both,
};

export const controlKind: Record<ControlId, ControlKind> = {
  l2: "shoulder",
  r2: "shoulder",
  l1: "shoulder",
  r1: "shoulder",
  share: "center",
  create: "center",
  touchpad: "pad",
  options: "options",
  dpad: "dpad",
  triangle: "face",
  square: "face",
  circle: "face",
  cross: "face",
  lstick: "stick",
  ps: "round",
  mute: "center",
  rstick: "stick",
};

/** Short mark drawn on the diagram. Symbols are the same in every language. */
export const marks: Record<ControlId, string> = {
  l2: "L2",
  r2: "R2",
  l1: "L1",
  r1: "R1",
  share: "Share",
  create: "Create",
  touchpad: "",
  options: "≡",
  dpad: "+",
  triangle: "△",
  square: "□",
  circle: "○",
  cross: "×",
  lstick: "L3",
  ps: "PS",
  mute: "Mute",
  rstick: "R3",
};

const hiddenMarks = new Set(["", "≡", "+"]);

export function controlLabel(mark: string, name: string): string {
  if (hiddenMarks.has(mark) || mark === name || name.startsWith(mark)) return name;
  return `${mark} ${name}`;
}

export function controlsFor(layout: LayoutId): ControlId[] {
  return controlOrder.filter((id) => controlLayouts[id].includes(layout));
}

export type GridSlot = { column: string; row: string };

const slots: Record<Exclude<ControlId, "ps" | "triangle" | "square" | "circle" | "cross">, GridSlot> = {
  l2: { column: "1 / 3", row: "1" },
  r2: { column: "7 / 9", row: "1" },
  l1: { column: "1 / 3", row: "2" },
  r1: { column: "7 / 9", row: "2" },
  share: { column: "1 / 3", row: "3" },
  create: { column: "1 / 3", row: "3" },
  touchpad: { column: "3 / 7", row: "3" },
  options: { column: "7 / 9", row: "3" },
  dpad: { column: "1 / 4", row: "4" },
  lstick: { column: "1 / 3", row: "5" },
  mute: { column: "5 / 7", row: "5" },
  rstick: { column: "7 / 9", row: "5" },
};

const faceSlots: Record<"triangle" | "square" | "circle" | "cross", GridSlot> = {
  triangle: { column: "2", row: "1" },
  square: { column: "1", row: "2" },
  circle: { column: "3", row: "2" },
  cross: { column: "2", row: "3" },
};

export function slotFor(id: ControlId, layout: LayoutId): GridSlot {
  if (id === "triangle" || id === "square" || id === "circle" || id === "cross") return faceSlots[id];
  if (id === "ps") {
    return layout === "ds4" ? { column: "4 / 6", row: "5" } : { column: "3 / 5", row: "5" };
  }
  return slots[id];
}

export function nextLayout(current: LayoutId, key: string): LayoutId | null {
  const index = layouts.indexOf(current);
  if (key === "ArrowRight" || key === "ArrowDown") return layouts[(index + 1) % layouts.length] ?? null;
  if (key === "ArrowLeft" || key === "ArrowUp") return layouts[(index - 1 + layouts.length) % layouts.length] ?? null;
  if (key === "Home") return layouts[0] ?? null;
  if (key === "End") return layouts.at(-1) ?? null;
  return null;
}

export const CONTROLLER_TESTER_HREF = "https://robfreak.github.io/consolecheat-ex3/";
