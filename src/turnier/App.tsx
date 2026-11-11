import { useEffect, useRef, useState } from "react";
import { BracketView, type SaveResult } from "./bracket-view.tsx";
import { canRedraw, commitKoScore, resolveBracket } from "./bracket.ts";
import { Dialog, SiteFooter, SiteHeader, type Theme } from "./chrome.tsx";
import { commitLeagueScore } from "./league.ts";
import { LegalPage } from "./legal.tsx";
import { LeagueView } from "./league-view.tsx";
import { copy, fill, initialLang, type Lang } from "./messages.ts";
import { readyPlayers } from "./players.ts";
import { displayTitle, leagueView, nameOf, toExportModel, winnerOf } from "./present.ts";
import { PNG_FILENAME, renderTournamentPng } from "./export.ts";
import { shuffleIds } from "./shuffle.ts";
import { SetupForm } from "./setup.tsx";
import { freshSetup, LANG_KEY, loadTournament, resetTournament, saveTournament, THEME_KEY, type StorageLike } from "./storage.ts";
import { MAX_TITLE, type Score, type Tournament } from "./types.ts";
import { footerTools } from "./tools.ts";
import { WinnerBanner } from "./winner.tsx";

type Page = "home" | "impressum" | "datenschutz";
type Pending = { matchId: string; score: Score; cleared: string[] };

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

function loadInitial(): Tournament {
  const local = browserStore(localStorage, THEME_KEY);
  if (!local) return freshSetup();
  const loaded = loadTournament(local);
  if (loaded.phase === "setup" && loaded.players.length === 0) {
    return { ...loaded, players: freshSetup().players };
  }
  return loaded;
}

export function App() {
  const [lang, setLang] = useState<Lang>(readLang);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [page, setPage] = useState<Page>(readPage);
  const [state, setState] = useState<Tournament>(loadInitial);
  const [notice, setNotice] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [askNew, setAskNew] = useState(false);
  const text = copy[lang];
  const base = import.meta.env.BASE_URL;
  const here = `${base}turnier/`;
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
  const winner = winnerOf(state);
  const seenWinner = useRef<string | null>(winner?.id ?? null);
  const [celebrate, setCelebrate] = useState(false);

  function openPage(next: Page, event?: { preventDefault: () => void }) {
    event?.preventDefault();
    const url = new URL(location.href);
    url.hash = next === "home" ? "" : next;
    history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setPage(next);
    window.scrollTo(0, 0);
  }

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
    const id = winner?.id ?? null;
    if (id === null) {
      seenWinner.current = null;
      setCelebrate(false);
      return;
    }
    if (seenWinner.current === id) return;
    seenWinner.current = id;
    setCelebrate(true);
  }, [winner?.id]);

  function commit(next: Tournament) {
    setState(next);
    const local = browserStore(localStorage, THEME_KEY);
    if (!local) {
      setStorageFailed(true);
      return;
    }
    setStorageFailed(!saveTournament(local, next));
  }

  function wipe(): boolean {
    const local = browserStore(localStorage, THEME_KEY);
    const ok = local ? resetTournament(local) : false;
    setState(freshSetup());
    setPending(null);
    setAskNew(false);
    setNotice(ok ? text.deleted : text.deleteFailed);
    setStorageFailed(false);
    return ok;
  }

  function draw() {
    const ready = readyPlayers(state.players);
    if (!ready) {
      setNotice(text.needPlayers);
      return;
    }
    commit({
      ...state,
      name: state.name.trim().slice(0, MAX_TITLE),
      players: ready,
      phase: "live",
      order: shuffleIds(ready.map((player) => player.id)),
      scores: {},
    });
    setNotice(text.liveDraw);
  }

  function redraw() {
    if (!canRedraw(state.scores)) return;
    commit({ ...state, order: shuffleIds(state.players.map((player) => player.id)), scores: {} });
    setNotice(text.liveRedraw);
  }

  function saveKo(matchId: string, score: Score, confirmed: boolean): SaveResult {
    const result = commitKoScore(state.order, state.scores, matchId, score, confirmed);
    if (!result.ok && result.reason === "confirm") {
      setPending({ matchId, score, cleared: result.cleared });
      return "confirm";
    }
    if (!result.ok && result.reason === "draw") return "draw";
    if (!result.ok) return "invalid";
    commit({ ...state, scores: result.scores });
    setPending(null);
    setNotice(text.saved);
    return "ok";
  }

  function saveLeague(matchId: string, score: Score): boolean {
    const match = leagueView(state).matches.find((item) => item.id === matchId);
    if (!match) return false;
    const result = commitLeagueScore(match, score);
    if (!result.ok) return false;
    commit({ ...state, scores: { ...state.scores, [matchId]: result.score } });
    setNotice(text.saved);
    return true;
  }

  async function exportPng() {
    const canvas = document.createElement("canvas");
    try {
      if (document.fonts?.load) {
        await document.fonts.load('600 40px "Outfit"');
        await document.fonts.load('500 22px "Source Sans 3"');
      }
    } catch {
      // The card still draws with the fallback fonts.
    }
    renderTournamentPng(canvas, toExportModel(state, text));
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = PNG_FILENAME;
    link.click();
  }

  const board = state.phase === "live" ? (state.mode === "ko" ? resolveBracket(state.order, state.scores) : null) : null;
  const league = state.phase === "live" && state.mode === "liga" ? leagueView(state) : null;
  const dirty = state.phase === "live" || state.name.trim().length > 0 || state.players.some((player) => player.name.trim().length > 0);

  return (
    <div className="flex min-h-screen min-w-0 flex-col" data-testid="turnier-page">
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
        <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
          <p className="eyebrow text-xs font-semibold uppercase text-steel">{text.eyebrow}</p>
          <h1 className="display-title mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {state.phase === "live" ? displayTitle(state, text) : text.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{text.lede}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.freeClaim}</p>
            <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.privacyClaim}</p>
          </div>
          <p className="mt-4 text-sm text-subtle">{text.unofficial}</p>
          <p className="mt-2 text-sm text-subtle">{text.temporary}</p>
          <p className="mt-2 text-sm text-subtle">{text.storageNote}</p>
          {storageFailed ? (
            <p role="status" className="mt-3 text-sm text-bad">
              {text.storageFailed}
            </p>
          ) : null}
          {state.phase === "setup" ? (
            <div className="mt-8">
              <SetupForm state={state} text={text} onChange={commit} onDraw={draw} />
            </div>
          ) : (
            <div className="mt-8 grid gap-6" key={state.order.join("-")}>
              {winner ? <WinnerBanner name={winner.name} text={text} celebrate={celebrate} /> : null}
              <div className="flex flex-wrap gap-2">
                {canRedraw(state.scores) ? (
                  <button type="button" className="btn btn-ghost" data-testid="redraw" onClick={redraw}>
                    {text.redraw}
                  </button>
                ) : null}
                <button type="button" className="btn btn-primary" data-testid="export-png" onClick={() => void exportPng()}>
                  {text.exportPng}
                </button>
                <button type="button" className="btn btn-bad" data-testid="new-tournament" onClick={() => (dirty ? setAskNew(true) : wipe())}>
                  {text.newTournament}
                </button>
              </div>
              <p className="text-sm text-subtle">{text.exportNote}</p>
              {notice ? (
                <p role="status" aria-live="polite" className="text-sm text-muted">
                  {notice}
                </p>
              ) : null}
              {board ? (
                <BracketView
                  matches={board}
                  text={text}
                  nameOf={(slot) => (slot && slot !== "bye" ? nameOf(state, slot, text) : slot === "bye" ? text.bye : text.waiting)}
                  onSave={(matchId, score) => saveKo(matchId, score, false)}
                />
              ) : null}
              {league ? (
                <LeagueView
                  matches={league.matches}
                  rows={league.rows}
                  scores={state.scores}
                  text={text}
                  nameOf={(id) => nameOf(state, id, text)}
                  onSave={saveLeague}
                />
              ) : null}
            </div>
          )}
          {state.phase === "setup" && notice ? (
            <p role="status" aria-live="polite" className="mt-4 text-sm text-muted">
              {notice}
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
        tools={footerTools("turnier", lang, {
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
          },
        })}
        onLegal={(next, event) => openPage(next, event)}
      />
      {pending ? (
        <Dialog
          title={text.confirmTitle}
          body={fill(text.confirmBody, { count: pending.cleared.length })}
          yes={text.confirmYes}
          no={text.confirmNo}
          onNo={() => setPending(null)}
          onYes={() => saveKo(pending.matchId, pending.score, true)}
        />
      ) : null}
      {askNew ? (
        <Dialog
          title={text.newTournament}
          body={text.newAsk}
          yes={text.newYes}
          no={text.newNo}
          onNo={() => setAskNew(false)}
          onYes={wipe}
        />
      ) : null}
    </div>
  );
}
