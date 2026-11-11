import type { Chart } from "./beatmap.ts";
import type { Lane } from "./input.ts";
import { lanes, type FaceSymbol } from "./input.ts";
import type { JudgementName } from "./judgement.ts";

export type Flash = {
  lane: Lane;
  kind: JudgementName;
  at: number;
};

export type DrawModel = {
  chart: Chart;
  songMs: number;
  offsetMs: number;
  judged: ReadonlySet<number>;
  flashes: Flash[];
  judgement: { kind: JudgementName; at: number } | null;
  combo: number;
  reduced: boolean;
  labels: { perfect: string; good: string; miss: string };
};

const laneColor: Record<FaceSymbol, string> = {
  triangle: "#2f9a45",
  circle: "#e23b3b",
  cross: "#2f78e0",
  square: "#d24b96",
};

type Palette = { bg: string; fg: string; line: string; muted: string };

function palette(): Palette {
  const light = document.documentElement.dataset.theme === "light";
  return light
    ? { bg: "#fffcf8", fg: "#1a1714", line: "#e3dbd0", muted: "#746c62" }
    : { bg: "#10141c", fg: "#f3f5f8", line: "#2a3344", muted: "#8b95a6" };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawSymbol(ctx: CanvasRenderingContext2D, symbol: FaceSymbol, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.14);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  if (symbol === "triangle") {
    ctx.moveTo(x, y - size * 0.42);
    ctx.lineTo(x + size * 0.4, y + size * 0.32);
    ctx.lineTo(x - size * 0.4, y + size * 0.32);
    ctx.closePath();
    ctx.stroke();
  } else if (symbol === "circle") {
    ctx.arc(x, y, size * 0.34, 0, Math.PI * 2);
    ctx.stroke();
  } else if (symbol === "cross") {
    const arm = size * 0.32;
    ctx.moveTo(x - arm, y - arm);
    ctx.lineTo(x + arm, y + arm);
    ctx.moveTo(x + arm, y - arm);
    ctx.lineTo(x - arm, y + arm);
    ctx.stroke();
  } else {
    const half = size * 0.32;
    roundRect(ctx, x - half, y - half, half * 2, half * 2, size * 0.08);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFrame(canvas: HTMLCanvasElement, model: DrawModel) {
  const cssW = canvas.clientWidth;
  const cssH = canvas.clientHeight;
  if (cssW < 2 || cssH < 2) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixelW = Math.round(cssW * dpr);
  const pixelH = Math.round(cssH * dpr);
  if (canvas.width !== pixelW || canvas.height !== pixelH) {
    canvas.width = pixelW;
    canvas.height = pixelH;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = palette();
  ctx.clearRect(0, 0, cssW, cssH);
  roundRect(ctx, 0.5, 0.5, cssW - 1, cssH - 1, 16);
  ctx.fillStyle = colors.bg;
  ctx.fill();
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  const pad = 12;
  const innerW = cssW - pad * 2;
  const laneW = innerW / 4;
  const hitY = cssH * 0.8;
  const spawnY = 28;
  const now = performance.now();
  const adjusted = model.songMs - model.offsetMs;

  for (const info of lanes) {
    const x = pad + info.lane * laneW;
    const color = laneColor[info.symbol];
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(x, 16, laneW, hitY - 8);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.line;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(x + laneW, 16);
    ctx.lineTo(x + laneW, hitY + 28);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = colors.fg;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, hitY);
  ctx.lineTo(cssW - pad, hitY);
  ctx.stroke();
  ctx.globalAlpha = 1;

  for (const info of lanes) {
    const x = pad + info.lane * laneW;
    const color = laneColor[info.symbol];
    const flash = [...model.flashes].reverse().find((item) => item.lane === info.lane && now - item.at < 220);
    const cx = x + laneW / 2;
    const radius = Math.min(26, laneW * 0.28);
    if (flash && !model.reduced) {
      const age = (now - flash.at) / 220;
      ctx.beginPath();
      ctx.arc(cx, hitY, radius + age * 18, 0, Math.PI * 2);
      ctx.strokeStyle = flash.kind === "miss" ? "#c45252" : color;
      ctx.globalAlpha = 1 - age;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.arc(cx, hitY, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.bg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = flash ? (flash.kind === "miss" ? "#c45252" : color) : color;
    ctx.globalAlpha = flash ? 1 : 0.9;
    ctx.stroke();
    ctx.globalAlpha = 1;
    drawSymbol(ctx, info.symbol, cx, hitY, radius * 1.15, flash ? colors.fg : color);
  }

  const notes = model.chart.notes;
  for (let index = 0; index < notes.length; index += 1) {
    if (model.judged.has(index)) continue;
    const note = notes[index];
    if (!note) continue;
    const remain = note.timeMs - adjusted;
    if (remain > model.chart.approachMs || remain < -80) continue;
    const progress = 1 - remain / model.chart.approachMs;
    const y = spawnY + progress * (hitY - spawnY);
    const info = lanes[note.lane];
    if (!info) continue;
    const cx = pad + note.lane * laneW + laneW / 2;
    const radius = Math.min(22, laneW * 0.26);
    const color = laneColor[info.symbol];
    if (!model.reduced) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(cx, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    drawSymbol(ctx, info.symbol, cx, y, radius * 1.2, "#ffffff");
  }

  if (model.judgement && now - model.judgement.at < 650) {
    const age = (now - model.judgement.at) / 650;
    const label = model.labels[model.judgement.kind];
    ctx.save();
    ctx.globalAlpha = model.reduced ? 1 : 1 - Math.max(0, age - 0.55) / 0.45;
    ctx.fillStyle = model.judgement.kind === "miss" ? "#c45252" : colors.fg;
    ctx.font = `600 ${Math.max(22, cssW * 0.05)}px Outfit, "Source Sans 3", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const rise = model.reduced ? 0 : age * 16;
    ctx.fillText(label, cssW / 2, hitY - 64 - rise);
    ctx.restore();
  }

  if (model.combo >= 2 && model.judgement && model.judgement.kind !== "miss" && now - model.judgement.at < 700) {
    ctx.save();
    ctx.fillStyle = colors.fg;
    ctx.font = `600 ${Math.max(36, cssW * 0.08)}px Outfit, "Source Sans 3", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const scale = model.reduced ? 1 : 1 + Math.max(0, 0.18 - ((now - model.judgement.at) / 700) * 0.18);
    ctx.translate(cssW / 2, cssH * 0.18);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.95;
    ctx.fillText(String(model.combo), 0, 0);
    ctx.restore();
  }
}
