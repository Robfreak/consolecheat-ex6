import {
  controlKind,
  controlLabel,
  controlsFor,
  marks,
  slotFor,
  type ControlId,
  type LayoutId,
} from "./layout.ts";
import type { Copy } from "./messages.ts";

const faceIds = ["triangle", "square", "circle", "cross"] as const satisfies readonly ControlId[];

function hrefFor(id: ControlId): string {
  return `#control-${id}`;
}

function Key({
  id,
  name,
  layout,
  className,
}: {
  id: ControlId;
  name: string;
  layout: LayoutId;
  className?: string;
}) {
  const kind = controlKind[id];
  const mark = marks[id];
  const label = controlLabel(mark, name);
  const slot = slotFor(id, layout);
  const place = { gridColumn: slot.column, gridRow: slot.row };
  const classNames = ["pad-key", className].filter(Boolean).join(" ");

  if (kind === "round") {
    return (
      <a className={`${classNames} pad-key-round`} style={place} href={hrefFor(id)} aria-label={name}>
        <span className="pad-key-mark" aria-hidden="true">
          PS
        </span>
      </a>
    );
  }

  if (kind === "dpad") {
    return (
      <a className={`${classNames} pad-key-dpad`} style={place} href={hrefFor(id)} aria-label={name}>
        <span className="pad-dpad" aria-hidden="true" />
        <span className="pad-key-name">{name}</span>
      </a>
    );
  }

  if (kind === "stick") {
    return (
      <a className={`${classNames} pad-key-stick`} style={place} href={hrefFor(id)} aria-label={label}>
        <span className="pad-stick-cap" aria-hidden="true">
          {mark}
        </span>
        <span className="pad-key-name">{name}</span>
      </a>
    );
  }

  if (kind === "face") {
    return (
      <a className={`${classNames} pad-key-face`} style={place} href={hrefFor(id)} aria-label={label}>
        <span className="pad-key-mark" aria-hidden="true">
          {mark}
        </span>
        <span className="pad-key-name">{name}</span>
      </a>
    );
  }

  if (kind === "options") {
    return (
      <a className={`${classNames} pad-key-opt`} style={place} href={hrefFor(id)} aria-label={name}>
        <svg viewBox="0 0 24 24" className="pad-icon" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="pad-key-name">{name}</span>
      </a>
    );
  }

  if (kind === "pad") {
    return (
      <a className={`${classNames} pad-key-pad`} style={place} href={hrefFor(id)} aria-label={name}>
        <span className={layout === "ds4" ? "pad-light pad-light-ds4" : "pad-light pad-light-dualsense"} aria-hidden="true" />
        <span className="pad-key-name">{name}</span>
      </a>
    );
  }

  const sideClass = id === "share" || id === "create" ? "pad-key-cap" : id === "mute" ? "pad-key-mute" : "";
  return (
    <a className={`${classNames} ${sideClass}`} style={place} href={hrefFor(id)} aria-label={label}>
      <span className="pad-key-mark">{kind === "shoulder" ? name : mark === name ? name : mark}</span>
      {kind !== "shoulder" && mark !== name ? <span className="pad-key-name">{name}</span> : null}
    </a>
  );
}

function Body({ layout }: { layout: LayoutId }) {
  const d =
    layout === "ds4"
      ? "M36 44H764C780 44 784 108 778 188C772 268 784 328 744 418C704 508 624 580 516 600C466 610 430 552 400 512C370 552 334 610 284 600C176 580 96 508 56 418C16 328 28 268 22 188C16 108 20 44 36 44Z"
      : "M80 70C36 90 24 150 28 210C32 280 16 340 52 430C90 520 180 590 300 608C352 616 380 572 400 548C420 572 448 616 500 608C620 590 710 520 748 430C784 340 768 280 772 210C776 150 764 90 720 70C640 40 560 78 400 86C240 78 160 40 80 70Z";
  return (
    <svg viewBox="0 0 800 640" className="pad-silhouette" aria-hidden="true" preserveAspectRatio="none">
      <path className="pad-body-shape" d={d} />
    </svg>
  );
}

export function ControllerDiagram({ text, layout }: { text: Copy; layout: LayoutId }) {
  const present = new Set(controlsFor(layout));
  const before = (["l2", "r2", "l1", "r1", "share", "create", "touchpad", "options", "dpad"] as const).filter((id) =>
    present.has(id),
  );
  const after = (["lstick", "ps", "mute", "rstick"] as const).filter((id) => present.has(id));

  return (
    <div className="pad-shell panel">
      <Body layout={layout} />
      <div className="pad-keys" role="group" aria-label={text.diagramLabel} data-layout={layout}>
        {before.map((id) => (
          <Key key={id} id={id} name={text.controls[id].name} layout={layout} />
        ))}
        <div className="pad-face">
          {faceIds.map((id) => (
            <Key key={id} id={id} name={text.controls[id].name} layout={layout} />
          ))}
        </div>
        {after.map((id) => (
          <Key key={id} id={id} name={text.controls[id].name} layout={layout} />
        ))}
      </div>
    </div>
  );
}
