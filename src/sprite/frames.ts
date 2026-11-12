import { buffersEqual } from "../draw/buffer.ts";
import { resampleSquare } from "../draw/scale.ts";
import {
  MAX_FRAMES,
  cloneFrame,
  cloneSnapshot,
  emptyFrame,
  isCanvasSize,
  type CanvasSize,
  type FrameSnapshot,
} from "./model.ts";

export type FrameOp = { snapshot: FrameSnapshot; changed: boolean; reason?: "min" | "cap" };

function same(snapshot: FrameSnapshot, reason?: "min" | "cap"): FrameOp {
  return { snapshot, changed: false, ...(reason ? { reason } : {}) };
}

export function addEmptyFrame(snapshot: FrameSnapshot): FrameOp {
  if (snapshot.frames.length >= MAX_FRAMES) return same(snapshot, "cap");
  const frames = snapshot.frames.map(cloneFrame);
  const insert = snapshot.index + 1;
  frames.splice(insert, 0, emptyFrame(snapshot.size));
  return { snapshot: { size: snapshot.size, frames, index: insert }, changed: true };
}

export function duplicateFrame(snapshot: FrameSnapshot): FrameOp {
  if (snapshot.frames.length >= MAX_FRAMES) return same(snapshot, "cap");
  const current = snapshot.frames[snapshot.index];
  if (!current) return same(snapshot);
  const frames = snapshot.frames.map(cloneFrame);
  const insert = snapshot.index + 1;
  frames.splice(insert, 0, cloneFrame(current));
  return { snapshot: { size: snapshot.size, frames, index: insert }, changed: true };
}

export function deleteFrame(snapshot: FrameSnapshot): FrameOp {
  if (snapshot.frames.length <= 1) return same(snapshot, "min");
  const frames = snapshot.frames.map(cloneFrame);
  frames.splice(snapshot.index, 1);
  const index = Math.min(snapshot.index, frames.length - 1);
  return { snapshot: { size: snapshot.size, frames, index }, changed: true };
}

/** Move the frame at `from` so it lands at index `to`. The selection follows that frame. */
export function moveFrame(snapshot: FrameSnapshot, from: number, to: number): FrameOp {
  const count = snapshot.frames.length;
  if (!Number.isInteger(from) || !Number.isInteger(to)) return same(snapshot);
  if (from < 0 || to < 0 || from >= count || to >= count || from === to) return same(snapshot);
  const frames = snapshot.frames.map(cloneFrame);
  const [item] = frames.splice(from, 1);
  if (!item) return same(snapshot);
  frames.splice(to, 0, item);
  let index = snapshot.index;
  if (index === from) index = to;
  else if (from < index && to >= index) index -= 1;
  else if (from > index && to <= index) index += 1;
  return { snapshot: { size: snapshot.size, frames, index }, changed: true };
}

export function moveCurrent(snapshot: FrameSnapshot, direction: -1 | 1): FrameOp {
  return moveFrame(snapshot, snapshot.index, snapshot.index + direction);
}

export function selectFrame(snapshot: FrameSnapshot, index: number): FrameSnapshot {
  if (!Number.isInteger(index)) return snapshot;
  const next = Math.min(snapshot.frames.length - 1, Math.max(0, index));
  if (next === snapshot.index) return snapshot;
  return { size: snapshot.size, frames: snapshot.frames, index: next };
}

export function replaceCurrent(snapshot: FrameSnapshot, pixels: Uint8ClampedArray): FrameSnapshot | null {
  const need = snapshot.size * snapshot.size * 4;
  if (pixels.length < need) return null;
  const frames = snapshot.frames.map(cloneFrame);
  const current = frames[snapshot.index];
  if (!current) return null;
  const next = cloneFrame(pixels.subarray(0, need) as Uint8ClampedArray);
  if (buffersEqual(current, next)) return snapshot;
  frames[snapshot.index] = next;
  return { size: snapshot.size, frames, index: snapshot.index };
}

export function replaceAll(snapshot: FrameSnapshot, frames: Uint8ClampedArray[]): FrameSnapshot | null {
  if (frames.length < 1 || frames.length > MAX_FRAMES) return null;
  const need = snapshot.size * snapshot.size * 4;
  if (frames.some((frame) => frame.length < need)) return null;
  return {
    size: snapshot.size,
    frames: frames.map((frame) => cloneFrame(frame.subarray(0, need) as Uint8ClampedArray)),
    index: 0,
  };
}

export function resizeSnapshot(snapshot: FrameSnapshot, size: CanvasSize): FrameSnapshot | null {
  if (!isCanvasSize(size)) return null;
  if (size === snapshot.size) return snapshot;
  const frames: Uint8ClampedArray[] = [];
  for (const frame of snapshot.frames) {
    const next = resampleSquare(frame, snapshot.size, size);
    if (!next) return null;
    frames.push(next);
  }
  return { size, frames, index: snapshot.index };
}

export function snapshotsEqual(a: FrameSnapshot, b: FrameSnapshot): boolean {
  if (a.size !== b.size || a.index !== b.index || a.frames.length !== b.frames.length) return false;
  for (let i = 0; i < a.frames.length; i += 1) {
    const left = a.frames[i];
    const right = b.frames[i];
    if (!left || !right || !buffersEqual(left, right)) return false;
  }
  return true;
}

export function paintCurrent(
  snapshot: FrameSnapshot,
  mutate: (frame: Uint8ClampedArray, size: CanvasSize) => void,
): FrameSnapshot {
  const frames = snapshot.frames.map(cloneFrame);
  const current = frames[snapshot.index];
  if (!current) return snapshot;
  mutate(current, snapshot.size);
  if (snapshot.frames[snapshot.index] && buffersEqual(snapshot.frames[snapshot.index] as Uint8ClampedArray, current)) {
    return snapshot;
  }
  return { size: snapshot.size, frames, index: snapshot.index };
}

export function copySnapshot(snapshot: FrameSnapshot): FrameSnapshot {
  return cloneSnapshot(snapshot);
}
