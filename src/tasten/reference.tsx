import { type KeyboardEvent } from "react";
import { ControllerDiagram } from "./diagram.tsx";
import {
  CONTROLLER_TESTER_HREF,
  controlLabel,
  controlsFor,
  layouts,
  marks,
  nextLayout,
  type LayoutId,
} from "./layout.ts";
import type { Copy } from "./messages.ts";

export function Reference({
  text,
  layout,
  onLayout,
}: {
  text: Copy;
  layout: LayoutId;
  onLayout: (next: LayoutId) => void;
}) {
  const controls = controlsFor(layout);

  function onTabListKey(event: KeyboardEvent<HTMLDivElement>) {
    const next = nextLayout(layout, event.key);
    if (!next) return;
    event.preventDefault();
    onLayout(next);
    const tabId = `tab-${next}`;
    queueMicrotask(() => document.getElementById(tabId)?.focus());
  }

  return (
    <div data-testid="tasten-reference">
      <section className="panel mt-8 rounded-xl px-4 py-4 sm:px-5" aria-labelledby="tester-heading">
        <h2 id="tester-heading" className="font-display text-xl font-semibold tracking-tight">
          {text.testerHeading}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{text.testerBody}</p>
        <a className="btn btn-primary mt-4 w-full sm:w-auto" href={CONTROLLER_TESTER_HREF}>
          {text.testerLink}
        </a>
      </section>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{text.section}</h2>
        <div role="tablist" aria-label={text.layoutLabel} className="flex flex-wrap gap-2" onKeyDown={onTabListKey}>
          {layouts.map((id) => {
            const selected = layout === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                className={selected ? "btn btn-primary" : "btn btn-ghost"}
                aria-selected={selected}
                aria-controls="layout-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => onLayout(id)}
              >
                {text.layouts[id].name}
                <span className="ml-2 text-xs font-medium opacity-80">{text.layouts[id].platform}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id="layout-panel" aria-labelledby={`tab-${layout}`} data-layout={layout} className="mt-4">
        <p className="max-w-2xl text-sm leading-relaxed text-subtle">{text.diagramHint}</p>
        <div className="mt-4">
          <ControllerDiagram text={text} layout={layout} />
        </div>

        <section className="mt-8" aria-labelledby="control-list-heading">
          <h2 id="control-list-heading" className="font-display text-2xl font-semibold tracking-tight">
            {text.listHeading}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{text.symbolNote}</p>
          <ul className="control-list">
            {controls.map((id) => {
              const item = text.controls[id];
              const label = controlLabel(marks[id], item.name);
              return (
                <li key={id} id={`control-${id}`} className="control-item panel rounded-xl px-4 py-3" tabIndex={-1}>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="differences-heading">
          <h2 id="differences-heading" className="font-display text-2xl font-semibold tracking-tight">
            {text.differencesHeading}
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {text.differences.map((note) => (
              <article key={note.title} className="panel rounded-xl px-4 py-4">
                <h3 className="font-display text-lg font-semibold tracking-tight">{note.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{note.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
