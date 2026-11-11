// Frame timing at a fixed 60 fps, taken from performance.now() deltas.
// One frame is 1000/60 ms. The gap is rounded to the nearest frame.
// A gap is on time when it is less than or equal to the configured window.

export const FPS = 60;

export function framesBetween(earlierMs: number, laterMs: number): number {
  if (!Number.isFinite(earlierMs) || !Number.isFinite(laterMs)) return 0;
  const frames = ((laterMs - earlierMs) * FPS) / 1000;
  if (frames <= 0) return 0;
  return Math.round(frames);
}

export function frameMs(frames: number): number {
  return (frames * 1000) / FPS;
}

/** `null` when this input has no previous step (the first one). */
export function withinWindow(frames: number | null, windowFrames: number): boolean | null {
  if (frames == null) return null;
  return frames <= windowFrames;
}
