// Stereo channel check. One mono source is copied onto the left, the right, or both.
// "Both" is equal full-scale L+R (a center / mono image), not a quieter equal-power pan,
// so the speaker that was already playing stays at the same level when the other joins.
// Sound is synthesized here. Nothing is fetched, recorded, or stored.

export type Channel = "left" | "right" | "both";
export type Sound = "tone" | "pink" | "beep";

export const TONE_HZ = 440;
export const BEEP_HZ = 880;
export const BEEP_SECONDS = 0.18;
export const PINK_SECONDS = 2;
export const DEFAULT_VOLUME = 0.4;

export type Playing = { channel: Channel; sound: Sound };

export type PlaybackRequest = Playing & { volume: number };

export type StartResult =
  | { ok: true }
  | { ok: false; reason: "suspended" | "unavailable" | "cancelled" };

export function channelGains(channel: Channel): { left: number; right: number } {
  switch (channel) {
    case "left":
      return { left: 1, right: 0 };
    case "right":
      return { left: 0, right: 1 };
    case "both":
      return { left: 1, right: 1 };
    default: {
      const unexpected: never = channel;
      throw new Error(`Unknown channel: ${String(unexpected)}`);
    }
  }
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function channelFromKey(key: string): Channel | "stop" | null {
  if (key === "1") return "left";
  if (key === "2") return "right";
  if (key === "3") return "both";
  if (key === "Escape") return "stop";
  return null;
}

export function isTypingTarget(tagName: string): boolean {
  return tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA";
}

export function pinkFrameCount(sampleRate: number): number {
  const rate = Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : 48000;
  return Math.max(1, Math.round(rate * PINK_SECONDS));
}

// Paul Kellet's economy pink-noise filter. `random` returns values in [0, 1).
export function fillPinkNoise(buffer: Float32Array, random: () => number = Math.random): void {
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    const white = random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    const sample = pink * 0.11;
    buffer[i] = sample > 1 ? 1 : sample < -1 ? -1 : sample;
  }
}

export interface AudioBufferLike {
  length: number;
  numberOfChannels: number;
  sampleRate: number;
  getChannelData(channel: number): Float32Array;
}

export interface AudioNodeLike {
  connect(dest: AudioNodeLike, output?: number, input?: number): void;
  disconnect(): void;
}

export interface GainLike extends AudioNodeLike {
  gain: { value: number };
}

export interface SourceLike extends AudioNodeLike {
  onended: (() => void) | null;
  start(when?: number): void;
  stop(when?: number): void;
}

export interface OscillatorLike extends SourceLike {
  type: string;
  frequency: { value: number };
}

export interface BufferSourceLike extends SourceLike {
  buffer: AudioBufferLike | null;
  loop: boolean;
}

export interface AudioContextLike {
  state: string;
  currentTime: number;
  sampleRate: number;
  destination: AudioNodeLike;
  resume(): Promise<void>;
  close(): Promise<void>;
  createGain(): GainLike;
  createOscillator(): OscillatorLike;
  createBuffer(channels: number, length: number, sampleRate: number): AudioBufferLike;
  createBufferSource(): BufferSourceLike;
  createChannelMerger(channels: number): AudioNodeLike;
}

export function createBrowserContext(): AudioContextLike | null {
  if (typeof window === "undefined") return null;
  const host = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = host.AudioContext ?? host.webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor() as unknown as AudioContextLike;
  } catch {
    return null;
  }
}

export class ChannelPlayer {
  private context: AudioContextLike | null = null;
  private nodes: AudioNodeLike[] = [];
  private source: SourceLike | null = null;
  private master: GainLike | null = null;
  private ticket = 0;
  private current: Playing | null = null;
  private readonly factory: () => AudioContextLike | null;

  onchange: ((playing: Playing | null) => void) | null = null;

  constructor(factory: () => AudioContextLike | null) {
    this.factory = factory;
  }

  get playing(): Playing | null {
    return this.current;
  }

  async start(request: PlaybackRequest): Promise<StartResult> {
    this.ticket += 1;
    const ticket = this.ticket;
    this.teardownGraph();
    this.current = null;

    const ctx = this.contextOrNull();
    if (!ctx) return { ok: false, reason: "unavailable" };

    if (ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch {
        // Autoplay policy: stay suspended until a user gesture can resume it.
      }
    }
    if (ticket !== this.ticket) return { ok: false, reason: "cancelled" };
    if (ctx.state !== "running") return { ok: false, reason: "suspended" };

    this.arm(ctx, request);
    return { ok: true };
  }

  stop(): void {
    this.ticket += 1;
    const was = this.current !== null;
    this.teardownGraph();
    this.current = null;
    if (was) this.onchange?.(null);
  }

  setVolume(value: number): number {
    const next = clampVolume(value);
    if (this.master) this.master.gain.value = next;
    return next;
  }

  async close(): Promise<void> {
    this.stop();
    const ctx = this.context;
    this.context = null;
    if (!ctx) return;
    try {
      await ctx.close();
    } catch {
      // Already closed.
    }
  }

  private contextOrNull(): AudioContextLike | null {
    if (this.context && this.context.state !== "closed") return this.context;
    this.context = this.factory();
    return this.context;
  }

  private teardownGraph(): void {
    this.stopSource();
    for (const node of this.nodes) {
      try {
        node.disconnect();
      } catch {
        // Already disconnected.
      }
    }
    this.nodes = [];
    this.master = null;
  }

  private stopSource(): void {
    const source = this.source;
    if (!source) return;
    this.source = null;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // Not started yet, or already stopped.
    }
    try {
      source.disconnect();
    } catch {
      // Already disconnected.
    }
  }

  private arm(ctx: AudioContextLike, request: PlaybackRequest): void {
    const gains = channelGains(request.channel);
    const left = ctx.createGain();
    const right = ctx.createGain();
    const master = ctx.createGain();
    left.gain.value = gains.left;
    right.gain.value = gains.right;
    master.gain.value = clampVolume(request.volume);

    const merger = ctx.createChannelMerger(2);
    left.connect(merger, 0, 0);
    right.connect(merger, 0, 1);
    merger.connect(master);
    master.connect(ctx.destination);

    const source = request.sound === "pink" ? this.makePink(ctx) : this.makeTone(ctx, request.sound);
    source.connect(left);
    source.connect(right);
    const when = ctx.currentTime;
    source.start(when);
    if (request.sound === "beep") source.stop(when + BEEP_SECONDS);

    source.onended = () => {
      if (this.source !== source) return;
      this.source = null;
      this.current = null;
      this.onchange?.(null);
    };

    this.nodes = [left, right, master, merger, source];
    this.source = source;
    this.master = master;
    this.current = { channel: request.channel, sound: request.sound };
    this.onchange?.(this.current);
  }

  private makeTone(ctx: AudioContextLike, sound: Sound): OscillatorLike {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = sound === "beep" ? BEEP_HZ : TONE_HZ;
    return osc;
  }

  private makePink(ctx: AudioContextLike): BufferSourceLike {
    const rate = ctx.sampleRate > 0 ? ctx.sampleRate : 48000;
    const frames = pinkFrameCount(rate);
    const buffer = ctx.createBuffer(1, frames, rate);
    fillPinkNoise(buffer.getChannelData(0));
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }
}
