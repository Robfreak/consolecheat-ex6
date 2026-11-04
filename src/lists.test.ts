import assert from "node:assert/strict";
import test from "node:test";
import {
  NOTE_MAX,
  addToList,
  emptyLists,
  moveEntry,
  removeEntry,
  updateNote,
  type ListsFile,
} from "./lists.ts";

function withGame(list: "backlog" | "playing" | "completed" | "wishlist" = "backlog"): ListsFile {
  const added = addToList(emptyLists(), list, {
    titleIds: ["CUSA07408", "CUSA07410"],
    name: "God of War",
    note: "Noch einmal.",
  });
  assert.equal(added.ok, true);
  if (!added.ok) throw new Error("setup");
  return added.file;
}

test("add, move, remove, and note keep only title ids, name, and note", () => {
  const original = emptyLists();
  const added = addToList(original, "backlog", {
    titleIds: ["CUSA07410", "CUSA07408"],
    name: "  God of War  ",
    note: "  noch einmal  ",
  });
  assert.equal(added.ok, true);
  if (!added.ok) return;
  assert.equal(original.lists.backlog.length, 0);
  const entry = added.file.lists.backlog[0];
  assert.deepEqual(Object.keys(entry).sort(), ["name", "note", "titleIds"]);
  assert.equal(entry?.name, "God of War");
  assert.equal(entry?.note, "noch einmal");
  assert.deepEqual(entry?.titleIds, ["CUSA07410", "CUSA07408"]);

  const moved = moveEntry(added.file, "backlog", "playing", ["CUSA07408"]);
  assert.equal(moved.ok, true);
  if (!moved.ok) return;
  assert.equal(added.file.lists.backlog.length, 1);
  assert.equal(moved.file.lists.backlog.length, 0);
  assert.equal(moved.file.lists.playing[0]?.name, "God of War");

  const noted = updateNote(moved.file, "playing", ["CUSA07410"], "Pause nach dem Intro.");
  assert.equal(noted.ok, true);
  if (!noted.ok) return;
  assert.equal(moved.file.lists.playing[0]?.note, "noch einmal");
  assert.equal(noted.file.lists.playing[0]?.note, "Pause nach dem Intro.");

  const removed = removeEntry(noted.file, "playing", ["CUSA07408"]);
  assert.equal(removed.ok, true);
  if (!removed.ok) return;
  assert.equal(removed.file.lists.playing.length, 0);
  assert.equal(noted.file.lists.playing.length, 1);
});

test("the same title id cannot be added twice to one list, including a partial overlap", () => {
  const file = withGame();
  const again = addToList(file, "backlog", { titleIds: ["CUSA07408"], name: "God of War" });
  assert.equal(again.ok, false);
  if (again.ok) return;
  assert.equal(again.reason, "duplicate");
  assert.equal(file.lists.backlog.length, 1);

  const elsewhere = addToList(file, "wishlist", { titleIds: ["CUSA07410"], name: "God of War" });
  assert.equal(elsewhere.ok, false);
  if (elsewhere.ok) return;
  assert.equal(elsewhere.reason, "elsewhere");
  assert.equal(elsewhere.list, "backlog");
  assert.equal(file.lists.wishlist.length, 0);

  const other = addToList(file, "wishlist", { titleIds: ["PPSA01317"], name: "Gran Turismo 7" });
  assert.equal(other.ok, true);
  if (!other.ok) return;
  assert.equal(other.file.lists.wishlist.length, 1);
  assert.equal(other.file.lists.backlog.length, 1);
});

test("move refuses a list that already has an overlapping title id", () => {
  const first = withGame("backlog");
  const second = addToList(first, "completed", { titleIds: ["CUSA00900"], name: "Bloodborne" });
  assert.equal(second.ok, true);
  if (!second.ok) return;
  const clash = addToList(emptyLists(), "completed", { titleIds: ["CUSA07408"], name: "God of War" });
  assert.equal(clash.ok, true);
  if (!clash.ok) return;
  const merged = structuredClone(second.file);
  merged.lists.completed = clash.file.lists.completed;
  const blocked = moveEntry(merged, "backlog", "completed", ["CUSA07410"]);
  assert.equal(blocked.ok, false);
  if (blocked.ok) return;
  assert.equal(blocked.reason, "duplicate");
  assert.equal(merged.lists.backlog.length, 1);
});

test("notes have a length limit and do not accept control characters", () => {
  const file = withGame();
  const exact = updateNote(file, "backlog", ["CUSA07408"], "ä".repeat(NOTE_MAX));
  assert.equal(exact.ok, true);
  if (!exact.ok) return;
  assert.equal(exact.file.lists.backlog[0]?.note.length, NOTE_MAX);

  const tooLong = updateNote(exact.file, "backlog", ["CUSA07408"], "ä".repeat(NOTE_MAX + 1));
  assert.equal(tooLong.ok, false);
  if (tooLong.ok) return;
  assert.equal(tooLong.reason, "note-too-long");
  assert.equal(exact.file.lists.backlog[0]?.note.length, NOTE_MAX);

  const control = updateNote(file, "backlog", ["CUSA07408"], "Zeile\u0000");
  assert.equal(control.ok, false);
  if (control.ok) return;
  assert.equal(control.reason, "invalid");
  assert.equal(file.lists.backlog[0]?.note, "Noch einmal.");

  const newline = updateNote(file, "backlog", ["CUSA07408"], "erste Zeile\nzweite");
  assert.equal(newline.ok, true);
  if (!newline.ok) return;
  assert.match(newline.file.lists.backlog[0]?.note ?? "", /zweite/);
});

test("invalid title ids and empty names are refused", () => {
  const file = emptyLists();
  const badId = addToList(file, "backlog", { titleIds: ["CUSA0740"], name: "God of War" });
  const emptyName = addToList(file, "backlog", { titleIds: ["CUSA07408"], name: "   " });
  const missing = moveEntry(file, "backlog", "playing", ["CUSA07408"]);
  assert.equal(badId.ok, false);
  assert.equal(emptyName.ok, false);
  assert.equal(missing.ok, false);
  assert.equal(file.lists.backlog.length, 0);
});
