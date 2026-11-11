export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;

export const SHARE_FONTS = ['600 64px "Outfit"', '600 36px "Outfit"', '500 28px "Source Sans 3"'] as const;

export type FontLoader = {
  load(spec: string): Promise<unknown>;
};

export type ShareCanvas = {
  font: string;
  fillStyle: string | CanvasGradient | CanvasPattern;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  fillRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  closePath(): void;
  fill(): void;
};

export type ShareCard = {
  brand: string;
  title: string;
  scoreLabel: string;
  score: string;
  streakLabel: string;
  streak: string;
  modeLabel: string;
  detail: string;
  unofficial: string;
};

function drawFlame(ctx: ShareCanvas, x: number, y: number) {
  ctx.fillStyle = "#e07a2f";
  ctx.beginPath();
  ctx.moveTo(x + 16, y);
  ctx.quadraticCurveTo(x + 34, y + 16, x + 26, y + 36);
  ctx.quadraticCurveTo(x + 22, y + 48, x + 16, y + 52);
  ctx.quadraticCurveTo(x + 10, y + 48, x + 6, y + 36);
  ctx.quadraticCurveTo(x - 2, y + 16, x + 16, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f6d27a";
  ctx.beginPath();
  ctx.moveTo(x + 16, y + 18);
  ctx.quadraticCurveTo(x + 24, y + 30, x + 16, y + 42);
  ctx.quadraticCurveTo(x + 8, y + 30, x + 16, y + 18);
  ctx.closePath();
  ctx.fill();
}

export function drawShareCard(ctx: ShareCanvas, card: ShareCard): void {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#07090e";
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);
  ctx.fillStyle = "#0070d1";
  ctx.fillRect(0, 0, SHARE_WIDTH, 16);
  ctx.fillStyle = "#10141c";
  ctx.fillRect(48, 48, SHARE_WIDTH - 96, SHARE_HEIGHT - 96);
  ctx.fillStyle = "#7eb6ff";
  ctx.font = '600 36px "Outfit"';
  ctx.fillText(card.brand, 80, 118);
  ctx.fillStyle = "#7c8696";
  ctx.font = '500 22px "Source Sans 3"';
  ctx.fillText(card.unofficial, 720, 114);
  ctx.fillStyle = "#f3f5f8";
  ctx.font = '600 64px "Outfit"';
  ctx.fillText(card.title, 80, 200);
  ctx.fillStyle = "#a7b0c0";
  ctx.font = '500 28px "Source Sans 3"';
  ctx.fillText(card.scoreLabel, 80, 278);
  ctx.fillStyle = "#f3f5f8";
  ctx.font = '600 112px "Outfit"';
  ctx.fillText(card.score, 80, 400);
  drawFlame(ctx, 80, 430);
  ctx.fillStyle = "#f3f5f8";
  ctx.font = '600 36px "Outfit"';
  ctx.fillText(`${card.streakLabel} ${card.streak}`, 132, 478);
  ctx.fillStyle = "#7eb6ff";
  ctx.font = '500 28px "Source Sans 3"';
  ctx.fillText(card.modeLabel, 80, 540);
  ctx.fillStyle = "#a7b0c0";
  ctx.font = '500 28px "Source Sans 3"';
  ctx.fillText(card.detail, 80, 582);
}

export async function renderShareCard(ctx: ShareCanvas, card: ShareCard, fonts: FontLoader | null): Promise<void> {
  if (fonts) await Promise.all(SHARE_FONTS.map((spec) => fonts.load(spec)));
  drawShareCard(ctx, card);
}
