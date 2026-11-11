import assert from "node:assert/strict";
import test from "node:test";
import { activeProfile, createDefaultStore, withActive } from "./model.ts";
import { IMPORT_MAX_BYTES, exportJson, importInto, validateImport } from "./transfer.ts";

test("export and import round-trip a profile", () => {
  const store = createDefaultStore();
  const next = withActive(store, {
    ...activeProfile(store),
    game: "Hafen",
    category: "Glitchless",
    attempts: 2,
    pb: [1500, 3200, 4800],
    bestSegments: [1400, 1600, 1500],
  });
  const file = exportJson(next);
  const parsed = validateImport(file);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.store.schema, "consolecheat-speedrun");
  assert.equal(parsed.store.version, 1);
  assert.equal(activeProfile(parsed.store).game, "Hafen");
  assert.deepEqual(activeProfile(parsed.store).pb, [1500, 3200, 4800]);
  assert.deepEqual(activeProfile(parsed.store).bestSegments, [1400, 1600, 1500]);
  const applied = importInto(createDefaultStore(), file);
  assert.equal(applied.issue, null);
  assert.equal(activeProfile(applied.store).category, "Glitchless");
});

test("broken and invalid JSON are refused without replacing the current store", () => {
  const current = createDefaultStore();
  const cases: [string, string][] = [
    ["{", "broken-json"],
    [JSON.stringify({ schema: "other", version: 1, activeProfileId: "a", profiles: [] }), "wrong-schema"],
    [JSON.stringify({ schema: "consolecheat-speedrun", version: 2, activeProfileId: "profile-default", profiles: [] }), "wrong-version"],
    [JSON.stringify({ ...JSON.parse(exportJson(current)), extra: true }), "invalid"],
    [exportJson(current).replace('"pb": null', '"pb": [-1, 2, 3]'), "invalid"],
    ["null", "invalid"],
  ];
  for (const [text, issue] of cases) {
    const result = importInto(current, text);
    assert.equal(result.issue, issue, text.slice(0, 40));
    assert.equal(result.store, current);
    assert.equal(activeProfile(result.store).game, "Beispielspiel");
  }
  const oversized = `{${" ".repeat(IMPORT_MAX_BYTES)}}`;
  const huge = importInto(current, oversized, oversized.length);
  assert.equal(huge.issue, "oversized");
  assert.equal(huge.store, current);
});
