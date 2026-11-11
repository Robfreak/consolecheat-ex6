// Playback on the audio clock. The game loop asks for the next slice with
// AudioContext.currentTime. Nothing here waits on setTimeout.

import { eventsBetween, type MusicEvent } from "./music.ts";
import type { Song } from "./songs.ts";

export const LEAD_IN_SEC = 0.28;
export const LOOKAHEAD_SEC = 0.45;

export type Session = {
  context: AudioContext;
  /** AudioContext time at which song time 0 falls. Negative until armed. */
  origin: number;
  scheduledUntilMs: number;
  noise: AudioBuffer | null;
  finished: boolean;
};

export function createSession(context: AudioContext): Session {
  return { context, origin: -1, scheduledUntilMs: -1e9, noise: null, finished: false };
}

export function songMsNow(session: Session): number {
  if (session.origin < 0) return -LEAD_IN_SEC * 1000;
  return (session.context.currentTime - session.origin) * 1000;
}

export function arm(session: Session) {
  if (session.origin >= 0) return;
  session.origin = session.context.currentTime + LEAD_IN_SEC;
  session.scheduledUntilMs = -1e9;
}

function midiHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

function noiseBuffer(session: Session): AudioBuffer {
  if (session.noise) return session.noise;
  const ctx = session.context;
  const length = Math.max(1, Math.floor(ctx.sampleRate * 0.4));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
  session.noise = buffer;
  return buffer;
}

function env(ctx: AudioContext, when: number, peak: number, attack: number, release: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), when + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + attack + release);
  return gain;
}

function tone(
  ctx: AudioContext,
  when: number,
  freq: number,
  type: OscillatorType,
  peak: number,
  attack: number,
  release: number,
  slideTo?: number,
) {
  const osc = ctx.createOscillator();
  const gain = env(ctx, when, peak, attack, release);
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(1, freq), when);
  if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), when + attack + release);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + attack + release + 0.03);
}

function burst(session: Session, when: number, peak: number, attack: number, release: number, highpass: number) {
  const ctx = session.context;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(session);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(highpass, when);
  const gain = env(ctx, when, peak, attack, release);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(when);
  source.stop(when + attack + release + 0.02);
}

export function playEvent(session: Session, event: MusicEvent) {
  const ctx = session.context;
  if (ctx.state === "closed" || session.origin < 0) return;
  const when = session.origin + event.timeMs / 1000;
  if (when < ctx.currentTime - 0.03) return;
  if (event.voice === "kick") {
    tone(ctx, when, 168, "sine", 0.85, 0.004, 0.14, 48);
    return;
  }
  if (event.voice === "snare") {
    tone(ctx, when, 196, "triangle", 0.18, 0.004, 0.1, 140);
    burst(session, when, 0.22, 0.002, 0.12, 1400);
    return;
  }
  if (event.voice === "hat") {
    burst(session, when, 0.055, 0.001, 0.035, 7000);
    return;
  }
  if (event.voice === "bass" && event.midi !== undefined) {
    tone(ctx, when, midiHz(event.midi), "triangle", 0.2, 0.008, 0.16);
    return;
  }
  if (event.voice === "lead" && event.midi !== undefined) {
    tone(ctx, when, midiHz(event.midi), "square", 0.06, 0.01, 0.18);
  }
}

export function scheduleAhead(session: Session, song: Song) {
  if (session.context.state !== "running") return;
  if (session.origin < 0) arm(session);
  const now = songMsNow(session);
  const end = now + LOOKAHEAD_SEC * 1000;
  const from = session.scheduledUntilMs;
  if (end <= from) return;
  for (const event of eventsBetween(song, from, end)) playEvent(session, event);
  session.scheduledUntilMs = end;
}

export function scheduleClick(context: AudioContext, whenSec: number) {
  if (context.state === "closed") return;
  const when = Math.max(whenSec, context.currentTime + 0.001);
  const osc = context.createOscillator();
  const gain = env(context, when, 0.14, 0.003, 0.05);
  osc.type = "square";
  osc.frequency.setValueAtTime(880, when);
  osc.connect(gain);
  gain.connect(context.destination);
  osc.start(when);
  osc.stop(when + 0.07);
}
