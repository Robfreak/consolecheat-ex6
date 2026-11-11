import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildEvents, eventsBetween, eventsFor } from "./music.ts";
import { songDurationMs, songs } from "./songs.ts";

test("each song loop is deterministic and stays inside the song", () => {
  for (const song of songs) {
    const duration = songDurationMs(song);
    const first = buildEvents(song);
    const second = eventsFor(song);
    assert.deepEqual(second, first);
    assert.ok(first.length > 50, song.id);
    assert.ok(first.some((event) => event.voice === "kick"));
    assert.ok(first.some((event) => event.voice === "bass"));
    assert.ok(first.some((event) => event.voice === "lead"));
    for (let index = 1; index < first.length; index += 1) {
      const prev = first[index - 1];
      const event = first[index];
      if (!prev || !event) continue;
      assert.ok(prev.timeMs <= event.timeMs);
      assert.ok(event.timeMs < duration);
    }
    const slice = eventsBetween(song, 1000, 2000);
    assert.ok(slice.every((event) => event.timeMs >= 1000 && event.timeMs < 2000));
    assert.deepEqual(eventsBetween(song, 2000, 1000), []);
  }
});

test("playback is scheduled from the audio clock", () => {
  const audio = readFileSync(new URL("./audio.ts", import.meta.url), "utf8");
  const playfield = readFileSync(new URL("./playfield.tsx", import.meta.url), "utf8");
  const game = readFileSync(new URL("./game.tsx", import.meta.url), "utf8");
  assert.match(audio, /currentTime/);
  assert.match(playfield, /requestAnimationFrame/);
  assert.doesNotMatch(audio, /setTimeout\(|setInterval\(/);
  assert.doesNotMatch(playfield, /setTimeout\(|setInterval\(/);
  assert.doesNotMatch(game, /setTimeout\(|setInterval\(/);
});
