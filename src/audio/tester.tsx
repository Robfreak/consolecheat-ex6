import { useEffect, useRef, useState } from "react";
import type { Copy } from "./messages.ts";
import {
  ChannelPlayer,
  DEFAULT_VOLUME,
  channelFromKey,
  createBrowserContext,
  isTypingTarget,
  type Channel,
  type Playing,
  type Sound,
} from "./tone.ts";

export type PlaybackStatus = "idle" | "playing" | "suspended" | "unavailable";

const sounds: readonly Sound[] = ["tone", "pink", "beep"];

export function statusMessage(text: Copy, status: PlaybackStatus, channel: Channel | null): string {
  if (status === "suspended") return text.statusSuspended;
  if (status === "unavailable") return text.statusUnavailable;
  if (status === "playing" && channel === "left") return text.statusLeft;
  if (status === "playing" && channel === "right") return text.statusRight;
  if (status === "playing" && channel === "both") return text.statusBoth;
  return text.statusIdle;
}

export function ChannelTester({
  text,
  sound,
  volume,
  playing,
  status,
  screenHref,
  hdrHref,
  onChannel,
  onSound,
  onVolume,
  onStop,
}: {
  text: Copy;
  sound: Sound;
  volume: number;
  playing: Channel | null;
  status: PlaybackStatus;
  screenHref: string;
  hdrHref: string;
  onChannel: (channel: Channel) => void;
  onSound: (sound: Sound) => void;
  onVolume: (volume: number) => void;
  onStop: () => void;
}) {
  const percent = Math.round(volume * 100);
  const message = statusMessage(text, status, playing);
  const leftOn = playing === "left" || playing === "both";
  const rightOn = playing === "right" || playing === "both";
  const centerOn = playing === "both";
  const warn = status === "suspended" || status === "unavailable";
  const soundLabel: Record<Sound, string> = {
    tone: text.soundTone,
    pink: text.soundPink,
    beep: text.soundBeep,
  };

  return (
    <div className="mt-10" data-testid="channel-desk">
      <section className="panel rounded-xl px-4 py-5 sm:px-6" aria-labelledby="how-heading">
        <h2 id="how-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.howHeading}
        </h2>
        <div className="mt-4 grid gap-3 text-base leading-relaxed text-muted lg:grid-cols-3">
          <p>{text.instructionHeadphones}</p>
          <p>{text.instructionSwap}</p>
          <p>{text.instructionCaveat}</p>
        </div>

        <div role="group" aria-label={text.channelsLabel} className="mt-6 grid grid-cols-3 gap-2">
          <ChannelButton
            testId="channel-left"
            shortcut="1"
            pressed={playing === "left"}
            label={text.channelLeft}
            onClick={() => onChannel("left")}
          />
          <ChannelButton
            testId="channel-right"
            shortcut="2"
            pressed={playing === "right"}
            label={text.channelRight}
            onClick={() => onChannel("right")}
          />
          <ChannelButton
            testId="channel-both"
            shortcut="3"
            pressed={playing === "both"}
            label={text.channelBoth}
            detail={text.channelCenter}
            onClick={() => onChannel("both")}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden="true">
          <Lamp testId="lamp-left" on={leftOn} label={text.indicatorLeft} />
          <Lamp testId="lamp-center" on={centerOn} label={text.indicatorCenter} />
          <Lamp testId="lamp-right" on={rightOn} label={text.indicatorRight} />
        </div>

        <p
          id="audio-status"
          role="status"
          data-testid="playback-status"
          data-status={status}
          className={`mt-4 text-base font-medium leading-relaxed ${warn ? "text-warn" : "text-fg"}`}
        >
          {message}
        </p>
        <p className="mt-2 text-sm text-subtle">{text.keyboardHint}</p>

        <div role="group" aria-label={text.soundsLabel} className="mt-6 flex flex-col gap-2 min-[480px]:flex-row min-[480px]:flex-wrap">
          {sounds.map((id) => {
            const pressed = sound === id;
            return (
              <button
                key={id}
                type="button"
                data-testid={`sound-${id}`}
                aria-pressed={pressed}
                className={`btn min-h-14 w-full min-[480px]:w-auto ${pressed ? "btn-primary" : "btn-ghost"}`}
                onClick={() => onSound(id)}
              >
                {soundLabel[id]}
              </button>
            );
          })}
          <button
            type="button"
            data-testid="stop"
            className="btn btn-ghost min-h-14 w-full min-[480px]:ml-auto min-[480px]:w-auto"
            aria-keyshortcuts="Escape"
            disabled={playing === null}
            onClick={onStop}
          >
            {text.stop}
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-subtle">{text.soundHint}</p>

        <div className="mt-6">
          <label htmlFor="audio-volume" className="text-sm text-subtle">
            {text.volume} <span className="font-medium text-fg">{percent} %</span>
          </label>
          <input
            id="audio-volume"
            data-testid="volume"
            className="volume"
            type="range"
            min={0}
            max={100}
            step={1}
            value={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${percent} %`}
            onChange={(event) => onVolume(Number(event.target.value) / 100)}
          />
        </div>
      </section>

      <section className="panel mt-4 rounded-xl px-4 py-5 sm:px-6" aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-display text-xl font-semibold tracking-tight">
          {text.relatedHeading}
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">{text.relatedBody}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a href={screenHref} className="btn btn-primary" data-testid="screen-test-link">
            {text.screenLink}
          </a>
          <a href={hdrHref} className="btn btn-ghost" data-testid="hdr-link">
            {text.hdrLink}
          </a>
        </div>
      </section>
    </div>
  );
}

function ChannelButton({
  testId,
  shortcut,
  pressed,
  label,
  detail,
  onClick,
}: {
  testId: string;
  shortcut: string;
  pressed: boolean;
  label: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={pressed}
      aria-keyshortcuts={shortcut}
      className={`btn h-full min-h-16 w-full min-w-0 px-2 text-base sm:text-lg ${pressed ? "btn-primary" : "btn-ghost"}`}
      onClick={onClick}
    >
      <span className="flex flex-col items-center leading-tight">
        <span>{label}</span>
        {detail ? <span className={`text-xs font-medium ${pressed ? "opacity-90" : "text-subtle"}`}>{detail}</span> : null}
      </span>
    </button>
  );
}

function Lamp({ testId, on, label }: { testId: string; on: boolean; label: string }) {
  return (
    <div className="channel-lamp rounded-xl border border-line bg-surface px-2 py-3 text-center" data-active={on ? "true" : "false"}>
      <div data-testid={testId} className="lamp" data-on={on ? "true" : "false"} />
      <p className="mt-2 text-sm font-semibold">{label}</p>
    </div>
  );
}

export function ChannelDesk({
  text,
  screenHref,
  hdrHref,
}: {
  text: Copy;
  screenHref: string;
  hdrHref: string;
}) {
  const playerRef = useRef<ChannelPlayer | null>(null);
  if (!playerRef.current) playerRef.current = new ChannelPlayer(createBrowserContext);
  const player = playerRef.current;
  const [sound, setSound] = useState<Sound>("tone");
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const view = useRef({ sound, volume });
  view.current = { sound, volume };

  async function play(channel: Channel) {
    const result = await player.start({
      channel,
      sound: view.current.sound,
      volume: view.current.volume,
    });
    if (!result.ok) {
      if (result.reason === "cancelled") return;
      setPlaying(null);
      setStatus(result.reason === "unavailable" ? "unavailable" : "suspended");
      return;
    }
    setPlaying(player.playing);
    setStatus("playing");
  }

  function stop() {
    player.stop();
    setPlaying(null);
    setStatus("idle");
  }

  function chooseSound(next: Sound) {
    view.current = { ...view.current, sound: next };
    setSound(next);
    const current = player.playing;
    if (current) void play(current.channel);
  }

  function changeVolume(next: number) {
    const value = player.setVolume(next);
    view.current = { ...view.current, volume: value };
    setVolume(value);
  }

  const actions = useRef({ play, stop });
  actions.current = { play, stop };

  useEffect(() => {
    player.onchange = (next) => {
      setPlaying(next);
      setStatus((current) => {
        if (next) return "playing";
        return current === "playing" ? "idle" : current;
      });
    };
    return () => {
      player.onchange = null;
      void player.close();
    };
  }, [player]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const tag = event.target instanceof HTMLElement ? event.target.tagName : "";
      if (isTypingTarget(tag)) return;
      const action = channelFromKey(event.key);
      if (!action) return;
      event.preventDefault();
      if (action === "stop") actions.current.stop();
      else void actions.current.play(action);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ChannelTester
      text={text}
      sound={sound}
      volume={volume}
      playing={playing?.channel ?? null}
      status={status}
      screenHref={screenHref}
      hdrHref={hdrHref}
      onChannel={(channel) => void play(channel)}
      onSound={chooseSound}
      onVolume={changeVolume}
      onStop={stop}
    />
  );
}
