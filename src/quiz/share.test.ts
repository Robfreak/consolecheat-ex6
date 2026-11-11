import assert from "node:assert/strict";
import test from "node:test";
import { drawShareCard, renderShareCard, SHARE_FONTS, SHARE_HEIGHT, SHARE_WIDTH, type ShareCanvas, type ShareCard } from "./share.ts";

const card: ShareCard = {
  brand: "consolecheat",
  title: "PS-Plus-Quiz",
  scoreLabel: "Punkte",
  score: "480",
  streakLabel: "Serie",
  streak: "4",
  modeLabel: "Klassisch · Zeitdruck",
  detail: "8 von 10 richtig.",
  unofficial: "Inoffiziell. Nicht von Sony.",
};

function mockCanvas() {
  const order: string[] = [];
  const props: Record<string, unknown> = {};
  const ctx = new Proxy(props, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (prop in target) return target[prop];
      return (...args: unknown[]) => {
        order.push(`${prop}:${args.map(String).join("|")}`);
      };
    },
    set(target, prop, value) {
      if (typeof prop === "string") {
        target[prop] = value;
        order.push(`${prop}:${String(value)}`);
      }
      return true;
    },
  }) as ShareCanvas;
  return { ctx, order };
}

test("the share card draws score, streak, mode, and the consolecheat name", () => {
  const { ctx, order } = mockCanvas();
  drawShareCard(ctx, card);
  const texts = order.filter((line) => line.startsWith("fillText:")).map((line) => line.slice("fillText:".length));
  assert.ok(texts.some((line) => line.startsWith("consolecheat")));
  assert.ok(texts.some((line) => line.startsWith("PS-Plus-Quiz")));
  assert.ok(texts.some((line) => line.includes("480")));
  assert.ok(texts.some((line) => line.includes("Serie 4")));
  assert.ok(texts.some((line) => line.startsWith("Klassisch · Zeitdruck")));
  const fonts = order.filter((line) => line.startsWith("font:")).map((line) => line.slice("font:".length));
  assert.ok(fonts.some((font) => font.includes("Outfit")));
  assert.ok(fonts.some((font) => font.includes("Source Sans 3")));
  assert.equal(SHARE_WIDTH, 1200);
  assert.equal(SHARE_HEIGHT, 630);
});

test("self-hosted fonts are loaded before the card is drawn", async () => {
  const { ctx, order } = mockCanvas();
  const loaded: string[] = [];
  await renderShareCard(ctx, card, {
    async load(spec) {
      loaded.push(spec);
      order.push(`load:${spec}`);
    },
  });
  assert.deepEqual(loaded, [...SHARE_FONTS]);
  const firstDraw = order.findIndex((line) => line.startsWith("fillText:") || line.startsWith("fillRect:"));
  const lastLoad = order.findLastIndex((line) => line.startsWith("load:"));
  assert.ok(lastLoad >= 0 && firstDraw > lastLoad);
  assert.ok(loaded.some((spec) => spec.includes("Outfit")));
  assert.ok(loaded.some((spec) => spec.includes("Source Sans 3")));
});
