import assert from "node:assert/strict";
import test from "node:test";
import { beepFrequency } from "./beep.ts";

test("the optional beep uses a short local tone and stays a pure frequency", () => {
  assert.equal(beepFrequency("go"), 660);
  assert.equal(beepFrequency("good"), 880);
  assert.equal(beepFrequency("bad"), 196);
});
