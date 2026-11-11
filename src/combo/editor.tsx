import { DIRECTION_GLYPH } from "./notation.ts";
import { buttonLabel, directionLabel, stepPhrase, type Copy } from "./messages.ts";
import { FaceMark } from "./symbols.tsx";
import { FACE_BUTTONS, type Direction, type FaceButton, type Step } from "./types.ts";

const PAD: (Direction | null)[] = [7, 8, 9, 4, null, 6, 1, 2, 3];

export function Editor({
  text,
  title,
  name,
  windowText,
  steps,
  direction,
  button,
  recording,
  notice,
  onName,
  onWindow,
  onDirection,
  onButton,
  onAdd,
  onRemove,
  onMove,
  onRecord,
  onSave,
  onCancel,
}: {
  text: Copy;
  title: string;
  name: string;
  windowText: string;
  steps: readonly Step[];
  direction: Direction | null;
  button: FaceButton | null;
  recording: boolean;
  notice: string;
  onName: (value: string) => void;
  onWindow: (value: string) => void;
  onDirection: (direction: Direction | null) => void;
  onButton: (button: FaceButton | null) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, delta: number) => void;
  onRecord: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="panel mt-6 rounded-xl px-4 py-4" aria-labelledby="editor-title" data-testid="editor">
      <h2 id="editor-title" className="font-display text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium" htmlFor="combo-name">
          {text.nameLabel}
          <input
            id="combo-name"
            className="field mt-1"
            value={name}
            placeholder={text.namePlaceholder}
            maxLength={32}
            onChange={(event) => onName(event.target.value)}
          />
        </label>
        <label className="block text-sm font-medium" htmlFor="combo-window">
          {text.windowOverride}
          <input
            id="combo-window"
            className="field mt-1"
            inputMode="numeric"
            value={windowText}
            placeholder="12"
            onChange={(event) => onWindow(event.target.value)}
          />
          <span className="mt-1 block text-sm font-normal text-subtle">{text.windowOverrideHint}</span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-ghost" aria-pressed={recording} onClick={onRecord}>
          {recording ? text.recordStop : text.recordStart}
        </button>
        {recording ? <p className="text-sm text-muted">{text.recording}</p> : null}
      </div>

      <h3 className="mt-5 text-sm font-semibold">{text.stepsHeading}</h3>
      {steps.length === 0 ? <p className="mt-2 text-sm text-muted">{text.noSteps}</p> : null}
      <ol className="mt-2 flex flex-col gap-2">
        {steps.map((step, index) => (
          <li key={`${index}-${step.direction ?? "n"}-${step.button ?? "n"}`} className="step-row">
            <span className="step-glyph" aria-hidden="true">
              {step.direction ? <span className="arrow-glyph">{DIRECTION_GLYPH[step.direction]}</span> : null}
              {step.button ? (
                <span className={`tone-${step.button}`}>
                  <FaceMark button={step.button} />
                </span>
              ) : null}
            </span>
            <span className="min-w-0 flex-1 text-sm">{stepPhrase(text, step.direction, step.button)}</span>
            <button type="button" className="btn btn-ghost" onClick={() => onMove(index, -1)} aria-label={text.moveUp}>
              ↑
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onMove(index, 1)} aria-label={text.moveDown}>
              ↓
            </button>
            <button type="button" className="btn btn-bad" onClick={() => onRemove(index)} aria-label={text.removeStep}>
              ×
            </button>
          </li>
        ))}
      </ol>

      <div className="palette mt-4">
        <div>
          <p className="text-sm font-semibold">{text.padHeading}</p>
          <div className="dpad mt-2" role="group" aria-label={text.padHeading}>
            {PAD.map((item, index) => {
              const selected = item === direction;
              const label = item ? directionLabel(text, item) : text.clearDirection;
              return (
                <button
                  key={item ?? `clear-${index}`}
                  type="button"
                  className="pad-btn"
                  aria-pressed={selected}
                  aria-label={label}
                  onClick={() => onDirection(selected ? null : item)}
                >
                  {item ? DIRECTION_GLYPH[item] : "·"}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">{text.faceHeading}</p>
          <div className="faces mt-2" role="group" aria-label={text.faceHeading}>
            {FACE_BUTTONS.map((item) => (
              <button
                key={item}
                type="button"
                className={`face-hit face-${item}`}
                aria-pressed={button === item}
                aria-label={buttonLabel(text, item)}
                onClick={() => onButton(button === item ? null : item)}
              >
                <FaceMark button={item} />
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost mt-2" aria-pressed={button == null} onClick={() => onButton(null)}>
            {text.clearButton}
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" onClick={onAdd} disabled={direction == null && button == null}>
          {text.addStep}
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          {text.saveCombo}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          {text.cancel}
        </button>
      </div>
      {notice ? (
        <p role="status" className="mt-3 text-sm text-muted">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
