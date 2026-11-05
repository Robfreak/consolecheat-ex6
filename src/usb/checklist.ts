// Folder names a person can check off for a PS4 or PS5 USB stick.
// Paths marked "documented" are the ones Sony's public support pages name.
// Paths marked "verify" are widely described, or are names this page refuses
// to treat as a USB folder. The console or Sony support decides those.
// This module does not read a drive.

export const consoleFilters = ["ps4", "ps5", "both"] as const;
export type ConsoleFilter = (typeof consoleFilters)[number];
export type ConsoleId = "ps4" | "ps5";

export const sectionIds = ["format", "media", "update", "captures", "extended", "backup"] as const;
export type SectionId = (typeof sectionIds)[number];

export const certainties = ["documented", "verify"] as const;
export type Certainty = (typeof certainties)[number];

export type ChecklistItem = {
  id: string;
  consoles: readonly ConsoleId[];
  section: SectionId;
  certainty: Certainty;
  path?: string;
};

const both = ["ps4", "ps5"] as const;

export const checklistItems = [
  { id: "format-fat", consoles: both, section: "format", certainty: "documented" },
  { id: "format-large", consoles: both, section: "format", certainty: "documented" },
  { id: "format-not-extended", consoles: both, section: "format", certainty: "documented" },
  { id: "media-music", consoles: both, section: "media", certainty: "documented", path: "Music" },
  { id: "media-video", consoles: both, section: "media", certainty: "documented" },
  { id: "media-photo", consoles: both, section: "media", certainty: "verify" },
  { id: "media-av-contents", consoles: both, section: "media", certainty: "verify" },
  {
    id: "update-ps4",
    consoles: ["ps4"],
    section: "update",
    certainty: "documented",
    path: "PS4/UPDATE/PS4UPDATE.PUP",
  },
  {
    id: "update-ps5",
    consoles: ["ps5"],
    section: "update",
    certainty: "documented",
    path: "PS5/UPDATE/PS5UPDATE.PUP",
  },
  { id: "captures-ps4", consoles: ["ps4"], section: "captures", certainty: "verify" },
  { id: "captures-ps5", consoles: ["ps5"], section: "captures", certainty: "verify" },
  { id: "extended-ps4", consoles: ["ps4"], section: "extended", certainty: "verify" },
  { id: "extended-ps5", consoles: ["ps5"], section: "extended", certainty: "documented" },
  { id: "extended-separate", consoles: both, section: "extended", certainty: "documented" },
  { id: "backup-ps4", consoles: ["ps4"], section: "backup", certainty: "verify" },
  { id: "backup-ps5", consoles: ["ps5"], section: "backup", certainty: "documented" },
  { id: "saves-copy", consoles: both, section: "backup", certainty: "verify" },
] as const satisfies readonly ChecklistItem[];

export type ChecklistEntry = (typeof checklistItems)[number];
export type ItemId = ChecklistEntry["id"];

const itemIdSet = new Set<string>(checklistItems.map((item) => item.id));

export function isItemId(value: string): value is ItemId {
  return itemIdSet.has(value);
}

export function isConsoleFilter(value: string): value is ConsoleFilter {
  return (consoleFilters as readonly string[]).includes(value);
}

export function visibleItems(filter: ConsoleFilter): readonly ChecklistEntry[] {
  return checklistItems.filter((item) => filter === "both" || (item.consoles as readonly ConsoleId[]).includes(filter));
}

export function toggleId(checked: readonly string[], id: string): string[] {
  if (checked.includes(id)) return checked.filter((item) => item !== id);
  return [...checked, id];
}

export function countProgress(items: readonly { id: string }[], checked: readonly string[]): { done: number; total: number } {
  const set = new Set(checked);
  return { done: items.filter((item) => set.has(item.id)).length, total: items.length };
}

export type ItemText = { title: string; body: string };

export type ExportText = {
  title: string;
  consoleHeading: string;
  consoles: Record<ConsoleFilter, string>;
  progress: string;
  pathLabel: string;
  sections: Record<SectionId, string>;
  certainty: Record<Certainty, string>;
  items: Record<ItemId, ItemText>;
};

export type ExportRow = {
  id: ItemId;
  section: SectionId;
  title: string;
  body: string;
  path?: string;
  certainty: Certainty;
  certaintyLabel: string;
  checked: boolean;
};

export function fillProgress(template: string, done: number, total: number): string {
  return template.replaceAll("{done}", String(done)).replaceAll("{total}", String(total));
}

export function exportRows(text: ExportText, filter: ConsoleFilter, checked: readonly string[]): ExportRow[] {
  const set = new Set(checked);
  return visibleItems(filter).map((item) => {
    const copy = text.items[item.id];
    return {
      id: item.id,
      section: item.section,
      title: copy.title,
      body: copy.body,
      path: "path" in item ? item.path : undefined,
      certainty: item.certainty,
      certaintyLabel: text.certainty[item.certainty],
      checked: set.has(item.id),
    };
  });
}

export function exportPlain(text: ExportText, filter: ConsoleFilter, checked: readonly string[]): string {
  const rows = exportRows(text, filter, checked);
  const { done, total } = countProgress(rows, checked);
  const lines = [
    text.title,
    `${text.consoleHeading}: ${text.consoles[filter]}`,
    fillProgress(text.progress, done, total),
    "",
  ];
  for (const section of sectionIds) {
    const group = rows.filter((row) => row.section === section);
    if (!group.length) continue;
    lines.push(`## ${text.sections[section]}`, "");
    for (const row of group) {
      lines.push(`${row.checked ? "[x]" : "[ ]"} ${row.title} (${row.certaintyLabel})`);
      if (row.path) lines.push(`    ${text.pathLabel}: ${row.path}`);
      lines.push(`    ${row.body}`, "");
    }
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

export function exportMarkdown(text: ExportText, filter: ConsoleFilter, checked: readonly string[]): string {
  const rows = exportRows(text, filter, checked);
  const { done, total } = countProgress(rows, checked);
  const lines = [
    `# ${text.title}`,
    "",
    `${text.consoleHeading}: ${text.consoles[filter]}`,
    "",
    fillProgress(text.progress, done, total),
    "",
  ];
  for (const section of sectionIds) {
    const group = rows.filter((row) => row.section === section);
    if (!group.length) continue;
    lines.push(`## ${text.sections[section]}`, "");
    for (const row of group) {
      lines.push(`- [${row.checked ? "x" : " "}] ${row.title} (${row.certaintyLabel})`);
      if (row.path) lines.push(`  - ${text.pathLabel}: \`${row.path}\``);
      lines.push(`  - ${row.body}`, "");
    }
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

export const EXPORT_TEXT_NAME = "usb-stick-checkliste.txt";
export const EXPORT_MARKDOWN_NAME = "usb-stick-checkliste.md";
