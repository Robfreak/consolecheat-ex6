import { useDeferredValue, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { archiveHref, catalogFacts, entryFromGame, finderHref, type IdFacts } from "./catalog.ts";
import { Mark, MoonIcon, SunIcon } from "./icons.tsx";
import { LegalPage } from "./legal.tsx";
import {
  IMPORT_MAX_BYTES,
  LANG_KEY,
  LISTS,
  NOTE_MAX,
  STORAGE_KEY,
  THEME_KEY,
  addToList,
  codePoints,
  emptyLists,
  isListId,
  moveEntry,
  removeEntry,
  updateNote,
  type Entry,
  type ListId,
  type ListsFile,
} from "./lists.ts";
import { copy, fill, isLang, languageOptions, type Copy, type Lang } from "./messages.ts";
import { ToolLinks } from "./tool-links.tsx";
import { footerTools } from "./tools.ts";
import {
  buildIndex,
  decodeTitles,
  searchIndex,
  type Index,
  type Region,
  type SearchHit,
  type TitlesFile,
} from "./search.ts";
import { clearStoredData, loadLists, saveLists, type StorageLike } from "./storage.ts";
import { exportJson, resolveImport, validateImport, type ImportIssue } from "./transfer.ts";

type Theme = "light" | "dark";
type Page = "home" | "impressum" | "datenschutz";
type Filter = "all" | ListId;
type Catalog = { index: Index; facts: Map<string, IdFacts> };
type Elsewhere = { titleIds: string[]; name: string; from: ListId; to: ListId };

const VISIBLE_IDS = 4;

function readLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "de" || stored === "en") return stored;
  } catch {
    // Private mode and blocked storage both fall through to German.
  }
  return "de";
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
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
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

function browserStorage(): StorageLike | null {
  try {
    localStorage.getItem(STORAGE_KEY);
    return localStorage;
  } catch {
    return null;
  }
}

function listLabel(text: Copy, list: ListId): string {
  if (list === "backlog") return text.listBacklog;
  if (list === "playing") return text.listPlaying;
  if (list === "completed") return text.listCompleted;
  return text.listWishlist;
}

function listHint(text: Copy, list: ListId): string {
  if (list === "backlog") return text.hintBacklog;
  if (list === "playing") return text.hintPlaying;
  if (list === "completed") return text.hintCompleted;
  return text.hintWishlist;
}

function issueText(text: Copy, issue: ImportIssue): string {
  if (issue === "broken-json") return text.importBroken;
  if (issue === "wrong-schema") return text.importSchema;
  if (issue === "wrong-version") return text.importVersion;
  if (issue === "foreign") return text.importForeign;
  if (issue === "oversized") return text.importOversized;
  return text.importInvalid;
}

function storageText(text: Copy, issue: "full" | "disabled" | "version" | "corrupt"): string {
  if (issue === "full") return text.storageFull;
  if (issue === "disabled") return text.storageDisabled;
  if (issue === "version") return text.storageVersion;
  return text.storageCorrupt;
}

function regionLabel(text: Copy, region: Region): string {
  if (region === "EU") return text.regionEU;
  if (region === "US") return text.regionUS;
  if (region === "JP") return text.regionJP;
  if (region === "Asia") return text.regionAsia;
  if (region === "KR") return text.regionKR;
  if (region === "INT") return text.regionINT;
  return text.regionUnknown;
}

function regionClass(region: Region): string {
  if (region === "EU") return "region-pill region-eu";
  if (region === "US") return "region-pill region-us";
  if (region === "JP") return "region-pill region-jp";
  if (region === "Asia") return "region-pill region-asia";
  if (region === "KR") return "region-pill region-kr";
  if (region === "INT") return "region-pill region-int";
  return "region-pill region-unknown";
}

function pillClass(on: boolean): string {
  return on ? "btn btn-primary" : "btn btn-ghost";
}

function entryKey(entry: Entry): string {
  return entry.titleIds.join("-");
}

function counts(file: ListsFile, text: Copy): string {
  return LISTS.map((list) => `${listLabel(text, list)} ${file.lists[list].length}`).join(" · ");
}

export function App() {
  const [lang, setLang] = useState<Lang>(readLang);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [page, setPage] = useState<Page>(readPage);
  const [file, setFile] = useState<ListsFile | null>(null);
  const [storageIssue, setStorageIssue] = useState<"full" | "disabled" | "version" | "corrupt" | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [target, setTarget] = useState<ListId>("backlog");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState("");
  const [elsewhere, setElsewhere] = useState<Elsewhere | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [importPending, setImportPending] = useState<ListsFile | null>(null);
  const [importIssue, setImportIssue] = useState<ImportIssue | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const persistRef = useRef(false);
  const mergeRef = useRef<HTMLButtonElement>(null);
  const deferred = useDeferredValue(query);
  const text = copy[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    const name = page === "impressum" ? "Impressum" : page === "datenschutz" ? "Datenschutz" : text.title;
    document.title = `${name} · ${text.brand}`;
    if (page === "home") document.querySelector('meta[name="description"]')?.setAttribute("content", text.metaDescription);
  }, [lang, page, text]);

  useEffect(() => {
    const sync = () => setPage(readPage());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const storage = browserStorage();
    if (!storage) {
      persistRef.current = false;
      setStorageIssue("disabled");
      setFile(emptyLists());
      return;
    }
    const loaded = loadLists(storage);
    persistRef.current = loaded.persist;
    setFile(loaded.file);
    if (!loaded.ok) setStorageIssue(loaded.reason === "version" ? "version" : loaded.reason === "disabled" ? "disabled" : "corrupt");
  }, []);

  useEffect(() => {
    if (!file || !persistRef.current) return;
    const storage = browserStorage();
    if (!storage) {
      setStorageIssue("disabled");
      return;
    }
    const saved = saveLists(storage, file);
    setStorageIssue(saved.ok ? null : saved.reason);
  }, [file]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}titles.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<TitlesFile>;
      })
      .then((payload) => {
        if (!payload || payload.format !== 2 || typeof payload.names !== "string") throw new Error("format");
        const games = decodeTitles(payload);
        setCatalog({ index: buildIndex(games), facts: catalogFacts(games) });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setCatalogError(true);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setActive(0);
  }, [deferred]);

  useEffect(() => {
    if (!importPending) return;
    mergeRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setImportPending(null);
        setStatus(text.importCancelled);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [importPending, text.importCancelled]);

  useEffect(() => {
    if (!focusKey) return;
    document.querySelector<HTMLElement>(`[data-entry-key="${CSS.escape(focusKey)}"]`)?.focus();
    setFocusKey(null);
  }, [focusKey, file]);

  const hits = useMemo(() => {
    if (!catalog || deferred.trim().length < 2) return [];
    return searchIndex(catalog.index, deferred, { platform: "all", region: "all" }).slice(0, 8);
  }, [catalog, deferred]);

  function openPage(next: Page, event?: { preventDefault: () => void }) {
    event?.preventDefault();
    const url = new URL(location.href);
    url.hash = next === "home" ? "" : next;
    history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setPage(next);
    window.scrollTo(0, 0);
  }

  function remember(next: ListsFile, message: string, key: string | null = null) {
    setFile(next);
    setStatus(message);
    setElsewhere(null);
    if (key) setFocusKey(key);
  }

  function addHit(hit: SearchHit) {
    if (!file) return;
    const draft = entryFromGame(hit.game);
    const result = addToList(file, target, draft);
    const label = listLabel(text, target);
    if (result.ok) {
      setQuery("");
      remember(result.file, fill(text.added, { name: draft.name, list: label }));
      return;
    }
    if (result.reason === "duplicate") {
      setElsewhere(null);
      setStatus(fill(text.duplicate, { name: draft.name, list: label }));
      return;
    }
    if (result.reason === "elsewhere" && result.list) {
      setElsewhere({ titleIds: draft.titleIds, name: draft.name, from: result.list, to: target });
      setStatus(fill(text.elsewhere, { name: draft.name, list: listLabel(text, result.list) }));
      return;
    }
    setStatus(text.invalidGame);
  }

  function moveHere() {
    if (!file || !elsewhere || elsewhere.from === elsewhere.to) return;
    const result = moveEntry(file, elsewhere.from, elsewhere.to, elsewhere.titleIds);
    if (!result.ok) {
      setStatus(fill(text.duplicate, { name: elsewhere.name, list: listLabel(text, elsewhere.to) }));
      return;
    }
    remember(result.file, fill(text.moved, { name: elsewhere.name, list: listLabel(text, elsewhere.to) }), entryKey({ titleIds: elsewhere.titleIds, name: elsewhere.name, note: "" }));
  }

  function onMove(list: ListId, entry: Entry, to: ListId) {
    if (!file || to === list) return;
    const result = moveEntry(file, list, to, entry.titleIds);
    if (!result.ok) {
      setStatus(result.reason === "duplicate" ? fill(text.duplicate, { name: entry.name, list: listLabel(text, to) }) : text.invalidGame);
      return;
    }
    remember(result.file, fill(text.moved, { name: entry.name, list: listLabel(text, to) }), entryKey(entry));
  }

  function onRemove(list: ListId, entry: Entry) {
    if (!file) return;
    const result = removeEntry(file, list, entry.titleIds);
    if (!result.ok) return;
    remember(result.file, fill(text.removed, { name: entry.name }));
  }

  function onNote(list: ListId, entry: Entry, note: string) {
    if (!file) return;
    const result = updateNote(file, list, entry.titleIds, note);
    if (!result.ok) {
      setStatus(result.reason === "note-too-long" ? text.noteTooLong : text.noteInvalid);
      return;
    }
    setFile(result.file);
    setStatus(text.noteSaved);
  }

  function onExport() {
    if (!file) return;
    const blob = new Blob([exportJson(file)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spiele-merkliste.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const item = event.target.files?.[0];
    event.target.value = "";
    if (!item || !file) return;
    if (item.size > IMPORT_MAX_BYTES) {
      setImportPending(null);
      setImportIssue("oversized");
      setStatus(text.importOversized);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const body = typeof reader.result === "string" ? reader.result : "";
      const result = validateImport(body);
      if (!result.ok) {
        setImportPending(null);
        setImportIssue(result.issue);
        setStatus(issueText(text, result.issue));
        return;
      }
      setImportIssue(null);
      setStatus("");
      setImportPending(result.file);
    };
    reader.onerror = () => {
      setImportPending(null);
      setImportIssue("broken-json");
      setStatus(text.importBroken);
    };
    reader.readAsText(item, "utf-8");
  }

  function commitImport(choice: "merge" | "replace" | "cancel") {
    if (!file || !importPending) {
      setImportPending(null);
      return;
    }
    if (choice === "cancel") {
      setImportPending(null);
      setStatus(text.importCancelled);
      return;
    }
    const next = resolveImport(file, importPending, choice);
    persistRef.current = true;
    setFile(next);
    setImportPending(null);
    setElsewhere(null);
    setStatus(choice === "merge" ? text.importMerged : text.importReplaced);
  }

  function deleteAll(): boolean {
    const storage = browserStorage();
    setImportPending(null);
    setElsewhere(null);
    setLang("de");
    const nextTheme = systemTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme, false);
    if (!storage) {
      persistRef.current = false;
      setFile(emptyLists());
      setStorageIssue("disabled");
      return false;
    }
    const cleared = clearStoredData(storage);
    persistRef.current = true;
    setFile(emptyLists());
    if (!cleared.ok) {
      setStorageIssue(cleared.reason);
      return false;
    }
    setStorageIssue(null);
    setStatus(copy.de.deleted);
    return true;
  }

  function onSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(hits.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const hit = hits[active];
      if (!hit) return;
      event.preventDefault();
      addHit(hit);
    } else if (event.key === "Escape") {
      setQuery("");
    }
  }

  const visible = filter === "all" ? LISTS : [filter];
  const resultBase = "search-result";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="https://consolecheat.com" className="flex min-w-0 items-center gap-3">
            <Mark />
            <span className="truncate font-display text-lg font-semibold tracking-tight">{text.brand}</span>
          </a>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="lang">
              {text.language}
            </label>
            <select
              id="lang"
              data-testid="lang"
              value={lang}
              onChange={(event) => {
                if (!isLang(event.target.value)) return;
                setLang(event.target.value);
                setStatus("");
                try {
                  localStorage.setItem(LANG_KEY, event.target.value);
                } catch {
                  // The choice still applies for this view.
                }
              }}
              className="field w-28 sm:w-36"
            >
              {languageOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              data-testid="theme"
              aria-label={theme === "dark" ? text.themeLight : text.themeDark}
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                applyTheme(next, true);
              }}
              className="inline-flex size-11 items-center justify-center rounded-lg border border-line bg-surface text-fg"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {page === "home" ? (
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="eyebrow text-xs font-medium uppercase text-steel">{text.eyebrow}</p>
          <h1 className="display-title mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{text.lede}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.freeClaim}</p>
            <p className="panel rounded-xl px-4 py-4 text-base font-medium leading-relaxed text-fg">{text.privacyClaim}</p>
          </div>
          <p className="mt-4 text-sm text-subtle">{text.unofficial}</p>

          {storageIssue ? (
            <p role="status" className="panel mt-6 rounded-xl px-4 py-4 text-sm leading-relaxed text-warn">
              {storageText(text, storageIssue)}
            </p>
          ) : null}

          <section className="mt-10" aria-labelledby="add-heading">
            <h2 id="add-heading" className="font-display text-2xl font-semibold tracking-tight">
              {text.searchLabel}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
              <div className="min-w-0">
                <label htmlFor="add-to" className="text-sm text-subtle">
                  {text.addTo}
                </label>
                <select
                  id="add-to"
                  className="field mt-1"
                  value={target}
                  onChange={(event) => {
                    if (!isListId(event.target.value)) return;
                    const next = event.target.value;
                    setTarget(next);
                    setElsewhere((current) => (current ? { ...current, to: next } : null));
                  }}
                >
                  {LISTS.map((list) => (
                    <option key={list} value={list}>
                      {listLabel(text, list)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label htmlFor="game-search" className="text-sm text-subtle">
                  {text.searchLabel}
                </label>
                <input
                  id="game-search"
                  data-testid="search"
                  className="field mt-1"
                  value={query}
                  disabled={!catalog}
                  placeholder={catalogError ? text.catalogError : catalog ? text.searchPlaceholder : text.catalogLoading}
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={hits.length > 0}
                  aria-controls="search-results"
                  aria-activedescendant={hits.length ? `${resultBase}-${active}` : undefined}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onSearchKey}
                  autoComplete="off"
                />
              </div>
            </div>
            {catalogError ? <p className="mt-3 text-sm text-bad">{text.catalogError}</p> : null}
            {!catalog && !catalogError ? <p className="mt-3 text-sm text-subtle">{text.catalogLoading}</p> : null}
            {catalog && deferred.trim().length >= 2 ? (
              hits.length ? (
                <ul id="search-results" role="listbox" aria-label={text.resultsLabel} className="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto">
                  {hits.map((hit, index) => (
                    <li key={`${hit.game.name}:${hit.game.skus[0]?.id ?? index}`}>
                      <button
                        type="button"
                        id={`${resultBase}-${index}`}
                        role="option"
                        data-testid="result"
                        aria-selected={index === active}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => addHit(hit)}
                        className={`min-w-0 w-full rounded-xl border px-3 py-3 text-start ${index === active ? "border-accent bg-surface" : "border-line bg-surface"}`}
                      >
                        <span className="break-anywhere block font-medium">{hit.game.name}</span>
                        <span className="mt-1 block truncate font-mono text-xs text-subtle">
                          {hit.game.skus
                            .slice(0, 3)
                            .map((sku) => sku.id)
                            .join(" · ")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-subtle">{text.noResults}</p>
              )
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p id="list-status" data-testid="status" role="status" aria-live="polite" className="min-w-0 flex-1 break-anywhere text-sm text-muted">
                {status}
              </p>
              {elsewhere && elsewhere.to !== elsewhere.from ? (
                <button type="button" className="btn btn-primary" onClick={moveHere}>
                  {text.moveHere}
                </button>
              ) : null}
            </div>
            {importIssue ? (
              <p role="alert" className="mt-2 text-sm text-bad">
                {issueText(text, importIssue)}
              </p>
            ) : null}
          </section>

          <section className="mt-10" aria-labelledby="lists-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="lists-heading" className="font-display text-2xl font-semibold tracking-tight">
                {text.section}
              </h2>
              <div className="flex flex-wrap gap-2" role="group" aria-label={text.filterLabel}>
                <button type="button" aria-pressed={filter === "all"} className={pillClass(filter === "all")} onClick={() => setFilter("all")}>
                  {text.filterAll}
                </button>
                {LISTS.map((list) => (
                  <button
                    key={list}
                    type="button"
                    aria-pressed={filter === list}
                    className={pillClass(filter === list)}
                    onClick={() => setFilter(list)}
                  >
                    {listLabel(text, list)}
                    {file ? ` ${file.lists[list].length}` : ""}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-subtle">{text.keyboardHint}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" data-testid="export" className="btn btn-ghost" onClick={onExport} disabled={!file}>
                {text.exportButton}
              </button>
              <label className="btn btn-ghost">
                {text.importButton}
                <input
                  data-testid="import"
                  className="sr-only"
                  type="file"
                  accept="application/json,.json"
                  aria-label={text.importLabel}
                  onChange={onPick}
                  disabled={!file}
                />
              </label>
            </div>

            {!file ? <p className="mt-6 text-sm text-subtle">{text.loadingLists}</p> : null}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {file
                ? visible.map((list) => (
                    <section key={list} aria-labelledby={`list-${list}`} className="panel min-w-0 rounded-xl px-4 py-4">
                      <h3 id={`list-${list}`} className="break-anywhere font-display text-xl font-semibold">
                        {listLabel(text, list)}
                      </h3>
                      <p className="mt-1 text-sm text-subtle">{listHint(text, list)}</p>
                      {file.lists[list].length === 0 ? <p className="mt-4 text-sm text-muted">{text.emptyList}</p> : null}
                      <ul className="mt-4 flex flex-col gap-3">
                        {file.lists[list].map((entry) => (
                          <li key={entryKey(entry)} className="min-w-0">
                            <EntryCard
                              entry={entry}
                              list={list}
                              text={text}
                              facts={catalog?.facts ?? null}
                              onMove={(to) => onMove(list, entry, to)}
                              onRemove={() => onRemove(list, entry)}
                              onNote={(note) => onNote(list, entry, note)}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))
                : null}
            </div>
          </section>
        </main>
      ) : (
        <LegalPage
          page={page}
          text={text}
          homeHref={import.meta.env.BASE_URL}
          onHome={(event) => openPage("home", event)}
          onDeleteAll={deleteAll}
        />
      )}

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm leading-relaxed text-subtle sm:px-6">
          <p className="text-fg">{text.brand}</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label={text.footerNav}>
            <a href="#impressum" onClick={(event) => openPage("impressum", event)} className="text-steel underline-offset-4 hover:underline">
              Impressum
            </a>
            <a href="#datenschutz" onClick={(event) => openPage("datenschutz", event)} className="text-steel underline-offset-4 hover:underline">
              Datenschutz
            </a>
          </nav>
          <ToolLinks
            heading={text.toolsHeading}
            links={footerTools("merkliste", lang, {
              href: {
                screen: `${import.meta.env.BASE_URL}bildschirm/`,
                download: `${import.meta.env.BASE_URL}download/`,
                buttons: `${import.meta.env.BASE_URL}tasten/`,
                hdr: `${import.meta.env.BASE_URL}hdr/`,
                audio: `${import.meta.env.BASE_URL}audio/`,
                usb: `${import.meta.env.BASE_URL}usb/`,
                reaktion: `${import.meta.env.BASE_URL}reaktion/`,
              },
              label: { screen: text.screenTest },
            })}
          />
          <p>{text.freeClaim}</p>
          <p>{text.privacyClaim}</p>
          <p>{text.footerNote}</p>
        </div>
      </footer>

      {importPending && file ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          onClick={() => commitImport("cancel")}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-title"
            aria-describedby="import-body"
            className="panel w-full max-w-lg rounded-xl p-4"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const items = [...event.currentTarget.querySelectorAll<HTMLElement>("button")];
              const first = items[0];
              const last = items[items.length - 1];
              if (!first || !last) return;
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
          >
            <h2 id="import-title" className="font-display text-2xl font-semibold">
              {text.importTitle}
            </h2>
            <p id="import-body" className="mt-3 text-sm leading-relaxed text-muted">
              {text.importBody}
            </p>
            <p className="mt-3 break-anywhere text-sm text-fg">
              {counts(file, text)}
              {" → "}
              {counts(importPending, text)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button ref={mergeRef} type="button" className="btn btn-primary" onClick={() => commitImport("merge")}>
                {text.importMerge}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => commitImport("replace")}>
                {text.importReplace}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => commitImport("cancel")}>
                {text.importCancel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EntryCard({
  entry,
  list,
  text,
  facts,
  onMove,
  onRemove,
  onNote,
}: {
  entry: Entry;
  list: ListId;
  text: Copy;
  facts: Map<string, IdFacts> | null;
  onMove: (to: ListId) => void;
  onRemove: () => void;
  onNote: (note: string) => void;
}) {
  const [draft, setDraft] = useState(entry.note);
  const [moveTo, setMoveTo] = useState("");
  useEffect(() => setDraft(entry.note), [entry.note]);
  const shown = entry.titleIds.slice(0, VISIBLE_IDS);
  const rest = entry.titleIds.slice(VISIBLE_IDS);
  const primary = entry.titleIds[0];

  function onKey(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const cards = [...document.querySelectorAll<HTMLElement>("[data-entry]")];
      const index = cards.indexOf(event.currentTarget);
      const next = cards[index + (event.key === "ArrowDown" ? 1 : -1)];
      next?.focus();
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      onRemove();
      return;
    }
    const byKey: Record<string, ListId | undefined> = {
      "1": "backlog",
      "2": "playing",
      "3": "completed",
      "4": "wishlist",
    };
    const destination = byKey[event.key];
    if (destination && destination !== list) {
      event.preventDefault();
      onMove(destination);
    }
  }

  function commitNote() {
    if (draft !== entry.note) onNote(draft);
  }

  return (
    <article
      data-entry
      data-testid="entry"
      data-entry-key={entryKey(entry)}
      tabIndex={0}
      aria-keyshortcuts="1 2 3 4 Delete"
      aria-label={fill(text.entryLabel, { name: entry.name, list: listLabel(text, list) })}
      onKeyDown={onKey}
      className="min-w-0 rounded-xl border border-line bg-bg px-3 py-3"
    >
      <h4 className="break-anywhere font-display text-lg font-semibold leading-snug">{entry.name}</h4>
      <ul className="mt-2 flex flex-wrap gap-2" aria-label={text.idsLabel}>
        {shown.map((id) => (
          <li key={id}>
            <IdLink id={id} text={text} facts={facts?.get(id) ?? null} />
          </li>
        ))}
      </ul>
      {rest.length ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-steel">{text.moreIds}</summary>
          <ul className="mt-2 flex flex-wrap gap-2">
            {rest.map((id) => (
              <li key={id}>
                <IdLink id={id} text={text} facts={facts?.get(id) ?? null} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {primary ? (
          <a className="text-steel underline-offset-4 hover:underline" href={finderHref(primary)}>
            {text.finder}
          </a>
        ) : null}
        <a className="text-steel underline-offset-4 hover:underline" href={archiveHref(entry.name)}>
          {text.archive}
        </a>
      </p>
      <label className="mt-3 block text-sm text-subtle" htmlFor={`note-${list}-${entryKey(entry)}`}>
        {text.noteLabel}
      </label>
      <textarea
        id={`note-${list}-${entryKey(entry)}`}
        className="field mt-1 h-20 resize-y py-2"
        maxLength={NOTE_MAX}
        value={draft}
        placeholder={text.notePlaceholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitNote}
      />
      <p className="mt-1 text-xs text-subtle">{fill(text.chars, { n: codePoints(draft) })}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor={`move-${list}-${entryKey(entry)}`}>
          {text.moveLabel}
        </label>
        <select
          id={`move-${list}-${entryKey(entry)}`}
          className="field w-full sm:w-auto"
          value={moveTo}
          onChange={(event) => {
            const value = event.target.value;
            setMoveTo("");
            if (isListId(value)) onMove(value);
          }}
        >
          <option value="">{text.moveLabel}</option>
          {LISTS.filter((item) => item !== list).map((item) => (
            <option key={item} value={item}>
              {listLabel(text, item)}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-bad" onClick={onRemove}>
          {text.remove}
        </button>
      </div>
    </article>
  );
}

function IdLink({ id, text, facts }: { id: string; text: Copy; facts: IdFacts | null }) {
  const bits = [id];
  if (facts) {
    bits.push(facts.platform);
    if (facts.region !== "?") bits.push(regionLabel(text, facts.region));
  }
  return (
    <a className={`${facts ? regionClass(facts.region) : "region-pill region-unknown"} break-anywhere font-mono`} href={finderHref(id)}>
      {bits.join(" · ")}
    </a>
  );
}
