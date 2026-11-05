import type { Certainty, ConsoleFilter, ItemId, ItemText, SectionId } from "./checklist.ts";

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
  introFat: string;
  introLarge: string;
  introNoScan: string;
  storageNote: string;
  consoleLabel: string;
  consoleHeading: string;
  consoles: Record<ConsoleFilter, string>;
  progress: string;
  checklistHeading: string;
  verifyHint: string;
  sections: Record<SectionId, string>;
  sectionIntro: Record<SectionId, string>;
  certainty: Record<Certainty, string>;
  pathLabel: string;
  items: Record<ItemId, ItemText>;
  exportHeading: string;
  downloadText: string;
  downloadMarkdown: string;
  copyText: string;
  copyMarkdown: string;
  copied: string;
  copyFailed: string;
  reset: string;
  resetDone: string;
  previewLabel: string;
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

const deItems: Record<ItemId, ItemText> = {
  "format-fat": {
    title: "FAT32 oder exFAT",
    body: "Der Stick ist FAT32 oder exFAT. Die Sony-Hilfe für Medien und für das Systemupdate nennt diese beiden. NTFS steht dort nicht. Das ist keine Zertifizierung des Sticks.",
  },
  "format-large": {
    title: "Große Dateien und exFAT",
    body: "FAT32 fasst etwa 4 GB pro Datei. Eine größere Update-Datei, ein Clip oder eine Sicherung braucht ein Format, das das zulässt. exFAT ist das andere Format, das die Sony-Hilfe nennt. Welche Aufgabe welches Format will, auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "format-not-extended": {
    title: "Kein erweiterter Speicher",
    body: "Dieser Stick ist kein Laufwerk, das die Konsole als erweiterten Speicher formatiert hat. So ein Laufwerk zeigt am Rechner keine normalen Ordner und ist nicht das Laufwerk für Medien oder eine Update-Datei. Auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "media-music": {
    title: "Ordner Music",
    body: "Musik liegt in einem Ordner Music im Stammverzeichnis. Die Sony-Hilfe schreibt Music. Die Media-Player-Seite der PS4 schreibt auch MUSIC. Findet die Konsole die Dateien nicht, die Großschreibung auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "media-video": {
    title: "Videos in einem Ordner",
    body: "Videos liegen in einem Ordner im Stammverzeichnis, nicht lose auf dem Stick. Die aktuelle Sony-Hilfe verlangt keinen festen Namen wie VIDEO. Einen selbst gewählten Namen auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "media-photo": {
    title: "Fotos in einem Ordner",
    body: "Fotos und Bilder liegen in einem Ordner. Die PS4-Media-Player-Hilfe sagt, Bilddateien müssen in einem Ordner liegen. Einen Pflichtnamen wie PICTURE oder Photos nennt die aktuelle Sony-Hilfe nicht. Auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "media-av-contents": {
    title: "AV_CONTENTS nicht anlegen",
    body: "AV_CONTENTS nicht auf den Stick legen, um Medien abzuspielen. In öffentlichen Beschreibungen ist das ein interner Ordner der Konsole für Aufnahmen, kein USB-Medienordner. Auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "update-ps4": {
    title: "PS4-Update-Datei",
    body: "Systemupdate der PS4: Ordner PS4, darin Ordner UPDATE, darin die Datei PS4UPDATE.PUP. Großbuchstaben. FAT32 oder exFAT. Nur die offizielle Datei von Sony. Die Neuinstallation ist eine andere Datei und löscht die Konsole. Welche Datei du brauchst, in der Sony-Hilfe prüfen.",
  },
  "update-ps5": {
    title: "PS5-Update-Datei",
    body: "Systemupdate der PS5: Ordner PS5, darin Ordner UPDATE, darin die Datei PS5UPDATE.PUP. Großbuchstaben. FAT32 oder exFAT. Nur die offizielle Datei von Sony. Die Neuinstallation ist eine andere Datei und löscht die Konsole. Welche Datei du brauchst, in der Sony-Hilfe prüfen.",
  },
  "captures-ps4": {
    title: "PS4-Aufnahmen, die Konsole schreibt",
    body: "Aufnahmen kopiert die PS4 selbst auf den Stick, aus der Aufnahmegalerie. Häufig genannt werden SHARE/Screenshots und SHARE/Video Clips. Diese Ordner nicht von Hand bauen und einen Import erwarten. Auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "captures-ps5": {
    title: "PS5-Aufnahmen, die Konsole schreibt",
    body: "Aufnahmen kopiert die PS5 aus der Mediathek mit Kopieren auf USB-Laufwerk. Ordnernamen nennt die Sony-Hilfe dort nicht. Berichte nennen PS5/CREATE/Screenshots und PS5/CREATE/Video Clips. Nicht von Hand nachbauen. Zurück auf die Konsole beschreibt die Hilfe das nicht. Auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "extended-ps4": {
    title: "PS4, erweiterter Speicher",
    body: "Erweiterter Speicher der PS4 ist ein Laufwerk, das die Konsole formatiert. Das löscht den Inhalt. Die veröffentlichte Sony-Hilfe beschreibt dafür eine USB-3.0-Festplatte von etwa 250 GB bis 8 TB, und keinen USB-Stick. Speicherstände gehören nicht auf dieses Laufwerk. Die aktuellen Grenzen auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "extended-ps5": {
    title: "PS5, erweiterter USB-Speicher",
    body: "Erweiterter USB-Speicher der PS5 ist ein Laufwerk, das die Konsole formatiert. Das löscht den Inhalt. Die Sony-Hilfe nennt SuperSpeed USB mit 5 Gbit/s oder schneller, etwa 250 GB bis 8 TB, keinen Hub und nur ein solches Laufwerk gleichzeitig. PS4-Spiele lassen sich davon spielen. PS5-Spiele lassen sich dort lagern, aber nicht direkt davon spielen: zurück auf den Konsolenspeicher oder eine M.2-SSD. Die aktuellen Grenzen in der Sony-Hilfe prüfen.",
  },
  "extended-separate": {
    title: "Medien und Spielespeicher trennen",
    body: "Medien, eine Update-Datei und eine Sicherung gehören auf einen normalen FAT32- oder exFAT-Stick. Erweiterter Speicher ist ein anderes Laufwerk. Die Konsole nutzt nicht einen Stick für beides. Auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "backup-ps4": {
    title: "PS4-Sicherung, an der Konsole starten",
    body: "Eine PS4-Sicherung startet an der Konsole, unter Sichern und Wiederherstellen. Die Konsole schreibt die Dateien. Ein Ordner von Hand ist keine Sicherung. FAT32 oder exFAT, nicht der erweiterte Speicher. Wiederherstellen löscht, was auf der Konsole liegt. Auf der Konsole und in der Sony-Hilfe prüfen.",
  },
  "backup-ps5": {
    title: "PS5-Sicherung, an der Konsole starten",
    body: "PS5-Sicherung: Einstellungen, System, Systemsoftware, Sichern und Wiederherstellen, PS5 sichern. FAT32 oder exFAT. Ein Laufwerk, das als erweiterter Speicher formatiert ist, nimmt die Sicherung nicht an. Spiele auf erweitertem Speicher oder einer M.2-SSD stecken nicht in der Sicherung. Trophäen auch nicht. Wiederherstellen löscht die Konsole. Die Dateien schreibt die Konsole. Ordner nicht von Hand nachbauen. Details in der Sony-Hilfe prüfen.",
  },
  "saves-copy": {
    title: "Speicherstände nur über die Konsole",
    body: "Speicherstände kopiert die Konsole. Auf der PS4 ist das die Speicherverwaltung. Auf der PS5 beschreibt die Sony-Hilfe das Kopieren von PS4-Spielständen auf einen USB-Stick. PS5-Spielstände gehen in den Cloud-Speicher, nicht auf den Stick. PS4/SAVEDATA nicht von Hand anlegen. Auf der Konsole und in der Sony-Hilfe prüfen.",
  },
};

const enItems: Record<ItemId, ItemText> = {
  "format-fat": {
    title: "FAT32 or exFAT",
    body: "The stick uses FAT32 or exFAT. Sony support for media and for the system update names those two. NTFS is not named there. This is not a certification of the stick.",
  },
  "format-large": {
    title: "Large files and exFAT",
    body: "FAT32 holds about 4 GB per file. A larger update file, clip, or backup needs a format that allows that. exFAT is the other format Sony support names. Verify on your console / official Sony support which task wants which format.",
  },
  "format-not-extended": {
    title: "Not extended storage",
    body: "This stick is not a drive the console formatted as extended storage. That kind of drive does not show ordinary folders on a computer, and it is not the drive for media or an update file. Verify on your console / official Sony support.",
  },
  "media-music": {
    title: "Music folder",
    body: "Music files sit in a folder named Music at the root of the stick. Sony support writes Music. The PS4 Media Player page also writes MUSIC. If the console does not list the files, check the capital letters on your console / official Sony support.",
  },
  "media-video": {
    title: "Videos inside a folder",
    body: "Video files sit in a folder at the root, not loose on the stick. Current Sony support does not require a fixed name such as VIDEO. Verify a name you chose on your console / official Sony support.",
  },
  "media-photo": {
    title: "Photos inside a folder",
    body: "Photos and images sit in a folder. PS4 Media Player support says image files must be inside a folder. Current Sony support does not name a required folder such as PICTURE or Photos. Verify on your console / official Sony support.",
  },
  "media-av-contents": {
    title: "Do not create AV_CONTENTS",
    body: "Do not create AV_CONTENTS on the stick for playback. Public notes use that name for an internal console folder of captures, not as a USB media folder. Verify on your console / official Sony support.",
  },
  "update-ps4": {
    title: "PS4 update file",
    body: "PS4 system update: a folder PS4, a folder UPDATE inside it, and the file PS4UPDATE.PUP. Use uppercase letters. FAT32 or exFAT. Only the official file from Sony. The reinstall file is a different download and erases the console. Verify which file you need in Sony support.",
  },
  "update-ps5": {
    title: "PS5 update file",
    body: "PS5 system update: a folder PS5, a folder UPDATE inside it, and the file PS5UPDATE.PUP. Use uppercase letters. FAT32 or exFAT. Only the official file from Sony. The reinstall file is a different download and erases the console. Verify which file you need in Sony support.",
  },
  "captures-ps4": {
    title: "PS4 captures, written by the console",
    body: "The PS4 copies screenshots and clips to the stick from its capture gallery. Often reported folders are SHARE/Screenshots and SHARE/Video Clips. Do not build those folders by hand and expect them to import. Verify on your console / official Sony support.",
  },
  "captures-ps5": {
    title: "PS5 captures, written by the console",
    body: "The PS5 copies captures from Media Gallery with Copy to USB Drive. Sony support does not name the folders there. Reports mention PS5/CREATE/Screenshots and PS5/CREATE/Video Clips. Do not rebuild them by hand. Support does not describe copying them back onto the console. Verify on your console / official Sony support.",
  },
  "extended-ps4": {
    title: "PS4 extended storage",
    body: "PS4 extended storage is a drive the console formats, and formatting erases it. Published Sony help describes a USB 3.0 hard drive of about 250 GB to 8 TB, and not a USB flash stick, as extended storage. Save data does not belong on that drive. Verify the current limits on your console / official Sony support.",
  },
  "extended-ps5": {
    title: "PS5 USB extended storage",
    body: "PS5 USB extended storage is a drive the console formats, and formatting erases it. Sony support names SuperSpeed USB at 5 Gbps or faster, about 250 GB to 8 TB, no hub, and only one such drive at a time. PS4 games can be played from it. PS5 games can be stored there but not played directly from it: copy them back to console storage or an M.2 SSD. Verify the current limits in Sony support.",
  },
  "extended-separate": {
    title: "Keep media and game storage apart",
    body: "Media, an update file, and a backup belong on an ordinary FAT32 or exFAT stick. Extended storage is a different drive. The console does not use one stick for both jobs. Verify on your console / official Sony support.",
  },
  "backup-ps4": {
    title: "PS4 backup, started on the console",
    body: "A PS4 backup starts on the console, under Back Up and Restore. The console writes the files. A folder you create by hand is not a backup. Use FAT32 or exFAT, not extended storage. Restore erases what is on the console. Verify on your console / official Sony support.",
  },
  "backup-ps5": {
    title: "PS5 backup, started on the console",
    body: "PS5 backup: Settings, System, System Software, Back Up and Restore, Back Up Your PS5. FAT32 or exFAT. A drive formatted as extended storage will not take the backup. Games on extended storage or an M.2 SSD are not inside the backup. Trophies are not either. Restore erases the console. The console writes the files. Do not rebuild the folders by hand. Verify details in Sony support.",
  },
  "saves-copy": {
    title: "Saves only through the console",
    body: "The console copies save data. On PS4 that is saved-data management. On PS5, Sony support describes copying PS4 saves to a USB drive, and PS5 saves go to cloud storage rather than the stick. Do not create PS4/SAVEDATA by hand. Verify on your console / official Sony support.",
  },
};

const de = pack({
  title: "USB-Stick-Checkliste",
  metaDescription:
    "Checkliste für Ordner und Dateien auf einem USB-Stick für PS4 und PS5. Alles lokal, ohne den Stick zu lesen. Inoffiziell, nicht von Sony.",
  eyebrow: "USB · PS4 · PS5",
  lede: "Checkliste für Ordner und Dateien, die ein USB-Stick für die PS4 und die PS5 typischerweise braucht. Du hakst selbst ab. Der Stick wird nicht gelesen.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Haken bleiben nur in diesem Browser. Es wird nichts hochgeladen.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Bezahlt wird nirgends. Diese Seite ist nicht Sony.",
  temporary: "Vorübergehend bei der Spiele-Merkliste, bis dieses Werkzeug ein eigenes Projekt ist.",
  themeDark: "Dunkel",
  themeLight: "Hell",
  language: "Sprache",
  footerNav: "Seiten",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  introFat:
    "Für Medien und für ein Systemupdate nennt die Sony-Hilfe FAT32 und exFAT. Das ist eine Orientierung, keine Zertifizierung des Sticks und kein Versprechen, dass jedes Gerät erkannt wird.",
  introLarge:
    "FAT32 begrenzt eine einzelne Datei auf etwa 4 GB. Größere Dateien brauchen ein Format, das das kann. exFAT ist das andere Format, das die Sony-Hilfe nennt. Was deine Konsole für die einzelne Aufgabe will, dort und in der Sony-Hilfe prüfen.",
  introNoScan:
    "Diese Seite liest den Stick nicht. Es gibt keinen Datei-Dialog, keine USB-Geräteschnittstelle und kein Abtasten des Laufwerks. Der Text für den Export entsteht hier aus den Haken.",
  storageNote:
    "Die Haken und die gewählte Konsole bleiben in diesem Browser unter dem Schlüssel consolecheat-usb-checks-v1. Haken leeren schreibt eine leere Liste. Den Schlüssel entfernen steht im Datenschutz.",
  consoleLabel: "Konsole",
  consoleHeading: "Konsole",
  consoles: { ps4: "PS4", ps5: "PS5", both: "Beide" },
  progress: "{done} von {total}",
  checklistHeading: "Checkliste",
  verifyHint:
    "Punkte mit Prüfen sind nicht als fester Pfad aus der Sony-Hilfe abgeschrieben. Die Konsole oder die Sony-Hilfe entscheidet.",
  sections: {
    format: "Format",
    media: "Medien",
    update: "Systemupdate",
    captures: "Aufnahmen",
    extended: "Erweiterter Speicher",
    backup: "Sicherung und Speicherstände",
  },
  sectionIntro: {
    format: "FAT32 und exFAT, grob. Keine Zertifizierung des Sticks.",
    media: "Was die Sony-Hilfe für Musik, Video und Fotos nennt. Alles andere ist ein Prüfpunkt.",
    update: "Der Pfad aus der Sony-Hilfe. Nur die offizielle Datei.",
    captures: "Die Konsole schreibt diese Ordner. Nicht von Hand nachbauen.",
    extended: "Ein anderes Laufwerk als dieser Stick. Die Konsole formatiert es und löscht den Inhalt. Hier legst du keine Ordner an.",
    backup: "Die Konsole schreibt die Sicherung. Ein Ordner von Hand ist keine Sicherung.",
  },
  certainty: { documented: "Sony-Hilfe", verify: "Prüfen" },
  pathLabel: "Pfad",
  items: deItems,
  exportHeading: "Export",
  downloadText: "Text herunterladen",
  downloadMarkdown: "Markdown herunterladen",
  copyText: "Text kopieren",
  copyMarkdown: "Markdown kopieren",
  copied: "In die Zwischenablage kopiert.",
  copyFailed: "Kopieren ist hier nicht verfügbar. Der Text steht in der Vorschau.",
  reset: "Haken leeren",
  resetDone: "Die Haken sind leer.",
  previewLabel: "Vorschau",
  deleteAll: "Alle Daten in diesem Browser löschen",
  deleteAsk:
    "Wirklich die lokalen Daten dieser Seite löschen? Die Haken (consolecheat-usb-checks-v1), die Sprache und das Erscheinungsbild. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteYes: "Endgültig löschen",
  deleteNo: "Abbrechen",
  deleted: "Die lokalen Daten dieser Seite sind gelöscht. Die Merkliste und das Testbild des Bildschirm-Tests bleiben.",
  deleteFailed: "Löschen ist fehlgeschlagen. Der Browser hat den Speicher blockiert.",
});

const en = pack({
  title: "USB stick checklist",
  metaDescription:
    "Checklist for the folders and files a PS4 and PS5 USB stick typically needs. Entirely local. The stick is not read. Unofficial, not Sony.",
  eyebrow: "USB · PS4 · PS5",
  lede: "A checklist for the folders and files a USB stick typically needs for a PS4 and a PS5. You tick the items yourself. The stick is not read.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "Checks stay in this browser only. Nothing is uploaded.",
  unofficial: "Unofficial. Not Sony.",
  footerNote: "Nothing is paid for here. This page is not Sony.",
  temporary: "Temporarily next to the game backlog, until this tool is its own project.",
  themeDark: "Dark",
  themeLight: "Light",
  language: "Language",
  footerNav: "Pages",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  introFat:
    "For media and for a system update, Sony support names FAT32 and exFAT. That is a guide, not a certification of the stick, and not a promise that every device is recognized.",
  introLarge:
    "FAT32 limits a single file to about 4 GB. Larger files need a format that allows them. exFAT is the other format Sony support names. What your console wants for one task: verify on the console and in Sony support.",
  introNoScan:
    "This page does not read the stick. There is no file dialog, no USB device API, and no scan of the drive. The export text is built here from the checks.",
  storageNote:
    "Checks and the chosen console stay in this browser under the key consolecheat-usb-checks-v1. Clear checks writes an empty list. Removing the key is described in the privacy note.",
  consoleLabel: "Console",
  consoleHeading: "Console",
  consoles: { ps4: "PS4", ps5: "PS5", both: "Both" },
  progress: "{done} of {total}",
  checklistHeading: "Checklist",
  verifyHint: "Items marked Verify are not copied as a fixed path from Sony support. The console or Sony support decides.",
  sections: {
    format: "Format",
    media: "Media",
    update: "System update",
    captures: "Captures",
    extended: "Extended storage",
    backup: "Backup and saves",
  },
  sectionIntro: {
    format: "FAT32 and exFAT, in outline. Not a certification of the stick.",
    media: "What Sony support names for music, video, and photos. Anything else is a point to verify.",
    update: "The path from Sony support. Only the official file.",
    captures: "The console writes these folders. Do not rebuild them by hand.",
    extended:
      "A different drive from this stick. The console formats it and erases the contents. You do not create folders here.",
    backup: "The console writes the backup. A folder you create by hand is not a backup.",
  },
  certainty: { documented: "Sony support", verify: "Verify" },
  pathLabel: "Path",
  items: enItems,
  exportHeading: "Export",
  downloadText: "Download text",
  downloadMarkdown: "Download Markdown",
  copyText: "Copy text",
  copyMarkdown: "Copy Markdown",
  copied: "Copied to the clipboard.",
  copyFailed: "Copy is not available here. The text is in the preview.",
  reset: "Clear checks",
  resetDone: "Checks are cleared.",
  previewLabel: "Preview",
  deleteAll: "Delete all data in this browser",
  deleteAsk:
    "Really delete this page’s local data? The checks (consolecheat-usb-checks-v1), the language, and the appearance. The backlog and the screen-test pattern stay.",
  deleteYes: "Delete permanently",
  deleteNo: "Cancel",
  deleted: "This page’s local data has been deleted. The backlog and the screen-test pattern stay.",
  deleteFailed: "Could not delete. The browser blocked storage.",
});

export const copy: Record<Lang, Copy> = { de, en };

const ids = new Set<string>(languageOptions.map((item) => item.id));

export function isLang(value: string | null): value is Lang {
  return value !== null && ids.has(value);
}

export function initialLang(stored: string | null): Lang {
  return isLang(stored) ? stored : "de";
}
