import assert from "node:assert/strict";
import test from "node:test";
import { approachFor, generateChart, type Difficulty } from "./beatmap.ts";
import { songDurationMs, songs, type Song } from "./songs.ts";

const order: Difficulty[] = ["leicht", "mittel", "schwer"];

function fingerprint(song: Song, difficulty: Difficulty): string {
  const chart = generateChart(song, difficulty);
  return chart.notes.map((note) => `${note.timeMs}:${note.lane}`).join("|");
}

test("a song and a difficulty always build the same chart", () => {
  for (const song of songs) {
    const duration = songDurationMs(song);
    assert.ok(duration >= 60_000 && duration <= 90_000, `${song.id} ${duration}`);
    for (const difficulty of order) {
      const first = generateChart(song, difficulty);
      const second = generateChart(song, difficulty);
      assert.deepEqual(second, first);
      assert.equal(first.approachMs, approachFor(difficulty));
      assert.equal(first.songId, song.id);
      assert.ok(first.notes.length > 20, `${song.id} ${difficulty}`);
      const seen = new Set<string>();
      for (const note of first.notes) {
        assert.ok(note.lane === 0 || note.lane === 1 || note.lane === 2 || note.lane === 3);
        assert.ok(note.timeMs >= 1500, `${song.id} ${note.timeMs}`);
        assert.ok(note.timeMs < duration, `${song.id} ${note.timeMs}`);
        const key = `${note.timeMs}:${note.lane}`;
        assert.equal(seen.has(key), false, key);
        seen.add(key);
      }
      for (let index = 1; index < first.notes.length; index += 1) {
        const prev = first.notes[index - 1];
        const note = first.notes[index];
        if (!prev || !note) continue;
        assert.ok(prev.timeMs < note.timeMs || (prev.timeMs === note.timeMs && prev.lane < note.lane));
      }
    }
    assert.ok(generateChart(song, "leicht").notes.length < generateChart(song, "mittel").notes.length);
    assert.ok(generateChart(song, "mittel").notes.length < generateChart(song, "schwer").notes.length);
    assert.notEqual(fingerprint(song, "leicht"), fingerprint(song, "mittel"));
    assert.notEqual(fingerprint(song, "mittel"), fingerprint(song, "schwer"));
  }
  assert.notEqual(fingerprint(songs[0]!, "leicht"), fingerprint(songs[1]!, "leicht"));
});

test("Nachtmarkt on Leicht stays on the seeded chart", () => {
  const song = songs.find((item) => item.id === "nachtmarkt");
  assert.ok(song);
  const chart = generateChart(song, "leicht");
  assert.equal(chart.notes.length, 112);
  assert.deepEqual(chart.notes[0], { timeMs: 2500, lane: 2 });
  assert.equal(chart.approachMs, 1900);
  assert.equal(approachFor("mittel"), 1450);
  assert.equal(approachFor("schwer"), 1000);
  assert.ok(approachFor("schwer") < approachFor("mittel"));
  assert.ok(approachFor("mittel") < approachFor("leicht"));
});
