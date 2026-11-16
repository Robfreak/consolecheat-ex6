/**
 * Cross-links to the other consolecheat tools.
 * The page only renders anchors. It does not request these origins.
 * The same list lives in every consolecheat tool repository
 * (consolecheat-ex7 to consolecheat-ex14). Keep the copies identical.
 */
export const toolLinks = [
  {
    id: "finder",
    href: "https://robfreak.github.io/consolecheat-ex1/",
    de: "Title-ID-Finder",
    en: "Title-ID-Finder",
  },
  {
    id: "archive",
    href: "https://robfreak.github.io/consolecheat-ex2/",
    de: "PS-Plus-Archiv",
    en: "PS Plus archive",
  },
  {
    id: "controller",
    href: "https://robfreak.github.io/consolecheat-ex3/",
    de: "Controller-Tester",
    en: "Controller tester",
  },
  {
    id: "save",
    href: "https://robfreak.github.io/consolecheat-ex4/",
    de: "Save-Info-Leser",
    en: "Save info reader",
  },
  {
    id: "codes",
    href: "https://robfreak.github.io/consolecheat-ex5/",
    de: "Fehlercode-Nachschlager",
    en: "Error code lookup",
  },
  {
    id: "merkliste",
    href: "https://robfreak.github.io/consolecheat-ex6/",
    de: "Spiele-Merkliste",
    en: "Spiele-Merkliste",
  },
  {
    id: "screen",
    href: "https://robfreak.github.io/consolecheat-ex7/",
    de: "Bildschirm-Test",
    en: "Screen test",
  },
  {
    id: "download",
    href: "https://robfreak.github.io/consolecheat-ex8/",
    de: "Download-Zeit-Rechner",
    en: "Download time calculator",
  },
  {
    id: "buttons",
    href: "https://robfreak.github.io/consolecheat-ex9/",
    de: "Tastenbelegung",
    en: "Button layout",
  },
  {
    id: "hdr",
    href: "https://robfreak.github.io/consolecheat-ex10/",
    de: "HDR/Helligkeit",
    en: "HDR / brightness",
  },
  {
    id: "audio",
    href: "https://robfreak.github.io/consolecheat-ex11/",
    de: "Audio-Kanal-Test",
    en: "Audio channel test",
  },
  {
    id: "usb",
    href: "https://robfreak.github.io/consolecheat-ex12/",
    de: "USB-Stick-Checkliste",
    en: "USB stick checklist",
  },
  {
    id: "combo",
    href: "https://robfreak.github.io/consolecheat-ex13/",
    de: "Combo-Trainer",
    en: "Combo trainer",
  },
  {
    id: "sprite",
    href: "https://robfreak.github.io/consolecheat-ex14/",
    de: "Sprite-Animator",
    en: "Sprite animator",
  },
] as const;

export type ToolId = (typeof toolLinks)[number]["id"];
export type ToolLink = (typeof toolLinks)[number];

export function otherTools(current: ToolId): ToolLink[] {
  return toolLinks.filter((tool) => tool.id !== current);
}

export function footerTools(
  current: ToolId,
  lang: "de" | "en",
  options?: {
    href?: Partial<Record<ToolId, string>>;
    label?: Partial<Record<ToolId, string>>;
  },
): { id: ToolId; href: string; label: string }[] {
  return otherTools(current).map((tool) => ({
    id: tool.id,
    href: options?.href?.[tool.id] ?? tool.href,
    label: options?.label?.[tool.id] ?? tool[lang],
  }));
}
