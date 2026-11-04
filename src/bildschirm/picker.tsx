import type { KeyboardEvent } from "react";
import { gridMove } from "./keyboard.ts";
import type { PickerItem } from "./picker-model.ts";
import type { PatternId } from "./patterns.ts";

export function PatternPicker({
  label,
  items,
  columns,
  onOpen,
}: {
  label: string;
  items: readonly PickerItem[];
  columns: number;
  onOpen: (id: PatternId) => void;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-pattern]")];
    if (!buttons.length) return;
    const current = buttons.findIndex((button) => button === document.activeElement);
    const next = gridMove(current === -1 ? 0 : current, event.key, columns, buttons.length);
    if (next === null) return;
    event.preventDefault();
    event.stopPropagation();
    buttons[next]?.focus();
  }

  return (
    <ul aria-label={label} data-testid="pattern-list" className="pattern-grid" onKeyDown={onKeyDown}>
      {items.map((item) => {
        const nameId = `pattern-${item.id}-name`;
        const descId = `pattern-${item.id}-desc`;
        return (
          <li key={item.id}>
            <button
              type="button"
              className="panel pattern-card"
              data-pattern={item.id}
              aria-labelledby={nameId}
              aria-describedby={descId}
              aria-keyshortcuts={item.shortcut ?? undefined}
              onClick={() => onOpen(item.id)}
            >
              <span className="pattern-preview" style={item.preview} aria-hidden="true">
                {item.id === "sharpness" ? <span className="pattern-preview-type">Aa</span> : null}
              </span>
              <span className="pattern-card-row">
                <span id={nameId} className="pattern-card-title">
                  {item.name}
                </span>
                {item.shortcut ? (
                  <span className="pattern-key" aria-hidden="true">
                    {item.shortcut}
                  </span>
                ) : null}
              </span>
              <span id={descId} className="pattern-card-copy">
                {item.description}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
