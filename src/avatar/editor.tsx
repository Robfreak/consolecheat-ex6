import { useEffect, useRef, useState, type ReactNode } from "react";
import { downloadPng, readImageFile } from "./download.ts";
import { canRedo, canUndo, commit, createHistory, redo, undo, type History } from "./history.ts";
import { DropperIcon, EraserIcon, FillIcon, PencilIcon } from "./icons.tsx";
import { fill, type Copy } from "./messages.ts";
import { paletteColors, paletteIds } from "./palettes.ts";
import {
  SIZE,
  TRANSPARENT,
  cloneBuffer,
  cellFromOffset,
  floodFill,
  flipHorizontal,
  flipVertical,
  getPixel,
  mirrorX,
  parseHex,
  strokeOnto,
  toHex,
} from "./pixels.ts";
import { EXPORT_SIZES, downscaleNearest } from "./scale.ts";
import { isTypingTarget, shortcutFromKey, type Shortcut } from "./shortcuts.ts";
import {
  SAVE_KEY,
  defaultSettings,
  emptyDraft,
  loadDraft,
  rememberColor,
  resetDraft,
  saveDraft,
  zoomIds,
  type AvatarSettings,
  type Draft,
  type StorageLike,
  type ToolId,
} from "./storage.ts";

type ConfirmKind = "clear" | "reset";

type Stroke = {
  pointerId: number;
  x: number;
  y: number;
  working: Uint8ClampedArray;
};

function readInitial(): Draft {
  try {
    return loadDraft(localStorage);
  } catch {
    return emptyDraft();
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

export function Editor({ text }: { text: Copy }) {
  const boot = useRef<Draft | null>(null);
  if (boot.current === null) boot.current = readInitial();
  const initial = boot.current;
  const [history, setHistory] = useState<History>(() => createHistory(initial.pixels));
  const [settings, setSettings] = useState<AvatarSettings>(initial.settings);
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [notice, setNotice] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  const [live, setLive] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef(history);
  const settingsRef = useRef(settings);
  const textRef = useRef(text);
  const strokeRef = useRef<Stroke | null>(null);
  const shownRef = useRef(history.present);
  const dirtyRef = useRef(false);
  const skipSaveRef = useRef(false);
  const confirmRef = useRef<ConfirmKind | null>(null);
  historyRef.current = history;
  settingsRef.current = settings;
  textRef.current = text;
  confirmRef.current = confirm;

  function paintBuffer(buf: Uint8ClampedArray) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(new ImageData(new Uint8ClampedArray(buf), SIZE, SIZE), 0, 0);
  }

  useEffect(() => {
    if (strokeRef.current) return;
    shownRef.current = history.present;
    paintBuffer(history.present);
  }, [history]);

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
    setStorageFailed(!saveDraft(store, { pixels: history.present, settings }));
  }, [history, settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const show = (buf: Uint8ClampedArray) => {
      shownRef.current = buf;
      paintBuffer(buf);
    };

    const down = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (confirmRef.current) return;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cell = cellFromOffset(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
      if (!cell) return;
      const current = settingsRef.current;
      const present = historyRef.current.present;
      if (current.tool === "eyedropper") {
        const sample = getPixel(present, cell.x, cell.y);
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
      if (current.tool === "fill") {
        const color = parseHex(current.color);
        if (!color) return;
        const next = cloneBuffer(present);
        floodFill(next, cell.x, cell.y, color);
        if (current.symmetry) floodFill(next, mirrorX(cell.x), cell.y, color);
        dirtyRef.current = true;
        setHistory((prev) => commit(prev, next));
        setLive(textRef.current.announceFill);
        return;
      }
      canvas.setPointerCapture(event.pointerId);
      const color = current.tool === "eraser" ? TRANSPARENT : (parseHex(current.color) ?? TRANSPARENT);
      const working = cloneBuffer(present);
      strokeOnto(working, cell.x, cell.y, cell.x, cell.y, color, current.symmetry);
      strokeRef.current = { pointerId: event.pointerId, x: cell.x, y: cell.y, working };
      show(working);
    };

    const move = (event: PointerEvent) => {
      const stroke = strokeRef.current;
      if (!stroke || stroke.pointerId !== event.pointerId) return;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cell = cellFromOffset(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
      if (!cell || (cell.x === stroke.x && cell.y === stroke.y)) return;
      const current = settingsRef.current;
      const color = current.tool === "eraser" ? TRANSPARENT : (parseHex(current.color) ?? TRANSPARENT);
      strokeOnto(stroke.working, stroke.x, stroke.y, cell.x, cell.y, color, current.symmetry);
      stroke.x = cell.x;
      stroke.y = cell.y;
      show(stroke.working);
    };

    const finish = (event: PointerEvent) => {
      const stroke = strokeRef.current;
      if (!stroke || stroke.pointerId !== event.pointerId) return;
      strokeRef.current = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      dirtyRef.current = true;
      const next = stroke.working;
      setHistory((prev) => commit(prev, next));
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

  function applyShortcut(action: Shortcut) {
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
    chooseTool(action);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (confirmRef.current) {
        if (event.key === "Escape") setConfirm(null);
        return;
      }
      const action = shortcutFromKey(event);
      if (!action) return;
      event.preventDefault();
      applyShortcut(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function undoNow() {
    if (!canUndo(historyRef.current) || strokeRef.current) return;
    dirtyRef.current = true;
    setHistory((prev) => undo(prev));
    setLive(textRef.current.announceUndo);
  }

  function redoNow() {
    if (!canRedo(historyRef.current) || strokeRef.current) return;
    dirtyRef.current = true;
    setHistory((prev) => redo(prev));
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

  function flip(direction: "h" | "v") {
    if (strokeRef.current) return;
    dirtyRef.current = true;
    setHistory((prev) => commit(prev, direction === "h" ? flipHorizontal(prev.present) : flipVertical(prev.present)));
    setLive(direction === "h" ? textRef.current.announceFlipH : textRef.current.announceFlipV);
  }

  function clearCanvas() {
    if (strokeRef.current) return;
    dirtyRef.current = true;
    const blank = emptyDraft().pixels;
    setHistory((prev) => commit(prev, blank));
    setConfirm(null);
    setLive(textRef.current.announceClear);
  }

  function doReset() {
    strokeRef.current = null;
    skipSaveRef.current = true;
    dirtyRef.current = false;
    const store = browserStore();
    const ok = store ? resetDraft(store) : false;
    const fresh = defaultSettings();
    const blank = emptyDraft();
    shownRef.current = blank.pixels;
    setHistory(createHistory());
    setSettings(fresh);
    setConfirm(null);
    setNotice(ok ? text.resetDone : text.resetFailed);
    paintBuffer(blank.pixels);
  }

  async function onImport(file: File) {
    setNotice("");
    const read = await readImageFile(file);
    const next = read ? downscaleNearest(read.data, read.width, read.height) : null;
    if (!next) {
      setNotice(text.importFailed);
      return;
    }
    dirtyRef.current = true;
    setHistory((prev) => commit(prev, next));
    setLive(text.announceImport);
  }

  const recent = settings.recent.filter((color) => color !== settings.color).slice(0, 8);
  const colors = paletteColors(settings.palette);

  return (
    <div className="flex flex-col gap-4" data-testid="avatar-editor">
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      <div className="editor-grid">
        <div className="flex flex-col gap-3">
          <div className="pixel-frame" data-zoom={settings.zoom}>
            <div className="pixel-stage">
              <canvas
                ref={canvasRef}
                className="pixel-canvas"
                data-testid="pixel-canvas"
                width={SIZE}
                height={SIZE}
                aria-label={text.canvasLabel}
                style={{ touchAction: "none" }}
              />
              {settings.grid ? <div className="pixel-grid" aria-hidden="true" /> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={text.zoomLabel}>
            {zoomIds.map((zoom) => (
              <button
                key={zoom}
                type="button"
                className="btn btn-ghost tool-btn"
                aria-pressed={settings.zoom === zoom}
                onClick={() => {
                  dirtyRef.current = true;
                  setSettings((prev) => ({ ...prev, zoom }));
                }}
              >
                {zoom === "fit" ? text.zoomFit : fill(text.zoomN, { size: zoom })}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={undoNow} disabled={!canUndo(history)} aria-keyshortcuts="Control+Z Meta+Z">
              {text.undo}
            </button>
            <button type="button" className="btn btn-ghost" onClick={redoNow} disabled={!canRedo(history)} aria-keyshortcuts="Control+Y Control+Shift+Z">
              {text.redo}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => flip("h")}>
              {text.flipH}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => flip("v")}>
              {text.flipV}
            </button>
            <button type="button" className="btn btn-bad" onClick={() => setConfirm("clear")}>
              {text.clear}
            </button>
          </div>
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

          <div className="flex flex-wrap gap-2">
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
            <button
              type="button"
              className="btn btn-ghost tool-btn"
              aria-pressed={settings.symmetry}
              onClick={() => {
                dirtyRef.current = true;
                setSettings((prev) => ({ ...prev, symmetry: !prev.symmetry }));
                setLive(text.announceSymmetry);
              }}
            >
              {text.symmetry}
            </button>
          </div>

          <div>
            <p className="text-sm font-semibold text-fg">{text.currentColor}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="color-chip" style={{ background: settings.color }} aria-hidden="true" />
              <button type="button" className="btn btn-ghost" onClick={swapColors} aria-keyshortcuts="X" aria-label={text.swap}>
                {text.swap}
              </button>
              <span
                className="color-chip"
                style={{ background: settings.secondary }}
                title={text.secondaryColor}
                aria-label={text.secondaryColor}
              />
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

          <div data-testid="export-options">
            <p className="text-sm font-semibold text-fg">{text.exportHeading}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text.exportNote}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text.adderNote}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXPORT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={size === 64 ? "btn btn-primary" : "btn btn-ghost"}
                  onClick={() => downloadPng(history.present, size)}
                >
                  {fill(text.exportSize, { size })}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/*"
              className="sr-only"
              aria-label={text.importLabel}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void onImport(file);
              }}
            />
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
              {text.importLabel}
            </button>
            <button type="button" className="btn btn-bad" onClick={() => setConfirm("reset")}>
              {text.reset}
            </button>
          </div>
          {notice ? <p className="text-sm text-fg">{notice}</p> : null}
          {storageFailed ? <p className="text-sm text-bad">{text.storageFailed}</p> : null}
        </div>
      </div>

      {confirm ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div role="alertdialog" aria-labelledby="avatar-ask" className="panel w-full max-w-md rounded-xl px-4 py-4">
            <p id="avatar-ask" className="text-base leading-relaxed text-fg">
              {confirm === "clear" ? text.clearAsk : text.resetAsk}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-bad" onClick={confirm === "clear" ? clearCanvas : doReset}>
                {confirm === "clear" ? text.clearYes : text.resetYes}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)} autoFocus>
                {confirm === "clear" ? text.clearNo : text.resetNo}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
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
