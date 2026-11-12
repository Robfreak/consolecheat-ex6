import type { PaletteId } from "../draw/palettes.ts";
import type { ToolId } from "./model.ts";

export const languageOptions = [
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
] as const;

export type Lang = (typeof languageOptions)[number]["id"];

export type Copy = {
  brand: string;
  title: string;
  metaDescription: string;
  eyebrow: string;
  lede: string;
  freeClaim: string;
  privacyClaim: string;
  unofficial: string;
  footerNote: string;
  temporary: string;
  themeDark: string;
  themeLight: string;
  language: string;
  footerNav: string;
  toolsHeading: string;
  merkliste: string;
  storageNote: string;
  controlsHeading: string;
  controls: string;
  toolsLabel: string;
  pencil: string;
  eraser: string;
  fillTool: string;
  eyedropper: string;
  grid: string;
  undo: string;
  redo: string;
  swap: string;
  currentColor: string;
  secondaryColor: string;
  recent: string;
  paletteLabel: string;
  palettes: Record<PaletteId, string>;
  custom: string;
  sizeLabel: string;
  sizeN: string;
  canvasLabel: string;
  framesHeading: string;
  frameLabel: string;
  framePosition: string;
  addFrame: string;
  duplicateFrame: string;
  deleteFrame: string;
  moveLeft: string;
  moveRight: string;
  capNotice: string;
  minNotice: string;
  previewHeading: string;
  play: string;
  pause: string;
  fpsLabel: string;
  loop: string;
  pingpong: string;
  onion: string;
  onionNext: string;
  opacity: string;
  exportHeading: string;
  exportNote: string;
  layoutStrip: string;
  layoutGrid: string;
  columnsLabel: string;
  scaleLabel: string;
  scaleN: string;
  withJson: string;
  exportSheet: string;
  exportFrame: string;
  importPng: string;
  importSheet: string;
  cellLabel: string;
  importAvatar: string;
  importFailed: string;
  sheetFailed: string;
  avatarMissing: string;
  avatarCorrupt: string;
  avatarResized: string;
  reset: string;
  resetAsk: string;
  resetYes: string;
  resetNo: string;
  resetDone: string;
  resetFailed: string;
  storageFailed: string;
  swatch: string;
  announcePencil: string;
  announceEraser: string;
  announceFill: string;
  announceEyedropper: string;
  announceSwap: string;
  announceUndo: string;
  announceRedo: string;
  announceGrid: string;
  announcePlay: string;
  announcePause: string;
  announceFrame: string;
  announceOnion: string;
  announceImport: string;
  announceAvatar: string;
  deleteAll: string;
  deleteAsk: string;
  deleteYes: string;
  deleteNo: string;
  deleted: string;
  deleteFailed: string;
};

const shared = { brand: "consolecheat" } as const;

function pack(text: Omit<Copy, "brand">): Copy {
  return { ...shared, ...text };
}

const de = pack({
  title: "Sprite-Animator",
  metaDescription:
    "Sprite-Animator: Pixelbilder im Browser, Bild für Bild, mit Vorschau und Spritesheet-PNG. Der Entwurf bleibt in diesem Browser. Inoffiziell, nicht von Sony.",
  eyebrow: "PIXEL · BILDER",
  lede: "Ein Animator für kleine Sprites, direkt im Browser. Stift, Radierer, Füllen und Pipette, mehrere Bilder, Zwiebelschale und eine Vorschau. Nichts wird hochgeladen.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine sensiblen Daten werden gespeichert. Der Entwurf bleibt in diesem Browser und wird nicht hochgeladen.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Die Datei bleibt auf diesem Gerät. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend hier, bis der Animator ein eigenes Projekt ist.",
  themeDark: "Dunkles Erscheinungsbild",
  themeLight: "Helles Erscheinungsbild",
  language: "Sprache",
  footerNav: "Seitenfuß",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  storageNote: "Der Entwurf bleibt in diesem Browser unter dem Schlüssel consolecheat-sprite-v1.",
  controlsHeading: "Tasten",
  controls:
    "B Stift, E Radierer, G Füllen, I Pipette, X tauscht die beiden Farben. Strg+Z oder Cmd+Z macht rückgängig, Strg+Y oder Strg+Umschalt+Z wiederholt. Leertaste spielt oder pausiert. Pfeil links und rechts wechseln das Bild, mit Umschalt verschieben sie es. N fügt ein leeres Bild an, D dupliziert, Entf löscht. Höchstens 64 Bilder, mindestens eines.",
  toolsLabel: "Werkzeuge",
  pencil: "Stift",
  eraser: "Radierer",
  fillTool: "Füllen",
  eyedropper: "Pipette",
  grid: "Raster",
  undo: "Rückgängig",
  redo: "Wiederholen",
  swap: "Farben tauschen",
  currentColor: "Aktuelle Farbe",
  secondaryColor: "Zweite Farbe",
  recent: "Zuletzt benutzt",
  paletteLabel: "Palette",
  palettes: { pico8: "PICO-8", gb: "Game Boy", nes: "NES-ähnlich", c64: "C64" },
  custom: "Eigene Farbe",
  sizeLabel: "Leinwand",
  sizeN: "{size} px",
  canvasLabel: "Zeichenfläche, {size} mal {size} Pixel",
  framesHeading: "Bilder",
  frameLabel: "Bild {n}",
  framePosition: "Bild {n} von {total}",
  addFrame: "Leeres Bild",
  duplicateFrame: "Duplizieren",
  deleteFrame: "Löschen",
  moveLeft: "Nach links",
  moveRight: "Nach rechts",
  capNotice: "Höchstens 64 Bilder.",
  minNotice: "Mindestens ein Bild bleibt.",
  previewHeading: "Vorschau",
  play: "Abspielen",
  pause: "Pause",
  fpsLabel: "Bilder pro Sekunde",
  loop: "Schleife",
  pingpong: "Pingpong",
  onion: "Zwiebelschale",
  onionNext: "Nächstes Bild",
  opacity: "Deckkraft",
  exportHeading: "Export",
  exportNote: "Das Spritesheet legt die Bilder in ein Raster. Jede Zelle hat die Größe der Leinwand, der Hintergrund bleibt transparent. 2×, 4× und 8× vergrößern Pixel für Pixel.",
  layoutStrip: "Streifen",
  layoutGrid: "Spalten",
  columnsLabel: "Spalten",
  scaleLabel: "Vergrößerung",
  scaleN: "{size}×",
  withJson: "JSON dazu",
  exportSheet: "Spritesheet-PNG",
  exportFrame: "Aktuelles Bild",
  importPng: "PNG importieren",
  importSheet: "Spritesheet importieren",
  cellLabel: "Zellengröße",
  importAvatar: "Aus Avatar-Studio",
  importFailed: "Diese Datei lässt sich nicht als Bild lesen.",
  sheetFailed: "Mit dieser Zellengröße entsteht kein Bild.",
  avatarMissing: "Im Avatar-Studio liegt kein Entwurf.",
  avatarCorrupt: "Der Avatar-Entwurf lässt sich nicht lesen.",
  avatarResized: "Der Avatar wurde auf die Leinwandgröße gerechnet.",
  reset: "Entwurf zurücksetzen",
  resetAsk:
    "Wirklich den Entwurf in diesem Browser löschen? Nur der Schlüssel consolecheat-sprite-v1. Sprache und Erscheinungsbild bleiben.",
  resetYes: "Nur den Entwurf löschen",
  resetNo: "Abbrechen",
  resetDone: "Der Entwurf ist aus diesem Browser gelöscht.",
  resetFailed: "Der Entwurf konnte nicht gelöscht werden.",
  storageFailed: "Der Browser hat den Entwurf nicht gespeichert. Bis zum Neuladen bleibt er auf der Seite.",
  swatch: "Farbe {color}",
  announcePencil: "Stift.",
  announceEraser: "Radierer.",
  announceFill: "Gefüllt.",
  announceEyedropper: "Farbe aufgenommen.",
  announceSwap: "Farben getauscht.",
  announceUndo: "Rückgängig.",
  announceRedo: "Wiederholt.",
  announceGrid: "Raster umgeschaltet.",
  announcePlay: "Vorschau läuft.",
  announcePause: "Vorschau pausiert.",
  announceFrame: "Bild {n}.",
  announceOnion: "Zwiebelschale umgeschaltet.",
  announceImport: "Bild importiert.",
  announceAvatar: "Avatar importiert.",
  deleteAll: "Entwurf zurücksetzen",
  deleteAsk:
    "Wirklich den Entwurf in diesem Browser löschen? Nur der Schlüssel consolecheat-sprite-v1. Sprache und Erscheinungsbild bleiben.",
  deleteYes: "Nur den Entwurf löschen",
  deleteNo: "Abbrechen",
  deleted: "Der Entwurf ist aus diesem Browser gelöscht.",
  deleteFailed: "Der Entwurf konnte nicht gelöscht werden.",
});

const en = pack({
  title: "Sprite animator",
  metaDescription:
    "Sprite animator: pixel frames in the browser, with a preview and a spritesheet PNG. The draft stays in this browser. Unofficial, not from Sony.",
  eyebrow: "PIXEL · FRAMES",
  lede: "A small sprite animator in the browser. Pencil, eraser, fill, and eyedropper, several frames, onion skin, and a preview. Nothing is uploaded.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "No sensitive data is stored. The draft stays in this browser and is not uploaded.",
  unofficial: "Unofficial. Not from Sony.",
  footerNote: "The file stays on this device. This page is not Sony.",
  temporary: "Temporarily here, until the animator has its own project.",
  themeDark: "Dark appearance",
  themeLight: "Light appearance",
  language: "Language",
  footerNav: "Footer",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  storageNote: "The draft stays in this browser under the key consolecheat-sprite-v1.",
  controlsHeading: "Keys",
  controls:
    "B pencil, E eraser, G fill, I eyedropper, X swaps the two colors. Ctrl+Z or Cmd+Z undoes, Ctrl+Y or Ctrl+Shift+Z redoes. Space plays or pauses. Left and right arrows change the frame, and with Shift they move it. N adds an empty frame, D duplicates, Delete removes. At most 64 frames, and at least one.",
  toolsLabel: "Tools",
  pencil: "Pencil",
  eraser: "Eraser",
  fillTool: "Fill",
  eyedropper: "Eyedropper",
  grid: "Grid",
  undo: "Undo",
  redo: "Redo",
  swap: "Swap colors",
  currentColor: "Current color",
  secondaryColor: "Secondary color",
  recent: "Recent colors",
  paletteLabel: "Palette",
  palettes: { pico8: "PICO-8", gb: "Game Boy", nes: "NES-like", c64: "C64" },
  custom: "Custom color",
  sizeLabel: "Canvas",
  sizeN: "{size} px",
  canvasLabel: "Drawing surface, {size} by {size} pixels",
  framesHeading: "Frames",
  frameLabel: "Frame {n}",
  framePosition: "Frame {n} of {total}",
  addFrame: "Empty frame",
  duplicateFrame: "Duplicate",
  deleteFrame: "Delete",
  moveLeft: "Move left",
  moveRight: "Move right",
  capNotice: "64 frames is the maximum.",
  minNotice: "At least one frame stays.",
  previewHeading: "Preview",
  play: "Play",
  pause: "Pause",
  fpsLabel: "Frames per second",
  loop: "Loop",
  pingpong: "Ping-pong",
  onion: "Onion skin",
  onionNext: "Next frame",
  opacity: "Opacity",
  exportHeading: "Export",
  exportNote:
    "The spritesheet lays the frames out in a grid. Each cell is the canvas size and the background stays transparent. 2×, 4×, and 8× scale pixel by pixel.",
  layoutStrip: "Strip",
  layoutGrid: "Columns",
  columnsLabel: "Columns",
  scaleLabel: "Scale",
  scaleN: "{size}×",
  withJson: "Also export JSON",
  exportSheet: "Spritesheet PNG",
  exportFrame: "Current frame",
  importPng: "Import PNG",
  importSheet: "Import spritesheet",
  cellLabel: "Cell size",
  importAvatar: "From avatar studio",
  importFailed: "This file cannot be read as an image.",
  sheetFailed: "That cell size does not produce a frame.",
  avatarMissing: "The avatar studio has no draft.",
  avatarCorrupt: "The avatar draft cannot be read.",
  avatarResized: "The avatar was scaled to the canvas size.",
  reset: "Reset draft",
  resetAsk: "Really delete the draft in this browser? Only the key consolecheat-sprite-v1. Language and appearance stay.",
  resetYes: "Delete only the draft",
  resetNo: "Cancel",
  resetDone: "The draft is deleted from this browser.",
  resetFailed: "The draft could not be deleted.",
  storageFailed: "The browser did not store the draft. It stays on the page until reload.",
  swatch: "Color {color}",
  announcePencil: "Pencil.",
  announceEraser: "Eraser.",
  announceFill: "Filled.",
  announceEyedropper: "Color picked.",
  announceSwap: "Colors swapped.",
  announceUndo: "Undone.",
  announceRedo: "Redone.",
  announceGrid: "Grid toggled.",
  announcePlay: "Preview playing.",
  announcePause: "Preview paused.",
  announceFrame: "Frame {n}.",
  announceOnion: "Onion skin toggled.",
  announceImport: "Image imported.",
  announceAvatar: "Avatar imported.",
  deleteAll: "Reset draft",
  deleteAsk: "Really delete the draft in this browser? Only the key consolecheat-sprite-v1. Language and appearance stay.",
  deleteYes: "Delete only the draft",
  deleteNo: "Cancel",
  deleted: "The draft is deleted from this browser.",
  deleteFailed: "The draft could not be deleted.",
});

export const copy: Record<Lang, Copy> = { de, en };

const ids = new Set<string>(languageOptions.map((item) => item.id));

export function isLang(value: string | null): value is Lang {
  return value !== null && ids.has(value);
}

export function initialLang(stored: string | null): Lang {
  return isLang(stored) ? stored : "de";
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([A-Za-z0-9]+)\}/g, (all, key: string) => {
    const value = values[key];
    return value === undefined ? all : String(value);
  });
}

export function toolLabel(text: Copy, tool: ToolId): string {
  if (tool === "pencil") return text.pencil;
  if (tool === "eraser") return text.eraser;
  if (tool === "fill") return text.fillTool;
  return text.eyedropper;
}
