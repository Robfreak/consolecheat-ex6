// Screen-test patterns. This module has no network and no storage.
// Solid fields, color gradients, dead-pixel grids, black-level steps,
// motion, and a sharpness sample are all described here.

export const PATTERN_IDS = [
  "black",
  "white",
  "red",
  "green",
  "blue",
  "gray",
  "near-black",
  "near-white",
  "gradient-h",
  "gradient-v",
  "checker",
  "pixels",
  "motion",
  "scroll",
  "sharpness",
] as const;

export type PatternId = (typeof PATTERN_IDS)[number];

export const COLOR_STOPS = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"] as const;

export const SHARPNESS = {
  de: "Franz jagt im komplett verwahrlosten Taxi quer durch Bayern.",
  en: "The quick brown fox jumps over the lazy dog.",
  glyphs: "Il1| O0Q oO8B HAMBURG",
  sizes: [12, 16, 21, 32, 48, 72] as const,
};

const PATTERN_ID_SET = new Set<string>(PATTERN_IDS);

export function isPatternId(value: string | null): value is PatternId {
  return value !== null && PATTERN_ID_SET.has(value);
}

type Band = { color: string; label: string };

export type Pattern =
  | { id: "black" | "white" | "red" | "green" | "blue" | "gray"; kind: "solid"; color: string; number: string }
  | { id: "near-black" | "near-white"; kind: "bands"; number: string; ink: string; bands: readonly Band[] }
  | { id: "gradient-h" | "gradient-v"; kind: "gradient"; number: string; direction: "to right" | "to bottom" }
  | { id: "checker"; kind: "checker"; number: null; size: number }
  | { id: "pixels"; kind: "pixels"; number: null }
  | { id: "motion" | "scroll"; kind: "motion"; number: null; motion: "bar" | "scroll" }
  | { id: "sharpness"; kind: "sharpness"; number: null };

const nearBlack: readonly Band[] = [
  { color: "#000000", label: "#000000" },
  { color: "#010101", label: "#010101" },
  { color: "#050505", label: "#050505" },
  { color: "#0a0a0a", label: "#0A0A0A" },
  { color: "#141414", label: "#141414" },
];

const nearWhite: readonly Band[] = [
  { color: "#ffffff", label: "#FFFFFF" },
  { color: "#f7f7f7", label: "#F7F7F7" },
  { color: "#f0f0f0", label: "#F0F0F0" },
  { color: "#e6e6e6", label: "#E6E6E6" },
  { color: "#dcdcdc", label: "#DCDCDC" },
];

export const patterns: readonly Pattern[] = [
  { id: "black", kind: "solid", color: "#000000", number: "1" },
  { id: "white", kind: "solid", color: "#ffffff", number: "2" },
  { id: "red", kind: "solid", color: "#ff0000", number: "3" },
  { id: "green", kind: "solid", color: "#00ff00", number: "4" },
  { id: "blue", kind: "solid", color: "#0000ff", number: "5" },
  { id: "gray", kind: "solid", color: "#808080", number: "6" },
  { id: "near-black", kind: "bands", number: "7", ink: "#8d8d8d", bands: nearBlack },
  { id: "near-white", kind: "bands", number: "8", ink: "#1a1a1a", bands: nearWhite },
  { id: "gradient-h", kind: "gradient", number: "9", direction: "to right" },
  { id: "gradient-v", kind: "gradient", number: "0", direction: "to bottom" },
  { id: "checker", kind: "checker", number: null, size: 64 },
  { id: "pixels", kind: "pixels", number: null },
  { id: "motion", kind: "motion", number: null, motion: "bar" },
  { id: "scroll", kind: "motion", number: null, motion: "scroll" },
  { id: "sharpness", kind: "sharpness", number: null },
];

export function patternById(id: string): Pattern | null {
  return patterns.find((pattern) => pattern.id === id) ?? null;
}

export function patternIndex(id: PatternId): number {
  return patterns.findIndex((pattern) => pattern.id === id);
}

export function gradientImage(direction: "to right" | "to bottom"): string {
  return `linear-gradient(${direction}, ${COLOR_STOPS.join(", ")})`;
}

export function checkerStyle(size: number): Record<string, string> {
  const half = size / 2;
  return {
    backgroundColor: "#ffffff",
    backgroundImage: [
      "linear-gradient(45deg, #000000 25%, transparent 25%)",
      "linear-gradient(-45deg, #000000 25%, transparent 25%)",
      "linear-gradient(45deg, transparent 75%, #000000 75%)",
      "linear-gradient(-45deg, transparent 75%, #000000 75%)",
    ].join(", "),
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `0 0, 0 ${half}px, ${half}px ${-half}px, ${-half}px 0`,
  };
}

export function previewStyle(pattern: Pattern): Record<string, string> {
  if (pattern.kind === "solid") return { backgroundColor: pattern.color };
  if (pattern.kind === "bands") {
    return { backgroundImage: `linear-gradient(to right, ${pattern.bands.map((band) => band.color).join(", ")})` };
  }
  if (pattern.kind === "gradient") return { backgroundImage: gradientImage(pattern.direction) };
  if (pattern.kind === "checker") return checkerStyle(16);
  if (pattern.kind === "pixels") return checkerStyle(4);
  if (pattern.kind === "motion" && pattern.motion === "bar") {
    return {
      backgroundColor: "#000000",
      backgroundImage: "linear-gradient(to right, transparent 42%, #ffffff 42%, #ffffff 58%, transparent 58%)",
    };
  }
  if (pattern.kind === "motion") {
    return { backgroundImage: "repeating-linear-gradient(90deg, #000000 0 6px, #ffffff 6px 12px)" };
  }
  return { backgroundImage: "linear-gradient(to right, #000000 50%, #ffffff 50%)" };
}

/** True when the device pixel at (x, y) is white in the dead-pixel grid. */
export function devicePixelOn(x: number, y: number): boolean {
  return ((x + y) & 1) === 0;
}

export function checkerTileRgba(): Uint8ClampedArray {
  const data = new Uint8ClampedArray(16);
  for (let y = 0; y < 2; y += 1) {
    for (let x = 0; x < 2; x += 1) {
      const value = devicePixelOn(x, y) ? 255 : 0;
      const index = (y * 2 + x) * 4;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
  return data;
}
