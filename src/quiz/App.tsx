import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader, type Theme } from "./chrome.tsx";
import { Game } from "./game.tsx";
import { LegalPage } from "./legal.tsx";
import { copy, initialLang, type Lang } from "./messages.ts";
import { clearQuizData, LANG_KEY, THEME_KEY, type StorageLike } from "./storage.ts";
import { footerTools } from "./tools.ts";

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

export function App() {
  const [lang, setLang] = useState<Lang>(readLang);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [page, setPage] = useState<Page>(readPage);
  const text = copy[lang];
  const base = import.meta.env.BASE_URL;
  const here = `${base}quiz/`;
  const merklisteHref = base;
  const screenHref = `${base}bildschirm/`;
  const downloadHref = `${base}download/`;
  const buttonsHref = `${base}tasten/`;
  const hdrHref = `${base}hdr/`;
  const audioHref = `${base}audio/`;
  const usbHref = `${base}usb/`;
  const reaktionHref = `${base}reaktion/`;
  const rhythmusHref = `${base}rhythmus/`;
  const speedrunHref = `${base}speedrun/`;

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

  function deleteAll(): boolean {
    setLang("de");
    const nextTheme = systemTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme, false);
    const local = browserStore(localStorage, THEME_KEY);
    if (!local) return false;
    return clearQuizData(local);
  }

  return (
    <div className="flex min-h-screen flex-col" data-testid="quiz-page">
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
          <Game text={text} lang={lang} />
        </main>
      ) : (
        <div className="flex-1">
          <LegalPage page={page} text={text} homeHref={here} onHome={(event) => openPage("home", event)} onDeleteAll={deleteAll} />
        </div>
      )}
      <SiteFooter
        text={text}
        merklisteHref={merklisteHref}
        tools={footerTools("quiz", lang, {
          href: {
            merkliste: merklisteHref,
            screen: screenHref,
            download: downloadHref,
            buttons: buttonsHref,
            hdr: hdrHref,
            audio: audioHref,
            usb: usbHref,
            reaktion: reaktionHref,
            rhythmus: rhythmusHref, speedrun: speedrunHref,
          },
        })}
        onLegal={(next, event) => openPage(next, event)}
      />
    </div>
  );
}
