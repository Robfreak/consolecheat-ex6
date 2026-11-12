import { decodePixels } from "../draw/buffer.ts";
import { resampleSquare } from "../draw/scale.ts";

/** Pixel-Avatar-Studio draft. This module only reads it. */
export const AVATAR_KEY = "consolecheat-avatar-v1";
export const AVATAR_SIZE = 64;

export type AvatarImport =
  | { ok: true; pixels: Uint8ClampedArray; resampled: boolean }
  | { ok: false; reason: "missing" | "corrupt" };

export type ReadOnlyStore = {
  getItem(key: string): string | null;
};

export function pixelsFromAvatarDraft(raw: string | null, dstSize: number): AvatarImport {
  if (raw == null) return { ok: false, reason: "missing" };
  if (!Number.isInteger(dstSize) || dstSize < 1) return { ok: false, reason: "corrupt" };
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return { ok: false, reason: "corrupt" };
    const rec = data as Record<string, unknown>;
    if (rec.version !== 1 || typeof rec.pixels !== "string") return { ok: false, reason: "corrupt" };
    const pixels = decodePixels(AVATAR_SIZE, rec.pixels);
    if (!pixels) return { ok: false, reason: "corrupt" };
    if (dstSize === AVATAR_SIZE) return { ok: true, pixels, resampled: false };
    const resized = resampleSquare(pixels, AVATAR_SIZE, dstSize);
    if (!resized) return { ok: false, reason: "corrupt" };
    return { ok: true, pixels: resized, resampled: true };
  } catch {
    return { ok: false, reason: "corrupt" };
  }
}

/** Reads `consolecheat-avatar-v1` and never writes or deletes it. */
export function readAvatarDraft(local: ReadOnlyStore, dstSize: number): AvatarImport {
  try {
    return pixelsFromAvatarDraft(local.getItem(AVATAR_KEY), dstSize);
  } catch {
    return { ok: false, reason: "corrupt" };
  }
}
