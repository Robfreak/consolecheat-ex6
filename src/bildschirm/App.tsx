import { useEffect, useRef, useState } from "react";
import { SiteFooter, SiteHeader, type Theme } from "./chrome.tsx";
import { exitFullscreen, FULLSCREEN_EVENTS, isFullscreen, toggleFullscreen } from "./fullscreen.ts";
import { isTypingTarget, shortcutResult, stepIndex } from "./keyboard.ts";
import { LegalPage } from "./legal.tsx";
import { copy, initialLang, type Lang } from "./messages.ts";
import { footerTools } from "./tools.ts";
import { pickerItems } from "./picker-model.ts";
import { PatternPicker } from "./picker.tsx";
import { patternIndex, patterns, type PatternId } from "./patterns.ts";
import { PatternStage } from "./stage.tsx";
import {
  clearPatternId,
  clearScreenData,
  LANG_KEY,
  PATTERN_SESSION_KEY,
  readPatternId,
  THEME_KEY,
  writePatternId,
  type StorageLike,
} from "./storage.ts";

type Page = "home" | "impressum" | "datenschutz";

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

function systemTheme(): Theme {
  try {
    return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function reducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
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

function readInitialPattern(): PatternId | null {
  const page = readPage();
  if (page !== "home") return null;
  try {
    return readPatternId(sessionStorage);
  } catch {
    return null;
  }
}

function useColumns(): number {
  const [columns, setColumns] = useState(() => {
    try {
      if (matchMedia("(min-width: 1024px)").matches) return 3;
      if (matchMedia("(min-width: 700px)").matches) return 2;
    } catch {
      // Narrow until the viewport can be read.
    }
    return 1;
  });
  useEffect(() => {
    const wide = matchMedia("(min-width: 1024px)");
    const mid = matchMedia("(min-width: 700px)");
    const apply = () => setColumns(wide.matches ? 3 : mid.matches ? 2 : 1);
    apply();
    wide.addEventListener("change", apply);
    mid.addEventListener("change", apply);
    return () => {
      wide.removeEventListener("change", apply);
      mid.removeEventListener("change", apply);
    };
  }, []);
  return columns;
}

export function App() {
  const [lang, setLang] = useState<Lang>(readLang);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [page, setPage] = useState<Page>(readPage);
  const [patternId, setPatternId] = useState<PatternId | null>(readInitialPattern);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [motionRunning, setMotionRunning] = useState(() => !reducedMotion());
  const stageRef = useRef<HTMLDivElement>(null);
  const persistReady = useRef(false);
  const view = useRef({ page, patternId, fullscreen });
  view.current = { page, patternId, fullscreen };
  const text = copy[lang];
  const columns = useColumns();
  const here = `${import.meta.env.BASE_URL}bildschirm/`;
  const merklisteHref = import.meta.env.BASE_URL;
  const pattern = patternId ? patterns[patternIndex(patternId)] : undefined;
  const patternOpen = page === "home" && pattern != null;

  function openPage(next: Page, event?: { preventDefault: () => void }) {
    event?.preventDefault();
    const url = new URL(location.href);
    url.hash = next === "home" ? "" : next;
    history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setPage(next);
    window.scrollTo(0, 0);
  }

  function openPattern(id: PatternId) {
    setFullscreenError(false);
    view.current.patternId = id;
    setPatternId(id);
  }

  function closePattern() {
    const id = view.current.patternId;
    view.current.patternId = null;
    setPatternId(null);
    setFullscreenError(false);
    if (isFullscreen(document)) void exitFullscreen(document);
    window.requestAnimationFrame(() => {
      if (!id) return;
      document.querySelector<HTMLButtonElement>(`button[data-pattern="${CSS.escape(id)}"]`)?.focus();
    });
  }

  function step(direction: "prev" | "next") {
    const current = view.current.patternId;
    if (!current) return;
    const next = patterns[stepIndex(patternIndex(current), direction, patterns.length)];
    if (!next) return;
    view.current.patternId = next.id;
    setPatternId(next.id);
  }

  const actions = useRef({ openPage, closePattern, openPattern, step });
  actions.current = { openPage, closePattern, openPattern, step };

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
    const sync = () => setFullscreen(isFullscreen(document));
    for (const name of FULLSCREEN_EVENTS) document.addEventListener(name, sync);
    return () => {
      for (const name of FULLSCREEN_EVENTS) document.removeEventListener(name, sync);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("pattern-lock", patternOpen);
    return () => document.documentElement.classList.remove("pattern-lock");
  }, [patternOpen]);

  useEffect(() => {
    if (!persistReady.current) {
      persistReady.current = true;
      if (!patternId) return;
    }
    const session = browserStore(sessionStorage, PATTERN_SESSION_KEY);
    if (!session) return;
    if (patternId) writePatternId(session, patternId);
    else clearPatternId(session);
  }, [patternId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const current = view.current;
      const tag = event.target instanceof HTMLElement ? event.target.tagName : "";
      const result = shortcutResult(event.key, event.code, {
        page: current.page,
        patternOpen: current.patternId !== null && current.page === "home",
        fullscreen: isFullscreen(document),
        patternCount: patterns.length,
        typing: isTypingTarget(tag),
        repeat: event.repeat,
      });
      if (result.type === "ignore") return;
      event.preventDefault();
      const api = actions.current;
      if (result.type === "close-page") {
        api.openPage("home");
        return;
      }
      if (result.type === "exit-fullscreen") {
        void exitFullscreen(document);
        return;
      }
      if (result.type === "close-pattern") {
        api.closePattern();
        return;
      }
      if (result.type === "open") {
        const next = patterns[result.index];
        if (next) api.openPattern(next.id);
        return;
      }
      api.step(result.direction);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function onToggleFullscreen() {
    const node = stageRef.current;
    if (!node) return;
    const result = await toggleFullscreen(node, document);
    const active = isFullscreen(document);
    setFullscreen(active);
    setFullscreenError(!result.ok);
    if (result.ok && active) node.focus();
  }

  function deleteAll(): boolean {
    setLang("de");
    const nextTheme = systemTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme, false);
    setPatternId(null);
    const local = browserStore(localStorage, THEME_KEY);
    const session = browserStore(sessionStorage, PATTERN_SESSION_KEY);
    if (!local || !session) return false;
    return clearScreenData(local, session);
  }

  return (
    <div className="min-h-screen" data-testid="screen-test">
      <div className="flex min-h-screen flex-col" inert={patternOpen ? true : undefined}>
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
            <p className="mt-2 text-sm text-subtle">{text.temporary}</p>
            <section className="mt-10" aria-labelledby="patterns-heading">
              <h2 id="patterns-heading" className="font-display text-2xl font-semibold tracking-tight">
                {text.patternsHeading}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-subtle">{text.shortcutHint}</p>
              <PatternPicker label={text.patternsHeading} items={pickerItems(text)} columns={columns} onOpen={openPattern} />
            </section>
          </main>
        ) : (
          <div className="flex-1">
            <LegalPage page={page} text={text} homeHref={here} onHome={(event) => openPage("home", event)} onDeleteAll={deleteAll} />
          </div>
        )}
        <SiteFooter
          text={text}
          merklisteHref={merklisteHref}
          tools={footerTools("screen", lang, {
            href: {
              merkliste: merklisteHref,
              download: `${import.meta.env.BASE_URL}download/`,
              buttons: `${import.meta.env.BASE_URL}tasten/`,
              hdr: `${import.meta.env.BASE_URL}hdr/`,
              audio: `${import.meta.env.BASE_URL}audio/`,
              usb: `${import.meta.env.BASE_URL}usb/`,
              reaktion: `${import.meta.env.BASE_URL}reaktion/`,
              quiz: `${import.meta.env.BASE_URL}quiz/`,
            },
          })}
          onLegal={(next, event) => openPage(next, event)}
        />
      </div>
      {patternOpen && pattern ? (
        <PatternStage
          stageRef={stageRef}
          pattern={pattern}
          index={patternIndex(pattern.id)}
          total={patterns.length}
          text={text}
          fullscreen={fullscreen}
          motionRunning={motionRunning}
          fullscreenError={fullscreenError}
          onPrev={() => step("prev")}
          onNext={() => step("next")}
          onClose={closePattern}
          onToggleFullscreen={() => void onToggleFullscreen()}
          onToggleMotion={() => setMotionRunning((value) => !value)}
        />
      ) : null}
    </div>
  );
}
