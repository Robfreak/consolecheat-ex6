import type { PaletteId } from "../draw/palettes.ts";
import { createBuffer } from "../draw/buffer.ts";

export const CANVAS_SIZES = [16, 32, 64] as const;
export type CanvasSize = (typeof CANVAS_SIZES)[number];
export const DEFAULT_SIZE: CanvasSize = 32;
export const MAX_FRAMES = 64;
export const DEFAULT_FPS = 8;
export const MIN_FPS = 1;
export const MAX_FPS = 30;

export const toolIds = ["pencil", "eraser", "fill", "eyedropper"] as const;
export type ToolId = (typeof toolIds)[number];

export const playModes = ["loop", "pingpong"] as const;
export type PlayMode = (typeof playModes)[number];

export const sheetLayouts = ["strip", "grid"] as const;
export type SheetLayout = (typeof sheetLayouts)[number];

export const upscaleFactors = [1, 2, 4, 8] as const;
export type Upscale = (typeof upscaleFactors)[number];

export function isCanvasSize(value: unknown): value is CanvasSize {
  return typeof value === "number" && (CANVAS_SIZES as readonly number[]).includes(value);
}

export function isToolId(value: unknown): value is ToolId {
  return typeof value === "string" && (toolIds as readonly string[]).includes(value);
}

export function isPlayMode(value: unknown): value is PlayMode {
  return value === "loop" || value === "pingpong";
}

export function isSheetLayout(value: unknown): value is SheetLayout {
  return value === "strip" || value === "grid";
}

export function isUpscale(value: unknown): value is Upscale {
  return typeof value === "number" && (upscaleFactors as readonly number[]).includes(value);
}

export function clampFps(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_FPS;
  return Math.min(MAX_FPS, Math.max(MIN_FPS, Math.round(value)));
}

export function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) return 0.35;
  return Math.min(0.8, Math.max(0.1, value));
}

export function clampColumns(value: number, frameCount = MAX_FRAMES): number {
  if (!Number.isFinite(value)) return 4;
  const cap = Math.max(1, Math.min(MAX_FRAMES, Math.floor(frameCount) || 1));
  return Math.min(cap, Math.max(1, Math.round(value)));
}

export type SpriteSettings = {
  palette: PaletteId;
  color: string;
  secondary: string;
  tool: ToolId;
  grid: boolean;
  fps: number;
  mode: PlayMode;
  onion: boolean;
  onionNext: boolean;
  onionOpacity: number;
  sheetLayout: SheetLayout;
  columns: number;
  upscale: Upscale;
  withJson: boolean;
  recent: string[];
};

/** Pixels, canvas size, and the selected frame. Undo stores this, not the tool settings. */
export type FrameSnapshot = {
  size: CanvasSize;
  frames: Uint8ClampedArray[];
  index: number;
};

export type SpriteDoc = FrameSnapshot & {
  settings: SpriteSettings;
};

export function defaultSettings(): SpriteSettings {
  return {
    palette: "pico8",
    color: "#ff004d",
    secondary: "#1d2b53",
    tool: "pencil",
    grid: true,
    fps: DEFAULT_FPS,
    mode: "loop",
    onion: false,
    onionNext: false,
    onionOpacity: 0.35,
    sheetLayout: "strip",
    columns: 4,
    upscale: 1,
    withJson: false,
    recent: [],
  };
}

export function emptyFrame(size: CanvasSize): Uint8ClampedArray {
  return createBuffer(size);
}

export function emptySnapshot(size: CanvasSize = DEFAULT_SIZE): FrameSnapshot {
  return { size, frames: [emptyFrame(size)], index: 0 };
}

export function emptyDoc(size: CanvasSize = DEFAULT_SIZE): SpriteDoc {
  return { ...emptySnapshot(size), settings: defaultSettings() };
}

export function cloneFrame(frame: Uint8ClampedArray): Uint8ClampedArray {
  return new Uint8ClampedArray(frame);
}

export function cloneSnapshot(snapshot: FrameSnapshot): FrameSnapshot {
  return {
    size: snapshot.size,
    index: snapshot.index,
    frames: snapshot.frames.map((frame) => cloneFrame(frame)),
  };
}
