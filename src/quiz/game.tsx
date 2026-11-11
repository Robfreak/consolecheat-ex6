import { useEffect, useRef, useState } from "react";
import { catalog, snapshotMeta } from "./catalog.ts";
import { FlameIcon } from "./icons.tsx";
import { actionForKey } from "./keyboard.ts";
import { fill, modeLine, type Copy, type Lang } from "./messages.ts";
import { archiveHref, avoidKey, formatMonth, generateQuestion, kindAt, mulberry32, type Question, type Rng } from "./questions.ts";
import { applyAnswer, CLASSIC_LENGTH, ENDLESS_LIVES, newRun, TIMER_SECONDS, type QuizMode, type RunState } from "./score.ts";
import { drawShareCard, renderShareCard, SHARE_HEIGHT, SHARE_WIDTH, type ShareCard } from "./share.ts";
import { BEST_KEY, considerBest, emptyBest, parseBest, resetBest, saveBest, type BestRecord, type StorageLike } from "./storage.ts";

type Phase = "setup" | "ask" | "reveal" | "done";
type Reason = "correct" | "wrong" | "timeout";

function readBestState(): { best: BestRecord; hasKey: boolean } {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return { best: parseBest(raw).best, hasKey: raw !== null };
  } catch {
    return { best: emptyBest(), hasKey: false };
  }
}

function browserStore(): StorageLike | null {
  try {
    localStorage.getItem(BEST_KEY);
    return localStorage;
  } catch {
    return null;
  }
}

function optionText(question: Question, option: string, text: Copy): string {
  return question.kind === "month" ? formatMonth(option, text.months) : option;
}

function promptText(question: Question, text: Copy): string {
  if (question.kind === "year") return fill(text.yearPrompt, { title: question.subject });
  if (question.kind === "month") return fill(text.monthPrompt, { title: question.subject });
  return fill(text.whichPrompt, { month: formatMonth(question.subject, text.months) });
}

export function Game({ text, lang }: { text: Copy; lang: Lang }) {
  const initial = readBestState();
  const [mode, setMode] = useState<QuizMode>("classic");
  const [timer, setTimer] = useState(false);
  const [harder, setHarder] = useState(false);
  const [phase, setPhase] = useState<Phase>("setup");
  const [run, setRun] = useState<RunState>(() => newRun("classic"));
  const [settings, setSettings] = useState({ mode: "classic" as QuizMode, timer: false, harder: false });
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [reason, setReason] = useState<Reason | null>(null);
  const [gained, setGained] = useState(0);
  const [ended, setEnded] = useState(false);
  const [remaining, setRemaining] = useState(TIMER_SECONDS);
  const [best, setBest] = useState(initial.best);
  const [hasKey, setHasKey] = useState(initial.hasKey);
  const [notice, setNotice] = useState("");
  const [canShare, setCanShare] = useState(false);
  const [shareReady, setShareReady] = useState(false);
  const [shareError, setShareError] = useState(false);
  const rng = useRef<Rng>(mulberry32(1));
  const avoid = useRef(new Set<string>());
  const locked = useRef(false);
  const remainingRef = useRef(TIMER_SECONDS);
  const chooseRef = useRef<(optionIndex: number) => void>(() => {});
  const nextRef = useRef<() => void>(() => {});
  const expireRef = useRef<() => void>(() => {});
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const card: ShareCard = {
    brand: text.brand,
    title: text.title,
    scoreLabel: text.scoreLabel,
    score: String(run.score),
    streakLabel: text.streakLabel,
    streak: String(run.bestStreak),
    modeLabel: modeLine(text, settings.mode, settings.timer, settings.harder),
    detail:
      settings.mode === "classic"
        ? fill(text.summaryClassic, { correct: run.correct, total: CLASSIC_LENGTH })
        : fill(text.summaryEndless, { correct: run.correct }),
    unofficial: text.unofficial,
  };

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
        if (actionForKey(phase, event.key).type === "next" && tag === "BUTTON") return;
      }
      const action = actionForKey(phase, event.key);
      if (action.type === "ignore") return;
      event.preventDefault();
      if (action.type === "answer") chooseRef.current(action.index);
      if (action.type === "next") nextRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => {
    if (phase === "ask" || phase === "reveal" || phase === "done") window.scrollTo(0, 0);
    if (phase === "ask") questionHeading.current?.focus({ preventScroll: true });
    if (phase === "reveal") nextButton.current?.focus({ preventScroll: true });
  }, [phase, question]);

  useEffect(() => {
    if (phase !== "ask" || !settings.timer) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, TIMER_SECONDS - (performance.now() - started) / 1000);
      remainingRef.current = left;
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        expireRef.current();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, question, settings.timer]);

  useEffect(() => {
    if (phase !== "done") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancel = false;
    setShareReady(false);
    setShareError(false);
    renderShareCard(ctx, card, document.fonts)
      .then(() => {
        if (!cancel) setShareReady(true);
      })
      .catch(() => {
        if (cancel) return;
        try {
          drawShareCard(ctx, card);
          setShareReady(true);
        } catch {
          setShareError(true);
        }
      });
    return () => {
      cancel = true;
    };
  }, [phase, card.brand, card.title, card.score, card.streak, card.modeLabel, card.detail, card.unofficial, card.scoreLabel, card.streakLabel]);

  function nextQuestion(at: number, useHarder: boolean) {
    const created = generateQuestion(catalog, rng.current, kindAt(at, useHarder), avoid.current);
    avoid.current.add(avoidKey(created));
    setQuestion(created);
    setIndex(at);
    setChosen(null);
    setReason(null);
    setGained(0);
    setEnded(false);
    locked.current = false;
    remainingRef.current = TIMER_SECONDS;
    setRemaining(TIMER_SECONDS);
    setPhase("ask");
  }

  function start() {
    rng.current = mulberry32((Date.now() ^ Math.floor(Math.random() * 1_000_000_000)) >>> 0);
    avoid.current = new Set();
    const nextSettings = { mode, timer, harder };
    setSettings(nextSettings);
    setRun(newRun(mode));
    setNotice("");
    nextQuestion(0, harder);
  }

  function settle(correct: boolean, secondsLeft: number, timedOut: boolean, option: string | null) {
    if (!question || locked.current) return;
    locked.current = true;
    const result = applyAnswer(run, {
      correct,
      kind: question.kind,
      timer: settings.timer,
      secondsLeft,
    });
    setRun(result.state);
    setEnded(result.ended);
    setChosen(option);
    setReason(correct ? "correct" : timedOut ? "timeout" : "wrong");
    setGained(result.gained);
    setPhase("reveal");
  }

  function choose(optionIndex: number) {
    if (!question) return;
    const option = question.options[optionIndex];
    if (!option) return;
    const seconds = settings.timer ? remainingRef.current : TIMER_SECONDS;
    settle(option === question.correct, seconds, false, option);
  }

  function expire() {
    settle(false, 0, true, null);
  }

  chooseRef.current = choose;
  nextRef.current = goNext;
  expireRef.current = expire;

  function finish(finalRun: RunState) {
    const next = considerBest(best, finalRun.score, finalRun.bestStreak);
    if (next.improvedScore || next.improvedStreak) {
      const local = browserStore();
      if (local && saveBest(local, next.best)) {
        setBest(next.best);
        setHasKey(true);
        const parts = [next.improvedScore ? text.newScore : "", next.improvedStreak ? text.newStreak : ""].filter(Boolean);
        setNotice(parts.join(" "));
      } else {
        setNotice(text.saveFailed);
      }
    }
    setPhase("done");
  }

  function goNext() {
    if (phase !== "reveal") return;
    if (ended) {
      finish(run);
      return;
    }
    nextQuestion(index + 1, settings.harder);
  }

  function clearBest() {
    const local = browserStore();
    if (!local || !resetBest(local)) {
      setNotice(text.bestResetFailed);
      return;
    }
    setBest(emptyBest());
    setHasKey(false);
    setNotice(text.bestResetDone);
  }

  async function blobOfCard(): Promise<Blob | null> {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
  }

  async function downloadCard() {
    const blob = await blobOfCard();
    if (!blob) {
      setShareError(true);
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ps-plus-quiz.png";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function shareCard() {
    if (!navigator.share) return;
    const blob = await blobOfCard();
    if (!blob) {
      setShareError(true);
      return;
    }
    const file = new File([blob], "ps-plus-quiz.png", { type: "image/png" });
    const payload = { files: [file], title: text.title };
    if (navigator.canShare && !navigator.canShare(payload)) return;
    try {
      await navigator.share(payload);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareError(true);
    }
  }

  const progress = question
    ? settings.mode === "classic"
      ? fill(text.questionProgress, { n: index + 1, total: CLASSIC_LENGTH })
      : fill(text.questionEndless, { n: index + 1 })
    : "";

  const correctLabel = question ? optionText(question, question.correct, text) : "";
  const live =
    phase !== "reveal" || !question
      ? ""
      : reason === "correct"
        ? `${text.correct} ${fill(text.pointsGain, { points: gained })}`
        : `${reason === "timeout" ? text.timeout : text.wrong} ${fill(text.correctWas, { answer: correctLabel })}`;

  return (
    <div data-testid="quiz-game">
      {phase === "setup" ? (
        <div>
          <p className="eyebrow text-xs font-medium uppercase text-steel">{text.eyebrow}</p>
          <h1 className="display-title mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{text.lede}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.freeClaim}</p>
            <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.privacyClaim}</p>
          </div>
          <p className="mt-4 text-sm text-subtle">{text.unofficial}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-subtle">{text.temporary}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            <a href={snapshotMeta.sourceSite} className="text-steel underline-offset-4 hover:underline">
              {text.sourceLink}
            </a>
            . {text.sourceLine}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-subtle">{text.dataNote}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-subtle">{text.storageNote}</p>
          <section className="mt-8 max-w-2xl" aria-labelledby="quiz-rules">
            <h2 id="quiz-rules" className="font-display text-2xl font-semibold tracking-tight">
              {text.rulesTitle}
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed text-muted">
              <li>{text.ruleClassic}</li>
              <li>{text.ruleEndless}</li>
              <li>{text.ruleTimer}</li>
              <li>{text.ruleHard}</li>
              <li>{text.rulePoints}</li>
              <li>{text.ruleKeys}</li>
            </ul>
          </section>
          <BestBlock text={text} best={best} hasKey={hasKey} notice={notice} onReset={clearBest} />
          <form
            className="panel mt-6 flex max-w-2xl flex-col gap-4 rounded-xl px-4 py-4"
            onSubmit={(event) => {
              event.preventDefault();
              start();
            }}
          >
            <fieldset className="min-w-0 border-0 p-0">
              <legend className="text-sm font-semibold text-fg">{text.modeLabel}</legend>
              <div className="segment mt-2">
                <button type="button" aria-pressed={mode === "classic"} onClick={() => setMode("classic")}>
                  {text.modeClassic}
                </button>
                <button type="button" aria-pressed={mode === "endless"} onClick={() => setMode("endless")}>
                  {text.modeEndless}
                </button>
              </div>
            </fieldset>
            <label className="check">
              <input type="checkbox" checked={timer} onChange={(event) => setTimer(event.target.checked)} />
              {text.timerLabel}
            </label>
            <label className="check">
              <input type="checkbox" checked={harder} onChange={(event) => setHarder(event.target.checked)} />
              {text.hardLabel}
            </label>
            <button type="submit" className="btn btn-primary self-start" data-testid="start">
              {text.start}
            </button>
          </form>
        </div>
      ) : null}

      {phase === "ask" || phase === "reveal" ? question ? (
        <div className={phase === "reveal" && reason !== "correct" ? "shake-once" : undefined}>
          <h1 className="sr-only" lang={lang}>
            {text.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-display text-sm font-semibold tracking-tight text-muted">{progress}</p>
            <p className="font-display text-sm font-semibold text-fg">
              {text.scoreLabel} {run.score}
              {phase === "reveal" && gained > 0 ? (
                <span className="points-pop">{fill(text.pointsGain, { points: gained })}</span>
              ) : null}
            </p>
            <p className={`streak ${run.streak >= 2 ? "streak-hot" : ""}`}>
              <span className={run.streak >= 2 ? "flame flame-hot" : "flame"}>
                <FlameIcon />
              </span>
              {text.streakLabel} {run.streak}
            </p>
            {settings.mode === "endless" ? (
              <p className="lives-line">
                <span className="sr-only">{fill(text.livesLabel, { n: run.lives, total: ENDLESS_LIVES })}</span>
                <span className="lives" aria-hidden="true">
                  {Array.from({ length: ENDLESS_LIVES }, (_, life) => (
                    <span key={life} className={life < run.lives ? "life life-on" : "life"} />
                  ))}
                </span>
              </p>
            ) : null}
          </div>
          {settings.timer && phase === "ask" ? (
            <div className="timer mt-4" aria-hidden="true">
              <span className={`timer-bar ${remaining < 5 ? "timer-low" : ""}`} style={{ width: `${(remaining / TIMER_SECONDS) * 100}%` }} />
            </div>
          ) : null}
          {settings.timer && phase === "ask" ? (
            <p className="mt-1 text-sm text-subtle">{Math.ceil(remaining)}s</p>
          ) : null}
          <h2
            ref={questionHeading}
            tabIndex={-1}
            data-testid="question-prompt"
            className="display-title mt-6 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {promptText(question, text)}
          </h2>
          {question.kind === "month" ? <p className="mt-2 text-sm font-semibold text-warn">{text.hardBadge}</p> : null}
          <p className="mt-2 text-sm text-subtle">{text.keyboardHint}</p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label={promptText(question, text)}>
            {question.options.map((option, optionIndex) => {
              const revealed = phase === "reveal";
              const isCorrect = revealed && option === question.correct;
              const isWrong = revealed && option === chosen && option !== question.correct;
              const className = `option ${isCorrect ? "option-correct" : ""} ${isWrong ? "option-wrong" : ""} ${revealed && !isCorrect && !isWrong ? "option-dim" : ""}`;
              return (
                <button
                  key={option}
                  type="button"
                  data-testid={`option-${optionIndex}`}
                  className={className}
                  disabled={phase !== "ask"}
                  onClick={() => choose(optionIndex)}
                >
                  <span className="keycap">{optionIndex + 1}</span>
                  <span className="break-anywhere text-left">{optionText(question, option, text)}</span>
                </button>
              );
            })}
          </div>
          <div aria-live="polite" data-testid="quiz-live" className={`feedback ${reason === "correct" ? "feedback-correct" : ""} ${reason === "wrong" || reason === "timeout" ? "feedback-wrong" : ""}`}>
            {live}
          </div>
          {phase === "reveal" ? (
            <div className="mt-4 flex flex-col gap-3">
              <ul className="flex flex-col gap-1">
                {question.linkTitles.map((title) => (
                  <li key={title}>
                    <a href={archiveHref(title)} className="text-sm text-steel underline-offset-4 hover:underline">
                      {title} — {text.archiveLink}
                    </a>
                  </li>
                ))}
              </ul>
              <button ref={nextButton} type="button" className="btn btn-primary self-start" data-testid="next" onClick={goNext}>
                {ended ? text.seeResult : text.next}
              </button>
            </div>
          ) : null}
        </div>
      ) : null : null}

      {phase === "done" ? (
        <div data-testid="result">
          <p className="eyebrow text-xs font-medium uppercase text-steel">{text.seeResult}</p>
          <h1 className="display-title mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
          <p className="mt-4 text-sm text-muted">{card.modeLabel}</p>
          <p className="score-pop mt-4 font-display text-6xl font-semibold tracking-tight">{run.score}</p>
          <p className="text-sm text-subtle">{text.scoreLabel}</p>
          <p className="streak streak-hot mt-4 text-lg">
            <span className={run.bestStreak >= 2 ? "flame flame-hot" : "flame"}>
              <FlameIcon />
            </span>
            {text.streakLabel} {run.bestStreak}
          </p>
          <p className="mt-3 text-lg text-fg">{card.detail}</p>
          {notice ? <p className="mt-3 text-base font-semibold text-ok">{notice}</p> : null}
          <BestBlock text={text} best={best} hasKey={hasKey} notice="" onReset={clearBest} />
          <section className="mt-8" aria-labelledby="share-heading">
            <h3 id="share-heading" className="font-display text-2xl font-semibold tracking-tight">
              {text.shareHeading}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-subtle">{text.shareNote}</p>
            <canvas
              ref={canvasRef}
              width={SHARE_WIDTH}
              height={SHARE_HEIGHT}
              className="share-canvas mt-4"
              role="img"
              aria-label={text.shareAlt}
              data-testid="share-canvas"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" data-testid="download-share" onClick={() => void downloadCard()} disabled={!shareReady}>
                {text.shareDownload}
              </button>
              {canShare ? (
                <button type="button" className="btn btn-ghost" data-testid="share-native" onClick={() => void shareCard()} disabled={!shareReady}>
                  {text.shareNative}
                </button>
              ) : null}
            </div>
            {!shareReady && !shareError ? <p className="mt-2 text-sm text-subtle">{text.shareWorking}</p> : null}
            {shareError ? <p className="mt-2 text-sm text-bad">{text.shareFailed}</p> : null}
          </section>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={start}>
              {text.again}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPhase("setup")}>
              {text.back}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BestBlock({
  text,
  best,
  hasKey,
  notice,
  onReset,
}: {
  text: Copy;
  best: BestRecord;
  hasKey: boolean;
  notice: string;
  onReset: () => void;
}) {
  const empty = !hasKey || (best.bestScore === 0 && best.bestStreak === 0);
  return (
    <section className="mt-8 max-w-2xl" aria-labelledby="best-heading">
      <h2 id="best-heading" className="font-display text-2xl font-semibold tracking-tight">
        {text.bestTitle}
      </h2>
      <p className="mt-2 text-base text-fg" data-testid="best-line">
        {empty ? text.bestEmpty : fill(text.bestLine, { score: best.bestScore, streak: best.bestStreak })}
      </p>
      {hasKey ? (
        <button type="button" className="btn btn-ghost mt-3" data-testid="reset-best" onClick={onReset}>
          {text.bestReset}
        </button>
      ) : null}
      {notice ? (
        <p role="status" className="mt-2 text-sm text-muted">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
