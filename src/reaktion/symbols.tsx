import type { FaceSymbol } from "./rules.ts";

export function FaceMark({ symbol, live = false }: { symbol: FaceSymbol; live?: boolean }) {
  const className = `face-svg sym-${symbol}${live ? " face-live" : ""}`;
  if (symbol === "cross") {
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
        <path d="M32 32 L88 88 M88 32 L32 88" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
      </svg>
    );
  }
  if (symbol === "circle") {
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
        <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="14" />
      </svg>
    );
  }
  if (symbol === "square") {
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
        <rect x="28" y="28" width="64" height="64" rx="6" fill="none" stroke="currentColor" strokeWidth="14" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path d="M60 24 L100 96 H20 Z" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" />
    </svg>
  );
}
