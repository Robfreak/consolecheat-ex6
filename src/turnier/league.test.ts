import assert from "node:assert/strict";
import test from "node:test";
import { BYE } from "./types.ts";
import { isBye, leagueComplete, leagueSchedule, leagueTable, type LeagueMatch } from "./league.ts";

function ids(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `p${index}`);
}

function pairKey(match: LeagueMatch): string {
  const left = match.home < match.away ? match.home : match.away;
  const right = match.home < match.away ? match.away : match.home;
  return `${left}|${right}`;
}

test("round robin for every field size from 2 to 16", () => {
  for (let count = 2; count <= 16; count += 1) {
    for (const doubleRound of [false, true]) {
      const schedule = leagueSchedule(ids(count), doubleRound);
      const expectedRounds = (count % 2 === 0 ? count - 1 : count) * (doubleRound ? 2 : 1);
      const rounds = new Set(schedule.map((match) => match.round));
      assert.equal(rounds.size, expectedRounds, `rounds n=${count} double=${doubleRound}`);
      for (const round of rounds) {
        const day = schedule.filter((match) => match.round === round);
        const byes = day.filter(isBye);
        if (count % 2 === 1) assert.equal(byes.length, 1, `freilos n=${count} round=${round}`);
        else assert.equal(byes.length, 0, `no freilos n=${count}`);
      }
      const real = schedule.filter((match) => !isBye(match));
      const counts = new Map<string, number>();
      const orientations = new Map<string, Set<string>>();
      for (const match of real) {
        const key = pairKey(match);
        counts.set(key, (counts.get(key) ?? 0) + 1);
        const facing = orientations.get(key) ?? new Set<string>();
        facing.add(`${match.home}>${match.away}`);
        orientations.set(key, facing);
      }
      const expectedPairs = (count * (count - 1)) / 2;
      assert.equal(counts.size, expectedPairs, `pairs n=${count}`);
      for (const [key, times] of counts) {
        assert.equal(times, doubleRound ? 2 : 1, `${key} n=${count}`);
        if (doubleRound) assert.equal(orientations.get(key)?.size, 2, `return leg ${key}`);
      }
      if (count % 2 === 1) {
        const byeCounts = new Map<string, number>();
        for (const match of schedule.filter(isBye)) {
          const player = match.home === BYE ? match.away : match.home;
          byeCounts.set(player, (byeCounts.get(player) ?? 0) + 1);
        }
        assert.equal(byeCounts.size, count);
        for (const times of byeCounts.values()) assert.equal(times, doubleRound ? 2 : 1);
      }
    }
  }
});

test("the table sorts by points, goal difference, goals scored, head-to-head, then name", () => {
  const players = [
    { id: "chris", name: "Chris" },
    { id: "zara", name: "Zara" },
    { id: "anna", name: "Anna" },
    { id: "dana", name: "Dana" },
  ];
  const points = { win: 3, draw: 1, loss: 0 };
  const matches: LeagueMatch[] = [
    { id: "r0m0", round: 0, index: 0, leg: 0, home: "zara", away: "anna" },
    { id: "r0m1", round: 0, index: 1, leg: 0, home: "zara", away: "chris" },
    { id: "r1m0", round: 1, index: 0, leg: 0, home: "anna", away: "dana" },
  ];
  const table = leagueTable(players, matches, {
    r0m0: { home: 1, away: 0 },
    r0m1: { home: 0, away: 1 },
    r1m0: { home: 1, away: 0 },
  }, points);
  assert.deepEqual(table.map((row) => row.name), ["Chris", "Zara", "Anna", "Dana"]);
  assert.equal(table[0]?.goalDiff, 1);
  assert.equal(table[1]?.points, 3);
  assert.equal(table[1]?.goalDiff, 0);
  assert.equal(table[2]?.points, 3);
  assert.equal(table[1]?.goalsFor, table[2]?.goalsFor);

  const side = [
    { id: "anna", name: "Anna" },
    { id: "zara", name: "Zara" },
    { id: "pat", name: "Pat" },
    { id: "dot", name: "Dot" },
  ];
  const diff = leagueTable(
    side,
    [
      { id: "a", round: 0, index: 0, leg: 0, home: "anna", away: "pat" },
      { id: "b", round: 0, index: 1, leg: 0, home: "zara", away: "dot" },
    ],
    { a: { home: 5, away: 4 }, b: { home: 2, away: 0 } },
    points,
  );
  const diffAnna = diff.find((row) => row.id === "anna");
  const diffZara = diff.find((row) => row.id === "zara");
  assert.ok(diff.indexOf(diffZara!) < diff.indexOf(diffAnna!));
  assert.equal(diffZara?.points, diffAnna?.points);
  assert.ok((diffZara?.goalDiff ?? 0) > (diffAnna?.goalDiff ?? 0));
  assert.ok((diffAnna?.goalsFor ?? 0) > (diffZara?.goalsFor ?? 0));

  const goals = leagueTable(
    side,
    [
      { id: "a", round: 0, index: 0, leg: 0, home: "anna", away: "pat" },
      { id: "b", round: 0, index: 1, leg: 0, home: "zara", away: "dot" },
    ],
    { a: { home: 1, away: 0 }, b: { home: 2, away: 1 } },
    points,
  );
  const goalsAnna = goals.find((row) => row.id === "anna");
  const goalsZara = goals.find((row) => row.id === "zara");
  assert.ok(goals.indexOf(goalsZara!) < goals.indexOf(goalsAnna!));
  assert.equal(goalsZara?.points, goalsAnna?.points);
  assert.equal(goalsZara?.goalDiff, goalsAnna?.goalDiff);
  assert.ok((goalsZara?.goalsFor ?? 0) > (goalsAnna?.goalsFor ?? 0));

  const names = leagueTable(
    side,
    [
      { id: "a", round: 0, index: 0, leg: 0, home: "anna", away: "pat" },
      { id: "b", round: 0, index: 1, leg: 0, home: "zara", away: "dot" },
    ],
    { a: { home: 1, away: 0 }, b: { home: 1, away: 0 } },
    points,
  );
  const nameAnna = names.find((row) => row.id === "anna");
  const nameZara = names.find((row) => row.id === "zara");
  assert.ok(names.indexOf(nameAnna!) < names.indexOf(nameZara!));
  assert.equal(nameAnna?.points, 3);
  assert.equal(nameZara?.points, 3);
  assert.equal(nameAnna?.goalDiff, 1);
  assert.equal(nameZara?.goalDiff, 1);
  assert.equal(nameAnna?.goalsFor, nameZara?.goalsFor);
});

test("a bye is not a played match and custom points change the table", () => {
  const players = [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
    { id: "c", name: "C" },
  ];
  const schedule = leagueSchedule(["a", "b", "c"], false);
  const scored = schedule.find((match) => !isBye(match) && match.home === "a");
  assert.ok(scored);
  const custom = { win: 5, draw: 2, loss: 1 };
  const table = leagueTable(players, schedule, { [scored.id]: { home: 1, away: 1 } }, custom);
  const home = table.find((row) => row.id === scored.home);
  const away = table.find((row) => row.id === scored.away);
  const resting = table.find((row) => row.played === 0);
  assert.equal(home?.points, 2);
  assert.equal(away?.points, 2);
  assert.equal(home?.drawn, 1);
  assert.equal(resting?.played, 0);
  assert.equal(resting?.points, 0);
  assert.equal(leagueComplete(schedule, { [scored.id]: { home: 1, away: 1 } }), false);
  const all: Record<string, { home: number; away: number }> = {};
  for (const match of schedule) {
    if (!isBye(match)) all[match.id] = { home: 0, away: 0 };
  }
  assert.equal(leagueComplete(schedule, all), true);
});

test("points rank above a prettier goal difference", () => {
  const table = leagueTable(
    [
      { id: "anna", name: "Anna" },
      { id: "zara", name: "Zara" },
    ],
    [{ id: "m", round: 0, index: 0, leg: 0, home: "anna", away: "zara" }],
    { m: { home: 0, away: 1 } },
    { win: 3, draw: 1, loss: 0 },
  );
  assert.deepEqual(table.map((row) => row.name), ["Zara", "Anna"]);
  assert.equal(table[0]?.won, 1);
  assert.equal(table[1]?.lost, 1);
  assert.equal(table[0]?.goalsFor, 1);
  assert.equal(table[1]?.goalDiff, -1);
});
