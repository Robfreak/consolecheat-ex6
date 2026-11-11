import assert from "node:assert/strict";
import test from "node:test";
import { BYE } from "./types.ts";
import { bracketSize, commitKoScore, koWinner, resolveBracket, roundCount, type KoMatch } from "./bracket.ts";

function ids(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `p${index}`);
}

function roundsOf(matches: readonly KoMatch[]): number {
  return Math.max(...matches.map((match) => match.round)) + 1;
}

test("single elimination for every field size from 2 to 16", () => {
  for (let count = 2; count <= 16; count += 1) {
    const playerIds = ids(count);
    const size = bracketSize(count);
    const rounds = roundCount(count);
    assert.equal(size >= count && (size & (size - 1)) === 0, true, `size ${count}`);
    assert.equal(rounds, Math.log2(size));
    const matches = resolveBracket(playerIds, {});
    assert.equal(roundsOf(matches), rounds, `rounds ${count}`);
    assert.equal(matches.length, size - 1, `match count ${count}`);
    for (let round = 0; round < rounds; round += 1) {
      assert.equal(matches.filter((match) => match.round === round).length, size / 2 / 2 ** round);
    }

    const first = matches.filter((match) => match.round === 0);
    const byes = size - count;
    let byeMatches = 0;
    const seen = new Set<string>();
    for (const match of first) {
      const homeBye = match.home === BYE;
      const awayBye = match.away === BYE;
      assert.equal(homeBye && awayBye, false, `bye vs bye at n=${count} ${match.id}`);
      if (homeBye || awayBye) {
        byeMatches += 1;
        const player = homeBye ? match.away : match.home;
        assert.equal(typeof player, "string");
        assert.notEqual(player, BYE);
        const advanced = matches.find(
          (item) => item.round === 1 && (item.home === player || item.away === player),
        );
        assert.ok(advanced, `bye winner advances at n=${count}`);
      }
      for (const slot of [match.home, match.away]) {
        if (slot && slot !== BYE) {
          assert.equal(seen.has(slot), false, slot);
          seen.add(slot);
        }
      }
    }
    assert.equal(byeMatches, byes, `bye count ${count}`);
    assert.equal(seen.size, count);
    for (const match of matches) {
      if (match.round === 0) continue;
      assert.notEqual(match.home, BYE);
      assert.notEqual(match.away, BYE);
    }
  }
});

test("a bye winner is already in the next round before any score", () => {
  const matches = resolveBracket(["a", "b", "c"], {});
  const bye = matches.find((match) => match.round === 0 && (match.home === BYE || match.away === BYE));
  assert.ok(bye);
  const player = bye.home === BYE ? bye.away : bye.home;
  const final = matches.find((match) => match.round === 1);
  assert.ok(final);
  assert.equal(final.home === player || final.away === player, true);
  assert.equal(koWinner(matches), null);
});

test("knockout rejects a draw and requires both players", () => {
  const players = ["a", "b", "c", "d"];
  const draw = commitKoScore(players, {}, "r0m0", { home: 1, away: 1 }, true);
  assert.deepEqual(draw, { ok: false, reason: "draw" });
  const early = commitKoScore(players, {}, "r1m0", { home: 1, away: 0 }, true);
  assert.equal(early.ok, false);
  if (!early.ok) assert.equal(early.reason, "not-ready");
  const bye = resolveBracket(["a", "b", "c"], {});
  const byeMatch = bye.find((match) => match.home === BYE || match.away === BYE);
  assert.ok(byeMatch);
  const blocked = commitKoScore(["a", "b", "c"], {}, byeMatch.id, { home: 1, away: 0 }, true);
  assert.equal(blocked.ok, false);
  if (!blocked.ok) assert.equal(blocked.reason, "bye");
});

test("correcting an earlier result clears only the downstream matches whose players changed", () => {
  const players = ["a", "b", "c", "d", "e", "f", "g", "h"];
  let scores: Record<string, { home: number; away: number }> = {};
  for (const id of ["r0m0", "r0m1", "r0m2", "r0m3"]) {
    const next = commitKoScore(players, scores, id, { home: 1, away: 0 }, true);
    assert.equal(next.ok, true);
    if (next.ok) scores = next.scores;
  }
  for (const id of ["r1m0", "r1m1", "r2m0"]) {
    const next = commitKoScore(players, scores, id, { home: 2, away: 1 }, true);
    assert.equal(next.ok, true);
    if (next.ok) scores = next.scores;
  }
  assert.equal(koWinner(resolveBracket(players, scores)), "a");

  const pending = commitKoScore(players, scores, "r0m0", { home: 0, away: 1 }, false);
  assert.equal(pending.ok, false);
  if (!pending.ok) {
    assert.equal(pending.reason, "confirm");
    if (pending.reason === "confirm") assert.deepEqual(pending.cleared.sort(), ["r1m0", "r2m0"]);
  }
  assert.equal(scores.r1m1?.home, 2);

  const same = commitKoScore(players, scores, "r0m0", { home: 3, away: 0 }, false);
  assert.equal(same.ok, true);
  if (same.ok) assert.deepEqual(same.cleared, []);

  const applied = commitKoScore(players, scores, "r0m0", { home: 0, away: 1 }, true);
  assert.equal(applied.ok, true);
  if (!applied.ok) return;
  assert.equal(applied.scores.r1m0, undefined);
  assert.equal(applied.scores.r2m0, undefined);
  assert.deepEqual(applied.scores.r1m1, { home: 2, away: 1 });
  const resolved = resolveBracket(players, applied.scores);
  const semi = resolved.find((match) => match.id === "r1m0");
  assert.equal(semi?.home, "b");
  assert.equal(semi?.away, "c");
  assert.equal(semi?.homeScore, null);
  const other = resolved.find((match) => match.id === "r1m1");
  assert.equal(other?.home, "e");
  assert.equal(other?.homeScore, 2);
  assert.equal(koWinner(resolved), null);
});

test("a later match with no score yet updates its player without asking", () => {
  const players = ["a", "b", "c", "d"];
  const first = commitKoScore(players, {}, "r0m0", { home: 1, away: 0 }, true);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const quiet = commitKoScore(players, first.scores, "r0m0", { home: 0, away: 2 }, false);
  assert.equal(quiet.ok, true);
  if (!quiet.ok) return;
  const semi = resolveBracket(players, quiet.scores).find((match) => match.id === "r1m0");
  assert.equal(semi?.home, "b");
});
