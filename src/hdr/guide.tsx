import type { Copy } from "./messages.ts";
import type { DynamicRange } from "./range.ts";

export function Guide({
  text,
  screenHref,
  range,
}: {
  text: Copy;
  screenHref: string;
  range: DynamicRange;
}) {
  const guide = text.guide;
  const note = text.hdrNote;
  const report = range === "high" ? note.high : range === "standard" ? note.standard : note.unknown;

  return (
    <section className="mt-10" aria-labelledby="guide-heading" data-testid="guide">
      <h2 id="guide-heading" className="font-display text-2xl font-semibold tracking-tight">
        {guide.heading}
      </h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <article className="panel rounded-xl px-4 py-4">
          <h3 className="font-display text-xl font-semibold tracking-tight">{guide.canHeading}</h3>
          <p className="mt-2 text-base leading-relaxed text-muted">{guide.canIntro}</p>
          <ul className="guide-list text-base leading-relaxed text-muted">
            <li>{guide.canBlack}</li>
            <li>{guide.canPluge}</li>
            <li>{guide.canWhite}</li>
            <li>{guide.canGray}</li>
          </ul>
        </article>
        <article className="panel rounded-xl px-4 py-4">
          <h3 className="font-display text-xl font-semibold tracking-tight">{guide.cannotHeading}</h3>
          <p className="mt-2 text-base leading-relaxed text-muted">{guide.cannotIntro}</p>
          <ul className="guide-list text-base leading-relaxed text-muted">
            <li>{guide.cannotPeak}</li>
            <li>{guide.cannotPq}</li>
            <li>{guide.cannotCert}</li>
            <li>{guide.cannotConsole}</li>
          </ul>
        </article>
      </div>
      <div className="panel mt-3 rounded-xl px-4 py-4">
        <h3 className="font-display text-xl font-semibold tracking-tight">{guide.howHeading}</h3>
        <ol className="guide-steps text-base leading-relaxed text-muted">
          <li>{guide.how1}</li>
          <li>{guide.how2}</li>
          <li>{guide.how3}</li>
          <li>{guide.how4}</li>
          <li>{guide.how5}</li>
        </ol>
      </div>
      <aside className="panel mt-3 rounded-xl px-4 py-4" data-testid="hdr-note" data-range={range}>
        <h3 className="font-display text-xl font-semibold tracking-tight">{note.heading}</h3>
        <p className="mt-2 text-base leading-relaxed text-muted">{note.body}</p>
        <p className="mt-3 text-sm text-subtle">{note.probeLabel}</p>
        <p className="range-value mt-1 text-base leading-relaxed" data-testid="dynamic-range">
          {report}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-subtle">{note.notCertified}</p>
      </aside>
      <div className="panel mt-3 rounded-xl px-4 py-5 sm:px-6">
        <h3 className="font-display text-xl font-semibold tracking-tight">{guide.screenHeading}</h3>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">{guide.screenBody}</p>
        <a href={screenHref} className="btn btn-primary mt-4" data-testid="screen-test-link">
          {guide.screenLink}
        </a>
      </div>
    </section>
  );
}
