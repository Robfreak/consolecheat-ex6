import assert from "node:assert/strict";
import test from "node:test";
import { HIGH_QUERY, STANDARD_QUERY, readDynamicRange, type MatchMediaLike } from "./range.ts";

function media(answers: Record<string, boolean>): MatchMediaLike {
  return (query) => ({ matches: answers[query] === true });
}

test("the dynamic-range probe reports high, standard, or unknown", () => {
  assert.equal(HIGH_QUERY, "(dynamic-range: high)");
  assert.equal(STANDARD_QUERY, "(dynamic-range: standard)");
  assert.equal(readDynamicRange(media({ [HIGH_QUERY]: true, [STANDARD_QUERY]: false })), "high");
  assert.equal(readDynamicRange(media({ [HIGH_QUERY]: true, [STANDARD_QUERY]: true })), "high");
  assert.equal(readDynamicRange(media({ [HIGH_QUERY]: false, [STANDARD_QUERY]: true })), "standard");
  assert.equal(readDynamicRange(media({})), "unknown");
  assert.equal(readDynamicRange(null), "unknown");
  assert.equal(readDynamicRange(undefined), "unknown");
  const broken: MatchMediaLike = () => {
    throw new Error("unsupported");
  };
  assert.equal(readDynamicRange(broken), "unknown");
});

test("a thrown standard query still fails closed", () => {
  let calls = 0;
  const flaky: MatchMediaLike = (query) => {
    calls += 1;
    if (query === HIGH_QUERY) return { matches: false };
    throw new Error("standard unsupported");
  };
  assert.equal(readDynamicRange(flaky), "unknown");
  assert.equal(calls, 2);
});
