import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader, type Theme } from "./chrome.tsx";
import { Editor } from "./editor.tsx";
import { LegalPage } from "./legal.tsx";
import { copy, initialLang, type Lang } from "./messages.ts";
import { LANG_KEY, THEME_KEY, resetDraft, type StorageLike } from "./storage.ts";
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
  const [generation, setGeneration] = useState(0);
  const text = copy[lang];
  const base = import.meta.env.BASE_URL;
  const here = `${base}avatar/`;
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
  const turnierHref = `${base}turnier/`;
  const comboHref = `${base}combo/`;

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
    const local = browserStore(localStorage, THEME_KEY);
    const ok = local ? resetDraft(local) : false;
    setGeneration((current) => current + 1);
    return ok;
  }

  return (
    <div className="flex min-h-screen flex-col" data-testid="avatar-page">
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
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
          <p className="eyebrow text-xs font-semibold uppercase text-steel">{text.eyebrow}</p>
          <h1 className="display-title mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{text.lede}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.freeClaim}</p>
            <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.privacyClaim}</p>
          </div>
          <p className="mt-4 text-sm text-subtle">{text.unofficial}</p>
          <p className="mt-2 text-sm text-subtle">{text.temporary}</p>
          <p className="mt-2 text-sm text-subtle">{text.storageNote}</p>
          <section className="mt-8" aria-labelledby="editor-heading">
            <h2 id="editor-heading" className="sr-only">
              {text.title}
            </h2>
            <Editor key={generation} text={text} />
          </section>
          <section className="mt-8" aria-labelledby="keys-heading">
            <h2 id="keys-heading" className="font-display text-xl font-semibold tracking-tight">
              {text.controlsHeading}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{text.controls}</p>
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
        tools={footerTools("avatar", lang, {
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
            turnier: turnierHref, combo: comboHref,
          },
        })}
        onLegal={(next, event) => openPage(next, event)}
      />
    </div>
  );
}
