import type { PaletteId } from "./palettes.ts";
import type { ToolId } from "./storage.ts";

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
  symmetry: string;
  undo: string;
  redo: string;
  flipH: string;
  flipV: string;
  clear: string;
  clearAsk: string;
  clearYes: string;
  clearNo: string;
  reset: string;
  resetAsk: string;
  resetYes: string;
  resetNo: string;
  resetDone: string;
  resetFailed: string;
  swap: string;
  currentColor: string;
  secondaryColor: string;
  recent: string;
  paletteLabel: string;
  palettes: Record<PaletteId, string>;
  custom: string;
  exportHeading: string;
  exportNote: string;
  adderNote: string;
  exportSize: string;
  importLabel: string;
  importFailed: string;
  zoomLabel: string;
  zoomFit: string;
  zoomN: string;
  canvasLabel: string;
  storageFailed: string;
  swatch: string;
  announcePencil: string;
  announceEraser: string;
  announceFill: string;
  announceEyedropper: string;
  announceSwap: string;
  announceUndo: string;
  announceRedo: string;
  announceFlipH: string;
  announceFlipV: string;
  announceClear: string;
  announceImport: string;
  announceGrid: string;
  announceSymmetry: string;
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
  title: "Pixel-Avatar-Studio",
  metaDescription:
    "Pixel-Avatar-Studio: 64×64 Pixel im Browser, mit Stift, Füllen und PNG-Export. Der Entwurf bleibt in diesem Browser. Inoffiziell, nicht von Sony.",
  eyebrow: "8-BIT · 64×64",
  lede: "Ein Editor für 64×64 Pixel, direkt im Browser. Stift, Radierer, Füllen und Pipette. Die PNG passt in den Avatar Adder. Nichts wird hochgeladen.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine sensiblen Daten werden gespeichert. Der Entwurf bleibt in diesem Browser und wird nicht hochgeladen.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Die Datei bleibt auf diesem Gerät. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend hier, bis das Studio ein eigenes Projekt ist.",
  themeDark: "Dunkles Erscheinungsbild",
  themeLight: "Helles Erscheinungsbild",
  language: "Sprache",
  footerNav: "Seitenfuß",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  storageNote: "Der Entwurf bleibt in diesem Browser unter dem Schlüssel consolecheat-avatar-v1.",
  controlsHeading: "Tasten",
  controls:
    "B Stift, E Radierer, G Füllen, I Pipette, X tauscht die beiden Farben. Strg+Z oder Cmd+Z macht rückgängig, Strg+Y oder Strg+Umschalt+Z wiederholt.",
  toolsLabel: "Werkzeuge",
  pencil: "Stift",
  eraser: "Radierer",
  fillTool: "Füllen",
  eyedropper: "Pipette",
  grid: "Raster",
  symmetry: "Symmetrie",
  undo: "Rückgängig",
  redo: "Wiederholen",
  flipH: "Horizontal spiegeln",
  flipV: "Vertikal spiegeln",
  clear: "Leeren",
  clearAsk: "Die ganze Zeichnung leeren? Das lässt sich rückgängig machen.",
  clearYes: "Leeren",
  clearNo: "Abbrechen",
  reset: "Entwurf zurücksetzen",
  resetAsk:
    "Wirklich den Entwurf in diesem Browser löschen? Nur der Schlüssel consolecheat-avatar-v1. Sprache und Erscheinungsbild bleiben.",
  resetYes: "Nur den Entwurf löschen",
  resetNo: "Abbrechen",
  resetDone: "Der Entwurf ist aus diesem Browser gelöscht.",
  resetFailed: "Der Entwurf konnte nicht gelöscht werden.",
  swap: "Farben tauschen",
  currentColor: "Aktuelle Farbe",
  secondaryColor: "Zweite Farbe",
  recent: "Zuletzt benutzt",
  paletteLabel: "Palette",
  palettes: { pico8: "PICO-8", gb: "Game Boy", nes: "NES-ähnlich", c64: "C64" },
  custom: "Eigene Farbe",
  exportHeading: "PNG exportieren",
  exportNote: "64×64 behält den transparenten Hintergrund. Größer wird Pixel für Pixel vergrößert, ohne zu weichzeichnen.",
  adderNote: "Die Datei consolecheat-avatar-64.png passt in den Avatar Adder.",
  exportSize: "PNG {size}",
  importLabel: "PNG importieren",
  importFailed: "Diese Datei lässt sich nicht als Bild lesen.",
  zoomLabel: "Zoom",
  zoomFit: "Passend",
  zoomN: "{size}×",
  canvasLabel: "Zeichenfläche, 64 mal 64 Pixel",
  storageFailed: "Der Browser hat den Entwurf nicht gespeichert. Bis zum Neuladen bleibt er auf der Seite.",
  swatch: "Farbe {color}",
  announcePencil: "Stift.",
  announceEraser: "Radierer.",
  announceFill: "Gefüllt.",
  announceEyedropper: "Farbe aufgenommen.",
  announceSwap: "Farben getauscht.",
  announceUndo: "Rückgängig.",
  announceRedo: "Wiederholt.",
  announceFlipH: "Horizontal gespiegelt.",
  announceFlipV: "Vertikal gespiegelt.",
  announceClear: "Zeichenfläche geleert.",
  announceImport: "Bild importiert.",
  announceGrid: "Raster umgeschaltet.",
  announceSymmetry: "Symmetrie umgeschaltet.",
  deleteAll: "Entwurf zurücksetzen",
  deleteAsk:
    "Wirklich den Entwurf in diesem Browser löschen? Nur der Schlüssel consolecheat-avatar-v1. Sprache und Erscheinungsbild bleiben.",
  deleteYes: "Nur den Entwurf löschen",
  deleteNo: "Abbrechen",
  deleted: "Der Entwurf ist aus diesem Browser gelöscht.",
  deleteFailed: "Der Entwurf konnte nicht gelöscht werden.",
});

const en = pack({
  title: "Pixel avatar studio",
  metaDescription:
    "Pixel avatar studio: 64×64 pixels in the browser, with pencil, fill, and PNG export. The draft stays in this browser. Unofficial, not from Sony.",
  eyebrow: "8-BIT · 64×64",
  lede: "A 64×64 pixel editor in the browser. Pencil, eraser, fill, and eyedropper. The PNG fits the Avatar Adder. Nothing is uploaded.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "No sensitive data is stored. The draft stays in this browser and is not uploaded.",
  unofficial: "Unofficial. Not from Sony.",
  footerNote: "The file stays on this device. This page is not Sony.",
  temporary: "Temporarily here, until the studio has its own project.",
  themeDark: "Dark appearance",
  themeLight: "Light appearance",
  language: "Language",
  footerNav: "Footer",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  storageNote: "The draft stays in this browser under the key consolecheat-avatar-v1.",
  controlsHeading: "Keys",
  controls:
    "B pencil, E eraser, G fill, I eyedropper, X swaps the two colors. Ctrl+Z or Cmd+Z undoes, Ctrl+Y or Ctrl+Shift+Z redoes.",
  toolsLabel: "Tools",
  pencil: "Pencil",
  eraser: "Eraser",
  fillTool: "Fill",
  eyedropper: "Eyedropper",
  grid: "Grid",
  symmetry: "Symmetry",
  undo: "Undo",
  redo: "Redo",
  flipH: "Flip horizontal",
  flipV: "Flip vertical",
  clear: "Clear",
  clearAsk: "Clear the whole drawing? You can undo it.",
  clearYes: "Clear",
  clearNo: "Cancel",
  reset: "Reset draft",
  resetAsk: "Really delete the draft in this browser? Only the key consolecheat-avatar-v1. Language and appearance stay.",
  resetYes: "Delete only the draft",
  resetNo: "Cancel",
  resetDone: "The draft is deleted from this browser.",
  resetFailed: "The draft could not be deleted.",
  swap: "Swap colors",
  currentColor: "Current color",
  secondaryColor: "Secondary color",
  recent: "Recent colors",
  paletteLabel: "Palette",
  palettes: { pico8: "PICO-8", gb: "Game Boy", nes: "NES-like", c64: "C64" },
  custom: "Custom color",
  exportHeading: "Export PNG",
  exportNote: "64×64 keeps the transparent background. Larger sizes scale pixel by pixel, with no smoothing.",
  adderNote: "The file consolecheat-avatar-64.png fits the Avatar Adder.",
  exportSize: "PNG {size}",
  importLabel: "Import PNG",
  importFailed: "This file cannot be read as an image.",
  zoomLabel: "Zoom",
  zoomFit: "Fit",
  zoomN: "{size}×",
  canvasLabel: "Drawing surface, 64 by 64 pixels",
  storageFailed: "The browser did not store the draft. It stays on the page until reload.",
  swatch: "Color {color}",
  announcePencil: "Pencil.",
  announceEraser: "Eraser.",
  announceFill: "Filled.",
  announceEyedropper: "Color picked.",
  announceSwap: "Colors swapped.",
  announceUndo: "Undone.",
  announceRedo: "Redone.",
  announceFlipH: "Flipped horizontally.",
  announceFlipV: "Flipped vertically.",
  announceClear: "Canvas cleared.",
  announceImport: "Image imported.",
  announceGrid: "Grid toggled.",
  announceSymmetry: "Symmetry toggled.",
  deleteAll: "Reset draft",
  deleteAsk: "Really delete the draft in this browser? Only the key consolecheat-avatar-v1. Language and appearance stay.",
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
