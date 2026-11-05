import assert from "node:assert/strict";
import test from "node:test";
import {
  enterFullscreen,
  exitFullscreen,
  isFullscreen,
  toggleFullscreen,
  type FullscreenHost,
  type FullscreenTarget,
} from "./fullscreen.ts";

function host(): FullscreenHost & { element: Element | null } {
  return {
    element: null,
    get fullscreenElement() {
      return this.element;
    },
    set fullscreenElement(value: Element | null) {
      this.element = value;
    },
    webkitFullscreenElement: null,
    async exitFullscreen() {
      this.element = null;
      this.webkitFullscreenElement = null;
    },
  };
}

test("toggleFullscreen enters and then exits", async () => {
  const doc = host();
  const marker = {} as Element;
  const target: FullscreenTarget = {
    async requestFullscreen() {
      doc.fullscreenElement = marker;
    },
  };
  const entered = await toggleFullscreen(target, doc);
  assert.deepEqual(entered, { ok: true, active: true });
  assert.equal(isFullscreen(doc), true);
  const exited = await toggleFullscreen(target, doc);
  assert.deepEqual(exited, { ok: true, active: false });
  assert.equal(isFullscreen(doc), false);
});

test("missing fullscreen API and a rejected request are reported", async () => {
  const doc = host();
  const missing = await enterFullscreen({}, doc);
  assert.deepEqual(missing, { ok: false, reason: "unavailable" });
  const rejected = await enterFullscreen(
    {
      requestFullscreen() {
        throw new Error("not allowed");
      },
    },
    doc,
  );
  assert.deepEqual(rejected, { ok: false, reason: "rejected" });
  assert.equal(isFullscreen(doc), false);
});

test("webkit fullscreen methods are used when the standard ones are missing", async () => {
  const doc = host();
  doc.exitFullscreen = undefined;
  doc.webkitExitFullscreen = () => {
    doc.webkitFullscreenElement = null;
  };
  const target: FullscreenTarget = {
    webkitRequestFullscreen() {
      doc.webkitFullscreenElement = {} as Element;
    },
  };
  const entered = await toggleFullscreen(target, doc);
  assert.deepEqual(entered, { ok: true, active: true });
  const exited = await exitFullscreen(doc);
  assert.deepEqual(exited, { ok: true, active: false });
});
