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
  themeDark: string;
  themeLight: string;
  language: string;
  section: string;
  filterAll: string;
  filterLabel: string;
  addTo: string;
  searchLabel: string;
  searchPlaceholder: string;
  resultsLabel: string;
  noResults: string;
  catalogLoading: string;
  catalogError: string;
  added: string;
  duplicate: string;
  elsewhere: string;
  moved: string;
  removed: string;
  noteSaved: string;
  noteTooLong: string;
  noteInvalid: string;
  invalidGame: string;
  moveHere: string;
  noteLabel: string;
  notePlaceholder: string;
  finder: string;
  archive: string;
  remove: string;
  moveLabel: string;
  keyboardHint: string;
  emptyList: string;
  exportButton: string;
  importButton: string;
  importLabel: string;
  importTitle: string;
  importBody: string;
  importMerge: string;
  importReplace: string;
  importCancel: string;
  importCancelled: string;
  importMerged: string;
  importReplaced: string;
  importBroken: string;
  importSchema: string;
  importVersion: string;
  importForeign: string;
  importOversized: string;
  importInvalid: string;
  storageFull: string;
  storageDisabled: string;
  storageVersion: string;
  storageCorrupt: string;
  loadingLists: string;
  deleteAll: string;
  deleteAsk: string;
  deleteYes: string;
  deleteNo: string;
  deleted: string;
  deleteFailed: string;
  regionEU: string;
  regionUS: string;
  regionJP: string;
  regionAsia: string;
  regionKR: string;
  regionINT: string;
  regionUnknown: string;
  listBacklog: string;
  listPlaying: string;
  listCompleted: string;
  listWishlist: string;
  hintBacklog: string;
  hintPlaying: string;
  hintCompleted: string;
  hintWishlist: string;
  moreIds: string;
  idsLabel: string;
  chars: string;
  entryLabel: string;
  screenTest: string;
  footerNav: string;
  toolsHeading: string;
};

const shared = { brand: "consolecheat", title: "Spiele-Merkliste" } as const;

function pack(text: Omit<Copy, "brand" | "title">): Copy {
  return { ...shared, ...text };
}

const de = pack({
  metaDescription:
    "Backlog, aktuell, durchgespielt und Wunschliste für PlayStation-Spiele. Bleibt in diesem Browser. Inoffiziell, nicht von Sony.",
  eyebrow: "Backlog · Wunschliste",
  lede: "Spiele merken, zwischen den Listen schieben und eine kurze Notiz dazuschreiben. Gespeichert wird nur in diesem Browser.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Die Listen bleiben in diesem Browser. Nichts wird gesendet.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  section: "Listen",
  filterAll: "Alle",
  filterLabel: "Listen filtern",
  addTo: "Hinzufügen zu",
  searchLabel: "Spiel suchen",
  searchPlaceholder: "Name oder Title-ID",
  resultsLabel: "Suchtreffer",
  noResults: "Kein Treffer.",
  catalogLoading: "Katalog wird geladen…",
  catalogError: "Der Titelkatalog konnte nicht geladen werden. Gespeicherte Listen bleiben nutzbar.",
  added: "{name} liegt jetzt unter „{list}“.",
  duplicate: "{name} steht schon in „{list}“.",
  elsewhere: "{name} steht schon unter „{list}“.",
  moved: "{name} ist jetzt unter „{list}“.",
  removed: "{name} ist entfernt.",
  noteSaved: "Notiz gespeichert.",
  noteTooLong: "Die Notiz ist zu lang (höchstens 280 Zeichen).",
  noteInvalid: "Die Notiz enthält Zeichen, die hier nicht erlaubt sind.",
  invalidGame: "Dieser Treffer hat keine verwendbare Title-ID.",
  moveHere: "Hierher verschieben",
  noteLabel: "Notiz",
  notePlaceholder: "Kurze Notiz",
  finder: "Title-ID-Finder",
  archive: "PS-Plus-Archiv",
  remove: "Entfernen",
  moveLabel: "Verschieben nach",
  keyboardHint: "Eintrag fokussieren, dann 1 bis 4 verschieben, Entf entfernen, Pfeile zum nächsten Eintrag.",
  emptyList: "Noch nichts in dieser Liste.",
  exportButton: "JSON exportieren",
  importButton: "JSON importieren",
  importLabel: "Merkliste aus einer JSON-Datei",
  importTitle: "Import bestätigen",
  importBody:
    "Die Datei ist gültig. Vorhandene Listen bleiben unverändert, bis Zusammenführen oder Ersetzen gewählt wird. Zusammenführen behält den bisherigen Ort eines Spiels und füllt nur eine leere Notiz. Ersetzen tauscht die Listen komplett aus.",
  importMerge: "Zusammenführen",
  importReplace: "Ersetzen",
  importCancel: "Abbrechen",
  importCancelled: "Import abgebrochen. Es wurde nichts geändert.",
  importMerged: "Import zusammengeführt.",
  importReplaced: "Listen ersetzt.",
  importBroken: "Die Datei ist kein gültiges JSON. Es wurde nichts geändert.",
  importSchema: "Das Schema passt nicht zu dieser Merkliste. Es wurde nichts geändert.",
  importVersion: "Die Version dieser Datei wird nicht unterstützt. Es wurde nichts geändert.",
  importForeign: "Das ist keine Merkliste aus diesem Werkzeug. Es wurde nichts geändert.",
  importOversized: "Die Datei ist zu groß (höchstens 256 KB). Es wurde nichts geändert.",
  importInvalid:
    "Mindestens ein Eintrag ist ungültig. Erlaubt sind nur Title-IDs, der Name und eine kurze Notiz, ohne Doppelte in derselben Liste. Es wurde nichts geändert.",
  storageFull: "Der Speicher dieses Browsers ist voll. Die Änderung bleibt nur bis zum Neuladen.",
  storageDisabled: "Der lokale Speicher ist aus. Listen bleiben nur bis zum Neuladen.",
  storageVersion: "Gespeicherte Daten haben eine andere Version und wurden nicht überschrieben.",
  storageCorrupt: "Gespeicherte Daten sind unlesbar und wurden nicht überschrieben.",
  loadingLists: "Listen werden geladen…",
  deleteAll: "Alle Daten in diesem Browser löschen",
  deleteAsk: "Wirklich alle lokalen Daten dieser Seite löschen? Listen, Notizen, Sprache und Erscheinungsbild.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Alle lokalen Daten dieser Seite sind gelöscht.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
  regionEU: "Europa",
  regionUS: "USA",
  regionJP: "Japan",
  regionAsia: "Asien",
  regionKR: "Korea",
  regionINT: "International",
  regionUnknown: "Unbekannt",
  listBacklog: "Backlog",
  listPlaying: "Spiele ich gerade",
  listCompleted: "Durch",
  listWishlist: "Wunschliste",
  hintBacklog: "Spiele, die noch anstehen.",
  hintPlaying: "Was gerade läuft.",
  hintCompleted: "Durchgespielt.",
  hintWishlist: "Spiele zum Merken.",
  moreIds: "Weitere Title-IDs",
  idsLabel: "Title-IDs",
  chars: "{n}/280",
  entryLabel: "{name}, {list}",
  screenTest: "Bildschirm-Test",
  footerNav: "Seiten",
  toolsHeading: "Weitere Werkzeuge",
});

const en = pack({
  metaDescription:
    "Backlog, playing, completed, and wishlist for PlayStation games. Stays in this browser. Unofficial, not Sony.",
  eyebrow: "Backlog · wishlist",
  lede: "Keep games, move them between lists, and add a short note. Stored only in this browser.",
  freeClaim: "Completely free. Nothing on this site costs money.",
  privacyClaim: "The lists stay in this browser. Nothing is sent.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid here. This site is not Sony.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  section: "Lists",
  filterAll: "All",
  filterLabel: "Filter lists",
  addTo: "Add to",
  searchLabel: "Search for a game",
  searchPlaceholder: "Name or title ID",
  resultsLabel: "Search results",
  noResults: "No matches.",
  catalogLoading: "Loading the catalog…",
  catalogError: "The title catalog could not be loaded. Saved lists still work.",
  added: "{name} is now in “{list}”.",
  duplicate: "{name} is already in “{list}”.",
  elsewhere: "{name} is already in “{list}”.",
  moved: "{name} is now in “{list}”.",
  removed: "{name} was removed.",
  noteSaved: "Note saved.",
  noteTooLong: "The note is too long (280 characters at most).",
  noteInvalid: "The note contains characters that are not allowed here.",
  invalidGame: "This match has no usable title ID.",
  moveHere: "Move here",
  noteLabel: "Note",
  notePlaceholder: "Short note",
  finder: "Title-ID-Finder",
  archive: "PS Plus archive",
  remove: "Remove",
  moveLabel: "Move to",
  keyboardHint: "Focus an entry, then 1–4 to move, Delete to remove, arrows for the next entry.",
  emptyList: "Nothing in this list yet.",
  exportButton: "Export JSON",
  importButton: "Import JSON",
  importLabel: "Backlog file (JSON)",
  importTitle: "Confirm import",
  importBody:
    "The file is valid. Existing lists stay as they are until you merge or replace. Merge keeps a game where it already is and fills a note only when the current one is empty. Replace swaps the lists completely.",
  importMerge: "Merge",
  importReplace: "Replace",
  importCancel: "Cancel",
  importCancelled: "Import cancelled. Nothing was changed.",
  importMerged: "Import merged.",
  importReplaced: "Lists replaced.",
  importBroken: "The file is not valid JSON. Nothing was changed.",
  importSchema: "The schema does not match this backlog. Nothing was changed.",
  importVersion: "This file version is not supported. Nothing was changed.",
  importForeign: "This is not a backlog file from this tool. Nothing was changed.",
  importOversized: "The file is too large (256 KB at most). Nothing was changed.",
  importInvalid:
    "At least one entry is invalid. Only title IDs, the name, and a short note are allowed, with no duplicates in the same list. Nothing was changed.",
  storageFull: "This browser’s storage is full. The change lasts only until reload.",
  storageDisabled: "Local storage is off. Lists last only until reload.",
  storageVersion: "Stored data has another version and was not overwritten.",
  storageCorrupt: "Stored data is unreadable and was not overwritten.",
  loadingLists: "Loading lists…",
  deleteAll: "Delete all data in this browser",
  deleteAsk: "Really delete all local data for this site? Lists, notes, language, and appearance.",
  deleteYes: "Delete permanently",
  deleteNo: "Cancel",
  deleted: "All local data for this site has been deleted.",
  deleteFailed: "Could not delete. The browser blocked storage.",
  regionEU: "Europe",
  regionUS: "USA",
  regionJP: "Japan",
  regionAsia: "Asia",
  regionKR: "Korea",
  regionINT: "International",
  regionUnknown: "Unknown",
  listBacklog: "Backlog",
  listPlaying: "Playing",
  listCompleted: "Completed",
  listWishlist: "Wishlist",
  hintBacklog: "Games still waiting.",
  hintPlaying: "What is in progress.",
  hintCompleted: "Finished.",
  hintWishlist: "Games to remember.",
  moreIds: "More title IDs",
  idsLabel: "Title IDs",
  chars: "{n}/280",
  entryLabel: "{name}, {list}",
  screenTest: "Screen test",
  footerNav: "Pages",
  toolsHeading: "Other tools",
});

export const copy: Record<Lang, Copy> = { de, en };

const ids = new Set<string>(languageOptions.map((item) => item.id));

export function isLang(value: string | null): value is Lang {
  return value !== null && ids.has(value);
}

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
