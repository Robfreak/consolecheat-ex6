import { Mark, MoonIcon, SunIcon } from "./icons.tsx";
import { isLang, languageOptions, type Copy, type Lang } from "./messages.ts";
import { ToolLinks } from "./tool-links.tsx";

export type Theme = "light" | "dark";

export function SiteHeader({
  text,
  lang,
  theme,
  onLang,
  onTheme,
}: {
  text: Copy;
  lang: Lang;
  theme: Theme;
  onLang: (lang: Lang) => void;
  onTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="https://consolecheat.com" className="flex min-w-0 items-center gap-3">
          <Mark />
          <span className="truncate font-display text-lg font-semibold tracking-tight">{text.brand}</span>
        </a>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="download-lang">
            {text.language}
          </label>
          <select
            id="download-lang"
            data-testid="lang"
            value={lang}
            onChange={(event) => {
              if (!isLang(event.target.value)) return;
              onLang(event.target.value);
            }}
            className="field w-28 sm:w-36"
          >
            {languageOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            data-testid="theme"
            aria-label={theme === "dark" ? text.themeLight : text.themeDark}
            onClick={onTheme}
            className="inline-flex size-11 items-center justify-center rounded-lg border border-line bg-surface text-fg"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({
  text,
  merklisteHref,
  tools,
  onLegal,
}: {
  text: Copy;
  merklisteHref: string;
  tools: readonly { id: string; href: string; label: string }[];
  onLegal: (page: "impressum" | "datenschutz", event: { preventDefault: () => void }) => void;
}) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm leading-relaxed text-subtle sm:px-6">
        <p className="text-fg">{text.brand}</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label={text.footerNav}>
          <a href={merklisteHref} className="text-steel underline-offset-4 hover:underline">
            {text.merkliste}
          </a>
          <a href="#impressum" onClick={(event) => onLegal("impressum", event)} className="text-steel underline-offset-4 hover:underline">
            Impressum
          </a>
          <a
            href="#datenschutz"
            onClick={(event) => onLegal("datenschutz", event)}
            className="text-steel underline-offset-4 hover:underline"
          >
            Datenschutz
          </a>
        </nav>
        <ToolLinks heading={text.toolsHeading} links={tools} />
        <p>{text.freeClaim}</p>
        <p>{text.privacyClaim}</p>
        <p>{text.footerNote}</p>
        <p>{text.temporary}</p>
      </div>
    </footer>
  );
}
