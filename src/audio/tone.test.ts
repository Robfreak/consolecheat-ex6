import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  BEEP_HZ,
  BEEP_SECONDS,
  ChannelPlayer,
  TONE_HZ,
  channelFromKey,
  channelGains,
  clampVolume,
  createBrowserContext,
  fillPinkNoise,
  isTypingTarget,
  pinkFrameCount,
  type AudioBufferLike,
  type AudioContextLike,
  type AudioNodeLike,
  type BufferSourceLike,
  type GainLike,
  type OscillatorLike,
} from "./tone.ts";

function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

type Conn = { dest: AudioNodeLike; output: number; input: number };

function node(kind: string): AudioNodeLike & { kind: string; connections: Conn[] } {
  const connections: Conn[] = [];
  return {
    kind,
    connections,
    connect(dest, output = 0, input = 0) {
      connections.push({ dest, output, input });
    },
    disconnect() {
      connections.length = 0;
    },
  };
}

type MockGain = GainLike & { connections: Conn[] };
type MockOsc = OscillatorLike & { connections: Conn[]; started: Array<number | undefined>; stopped: Array<number | undefined> };
type MockBuffer = BufferSourceLike & { connections: Conn[]; started: Array<number | undefined>; stopped: Array<number | undefined> };
type MockMerger = AudioNodeLike & { connections: Conn[] };

function mockContext(options?: {
  state?: string;
  resume?: (ctx: { state: string }) => Promise<void>;
}): {
  ctx: AudioContextLike;
  gains: MockGain[];
  oscillators: MockOsc[];
  buffers: MockBuffer[];
  mergers: MockMerger[];
} {
  const gains: MockGain[] = [];
  const oscillators: MockOsc[] = [];
  const buffers: MockBuffer[] = [];
  const mergers: MockMerger[] = [];
  const destination = node("destination");
  const ctx: AudioContextLike = {
    state: options?.state ?? "running",
    currentTime: 2,
    sampleRate: 8000,
    destination,
    async resume() {
      if (options?.resume) await options.resume(ctx);
      else ctx.state = "running";
    },
    async close() {
      ctx.state = "closed";
    },
    createGain() {
      const gain: MockGain = { ...node("gain"), gain: { value: 1 } };
      gains.push(gain);
      return gain;
    },
    createOscillator() {
      const osc = {
        ...node("osc"),
        type: "",
        frequency: { value: 0 },
        onended: null as (() => void) | null,
        started: [] as Array<number | undefined>,
        stopped: [] as Array<number | undefined>,
        start(when?: number) {
          osc.started.push(when);
        },
        stop(when?: number) {
          osc.stopped.push(when);
        },
      };
      oscillators.push(osc);
      return osc;
    },
    createBuffer(channels: number, length: number, sampleRate: number): AudioBufferLike {
      const data = Array.from({ length: channels }, () => new Float32Array(length));
      return {
        length,
        numberOfChannels: channels,
        sampleRate,
        getChannelData(channel: number) {
          const samples = data[channel];
          if (!samples) throw new Error(`missing channel ${channel}`);
          return samples;
        },
      };
    },
    createBufferSource() {
      const source = {
        ...node("buffer"),
        buffer: null as AudioBufferLike | null,
        loop: false,
        onended: null as (() => void) | null,
        started: [] as Array<number | undefined>,
        stopped: [] as Array<number | undefined>,
        start(when?: number) {
          source.started.push(when);
        },
        stop(when?: number) {
          source.stopped.push(when);
        },
      };
      buffers.push(source);
      return source;
    },
    createChannelMerger() {
      const merger = node("merger");
      mergers.push(merger);
      return merger;
    },
  };
  return { ctx, gains, oscillators, buffers, mergers };
}

function correlation(data: Float32Array): number {
  const n = data.length - 1;
  let meanA = 0;
  let meanB = 0;
  for (let i = 0; i < n; i += 1) {
    meanA += data[i] ?? 0;
    meanB += data[i + 1] ?? 0;
  }
  meanA /= n;
  meanB /= n;
  let num = 0;
  let left = 0;
  let right = 0;
  for (let i = 0; i < n; i += 1) {
    const a = (data[i] ?? 0) - meanA;
    const b = (data[i + 1] ?? 0) - meanB;
    num += a * b;
    left += a * a;
    right += b * b;
  }
  return num / Math.sqrt(left * right);
}

test("channel gains are full left, full right, or equal L+R", () => {
  assert.deepEqual(channelGains("left"), { left: 1, right: 0 });
  assert.deepEqual(channelGains("right"), { left: 0, right: 1 });
  assert.deepEqual(channelGains("both"), { left: 1, right: 1 });
  assert.equal(clampVolume(0.4), 0.4);
  assert.equal(clampVolume(2), 1);
  assert.equal(clampVolume(-0.2), 0);
  assert.equal(clampVolume(Number.NaN), 0);
  assert.equal(clampVolume(Number.POSITIVE_INFINITY), 0);
  assert.equal(pinkFrameCount(48000), 96000);
  assert.equal(pinkFrameCount(0), 96000);
});

test("keys 1, 2, 3, and Escape choose a channel or stop", () => {
  assert.equal(channelFromKey("1"), "left");
  assert.equal(channelFromKey("2"), "right");
  assert.equal(channelFromKey("3"), "both");
  assert.equal(channelFromKey("Escape"), "stop");
  assert.equal(channelFromKey(" "), null);
  assert.equal(channelFromKey("l"), null);
  assert.equal(isTypingTarget("INPUT"), true);
  assert.equal(isTypingTarget("SELECT"), true);
  assert.equal(isTypingTarget("TEXTAREA"), true);
  assert.equal(isTypingTarget("BUTTON"), false);
});

test("pink noise stays in range and neighboring samples correlate", () => {
  const data = new Float32Array(4000);
  fillPinkNoise(data, lcg(7));
  let energy = 0;
  for (const sample of data) {
    assert.equal(Number.isFinite(sample), true);
    assert.ok(sample <= 1 && sample >= -1);
    energy += Math.abs(sample);
  }
  assert.ok(energy / data.length > 0.01);
  assert.ok(correlation(data) > 0.15);
});

test("a mocked AudioContext routes a sine tone to the chosen side", async () => {
  for (const channel of ["left", "right", "both"] as const) {
    const mock = mockContext();
    const player = new ChannelPlayer(() => mock.ctx);
    const result = await player.start({ channel, sound: "tone", volume: 0.25 });
    assert.deepEqual(result, { ok: true });
    assert.deepEqual(player.playing, { channel, sound: "tone" });

    const expected = channelGains(channel);
    const left = mock.gains[0];
    const right = mock.gains[1];
    const master = mock.gains[2];
    const merger = mock.mergers[0];
    const osc = mock.oscillators[0];
    assert.ok(left && right && master && merger && osc);
    assert.equal(left.gain.value, expected.left);
    assert.equal(right.gain.value, expected.right);
    assert.equal(master.gain.value, 0.25);
    assert.equal(osc.type, "sine");
    assert.equal(osc.frequency.value, TONE_HZ);
    assert.deepEqual(osc.started, [2]);
    assert.deepEqual(osc.stopped, []);
    assert.ok(left.connections.some((link) => link.dest === merger && link.input === 0));
    assert.ok(right.connections.some((link) => link.dest === merger && link.input === 1));
    assert.ok(merger.connections.some((link) => link.dest === master));
    assert.ok(master.connections.some((link) => link.dest === mock.ctx.destination));
    assert.ok(osc.connections.some((link) => link.dest === left));
    assert.ok(osc.connections.some((link) => link.dest === right));

    assert.equal(player.setVolume(1.8), 1);
    assert.equal(master.gain.value, 1);
    player.stop();
    assert.equal(player.playing, null);
    assert.equal(osc.stopped.length, 1);
  }
});

test("pink noise loops a mono buffer and a beep is a short higher sine", async () => {
  const pink = mockContext();
  const noise = new ChannelPlayer(() => pink.ctx);
  assert.deepEqual(await noise.start({ channel: "both", sound: "pink", volume: 4 }), { ok: true });
  const buffer = pink.buffers[0];
  assert.ok(buffer);
  assert.equal(buffer.loop, true);
  assert.equal(buffer.buffer?.numberOfChannels, 1);
  assert.equal(buffer.buffer?.sampleRate, 8000);
  assert.equal(buffer.buffer?.length, pinkFrameCount(8000));
  assert.equal(pink.gains[0]?.gain.value, 1);
  assert.equal(pink.gains[1]?.gain.value, 1);
  assert.equal(pink.gains[2]?.gain.value, 1);
  assert.equal(pink.oscillators.length, 0);
  const samples = buffer.buffer?.getChannelData(0);
  assert.ok(samples?.some((sample) => sample !== 0));

  const beepMock = mockContext();
  const beeps = new ChannelPlayer(() => beepMock.ctx);
  await beeps.start({ channel: "right", sound: "beep", volume: 0.5 });
  const osc = beepMock.oscillators[0];
  assert.ok(osc);
  assert.equal(osc.frequency.value, BEEP_HZ);
  assert.equal(osc.type, "sine");
  assert.deepEqual(osc.stopped, [2 + BEEP_SECONDS]);
  assert.equal(beepMock.gains[0]?.gain.value, 0);
  assert.equal(beepMock.gains[1]?.gain.value, 1);
  assert.deepEqual(beeps.playing, { channel: "right", sound: "beep" });
  osc.onended?.();
  assert.equal(beeps.playing, null);
});

test("playback waits for a running context and stop cancels a pending start", async () => {
  let built = 0;
  const missing = new ChannelPlayer(() => {
    built += 1;
    return null;
  });
  assert.equal(built, 0);
  assert.deepEqual(await missing.start({ channel: "left", sound: "tone", volume: 0.2 }), {
    ok: false,
    reason: "unavailable",
  });
  assert.equal(built, 1);
  assert.equal(missing.playing, null);
  assert.equal(createBrowserContext(), null);

  const held = mockContext({
    state: "suspended",
    async resume() {
      // Stay suspended, as a browser does before a user gesture.
    },
  });
  const quiet = new ChannelPlayer(() => held.ctx);
  assert.deepEqual(await quiet.start({ channel: "left", sound: "tone", volume: 0.2 }), {
    ok: false,
    reason: "suspended",
  });
  assert.equal(held.oscillators.length, 0);
  assert.equal(quiet.playing, null);

  const resumed = mockContext({
    state: "suspended",
    async resume(live) {
      live.state = "running";
    },
  });
  const player = new ChannelPlayer(() => resumed.ctx);
  assert.deepEqual(await player.start({ channel: "left", sound: "tone", volume: 0.2 }), { ok: true });
  assert.equal(resumed.oscillators.length, 1);

  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const pendingMock = mockContext({
    state: "suspended",
    async resume(live) {
      await gate;
      live.state = "running";
    },
  });
  const raced = new ChannelPlayer(() => pendingMock.ctx);
  const pending = raced.start({ channel: "both", sound: "tone", volume: 0.2 });
  raced.stop();
  release();
  assert.deepEqual(await pending, { ok: false, reason: "cancelled" });
  assert.equal(pendingMock.oscillators.length, 0);
  assert.equal(raced.playing, null);
});

test("the tone module does not record, store, or fetch audio", () => {
  const tone = readFileSync(new URL("./tone.ts", import.meta.url), "utf8");
  const tester = readFileSync(new URL("./tester.tsx", import.meta.url), "utf8");
  const combined = `${tone}\n${tester}`;
  assert.doesNotMatch(combined, /getUserMedia|mediaDevices|MediaRecorder|webkitGetUserMedia/);
  assert.doesNotMatch(combined, /localStorage|sessionStorage/);
  assert.doesNotMatch(tone, /fetch\(|https?:\/\//);
  assert.match(tone, /createOscillator/);
  assert.match(tone, /createBufferSource/);
  assert.match(tone, /createChannelMerger/);
});
