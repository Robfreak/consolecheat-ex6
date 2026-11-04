import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { archiveHref, entryFromGame, finderHref } from "./catalog.ts";
import { addToList, emptyLists } from "./lists.ts";
import { buildIndex, decodeTitles, searchIndex, type TitlesFile } from "./search.ts";

const file = JSON.parse(readFileSync(new URL("../public/titles.json", import.meta.url), "utf8")) as TitlesFile;
const games = decodeTitles(file);
const index = buildIndex(games);
const all = { platform: "all" as const, region: "all" as const };

test("the vendored search finds typos, aliases, roman numerals, and title ids", () => {
  const war = searchIndex(index, "god of wr", all)[0];
  assert.equal(war?.game.name, "God of War");
  assert.ok(war?.game.skus.some((sku) => sku.id === "CUSA07408"));

  const alias = searchIndex(index, "tlou", all).map((hit) => hit.game.name);
  assert.ok(alias.some((name) => name.includes("The Last of Us")));

  const numeral = searchIndex(index, "gta v", all)[0];
  assert.match(numeral?.game.name ?? "", /Grand Theft Auto/);

  const byId = searchIndex(index, "CUSA07820", all)[0];
  assert.equal(byId?.game.name, "The Last of Us Part II");
  assert.equal(byId?.viaId, true);
});

test("a search hit becomes a list entry with only the catalog name and title ids", () => {
  const hit = searchIndex(index, "god of wr", all)[0];
  assert.ok(hit);
  if (!hit) return;
  const draft = entryFromGame(hit.game);
  assert.deepEqual(Object.keys(draft).sort(), ["name", "note", "titleIds"]);
  assert.equal(draft.name, "God of War");
  assert.equal(draft.note, "");
  assert.ok(draft.titleIds.includes("CUSA07408"));
  assert.ok(draft.titleIds.every((id) => /^(CUSA|PPSA)\d{5}$/.test(id)));
  assert.equal(JSON.stringify(draft).includes("masters"), false);
  assert.equal("price" in draft, false);

  const added = addToList(emptyLists(), "backlog", draft);
  assert.equal(added.ok, true);
  if (!added.ok) return;
  const again = addToList(added.file, "backlog", draft);
  assert.equal(again.ok, false);
  if (again.ok) return;
  assert.equal(again.reason, "duplicate");

  const primary = draft.titleIds[0];
  assert.ok(primary);
  const finder = finderHref(primary ?? "");
  assert.match(finder, /^https:\/\/robfreak\.github\.io\/consolecheat-ex1\/\?q=(CUSA|PPSA)\d{5}$/);
  const archive = archiveHref(draft.name);
  assert.match(archive, /^https:\/\/robfreak\.github\.io\/consolecheat-ex2\/\?q=/);
  assert.match(archive, /God(\+|%20)of(\+|%20)War/);
  assert.equal(finder.includes("id="), false);
});
