import type { Copy, Lang } from "./messages.ts";
import {
  SIZE_PRESETS_GB,
  SPEED_PRESETS_MBPS,
  calculateDownload,
  formatDuration,
  formatFormula,
  parseAmount,
  type DurationWords,
  type SizeUnit,
  type SpeedUnit,
} from "./time.ts";

export function Calculator({
  text,
  lang,
  sizeRaw,
  sizeUnit,
  speedRaw,
  speedUnit,
  onSizeRaw,
  onSizeUnit,
  onSpeedRaw,
  onSpeedUnit,
}: {
  text: Copy;
  lang: Lang;
  sizeRaw: string;
  sizeUnit: SizeUnit;
  speedRaw: string;
  speedUnit: SpeedUnit;
  onSizeRaw: (value: string) => void;
  onSizeUnit: (unit: SizeUnit) => void;
  onSpeedRaw: (value: string) => void;
  onSpeedUnit: (unit: SpeedUnit) => void;
}) {
  const result = calculateDownload({ sizeRaw, sizeUnit, speedRaw, speedUnit });
  const sizeParsed = parseAmount(sizeRaw);
  const speedParsed = parseAmount(speedRaw);
  const headline = resultText(result, text);
  const formula = result.ok ? formatFormula(result, lang) : "";

  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:items-start">
      <section className="panel rounded-xl px-4 py-5 sm:px-6" aria-labelledby="calc-heading">
        <h2 id="calc-heading" className="font-display text-2xl font-semibold tracking-tight">
          {text.calcHeading}
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-end">
          <div className="min-w-0">
            <label htmlFor="game-size" className="text-sm text-subtle">
              {text.sizeLabel}
            </label>
            <input
              id="game-size"
              data-testid="size"
              className="field mt-1"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              maxLength={24}
              value={sizeRaw}
              aria-invalid={sizeParsed.kind === "invalid" ? true : undefined}
              aria-controls="download-result"
              onChange={(event) => onSizeRaw(event.target.value)}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="size-unit" className="text-sm text-subtle">
              {text.sizeUnitLabel}
            </label>
            <select
              id="size-unit"
              data-testid="size-unit"
              className="field mt-1"
              value={sizeUnit}
              onChange={(event) => {
                if (event.target.value === "GB" || event.target.value === "MB") onSizeUnit(event.target.value);
              }}
            >
              <option value="GB">{text.unitGB}</option>
              <option value="MB">{text.unitMB}</option>
            </select>
          </div>
        </div>
        <div role="group" aria-label={text.sizePresetsLabel} className="mt-3 flex flex-wrap gap-2">
          {SIZE_PRESETS_GB.map((preset) => {
            const pressed = sizeParsed.kind === "number" && sizeParsed.value === preset && sizeUnit === "GB";
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={pressed}
                className={`btn whitespace-nowrap ${pressed ? "btn-primary" : "btn-ghost"}`}
                onClick={() => {
                  onSizeRaw(String(preset));
                  onSizeUnit("GB");
                }}
              >
                {preset} {text.unitGB}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-end">
          <div className="min-w-0">
            <label htmlFor="line-speed" className="text-sm text-subtle">
              {text.speedLabel}
            </label>
            <input
              id="line-speed"
              data-testid="speed"
              className="field mt-1"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              maxLength={24}
              value={speedRaw}
              aria-invalid={speedParsed.kind === "invalid" ? true : undefined}
              aria-controls="download-result"
              onChange={(event) => onSpeedRaw(event.target.value)}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="speed-unit" className="text-sm text-subtle">
              {text.speedUnitLabel}
            </label>
            <select
              id="speed-unit"
              data-testid="speed-unit"
              className="field mt-1"
              value={speedUnit}
              onChange={(event) => {
                if (event.target.value === "Mbps" || event.target.value === "MBps") onSpeedUnit(event.target.value);
              }}
            >
              <option value="Mbps">{text.unitMbps}</option>
              <option value="MBps">{text.unitMBps}</option>
            </select>
          </div>
        </div>
        <div role="group" aria-label={text.speedPresetsLabel} className="mt-3 flex flex-wrap gap-2">
          {SPEED_PRESETS_MBPS.map((preset) => {
            const pressed = speedParsed.kind === "number" && speedParsed.value === preset && speedUnit === "Mbps";
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={pressed}
                className={`btn whitespace-nowrap ${pressed ? "btn-primary" : "btn-ghost"}`}
                onClick={() => {
                  onSpeedRaw(String(preset));
                  onSpeedUnit("Mbps");
                }}
              >
                {preset} {text.unitMbps}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel rounded-xl px-4 py-5 sm:px-6" aria-labelledby="result-heading">
        <h2 id="result-heading" className="text-sm font-medium text-subtle">
          {text.resultLabel}
        </h2>
        <p
          id="download-result"
          data-testid="result"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={
            result.ok
              ? "mt-3 break-anywhere font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
              : "mt-3 text-lg leading-relaxed text-muted"
          }
        >
          {headline}
        </p>
        {formula ? <p className="mt-4 break-anywhere font-mono text-sm leading-relaxed text-fg">{formula}</p> : null}
        {result.ok ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-muted">{text.formulaNote}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{text.estimateNote}</p>
          </>
        ) : null}
      </section>
    </div>
  );
}

function durationWords(text: Copy): DurationWords {
  return {
    dayOne: text.dayOne,
    dayMany: text.dayMany,
    hourOne: text.hourOne,
    hourMany: text.hourMany,
    minuteOne: text.minuteOne,
    minuteMany: text.minuteMany,
    secondOne: text.secondOne,
    secondMany: text.secondMany,
  };
}

function resultText(result: ReturnType<typeof calculateDownload>, text: Copy): string {
  if (!result.ok) {
    if (result.reason === "empty") return text.resultEmpty;
    if (result.reason === "zero-speed") return text.resultZeroSpeed;
    return text.resultInvalid;
  }
  if (result.underOneSecond) return text.underOneSecond;
  return formatDuration(result.roundedSeconds, durationWords(text));
}
