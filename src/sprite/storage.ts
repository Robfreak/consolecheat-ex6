// What this page stores.
//
// The draft uses localStorage key `consolecheat-sprite-v1`. The JSON shape is:
//
//   {
//     "version": 1,
//     "size": 16 | 32 | 64,
//     "frames": ["<rle>", "<rle>"],
//     "index": 0,
//     "palette": "pico8" | "gb" | "nes" | "c64",
//     "color": "#rrggbb",
//     "secondary": "#rrggbb",
//     "tool": "pencil" | "eraser" | "fill" | "eyedropper",
//     "grid": true,
//     "fps": 8,
//     "mode": "loop" | "pingpong",
//     "onion": false,
//     "onionNext": false,
//     "onionOpacity": 0.35,
//     "sheetLayout": "strip" | "grid",
//     "columns": 4,
//     "upscale": 1 | 2 | 4 | 8,
//     "withJson": false,
//     "recent": ["#rrggbb"]
//   }
//
// Each frame string is the same run-length encoding as the avatar studio
// (see encodePixels): runs separated by commas, each run `COUNT:PAYLOAD`.
// PAYLOAD is `0` for a fully transparent pixel, or 8 hex digits RRGGBBAA.
// The runs cover exactly size×size pixels. At most 64 frames.
//
// The key is written when a stroke, fill, frame edit, or a setting changes.
// A missing key is not created on load. A value that does not parse, a different
// version, or a frame string that does not cover the canvas falls back to one
// empty frame and the default settings. It does not throw.
// **Entwurf zurücksetzen** removes only `consolecheat-sprite-v1`.
// Language and appearance reuse `consolecheat-lang` and `consolecheat-theme`.
// The avatar draft `consolecheat-avatar-v1` is read only when you ask to import it.
// This module never reads or writes that key, the Merkliste key, or the screen-test pattern key.

import { decodePixels, encodePixels } from "../draw/buffer.ts";
import { isPaletteId, type PaletteId } from "../draw/palettes.ts";
import {
  MAX_FRAMES,
  clampColumns,
  clampFps,
  clampOpacity,
  defaultSettings,
  emptyDoc,
  isCanvasSize,
  isPlayMode,
  isSheetLayout,
  isToolId,
  isUpscale,
  type CanvasSize,
  type SpriteDoc,
  type SpriteSettings,
} from "./model.ts";

export const SAVE_KEY = "consolecheat-sprite-v1";
export const THEME_KEY = "consolecheat-theme";
export const LANG_KEY = "consolecheat-lang";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const HEX = /^#[0-9a-fA-F]{6}$/;

function isHex(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

export function rememberColor(recent: readonly string[], color: string, limit = 8): string[] {
  const hex = color.toLowerCase();
  return [hex, ...recent.filter((item) => item !== hex)].slice(0, limit);
}

export function serializeDoc(doc: SpriteDoc): string {
  const settings = doc.settings;
  return JSON.stringify({
    version: 1,
    size: doc.size,
    frames: doc.frames.map((frame) => encodePixels(doc.size, frame)),
    index: doc.index,
    palette: settings.palette,
    color: settings.color,
    secondary: settings.secondary,
    tool: settings.tool,
    grid: settings.grid,
    fps: settings.fps,
    mode: settings.mode,
    onion: settings.onion,
    onionNext: settings.onionNext,
    onionOpacity: settings.onionOpacity,
    sheetLayout: settings.sheetLayout,
    columns: settings.columns,
    upscale: settings.upscale,
    withJson: settings.withJson,
    recent: settings.recent.slice(0, 8),
  });
}

function settingsFrom(rec: Record<string, unknown>): SpriteSettings {
  const defaults = defaultSettings();
  const recent = Array.isArray(rec.recent) ? rec.recent.filter(isHex).map((item) => item.toLowerCase()).slice(0, 8) : [];
  const palette: PaletteId = isPaletteId(rec.palette) ? rec.palette : defaults.palette;
  return {
    palette,
    color: isHex(rec.color) ? rec.color.toLowerCase() : defaults.color,
    secondary: isHex(rec.secondary) ? rec.secondary.toLowerCase() : defaults.secondary,
    tool: isToolId(rec.tool) ? rec.tool : defaults.tool,
    grid: typeof rec.grid === "boolean" ? rec.grid : defaults.grid,
    fps: typeof rec.fps === "number" ? clampFps(rec.fps) : defaults.fps,
    mode: isPlayMode(rec.mode) ? rec.mode : defaults.mode,
    onion: typeof rec.onion === "boolean" ? rec.onion : defaults.onion,
    onionNext: typeof rec.onionNext === "boolean" ? rec.onionNext : defaults.onionNext,
    onionOpacity: typeof rec.onionOpacity === "number" ? clampOpacity(rec.onionOpacity) : defaults.onionOpacity,
    sheetLayout: isSheetLayout(rec.sheetLayout) ? rec.sheetLayout : defaults.sheetLayout,
    columns: typeof rec.columns === "number" ? clampColumns(rec.columns) : defaults.columns,
    upscale: isUpscale(rec.upscale) ? rec.upscale : defaults.upscale,
    withJson: typeof rec.withJson === "boolean" ? rec.withJson : defaults.withJson,
    recent,
  };
}

/** Corrupt, foreign, or partial data becomes an empty draft. Never throws. */
export function parseDoc(raw: string | null): SpriteDoc {
  if (raw == null) return emptyDoc();
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return emptyDoc();
    const rec = data as Record<string, unknown>;
    if (rec.version !== 1 || !isCanvasSize(rec.size) || !Array.isArray(rec.frames)) return emptyDoc();
    const size: CanvasSize = rec.size;
    if (rec.frames.length < 1 || rec.frames.length > MAX_FRAMES) return emptyDoc();
    const frames: Uint8ClampedArray[] = [];
    for (const item of rec.frames) {
      if (typeof item !== "string") return emptyDoc();
      const pixels = decodePixels(size, item);
      if (!pixels) return emptyDoc();
      frames.push(pixels);
    }
    const index = typeof rec.index === "number" && Number.isInteger(rec.index) ? rec.index : 0;
    return {
      size,
      frames,
      index: Math.min(frames.length - 1, Math.max(0, index)),
      settings: settingsFrom(rec),
    };
  } catch {
    return emptyDoc();
  }
}

export function loadDoc(local: StorageLike): SpriteDoc {
  try {
    return parseDoc(local.getItem(SAVE_KEY));
  } catch {
    return emptyDoc();
  }
}

export function saveDoc(local: StorageLike, doc: SpriteDoc): boolean {
  try {
    local.setItem(SAVE_KEY, serializeDoc(doc));
    return true;
  } catch {
    return false;
  }
}

/** Removes only `consolecheat-sprite-v1`. Language, theme, and the avatar draft stay. */
export function resetDoc(local: StorageLike): boolean {
  try {
    local.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}
