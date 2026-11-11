import { useEffect, useMemo, useRef, useState } from "react";
import { scheduleClick } from "./audio.ts";
import { generateChart, type Difficulty } from "./beatmap.ts";
import { formatAccuracy, formatOffset, formatScore, formatTime } from "./format.ts";
import { lanes, keyboardLane } from "./input.ts";
import { accuracyOf, emptyTally, type Tally } from "./judgement.ts";
import { difficultyLabel, fill, songText, type Copy, type Lang } from "./messages.ts";
import { Playfield } from "./playfield.tsx";
import { songById, songDurationMs, songs, type SongId } from "./songs.ts";
import {
  CALIBRATION_BEATS,
  calibrationBeats,
  emptySave,
  loadSave,
  offsetFromTaps,
  resetSave,
  SAVE_KEY,
  saveState,
  scoreId,
  withOffset,
  withScore,
  type RhythmSave,
  type StorageLike,
} from "./storage.ts";

type Phase = "select" | "calibrate" | "play" | "result";

function reducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function browserStore(): StorageLike | null {
  try {
    localStorage.getItem(SAVE_KEY);
    return localStorage;
  } catch {
    return null;
  }
}

const arrowMark: Record<(typeof lanes)[number]["arrow"], string> = {
  ArrowUp: "↑",
  ArrowRight: "→",
  ArrowDown: "↓",
  ArrowLeft: "←",
};

const symbolMark: Record<(typeof lanes)[number]["symbol"], string> = {
  triangle: "△",
  circle: "○",
  cross: "×",
  square: "□",
};

export function Game({ text, lang }: { text: Copy; lang: Lang }) {
  const initial = useMemo(() => {
    try {
      return loadSave(localStorage);
    } catch {
      return { save: emptySave(), persist: false };
    }
  }, []);
  const [phase, setPhase] = useState<Phase>("select");
  const [songId, setSongId] = useState<SongId>("nachtmarkt");
  const [difficulty, setDifficulty] = useState<Difficulty>("leicht");
  const [save, setSave] = useState<RhythmSave>(initial.save);
  const [notice, setNotice] = useState("");
  const [tally, setTally] = useState<Tally>(emptyTally);
  const [improved, setImproved] = useState(false);
  const [reduced, setReduced] = useState(reducedMotion);
  const [tapCount, setTapCount] = useState(0);
  const [audio, setAudio] = useState<AudioContext | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const tapsRef = useRef<number[]>([]);
  const beatsRef = useRef<number[]>([]);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  const song = songById(songId);
  const chart = useMemo(() => generateChart(song, difficulty), [song, difficulty]);
  const best = save.scores[scoreId(songId, difficulty)];

  useEffect(() => {
    let media: MediaQueryList;
    try {
      media = matchMedia("(prefers-reduced-motion: reduce)");
    } catch {
      return;
    }
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (phase === "result") resultRef.current?.focus();
  }, [phase]);

  function unlock(): AudioContext | null {
    try {
      const previous = audioRef.current;
      if (previous && previous.state !== "closed") void previous.close();
      const ctx = new AudioContext();
      audioRef.current = ctx;
      void ctx.resume();
      setAudio(ctx);
      return ctx;
    } catch {
      return null;
    }
  }

  function finishCalibration(offset: number | null) {
    void audioRef.current?.suspend();
    setPhase("select");
    if (offset === null) {
      setNotice(text.calibrateFailed);
      return;
    }
    const next = withOffset(saveRef.current, offset);
    const store = browserStore();
    if (!store || !saveState(store, next)) {
      setNotice(text.saveFailed);
      setSave(next);
      return;
    }
    setSave(next);
    setNotice(fill(text.calibrateDone, { offset: formatOffset(next.offsetMs, lang) }));
  }

  const finishCalRef = useRef(finishCalibration);
  finishCalRef.current = finishCalibration;

  useEffect(() => {
    if (phase !== "calibrate") return;
    const ctx = audioRef.current;
    if (!ctx) return;
    let alive = true;
    let raf = 0;
    const last = beatsRef.current[beatsRef.current.length - 1] ?? 0;
    const tick = () => {
      if (!alive) return;
      if (ctx.currentTime * 1000 > last + 500) {
        alive = false;
        finishCalRef.current(offsetFromTaps(tapsRef.current, beatsRef.current));
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const tag = event.target instanceof Element ? event.target.tagName : "";
      if (event.key === "Escape") {
        event.preventDefault();
        alive = false;
        void ctx.suspend();
        setPhase("select");
        return;
      }
      const lane = keyboardLane(event.key, { repeat: false, tag });
      const space = event.key === " " || event.key === "Spacebar";
      if (lane === null && !space) return;
      event.preventDefault();
      tapsRef.current = [...tapsRef.current, ctx.currentTime * 1000];
      setTapCount(tapsRef.current.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase]);

  function beginCalibrate() {
    const ctx = unlock();
    if (!ctx) {
      setNotice(text.audioFailed);
      return;
    }
    const beats = calibrationBeats(ctx.currentTime * 1000);
    beatsRef.current = beats;
    tapsRef.current = [];
    setTapCount(0);
    for (const beat of beats) scheduleClick(ctx, beat / 1000);
    setNotice("");
    setPhase("calibrate");
  }

  function addPointerTap() {
    const ctx = audioRef.current;
    if (!ctx || phase !== "calibrate") return;
    tapsRef.current = [...tapsRef.current, ctx.currentTime * 1000];
    setTapCount(tapsRef.current.length);
  }

  function changeOffset(raw: string) {
    const next = withOffset(save, Number(raw));
    setSave(next);
    const store = browserStore();
    if (!store || !saveState(store, next)) setNotice(text.saveFailed);
    else setNotice("");
  }

  function resetScores() {
    const store = browserStore();
    if (!store || !resetSave(store)) {
      setNotice(text.resetFailed);
      return;
    }
    setSave(emptySave());
    setNotice(text.resetDone);
  }

  function startGame() {
    const ctx = unlock();
    if (!ctx) {
      setNotice(text.audioFailed);
      return;
    }
    setImproved(false);
    setNotice("");
    setPhase("play");
    window.scrollTo(0, 0);
  }

  function onFinish(result: Tally) {
    void audioRef.current?.suspend();
    const id = scoreId(songId, difficulty);
    const entry = { score: result.score, accuracy: accuracyOf(result), maxCombo: result.maxCombo };
    const updated = withScore(saveRef.current, id, entry);
    let stored = false;
    if (updated.improved) {
      const store = browserStore();
      stored = Boolean(store && saveState(store, updated.save));
      if (stored) {
        setSave(updated.save);
        setNotice("");
      } else setNotice(text.saveFailed);
    }
    setImproved(stored);
    setTally(result);
    setPhase("result");
    window.scrollTo(0, 0);
  }

  function onAbort() {
    void audioRef.current?.suspend();
    setPhase("select");
  }

  if (phase === "play" && audio) {
    return (
      <Playfield
        song={song}
        chart={chart}
        offsetMs={save.offsetMs}
        reduced={reduced}
        text={text}
        lang={lang}
        audio={audio}
        onFinish={onFinish}
        onAbort={onAbort}
      />
    );
  }

  if (phase === "result") {
    const summary = fill(text.resultSummary, { perfect: tally.perfect, good: tally.good, miss: tally.miss });
    return (
      <section className="panel rounded-xl px-4 py-6 sm:px-6" data-testid="result">
        <div role="status" aria-live="assertive" aria-atomic="true">
          <h2 ref={resultRef} tabIndex={-1} className="font-display text-3xl font-semibold tracking-tight">
            {text.resultTitle}
          </h2>
          <p className="mt-2 text-lg text-muted">{songText(text, songId).name}</p>
          <p className="mt-4 font-display text-4xl font-semibold tracking-tight" data-testid="result-score">
            {formatScore(tally.score, lang)}
          </p>
          <p className="mt-2 text-lg">
            {text.accuracyLabel} {formatAccuracy(accuracyOf(tally), lang)} %
          </p>
          <p className="mt-1 text-lg">
            {text.maxComboLabel} {tally.maxCombo}
          </p>
          <p className="mt-3 text-base text-muted">{summary}</p>
          {improved ? <p className="mt-3 font-medium text-ok">{text.newBest}</p> : null}
          {notice ? <p className="mt-3 text-sm text-muted">{notice}</p> : null}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" data-testid="again" onClick={startGame}>
            {text.again}
          </button>
          <button type="button" className="btn btn-ghost" data-testid="other-song" onClick={() => setPhase("select")}>
            {text.otherSong}
          </button>
        </div>
      </section>
    );
  }

  if (phase === "calibrate") {
    return (
      <section className="panel rounded-xl px-4 py-6 sm:px-6" aria-labelledby="cal-title">
        <h2 id="cal-title" className="font-display text-3xl font-semibold tracking-tight">
          {text.calibrate}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{text.calibrateHint}</p>
        <button
          type="button"
          className="cal-pad mt-6"
          data-testid="cal-tap"
          onPointerDown={(event) => {
            event.preventDefault();
            addPointerTap();
          }}
        >
          {text.calibrateTap}
        </button>
        <p className="mt-4 text-sm text-subtle" role="status" aria-live="polite">
          {fill(text.calibrateCount, { n: tapCount, total: CALIBRATION_BEATS })}
        </p>
        <button
          type="button"
          className="btn btn-ghost mt-4"
          onClick={() => {
            void audioRef.current?.suspend();
            setPhase("select");
          }}
        >
          {text.calibrateCancel}
        </button>
      </section>
    );
  }

  return (
    <>
      <p className="eyebrow text-xs font-medium uppercase text-steel">{text.eyebrow}</p>
      <h1 className="display-title mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
      <p className="mt-4">
        <a href={import.meta.env.BASE_URL} className="text-sm font-medium text-steel underline-offset-4 hover:underline">
          {text.merkliste}
        </a>
      </p>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{text.lede}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.freeClaim}</p>
        <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.privacyClaim}</p>
      </div>
      <p className="mt-4 text-sm text-subtle">{text.unofficial}</p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-subtle">{text.temporary}</p>
      <p className="mt-2 text-sm text-subtle">
        {text.related}:{" "}
        <a
          href="https://robfreak.github.io/consolecheat-ex3/"
          data-testid="controller-link"
          className="text-steel underline-offset-4 hover:underline"
        >
          {text.controller}
        </a>
      </p>

      <section className="mt-10" aria-labelledby="songs-heading">
        <h2 id="songs-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.songsHeading}
        </h2>
        <div className="song-grid mt-4" role="group" aria-label={text.songsHeading}>
          {songs.map((item) => {
            const named = songText(text, item.id);
            const selected = item.id === songId;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`song-${item.id}`}
                aria-pressed={selected}
                className={`panel rounded-xl px-4 py-4 text-left ${selected ? "ring-select" : ""}`}
                onClick={() => setSongId(item.id)}
              >
                <span className="block font-display text-xl font-semibold">{named.name}</span>
                <span className="mt-1 block text-sm text-muted">{named.blurb}</span>
                <span className="mt-2 block text-sm text-subtle">
                  {fill(text.bpmLine, { bpm: item.bpm, time: formatTime(songDurationMs(item)) })}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="difficulty-heading">
        <h2 id="difficulty-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.difficultyLabel}
        </h2>
        <div className="segment mt-4" role="group" aria-label={text.difficultyLabel}>
          {(["leicht", "mittel", "schwer"] as const).map((id) => (
            <button
              key={id}
              type="button"
              data-testid={`diff-${id}`}
              aria-pressed={difficulty === id}
              onClick={() => setDifficulty(id)}
            >
              {difficultyLabel(text, id)}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-subtle">{fill(text.notesLine, { n: chart.notes.length })}</p>
      </section>

      <section className="panel mt-8 rounded-xl px-4 py-5 sm:px-6" aria-labelledby="map-heading">
        <h2 id="map-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.mappingTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{text.mappingHint}</p>
        <ol className="lane-map mt-4">
          {lanes.map((lane) => (
            <li key={lane.lane} className={`lane-card sym-${lane.symbol}`} data-testid={`map-${lane.lane}`}>
              <span className="lane-symbol" aria-hidden="true">
                {symbolMark[lane.symbol]}
              </span>
              <span className="sr-only">{symbolMark[lane.symbol]}</span>
              <span className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="keycap">{lane.key.toUpperCase()}</span>
                <span className="keycap">{arrowMark[lane.arrow]}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6">
        <button type="button" className="btn btn-primary" data-testid="start" onClick={startGame}>
          {text.start}
        </button>
        <p className="mt-2 text-sm text-subtle">{text.ruleAudio}</p>
      </div>

      <section className="panel mt-8 rounded-xl px-4 py-5 sm:px-6" aria-labelledby="offset-heading">
        <h2 id="offset-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.offsetLabel}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{text.offsetHint}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="offset-slider">
            {text.offsetLabel}
          </label>
          <input
            id="offset-slider"
            data-testid="offset"
            className="offset-slider"
            type="range"
            min={-200}
            max={200}
            step={1}
            value={save.offsetMs}
            onChange={(event) => changeOffset(event.target.value)}
            aria-valuetext={`${formatOffset(save.offsetMs, lang)} ms`}
          />
          <span className="font-display text-lg font-semibold" data-testid="offset-value">
            {formatOffset(save.offsetMs, lang)} ms
          </span>
        </div>
        <button type="button" className="btn btn-ghost mt-4" data-testid="calibrate" onClick={beginCalibrate}>
          {text.calibrate}
        </button>
      </section>

      <section className="panel mt-8 rounded-xl px-4 py-5 sm:px-6" aria-labelledby="best-heading">
        <h2 id="best-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.bestTitle}
        </h2>
        <p className="mt-3 text-sm text-subtle">
          {songText(text, songId).name} · {difficultyLabel(text, difficulty)}
        </p>
        {best ? (
          <p className="mt-2 text-lg" data-testid="best-line">
            {fill(text.bestLine, {
              score: formatScore(best.score, lang),
              accuracy: formatAccuracy(best.accuracy, lang),
              combo: best.maxCombo,
            })}
          </p>
        ) : (
          <p className="mt-2 text-base text-muted">{text.bestEmpty}</p>
        )}
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-subtle">{text.storageNote}</p>
        <button type="button" className="btn btn-ghost mt-4" data-testid="reset-scores" onClick={resetScores}>
          {text.resetScores}
        </button>
        {notice ? (
          <p className="mt-3 text-sm text-muted" role="status">
            {notice}
          </p>
        ) : null}
      </section>

      <section className="mt-8" aria-labelledby="rules-heading">
        <h2 id="rules-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.rulesTitle}
        </h2>
        <ul className="mt-3 flex max-w-3xl flex-col gap-2 text-sm leading-relaxed text-muted">
          <li>{text.ruleLanes}</li>
          <li>{text.ruleTiming}</li>
          <li>{text.ruleScore}</li>
          <li>{text.rulePause}</li>
        </ul>
      </section>
    </>
  );
}
