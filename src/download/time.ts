// Decimal SI units, the same scale ISPs use for Mbit/s.
// 1 GB = 1 000 MB = 1 000 000 000 bytes. 1 byte = 8 bits.
// 1 Mbit/s = 1 000 000 bits/s. 1 MB/s = 8 Mbit/s.
// Duration = size in bits ÷ speed in bits per second.
// Nothing here is stored or sent.

export const BYTES_PER_MB = 1_000_000;
export const BYTES_PER_GB = 1_000_000_000;
export const BITS_PER_BYTE = 8;
export const BITS_PER_MEGABIT = 1_000_000;

export const SIZE_PRESETS_GB = [20, 50, 80, 100] as const;
export const SPEED_PRESETS_MBPS = [50, 100, 250, 1000] as const;

export const DEFAULT_SIZE = "50";
export const DEFAULT_SIZE_UNIT = "GB" as const;
export const DEFAULT_SPEED = "100";
export const DEFAULT_SPEED_UNIT = "Mbps" as const;

export type SizeUnit = "GB" | "MB";
export type SpeedUnit = "Mbps" | "MBps";

const AMOUNT = /^[+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/;

export type ParsedAmount = { kind: "empty" } | { kind: "invalid" } | { kind: "number"; value: number };

export function parseAmount(raw: string): ParsedAmount {
  const text = raw.trim();
  if (text === "") return { kind: "empty" };
  if (text.length > 32 || !AMOUNT.test(text)) return { kind: "invalid" };
  const value = Number(text.replace(",", "."));
  if (!Number.isFinite(value)) return { kind: "invalid" };
  return { kind: "number", value };
}

export function isSizeUnit(value: string): value is SizeUnit {
  return value === "GB" || value === "MB";
}

export function isSpeedUnit(value: string): value is SpeedUnit {
  return value === "Mbps" || value === "MBps";
}

export function sizeBytes(size: number, unit: SizeUnit): number {
  return size * (unit === "GB" ? BYTES_PER_GB : BYTES_PER_MB);
}

export function speedBitsPerSecond(speed: number, unit: SpeedUnit): number {
  const megabits = unit === "Mbps" ? speed : speed * BITS_PER_BYTE;
  return megabits * BITS_PER_MEGABIT;
}

export type DurationParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function splitDuration(roundedSeconds: number): DurationParts {
  const whole = Math.max(0, Math.round(roundedSeconds));
  return {
    days: Math.floor(whole / 86_400),
    hours: Math.floor((whole % 86_400) / 3_600),
    minutes: Math.floor((whole % 3_600) / 60),
    seconds: whole % 60,
  };
}

export type DurationWords = {
  dayOne: string;
  dayMany: string;
  hourOne: string;
  hourMany: string;
  minuteOne: string;
  minuteMany: string;
  secondOne: string;
  secondMany: string;
};

export function formatDuration(roundedSeconds: number, words: DurationWords): string {
  const parts = splitDuration(roundedSeconds);
  const chunks: string[] = [];
  const push = (count: number, one: string, many: string) => {
    if (count === 0) return;
    chunks.push(`${count} ${count === 1 ? one : many}`);
  };
  push(parts.days, words.dayOne, words.dayMany);
  push(parts.hours, words.hourOne, words.hourMany);
  push(parts.minutes, words.minuteOne, words.minuteMany);
  push(parts.seconds, words.secondOne, words.secondMany);
  if (chunks.length === 0) return `0 ${words.secondMany}`;
  return chunks.join(" ");
}

export type CalcInput = {
  sizeRaw: string;
  sizeUnit: string;
  speedRaw: string;
  speedUnit: string;
};

export type CalcOk = {
  ok: true;
  size: number;
  sizeUnit: SizeUnit;
  speed: number;
  speedUnit: SpeedUnit;
  bits: number;
  bitsPerSecond: number;
  totalSeconds: number;
  roundedSeconds: number;
  underOneSecond: boolean;
};

export type CalcFail = {
  ok: false;
  reason: "empty" | "invalid" | "zero-speed";
};

export type CalcResult = CalcOk | CalcFail;

export function calculateDownload(input: CalcInput): CalcResult {
  if (!isSizeUnit(input.sizeUnit) || !isSpeedUnit(input.speedUnit)) return { ok: false, reason: "invalid" };
  const size = parseAmount(input.sizeRaw);
  const speed = parseAmount(input.speedRaw);
  if (size.kind === "invalid" || speed.kind === "invalid") return { ok: false, reason: "invalid" };
  if (size.kind === "empty" || speed.kind === "empty") return { ok: false, reason: "empty" };
  if (speed.value === 0) return { ok: false, reason: "zero-speed" };

  const bytes = sizeBytes(size.value, input.sizeUnit);
  const bits = bytes * BITS_PER_BYTE;
  const bitsPerSecond = speedBitsPerSecond(speed.value, input.speedUnit);
  const exactSeconds = bits / bitsPerSecond;
  if (!Number.isFinite(bits) || !Number.isFinite(bitsPerSecond) || !Number.isFinite(exactSeconds)) {
    return { ok: false, reason: "invalid" };
  }
  const totalSeconds = Math.round(exactSeconds * 1000) / 1000;
  const roundedSeconds = Math.round(totalSeconds);
  if (!Number.isSafeInteger(roundedSeconds)) return { ok: false, reason: "invalid" };

  return {
    ok: true,
    size: size.value,
    sizeUnit: input.sizeUnit,
    speed: speed.value,
    speedUnit: input.speedUnit,
    bits,
    bitsPerSecond,
    totalSeconds,
    roundedSeconds,
    underOneSecond: exactSeconds > 0 && roundedSeconds === 0,
  };
}

function formatNumber(value: number, lang: "de" | "en"): string {
  return value.toLocaleString(lang === "de" ? "de-DE" : "en-US", {
    maximumFractionDigits: 3,
  });
}

export function formatFormula(
  result: CalcOk,
  lang: "de" | "en",
): string {
  const sizeText = `${formatNumber(result.size, lang)} ${result.sizeUnit}`;
  const speedText =
    result.speedUnit === "MBps"
      ? `(${formatNumber(result.speed, lang)} MB/s × 8)`
      : `${formatNumber(result.speed, lang)} Mbit/s`;
  const bits = lang === "de" ? "Bit/Byte" : "bits/byte";
  const seconds = formatNumber(result.totalSeconds, lang);
  return `${sizeText} × 8 ${bits} ÷ ${speedText} ≈ ${seconds} s`;
}
