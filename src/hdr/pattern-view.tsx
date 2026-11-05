import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { ChevronIcon } from "./icons.tsx";
import { gridMove } from "./keyboard.ts";
import { fill, type Copy } from "./messages.ts";
import type { PickerItem } from "./picker-model.ts";
import { grayHex, rampColumnCode, type Pattern, type PatternId, type Step } from "./patterns.ts";

const HIDE_MS = 2800;

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
              <span className="pattern-preview" style={item.preview} aria-hidden="true" />
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

export function PatternStage({
  stageRef,
  pattern,
  index,
  total,
  text,
  fullscreen,
  fullscreenError,
  onPrev,
  onNext,
  onClose,
  onToggleFullscreen,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  pattern: Pattern;
  index: number;
  total: number;
  text: Copy;
  fullscreen: boolean;
  fullscreenError: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
}) {
  const controlsRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const overControls = useRef(false);
  const [shown, setShown] = useState(true);
  const name = text.patterns[pattern.id].name;
  const hint = text.patterns[pattern.id].hint;
  const status = fill(text.patternStatus, { name, n: index + 1, total });

  useEffect(() => {
    setShown(true);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    if (!fullscreen) return;
    hideTimer.current = window.setTimeout(() => {
      const root = controlsRef.current;
      const active = document.activeElement;
      const focused = Boolean(root && active instanceof Node && root.contains(active));
      if (overControls.current || focused) return;
      setShown(false);
    }, HIDE_MS);
    return () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, [fullscreen, pattern.id]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const active = document.activeElement;
    if (active instanceof Node && node.contains(active) && active !== node) return;
    node.focus();
  }, [pattern.id, stageRef]);

  function poke(hideAgain: boolean) {
    setShown(true);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    if (!hideAgain) return;
    hideTimer.current = window.setTimeout(() => {
      const root = controlsRef.current;
      const active = document.activeElement;
      const focused = Boolean(root && active instanceof Node && root.contains(active));
      if (overControls.current || focused) return;
      setShown(false);
    }, HIDE_MS);
  }

  const hidden = fullscreen && !shown;

  return (
    <div
      ref={stageRef}
      className="stage"
      data-testid="pattern-stage"
      data-pattern={pattern.id}
      role="region"
      aria-label={name}
      tabIndex={-1}
      onPointerMove={() => poke(fullscreen)}
      onPointerDown={() => poke(fullscreen)}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
      <PatternFill pattern={pattern} whiteChip={text.whiteChip} />
      <div
        ref={controlsRef}
        className="controls panel"
        data-testid="pattern-controls"
        data-hidden={hidden ? "true" : "false"}
        role="toolbar"
        aria-label={text.controls}
        onPointerEnter={() => {
          overControls.current = true;
          poke(false);
        }}
        onPointerLeave={() => {
          overControls.current = false;
          poke(fullscreen);
        }}
        onFocusCapture={() => poke(false)}
        onBlurCapture={() => poke(fullscreen)}
      >
        <div className="controls-title">
          <p className="controls-name">{name}</p>
          <p className="controls-count">
            {index + 1} / {total}
          </p>
        </div>
        <div className="controls-actions">
          <button type="button" className="btn btn-ghost icon-btn" data-testid="prev-pattern" aria-label={text.prev} onClick={onPrev}>
            <ChevronIcon direction="left" />
          </button>
          <button type="button" className="btn btn-ghost icon-btn" data-testid="next-pattern" aria-label={text.next} onClick={onNext}>
            <ChevronIcon direction="right" />
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-testid="fullscreen-button"
            aria-pressed={fullscreen}
            onClick={onToggleFullscreen}
          >
            {fullscreen ? text.fullscreenExit : text.fullscreenEnter}
          </button>
          <button type="button" className="btn btn-ghost" data-testid="close-pattern" onClick={onClose}>
            {text.closePattern}
          </button>
        </div>
        <p className="controls-hint">{hint}</p>
        <p className="controls-hint">{text.shortcutHint}</p>
        {fullscreenError ? (
          <p role="status" className="controls-note">
            {text.fullscreenUnavailable}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PatternFill({ pattern, whiteChip }: { pattern: Pattern; whiteChip: string }) {
  if (pattern.kind === "steps") return <StepStrip steps={pattern.steps} ink={pattern.ink} />;
  if (pattern.kind === "pluge") return <PlugeFill pattern={pattern} whiteChip={whiteChip} />;
  return <RampFill pattern={pattern} />;
}

function StepLabel({ step }: { step: Step }) {
  return (
    <span className="step-label">
      <span className="step-main">{step.label}</span>
      <span className="step-detail">{step.color.toUpperCase()}</span>
    </span>
  );
}

function StepStrip({ steps, ink }: { steps: readonly Step[]; ink: string }) {
  return (
    <div className="pattern-fill steps" data-testid="steps">
      {steps.map((step) => (
        <div key={step.code} data-code={step.code} style={{ backgroundColor: step.color, color: ink }}>
          <StepLabel step={step} />
        </div>
      ))}
    </div>
  );
}

function PlugeFill({
  pattern,
  whiteChip,
}: {
  pattern: Extract<Pattern, { kind: "pluge" }>;
  whiteChip: string;
}) {
  return (
    <div className="pattern-fill pluge" data-testid="pluge" style={{ backgroundColor: pattern.field }}>
      <div className="pluge-row">
        {pattern.bars.map((bar) => (
          <div
            key={bar.code}
            className="pluge-bar"
            data-code={bar.code}
            data-outline={bar.code === 0 ? "true" : "false"}
            style={{ backgroundColor: bar.color, color: "#9a9a9a" }}
          >
            <StepLabel step={bar} />
          </div>
        ))}
      </div>
      <div className="pluge-white" style={{ backgroundColor: pattern.reference, color: "#1a1a1a" }}>
        <span className="step-main">{whiteChip}</span>
      </div>
    </div>
  );
}

function RampFill({ pattern }: { pattern: Extract<Pattern, { kind: "ramp" }> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(256, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      for (let x = 0; x < width; x += 1) {
        ctx.fillStyle = grayHex(rampColumnCode(x, width));
        ctx.fillRect(x, 0, 1, height);
      }
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pattern-fill ramp" data-testid="gray-ramp">
      <div className="ramp-canvas-wrap">
        <div className="ramp-fallback" style={{ backgroundImage: "linear-gradient(to right, #000000, #ffffff)" }} aria-hidden="true" />
        <canvas ref={canvasRef} className="ramp-canvas" aria-hidden="true" />
        <div className="ramp-ticks" aria-hidden="true">
          {pattern.ticks.map((tick) => (
            <span key={tick.code} className="ramp-tick" data-code={tick.code} style={tickStyle(tick.code)}>
              {tick.label}
            </span>
          ))}
        </div>
      </div>
      <div className="ramp-patches">
        {pattern.patches.map((patch) => (
          <div
            key={patch.code}
            className="ramp-patch"
            data-code={patch.code}
            style={{ backgroundColor: patch.color, color: patch.code < 140 ? "#f3f5f8" : "#1a1a1a" }}
          >
            <StepLabel step={patch} />
          </div>
        ))}
      </div>
    </div>
  );
}

function tickStyle(code: number): Record<string, string> {
  if (code === 0) return { left: "0.6rem" };
  if (code === 255) return { right: "0.6rem" };
  return { left: `${(code / 255) * 100}%`, transform: "translateX(-50%)" };
}
