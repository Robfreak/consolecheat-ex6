import { MAX_FPS, MIN_FPS, type PlayMode } from "./model.ts";

export function frameDurationMs(fps: number): number {
  const rate = Math.min(MAX_FPS, Math.max(MIN_FPS, fps));
  return 1000 / rate;
}

/**
 * Frame shown at `elapsedMs` from the start of playback.
 * Loop wraps. Ping-pong walks to the last frame and back without holding the ends twice:
 * 0,1,2,3,2,1 for four frames.
 */
export function frameIndexAt(elapsedMs: number, fps: number, frameCount: number, mode: PlayMode): number {
  if (!Number.isInteger(frameCount) || frameCount <= 1) return 0;
  const elapsed = Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0;
  const frame = Math.floor(elapsed / frameDurationMs(fps));
  if (mode === "loop") return frame % frameCount;
  const span = frameCount - 1;
  const cycle = span * 2;
  const pos = frame % cycle;
  return pos <= span ? pos : cycle - pos;
}
