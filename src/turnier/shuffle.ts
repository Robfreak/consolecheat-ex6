// The draw is a Fisher–Yates shuffle driven by crypto.getRandomValues.
// Pass `random` only from tests. The page calls shuffleIds with the default.

export type RandomSource = {
  getRandomValues(array: Uint32Array): Uint32Array;
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function nextUnit(source: RandomSource = crypto): number {
  const buf = new Uint32Array(1);
  source.getRandomValues(buf);
  return (buf[0] ?? 0) / 4294967296;
}

export function createId(random: () => number = nextUnit): string {
  let id = "p";
  for (let i = 0; i < 8; i += 1) {
    const index = Math.min(ALPHABET.length - 1, Math.floor(Math.max(0, random()) * ALPHABET.length));
    id += ALPHABET[index];
  }
  return id;
}

/** Fisher–Yates. `random` returns a number in [0, 1). The result is a permutation. */
export function shuffleIds(ids: readonly string[], random: () => number = nextUnit): string[] {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(Math.max(0, random()) * (i + 1)));
    const current = copy[i] ?? "";
    copy[i] = copy[j] ?? "";
    copy[j] = current;
  }
  return copy;
}
