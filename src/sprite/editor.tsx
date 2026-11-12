import { useEffect, useRef, useState, type ReactNode } from "react";
import { TRANSPARENT, cloneBuffer, floodFill, getPixel, parseHex, strokeOnto, toHex } from "../draw/buffer.ts";
import { paletteColors, paletteIds } from "../draw/palettes.ts";
import { acceptsDrawPointer, cellFromClient } from "../draw/pointer.ts";
import { readImageFile } from "../draw/png.ts";
import { AVATAR_KEY, readAvatarDraft } from "./avatar-import.ts";
import {
  addEmptyFrame,
  deleteFrame,
  duplicateFrame,
  moveFrame,
  paintCurrent,
  replaceAll,
  replaceCurrent,
  resizeSnapshot,
  selectFrame,
} from "./frames.ts";
import { canRedoSprite, canUndoSprite, commitSprite, createSpriteHistory, redoSprite, undoSprite, type SpriteHistory } from "./history.ts";
import { DropperIcon, EraserIcon, FillIcon, PencilIcon } from "./icons.tsx";
import { shortcutBlocked, spriteShortcutFromKey, type SpriteShortcut } from "./keys.ts";
import { fill, type Copy } from "./messages.ts";
import {
  CANVAS_SIZES,
  MAX_FRAMES,
  clampColumns,
  clampFps,
  clampOpacity,
  emptyDoc,
  emptySnapshot,
  upscaleFactors,
  type CanvasSize,
  type FrameSnapshot,
  type SpriteDoc,
  type SpriteSettings,
  type ToolId,
  type Upscale,
} from "./model.ts";
import { compositeOnion } from "./onion.ts";
import { frameIndexAt } from "./playback.ts";
import { downloadCurrentFrame, downloadMeta, downloadSpritesheet, frameFromImage, metaFor } from "./png.ts";
import { sliceSpritesheet } from "./sheet.ts";
import { SAVE_KEY, loadDoc, rememberColor, resetDoc, saveDoc, type StorageLike } from "./storage.ts";

type Stroke = {
  pointerId: number;
  x: number;
  y: number;
  working: Uint8ClampedArray;
};

function readInitial(): SpriteDoc {
  try {
    return loadDoc(localStorage);
  } catch {
    return emptyDoc();
  }
}

function browserStore(): StorageLike | null {
  try {
    localStorage.getItem(SAVE_KEY);
    return localStorage;
  } catch {
    return null;
  }
}

function paintCanvas(canvas: HTMLCanvasElement | null, pixels: Uint8ClampedArray, size: number) {
  const ctx = canvas?.getContext("2d");
  if (!ctx || pixels.length < size * size * 4) return;
  ctx.imageSmoothingEnabled = false;
  try {
    ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels.subarray(0, size * size * 4)), size, size), 0, 0);
  } catch {
    // A mismatched buffer leaves the previous picture in place.
  }
}

export function Editor({ text }: { text: Copy }) {
  const boot = useRef<SpriteDoc | null>(null);
  if (boot.current === null) boot.current = readInitial();
  const initial = boot.current;
  const [history, setHistory] = useState<SpriteHistory>(() =>
    createSpriteHistory({ size: initial.size, frames: initial.frames, index: initial.index }),
  );
  const [settings, setSettings] = useState<SpriteSettings>(initial.settings);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  const [live, setLive] = useState("");
  const [playing, setPlaying] = useState(false);
  const [cellSize, setCellSize] = useState<number>(initial.size);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const pngRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef(history);
  const settingsRef = useRef(settings);
  const textRef = useRef(text);
  const strokeRef = useRef<Stroke | null>(null);
  const dragFrom = useRef<number | null>(null);
  const dirtyRef = useRef(false);
  const skipSaveRef = useRef(true);
  const confirmRef = useRef(false);
  historyRef.current = history;
  settingsRef.current = settings;
  textRef.current = text;
  confirmRef.current = confirmReset;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) setPlaying(false);
  }, []);

  function shownPixels(buf: Uint8ClampedArray, snap: FrameSnapshot, prefs: SpriteSettings): Uint8ClampedArray {
    if (!prefs.onion) return buf;
    const previous = snap.index > 0 ? (snap.frames[snap.index - 1] ?? null) : null;
    const nextFrame = snap.index + 1 < snap.frames.length ? (snap.frames[snap.index + 1] ?? null) : null;
    return compositeOnion(snap.size, buf, previous, nextFrame, prefs.onionOpacity, prefs.onionNext);
  }

  function paintEditor(buf: Uint8ClampedArray, snap: FrameSnapshot, prefs: SpriteSettings) {
    paintCanvas(canvasRef.current, shownPixels(buf, snap, prefs), snap.size);
  }

  useEffect(() => {
    if (strokeRef.current) return;
    const snap = history.present;
    const frame = snap.frames[snap.index];
    if (!frame) return;
    paintEditor(frame, snap, settings);
  }, [history, settings]);

  useEffect(() => {
    if (playing) return;
    const snap = history.present;
    const frame = snap.frames[snap.index];
    if (frame) paintCanvas(previewRef.current, frame, snap.size);
  }, [playing, history]);

  useEffect(() => {
    if (!playing) return;
    const origin = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const snap = historyRef.current.present;
      const prefs = settingsRef.current;
      const index = frameIndexAt(now - origin, prefs.fps, snap.frames.length, prefs.mode);
      const frame = snap.frames[index];
      if (frame) paintCanvas(previewRef.current, frame, snap.size);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, settings.fps, settings.mode]);

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    if (!dirtyRef.current) return;
    const store = browserStore();
    if (!store) {
      setStorageFailed(true);
      return;
    }
    const snap = history.present;
    setStorageFailed(!saveDoc(store, { ...snap, settings }));
  }, [history, settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const down = (event: PointerEvent) => {
      if (!acceptsDrawPointer(event)) return;
      if (confirmRef.current) return;
      event.preventDefault();
      const snap = historyRef.current.present;
      const rect = canvas.getBoundingClientRect();
      const cell = cellFromClient(snap.size, event.clientX, event.clientY, rect);
      if (!cell) return;
      const prefs = settingsRef.current;
      const present = snap.frames[snap.index];
      if (!present) return;
      if (prefs.tool === "eyedropper") {
        const sample = getPixel(snap.size, present, cell.x, cell.y);
        dirtyRef.current = true;
        if (sample.a === 0) {
          setSettings((prev) => ({ ...prev, tool: "eraser" }));
          setLive(textRef.current.announceEraser);
        } else {
          const hex = toHex(sample);
          setSettings((prev) => ({
            ...prev,
            secondary: prev.color === hex ? prev.secondary : prev.color,
            color: hex,
            recent: prev.color === hex ? prev.recent : rememberColor(prev.recent, prev.color),
            tool: "pencil",
          }));
          setLive(textRef.current.announceEyedropper);
        }
        return;
      }
      if (prefs.tool === "fill") {
        const color = parseHex(prefs.color);
        if (!color) return;
        const next = paintCurrent(snap, (frame, size) => {
          floodFill(size, frame, cell.x, cell.y, color);
        });
        dirtyRef.current = true;
        setHistory((prev) => commitSprite(prev, next));
        setLive(textRef.current.announceFill);
        return;
      }
      canvas.setPointerCapture(event.pointerId);
      const color = prefs.tool === "eraser" ? TRANSPARENT : (parseHex(prefs.color) ?? TRANSPARENT);
      const working = cloneBuffer(present);
      strokeOnto(snap.size, working, cell.x, cell.y, cell.x, cell.y, color, false);
      strokeRef.current = { pointerId: event.pointerId, x: cell.x, y: cell.y, working };
      paintEditor(working, snap, prefs);
    };

    const move = (event: PointerEvent) => {
      const stroke = strokeRef.current;
      if (!stroke || stroke.pointerId !== event.pointerId) return;
      event.preventDefault();
      const snap = historyRef.current.present;
      const rect = canvas.getBoundingClientRect();
      const cell = cellFromClient(snap.size, event.clientX, event.clientY, rect);
      if (!cell || (cell.x === stroke.x && cell.y === stroke.y)) return;
      const prefs = settingsRef.current;
      const color = prefs.tool === "eraser" ? TRANSPARENT : (parseHex(prefs.color) ?? TRANSPARENT);
      strokeOnto(snap.size, stroke.working, stroke.x, stroke.y, cell.x, cell.y, color, false);
      stroke.x = cell.x;
      stroke.y = cell.y;
      paintEditor(stroke.working, snap, prefs);
    };

    const finish = (event: PointerEvent) => {
      const stroke = strokeRef.current;
      if (!stroke || stroke.pointerId !== event.pointerId) return;
      strokeRef.current = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      const snap = historyRef.current.present;
      const next = replaceCurrent(snap, stroke.working);
      dirtyRef.current = true;
      if (next) setHistory((prev) => commitSprite(prev, next));
      if (settingsRef.current.tool === "pencil") {
        setSettings((prev) => ({ ...prev, recent: rememberColor(prev.recent, prev.color) }));
      }
    };

    canvas.addEventListener("pointerdown", down, { passive: false });
    canvas.addEventListener("pointermove", move, { passive: false });
    canvas.addEventListener("pointerup", finish);
    canvas.addEventListener("pointercancel", finish);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", finish);
      canvas.removeEventListener("pointercancel", finish);
    };
  }, []);

  function applyShortcut(action: SpriteShortcut) {
    if (strokeRef.current) return;
    if (action === "undo") {
      undoNow();
      return;
    }
    if (action === "redo") {
      redoNow();
      return;
    }
    if (action === "swap") {
      swapColors();
      return;
    }
    if (action === "pencil" || action === "eraser" || action === "fill" || action === "eyedropper") {
      chooseTool(action);
      return;
    }
    if (action === "play") {
      togglePlay();
      return;
    }
    const snap = historyRef.current.present;
    if (action === "prev" || action === "next") {
      chooseFrame(snap.index + (action === "next" ? 1 : -1));
      return;
    }
    if (action === "moveLeft" || action === "moveRight") {
      applyFrameOp(moveFrame(snap, snap.index, snap.index + (action === "moveRight" ? 1 : -1)));
      return;
    }
    if (action === "add") applyFrameOp(addEmptyFrame(snap));
    else if (action === "duplicate") applyFrameOp(duplicateFrame(snap));
    else if (action === "remove") applyFrameOp(deleteFrame(snap));
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (shortcutBlocked(event.target, event.key)) return;
      if (confirmRef.current) {
        if (event.key === "Escape") setConfirmReset(false);
        return;
      }
      const action = spriteShortcutFromKey(event);
      if (!action) return;
      event.preventDefault();
      applyShortcut(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function undoNow() {
    if (!canUndoSprite(historyRef.current) || strokeRef.current) return;
    dirtyRef.current = true;
    setHistory((prev) => undoSprite(prev));
    setLive(textRef.current.announceUndo);
  }

  function redoNow() {
    if (!canRedoSprite(historyRef.current) || strokeRef.current) return;
    dirtyRef.current = true;
    setHistory((prev) => redoSprite(prev));
    setLive(textRef.current.announceRedo);
  }

  function chooseTool(tool: ToolId) {
    dirtyRef.current = true;
    setSettings((prev) => ({ ...prev, tool }));
    const labels = textRef.current;
    if (tool === "pencil") setLive(labels.announcePencil);
    else if (tool === "eraser") setLive(labels.announceEraser);
    else if (tool === "fill") setLive(labels.announceFill);
    else setLive(labels.announceEyedropper);
  }

  function chooseColor(hex: string) {
    const next = hex.toLowerCase();
    dirtyRef.current = true;
    setSettings((prev) => ({
      ...prev,
      secondary: prev.color === next ? prev.secondary : prev.color,
      color: next,
      recent: prev.color === next ? prev.recent : rememberColor(prev.recent, prev.color),
      tool: prev.tool === "eraser" || prev.tool === "eyedropper" ? "pencil" : prev.tool,
    }));
  }

  function swapColors() {
    dirtyRef.current = true;
    setSettings((prev) => ({
      ...prev,
      color: prev.secondary,
      secondary: prev.color,
      tool: prev.tool === "eraser" ? "pencil" : prev.tool,
    }));
    setLive(textRef.current.announceSwap);
  }

  function applyFrameOp(result: { snapshot: FrameSnapshot; changed: boolean; reason?: "min" | "cap" }) {
    if (!result.changed) {
      if (result.reason === "cap") setNotice(textRef.current.capNotice);
      if (result.reason === "min") setNotice(textRef.current.minNotice);
      return;
    }
    setNotice("");
    dirtyRef.current = true;
    setHistory((prev) => commitSprite(prev, result.snapshot));
    setLive(fill(textRef.current.announceFrame, { n: result.snapshot.index + 1 }));
  }

  function chooseFrame(index: number) {
    if (strokeRef.current) return;
    setHistory((prev) => {
      const next = selectFrame(prev.present, index);
      if (next === prev.present) return prev;
      return { ...prev, present: next };
    });
    dirtyRef.current = true;
    setLive(fill(textRef.current.announceFrame, { n: index + 1 }));
  }

  function changeSize(size: CanvasSize) {
    if (strokeRef.current) return;
    const next = resizeSnapshot(historyRef.current.present, size);
    if (!next || next === historyRef.current.present) return;
    dirtyRef.current = true;
    setHistory((prev) => commitSprite(prev, next));
    setCellSize(size);
  }

  function togglePlay() {
    setPlaying((prev) => {
      const next = !prev;
      setLive(next ? textRef.current.announcePlay : textRef.current.announcePause);
      return next;
    });
  }

  function doReset() {
    strokeRef.current = null;
    skipSaveRef.current = true;
    dirtyRef.current = false;
    const store = browserStore();
    const ok = store ? resetDoc(store) : false;
    const fresh = emptyDoc();
    setHistory(createSpriteHistory(emptySnapshot()));
    setSettings(fresh.settings);
    setPlaying(false);
    setConfirmReset(false);
    setNotice(ok ? text.resetDone : text.resetFailed);
  }

  async function onPng(file: File) {
    setNotice("");
    const read = await readImageFile(file);
    const snap = historyRef.current.present;
    const nextPixels = read ? frameFromImage(read.data, read.width, read.height, snap.size) : null;
    if (!nextPixels) {
      setNotice(text.importFailed);
      return;
    }
    const next = replaceCurrent(snap, nextPixels);
    if (!next) {
      setNotice(text.importFailed);
      return;
    }
    dirtyRef.current = true;
    setHistory((prev) => commitSprite(prev, next));
    setLive(text.announceImport);
  }

  async function onSheet(file: File) {
    setNotice("");
    const read = await readImageFile(file);
    const snap = historyRef.current.present;
    const frames = read ? sliceSpritesheet(read.data, read.width, read.height, cellSize, snap.size, MAX_FRAMES) : null;
    if (!frames) {
      setNotice(text.sheetFailed);
      return;
    }
    const next = replaceAll(snap, frames);
    if (!next) {
      setNotice(text.sheetFailed);
      return;
    }
    dirtyRef.current = true;
    setHistory((prev) => commitSprite(prev, next));
    setLive(text.announceImport);
  }

  function onAvatar() {
    setNotice("");
    let store: Storage | null = null;
    try {
      store = localStorage;
      store.getItem(AVATAR_KEY);
    } catch {
      store = null;
    }
    if (!store) {
      setNotice(text.avatarCorrupt);
      return;
    }
    const snap = historyRef.current.present;
    const read = readAvatarDraft(store, snap.size);
    if (!read.ok) {
      setNotice(read.reason === "missing" ? text.avatarMissing : text.avatarCorrupt);
      return;
    }
    const next = replaceCurrent(snap, read.pixels);
    if (!next) {
      setNotice(text.avatarCorrupt);
      return;
    }
    dirtyRef.current = true;
    setHistory((prev) => commitSprite(prev, next));
    setNotice(read.resampled ? text.avatarResized : "");
    setLive(text.announceAvatar);
  }

  async function exportSheet() {
    const snap = historyRef.current.present;
    const prefs = settingsRef.current;
    const ok = await downloadSpritesheet(snap.frames, snap.size, prefs.sheetLayout, prefs.columns, prefs.upscale);
    if (!ok) return;
    if (prefs.withJson) {
      downloadMeta(
        metaFor({
          size: snap.size,
          count: snap.frames.length,
          fps: prefs.fps,
          columns: prefs.sheetLayout === "strip" ? snap.frames.length : prefs.columns,
          mode: prefs.mode,
          layout: prefs.sheetLayout,
        }),
      );
    }
  }

  async function exportFrame() {
    const snap = historyRef.current.present;
    const frame = snap.frames[snap.index];
    if (!frame) return;
    await downloadCurrentFrame(frame, snap.size, settingsRef.current.upscale);
  }

  const snap = history.present;
  const frame = snap.frames[snap.index];
  const recent = settings.recent.filter((color) => color !== settings.color).slice(0, 8);
  const colors = paletteColors(settings.palette);
  const atCap = snap.frames.length >= MAX_FRAMES;

  return (
    <div className="flex flex-col gap-4" data-testid="sprite-editor">
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      <div className="editor-grid">
        <div className="flex flex-col gap-3">
          <div className="pixel-frame">
            <div className="pixel-stage" style={{ ["--cells" as string]: snap.size }}>
              <canvas
                ref={canvasRef}
                className="pixel-canvas"
                data-testid="pixel-canvas"
                width={snap.size}
                height={snap.size}
                aria-label={fill(text.canvasLabel, { size: snap.size })}
                style={{ touchAction: "none" }}
              />
              {settings.grid ? <div className="pixel-grid" aria-hidden="true" /> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={text.sizeLabel}>
            {CANVAS_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className="btn btn-ghost tool-btn"
                aria-pressed={snap.size === size}
                onClick={() => changeSize(size)}
              >
                {fill(text.sizeN, { size })}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-ghost tool-btn"
              aria-pressed={settings.grid}
              onClick={() => {
                dirtyRef.current = true;
                setSettings((prev) => ({ ...prev, grid: !prev.grid }));
                setLive(text.announceGrid);
              }}
            >
              {text.grid}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={undoNow} disabled={!canUndoSprite(history)} aria-keyshortcuts="Control+Z Meta+Z">
              {text.undo}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={redoNow}
              disabled={!canRedoSprite(history)}
              aria-keyshortcuts="Control+Y Control+Shift+Z"
            >
              {text.redo}
            </button>
          </div>
          <p className="text-sm text-muted">{fill(text.framePosition, { n: snap.index + 1, total: snap.frames.length })}</p>
        </div>

        <div className="panel flex flex-col gap-4 rounded-2xl p-4">
          <div>
            <p className="text-sm font-semibold text-fg">{text.toolsLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2" role="toolbar" aria-label={text.toolsLabel}>
              <ToolButton tool="pencil" current={settings.tool} label={text.pencil} shortcut="B" onPick={chooseTool}>
                <PencilIcon />
              </ToolButton>
              <ToolButton tool="eraser" current={settings.tool} label={text.eraser} shortcut="E" onPick={chooseTool}>
                <EraserIcon />
              </ToolButton>
              <ToolButton tool="fill" current={settings.tool} label={text.fillTool} shortcut="G" onPick={chooseTool}>
                <FillIcon />
              </ToolButton>
              <ToolButton tool="eyedropper" current={settings.tool} label={text.eyedropper} shortcut="I" onPick={chooseTool}>
                <DropperIcon />
              </ToolButton>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-fg">{text.currentColor}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="color-chip" style={{ background: settings.color }} aria-hidden="true" />
              <button type="button" className="btn btn-ghost" onClick={swapColors} aria-keyshortcuts="X" aria-label={text.swap}>
                {text.swap}
              </button>
              <span className="color-chip" style={{ background: settings.secondary }} title={text.secondaryColor} aria-label={text.secondaryColor} />
              <span className="font-mono text-sm text-muted">{settings.color}</span>
            </div>
            <label className="mt-3 flex items-center gap-3 text-sm text-muted">
              {text.custom}
              <input
                type="color"
                value={settings.color}
                aria-label={text.custom}
                onChange={(event) => chooseColor(event.target.value)}
                className="h-11 w-14 cursor-pointer rounded-md border border-line bg-surface"
              />
            </label>
          </div>

          <div>
            <p id="palette-label" className="text-sm font-semibold text-fg">
              {text.paletteLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="palette-label">
              {paletteIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="btn btn-ghost tool-btn"
                  aria-pressed={settings.palette === id}
                  onClick={() => {
                    dirtyRef.current = true;
                    setSettings((prev) => ({ ...prev, palette: id }));
                  }}
                >
                  {text.palettes[id]}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="listbox" aria-label={text.palettes[settings.palette]}>
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="option"
                  className="swatch"
                  style={{ background: color }}
                  aria-label={fill(text.swatch, { color })}
                  aria-selected={settings.color === color}
                  aria-pressed={settings.color === color}
                  onClick={() => chooseColor(color)}
                />
              ))}
            </div>
          </div>

          {recent.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-fg">{text.recent}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {recent.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="swatch"
                    style={{ background: color }}
                    aria-label={fill(text.swatch, { color })}
                    onClick={() => chooseColor(color)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-sm font-semibold text-fg">{text.onion}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-ghost tool-btn"
                data-testid="onion"
                aria-pressed={settings.onion}
                onClick={() => {
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, onion: !prev.onion }));
                  setLive(text.announceOnion);
                }}
              >
                {text.onion}
              </button>
              <button
                type="button"
                className="btn btn-ghost tool-btn"
                aria-pressed={settings.onionNext}
                onClick={() => {
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, onionNext: !prev.onionNext }));
                }}
              >
                {text.onionNext}
              </button>
            </div>
            <label className="mt-3 flex items-center gap-3 text-sm text-muted">
              {text.opacity}
              <input
                type="range"
                min={10}
                max={80}
                step={5}
                value={Math.round(settings.onionOpacity * 100)}
                aria-label={text.opacity}
                onChange={(event) => {
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, onionOpacity: clampOpacity(Number(event.target.value) / 100) }));
                }}
              />
            </label>
          </div>

          <div data-testid="preview">
            <p className="text-sm font-semibold text-fg">{text.previewHeading}</p>
            <div className="preview-frame mt-2">
              <div className="pixel-stage">
                <canvas
                  ref={previewRef}
                  className="pixel-canvas"
                  data-testid="preview-canvas"
                  data-playing={playing ? "true" : "false"}
                  width={snap.size}
                  height={snap.size}
                  aria-label={text.previewHeading}
                />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-primary" aria-pressed={playing} onClick={togglePlay}>
                {playing ? text.pause : text.play}
              </button>
              <label className="flex items-center gap-2 text-sm text-muted">
                {text.fpsLabel}
                <input
                  id="sprite-fps"
                  className="field w-20"
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  value={settings.fps}
                  aria-label={text.fpsLabel}
                  onChange={(event) => {
                    const n = Number(event.target.value);
                    if (!Number.isFinite(n)) return;
                    dirtyRef.current = true;
                    setSettings((prev) => ({ ...prev, fps: clampFps(n) }));
                  }}
                />
              </label>
              <button
                type="button"
                className="btn btn-ghost tool-btn"
                aria-pressed={settings.mode === "loop"}
                onClick={() => {
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, mode: "loop" }));
                }}
              >
                {text.loop}
              </button>
              <button
                type="button"
                className="btn btn-ghost tool-btn"
                aria-pressed={settings.mode === "pingpong"}
                onClick={() => {
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, mode: "pingpong" }));
                }}
              >
                {text.pingpong}
              </button>
            </div>
          </div>

          <div data-testid="export-options">
            <p className="text-sm font-semibold text-fg">{text.exportHeading}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text.exportNote}</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={text.exportHeading}>
              <button
                type="button"
                className="btn btn-ghost tool-btn"
                aria-pressed={settings.sheetLayout === "strip"}
                onClick={() => {
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, sheetLayout: "strip" }));
                }}
              >
                {text.layoutStrip}
              </button>
              <button
                type="button"
                className="btn btn-ghost tool-btn"
                aria-pressed={settings.sheetLayout === "grid"}
                onClick={() => {
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, sheetLayout: "grid" }));
                }}
              >
                {text.layoutGrid}
              </button>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-muted">
              {text.columnsLabel}
              <input
                className="field w-20"
                type="number"
                min={1}
                max={64}
                step={1}
                value={settings.columns}
                aria-label={text.columnsLabel}
                onChange={(event) => {
                  const n = Number(event.target.value);
                  if (!Number.isFinite(n)) return;
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, columns: clampColumns(n) }));
                }}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={text.scaleLabel}>
              {upscaleFactors.map((factor) => (
                <button
                  key={factor}
                  type="button"
                  className="btn btn-ghost tool-btn"
                  aria-pressed={settings.upscale === factor}
                  onClick={() => {
                    dirtyRef.current = true;
                    setSettings((prev) => ({ ...prev, upscale: factor as Upscale }));
                  }}
                >
                  {fill(text.scaleN, { size: factor })}
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={settings.withJson}
                onChange={(event) => {
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, withJson: event.target.checked }));
                }}
              />
              {text.withJson}
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" onClick={() => void exportSheet()}>
                {text.exportSheet}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void exportFrame()} disabled={!frame}>
                {text.exportFrame}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={pngRef}
              type="file"
              accept="image/png,image/*"
              className="sr-only"
              aria-label={text.importPng}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void onPng(file);
              }}
            />
            <input
              ref={sheetRef}
              type="file"
              accept="image/png,image/*"
              className="sr-only"
              aria-label={text.importSheet}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void onSheet(file);
              }}
            />
            <button type="button" className="btn btn-ghost" onClick={() => pngRef.current?.click()}>
              {text.importPng}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => sheetRef.current?.click()}>
              {text.importSheet}
            </button>
            <label className="flex items-center gap-2 text-sm text-muted">
              {text.cellLabel}
              <input
                className="field w-20"
                type="number"
                min={1}
                max={512}
                step={1}
                value={cellSize}
                aria-label={text.cellLabel}
                onChange={(event) => {
                  const n = Number(event.target.value);
                  if (!Number.isInteger(n) || n < 1) return;
                  setCellSize(Math.min(512, n));
                }}
              />
            </label>
            <button type="button" className="btn btn-ghost" onClick={onAvatar}>
              {text.importAvatar}
            </button>
            <button type="button" className="btn btn-bad" onClick={() => setConfirmReset(true)}>
              {text.reset}
            </button>
          </div>
          {notice ? <p className="text-sm text-fg">{notice}</p> : null}
          {storageFailed ? <p className="text-sm text-bad">{text.storageFailed}</p> : null}
        </div>
      </div>

      <section aria-labelledby="frames-heading">
        <h2 id="frames-heading" className="font-display text-xl font-semibold tracking-tight">
          {text.framesHeading}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => applyFrameOp(addEmptyFrame(snap))} disabled={atCap}>
            {text.addFrame}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => applyFrameOp(duplicateFrame(snap))} disabled={atCap}>
            {text.duplicateFrame}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => applyFrameOp(deleteFrame(snap))} disabled={snap.frames.length <= 1}>
            {text.deleteFrame}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => applyFrameOp(moveFrame(snap, snap.index, snap.index - 1))} disabled={snap.index === 0}>
            {text.moveLeft}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => applyFrameOp(moveFrame(snap, snap.index, snap.index + 1))}
            disabled={snap.index >= snap.frames.length - 1}
          >
            {text.moveRight}
          </button>
        </div>
        <div className="timeline mt-3" role="list" data-testid="timeline" aria-label={text.framesHeading}>
          {snap.frames.map((item, index) => (
            <button
              key={`${snap.size}-${index}-${item.length}`}
              type="button"
              role="listitem"
              className="thumb"
              aria-pressed={index === snap.index}
              aria-label={fill(text.frameLabel, { n: index + 1 })}
              draggable
              onDragStart={(event) => {
                dragFrom.current = index;
                event.dataTransfer.setData("text/plain", String(index));
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const raw = event.dataTransfer.getData("text/plain");
                const from = raw === "" ? dragFrom.current : Number(raw);
                dragFrom.current = null;
                if (from === null || !Number.isInteger(from)) return;
                applyFrameOp(moveFrame(historyRef.current.present, from, index));
              }}
              onDragEnd={() => {
                dragFrom.current = null;
              }}
              onClick={() => chooseFrame(index)}
            >
              <FrameThumb frame={item} size={snap.size} />
            </button>
          ))}
        </div>
      </section>

      {confirmReset ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div role="alertdialog" aria-labelledby="sprite-ask" className="panel w-full max-w-md rounded-xl px-4 py-4">
            <p id="sprite-ask" className="text-base leading-relaxed text-fg">
              {text.resetAsk}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-bad" onClick={doReset}>
                {text.resetYes}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)} autoFocus>
                {text.resetNo}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FrameThumb({ frame, size }: { frame: Uint8ClampedArray; size: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    paintCanvas(ref.current, frame, size);
  }, [frame, size]);
  return <canvas ref={ref} width={size} height={size} aria-hidden="true" />;
}

function ToolButton({
  tool,
  current,
  label,
  shortcut,
  onPick,
  children,
}: {
  tool: ToolId;
  current: ToolId;
  label: string;
  shortcut: string;
  onPick: (tool: ToolId) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="btn btn-ghost tool-btn"
      aria-pressed={current === tool}
      aria-keyshortcuts={shortcut}
      aria-label={`${label} (${shortcut})`}
      onClick={() => onPick(tool)}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
