export function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-9 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-raised" />
      <circle cx="16" cy="12" r="5" className="fill-steel" />
      <path d="M7 27c1.4-6 4.5-8.4 9-8.4S23.6 21 25 27H7z" className="fill-fg" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function FlameIcon() {
  return (
    <svg viewBox="0 0 24 32" className="flame-svg" aria-hidden="true">
      <path
        className="flame-outer"
        d="M12 1c2 5 8 7 8 14a8 8 0 0 1-16 0c0-3 2-5 3-7 1 3 3 4 5 4-1-4 0-8 0-11z"
      />
      <path className="flame-inner" d="M12 14c1.2 2 3.2 3 3.2 5.4a3.2 3.2 0 0 1-6.4 0c0-1.4.8-2.4 1.6-3.4.6 1.2 1.4 1.6 1.6 1.6z" />
    </svg>
  );
}
