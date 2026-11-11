import assert from "node:assert/strict";
import test from "node:test";
import { addProfile, addSplit, deleteProfile, deleteSplit, editingLocked, moveSplit, renameSplit, selectProfile, updateProfile } from "./editor.ts";
import { activeProfile, createDefaultStore, freshRun, withActive } from "./model.ts";
import { dispatch } from "./run.ts";

test("splits can be created, renamed, reordered, and deleted only while the timer is idle", () => {
  let store = createDefaultStore();
  let run = freshRun();
  const added = addSplit(store, run, "  Abspann  ", "split-extra");
  assert.equal(added.ok, true);
  if (!added.ok) return;
  store = added.store;
  run = added.run;
  assert.deepEqual(
    activeProfile(store).splits.map((split) => split.name),
    ["Intro", "Boss", "Ziel", "Abspann"],
  );
  assert.equal(activeProfile(store).bestSegments.length, 4);
  assert.equal(activeProfile(store).pb, null);

  store = withActive(store, { ...activeProfile(store), pb: [1, 2, 3, 4], bestSegments: [1, 2, 3, 4] });
  const renamed = renameSplit(store, run, "split-boss", "Wache");
  assert.equal(renamed.ok, true);
  if (!renamed.ok) return;
  assert.equal(activeProfile(renamed.store).splits[1]?.name, "Wache");
  assert.deepEqual(activeProfile(renamed.store).pb, [1, 2, 3, 4]);
  assert.deepEqual(activeProfile(renamed.store).bestSegments, [1, 2, 3, 4]);

  const moved = moveSplit(renamed.store, run, "split-boss", -1);
  assert.equal(moved.ok, true);
  if (!moved.ok) return;
  assert.deepEqual(
    activeProfile(moved.store).splits.map((split) => split.id),
    ["split-boss", "split-intro", "split-goal", "split-extra"],
  );
  assert.deepEqual(activeProfile(moved.store).bestSegments, [2, 1, 3, 4]);
  assert.equal(activeProfile(moved.store).pb, null);

  const removed = deleteSplit(moved.store, run, "split-extra");
  assert.equal(removed.ok, true);
  if (!removed.ok) return;
  assert.equal(activeProfile(removed.store).splits.some((split) => split.id === "split-extra"), false);
  assert.equal(activeProfile(removed.store).bestSegments.length, 3);

  const running = dispatch(removed.store, freshRun(), "start-split", 0);
  assert.equal(editingLocked(running.store, running.run), true);
  const blocked = renameSplit(running.store, running.run, "split-intro", "Nein");
  assert.equal(blocked.ok, false);
  if (blocked.ok) return;
  assert.equal(blocked.reason, "running");
  assert.equal(activeProfile(blocked.store).splits[0]?.name, activeProfile(running.store).splits[0]?.name);
  assert.equal(addSplit(running.store, running.run, "X", "split-x").ok, false);
  assert.equal(deleteSplit(running.store, running.run, "split-intro").ok, false);
});

test("profiles can be added, renamed, switched, and deleted, except the last one", () => {
  let store = createDefaultStore();
  const run = freshRun();
  const named = updateProfile(store, run, "Hafen", "Any%");
  assert.equal(named.ok, true);
  if (!named.ok) return;
  store = named.store;
  assert.equal(activeProfile(store).game, "Hafen");
  assert.equal(updateProfile(store, run, "   ", "Any%").ok, false);
  assert.equal(activeProfile(store).game, "Hafen");

  const created = addProfile(store, run, {
    id: "profile-2",
    game: "Zweites",
    category: "Glitchless",
    attempts: 4,
    splits: [{ id: "only", name: "Ziel" }],
    pb: [99],
    bestSegments: [99],
    splitsVersion: 9,
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  store = created.store;
  assert.equal(store.activeProfileId, "profile-2");
  assert.equal(activeProfile(store).attempts, 0);
  assert.equal(activeProfile(store).pb, null);

  const back = selectProfile(store, created.run, "profile-default");
  assert.equal(back.ok, true);
  if (!back.ok) return;
  assert.equal(back.store.activeProfileId, "profile-default");

  const removed = deleteProfile(back.store, back.run, "profile-2");
  assert.equal(removed.ok, true);
  if (!removed.ok) return;
  assert.equal(removed.store.profiles.length, 1);
  const last = deleteProfile(removed.store, removed.run, "profile-default");
  assert.equal(last.ok, false);
  if (last.ok) return;
  assert.equal(last.reason, "last");
  assert.equal(last.store.profiles.length, 1);
});
