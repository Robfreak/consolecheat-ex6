// Three short songs. Duration, tempo, and the note chart come from these
// numbers. Nothing here is an audio file.

export const songIds = ["nachtmarkt", "neonbahn", "hafenlicht"] as const;

export type SongId = (typeof songIds)[number];

export type Song = {
  id: SongId;
  seed: number;
  bpm: number;
  bars: number;
  /** MIDI note of the bass root. */
  root: number;
  /** Semitone offsets of a pentatonic scale, counted from the root. */
  scale: readonly number[];
  /** One scale degree per beat of the 8-beat loop. -1 is a rest. */
  bass: readonly number[];
  /** One scale degree per eighth of the 8-beat loop. -1 is a rest. */
  lead: readonly number[];
  hats: "eighth" | "sixteenth";
  /** Beat positions inside the 8-beat loop. */
  kick: readonly number[];
  snare: readonly number[];
};

export function isSongId(value: string): value is SongId {
  return (songIds as readonly string[]).includes(value);
}

export function beatMs(song: Song): number {
  return 60_000 / song.bpm;
}

export function songDurationMs(song: Song): number {
  return song.bars * 4 * beatMs(song);
}

export const songs: readonly Song[] = [
  {
    id: "nachtmarkt",
    seed: 4817,
    bpm: 96,
    bars: 30,
    root: 57,
    scale: [0, 3, 5, 7, 10],
    bass: [0, 0, 4, 3, 0, 2, 3, 1],
    lead: [4, -1, 2, -1, 3, 1, -1, 2, 4, -1, 3, -1, 2, 0, -1, 1],
    hats: "eighth",
    kick: [0, 2, 4, 6],
    snare: [2, 6],
  },
  {
    id: "neonbahn",
    seed: 9023,
    bpm: 126,
    bars: 36,
    root: 50,
    scale: [0, 3, 5, 7, 10],
    bass: [0, 0, 3, 0, 4, 3, 2, 0],
    lead: [0, 2, -1, 4, 3, -1, 2, 1, 0, -1, 4, 3, 2, 4, -1, 1],
    hats: "sixteenth",
    kick: [0, 1, 2, 3, 4, 5, 6, 7],
    snare: [2, 6],
  },
  {
    id: "hafenlicht",
    seed: 2741,
    bpm: 88,
    bars: 32,
    root: 48,
    scale: [0, 2, 4, 7, 9],
    bass: [0, 0, 3, 2, 4, 2, 3, 0],
    lead: [0, -1, 2, -1, 4, -1, 2, 1, 0, -1, 3, -1, 2, -1, 1, -1],
    hats: "eighth",
    kick: [0, 3, 4, 7],
    snare: [2, 6],
  },
];

export function songById(id: SongId): Song {
  const song = songs.find((item) => item.id === id);
  if (!song) throw new Error(`unknown song ${id}`);
  return song;
}

export function degreeMidi(song: Song, degree: number, octaveShift: number): number {
  const scale = song.scale;
  const span = scale.length;
  const wrapped = ((degree % span) + span) % span;
  const octaves = Math.floor(degree / span);
  const step = scale[wrapped] ?? 0;
  return song.root + octaveShift * 12 + octaves * 12 + step;
}
