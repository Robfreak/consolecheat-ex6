/**
 * Cross-links to the other consolecheat tools.
 * The page only renders anchors. It does not request these origins.
 * src/bildschirm/tools.ts is the same list, so the screen test can move
 * without the Merkliste modules. Keep the two files identical.
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
    href: "https://robfreak.github.io/consolecheat-ex6/bildschirm/",
    de: "Bildschirm-Test",
    en: "Screen test",
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
