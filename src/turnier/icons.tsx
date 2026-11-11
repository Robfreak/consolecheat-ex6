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

export function TrophyIcon() {
  return (
    <svg viewBox="0 0 64 64" className="trophy" aria-hidden="true">
      <path d="M18 8h28v8c0 10-6 16-14 18-8-2-14-8-14-18V8z" className="fill-steel" />
      <path d="M18 12H10c0 8 4 12 8 14M46 12h8c0 8-4 12-8 14" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M28 34h8v8h-8zM22 46h20v4H22zM18 52h28v4H18z" className="fill-fg" />
    </svg>
  );
}
