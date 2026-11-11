import assert from "node:assert/strict";
import test from "node:test";
import { actionForKey } from "./keyboard.ts";
import { applyAnswer, newRun } from "./score.ts";
import { catalog } from "./catalog.ts";
import { generateQuestion, mulberry32 } from "./questions.ts";

test("keys 1 to 4 answer and Enter continues", () => {
  assert.deepEqual(actionForKey("ask", "1"), { type: "answer", index: 0 });
  assert.deepEqual(actionForKey("ask", "2"), { type: "answer", index: 1 });
  assert.deepEqual(actionForKey("ask", "3"), { type: "answer", index: 2 });
  assert.deepEqual(actionForKey("ask", "4"), { type: "answer", index: 3 });
  assert.deepEqual(actionForKey("ask", "5"), { type: "ignore" });
  assert.deepEqual(actionForKey("ask", "Enter"), { type: "ignore" });
  assert.deepEqual(actionForKey("ask", "a"), { type: "ignore" });
  assert.deepEqual(actionForKey("reveal", "Enter"), { type: "next" });
  assert.deepEqual(actionForKey("reveal", "1"), { type: "ignore" });
  assert.deepEqual(actionForKey("setup", "1"), { type: "ignore" });
  assert.deepEqual(actionForKey("setup", "Enter"), { type: "ignore" });
  assert.deepEqual(actionForKey("done", "Enter"), { type: "ignore" });
  assert.deepEqual(actionForKey("done", "1"), { type: "ignore" });
});

test("a number key selects that option and scores it", () => {
  const question = generateQuestion(catalog, mulberry32(4), "year");
  const pressed = actionForKey("ask", "3");
  assert.equal(pressed.type, "answer");
  if (pressed.type !== "answer") return;
  const option = question.options[pressed.index];
  assert.ok(option);
  const correct = option === question.correct;
  const step = applyAnswer(newRun("classic"), { correct, kind: question.kind, timer: false, secondsLeft: 0 });
  assert.equal(step.state.answered, 1);
  assert.equal(step.state.correct, correct ? 1 : 0);
  assert.equal(step.gained, correct ? 100 : 0);
  assert.equal(question.options.includes(question.correct), true);
});
