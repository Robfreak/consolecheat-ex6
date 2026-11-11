import { useEffect, useRef, useState } from "react";
import {
  addProfile,
  addSplit,
  deleteProfile,
  deleteSplit,
  editingLocked,
  moveSplit,
  renameSplit,
  selectProfile,
  updateProfile,
  type EditResult,
} from "./editor.ts";
import { pollPadEdges, readNavigatorPads, shortcutForKey, type Shortcut } from "./input.ts";
import { fill, type Copy } from "./messages.ts";
import {
  activeProfile,
  bestPossibleTime,
  comparisonGolds,
  comparisonPb,
  createId,
  cumulativeDelta,
  elapsedMs,
  formatClock,
  formatDelta,
  freshRun,
  isNewGold,
  isPbCandidate,
  needsResetConfirm,
  pbSegment,
  previousSegmentDelta,
  resetKind,
  segmentTime,
  sumOfBest,
  type Run,
  type Store,
} from "./model.ts";
import { dispatch, type RunResult } from "./run.ts";
import { loadStore, saveStore, type StorageLike } from "./storage.ts";
import { exportJson, importInto, type StoreIssue } from "./transfer.ts";

function browserStore(): StorageLike | null {
  try {
    localStorage.getItem("consolecheat-speedrun-v1");
    return localStorage;
  } catch {
    return null;
  }
}

function tone(delta: number | null): string {
  if (delta == null) return "delta-none";
  if (delta < 0) return "delta-ahead";
  if (delta > 0) return "delta-behind";
  return "delta-even";
}

function describe(text: Copy, result: RunResult): string {
  const event = result.event;
  if (!event) return "";
  const profile = activeProfile(result.store);
  if (event.kind === "start") return text.announceStart;
  if (event.kind === "undo") return text.announceUndo;
  if (event.kind === "pause") return text.announcePause;
  if (event.kind === "resume") return text.announceResume;
  if (event.kind === "reset") return text.announceReset;
  if (event.kind === "save-pb") return text.announceSave;
  if (event.kind === "decline-pb") return "";
  if (event.kind === "skip") return fill(text.announceSkip, { name: profile.splits[event.index]?.name ?? "" });
  if (event.kind === "finish") {
    const template = event.pb ? text.announceFinishPb : text.announceFinish;
    const line = fill(template, { time: formatClock(event.time) });
    const last = result.run.completed.length - 1;
    const gold = last >= 0 && isNewGold(comparisonGolds(result.run, profile), result.run.completed, last);
    return gold ? `${line} ${text.gold}.` : line;
  }
  const name = profile.splits[event.index]?.name ?? "";
  const delta =
    event.delta == null
      ? text.noComparison
      : `${formatDelta(event.delta)} ${event.delta < 0 ? text.ahead : event.delta > 0 ? text.behind : text.even}`;
  const line = fill(text.announceSplit, { name, time: formatClock(event.time), delta });
  return event.gold ? `${line} ${text.gold}.` : line;
}

function Field({
  id,
  label,
  value,
  disabled,
  onCommit,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <label className="block text-sm font-medium text-muted" htmlFor={id}>
      {label}
      <input
        id={id}
        className="field mt-1"
        value={draft}
        disabled={disabled}
        maxLength={80}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft.trim() === value) return;
          onCommit(draft);
        }}
      />
    </label>
  );
}

export function Board({ text, hidden, merklisteHref }: { text: Copy; hidden: boolean; merklisteHref: string }) {
  const initial = useState(() => {
    const local = browserStore();
    return local ? loadStore(local) : { store: loadStore({ getItem: () => null, setItem() {}, removeItem() {} }).store, persist: false, issue: "blocked" as const };
  })[0];
  const [store, setStore] = useState<Store>(initial.store);
  const [persist, setPersist] = useState(initial.persist);
  const [run, setRun] = useState<Run>(freshRun);
  const [now, setNow] = useState(() => performance.now());
  const [live, setLive] = useState("");
  const [banner, setBanner] = useState("");
  const [bannerAlert, setBannerAlert] = useState(false);
  const [storageFailed, setStorageFailed] = useState(initial.issue === "blocked");
  const [resetOpen, setResetOpen] = useState(false);
  const [draftSplit, setDraftSplit] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const hiddenRef = useRef(hidden);
  const resetRef = useRef(resetOpen);
  const stateRef = useRef({ store, run });
  const applyRef = useRef<(action: Shortcut, stamp: number) => void>(() => {});
  hiddenRef.current = hidden;
  resetRef.current = resetOpen;
  stateRef.current = { store, run };

  useEffect(() => {
    if (!persist) return;
    const local = browserStore();
    if (!local) {
      setStorageFailed(true);
      return;
    }
    setStorageFailed(!saveStore(local, store));
  }, [persist, store]);

  useEffect(() => {
    if (resetOpen) confirmRef.current?.focus();
  }, [resetOpen]);

  function commit(result: RunResult, previous: Store) {
    stateRef.current = { store: result.store, run: result.run };
    setStore(result.store);
    setRun(result.run);
    if (result.store !== previous) setPersist(true);
    if (result.event && result.event.kind !== "decline-pb") setLive(describe(text, result));
    if (result.event?.kind === "reset") setResetOpen(false);
  }

  function applyEdit(result: EditResult) {
    if (!result.ok) {
      setBanner(result.reason === "running" || result.reason === "pb-pending" ? text.editorLocked : text.importIssues.invalid);
      setBannerAlert(true);
      return;
    }
    stateRef.current = { store: result.store, run: result.run };
    setStore(result.store);
    setRun(result.run);
    setPersist(true);
    setBanner("");
  }

  applyRef.current = (action, stamp) => {
    if (hiddenRef.current) return;
    const current = stateRef.current;
    if (action === "reset") {
      if (needsResetConfirm(current.run, activeProfile(current.store))) {
        setResetOpen(true);
        return;
      }
    }
    if (resetRef.current && action !== "reset") return;
    const result = dispatch(current.store, current.run, action, stamp);
    commit(result, current.store);
    setNow(stamp);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && resetRef.current) {
        event.preventDefault();
        setResetOpen(false);
        return;
      }
      const target = event.target instanceof Element ? event.target : null;
      const shortcut = shortcutForKey(event.key, {
        repeat: event.repeat,
        tag: target?.tagName,
        dialog: resetRef.current,
      });
      if (!shortcut) return;
      event.preventDefault();
      applyRef.current(shortcut, performance.now());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastCs = -1;
    const memory = new Map<number, boolean[]>();
    const tick = () => {
      const stamp = performance.now();
      if (stateRef.current.run.phase === "running") {
        const cs = Math.floor(stamp / 10);
        if (cs !== lastCs) {
          lastCs = cs;
          setNow(stamp);
        }
      }
      if (!hiddenRef.current && !resetRef.current) {
        for (const action of pollPadEdges(readNavigatorPads(navigator), memory)) {
          applyRef.current(action, performance.now());
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const onVisible = () => setNow(performance.now());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const profile = activeProfile(store);
  const locked = editingLocked(store, run);
  const elapsed = elapsedMs(run, now);
  const pb = comparisonPb(run, profile);
  const golds = comparisonGolds(run, profile);
  const sob = sumOfBest(profile.bestSegments);
  const possible = bestPossibleTime(profile, run, now);
  const previous = previousSegmentDelta(profile, run);
  const savedPb = profile.pb && profile.pb.length ? profile.pb[profile.pb.length - 1] : null;
  const offerPb = isPbCandidate(profile, run) && !run.pbDeclined;
  const kind = resetKind(run, profile);
  const phaseLabel =
    run.phase === "running" ? text.phaseRunning : run.phase === "paused" ? text.phasePaused : run.phase === "finished" ? text.phaseFinished : text.phaseIdle;
  const primaryLabel = run.phase === "idle" ? text.start : text.split;

  function showIssue(issue: StoreIssue) {
    if (issue === "blocked") {
      setBanner(text.storageFailed);
    } else {
      setBanner(text.importIssues[issue]);
    }
    setBannerAlert(true);
  }

  function onImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const textBody = typeof reader.result === "string" ? reader.result : "";
      const current = stateRef.current;
      if (editingLocked(current.store, current.run)) {
        setBanner(text.editorLocked);
        setBannerAlert(true);
        return;
      }
      const result = importInto(current.store, textBody, file.size);
      if (result.issue || result.store === current.store) {
        if (result.issue) showIssue(result.issue);
        return;
      }
      stateRef.current = { store: result.store, run: freshRun() };
      setStore(result.store);
      setRun(freshRun());
      setPersist(true);
      setBanner(text.importOk);
      setBannerAlert(false);
    };
    reader.readAsText(file);
  }

  function exportFile() {
    const blob = new Blob([exportJson(store)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "speedrun-timer.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div hidden={hidden} className="flex flex-1 flex-col">
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

        <section className="timer-well mt-8 px-4 py-6 sm:px-8 sm:py-8" aria-labelledby="timer-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="timer-heading" className="font-display text-lg font-semibold tracking-tight">
              {profile.game} · {profile.category}
            </h2>
            <p className="phase-pill" data-testid="phase">
              {phaseLabel}
            </p>
          </div>
          <p className="timer-digits mt-4" data-testid="timer-digits">
            <span className="sr-only">{text.timerLabel} </span>
            {formatClock(elapsed)}
          </p>
          <p className={`mt-3 font-mono text-xl ${tone(previous)}`} data-testid="previous-delta">
            {text.previousLabel}: {previous == null ? text.emptyTime : formatDelta(previous)}
            {previous != null ? <span className="sr-only"> {previous < 0 ? text.ahead : previous > 0 ? text.behind : text.even}</span> : null}
          </p>
          <p className="mt-3 min-h-6 text-sm text-[#d5deea]" aria-live="polite" aria-atomic="true" data-testid="live-region">
            <span className="sr-only">{text.liveLabel}: </span>
            {live}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              aria-keyshortcuts="Space"
              disabled={run.phase === "paused" || run.phase === "finished" || profile.splits.length === 0}
              onClick={() => applyRef.current("start-split", performance.now())}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              aria-keyshortcuts="Backspace"
              disabled={run.phase === "idle" || run.completed.length === 0}
              onClick={() => applyRef.current("undo", performance.now())}
            >
              {text.undo}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              aria-keyshortcuts="S"
              disabled={run.phase !== "running"}
              onClick={() => applyRef.current("skip", performance.now())}
            >
              {text.skip}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              aria-keyshortcuts="P"
              aria-pressed={run.phase === "paused"}
              disabled={run.phase === "idle" || run.phase === "finished"}
              onClick={() => applyRef.current("pause", performance.now())}
            >
              {run.phase === "paused" ? text.resume : text.pause}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              aria-keyshortcuts="R"
              disabled={run.phase === "idle"}
              onClick={() => applyRef.current("reset", performance.now())}
            >
              {text.reset}
            </button>
          </div>
          {profile.splits.length === 0 ? <p className="mt-4 text-sm text-[#d5deea]">{text.noSplits}</p> : null}
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat testId="attempts" label={text.attemptsLabel} value={String(profile.attempts)} />
          <Stat testId="pb" label={text.pbLabel} value={savedPb == null ? text.emptyTime : formatClock(savedPb)} />
          <Stat testId="sob" label={text.sobLabel} value={sob == null ? text.emptyTime : formatClock(sob)} />
          <Stat testId="bpt" label={text.bptLabel} value={possible == null ? text.emptyTime : formatClock(possible)} />
        </div>

        {offerPb ? (
          <div className="panel mt-4 rounded-xl px-4 py-4" role="region" aria-labelledby="pb-offer-title" data-testid="pb-offer">
            <h2 id="pb-offer-title" className="font-display text-xl font-semibold">
              {text.savePbTitle}
            </h2>
            <p className="mt-2 text-muted">{text.savePbBody}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" onClick={() => commit(dispatch(store, run, "save-pb", performance.now()), store)}>
                {text.savePbYes}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => commit(dispatch(store, run, "decline-pb", performance.now()), store)}>
                {text.savePbNo}
              </button>
            </div>
          </div>
        ) : null}

        {resetOpen ? (
          <div className="panel mt-4 rounded-xl px-4 py-4" role="alertdialog" aria-labelledby="reset-ask" data-testid="reset-confirm">
            <p id="reset-ask" className="text-base leading-relaxed text-fg">
              {kind === "gold" ? text.confirmGold : kind === "pb" ? text.confirmPb : text.confirmMid}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                ref={confirmRef}
                type="button"
                className="btn btn-bad"
                onClick={() => {
                  const current = stateRef.current;
                  commit(dispatch(current.store, current.run, "reset", performance.now()), current.store);
                }}
              >
                {text.confirmYes}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setResetOpen(false)}>
                {text.confirmNo}
              </button>
            </div>
          </div>
        ) : null}

        <section className="panel mt-6 rounded-xl px-3 py-3 sm:px-4" aria-labelledby="splits-heading">
          <h2 id="splits-heading" className="px-2 pt-2 font-display text-2xl font-semibold tracking-tight">
            {text.editorTitle}
          </h2>
          <div className="split-scroll mt-3">
            <table className="split-table" data-testid="split-table">
              <caption className="sr-only">{text.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{text.colSplit}</th>
                  <th scope="col" className="num">
                    {text.colSegment}
                  </th>
                  <th scope="col" className="num">
                    {text.colTime}
                  </th>
                  <th scope="col" className="num">
                    {text.colDelta}
                  </th>
                </tr>
              </thead>
              <tbody>
                {profile.splits.map((split, index) => {
                  const done = index < run.completed.length;
                  const current = (run.phase === "running" || run.phase === "paused") && index === run.completed.length;
                  const completedValue = run.completed[index];
                  const segment = done ? segmentTime(run.completed, index) : current ? liveSegment(run, elapsed, index) : pbSegment(pb, index);
                  const time = done
                    ? typeof completedValue === "number"
                      ? completedValue
                      : null
                    : current
                      ? elapsed
                      : pb
                        ? pb[index]
                        : null;
                  const delta = cumulativeDelta(pb, run.completed, index, current ? elapsed : null);
                  const gold = done && isNewGold(golds, run.completed, index);
                  return (
                    <tr key={split.id} className={`${current ? "is-current" : ""} ${gold ? "is-gold" : ""}`} aria-current={current ? "step" : undefined} data-testid="split-row">
                      <th scope="row" className="text-left font-sans font-semibold">
                        {split.name}
                        {gold ? <span className="gold-badge">{text.gold}</span> : null}
                      </th>
                      <td className="num">
                        {done && completedValue === "skip" ? text.skipped : segment == null ? text.emptyTime : formatClock(segment)}
                        {current && segment != null ? <span className="sr-only"> {text.segmentLive}</span> : null}
                      </td>
                      <td className="num">{done && completedValue === "skip" ? text.skipped : time == null ? text.emptyTime : formatClock(time)}</td>
                      <td className={`num ${tone(delta)}`} data-delta={delta == null ? "" : String(Math.trunc(delta))}>
                        {delta == null ? text.emptyTime : formatDelta(delta)}
                        {delta != null ? (
                          <span className="sr-only"> {delta < 0 ? text.ahead : delta > 0 ? text.behind : text.even}</span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel mt-6 rounded-xl px-4 py-4" aria-labelledby="editor-heading" data-testid="editor">
          <h2 id="editor-heading" className="font-display text-2xl font-semibold tracking-tight">
            {text.profileLabel}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-subtle">{locked ? text.editorLocked : text.editorHint}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-muted" htmlFor="speedrun-profile">
              {text.profileLabel}
              <select
                id="speedrun-profile"
                className="field mt-1"
                value={profile.id}
                disabled={locked}
                onChange={(event) => applyEdit(selectProfile(store, run, event.target.value))}
              >
                {store.profiles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.game} · {item.category}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={locked}
                onClick={() =>
                  applyEdit(
                    addProfile(store, run, {
                      id: createId("profile"),
                      game: text.newGame,
                      category: text.newCategory,
                      attempts: 0,
                      splits: [{ id: createId("split"), name: text.newSplitName }],
                      pb: null,
                      bestSegments: [null],
                      splitsVersion: 1,
                    }),
                  )
                }
              >
                {text.newProfile}
              </button>
              <button
                type="button"
                className="btn btn-bad"
                disabled={locked || store.profiles.length < 2}
                onClick={() => applyEdit(deleteProfile(store, run, profile.id))}
              >
                {text.deleteProfile}
              </button>
            </div>
            <Field
              id="speedrun-game"
              label={text.gameLabel}
              value={profile.game}
              disabled={locked}
              onCommit={(value) => applyEdit(updateProfile(store, run, value, profile.category))}
            />
            <Field
              id="speedrun-category"
              label={text.categoryLabel}
              value={profile.category}
              disabled={locked}
              onCommit={(value) => applyEdit(updateProfile(store, run, profile.game, value))}
            />
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {profile.splits.map((split, index) => (
              <li key={split.id} className="flex flex-wrap items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Field
                    id={`split-name-${split.id}`}
                    label={`${text.splitName} ${index + 1}`}
                    value={split.name}
                    disabled={locked}
                    onCommit={(value) => applyEdit(renameSplit(store, run, split.id, value))}
                  />
                </div>
                <button type="button" className="btn btn-ghost" disabled={locked || index === 0} onClick={() => applyEdit(moveSplit(store, run, split.id, -1))}>
                  {text.moveUp}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={locked || index === profile.splits.length - 1}
                  onClick={() => applyEdit(moveSplit(store, run, split.id, 1))}
                >
                  {text.moveDown}
                </button>
                <button type="button" className="btn btn-bad" disabled={locked} onClick={() => applyEdit(deleteSplit(store, run, split.id))}>
                  {text.deleteSplit}
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const result = addSplit(store, run, draftSplit, createId("split"));
              applyEdit(result);
              if (result.ok) setDraftSplit("");
            }}
          >
            <label className="block min-w-48 flex-1 text-sm font-medium text-muted" htmlFor="speedrun-new-split">
              {text.addSplit}
              <input
                id="speedrun-new-split"
                className="field mt-1"
                value={draftSplit}
                disabled={locked}
                maxLength={80}
                onChange={(event) => setDraftSplit(event.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={locked || draftSplit.trim().length === 0}>
              {text.addSplit}
            </button>
          </form>
        </section>

        <section className="mt-6 flex flex-col gap-3" aria-labelledby="transfer-heading">
          <h2 id="transfer-heading" className="font-display text-2xl font-semibold tracking-tight">
            JSON
          </h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={exportFile}>
              {text.exportJson}
            </button>
            <button type="button" className="btn btn-ghost" disabled={locked} onClick={() => fileRef.current?.click()}>
              {text.importJson}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label={text.importJson}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onImport(file);
              }}
            />
          </div>
          {banner ? (
            <p role={bannerAlert ? "alert" : "status"} data-testid="import-error" className="text-sm text-fg">
              {banner}
            </p>
          ) : null}
          {storageFailed ? <p className="text-sm text-fg">{text.storageFailed}</p> : null}
        </section>

        <section className="mt-8 max-w-3xl" aria-labelledby="controls-heading">
          <h2 id="controls-heading" className="font-display text-2xl font-semibold tracking-tight">
            {text.controlsHeading}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">{text.controls}</p>
          <p className="mt-3 text-sm leading-relaxed text-subtle">{text.backgroundNote}</p>
        </section>
      </main>
    </div>
  );
}

function Stat({ testId, label, value }: { testId: string; label: string; value: string }) {
  return (
    <div className="panel rounded-xl px-4 py-3" data-testid={testId}>
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</p>
      <p className="mt-1 font-mono text-lg text-fg">{value}</p>
    </div>
  );
}

function liveSegment(run: Run, elapsed: number, index: number): number | null {
  if (index === 0) return elapsed;
  const previous = run.completed[index - 1];
  if (typeof previous !== "number") return null;
  return Math.max(0, elapsed - previous);
}
