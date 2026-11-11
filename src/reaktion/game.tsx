import { useEffect, useRef, useState } from "react";
import { createBeeper, type Beeper } from "./beep.ts";
import { assignPads, keyboardPress, pollPads, readNavigatorPads, type Pad } from "./input.ts";
import { fill, type Copy } from "./messages.ts";
import {
  ANSWER_WINDOW_MS,
  applyPress,
  applyReveal,
  applyTimeout,
  advance,
  createSession,
  fastestDuel,
  pickDelay,
  pickSymbol,
  SETTLE_MS,
  SOLO_ROUNDS,
  summarizeSolo,
  type DuelGoal,
  type DuelRow,
  type FaceSymbol,
  type InputStyle,
  type PlayerId,
  type PlayMode,
  type PressInput,
  type RoundState,
  type Session,
  type SoloRow,
} from "./rules.ts";
import { BEST_KEY, consider, emptyBest, loadBest, resetBest, saveBest, slotFor, type BestTimes, type StorageLike } from "./storage.ts";
import { FaceMark } from "./symbols.tsx";

type View =
  | { name: "setup" }
  | { name: "play"; session: Session }
  | { name: "summary"; session: Session; improved: boolean };

const keycaps: Record<PlayerId, Record<FaceSymbol, string>> = {
  p1: { triangle: "W", square: "A", cross: "S", circle: "D" },
  p2: { triangle: "I", square: "J", cross: "K", circle: "L" },
};

const faceOrder: FaceSymbol[] = ["triangle", "square", "circle", "cross"];

function browserStore(storage: Storage, probe: string): StorageLike | null {
  try {
    storage.getItem(probe);
    return storage;
  } catch {
    return null;
  }
}

function readBest(): BestTimes {
  try {
    return loadBest(localStorage).times;
  } catch {
    return emptyBest();
  }
}

function playerName(text: Copy, player: PlayerId): string {
  return player === "p1" ? text.player1 : text.player2;
}

function stagePhase(round: RoundState): "waiting" | "live" | "correct" | "false-start" | "wrong" {
  if (round.phase === "waiting") return "waiting";
  if (round.phase === "live") return "live";
  if (round.outcome?.kind === "correct") return "correct";
  if (round.outcome?.kind === "false-start") return "false-start";
  return "wrong";
}

export function Game({ text }: { text: Copy }) {
  const [mode, setMode] = useState<PlayMode>("duel");
  const [inputStyle, setInputStyle] = useState<InputStyle>("match");
  const [goal, setGoal] = useState<DuelGoal>(3);
  const [sound, setSound] = useState(false);
  const [view, setView] = useState<View>({ name: "setup" });
  const [best, setBest] = useState<BestTimes>(readBest);
  const [resetNote, setResetNote] = useState("");
  const [pads, setPads] = useState<{ p1: Pad | null; p2: Pad | null }>({ p1: null, p2: null });
  const beeper = useRef<Beeper | null>(null);
  if (!beeper.current) beeper.current = createBeeper();
  const bestRef = useRef(best);
  bestRef.current = best;
  const savedRows = useRef(0);
  const improvedRef = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const styleRef = useRef<InputStyle>(inputStyle);
  styleRef.current = view.name === "setup" ? inputStyle : view.session.style;
  const pressRef = useRef<(player: PlayerId, input: PressInput, now: number) => void>(() => {});

  pressRef.current = (player, input, now) => {
    setView((current) => {
      if (current.name !== "play") return current;
      const session = applyPress(current.session, now, player, input);
      if (session === current.session) return current;
      return { name: "play", session };
    });
  };

  useEffect(() => () => beeper.current?.close(), []);

  useEffect(() => {
    const memory = new Map<number, boolean[]>();
    let frame = 0;
    let sig = "";
    const tick = () => {
      const list = readNavigatorPads(navigator);
      const assigned = assignPads(list);
      const nextSig = `${assigned.p1?.index ?? "-"}:${assigned.p1?.id ?? ""}|${assigned.p2?.index ?? "-"}:${assigned.p2?.id ?? ""}`;
      if (nextSig !== sig) {
        sig = nextSig;
        setPads(assigned);
      }
      if (viewRef.current.name === "play") {
        const now = performance.now();
        for (const event of pollPads(list, memory, styleRef.current)) {
          pressRef.current(event.player, event.input, now);
        }
      } else if (memory.size > 0) {
        memory.clear();
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    const wake = () => undefined;
    window.addEventListener("gamepadconnected", wake);
    window.addEventListener("gamepaddisconnected", wake);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("gamepadconnected", wake);
      window.removeEventListener("gamepaddisconnected", wake);
    };
  }, []);

  useEffect(() => {
    if (view.name === "setup") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setView({ name: "setup" });
        return;
      }
      if (viewRef.current.name !== "play") return;
      const tag = event.target instanceof Element ? event.target.tagName : "";
      const press = keyboardPress(event.key, viewRef.current.session.style, { repeat: event.repeat, tag });
      if (!press) return;
      event.preventDefault();
      pressRef.current(press.player, press.input, performance.now());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view.name]);

  const waitingKey = view.name === "play" && view.session.round.phase === "waiting" ? `${view.session.roundNumber}:${view.session.round.startedAt}` : "";

  useEffect(() => {
    if (view.name !== "play" || view.session.round.phase !== "waiting") return;
    const startedAt = view.session.round.startedAt;
    const due = startedAt + view.session.round.delayMs;
    const id = window.setTimeout(() => {
      // setTimeout can fire a millisecond early. Revealing at `due` keeps the symbol on time.
      const at = Math.max(performance.now(), due);
      setView((current) => {
        if (current.name !== "play") return current;
        if (current.session.round.phase !== "waiting" || current.session.round.startedAt !== startedAt) return current;
        return { name: "play", session: applyReveal(current.session, at) };
      });
    }, Math.max(0, due - performance.now()));
    return () => window.clearTimeout(id);
  }, [waitingKey]);

  const liveKey =
    view.name === "play" && view.session.round.phase === "live" && view.session.round.revealedAt !== null
      ? `${view.session.roundNumber}:${view.session.round.revealedAt}`
      : "";

  useEffect(() => {
    if (view.name !== "play" || view.session.round.phase !== "live" || view.session.round.revealedAt === null) return;
    const revealedAt = view.session.round.revealedAt;
    const due = revealedAt + ANSWER_WINDOW_MS;
    const id = window.setTimeout(() => {
      const at = Math.max(performance.now(), due);
      setView((current) => {
        if (current.name !== "play" || current.session.round.revealedAt !== revealedAt) return current;
        return { name: "play", session: applyTimeout(current.session, at) };
      });
    }, Math.max(0, due - performance.now()));
    return () => window.clearTimeout(id);
  }, [liveKey]);

  const resolvedKey =
    view.name === "play" && view.session.round.phase === "resolved"
      ? `${view.session.roundNumber}:${view.session.soloRows.length}:${view.session.duelRows.length}`
      : "";

  useEffect(() => {
    if (!resolvedKey || view.name !== "play") return;
    const id = window.setTimeout(() => {
      setView((current) => {
        if (current.name !== "play" || current.session.round.phase !== "resolved") return current;
        if (current.session.finished) return { name: "summary", session: current.session, improved: improvedRef.current };
        const now = performance.now();
        return { name: "play", session: advance(current.session, now, pickDelay(Math.random), pickSymbol(Math.random)) };
      });
    }, SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [resolvedKey, view.name]);

  const rowCount = view.name === "setup" ? 0 : view.session.soloRows.length + view.session.duelRows.length;

  useEffect(() => {
    if (view.name === "setup") {
      savedRows.current = 0;
      return;
    }
    const rows = view.session.mode === "solo" ? view.session.soloRows : view.session.duelRows;
    if (rows.length <= savedRows.current) return;
    const fresh = rows.slice(savedRows.current);
    savedRows.current = rows.length;
    let times = bestRef.current;
    let changed = false;
    const slot = slotFor(view.session.mode, view.session.style);
    for (const row of fresh) {
      const ok = "kind" in row ? row.kind === "correct" : row.reason === "correct";
      if (!ok || row.ms === null) continue;
      const next = consider(times, slot, row.ms);
      times = next.times;
      if (next.improved) changed = true;
    }
    if (!changed) return;
    bestRef.current = times;
    improvedRef.current = true;
    setBest(times);
    try {
      const store = browserStore(localStorage, BEST_KEY);
      if (store) saveBest(store, times);
    } catch {
      // The best time stays on screen for this view.
    }
  }, [rowCount]);

  const outcomeKey =
    view.name === "play" && view.session.round.phase === "live"
      ? `${view.session.roundNumber}:live`
      : view.name === "play" && view.session.round.phase === "resolved"
        ? `${view.session.roundNumber}:${view.session.round.outcome?.kind ?? "done"}`
        : "";

  useEffect(() => {
    if (view.name !== "play") return;
    const round = view.session.round;
    if (round.phase === "live") beeper.current?.play("go");
    else if (round.outcome?.kind === "correct") beeper.current?.play("good");
    else if (round.outcome) beeper.current?.play("bad");
  }, [outcomeKey]);

  useEffect(() => {
    if (view.name === "play") document.getElementById("arena")?.focus();
    if (view.name === "summary") document.getElementById("result-title")?.focus();
  }, [view.name]);

  function start() {
    savedRows.current = 0;
    improvedRef.current = false;
    setResetNote("");
    const now = performance.now();
    setView({
      name: "play",
      session: createSession({
        now,
        delayMs: pickDelay(Math.random),
        symbol: pickSymbol(Math.random),
        mode,
        style: inputStyle,
        goal,
      }),
    });
  }

  function toggleSound() {
    const current = beeper.current;
    if (!current) return;
    if (sound) {
      current.disable();
      setSound(false);
      return;
    }
    setSound(current.enable());
  }

  function clearBests() {
    const blank = emptyBest();
    bestRef.current = blank;
    setBest(blank);
    try {
      const store = browserStore(localStorage, BEST_KEY);
      if (!store) {
        setResetNote(text.bestResetFailed);
        return;
      }
      setResetNote(resetBest(store) ? text.bestResetDone : text.bestResetFailed);
    } catch {
      setResetNote(text.bestResetFailed);
    }
  }

  function hit(player: PlayerId, input: PressInput) {
    return (event: { preventDefault(): void; button?: number; repeat?: boolean; key?: string }) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.repeat) return;
      if (event.key !== undefined && event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      pressRef.current(player, input, performance.now());
    };
  }

  return (
    <div data-testid="reaktion-game">
      {view.name === "setup" ? (
        <Setup
          text={text}
          mode={mode}
          inputStyle={inputStyle}
          goal={goal}
          sound={sound}
          best={best}
          resetNote={resetNote}
          pads={pads}
          onMode={setMode}
          onStyle={setInputStyle}
          onGoal={setGoal}
          onSound={toggleSound}
          onStart={start}
          onReset={clearBests}
        />
      ) : null}
      {view.name === "play" ? <Arena text={text} session={view.session} onHit={hit} onStop={() => setView({ name: "setup" })} /> : null}
      {view.name === "summary" ? (
        <Summary text={text} session={view.session} improved={view.improved} onAgain={start} onBack={() => setView({ name: "setup" })} />
      ) : null}
    </div>
  );
}

function Setup({
  text,
  mode,
  inputStyle,
  goal,
  sound,
  best,
  resetNote,
  pads,
  onMode,
  onStyle,
  onGoal,
  onSound,
  onStart,
  onReset,
}: {
  text: Copy;
  mode: PlayMode;
  inputStyle: InputStyle;
  goal: DuelGoal;
  sound: boolean;
  best: BestTimes;
  resetNote: string;
  pads: { p1: Pad | null; p2: Pad | null };
  onMode: (mode: PlayMode) => void;
  onStyle: (style: InputStyle) => void;
  onGoal: (goal: DuelGoal) => void;
  onSound: () => void;
  onStart: () => void;
  onReset: () => void;
}) {
  const base = import.meta.env.BASE_URL;
  const none = best.solo === null && best.soloEasy === null && best.duel === null && best.duelEasy === null;
  return (
    <>
      <p className="eyebrow text-xs font-medium uppercase text-steel">{text.eyebrow}</p>
      <h1 className="display-title mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
      <p className="mt-4">
        <a href={base} className="text-sm font-medium text-steel underline-offset-4 hover:underline">
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

      <section className="panel mt-8 rounded-xl px-4 py-5 sm:px-6" aria-labelledby="play-setup">
        <h2 id="play-setup" className="font-display text-2xl font-semibold tracking-tight">
          {text.start}
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          <div role="group" aria-label={text.modeLabel} className="flex flex-wrap gap-2">
            <button type="button" data-testid="mode-solo" aria-pressed={mode === "solo"} className={mode === "solo" ? "btn btn-primary" : "btn btn-ghost"} onClick={() => onMode("solo")}>
              {text.modeSolo}
            </button>
            <button type="button" data-testid="mode-duel" aria-pressed={mode === "duel"} className={mode === "duel" ? "btn btn-primary" : "btn btn-ghost"} onClick={() => onMode("duel")}>
              {text.modeDuel}
            </button>
          </div>
          <div role="group" aria-label={text.styleLabel} className="flex flex-wrap gap-2">
            <button type="button" data-testid="style-match" aria-pressed={inputStyle === "match"} className={inputStyle === "match" ? "btn btn-primary" : "btn btn-ghost"} onClick={() => onStyle("match")}>
              {text.styleMatch}
            </button>
            <button type="button" data-testid="style-easy" aria-pressed={inputStyle === "easy"} className={inputStyle === "easy" ? "btn btn-primary" : "btn btn-ghost"} onClick={() => onStyle("easy")}>
              {text.styleEasy}
            </button>
          </div>
          {mode === "duel" ? (
            <div role="group" aria-label={text.goalLabel} className="flex flex-wrap gap-2">
              <button type="button" data-testid="goal-3" aria-pressed={goal === 3} className={goal === 3 ? "btn btn-primary" : "btn btn-ghost"} onClick={() => onGoal(3)}>
                {text.goal3}
              </button>
              <button type="button" data-testid="goal-5" aria-pressed={goal === 5} className={goal === 5 ? "btn btn-primary" : "btn btn-ghost"} onClick={() => onGoal(5)}>
                {text.goal5}
              </button>
            </div>
          ) : null}
          <button type="button" data-testid="sound" aria-pressed={sound} className="btn btn-ghost self-start" onClick={onSound}>
            {sound ? text.soundOn : text.soundOff}
          </button>
          <button type="button" data-testid="start" className="btn btn-primary self-start px-8 text-base" onClick={onStart}>
            {text.start}
          </button>
        </div>
      </section>

      <section className="mt-6" aria-labelledby="pads-heading">
        <h2 id="pads-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.padsHeading}
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          <PadCard testId="pad-p1" name={text.player1} pad={pads.p1} connected={text.connected} disconnected={text.disconnected} />
          <PadCard testId="pad-p2" name={text.player2} pad={pads.p2} connected={text.connected} disconnected={text.disconnected} />
        </ul>
      </section>

      <section className="panel mt-6 rounded-xl px-4 py-5 sm:px-6" aria-labelledby="map-title">
        <h2 id="map-title" className="font-display text-2xl font-semibold tracking-tight">
          {text.mapTitle}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <KeyMap name={text.player1} player="p1" symbols={text.symbols} />
          <KeyMap name={text.player2} player="p2" symbols={text.symbols} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <p className="panel rounded-lg px-3 py-2 text-sm text-fg">
            {text.player1}: <kbd className="keycap">A</kbd>
          </p>
          <p className="panel rounded-lg px-3 py-2 text-sm text-fg">
            {text.player2}: <kbd className="keycap">L</kbd>
          </p>
        </div>
        <div className="mt-4 max-w-2xl space-y-2 text-sm leading-relaxed text-muted">
          <p>{text.mapP1}</p>
          <p>{text.mapP2}</p>
          <p>{text.mapEasy}</p>
          <p>{text.mapPad}</p>
          <p>{text.tapHint}</p>
        </div>
      </section>

      <section className="mt-6" aria-labelledby="best-title">
        <h2 id="best-title" className="font-display text-2xl font-semibold tracking-tight">
          {text.bestTitle}
        </h2>
        {none ? <p className="mt-3 text-sm text-muted">{text.bestEmpty}</p> : null}
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <BestLine label={`${text.modeSolo} · ${text.styleMatch}`} ms={best.solo} />
          <BestLine label={`${text.modeSolo} · ${text.styleEasy}`} ms={best.soloEasy} />
          <BestLine label={`${text.modeDuel} · ${text.styleMatch}`} ms={best.duel} />
          <BestLine label={`${text.modeDuel} · ${text.styleEasy}`} ms={best.duelEasy} />
        </ul>
        <button type="button" data-testid="reset-best" className="btn btn-ghost mt-4" onClick={onReset}>
          {text.bestReset}
        </button>
        {resetNote ? (
          <p role="status" className="mt-3 text-sm text-muted">
            {resetNote}
          </p>
        ) : null}
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-subtle">{text.storageNote}</p>
      </section>

      <section className="mt-8 max-w-2xl" aria-labelledby="rules-title">
        <h2 id="rules-title" className="font-display text-2xl font-semibold tracking-tight">
          {text.rulesTitle}
        </h2>
        <ul className="mt-3 flex list-disc flex-col gap-3 pl-5 text-base leading-relaxed text-muted">
          <li>{text.ruleDelay}</li>
          <li>{text.ruleFalseStart}</li>
          <li>{text.ruleWrong}</li>
          <li>{text.ruleWindow}</li>
          <li>{text.ruleSolo}</li>
          <li>{text.ruleDuel}</li>
          <li>{text.ruleEasy}</li>
        </ul>
      </section>
    </>
  );
}

function PadCard({
  testId,
  name,
  pad,
  connected,
  disconnected,
}: {
  testId: string;
  name: string;
  pad: Pad | null;
  connected: string;
  disconnected: string;
}) {
  return (
    <li data-testid={testId} className="panel rounded-xl px-4 py-4">
      <p className="font-display text-lg font-semibold">{name}</p>
      <p className="mt-1 text-sm text-muted">{pad ? connected : disconnected}</p>
      {pad ? <p className="mt-1 break-anywhere text-sm text-fg">{pad.id || `#${pad.index}`}</p> : null}
    </li>
  );
}

function KeyMap({ name, player, symbols }: { name: string; player: PlayerId; symbols: Copy["symbols"] }) {
  return (
    <div>
      <p className="text-sm font-medium text-fg">{name}</p>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {faceOrder.map((symbol) => (
          <li key={symbol} className="flex items-center gap-2 text-sm text-muted">
            <span className={`sym-${symbol} font-display text-xl leading-none`} aria-hidden="true">
              {symbol === "cross" ? "×" : symbol === "circle" ? "○" : symbol === "square" ? "□" : "△"}
            </span>
            <span>
              {symbols[symbol]} <kbd className="keycap">{keycaps[player][symbol]}</kbd>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BestLine({ label, ms }: { label: string; ms: number | null }) {
  return (
    <li className="panel flex items-baseline justify-between gap-3 rounded-lg px-3 py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-display text-lg font-semibold tabular-nums">{ms === null ? "—" : `${ms} ms`}</span>
    </li>
  );
}

function Arena({
  text,
  session,
  onHit,
  onStop,
}: {
  text: Copy;
  session: Session;
  onHit: (player: PlayerId, input: PressInput) => (event: { preventDefault(): void; button?: number; repeat?: boolean; key?: string }) => void;
  onStop: () => void;
}) {
  const round = session.round;
  const phaseName = stagePhase(round);
  const copy = resultCopy(text, round);
  const players: PlayerId[] = session.mode === "duel" ? ["p1", "p2"] : ["p1"];
  return (
    <div className="play-screen">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-lg font-semibold">
          {session.mode === "solo"
            ? fill(text.roundLabel, { n: Math.min(session.roundNumber, SOLO_ROUNDS), total: SOLO_ROUNDS })
            : fill(text.toGoal, { n: session.goal })}
        </p>
        {session.mode === "duel" ? (
          <p className="flex items-baseline gap-3 font-display text-lg font-semibold tabular-nums" data-testid="score">
            <span>{text.player1}</span>
            <span>
              {session.scores.p1}
              <span className="px-2 text-subtle">:</span>
              {session.scores.p2}
            </span>
            <span>{text.player2}</span>
          </p>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={onStop}>
          {text.cancel}
        </button>
      </div>
      <div id="arena" tabIndex={-1} data-testid="stage" data-phase={phaseName} className={`stage panel stage-${phaseName}`}>
        {phaseName === "waiting" ? <div className="ready-ring" aria-hidden="true" /> : null}
        {phaseName === "live" && session.style === "match" ? (
          <div data-testid="symbol" data-symbol={round.symbol}>
            <FaceMark symbol={round.symbol} live />
          </div>
        ) : null}
        {phaseName === "correct" && session.style === "match" ? (
          <div className="stage-echo" aria-hidden="true">
            <FaceMark symbol={round.symbol} />
          </div>
        ) : null}
        <div role="status" aria-live="polite" aria-atomic="true" data-testid="live" className="stage-live">
          <p
            className={`announce announce-${phaseName}${phaseName === "live" && session.style === "easy" ? " now-mark face-live" : ""}`}
            data-testid={phaseName === "false-start" ? "false-start" : phaseName === "live" && session.style === "easy" ? "symbol" : undefined}
            data-symbol={phaseName === "live" && session.style === "easy" ? "now" : undefined}
          >
            {copy.headline}
          </p>
          {copy.detail ? <p className="stage-detail">{copy.detail}</p> : null}
        </div>
      </div>
      {phaseName === "waiting" || phaseName === "live" ? (
        <p className="mt-3 text-center text-sm text-subtle">{session.style === "easy" ? text.tapHint : text.playHint}</p>
      ) : null}
      <div className={`mt-4 grid gap-4 ${players.length === 2 ? "md:grid-cols-2" : ""}`}>
        {players.map((player) => (
          <div key={player} className="panel rounded-xl px-3 py-3">
            <p className="mb-2 text-center text-sm font-medium text-fg">{playerName(text, player)}</p>
            {session.style === "easy" ? (
              <button type="button" className="tap-zone" data-testid={`tap-${player}`} onPointerDown={onHit(player, "any")} onKeyDown={onHit(player, "any")}>
                <span>{playerName(text, player)}</span>
                <kbd className="keycap">{player === "p1" ? "A" : "L"}</kbd>
              </button>
            ) : (
              <div className="diamond">
                {faceOrder.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    data-symbol={symbol}
                    className={`face-btn face-${symbol}`}
                    onPointerDown={onHit(player, symbol)}
                    onKeyDown={onHit(player, symbol)}
                  >
                    <span aria-hidden="true">{symbol === "cross" ? "×" : symbol === "circle" ? "○" : symbol === "square" ? "□" : "△"}</span>
                    <kbd className="keycap">{keycaps[player][symbol]}</kbd>
                    <span className="sr-only">{text.symbols[symbol]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function resultCopy(text: Copy, round: RoundState): { headline: string; detail: string } {
  if (round.phase === "waiting") return { headline: text.ready, detail: "" };
  if (round.phase === "live") {
    const locked = round.locked.p1 || round.locked.p2 ? text.wrongDuel : "";
    if (round.style === "easy") return { headline: text.now, detail: locked };
    return { headline: text.symbols[round.symbol], detail: locked };
  }
  const outcome = round.outcome;
  if (outcome?.kind === "correct") return { headline: `${outcome.ms} ms`, detail: text.symbols[round.symbol] };
  if (outcome?.kind === "false-start") {
    const award = outcome.awardedTo ? fill(text.falseStartAward, { player: playerName(text, outcome.awardedTo) }) : text.wrongSolo;
    return { headline: text.falseStart, detail: award };
  }
  if (outcome?.kind === "wrong") return { headline: text.wrong, detail: text.wrongSolo };
  const bothWrong = round.locked.p1 === "wrong" && round.locked.p2 === "wrong";
  return { headline: bothWrong ? text.miss : text.timeout, detail: round.mode === "duel" ? text.miss : text.wrongSolo };
}

function Summary({
  text,
  session,
  improved,
  onAgain,
  onBack,
}: {
  text: Copy;
  session: Session;
  improved: boolean;
  onAgain: () => void;
  onBack: () => void;
}) {
  const solo = summarizeSolo(session.soloRows);
  const fast = fastestDuel(session.duelRows);
  const winner = session.mode === "duel" && session.matchWinner ? fill(text.wins, { player: playerName(text, session.matchWinner) }) : text.soloDone;
  return (
    <section data-testid="summary" className="summary-screen" aria-labelledby="result-title">
      <p className="eyebrow text-xs font-medium uppercase text-steel">{text.thisRun}</p>
      <h2 id="result-title" tabIndex={-1} data-testid={session.matchWinner ? "winner" : "solo-summary"} className="winner-name mt-3 font-display font-semibold tracking-tight">
        {winner}
      </h2>
      {session.mode === "duel" ? (
        <p className="score-read mt-2 font-display font-semibold tabular-nums" data-testid="final-score">
          {fill(text.score, { a: session.scores.p1, b: session.scores.p2 })}
        </p>
      ) : null}
      <div role="status" aria-live="polite" className="mt-4 max-w-xl text-lg text-muted">
        {session.mode === "solo" ? (
          <p>
            {text.average}: {solo.averageMs === null ? text.noValid : `${solo.averageMs} ms`}
            {" · "}
            {text.best}: {solo.bestMs === null ? text.noValid : `${solo.bestMs} ms`}
          </p>
        ) : (
          <p>
            {text.fastest}: {fast === null ? text.noValid : `${fast} ms`}
          </p>
        )}
        {improved ? <p className="mt-2 text-fg">{text.newBest}</p> : null}
      </div>
      <h3 className="mt-8 font-display text-2xl font-semibold">{text.roundsHeading}</h3>
      <ol className="mt-3 flex max-w-xl flex-col gap-2">
        {session.mode === "solo" ? session.soloRows.map((row, index) => <SoloLine key={index} text={text} index={index} row={row} />) : session.duelRows.map((row, index) => <DuelLine key={index} text={text} index={index} row={row} />)}
      </ol>
      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={onAgain}>
          {text.again}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          {text.back}
        </button>
      </div>
    </section>
  );
}

function SoloLine({ text, index, row }: { text: Copy; index: number; row: SoloRow }) {
  const label =
    row.kind === "correct" && row.ms !== null
      ? `${text.symbols[row.symbol]} · ${row.ms} ms`
      : row.kind === "false-start"
        ? text.falseStart
        : row.kind === "wrong"
          ? text.wrong
          : text.timeout;
  return (
    <li className="panel flex items-baseline justify-between gap-3 rounded-lg px-3 py-2">
      <span className="text-sm text-subtle">{index + 1}</span>
      <span className="flex-1 text-base text-fg">{label}</span>
    </li>
  );
}

function DuelLine({ text, index, row }: { text: Copy; index: number; row: DuelRow }) {
  const who = row.winner ? playerName(text, row.winner) : text.miss;
  const detail =
    row.reason === "correct" && row.ms !== null
      ? `${row.ms} ms`
      : row.reason === "false-start"
        ? text.falseStart
        : text.timeout;
  return (
    <li className="panel flex items-baseline justify-between gap-3 rounded-lg px-3 py-2">
      <span className="text-sm text-subtle">{index + 1}</span>
      <span className="flex-1 text-base text-fg">
        {who}
        {row.reason === "correct" ? ` · ${text.symbols[row.symbol]}` : ""}
      </span>
      <span className="font-display font-semibold tabular-nums">{detail}</span>
    </li>
  );
}
