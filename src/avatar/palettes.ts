// Retro swatches. Hex values are the published system colors (PICO-8, Game Boy DMG,
// the common NES 2C02 decoding, and Philip Timmermann’s C64 Pepto palette).
// The NES row is a 16-color subset of that decoding, not the full 54.

export const paletteIds = ["pico8", "gb", "nes", "c64"] as const;

export type PaletteId = (typeof paletteIds)[number];

export type Palette = {
  id: PaletteId;
  colors: readonly string[];
};

const pico8 = [
  "#000000",
  "#1d2b53",
  "#7e2553",
  "#008751",
  "#ab5236",
  "#5f574f",
  "#c2c3c7",
  "#fff1e8",
  "#ff004d",
  "#ffa300",
  "#ffec27",
  "#00e436",
  "#29adff",
  "#83769c",
  "#ff77a8",
  "#ffccaa",
] as const;

const gameBoy = ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"] as const;

const nesLike = [
  "#000000",
  "#7c7c7c",
  "#bcbcbc",
  "#f8f8f8",
  "#0000fc",
  "#0078f8",
  "#3cbcfc",
  "#4428bc",
  "#f83800",
  "#f87858",
  "#f8b800",
  "#f878f8",
  "#00a800",
  "#00b800",
  "#a80020",
  "#503000",
] as const;

const c64 = [
  "#000000",
  "#ffffff",
  "#68372b",
  "#70a4b2",
  "#6f3d86",
  "#588d43",
  "#352879",
  "#b8c76f",
  "#6f4f25",
  "#433900",
  "#9a6759",
  "#444444",
  "#6c6c6c",
  "#9ad284",
  "#6c5eb5",
  "#959595",
] as const;

export const palettes: Record<PaletteId, readonly string[]> = {
  pico8,
  gb: gameBoy,
  nes: nesLike,
  c64,
};

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && (paletteIds as readonly string[]).includes(value);
}

export function paletteColors(id: PaletteId): readonly string[] {
  return palettes[id];
}
