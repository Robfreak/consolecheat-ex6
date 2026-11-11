import assert from "node:assert/strict";
import test from "node:test";
import { PNG_FILENAME, bracketExportSize, leagueExportSize, renderTournamentPng, type DrawCtx, type ExportModel } from "./export.ts";
import { prefersReducedMotion, seedParticles, stepParticles } from "./confetti.ts";

function mockCanvas() {
  const texts: string[] = [];
  const ctx: DrawCtx = {
    fillStyle: "",
    strokeStyle: "",
    font: "",
    textAlign: "left",
    textBaseline: "alphabetic",
    lineWidth: 1,
    fillRect() {},
    fillText(text) {
      texts.push(text);
    },
    strokeRect() {},
  };
  return {
    texts,
    canvas: {
      width: 0,
      height: 0,
      getContext() {
        return ctx;
      },
    },
  };
}

test("png export sizes grow with the field and use the consolecheat filename", () => {
  const small = leagueExportSize(2);
  const large = leagueExportSize(16);
  assert.equal(small.filename, PNG_FILENAME);
  assert.equal(large.filename, "consolecheat-turnier.png");
  assert.equal(small.width, large.width);
  assert.ok(large.height > small.height);
  assert.equal(small.width, 1100);
  assert.ok(small.height > 200);

  const two = bracketExportSize(2);
  const eight = bracketExportSize(8);
  const nine = bracketExportSize(9);
  assert.equal(two.filename, PNG_FILENAME);
  assert.ok(eight.width > two.width);
  assert.ok(nine.width > eight.width);
  assert.ok(eight.height > two.height);
  assert.equal(bracketExportSize(5).width, eight.width);
  assert.equal(bracketExportSize(5).height, eight.height);
});

test("a mocked canvas receives the tournament drawing at those dimensions", () => {
  const league: ExportModel = {
    kind: "league",
    title: "Sofa-Liga",
    modeLabel: "Liga",
    brand: "consolecheat",
    unofficial: "Inoffiziell. Nicht von Sony.",
    winner: "Sieger: Ada",
    columns: ["Sp", "S", "U", "N", "Tore", "Diff", "Pkt"],
    rows: [
      { name: "Ada", played: 1, won: 1, drawn: 0, lost: 0, goals: "2:0", diff: "+2", points: 3 },
      { name: "Bea", played: 1, won: 0, drawn: 0, lost: 1, goals: "0:2", diff: "-2", points: 0 },
    ],
  };
  const leagueCanvas = mockCanvas();
  const leagueSize = renderTournamentPng(leagueCanvas.canvas, league);
  assert.deepEqual(leagueSize, leagueExportSize(2));
  assert.equal(leagueCanvas.canvas.width, leagueSize.width);
  assert.equal(leagueCanvas.canvas.height, leagueSize.height);
  assert.ok(leagueCanvas.texts.includes("Sofa-Liga"));
  assert.ok(leagueCanvas.texts.includes("Ada"));
  assert.ok(leagueCanvas.texts.includes("Sp"));

  const bracket: ExportModel = {
    kind: "ko",
    title: "Sofa-Cup",
    modeLabel: "K.-o.",
    brand: "consolecheat",
    unofficial: "Inoffiziell. Nicht von Sony.",
    winner: "",
    playerCount: 3,
    rounds: [
      {
        title: "Halbfinale",
        matches: [
          { top: "Ada", bottom: "Freilos", score: "" },
          { top: "Bea", bottom: "Cleo", score: "" },
        ],
      },
    ],
  };
  const bracketCanvas = mockCanvas();
  const bracketSize = renderTournamentPng(bracketCanvas.canvas, bracket);
  assert.deepEqual(bracketSize, bracketExportSize(3));
  assert.ok(bracketCanvas.texts.includes("Sofa-Cup"));
  assert.ok(bracketCanvas.texts.includes("Freilos"));
});

test("confetti respects reduced motion and stays on the canvas", () => {
  assert.equal(prefersReducedMotion(() => ({ matches: true })), true);
  assert.equal(prefersReducedMotion(() => ({ matches: false })), false);
  assert.equal(prefersReducedMotion(() => null), false);
  let n = 0;
  const particles = seedParticles(12, 390, () => {
    n += 0.17;
    return n % 1;
  });
  assert.equal(particles.length, 12);
  const next = stepParticles(particles, 800);
  assert.ok(next.every((particle, index) => particle.y > (particles[index]?.y ?? 0)));
  assert.ok(next.every((particle) => particle.life < 1));
});
