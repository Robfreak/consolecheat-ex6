// The loop for each song, expanded across its bars. Times are milliseconds
// from the start of the song. Playback schedules these on the audio clock.

import { beatMs, degreeMidi, songDurationMs, type Song } from "./songs.ts";

export type Voice = "kick" | "snare" | "hat" | "bass" | "lead";

export type MusicEvent = {
  timeMs: number;
  voice: Voice;
  midi?: number;
};

const cache = new Map<string, MusicEvent[]>();

function pushUnique(events: MusicEvent[], event: MusicEvent) {
  const last = events[events.length - 1];
  if (last && last.timeMs === event.timeMs && last.voice === event.voice && last.midi === event.midi) return;
  events.push(event);
}

export function buildEvents(song: Song): MusicEvent[] {
  const beat = beatMs(song);
  const sixteenth = beat / 4;
  const totalSixteenths = song.bars * 16;
  const loopSixteenths = 32;
  const events: MusicEvent[] = [];

  for (let index = 0; index < totalSixteenths; index += 1) {
    const local = index % loopSixteenths;
    const timeMs = Math.round(index * sixteenth);
    const localBeat = local / 4;
    if (song.kick.some((beatIndex) => Math.abs(localBeat - beatIndex) < 0.001)) {
      pushUnique(events, { timeMs, voice: "kick" });
    }
    if (song.snare.some((beatIndex) => Math.abs(localBeat - beatIndex) < 0.001)) {
      pushUnique(events, { timeMs, voice: "snare" });
    }
    const hatEvery = song.hats === "sixteenth" ? 1 : 2;
    if (index % hatEvery === 0) pushUnique(events, { timeMs, voice: "hat" });

    if (local % 4 === 0) {
      const degree = song.bass[local / 4];
      if (degree !== undefined && degree >= 0) {
        pushUnique(events, { timeMs, voice: "bass", midi: degreeMidi(song, degree, -1) });
      }
    }
    if (local % 2 === 0) {
      const degree = song.lead[local / 2];
      if (degree !== undefined && degree >= 0) {
        pushUnique(events, { timeMs, voice: "lead", midi: degreeMidi(song, degree, 1) });
      }
    }
  }

  events.sort((a, b) => a.timeMs - b.timeMs || a.voice.localeCompare(b.voice));
  return events;
}

export function eventsFor(song: Song): readonly MusicEvent[] {
  const cached = cache.get(song.id);
  if (cached) return cached;
  const built = buildEvents(song);
  cache.set(song.id, built);
  return built;
}

/** Events with timeMs in [fromMs, toMs). */
export function eventsBetween(song: Song, fromMs: number, toMs: number): MusicEvent[] {
  if (toMs <= fromMs) return [];
  const all = eventsFor(song);
  const found: MusicEvent[] = [];
  for (const event of all) {
    if (event.timeMs >= toMs) break;
    if (event.timeMs >= fromMs) found.push(event);
  }
  return found;
}

export function songEndMs(song: Song): number {
  return Math.round(songDurationMs(song));
}
