import type { Lang } from "./messages.ts";

export function formatTime(ms: number): string {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatScore(score: number, lang: Lang): string {
  return Math.max(0, Math.round(score)).toLocaleString(lang === "de" ? "de-DE" : "en-US");
}

export function formatAccuracy(value: number, lang: Lang): string {
  return value.toLocaleString(lang === "de" ? "de-DE" : "en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatOffset(ms: number, lang: Lang): string {
  const rounded = Math.round(ms);
  const body = Math.abs(rounded).toLocaleString(lang === "de" ? "de-DE" : "en-US");
  if (rounded > 0) return `+${body}`;
  if (rounded < 0) return `−${body}`;
  return "0";
}
