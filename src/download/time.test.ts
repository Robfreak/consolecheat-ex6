import assert from "node:assert/strict";
import test from "node:test";
import { copy } from "./messages.ts";
import {
  BITS_PER_BYTE,
  BYTES_PER_GB,
  BYTES_PER_MB,
  DEFAULT_SIZE,
  DEFAULT_SIZE_UNIT,
  DEFAULT_SPEED,
  DEFAULT_SPEED_UNIT,
  SIZE_PRESETS_GB,
  SPEED_PRESETS_MBPS,
  calculateDownload,
  formatDuration,
  formatFormula,
  parseAmount,
  sizeBytes,
  speedBitsPerSecond,
  splitDuration,
  type DurationWords,
} from "./time.ts";

const deWords: DurationWords = {
  dayOne: copy.de.dayOne,
  dayMany: copy.de.dayMany,
  hourOne: copy.de.hourOne,
  hourMany: copy.de.hourMany,
  minuteOne: copy.de.minuteOne,
  minuteMany: copy.de.minuteMany,
  secondOne: copy.de.secondOne,
  secondMany: copy.de.secondMany,
};

const enWords: DurationWords = {
  dayOne: copy.en.dayOne,
  dayMany: copy.en.dayMany,
  hourOne: copy.en.hourOne,
  hourMany: copy.en.hourMany,
  minuteOne: copy.en.minuteOne,
  minuteMany: copy.en.minuteMany,
  secondOne: copy.en.secondOne,
  secondMany: copy.en.secondMany,
};

function seconds(sizeRaw: string, sizeUnit: string, speedRaw: string, speedUnit: string): number {
  const result = calculateDownload({ sizeRaw, sizeUnit, speedRaw, speedUnit });
  assert.equal(result.ok, true);
  if (!result.ok) return 0;
  return result.totalSeconds;
}

test("defaults and presets are the documented examples", () => {
  assert.equal(DEFAULT_SIZE, "50");
  assert.equal(DEFAULT_SIZE_UNIT, "GB");
  assert.equal(DEFAULT_SPEED, "100");
  assert.equal(DEFAULT_SPEED_UNIT, "Mbps");
  assert.deepEqual(SIZE_PRESETS_GB, [20, 50, 80, 100]);
  assert.deepEqual(SPEED_PRESETS_MBPS, [50, 100, 250, 1000]);
});

test("bytes and bits use decimal units and 8 bits per byte", () => {
  assert.equal(BYTES_PER_MB, 1_000_000);
  assert.equal(BYTES_PER_GB, 1_000_000_000);
  assert.equal(BITS_PER_BYTE, 8);
  assert.equal(sizeBytes(1, "MB"), 1_000_000);
  assert.equal(sizeBytes(1, "GB"), 1_000_000_000);
  assert.equal(sizeBytes(50, "GB"), 50_000_000_000);
  assert.equal(speedBitsPerSecond(1, "Mbps"), 1_000_000);
  assert.equal(speedBitsPerSecond(100, "Mbps"), 100_000_000);
  assert.equal(speedBitsPerSecond(1, "MBps"), 8_000_000);
  assert.equal(speedBitsPerSecond(1, "Mbps") * 8, speedBitsPerSecond(1, "MBps"));
});

test("size divided by speed matches across GB, MB, Mbit/s, and MB/s", () => {
  assert.equal(seconds("1", "MB", "1", "MBps"), 1);
  assert.equal(seconds("1", "MB", "8", "Mbps"), 1);
  assert.equal(seconds("1", "GB", "8", "Mbps"), 1000);
  assert.equal(seconds("1000", "MB", "8", "Mbps"), 1000);
  assert.equal(seconds("1", "GB", "1", "MBps"), 1000);
  assert.equal(seconds("50", "GB", "100", "Mbps"), 4000);
  assert.equal(seconds("20", "GB", "50", "Mbps"), 3200);
  assert.equal(seconds("80", "GB", "100", "Mbps"), 6400);
  assert.equal(seconds("100", "GB", "1000", "Mbps"), 800);
  assert.equal(seconds("80", "GB", "250", "Mbps"), 2560);
  assert.equal(seconds("12,5", "GB", "100", "Mbps"), 1000);
  assert.equal(seconds("12.5", "GB", "100", "Mbps"), 1000);
  assert.equal(seconds("1", "MB", "100", "Mbps"), 0.08);

  const fifty = calculateDownload({ sizeRaw: "50", sizeUnit: "GB", speedRaw: "100", speedUnit: "Mbps" });
  assert.equal(fifty.ok, true);
  if (!fifty.ok) return;
  assert.equal(fifty.bits, 400_000_000_000);
  assert.equal(fifty.bitsPerSecond, 100_000_000);
  assert.equal(fifty.roundedSeconds, 4000);
  assert.equal(fifty.underOneSecond, false);
  assert.equal(formatDuration(fifty.roundedSeconds, deWords), "1 Stunde 6 Minuten 40 Sekunden");
  assert.equal(formatDuration(fifty.roundedSeconds, enWords), "1 hour 6 minutes 40 seconds");
  assert.equal(formatFormula(fifty, "de"), "50 GB × 8 Bit/Byte ÷ 100 Mbit/s ≈ 4.000 s");
  assert.equal(formatFormula(fifty, "en"), "50 GB × 8 bits/byte ÷ 100 Mbit/s ≈ 4,000 s");

  const megabyte = calculateDownload({ sizeRaw: "1", sizeUnit: "GB", speedRaw: "1", speedUnit: "MBps" });
  assert.equal(megabyte.ok, true);
  if (!megabyte.ok) return;
  assert.equal(formatFormula(megabyte, "de"), "1 GB × 8 Bit/Byte ÷ (1 MB/s × 8) ≈ 1.000 s");
  assert.equal(formatFormula(megabyte, "en"), "1 GB × 8 bits/byte ÷ (1 MB/s × 8) ≈ 1,000 s");

  const fraction = calculateDownload({ sizeRaw: "12,5", sizeUnit: "GB", speedRaw: "100", speedUnit: "Mbps" });
  assert.equal(fraction.ok, true);
  if (!fraction.ok) return;
  assert.equal(formatFormula(fraction, "de"), "12,5 GB × 8 Bit/Byte ÷ 100 Mbit/s ≈ 1.000 s");

  const blink = calculateDownload({ sizeRaw: "1", sizeUnit: "MB", speedRaw: "100", speedUnit: "Mbps" });
  assert.equal(blink.ok, true);
  if (!blink.ok) return;
  assert.equal(blink.underOneSecond, true);
  assert.equal(blink.roundedSeconds, 0);
  assert.equal(formatFormula(blink, "de"), "1 MB × 8 Bit/Byte ÷ 100 Mbit/s ≈ 0,08 s");
});

test("durations drop zero parts and pluralize", () => {
  assert.deepEqual(splitDuration(4000), { days: 0, hours: 1, minutes: 6, seconds: 40 });
  assert.equal(formatDuration(90, deWords), "1 Minute 30 Sekunden");
  assert.equal(formatDuration(3600, enWords), "1 hour");
  assert.equal(formatDuration(45, deWords), "45 Sekunden");
  assert.equal(formatDuration(1, enWords), "1 second");
  assert.equal(formatDuration(2, deWords), "2 Sekunden");
  assert.equal(formatDuration(0, deWords), "0 Sekunden");
  assert.equal(formatDuration(0, enWords), "0 seconds");
  assert.equal(formatDuration(86_400 + 3661, deWords), "1 Tag 1 Stunde 1 Minute 1 Sekunde");
  assert.equal(formatDuration(172_800, enWords), "2 days");
  assert.equal(formatDuration(800, enWords), "13 minutes 20 seconds");
  assert.equal(formatDuration(3200, deWords), "53 Minuten 20 Sekunden");
});

test("zero, empty, and invalid input do not invent a duration", () => {
  assert.deepEqual(parseAmount(""), { kind: "empty" });
  assert.deepEqual(parseAmount("   "), { kind: "empty" });
  assert.deepEqual(parseAmount("50"), { kind: "number", value: 50 });
  assert.deepEqual(parseAmount("  12,5 "), { kind: "number", value: 12.5 });
  assert.deepEqual(parseAmount("1."), { kind: "number", value: 1 });
  assert.deepEqual(parseAmount(",5"), { kind: "number", value: 0.5 });
  assert.deepEqual(parseAmount("0"), { kind: "number", value: 0 });
  assert.deepEqual(parseAmount("0,0"), { kind: "number", value: 0 });
  assert.deepEqual(parseAmount("abc"), { kind: "invalid" });
  assert.deepEqual(parseAmount("-1"), { kind: "invalid" });
  assert.deepEqual(parseAmount("1e2"), { kind: "invalid" });
  assert.deepEqual(parseAmount("1.2.3"), { kind: "invalid" });
  assert.deepEqual(parseAmount("."), { kind: "invalid" });
  assert.deepEqual(parseAmount("Infinity"), { kind: "invalid" });
  assert.deepEqual(parseAmount("NaN"), { kind: "invalid" });
  assert.equal(parseAmount("1".repeat(33)).kind, "invalid");

  const zeroSize = calculateDownload({ sizeRaw: "0", sizeUnit: "GB", speedRaw: "100", speedUnit: "Mbps" });
  assert.equal(zeroSize.ok, true);
  if (zeroSize.ok) {
    assert.equal(zeroSize.totalSeconds, 0);
    assert.equal(zeroSize.roundedSeconds, 0);
    assert.equal(zeroSize.underOneSecond, false);
    assert.equal(formatDuration(zeroSize.roundedSeconds, deWords), "0 Sekunden");
  }

  assert.deepEqual(
    calculateDownload({ sizeRaw: "50", sizeUnit: "GB", speedRaw: "0", speedUnit: "Mbps" }),
    { ok: false, reason: "zero-speed" },
  );
  assert.deepEqual(
    calculateDownload({ sizeRaw: "0", sizeUnit: "MB", speedRaw: "0,0", speedUnit: "MBps" }),
    { ok: false, reason: "zero-speed" },
  );
  assert.deepEqual(
    calculateDownload({ sizeRaw: "", sizeUnit: "GB", speedRaw: "100", speedUnit: "Mbps" }),
    { ok: false, reason: "empty" },
  );
  assert.deepEqual(
    calculateDownload({ sizeRaw: "50", sizeUnit: "GB", speedRaw: "   ", speedUnit: "Mbps" }),
    { ok: false, reason: "empty" },
  );
  assert.deepEqual(
    calculateDownload({ sizeRaw: "", sizeUnit: "GB", speedRaw: "", speedUnit: "Mbps" }),
    { ok: false, reason: "empty" },
  );
  assert.deepEqual(
    calculateDownload({ sizeRaw: "abc", sizeUnit: "GB", speedRaw: "", speedUnit: "Mbps" }),
    { ok: false, reason: "invalid" },
  );
  assert.deepEqual(
    calculateDownload({ sizeRaw: "nope", sizeUnit: "GB", speedRaw: "100", speedUnit: "Mbps" }),
    { ok: false, reason: "invalid" },
  );
  assert.deepEqual(
    calculateDownload({ sizeRaw: "-5", sizeUnit: "MB", speedRaw: "10", speedUnit: "Mbps" }),
    { ok: false, reason: "invalid" },
  );
  assert.deepEqual(
    calculateDownload({ sizeRaw: "1", sizeUnit: "gb", speedRaw: "8", speedUnit: "Mbps" }),
    { ok: false, reason: "invalid" },
  );
  assert.deepEqual(
    calculateDownload({ sizeRaw: "1", sizeUnit: "GB", speedRaw: "1", speedUnit: "mbps" }),
    { ok: false, reason: "invalid" },
  );

  const huge = calculateDownload({
    sizeRaw: "999999999999999",
    sizeUnit: "GB",
    speedRaw: "0.001",
    speedUnit: "Mbps",
  });
  assert.deepEqual(huge, { ok: false, reason: "invalid" });
});
