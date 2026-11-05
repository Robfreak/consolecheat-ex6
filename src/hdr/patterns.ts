// Brightness and HDR-helper patterns. The page paints these in the browser
// from the colors below (CSS bars and one canvas ramp). No images and no
// network. Near-black and near-white bars follow the screen-test idea, with
// steps chosen for this page: 0–5% gray, a PLUGE-style crush check, clipping
// charts, and a grayscale ramp. A normal page cannot emit a code below 0.

export const PATTERN_IDS = ["near-black", "near-white", "pluge", "black-crush", "white-clip", "gray-ramp"] as const;

export type PatternId = (typeof PATTERN_IDS)[number];

export type Step = {
  code: number;
  color: string;
  label: string;
};

export type Pattern =
  | { id: "near-black" | "near-white" | "black-crush" | "white-clip"; kind: "steps"; number: string; ink: string; steps: readonly Step[] }
  | { id: "pluge"; kind: "pluge"; number: string; field: string; reference: string; bars: readonly Step[] }
  | { id: "gray-ramp"; kind: "ramp"; number: string; ticks: readonly Step[]; patches: readonly Step[] };

const PATTERN_ID_SET = new Set<string>(PATTERN_IDS);

export function isPatternId(value: string | null): value is PatternId {
  return value !== null && PATTERN_ID_SET.has(value);
}

/** 8-bit code for a percent of full range (0–100). */
export function codeForPercent(percent: number): number {
  return Math.round((percent / 100) * 255);
}

export function grayHex(code: number): string {
  const value = Math.max(0, Math.min(255, Math.round(code)));
  const byte = value.toString(16).padStart(2, "0");
  return `#${byte}${byte}${byte}`;
}

function percentStep(percent: number): Step {
  const code = codeForPercent(percent);
  return { code, color: grayHex(code), label: `${percent}%` };
}

function codeStep(code: number): Step {
  return { code, color: grayHex(code), label: String(code) };
}

/** Code 0..255 for column x in a left-to-right ramp. Both ends are exact. */
export function rampColumnCode(x: number, width: number): number {
  if (width <= 1) return 0;
  const code = Math.round((x / (width - 1)) * 255);
  return Math.max(0, Math.min(255, code));
}

const NEAR_BLACK = [0, 1, 2, 3, 4, 5].map(percentStep);
const NEAR_WHITE = [100, 99, 98, 97, 96, 95].map(percentStep);
const CRUSH = [0, 1, 2, 4, 8, 12, 16, 20, 24].map(codeStep);
const CLIP = [235, 240, 245, 250, 252, 254, 255].map(codeStep);
const PLUGE_BARS = [0, 2, 4].map(codeStep);
const RAMP_TICKS = [0, 16, 128, 235, 255].map(codeStep);
const GRAY_PATCHES = [20, 50, 80].map(percentStep);

export const patterns: readonly Pattern[] = [
  { id: "near-black", kind: "steps", number: "1", ink: "#8d8d8d", steps: NEAR_BLACK },
  { id: "near-white", kind: "steps", number: "2", ink: "#1a1a1a", steps: NEAR_WHITE },
  { id: "pluge", kind: "pluge", number: "3", field: "#000000", reference: "#ffffff", bars: PLUGE_BARS },
  { id: "black-crush", kind: "steps", number: "4", ink: "#8d8d8d", steps: CRUSH },
  { id: "white-clip", kind: "steps", number: "5", ink: "#1a1a1a", steps: CLIP },
  { id: "gray-ramp", kind: "ramp", number: "6", ticks: RAMP_TICKS, patches: GRAY_PATCHES },
];

export function patternById(id: string): Pattern | null {
  return patterns.find((pattern) => pattern.id === id) ?? null;
}

export function patternIndex(id: PatternId): number {
  return patterns.findIndex((pattern) => pattern.id === id);
}

export function previewStyle(pattern: Pattern): Record<string, string> {
  if (pattern.kind === "steps") {
    return { backgroundImage: `linear-gradient(to right, ${pattern.steps.map((step) => step.color).join(", ")})` };
  }
  if (pattern.kind === "pluge") {
    const stops = [...pattern.bars.map((bar) => bar.color), pattern.reference];
    return { backgroundColor: pattern.field, backgroundImage: `linear-gradient(to right, ${stops.join(", ")})` };
  }
  return { backgroundImage: "linear-gradient(to right, #000000, #ffffff)" };
}
