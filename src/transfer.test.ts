import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { IMPORT_MAX_BYTES, SCHEMA, addToList, emptyLists, type ListsFile } from "./lists.ts";
import { exportJson, resolveImport, validateImport } from "./transfer.ts";

function readSample(name: string): string {
  return readFileSync(new URL(`../samples/${name}`, import.meta.url), "utf8");
}

function gameFile(): ListsFile {
  let file = emptyLists();
  const added = [
    addToList(file, "backlog", { titleIds: ["CUSA07408", "CUSA07410"], name: "God of War", note: "behalten" }),
  ];
  assert.equal(added[0]?.ok, true);
  if (!added[0]?.ok) throw new Error("setup");
  file = added[0].file;
  const second = addToList(file, "playing", { titleIds: ["PPSA01317"], name: "Gran Turismo 7", note: "" });
  assert.equal(second.ok, true);
  if (!second.ok) throw new Error("setup");
  return second.file;
}

test("export and import round-trip the four lists", () => {
  const file = gameFile();
  const text = exportJson(file);
  assert.match(text, new RegExp(`"schema": "${SCHEMA}"`));
  assert.match(text, /"version": 1/);
  const parsed = validateImport(text);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.deepEqual(parsed.file, file);
  assert.equal(JSON.stringify(parsed.file).includes("price"), false);
  assert.equal(JSON.stringify(parsed.file).includes("release"), false);
});

test("the valid sample file imports and every bad sample is rejected", () => {
  const valid = validateImport(readSample("valid-merkliste.json"));
  assert.equal(valid.ok, true);
  if (!valid.ok) return;
  assert.equal(valid.file.lists.backlog[0]?.name, "God of War");
  assert.equal(valid.file.lists.playing[0]?.titleIds[0], "PPSA01317");
  assert.equal(valid.file.lists.completed.length, 1);
  assert.equal(valid.file.lists.wishlist.length, 1);

  const expected = [
    ["broken.json", "broken-json"],
    ["wrong-schema.json", "wrong-schema"],
    ["wrong-version.json", "wrong-version"],
    ["foreign.json", "foreign"],
    ["foreign-extra.json", "foreign"],
    ["invalid-entry.json", "invalid-entry"],
    ["invalid-note.json", "invalid-entry"],
    ["invalid-duplicate.json", "invalid-entry"],
    ["invalid-price.json", "invalid-entry"],
    ["oversized.json", "oversized"],
  ] as const;
  for (const [name, issue] of expected) {
    const result = validateImport(readSample(name));
    assert.equal(result.ok, false, name);
    if (!result.ok) assert.equal(result.issue, issue, name);
  }
});

test("import never overwrites without an explicit merge or replace", () => {
  const current = gameFile();
  const snapshot = structuredClone(current);
  const incoming = validateImport(readSample("valid-merkliste.json"));
  assert.equal(incoming.ok, true);
  if (!incoming.ok) return;

  assert.deepEqual(current, snapshot);
  assert.equal(resolveImport(current, incoming.file, "cancel"), current);
  assert.equal(resolveImport(current, incoming.file, "overwrite"), current);
  assert.equal(resolveImport(current, incoming.file, ""), current);
  assert.deepEqual(current, snapshot);

  const replaced = resolveImport(current, incoming.file, "replace");
  assert.notEqual(replaced, current);
  assert.deepEqual(current, snapshot);
  assert.equal(replaced.lists.wishlist[0]?.name, "The Last of Us Part II");
  assert.equal(replaced.lists.playing[0]?.name, "Gran Turismo 7");
  replaced.lists.backlog.push({ titleIds: ["CUSA00001"], name: "Mutated", note: "" });
  assert.equal(incoming.file.lists.backlog.length, 1);
  assert.deepEqual(current, snapshot);
});

test("merge keeps the current list and fills only an empty note", () => {
  const current = gameFile();
  const incoming = validateImport(readSample("valid-merkliste.json"));
  assert.equal(incoming.ok, true);
  if (!incoming.ok) return;
  const merged = resolveImport(current, incoming.file, "merge");
  assert.equal(current.lists.backlog[0]?.note, "behalten");
  const war = merged.lists.backlog.find((entry) => entry.titleIds.includes("CUSA07408"));
  assert.equal(war?.note, "behalten");
  assert.equal(merged.lists.wishlist.some((entry) => entry.name === "God of War"), false);
  assert.equal(merged.lists.wishlist[0]?.name, "The Last of Us Part II");
  assert.equal(merged.lists.completed[0]?.name, "Bloodborne");
  assert.ok(merged.lists.playing.some((entry) => entry.titleIds.includes("PPSA01317")));

  const blank = addToList(emptyLists(), "backlog", { titleIds: ["CUSA07408"], name: "God of War", note: "" });
  assert.equal(blank.ok, true);
  if (!blank.ok) return;
  const filled = resolveImport(blank.file, incoming.file, "merge");
  assert.equal(filled.lists.backlog[0]?.note, "Noch einmal von vorn.");
  assert.equal(blank.file.lists.backlog[0]?.note, "");
});

test("strict shape checks cover version type, missing schema, and invented fields", () => {
  const base = {
    schema: SCHEMA,
    version: 1,
    lists: { backlog: [], playing: [], completed: [], wishlist: [] },
  };
  assert.equal(validateImport("{").ok, false);
  const arrayFile = validateImport("[]");
  assert.equal(arrayFile.ok, false);
  if (!arrayFile.ok) assert.equal(arrayFile.issue, "foreign");

  const stringVersion = validateImport(JSON.stringify({ ...base, version: "1" }));
  assert.equal(stringVersion.ok, false);
  if (!stringVersion.ok) assert.equal(stringVersion.issue, "wrong-version");

  const noSchema = validateImport(JSON.stringify({ tool: "other", items: [] }));
  assert.equal(noSchema.ok, false);
  if (!noSchema.ok) assert.equal(noSchema.issue, "foreign");

  const release = validateImport(
    JSON.stringify({
      ...base,
      lists: {
        ...base.lists,
        backlog: [{ titleIds: ["CUSA07408"], name: "God of War", note: "", releaseDate: "2018" }],
      },
    }),
  );
  assert.equal(release.ok, false);
  if (!release.ok) assert.equal(release.issue, "invalid-entry");

  const huge = `{"schema":"${SCHEMA}"}${" ".repeat(IMPORT_MAX_BYTES)}`;
  const oversized = validateImport(huge);
  assert.equal(oversized.ok, false);
  if (!oversized.ok) assert.equal(oversized.issue, "oversized");
});
