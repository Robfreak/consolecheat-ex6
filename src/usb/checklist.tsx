import { useState, type KeyboardEvent } from "react";
import {
  consoleFilters,
  countProgress,
  exportMarkdown,
  exportPlain,
  exportRows,
  fillProgress,
  sectionIds,
  EXPORT_MARKDOWN_NAME,
  EXPORT_TEXT_NAME,
  type ConsoleFilter,
  type ExportText,
} from "./checklist.ts";
import type { Copy } from "./messages.ts";

function saveFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function Checklist({
  text,
  consoleId,
  checked,
  onConsole,
  onToggle,
  onReset,
}: {
  text: Copy;
  consoleId: ConsoleFilter;
  checked: readonly string[];
  onConsole: (next: ConsoleFilter) => void;
  onToggle: (id: string) => void;
  onReset: () => void;
}) {
  const [notice, setNotice] = useState("");
  const rows = exportRows(text as ExportText, consoleId, checked);
  const { done, total } = countProgress(rows, checked);
  const plain = exportPlain(text, consoleId, checked);
  const markdown = exportMarkdown(text, consoleId, checked);

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = consoleFilters.indexOf(consoleId);
    const step = event.key === "ArrowRight" ? 1 : consoleFilters.length - 1;
    const next = consoleFilters[(index + step) % consoleFilters.length] ?? "both";
    onConsole(next);
    const tab = document.getElementById(`console-tab-${next}`);
    tab?.focus();
  }

  async function copy(contents: string) {
    try {
      await navigator.clipboard.writeText(contents);
      setNotice(text.copied);
    } catch {
      setNotice(text.copyFailed);
    }
  }

  return (
    <div data-testid="usb-checklist">
      <section className="mt-10" aria-labelledby="export-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="export-heading" className="font-display text-2xl font-semibold tracking-tight">
            {text.exportHeading}
          </h2>
          <p data-testid="progress" className="font-display text-lg font-semibold tracking-tight" aria-live="polite">
            {fillProgress(text.progress, done, total)}
          </p>
        </div>
        <div
          role="tablist"
          aria-label={text.consoleLabel}
          className="mt-4 flex flex-wrap gap-2"
          onKeyDown={onTabKey}
        >
          {consoleFilters.map((id) => {
            const selected = consoleId === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`console-tab-${id}`}
                data-testid={`console-${id}`}
                className={selected ? "btn btn-primary" : "btn btn-ghost"}
                aria-selected={selected}
                aria-controls="checklist-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => onConsole(id)}
              >
                {text.consoles[id]}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" data-testid="download-text" onClick={() => saveFile(EXPORT_TEXT_NAME, plain, "text/plain")}>
            {text.downloadText}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            data-testid="download-markdown"
            onClick={() => saveFile(EXPORT_MARKDOWN_NAME, markdown, "text/markdown")}
          >
            {text.downloadMarkdown}
          </button>
          <button type="button" className="btn btn-ghost" data-testid="copy-text" onClick={() => void copy(plain)}>
            {text.copyText}
          </button>
          <button type="button" className="btn btn-ghost" data-testid="copy-markdown" onClick={() => void copy(markdown)}>
            {text.copyMarkdown}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            data-testid="reset-checks"
            onClick={() => {
              onReset();
              setNotice(text.resetDone);
            }}
          >
            {text.reset}
          </button>
        </div>
        {notice ? (
          <p role="status" data-testid="export-notice" className="mt-3 text-sm text-muted">
            {notice}
          </p>
        ) : null}
        <div className="panel mt-4 rounded-xl px-4 py-4">
          <h3 className="text-sm font-semibold text-fg">{text.previewLabel}</h3>
          <pre data-testid="export-preview" className="export-preview mt-3 font-mono text-sm leading-relaxed text-muted">
            {plain}
          </pre>
        </div>
      </section>

      <div role="tabpanel" id="checklist-panel" aria-labelledby={`console-tab-${consoleId}`} data-console={consoleId} className="mt-10">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{text.checklistHeading}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-subtle">{text.verifyHint}</p>
        {sectionIds.map((section) => {
          const group = rows.filter((row) => row.section === section);
          if (!group.length) return null;
          return (
            <section key={section} className="panel mt-4 rounded-xl px-4 py-4 sm:px-5" aria-labelledby={`section-${section}`}>
              <h3 id={`section-${section}`} className="font-display text-xl font-semibold tracking-tight">
                {text.sections[section]}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{text.sectionIntro[section]}</p>
              <ul className="mt-4 flex list-none flex-col gap-3 p-0">
                {group.map((row) => (
                  <li key={row.id} data-testid={`item-${row.id}`} data-checked={row.checked ? "true" : "false"} data-certainty={row.certainty}>
                    <label className={`flex cursor-pointer gap-3 rounded-lg px-3 py-3 ${row.checked ? "bg-raised" : ""}`}>
                      <input
                        type="checkbox"
                        className="tick"
                        data-testid={`check-${row.id}`}
                        checked={row.checked}
                        onChange={() => onToggle(row.id)}
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-fg">{row.title}</span>
                          <span className="rounded-md border border-line px-2 py-0.5 text-xs font-semibold text-subtle">{row.certaintyLabel}</span>
                        </span>
                        {row.path ? (
                          <span className="mt-1 block font-mono text-sm break-anywhere text-steel">
                            {text.pathLabel}: {row.path}
                          </span>
                        ) : null}
                        <span className="mt-1 block text-sm leading-relaxed text-muted">{row.body}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
