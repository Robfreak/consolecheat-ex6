import assert from "node:assert/strict";
import test from "node:test";
import { duplicateIds, playerIssue, readyPlayers } from "./players.ts";

test("player names can be added within 2 to 16 and duplicates are refused", () => {
  const two = [
    { id: "paaaaaaaa", name: " Ada " },
    { id: "pbbbbbbbb", name: "Bea" },
  ];
  assert.equal(playerIssue(two), null);
  assert.deepEqual(readyPlayers(two)?.map((player) => player.name), ["Ada", "Bea"]);
  assert.equal(playerIssue([{ id: "paaaaaaaa", name: "Ada" }]), "count");
  assert.equal(playerIssue(Array.from({ length: 17 }, (_, index) => ({ id: `p${index}`, name: `S${index}` }))), "count");
  const dupes = [
    { id: "paaaaaaaa", name: "Ada" },
    { id: "pbbbbbbbb", name: " ada " },
  ];
  assert.equal(playerIssue(dupes), "duplicate");
  assert.equal(readyPlayers(dupes), null);
  assert.deepEqual(duplicateIds(dupes).sort(), ["paaaaaaaa", "pbbbbbbbb"]);
  assert.equal(playerIssue([{ id: "paaaaaaaa", name: "" }, { id: "pbbbbbbbb", name: "Bea" }]), "count");
});
