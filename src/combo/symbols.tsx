import type { FaceButton } from "./types.ts";

export function FaceMark({ button, className = "face-svg" }: { button: FaceButton; className?: string }) {
  const common = { viewBox: "0 0 32 32", className, "aria-hidden": true as const };
  if (button === "square") {
    return (
      <svg {...common}>
        <rect x="7" y="7" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2.6" />
      </svg>
    );
  }
  if (button === "triangle") {
    return (
      <svg {...common}>
        <path d="M16 6.5 27 25.5H5Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (button === "circle") {
    return (
      <svg {...common}>
        <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M9 9 23 23M23 9 9 23" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
