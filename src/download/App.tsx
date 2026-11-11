import { useEffect, useState } from "react";
import { Calculator } from "./calculator.tsx";
import { SiteFooter, SiteHeader, type Theme } from "./chrome.tsx";
import { LegalPage } from "./legal.tsx";
import { copy, initialLang, type Lang } from "./messages.ts";
import { clearDownloadData, LANG_KEY, THEME_KEY, type StorageLike } from "./storage.ts";
import { DEFAULT_SIZE, DEFAULT_SIZE_UNIT, DEFAULT_SPEED, DEFAULT_SPEED_UNIT, type SizeUnit, type SpeedUnit } from "./time.ts";
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
  const [sizeRaw, setSizeRaw] = useState(DEFAULT_SIZE);
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>(DEFAULT_SIZE_UNIT);
  const [speedRaw, setSpeedRaw] = useState(DEFAULT_SPEED);
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(DEFAULT_SPEED_UNIT);
  const text = copy[lang];
  const base = import.meta.env.BASE_URL;
  const merklisteHref = base;
  const screenHref = `${base}bildschirm/`;

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
    return clearDownloadData(local);
  }

  return (
    <div className="flex min-h-screen flex-col" data-testid="download-calculator">
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
          <Calculator
            text={text}
            lang={lang}
            sizeRaw={sizeRaw}
            sizeUnit={sizeUnit}
            speedRaw={speedRaw}
            speedUnit={speedUnit}
            onSizeRaw={setSizeRaw}
            onSizeUnit={setSizeUnit}
            onSpeedRaw={setSpeedRaw}
            onSpeedUnit={setSpeedUnit}
          />
        </main>
      ) : (
        <div className="flex-1">
          <LegalPage page={page} text={text} homeHref={base} onHome={(event) => openPage("home", event)} onDeleteAll={deleteAll} />
        </div>
      )}
      <SiteFooter
        text={text}
        merklisteHref={merklisteHref}
        tools={footerTools("download", lang, {
          href: { merkliste: merklisteHref, screen: screenHref, buttons: `${base}tasten/`, hdr: `${base}hdr/`, audio: `${base}audio/`, usb: `${base}usb/`, reaktion: `${base}reaktion/`, quiz: `${base}quiz/`, rhythmus: `${base}rhythmus/`, speedrun: `${base}speedrun/`, avatar: `${base}avatar/` },
        })}
        onLegal={(next, event) => openPage(next, event)}
      />
    </div>
  );
}
