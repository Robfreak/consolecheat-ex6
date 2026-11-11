import { useEffect, useRef, useState } from "react";
import { arm, createSession, scheduleAhead, songMsNow, type Session } from "./audio.ts";
import type { Chart } from "./beatmap.ts";
import { drawFrame, type Flash } from "./draw.ts";
import { formatAccuracy, formatScore, formatTime } from "./format.ts";
import { keyboardLane, pollGamepad, readNavigatorPads, type Lane } from "./input.ts";
import { accuracyOf, applyJudgement, dueMisses, emptyTally, judgedCount, pickNote, type JudgementName, type Tally } from "./judgement.ts";
import type { Copy, Lang } from "./messages.ts";
import { songText } from "./messages.ts";
import type { Song } from "./songs.ts";

type Hud = {
  songMs: number;
  tally: Tally;
  paused: boolean;
  judgement: JudgementName | null;
  live: string;
};

export function Playfield({
  song,
  chart,
  offsetMs,
  reduced,
  text,
  lang,
  audio,
  onFinish,
  onAbort,
}: {
  song: Song;
  chart: Chart;
  offsetMs: number;
  reduced: boolean;
  text: Copy;
  lang: Lang;
  audio: AudioContext;
  onFinish: (tally: Tally) => void;
  onAbort: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resumeRef = useRef<HTMLButtonElement>(null);
  const sessionRef = useRef<Session | null>(null);
  const reducedRef = useRef(reduced);
  const onFinishRef = useRef(onFinish);
  const textRef = useRef(text);
  reducedRef.current = reduced;
  onFinishRef.current = onFinish;
  textRef.current = text;
  const apiRef = useRef<{ togglePause: () => void; press: (lane: Lane) => void } | null>(null);
  const [hud, setHud] = useState<Hud>({
    songMs: -280,
    tally: emptyTally(),
    paused: false,
    judgement: null,
    live: "",
  });

  useEffect(() => {
    const current = sessionRef.current;
    const session: Session = current && current.context === audio ? current : createSession(audio);
    sessionRef.current = session;
    arm(session);
    let alive = true;
    const judged = new Set<number>();
    let tally = emptyTally();
    let paused = false;
    const flashes: Flash[] = [];
    let lastJudge: { kind: JudgementName; at: number } | null = null;
    const padMemory = new Map<number, boolean[]>();
    let lastHud = 0;
    let raf = 0;

    function publish(live?: string) {
      const age = lastJudge ? performance.now() - lastJudge.at : 1000;
      setHud({
        songMs: songMsNow(session),
        tally,
        paused,
        judgement: lastJudge && age < 700 ? lastJudge.kind : null,
        live: live ?? "",
      });
    }

    function press(lane: Lane) {
      if (!alive || paused || session.finished) return;
      const hit = pickNote(chart.notes, judged, lane, songMsNow(session), offsetMs);
      if (!hit) return;
      judged.add(hit.index);
      tally = applyJudgement(tally, hit.kind).tally;
      const at = performance.now();
      flashes.push({ lane, kind: hit.kind, at });
      lastJudge = { kind: hit.kind, at };
      publish();
    }

    function togglePause() {
      if (!alive || session.finished) return;
      paused = !paused;
      if (paused) void audio.suspend();
      else void audio.resume();
      const copyNow = textRef.current;
      publish(paused ? copyNow.pausedTitle : copyNow.resumed);
      if (paused) requestAnimationFrame(() => resumeRef.current?.focus());
    }

    function onKey(event: KeyboardEvent) {
      if (!alive) return;
      const tag = event.target instanceof Element ? event.target.tagName : "";
      if (event.key === "Escape") {
        event.preventDefault();
        togglePause();
        return;
      }
      const lane = keyboardLane(event.key, { repeat: event.repeat, tag });
      if (lane === null) return;
      event.preventDefault();
      if (paused || session.finished) return;
      press(lane);
    }

    function frame(now: number) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!paused && audio.state === "running" && !session.finished) {
        scheduleAhead(session, song);
        const songMs = songMsNow(session);
        for (const lane of pollGamepad(readNavigatorPads(navigator), padMemory)) press(lane);
        const misses = dueMisses(chart.notes, judged, songMs, offsetMs);
        if (misses.length) {
          for (const index of misses) {
            judged.add(index);
            tally = applyJudgement(tally, "miss").tally;
            const note = chart.notes[index];
            if (note) flashes.push({ lane: note.lane, kind: "miss", at: now });
          }
          lastJudge = { kind: "miss", at: now };
          publish();
        }
        if (songMs > chart.durationMs + 450) {
          session.finished = true;
          onFinishRef.current(tally);
          return;
        }
        if (now - lastHud > 180) {
          lastHud = now;
          publish();
        }
      }
      while (flashes.length > 0 && flashes[0] && now - flashes[0].at > 500) flashes.shift();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const labels = textRef.current;
      drawFrame(canvas, {
        chart,
        songMs: songMsNow(session),
        offsetMs,
        judged,
        flashes,
        judgement: lastJudge,
        combo: tally.combo,
        reduced: reducedRef.current,
        labels: { perfect: labels.perfect, good: labels.good, miss: labels.miss },
      });
    }

    apiRef.current = { togglePause, press };
    window.addEventListener("keydown", onKey);
    const onHide = () => {
      if (document.hidden && !paused && !session.finished) togglePause();
    };
    document.addEventListener("visibilitychange", onHide);
    void audio.resume().then(() => {
      if (!alive || session.finished) return;
      arm(session);
      scheduleAhead(session, song);
    });
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onHide);
      apiRef.current = null;
    };
  }, [audio, chart, offsetMs, song]);

  const name = songText(text, song.id).name;
  const progress = Math.max(0, Math.min(100, (hud.songMs / chart.durationMs) * 100));
  const shownMs = Math.max(0, hud.songMs);

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (hud.paused) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = event.clientX - rect.left;
    const lane = Math.min(3, Math.max(0, Math.floor((x / rect.width) * 4))) as Lane;
    apiRef.current?.press(lane);
  }

  return (
    <section aria-label={text.playLabel} aria-keyshortcuts="D F J K ArrowUp ArrowDown ArrowLeft ArrowRight Escape">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">{name}</h2>
          <p className="text-sm text-subtle">
            {formatTime(shownMs)} / {formatTime(chart.durationMs)}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-x-4 text-right">
          <div>
            <dt className="text-xs uppercase tracking-wide text-subtle">{text.scoreLabel}</dt>
            <dd className="font-display text-xl font-semibold" data-testid="score">
              {formatScore(hud.tally.score, lang)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-subtle">{text.accuracyLabel}</dt>
            <dd className="font-display text-xl font-semibold" data-testid="accuracy">
              {judgedCount(hud.tally) === 0 ? "–" : `${formatAccuracy(accuracyOf(hud.tally), lang)} %`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-subtle">{text.comboLabel}</dt>
            <dd className="font-display text-xl font-semibold" data-testid="combo">
              {hud.tally.combo}
            </dd>
          </div>
        </dl>
      </div>
      <div
        className="timer mb-3"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={chart.durationMs}
        aria-valuenow={Math.round(Math.max(0, Math.min(chart.durationMs, hud.songMs)))}
        aria-label={text.timeLabel}
      >
        <span className="timer-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {hud.live}
      </p>
      <div className="stage-wrap panel" data-testid="playfield">
        <canvas
          ref={canvasRef}
          className="stage-canvas"
          aria-hidden="true"
          onPointerDown={onPointerDown}
        />
        <div className="lane-keys" aria-hidden="true">
          {(["D", "F", "J", "K"] as const).map((key) => (
            <span key={key} className="keycap">
              {key}
            </span>
          ))}
        </div>
        {hud.paused ? (
          <div className="pause-layer" role="dialog" aria-modal="true" aria-labelledby="pause-title">
            <h3 id="pause-title" className="font-display text-3xl font-semibold">
              {text.pausedTitle}
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              <button ref={resumeRef} type="button" className="btn btn-primary" data-testid="resume" onClick={() => apiRef.current?.togglePause()}>
                {text.resume}
              </button>
              <button type="button" className="btn btn-ghost" data-testid="abort" onClick={onAbort}>
                {text.abort}
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-subtle">D F J K · ↑ → ↓ ←</p>
        <button type="button" className="btn btn-ghost" data-testid="pause" onClick={() => apiRef.current?.togglePause()}>
          {text.pause}
        </button>
      </div>
    </section>
  );
}
