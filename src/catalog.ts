import type { Game, Region } from "./search.ts";

/** Title-ID-Finder reads `?q=` as a name or a title ID. */
export const FINDER_ORIGIN = "https://robfreak.github.io/consolecheat-ex1/";

/**
 * PS-Plus-Archiv reads `?q=` as a name filter (plus optional region, platform, year).
 * A title ID is not part of that filter, so the link uses the stored name.
 */
export const ARCHIVE_ORIGIN = "https://robfreak.github.io/consolecheat-ex2/";

export type IdFacts = { platform: "PS4" | "PS5"; region: Region };

/** Name and title IDs only. Aliases, disc masters, and anything else stay out of the list. */
export function entryFromGame(game: Game): { titleIds: string[]; name: string; note: string } {
  const titleIds: string[] = [];
  for (const sku of game.skus) {
    if (!titleIds.includes(sku.id)) titleIds.push(sku.id);
  }
  return { titleIds, name: game.name, note: "" };
}

export function catalogFacts(games: readonly Game[]): Map<string, IdFacts> {
  const map = new Map<string, IdFacts>();
  for (const game of games) {
    for (const sku of game.skus) {
      if (!map.has(sku.id)) map.set(sku.id, { platform: sku.platform, region: sku.region });
    }
  }
  return map;
}

export function finderHref(titleId: string): string {
  const url = new URL(FINDER_ORIGIN);
  url.searchParams.set("q", titleId);
  return url.toString();
}

export function archiveHref(name: string): string {
  const url = new URL(ARCHIVE_ORIGIN);
  url.searchParams.set("q", name);
  return url.toString();
}
