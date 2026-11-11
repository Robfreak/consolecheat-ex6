// What this page stores.
//
// The draft uses localStorage key `consolecheat-avatar-v1`. The JSON shape is:
//
//   {
//     "version": 1,
//     "pixels": "<rle>",
//     "palette": "pico8" | "gb" | "nes" | "c64",
//     "color": "#rrggbb",
//     "secondary": "#rrggbb",
//     "tool": "pencil" | "eraser" | "fill" | "eyedropper",
//     "grid": true,
//     "symmetry": false,
//     "zoom": "fit" | "4" | "8" | "12",
//     "recent": ["#rrggbb"]
//   }
//
// `pixels` is a run-length encoding of the 64×64 RGBA buffer (see encodePixels):
// runs separated by commas, each run `COUNT:PAYLOAD`. PAYLOAD is `0` for a fully
// transparent pixel, or 8 hex digits RRGGBBAA. The runs cover exactly 4096 pixels.
//
// The key is written when a stroke, fill, flip, clear, import, or a setting changes.
// A missing key is not created on load. A value that does not parse, a different
// version, or a pixel string that does not cover exactly 64×64 falls back to an
// empty canvas and the default settings. It does not throw.
// **Entwurf zurücksetzen** removes only `consolecheat-avatar-v1`.
// Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`.
// This module never reads or writes the Merkliste key or the screen-test pattern key.

import { decodePixels, encodePixels, createBuffer } from "./pixels.ts";
import { isPaletteId, type PaletteId } from "./palettes.ts";

export const SAVE_KEY = "consolecheat-avatar-v1";
export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";

export const toolIds = ["pencil", "eraser", "fill", "eyedropper"] as const;
export type ToolId = (typeof toolIds)[number];

export const zoomIds = ["fit", "4", "8", "12"] as const;
export type ZoomId = (typeof zoomIds)[number];

export type AvatarSettings = {
  palette: PaletteId;
  color: string;
  secondary: string;
  tool: ToolId;
  grid: boolean;
  symmetry: boolean;
  zoom: ZoomId;
  recent: string[];
};

export type Draft = {
  pixels: Uint8ClampedArray;
  settings: AvatarSettings;
};

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const HEX = /^#[0-9a-fA-F]{6}$/;

export function defaultSettings(): AvatarSettings {
  return {
    palette: "pico8",
    color: "#ff004d",
    secondary: "#1d2b53",
    tool: "pencil",
    grid: true,
    symmetry: false,
    zoom: "fit",
    recent: [],
  };
}

export function emptyDraft(): Draft {
  return { pixels: createBuffer(), settings: defaultSettings() };
}

function isHex(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

function isTool(value: unknown): value is ToolId {
  return typeof value === "string" && (toolIds as readonly string[]).includes(value);
}

function isZoom(value: unknown): value is ZoomId {
  return typeof value === "string" && (zoomIds as readonly string[]).includes(value);
}

export function rememberColor(recent: readonly string[], color: string, limit = 8): string[] {
  const hex = color.toLowerCase();
  return [hex, ...recent.filter((item) => item !== hex)].slice(0, limit);
}

export function serializeDraft(draft: Draft): string {
  return JSON.stringify({
    version: 1,
    pixels: encodePixels(draft.pixels),
    palette: draft.settings.palette,
    color: draft.settings.color,
    secondary: draft.settings.secondary,
    tool: draft.settings.tool,
    grid: draft.settings.grid,
    symmetry: draft.settings.symmetry,
    zoom: draft.settings.zoom,
    recent: draft.settings.recent.slice(0, 8),
  });
}

/** Corrupt, foreign, or partial data becomes an empty draft. Never throws. */
export function parseDraft(raw: string | null): Draft {
  if (raw == null) return emptyDraft();
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return emptyDraft();
    const rec = data as Record<string, unknown>;
    if (rec.version !== 1 || typeof rec.pixels !== "string") return emptyDraft();
    const pixels = decodePixels(rec.pixels);
    if (!pixels) return emptyDraft();
    const defaults = defaultSettings();
    const recent = Array.isArray(rec.recent)
      ? rec.recent.filter(isHex).map((item) => item.toLowerCase()).slice(0, 8)
      : [];
    return {
      pixels,
      settings: {
        palette: isPaletteId(rec.palette) ? rec.palette : defaults.palette,
        color: isHex(rec.color) ? rec.color.toLowerCase() : defaults.color,
        secondary: isHex(rec.secondary) ? rec.secondary.toLowerCase() : defaults.secondary,
        tool: isTool(rec.tool) ? rec.tool : defaults.tool,
        grid: typeof rec.grid === "boolean" ? rec.grid : defaults.grid,
        symmetry: typeof rec.symmetry === "boolean" ? rec.symmetry : defaults.symmetry,
        zoom: isZoom(rec.zoom) ? rec.zoom : defaults.zoom,
        recent,
      },
    };
  } catch {
    return emptyDraft();
  }
}

export function loadDraft(local: StorageLike): Draft {
  try {
    return parseDraft(local.getItem(SAVE_KEY));
  } catch {
    return emptyDraft();
  }
}

export function saveDraft(local: StorageLike, draft: Draft): boolean {
  try {
    local.setItem(SAVE_KEY, serializeDraft(draft));
    return true;
  } catch {
    return false;
  }
}

/** Removes only `consolecheat-avatar-v1`. Language and theme stay. */
export function resetDraft(local: StorageLike): boolean {
  try {
    local.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}
