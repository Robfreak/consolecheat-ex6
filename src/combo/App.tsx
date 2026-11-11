import { useEffect, useRef, useState } from "react";
import { BUILTINS, builtinById } from "./combos.ts";
import { Dialog, SiteFooter, SiteHeader, type Theme } from "./chrome.tsx";
import { addCustom, createId, deleteCustom, readBest, readStats, updateCustom, type CustomCombo, type SaveFile } from "./customs.ts";
import { isDirectionKey } from "./direction.ts";
import { Editor } from "./editor.tsx";
import { buttonFromKey, eventsFromKeys, isTypingTarget, pollPads, readNavigatorPads, type PadMemory } from "./input.ts";
import { LegalPage } from "./legal.tsx";
import {
  buttonLabel,
  comboTitle,
  copy,
  fill,
  formatRate,
  initialLang,
  stepPhrase,
  type Copy,
  type Lang,
} from "./messages.ts";
import { DIRECTION_GLYPH } from "./notation.ts";
import { TouchControls } from "./pad.tsx";
import { addPaletteStep, moveStep, recordInput, removeStep } from "./record.ts";
import { pushHistory } from "./history.ts";
import { feed, feedClock, freshSession, type LastResult, type Session } from "./session.ts";
import { hitRate } from "./stats.ts";
import { LANG_KEY, SAVE_KEY, THEME_KEY, defaultFile, loadFile, resetCombo, saveFile, withResult, type StorageLike } from "./storage.ts";
import { FaceMark } from "./symbols.tsx";
import { footerTools } from "./tools.ts";
import { WINDOW_MAX, WINDOW_MIN, clampWindow, type Direction, type FaceButton, type LayoutId, type Step, type TrainerInput } from "./types.ts";
import { withinWindow } from "./timing.ts";

type Page = "home" | "impressum" | "datenschutz";

type EditorState = {
  id: string | null;
  name: string;
  windowText: string;
  steps: Step[];
  direction: Direction | null;
  button: FaceButton | null;
  recording: boolean;
  notice: string;
};

type Active = {
  id: string;
  steps: readonly Step[];
  window: number | null;
  customName?: string;
  builtin: boolean;
};

const LAYOUT_KEYS: Record<LayoutId, { key: string; button: FaceButton }[]> = {
  jkli: [
    { key: "J", button: "square" },
    { key: "K", button: "triangle" },
    { key: "L", button: "cross" },
    { key: "I", button: "circle" },
  ],
  uijk: [
    { key: "U", button: "square" },
    { key: "I", button: "triangle" },
    { key: "J", button: "cross" },
    { key: "K", button: "circle" },
  ],
};

function readLang(): Lang {
  try {
    return initialLang(localStorage.getItem(LANG_KEY));
  } catch {
    return "de";
  }
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function readPage(): Page {
  const hash = location.hash.replace(/^#\/?/, "");
  if (hash === "impressum") return "impressum";
  if (hash === "datenschutz") return "datenschutz";
  return "home";
}

function applyTheme(next: Theme, store: boolean) {
  document.documentElement.dataset.theme = next;
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", next === "light" ? "#f4f1eb" : "#07090e");
  if (!store) return;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // The toggle still updates the page when storage is blocked.
  }
}

function browserStore(storage: Storage, probe: string): StorageLike | null {
  try {
    storage.getItem(probe);
    return storage;
  } catch {
    return null;
  }
}

function loadInitial(): SaveFile {
  const local = browserStore(localStorage, THEME_KEY);
  if (!local) return defaultFile();
  return loadFile(local);
}

function activeOf(file: SaveFile, id: string): Active {
  const builtin = builtinById(id);
  if (builtin) return { id: builtin.id, steps: builtin.steps, window: null, builtin: true };
  const custom = file.customs.find((combo) => combo.id === id);
  if (custom) return { id: custom.id, steps: custom.steps, window: custom.window, customName: custom.name, builtin: false };
  const fallback = BUILTINS[0];
  return { id: fallback?.id ?? "hadouken", steps: fallback?.steps ?? [], window: null, builtin: true };
}

function freshRuntime(): Pick<Session, "attempt" | "history" | "last"> {
  const session = freshSession({ attempts: 0, successes: 0, streak: 0 }, { bestStreak: 0, bestHitRate: 0, bestTotalFrames: null });
  return { attempt: session.attempt, history: [], last: null };
}

function uniqueId(file: SaveFile): string {
  for (let index = 0; index < 6; index += 1) {
    const id = createId();
    if (!file.customs.some((combo) => combo.id === id)) return id;
  }
  return createId();
}

export function App() {
  const [lang, setLang] = useState<Lang>(readLang);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [page, setPage] = useState<Page>(readPage);
  const [file, setFile] = useState<SaveFile>(loadInitial);
  const [selectedId, setSelectedId] = useState("hadouken");
  const [runtime, setRuntime] = useState(freshRuntime);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [padName, setPadName] = useState<string | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const [banner, setBanner] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const text = copy[lang];
  const base = import.meta.env.BASE_URL;
  const here = `${base}combo/`;
  const merklisteHref = base;
  const screenHref = `${base}bildschirm/`;
  const downloadHref = `${base}download/`;
  const buttonsHref = `${base}tasten/`;
  const hdrHref = `${base}hdr/`;
  const audioHref = `${base}audio/`;
  const usbHref = `${base}usb/`;
  const reaktionHref = `${base}reaktion/`;
  const quizHref = `${base}quiz/`;
  const rhythmusHref = `${base}rhythmus/`;
  const speedrunHref = `${base}speedrun/`;
  const avatarHref = `${base}avatar/`;
  const turnierHref = `${base}turnier/`;

  const fileRef = useRef(file);
  const runtimeRef = useRef(runtime);
  const editorRef = useRef(editor);
  const selectedRef = useRef(selectedId);
  const layoutRef = useRef(file.layout);
  const activeRef = useRef(activeOf(file, selectedId));
  const ingestRef = useRef<(input: TrainerInput) => void>(() => {});
  const touchDir = useRef<Direction | null>(null);
  const lastDirection = useRef<Direction | null>(null);
  fileRef.current = file;
  runtimeRef.current = runtime;
  editorRef.current = editor;
  selectedRef.current = selectedId;
  layoutRef.current = file.layout;
  activeRef.current = activeOf(file, selectedId);
  const active = activeRef.current;
  const windowFrames = active.window ?? file.window;
  const stats = readStats(file, active.id);
  const best = readBest(file, active.id);

  function openPage(next: Page, event?: { preventDefault: () => void }) {
    event?.preventDefault();
    const url = new URL(location.href);
    url.hash = next === "home" ? "" : next;
    history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setPage(next);
    window.scrollTo(0, 0);
  }

  function persist(next: SaveFile) {
    fileRef.current = next;
    setFile(next);
    const local = browserStore(localStorage, THEME_KEY);
    if (!local) {
      setStorageFailed(true);
      return;
    }
    try {
      saveFile(local, next);
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  }

  ingestRef.current = (input: TrainerInput) => {
    const editing = editorRef.current;
    if (editing) {
      if (editing.recording) {
        const nextEditor = { ...editing, steps: recordInput(editing.steps, input) };
        editorRef.current = nextEditor;
        setEditor(nextEditor);
      }
      const runtimeNext = { ...runtimeRef.current, history: pushHistory(runtimeRef.current.history, input) };
      runtimeRef.current = runtimeNext;
      setRuntime(runtimeNext);
      return;
    }
    const current = activeRef.current;
    const frames = current.window ?? fileRef.current.window;
    const before = fileRef.current;
    const session = feed(
      {
        attempt: runtimeRef.current.attempt,
        history: runtimeRef.current.history,
        stats: readStats(before, current.id),
        best: readBest(before, current.id),
        last: runtimeRef.current.last,
      },
      current.steps,
      input,
      frames,
    );
    const runtimeNext = { attempt: session.attempt, history: session.history, last: session.last };
    runtimeRef.current = runtimeNext;
    setRuntime(runtimeNext);
    if (session.last && session.attempt.index === 0 && session.stats.attempts !== readStats(before, current.id).attempts) {
      persist(withResult(before, current.id, session.stats, session.best));
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    const name = page === "impressum" ? "Impressum" : page === "datenschutz" ? "Datenschutz" : text.title;
    document.title = `${name} · ${text.brand}`;
    if (page === "home") document.querySelector('meta[name="description"]')?.setAttribute("content", text.metaDescription);
  }, [lang, page, text]);

  useEffect(() => {
    const sync = () => setPage(readPage());
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  useEffect(() => {
    const held = new Set<string>();
    let direction: Direction | null = null;
    const emit = (keyDown: string | null, repeat: boolean) => {
      const result = eventsFromKeys({
        held: [...held],
        previous: direction,
        keyDown,
        repeat,
        layout: layoutRef.current,
        timeMs: performance.now(),
      });
      direction = result.direction;
      for (const event of result.events) ingestRef.current(event);
    };
    const onDown = (event: KeyboardEvent) => {
      const tag = event.target instanceof Element ? event.target.tagName : "";
      if (isTypingTarget(tag)) return;
      const mapped = isDirectionKey(event.key) || buttonFromKey(event.key, layoutRef.current) != null;
      if (!mapped) return;
      event.preventDefault();
      held.add(event.key);
      emit(event.key, event.repeat);
    };
    const onUp = (event: KeyboardEvent) => {
      if (!held.delete(event.key)) return;
      const tag = event.target instanceof Element ? event.target.tagName : "";
      if (isTypingTarget(tag)) return;
      emit(null, false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let memory = new Map<number, PadMemory>();
    let shown: string | null = null;
    const loop = (now: number) => {
      const pads = readNavigatorPads(navigator);
      const connected = pads.filter((pad): pad is NonNullable<typeof pad> => pad !== null && pad.connected);
      connected.sort((a, b) => a.index - b.index);
      const name = connected[0]?.id ?? null;
      if (name !== shown) {
        shown = name;
        setPadName(name);
      }
      const polled = pollPads(pads, memory, now);
      memory = polled.memory;
      for (const event of polled.events) ingestRef.current(event);
      if (!editorRef.current) {
        const current = activeRef.current;
        const frames = current.window ?? fileRef.current.window;
        const before = fileRef.current;
        const session = feedClock(
          {
            attempt: runtimeRef.current.attempt,
            history: runtimeRef.current.history,
            stats: readStats(before, current.id),
            best: readBest(before, current.id),
            last: runtimeRef.current.last,
          },
          now,
          frames,
        );
        if (session.attempt !== runtimeRef.current.attempt || session.last !== runtimeRef.current.last) {
          const runtimeNext = { attempt: session.attempt, history: session.history, last: session.last };
          runtimeRef.current = runtimeNext;
          setRuntime(runtimeNext);
          if (session.stats.attempts !== readStats(before, current.id).attempts) {
            persist(withResult(before, current.id, session.stats, session.best));
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function selectCombo(id: string) {
    selectedRef.current = id;
    setSelectedId(id);
    const next = freshRuntime();
    runtimeRef.current = next;
    setRuntime(next);
    editorRef.current = null;
    setEditor(null);
    setPendingDelete(null);
  }

  function setWindow(value: number) {
    persist({ ...fileRef.current, window: clampWindow(value) });
  }

  function setLayout(layout: LayoutId) {
    persist({ ...fileRef.current, layout });
  }

  function openNew() {
    const next: EditorState = {
      id: null,
      name: "",
      windowText: "",
      steps: [],
      direction: null,
      button: null,
      recording: false,
      notice: "",
    };
    editorRef.current = next;
    setEditor(next);
  }

  function openEdit(combo: CustomCombo) {
    selectCombo(combo.id);
    const next: EditorState = {
      id: combo.id,
      name: combo.name,
      windowText: combo.window == null ? "" : String(combo.window),
      steps: combo.steps.map((step) => ({ ...step })),
      direction: null,
      button: null,
      recording: false,
      notice: "",
    };
    editorRef.current = next;
    setEditor(next);
  }

  function patchEditor(partial: Partial<EditorState>) {
    const current = editorRef.current;
    if (!current) return;
    const next = { ...current, ...partial };
    editorRef.current = next;
    setEditor(next);
  }

  function saveEditor() {
    const current = editorRef.current;
    if (!current) return;
    const trimmed = current.windowText.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    const draft = { name: current.name, steps: current.steps, window: parsed };
    const result = current.id
      ? updateCustom(fileRef.current, current.id, draft)
      : addCustom(fileRef.current, draft, uniqueId(fileRef.current));
    if (!result.ok) {
      const notice =
        result.reason === "name"
          ? text.needName
          : result.reason === "window"
            ? text.badWindow
            : result.reason === "full"
              ? text.full
              : text.needSteps;
      patchEditor({ notice });
      return;
    }
    persist(result.file);
    const id = current.id ?? result.file.customs[result.file.customs.length - 1]?.id ?? "hadouken";
    selectedRef.current = id;
    setSelectedId(id);
    editorRef.current = null;
    setEditor(null);
    const next = freshRuntime();
    runtimeRef.current = next;
    setRuntime(next);
    setBanner(text.savedCombo);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const result = deleteCustom(fileRef.current, pendingDelete);
    setPendingDelete(null);
    if (!result.ok) return;
    persist(result.file);
    if (selectedRef.current === pendingDelete || editorRef.current?.id === pendingDelete) selectCombo("hadouken");
  }

  function wipe(): boolean {
    const empty = defaultFile();
    fileRef.current = empty;
    setFile(empty);
    selectedRef.current = "hadouken";
    setSelectedId("hadouken");
    const next = freshRuntime();
    runtimeRef.current = next;
    setRuntime(next);
    editorRef.current = null;
    setEditor(null);
    const local = browserStore(localStorage, THEME_KEY);
    if (!local) return false;
    try {
      resetCombo(local);
      return local.getItem(SAVE_KEY) == null;
    } catch {
      return false;
    }
  }

  const progress = progressOf(runtime, active.steps.length);
  const result = resultSentence(text, runtime, active.steps.length, windowFrames);
  const legend = file.layout === "jkli" ? text.legendJkli : text.legendUijk;

  return (
    <div className="flex min-h-screen flex-col" data-testid="combo-page">
      <SiteHeader
        text={text}
        lang={lang}
        theme={theme}
        onLang={(next) => {
          setLang(next);
          try {
            localStorage.setItem(LANG_KEY, next);
          } catch {
            // The choice still applies for this view.
          }
        }}
        onTheme={() => {
          const next = theme === "dark" ? "light" : "dark";
          setTheme(next);
          applyTheme(next, true);
        }}
      />
      {page === "home" ? (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <p className="eyebrow text-xs font-medium uppercase text-steel">{text.eyebrow}</p>
          <h1 className="display-title mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
          <p className="mt-4">
            <a href={merklisteHref} className="text-sm font-medium text-steel underline-offset-4 hover:underline">
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
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-subtle">{text.storageNote}</p>
          {storageFailed ? <p className="mt-3 text-sm text-bad">{text.storageFailed}</p> : null}

          <div className="trainer-grid mt-8">
            <section aria-labelledby="combo-list-heading">
              <div className="flex items-center justify-between gap-2">
                <h2 id="combo-list-heading" className="font-display text-2xl font-semibold tracking-tight">
                  {text.listHeading}
                </h2>
                <button type="button" className="btn btn-primary" onClick={openNew}>
                  {text.newCombo}
                </button>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-subtle">{text.builtinGroup}</h3>
              <ul className="mt-2 flex flex-col gap-2" data-testid="combo-list">
                {BUILTINS.map((combo) => (
                  <ComboCard
                    key={combo.id}
                    text={text}
                    name={comboTitle(text, combo.id)}
                    steps={combo.steps}
                    selected={combo.id === active.id}
                    windowFrames={file.window}
                    bestStreak={readBest(file, combo.id).bestStreak}
                    onSelect={() => selectCombo(combo.id)}
                  />
                ))}
              </ul>
              <h3 className="mt-5 text-sm font-semibold text-subtle">{text.customGroup}</h3>
              {file.customs.length === 0 ? <p className="mt-2 text-sm text-muted">{text.emptyCustoms}</p> : null}
              <ul className="mt-2 flex flex-col gap-2">
                {file.customs.map((combo) => (
                  <ComboCard
                    key={combo.id}
                    text={text}
                    name={combo.name}
                    steps={combo.steps}
                    selected={combo.id === active.id}
                    windowFrames={combo.window ?? file.window}
                    bestStreak={readBest(file, combo.id).bestStreak}
                    onSelect={() => selectCombo(combo.id)}
                    onEdit={() => openEdit(combo)}
                    onRemove={() => setPendingDelete(combo.id)}
                  />
                ))}
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-subtle">{text.builtinNote}</p>
            </section>

            <section aria-labelledby="trainer-heading">
              <h2 id="trainer-heading" className="sr-only">
                {comboTitle(text, active.id, active.customName)}
              </h2>
              <div className="hud" data-testid="hud">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <p className="font-display text-xl font-semibold">{comboTitle(text, active.id, active.customName)}</p>
                  <p className="text-sm text-slate-300">
                    {text.windowLabel} {windowFrames}f
                  </p>
                </div>
                <ol className="notation" aria-label={text.notationLabel} data-testid="notation">
                  {active.steps.map((step, index) => {
                    const state = index < progress.index ? "done" : index === progress.index && progress.failed ? "bad" : index === progress.index && progress.index < active.steps.length ? "now" : "";
                    const gap = progress.gaps[index] ?? null;
                    const tone = withinWindow(gap, windowFrames);
                    return (
                      <li key={`${index}-${step.direction ?? "n"}-${step.button ?? "n"}`} className={state} aria-current={state === "now" ? "step" : undefined}>
                        <span className="step-glyph" aria-hidden="true">
                          {step.direction ? <span className="arrow-glyph">{DIRECTION_GLYPH[step.direction]}</span> : null}
                          {step.button ? (
                            <span className={`tone-${step.button}`}>
                              <FaceMark button={step.button} />
                            </span>
                          ) : null}
                        </span>
                        <span className="sr-only">{stepPhrase(text, step.direction, step.button)}</span>
                        {index < progress.gaps.length ? (
                          <span
                            className={tone == null ? "gap gap-start" : tone ? "gap gap-ok" : "gap gap-late"}
                            title={tone == null ? text.startGap : tone ? text.onTime : text.tooLate}
                          >
                            {gap == null ? text.startGap : fill(text.gapFrames, { frames: gap })}
                            {tone == null ? "" : tone ? ` ${text.onTime}` : ` ${text.tooLate}`}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
                <p className="result" role="status" aria-live="polite" data-testid="result">
                  {result}
                </p>
                {runtime.last?.ok ? <p className="text-sm text-emerald-200">{fill(text.totalFrames, { frames: runtime.last.totalFrames })}</p> : null}
                <h3 className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">{text.historyHeading}</h3>
                {runtime.history.length === 0 ? <p className="mt-1 text-sm text-slate-400">{text.historyEmpty}</p> : null}
                <ol className="history" data-testid="history" aria-label={text.historyHeading}>
                  {runtime.history.map((entry, index) => (
                    <li key={`${entry.timeMs}-${index}`}>
                      <span aria-hidden="true">
                        {entry.direction ? DIRECTION_GLYPH[entry.direction] : ""}
                        {entry.button ? (
                          <span className={`tone-${entry.button}`}>
                            <FaceMark button={entry.button} className="face-svg face-svg-sm" />
                          </span>
                        ) : null}
                      </span>
                      <span className="sr-only">{stepPhrase(text, entry.direction, entry.button)}</span>
                      {entry.frames != null ? <span className="frames">{entry.frames}f</span> : null}
                    </li>
                  ))}
                </ol>
              </div>

              <dl className="stat-grid mt-4">
                <div>
                  <dt>{text.hitRate}</dt>
                  <dd data-testid="hit-rate">{formatRate(hitRate(stats), lang)}</dd>
                </div>
                <div>
                  <dt>{text.attempts}</dt>
                  <dd data-testid="attempts">{stats.attempts}</dd>
                </div>
                <div>
                  <dt>{text.streak}</dt>
                  <dd data-testid="streak">{stats.streak}</dd>
                </div>
              </dl>
              <div className="panel mt-3 rounded-xl px-4 py-3">
                <h3 className="text-sm font-semibold">{text.bestHeading}</h3>
                <dl className="stat-grid mt-2">
                  <div>
                    <dt>{text.bestStreak}</dt>
                    <dd>{best.bestStreak > 0 ? best.bestStreak : text.noBest}</dd>
                  </div>
                  <div>
                    <dt>{text.bestHitRate}</dt>
                    <dd>{best.bestHitRate > 0 ? formatRate(best.bestHitRate, lang) : text.noBest}</dd>
                  </div>
                  <div>
                    <dt>{text.bestFrames}</dt>
                    <dd>{best.bestTotalFrames == null ? text.noBest : best.bestTotalFrames}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium" htmlFor="frame-window">
                  {text.windowLabel}: {file.window}
                  <input
                    id="frame-window"
                    className="mt-2 w-full"
                    type="range"
                    min={WINDOW_MIN}
                    max={WINDOW_MAX}
                    step={1}
                    value={file.window}
                    onChange={(event) => setWindow(Number(event.target.value))}
                  />
                </label>
                <div>
                  <p className="text-sm font-medium">{text.layoutLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" className="btn btn-ghost" aria-pressed={file.layout === "jkli"} onClick={() => setLayout("jkli")}>
                      {text.layoutJkli}
                    </button>
                    <button type="button" className="btn btn-ghost" aria-pressed={file.layout === "uijk"} onClick={() => setLayout("uijk")}>
                      {text.layoutUijk}
                    </button>
                  </div>
                </div>
              </div>

              <section className="panel mt-4 rounded-xl px-4 py-4" aria-labelledby="legend-heading">
                <h3 id="legend-heading" className="font-display text-lg font-semibold">
                  {text.legendHeading}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text.legendDirections}</p>
                <ul className="legend mt-3">
                  {LAYOUT_KEYS[file.layout].map((item) => (
                    <li key={item.key}>
                      <kbd>{item.key}</kbd>
                      <span className={`tone-${item.button}`}>
                        <FaceMark button={item.button} />
                      </span>
                      <span>{buttonLabel(text, item.button)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-muted">{legend}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text.legendPad}</p>
                <p className="mt-2 text-sm leading-relaxed text-subtle">{text.legendTyping}</p>
              </section>

              <p className="mt-4 text-sm text-muted" data-testid="pad-status">
                {padName ? fill(text.gamepadOn, { name: padName }) : text.gamepadOff}
              </p>
              <div className="mt-3">
                <TouchControls
                  text={text}
                  onDirectionDown={(direction) => {
                    touchDir.current = direction;
                    lastDirection.current = direction;
                    ingestRef.current({ timeMs: performance.now(), direction, heldDirection: direction, heldButtons: [] });
                  }}
                  onDirectionUp={(direction) => {
                    if (touchDir.current !== direction) return;
                    touchDir.current = null;
                    ingestRef.current({ timeMs: performance.now(), direction: null, heldDirection: null, heldButtons: [] });
                  }}
                  onButton={(button) => {
                    const held = touchDir.current ?? lastDirection.current;
                    ingestRef.current({
                      timeMs: performance.now(),
                      button,
                      heldDirection: held,
                      heldButtons: [button],
                    });
                  }}
                />
              </div>
            </section>
          </div>

          {editor ? (
            <Editor
              text={text}
              title={editor.id ? text.editorEdit : text.editorNew}
              name={editor.name}
              windowText={editor.windowText}
              steps={editor.steps}
              direction={editor.direction}
              button={editor.button}
              recording={editor.recording}
              notice={editor.notice}
              onName={(name) => patchEditor({ name })}
              onWindow={(windowText) => patchEditor({ windowText })}
              onDirection={(direction) => patchEditor({ direction })}
              onButton={(button) => patchEditor({ button })}
              onAdd={() => patchEditor({ steps: addPaletteStep(editor.steps, { direction: editor.direction, button: editor.button }) })}
              onRemove={(index) => patchEditor({ steps: removeStep(editor.steps, index) })}
              onMove={(index, delta) => patchEditor({ steps: moveStep(editor.steps, index, delta) })}
              onRecord={() => patchEditor({ recording: !editor.recording })}
              onSave={saveEditor}
              onCancel={() => {
                editorRef.current = null;
                setEditor(null);
              }}
            />
          ) : null}
          {banner ? (
            <p role="status" className="mt-4 text-sm text-muted">
              {banner}
            </p>
          ) : null}
          <p className="mt-8 text-sm leading-relaxed text-subtle">{text.controls}</p>
        </main>
      ) : (
        <div className="flex-1">
          <LegalPage page={page} text={text} homeHref={here} onHome={(event) => openPage("home", event)} onDeleteAll={wipe} />
        </div>
      )}
      <SiteFooter
        text={text}
        merklisteHref={merklisteHref}
        tools={footerTools("combo", lang, {
          href: {
            merkliste: merklisteHref,
            screen: screenHref,
            download: downloadHref,
            buttons: buttonsHref,
            hdr: hdrHref,
            audio: audioHref,
            usb: usbHref,
            reaktion: reaktionHref,
            quiz: quizHref,
            rhythmus: rhythmusHref,
            speedrun: speedrunHref,
            avatar: avatarHref,
            turnier: turnierHref,
          },
        })}
        onLegal={(next, event) => openPage(next, event)}
      />
      {pendingDelete ? (
        <Dialog
          title={text.removeTitle}
          body={text.confirmRemove}
          yes={text.remove}
          no={text.cancel}
          onNo={() => setPendingDelete(null)}
          onYes={confirmDelete}
        />
      ) : null}
    </div>
  );
}

function ComboCard({
  text,
  name,
  steps,
  selected,
  windowFrames,
  bestStreak,
  onSelect,
  onEdit,
  onRemove,
}: {
  text: Copy;
  name: string;
  steps: readonly Step[];
  selected: boolean;
  windowFrames: number;
  bestStreak: number;
  onSelect: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}) {
  return (
    <li className={selected ? "combo-card is-on" : "combo-card"}>
      <button type="button" className="combo-pick" aria-pressed={selected} onClick={onSelect}>
        <span className="block font-semibold">{name}</span>
        <span className="notation notation-mini" aria-hidden="true">
          {steps.map((step, index) => (
            <span key={index} className="mini-step">
              {step.direction ? DIRECTION_GLYPH[step.direction] : ""}
              {step.button ? (
                <span className={`tone-${step.button}`}>
                  <FaceMark button={step.button} className="face-svg face-svg-sm" />
                </span>
              ) : null}
            </span>
          ))}
        </span>
        <span className="sr-only">{steps.map((step) => stepPhrase(text, step.direction, step.button)).join(", ")}</span>
        <span className="mt-1 block text-xs text-subtle">
          {windowFrames}f
          {bestStreak > 0 ? ` · ${text.bestStreak} ${bestStreak}` : ""}
        </span>
      </button>
      {onEdit || onRemove ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {onEdit ? (
            <button type="button" className="btn btn-ghost" onClick={onEdit}>
              {text.edit}
            </button>
          ) : null}
          {onRemove ? (
            <button type="button" className="btn btn-bad" onClick={onRemove}>
              {text.remove}
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function progressOf(runtime: { attempt: Session["attempt"]; last: LastResult | null }, length: number): {
  index: number;
  gaps: (number | null)[];
  failed: boolean;
} {
  if (runtime.attempt.index > 0) return { index: runtime.attempt.index, gaps: runtime.attempt.gaps, failed: false };
  if (runtime.last?.ok) return { index: length, gaps: runtime.last.gaps, failed: false };
  if (runtime.last && !runtime.last.ok) return { index: runtime.last.index, gaps: runtime.last.gaps, failed: true };
  return { index: 0, gaps: [], failed: false };
}

function resultSentence(
  text: Copy,
  runtime: { attempt: Session["attempt"]; last: LastResult | null },
  total: number,
  windowFrames: number,
): string {
  if (runtime.attempt.index > 0) return fill(text.resultLive, { step: runtime.attempt.index, total });
  const last = runtime.last;
  if (!last) return text.resultIdle;
  if (last.ok) return fill(text.resultSuccess, { frames: last.totalFrames });
  if (last.reason === "late") return fill(text.resultLate, { frames: last.frames ?? 0, window: windowFrames });
  if (last.reason === "wrong-button") return text.resultWrongButton;
  return text.resultWrongDirection;
}
