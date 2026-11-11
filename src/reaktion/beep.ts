// Optional click, synthesized after the player turns sound on.
// Nothing is fetched. Sound stays off until that gesture.

export type BeepKind = "go" | "good" | "bad";

export function beepFrequency(kind: BeepKind): number {
  if (kind === "good") return 880;
  if (kind === "bad") return 196;
  return 660;
}

export type Beeper = {
  enable(): boolean;
  disable(): void;
  close(): void;
  play(kind: BeepKind): void;
};

export function createBeeper(): Beeper {
  let ctx: AudioContext | null = null;
  let on = false;
  return {
    enable() {
      const Ctx = window.AudioContext;
      if (!Ctx) return false;
      on = true;
      ctx = ctx ?? new Ctx();
      if (ctx.state === "suspended") void ctx.resume();
      return true;
    },
    disable() {
      on = false;
    },
    close() {
      on = false;
      const current = ctx;
      ctx = null;
      if (current && current.state !== "closed") void current.close();
    },
    play(kind) {
      if (!on || !ctx || ctx.state === "closed") return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = beepFrequency(kind);
        const start = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.06, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.13);
      } catch {
        // A blocked audio device stays silent. The round still counts.
      }
    },
  };
}
