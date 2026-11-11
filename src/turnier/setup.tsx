import { duplicateIds, playerIssue } from "./players.ts";
import { createId } from "./shuffle.ts";
import { fill, type Copy } from "./messages.ts";
import { MAX_PLAYERS, MAX_POINT, MAX_TITLE, type Mode, type Player, type Points, type Tournament } from "./types.ts";

export function SetupForm({
  state,
  text,
  onChange,
  onDraw,
}: {
  state: Tournament;
  text: Copy;
  onChange: (next: Tournament) => void;
  onDraw: () => void;
}) {
  const issue = playerIssue(state.players);
  const dupes = new Set(duplicateIds(state.players));
  const canDraw = issue === null;

  function updatePlayer(id: string, name: string) {
    onChange({
      ...state,
      players: state.players.map((player) => (player.id === id ? { ...player, name } : player)),
    });
  }

  function addPlayer() {
    if (state.players.length >= MAX_PLAYERS) return;
    const next: Player = { id: createId(), name: "" };
    onChange({ ...state, players: [...state.players, next] });
  }

  function removePlayer(id: string) {
    if (state.players.length <= 2) return;
    onChange({ ...state, players: state.players.filter((player) => player.id !== id) });
  }

  function setMode(mode: Mode) {
    onChange({ ...state, mode });
  }

  function setPoints(key: keyof Points, raw: string) {
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 0 || value > MAX_POINT) return;
    onChange({ ...state, points: { ...state.points, [key]: value } });
  }

  return (
    <section className="panel rounded-xl p-4 sm:p-6" aria-labelledby="setup-heading">
      <h2 id="setup-heading" className="font-display text-2xl font-semibold tracking-tight">
        {text.setupHeading}
      </h2>
      <div className="mt-4 grid gap-4">
        <div>
          <label htmlFor="turnier-name" className="mb-1 block text-sm font-medium">
            {text.nameLabel}
          </label>
          <input
            id="turnier-name"
            data-testid="tournament-name"
            className="field"
            maxLength={MAX_TITLE}
            value={state.name}
            placeholder={text.namePlaceholder}
            autoComplete="off"
            onChange={(event) => onChange({ ...state, name: event.target.value })}
          />
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{text.modeLabel}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="choice">
              <input
                type="radio"
                name="turnier-mode"
                value="ko"
                data-testid="mode-ko"
                checked={state.mode === "ko"}
                onChange={() => setMode("ko")}
              />
              <span className="font-display text-lg font-semibold">{text.modeKo}</span>
              <span className="text-sm leading-relaxed text-muted">{text.modeKoHelp}</span>
            </label>
            <label className="choice">
              <input
                type="radio"
                name="turnier-mode"
                value="liga"
                data-testid="mode-liga"
                checked={state.mode === "liga"}
                onChange={() => setMode("liga")}
              />
              <span className="font-display text-lg font-semibold">{text.modeLiga}</span>
              <span className="text-sm leading-relaxed text-muted">{text.modeLigaHelp}</span>
            </label>
          </div>
        </fieldset>
        {state.mode === "liga" ? (
          <div className="grid gap-3">
            <label className="flex items-center gap-3 text-base">
              <input
                type="checkbox"
                data-testid="double-round"
                checked={state.doubleRound}
                onChange={(event) => onChange({ ...state, doubleRound: event.target.checked })}
              />
              {text.doubleRound}
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">{text.pointsLegend}</legend>
              <div className="grid grid-cols-3 gap-2">
                <PointField id="points-win" label={text.pointsWin} value={state.points.win} onChange={(value) => setPoints("win", value)} />
                <PointField id="points-draw" label={text.pointsDraw} value={state.points.draw} onChange={(value) => setPoints("draw", value)} />
                <PointField id="points-loss" label={text.pointsLoss} value={state.points.loss} onChange={(value) => setPoints("loss", value)} />
              </div>
            </fieldset>
          </div>
        ) : null}
        <div>
          <h3 className="text-sm font-medium">{text.playersLabel}</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {state.players.map((player, index) => {
              const inputId = `player-${player.id}`;
              const label = fill(text.playerLabel, { n: index + 1 });
              const shown = player.name.trim() || label;
              return (
                <li key={player.id} className="player-row">
                  <label htmlFor={inputId} className="sr-only">
                    {label}
                  </label>
                  <input
                    id={inputId}
                    data-testid={`player-${index}`}
                    className="field"
                    maxLength={32}
                    value={player.name}
                    placeholder={text.playerPlaceholder}
                    autoComplete="off"
                    aria-invalid={dupes.has(player.id) || undefined}
                    onChange={(event) => updatePlayer(player.id, event.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    aria-label={fill(text.removePlayer, { name: shown })}
                    disabled={state.players.length <= 2}
                    onClick={() => removePlayer(player.id)}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
          {issue === "duplicate" ? (
            <p role="alert" className="mt-2 text-sm text-bad">
              {text.duplicate}
            </p>
          ) : (
            <p className="mt-2 text-sm text-subtle">{text.needPlayers}</p>
          )}
          <button type="button" className="btn btn-ghost mt-3" data-testid="add-player" onClick={addPlayer} disabled={state.players.length >= MAX_PLAYERS}>
            {text.addPlayer}
          </button>
        </div>
        <div>
          <button type="button" className="btn btn-primary" data-testid="draw" onClick={onDraw} disabled={!canDraw}>
            {text.drawAction}
          </button>
          <p className="mt-2 text-sm leading-relaxed text-subtle">{text.drawHint}</p>
        </div>
      </div>
    </section>
  );
}

function PointField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      {label}
      <input
        id={id}
        data-testid={id}
        className="field mt-1"
        type="number"
        inputMode="numeric"
        min={0}
        max={MAX_POINT}
        step={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
