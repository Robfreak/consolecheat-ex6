import { useEffect, useRef, useState, type RefObject } from "react";
import { ChevronIcon } from "./icons.tsx";
import { fill, type Copy } from "./messages.ts";
import { checkerStyle, checkerTileRgba, gradientImage, SHARPNESS, type Pattern } from "./patterns.ts";

const HIDE_MS = 2800;

export function PatternStage({
  stageRef,
  pattern,
  index,
  total,
  text,
  fullscreen,
  motionRunning,
  fullscreenError,
  onPrev,
  onNext,
  onClose,
  onToggleFullscreen,
  onToggleMotion,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  pattern: Pattern;
  index: number;
  total: number;
  text: Copy;
  fullscreen: boolean;
  motionRunning: boolean;
  fullscreenError: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onToggleMotion: () => void;
}) {
  const controlsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hideTimer = useRef<number | null>(null);
  const overControls = useRef(false);
  const [shown, setShown] = useState(true);
  const name = text.patterns[pattern.id].name;
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

  useEffect(() => {
    if (pattern.kind !== "pixels") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const tile = document.createElement("canvas");
      tile.width = 2;
      tile.height = 2;
      const tileCtx = tile.getContext("2d");
      if (!tileCtx) return;
      const image = tileCtx.createImageData(2, 2);
      image.data.set(checkerTileRgba());
      tileCtx.putImageData(image, 0, 0);
      const fillStyle = ctx.createPattern(tile, "repeat");
      if (!fillStyle) return;
      ctx.fillStyle = fillStyle;
      ctx.fillRect(0, 0, width, height);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [pattern]);

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
      data-motion={motionRunning ? "play" : "pause"}
      role="region"
      aria-label={name}
      tabIndex={-1}
      onPointerMove={() => poke(fullscreen)}
      onPointerDown={() => poke(fullscreen)}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
      <PatternFill pattern={pattern} canvasRef={canvasRef} />
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
          {pattern.kind === "motion" ? (
            <button
              type="button"
              className="btn btn-ghost"
              data-testid="motion-toggle"
              aria-pressed={motionRunning}
              onClick={onToggleMotion}
            >
              {motionRunning ? text.motionPause : text.motionPlay}
            </button>
          ) : null}
        </div>
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

function PatternFill({
  pattern,
  canvasRef,
}: {
  pattern: Pattern;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  if (pattern.kind === "solid") {
    return <div className="pattern-fill" style={{ backgroundColor: pattern.color }} />;
  }
  if (pattern.kind === "bands") {
    return (
      <div className="pattern-fill bands">
        {pattern.bands.map((band) => (
          <div key={band.label} style={{ backgroundColor: band.color, color: pattern.ink }}>
            <span className="band-label">{band.label}</span>
          </div>
        ))}
      </div>
    );
  }
  if (pattern.kind === "gradient") {
    return <div className="pattern-fill" style={{ backgroundImage: gradientImage(pattern.direction) }} />;
  }
  if (pattern.kind === "checker") {
    return <div className="pattern-fill" style={checkerStyle(pattern.size)} />;
  }
  if (pattern.kind === "pixels") {
    return <canvas ref={canvasRef} className="pattern-fill pixel-canvas" aria-hidden="true" />;
  }
  if (pattern.kind === "motion" && pattern.motion === "bar") {
    return (
      <div className="pattern-fill motion-field">
        <div className="motion-bar" />
      </div>
    );
  }
  if (pattern.kind === "motion") {
    return <div className="pattern-fill motion-scroll" />;
  }
  return (
    <div className="pattern-fill sharpness">
      <SharpnessColumn tone="dark" />
      <SharpnessColumn tone="light" />
    </div>
  );
}

function SharpnessColumn({ tone }: { tone: "dark" | "light" }) {
  return (
    <div className={tone === "dark" ? "sharp-col sharp-dark" : "sharp-col sharp-light"}>
      {SHARPNESS.sizes.map((size) => (
        <p key={size} className="sharp-line" style={{ fontSize: `${size}px` }}>
          {size}px {SHARPNESS.glyphs}
        </p>
      ))}
      <p className="sharp-pangram">{SHARPNESS.de}</p>
      <p className="sharp-pangram">{SHARPNESS.en}</p>
      <div className="hairlines" aria-hidden="true">
        <span className="hairline-h" />
        <span className="hairline-h hairline-gap" />
        <span className="hairline-v" />
        <span className="hairline-v hairline-gap" />
      </div>
    </div>
  );
}
