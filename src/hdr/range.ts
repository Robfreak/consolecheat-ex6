// Informational probe only. `dynamic-range` reports what the browser believes
// the output is. It does not measure nits, and it does not verify PQ EOTF.

export const HIGH_QUERY = "(dynamic-range: high)";
export const STANDARD_QUERY = "(dynamic-range: standard)";

export type DynamicRange = "high" | "standard" | "unknown";

export type QueryListLike = { matches: boolean };

export type MatchMediaLike = (query: string) => QueryListLike;

export function readDynamicRange(matchMedia: MatchMediaLike | null | undefined): DynamicRange {
  if (typeof matchMedia !== "function") return "unknown";
  try {
    if (matchMedia(HIGH_QUERY)?.matches) return "high";
    if (matchMedia(STANDARD_QUERY)?.matches) return "standard";
    return "unknown";
  } catch {
    return "unknown";
  }
}
