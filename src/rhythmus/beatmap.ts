// Charts are generated from the song seed and the difficulty. The same pair
// always yields the same notes. Leicht is sparse and slow, Mittel is denser,
// Schwer uses a finer grid, chords, and a shorter approach.

import type { Song, SongId } from "./songs.ts";
import { beatMs, songDurationMs } from "./songs.ts";
import type { Lane } from "./input.ts";

export const difficulties = ["leicht", "mittel", "schwer"] as const;

export type Difficulty = (typeof difficulties)[number];

export type Note = {
  timeMs: number;
  lane: Lane;
};

export type Chart = {
  songId: SongId;
  difficulty: Difficulty;
  seed: number;
  approachMs: number;
  notes: Note[];
  durationMs: number;
};

type Spec = {
  sixteenthsPerStep: number;
  density: number;
  chord: number;
  approachMs: number;
  introBeats: number;
  outroBeats: number;
};

const specs: Record<Difficulty, Spec> = {
  leicht: { sixteenthsPerStep: 2, density: 0.5, chord: 0, approachMs: 1900, introBeats: 4, outroBeats: 2 },
  mittel: { sixteenthsPerStep: 2, density: 0.78, chord: 0.14, approachMs: 1450, introBeats: 4, outroBeats: 2 },
  schwer: { sixteenthsPerStep: 1, density: 0.44, chord: 0.2, approachMs: 1000, introBeats: 4, outroBeats: 2 },
};

export function isDifficulty(value: string): value is Difficulty {
  return (difficulties as readonly string[]).includes(value);
}

export function approachFor(difficulty: Difficulty): number {
  return specs[difficulty].approachMs;
}

/** Stable 32-bit mix of the song seed and the difficulty. */
export function chartSeed(songSeed: number, difficulty: Difficulty): number {
  const index = difficulties.indexOf(difficulty) + 1;
  const mixed = Math.imul(songSeed >>> 0, 0x9e3779b1) ^ Math.imul(index, 0x85ebca6b);
  return mixed >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateChart(song: Song, difficulty: Difficulty): Chart {
  const spec = specs[difficulty];
  const sixteenth = beatMs(song) / 4;
  const total = song.bars * 16;
  const intro = spec.introBeats * 4;
  const outro = spec.outroBeats * 4;
  const rng = mulberry32(chartSeed(song.seed, difficulty));
  const notes: Note[] = [];
  let lastLane = -1;
  let run = 0;

  for (let step = intro; step < total - outro; step += spec.sixteenthsPerStep) {
    if (rng() >= spec.density) continue;
    let lane = Math.floor(rng() * 4);
    if (lane === lastLane) {
      run += 1;
      if (run >= 3) {
        lane = (lane + 1 + Math.floor(rng() * 3)) % 4;
        run = 0;
      }
    } else {
      run = 0;
    }
    lastLane = lane;
    const timeMs = Math.round(step * sixteenth);
    notes.push({ timeMs, lane: lane as Lane });
    if (spec.chord > 0 && rng() < spec.chord) {
      const other = (lane + 1 + Math.floor(rng() * 3)) % 4;
      notes.push({ timeMs, lane: other as Lane });
    }
  }

  notes.sort((a, b) => a.timeMs - b.timeMs || a.lane - b.lane);
  return {
    songId: song.id,
    difficulty,
    seed: chartSeed(song.seed, difficulty),
    approachMs: spec.approachMs,
    notes,
    durationMs: Math.round(songDurationMs(song)),
  };
}
