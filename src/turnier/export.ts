import { bracketSize, roundCount } from "./bracket.ts";
import { MAX_PLAYERS, MIN_PLAYERS } from "./types.ts";

export const PNG_FILENAME = "consolecheat-turnier.png";

export type ExportSize = {
  width: number;
  height: number;
  filename: string;
};

export type DrawCtx = {
  fillStyle: string;
  strokeStyle: string;
  font: string;
  textAlign: string;
  textBaseline: string;
  lineWidth: number;
  fillRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
};

export type CanvasLike = {
  width: number;
  height: number;
  getContext(kind: "2d"): unknown;
};

export type LeagueExport = {
  kind: "league";
  title: string;
  modeLabel: string;
  brand: string;
  unofficial: string;
  winner: string;
  columns: string[];
  rows: {
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals: string;
    diff: string;
    points: number;
  }[];
};

export type BracketExport = {
  kind: "ko";
  title: string;
  modeLabel: string;
  brand: string;
  unofficial: string;
  winner: string;
  playerCount: number;
  rounds: {
    title: string;
    matches: { top: string; bottom: string; score: string }[];
  }[];
};

export type ExportModel = LeagueExport | BracketExport;

export function leagueExportSize(playerCount: number): ExportSize {
  const rows = Math.max(1, playerCount);
  return {
    width: 1100,
    height: 168 + 48 * (rows + 1) + 56,
    filename: PNG_FILENAME,
  };
}

export function bracketExportSize(playerCount: number): ExportSize {
  const count = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, playerCount));
  const size = bracketSize(count);
  const rounds = roundCount(count);
  return {
    width: 64 + rounds * 260,
    height: 120 + (size / 2) * 78 + 48,
    filename: PNG_FILENAME,
  };
}

function paintChrome(ctx: DrawCtx, width: number, height: number, model: ExportModel): void {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#07090e";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#0070d1";
  ctx.fillRect(0, 0, width, 14);
  ctx.fillStyle = "#7eb6ff";
  ctx.font = "600 28px Outfit, sans-serif";
  ctx.fillText(model.brand, 40, 58);
  ctx.fillStyle = "#f3f5f8";
  ctx.font = "600 40px Outfit, sans-serif";
  ctx.fillText(model.title || model.modeLabel, 40, 108);
  ctx.fillStyle = "#a7b0c0";
  ctx.font = "500 22px Source Sans 3, sans-serif";
  ctx.fillText(model.modeLabel, 40, 142);
}

export function drawExport(ctx: DrawCtx, model: ExportModel): void {
  if (model.kind === "league") drawLeague(ctx, model);
  else drawBracket(ctx, model);
}

function drawLeague(ctx: DrawCtx, model: LeagueExport): void {
  const size = leagueExportSize(model.rows.length);
  paintChrome(ctx, size.width, size.height, model);
  const headers = ["#", "", ...model.columns];
  const widths = [48, 280, 70, 70, 70, 70, 120, 90, 80];
  let x = 40;
  const headY = 196;
  ctx.fillStyle = "#10141c";
  ctx.fillRect(32, 168, size.width - 64, 44 + model.rows.length * 48);
  ctx.font = "600 18px Outfit, sans-serif";
  ctx.fillStyle = "#7eb6ff";
  headers.forEach((header, index) => {
    ctx.fillText(header, x, headY);
    x += widths[index] ?? 80;
  });
  model.rows.forEach((row, index) => {
    const y = 196 + 48 * (index + 1);
    const cells = [
      String(index + 1),
      row.name,
      String(row.played),
      String(row.won),
      String(row.drawn),
      String(row.lost),
      row.goals,
      row.diff,
      String(row.points),
    ];
    let cellX = 40;
    ctx.fillStyle = index === 0 ? "#f6d27a" : "#f3f5f8";
    ctx.font = index === 0 ? "600 20px Source Sans 3, sans-serif" : "500 20px Source Sans 3, sans-serif";
    cells.forEach((cell, cellIndex) => {
      ctx.fillText(cell, cellX, y);
      cellX += widths[cellIndex] ?? 80;
    });
  });
  if (model.winner) {
    ctx.fillStyle = "#8fceab";
    ctx.font = "600 22px Outfit, sans-serif";
    ctx.fillText(model.winner, 40, size.height - 28);
  }
  ctx.fillStyle = "#7c8696";
  ctx.font = "500 16px Source Sans 3, sans-serif";
  ctx.fillText(model.unofficial, size.width - 280, 58);
}

function drawBracket(ctx: DrawCtx, model: BracketExport): void {
  const size = bracketExportSize(model.playerCount);
  paintChrome(ctx, size.width, size.height, model);
  model.rounds.forEach((round, roundIndex) => {
    const x = 40 + roundIndex * 260;
    ctx.fillStyle = "#7eb6ff";
    ctx.font = "600 18px Outfit, sans-serif";
    ctx.fillText(round.title, x, 180);
    const span = Math.max(1, model.rounds[0]?.matches.length ?? 1) / Math.max(1, round.matches.length);
    round.matches.forEach((match, matchIndex) => {
      const y = 200 + matchIndex * span * 78 + ((span - 1) * 78) / 2;
      ctx.fillStyle = "#10141c";
      ctx.fillRect(x, y, 220, 64);
      ctx.strokeStyle = "#2a3344";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 220, 64);
      ctx.fillStyle = "#f3f5f8";
      ctx.font = "600 16px Source Sans 3, sans-serif";
      ctx.fillText(match.top, x + 12, y + 24);
      ctx.fillText(match.bottom, x + 12, y + 48);
      ctx.fillStyle = "#f6d27a";
      ctx.font = "600 16px Outfit, sans-serif";
      ctx.fillText(match.score, x + 150, y + 36);
    });
  });
  if (model.winner) {
    ctx.fillStyle = "#8fceab";
    ctx.font = "600 22px Outfit, sans-serif";
    ctx.fillText(model.winner, 40, size.height - 24);
  }
  ctx.fillStyle = "#7c8696";
  ctx.font = "500 16px Source Sans 3, sans-serif";
  ctx.fillText(model.unofficial, size.width - 280, 58);
}

export function renderTournamentPng(canvas: CanvasLike, model: ExportModel): ExportSize {
  const size = model.kind === "league" ? leagueExportSize(model.rows.length) : bracketExportSize(model.playerCount);
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  if (isDrawCtx(ctx)) drawExport(ctx, model);
  return { width: canvas.width, height: canvas.height, filename: PNG_FILENAME };
}

function isDrawCtx(value: unknown): value is DrawCtx {
  if (!value || typeof value !== "object") return false;
  const ctx = value as DrawCtx;
  return typeof ctx.fillRect === "function" && typeof ctx.fillText === "function" && typeof ctx.strokeRect === "function";
}
