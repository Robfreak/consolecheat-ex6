import assert from "node:assert/strict";
import test from "node:test";
import { copy } from "./messages.ts";
import {
  CONTROLLER_TESTER_HREF,
  controlLabel,
  controlOrder,
  controlsFor,
  nextLayout,
  slotFor,
} from "./layout.ts";

const shared = [
  "l1",
  "l2",
  "r1",
  "r2",
  "dpad",
  "lstick",
  "rstick",
  "cross",
  "circle",
  "square",
  "triangle",
  "options",
  "touchpad",
  "ps",
] as const;

test("both layouts list the shared controls and their own buttons", () => {
  for (const id of shared) {
    assert.ok(controlsFor("ds4").includes(id), id);
    assert.ok(controlsFor("dualsense").includes(id), id);
  }
  assert.ok(controlsFor("ds4").includes("share"));
  assert.equal(controlsFor("ds4").includes("create"), false);
  assert.equal(controlsFor("ds4").includes("mute"), false);
  assert.ok(controlsFor("dualsense").includes("create"));
  assert.ok(controlsFor("dualsense").includes("mute"));
  assert.equal(controlsFor("dualsense").includes("share"), false);
  assert.equal(CONTROLLER_TESTER_HREF, "https://robfreak.github.io/consolecheat-ex3/");
  assert.equal(slotFor("ps", "ds4").column, "4 / 6");
  assert.equal(slotFor("ps", "dualsense").column, "3 / 5");
  assert.equal(slotFor("mute", "dualsense").column, "5 / 7");
  assert.equal(slotFor("share", "ds4").column, slotFor("create", "dualsense").column);
});

test("arrow keys switch controller and the labels keep the symbol with the name", () => {
  assert.equal(nextLayout("ds4", "ArrowRight"), "dualsense");
  assert.equal(nextLayout("dualsense", "ArrowLeft"), "ds4");
  assert.equal(nextLayout("dualsense", "ArrowDown"), "ds4");
  assert.equal(nextLayout("ds4", "Home"), "ds4");
  assert.equal(nextLayout("ds4", "End"), "dualsense");
  assert.equal(nextLayout("ds4", "Enter"), null);
  assert.equal(controlLabel("×", "Kreuz"), "× Kreuz");
  assert.equal(controlLabel("L1", "L1"), "L1");
  assert.equal(controlLabel("≡", "Options"), "Options");
  assert.equal(controlLabel("+", "Steuerkreuz"), "Steuerkreuz");
  assert.equal(controlOrder.length, 17);
});

test("German and English name every control", () => {
  for (const id of controlOrder) {
    const german = copy.de.controls[id];
    const english = copy.en.controls[id];
    assert.ok(german.name.length > 0, id);
    assert.ok(english.name.length > 0, id);
    assert.ok(german.detail.length > 0, id);
    assert.ok(english.detail.length > 0, id);
    assert.notEqual(german.detail, english.detail, id);
  }
  assert.equal(copy.de.controls.cross.name, "Kreuz");
  assert.equal(copy.en.controls.cross.name, "Cross");
  assert.equal(copy.de.controls.circle.name, "Kreis");
  assert.equal(copy.en.controls.circle.name, "Circle");
  assert.equal(copy.de.controls.square.name, "Quadrat");
  assert.equal(copy.en.controls.square.name, "Square");
  assert.equal(copy.de.controls.triangle.name, "Dreieck");
  assert.equal(copy.en.controls.triangle.name, "Triangle");
  assert.equal(copy.de.controls.dpad.name, "Steuerkreuz");
  assert.equal(copy.en.controls.dpad.name, "D-pad");
  assert.match(copy.de.symbolNote, /Kreuz/);
  assert.match(copy.de.symbolNote, /Kreis/);
  assert.match(copy.de.symbolNote, /Quadrat/);
  assert.match(copy.de.symbolNote, /Dreieck/);
  assert.match(copy.de.symbolNote, /×/);
  assert.match(copy.en.symbolNote, /Cross/);
  assert.match(copy.en.symbolNote, /often X/);
  assert.match(copy.en.symbolNote, /often O/);
  assert.match(copy.de.controls.cross.detail, /×/);
  assert.match(copy.en.controls.cross.detail, /X/);
  assert.match(copy.de.controls.lstick.detail, /L3/);
  assert.match(copy.de.controls.rstick.detail, /R3/);
});
