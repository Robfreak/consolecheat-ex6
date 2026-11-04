// Fullscreen helpers. Callers pass the document (or a mock) so tests do not
// need a browser. The standard API is preferred; the webkit-prefixed methods
// cover older TV browsers. No third-party fullscreen library.

export type ToggleResult = { ok: true; active: boolean } | { ok: false; reason: "unavailable" | "rejected" };

export type FullscreenTarget = {
  requestFullscreen?: () => Promise<void> | void;
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export type FullscreenHost = {
  fullscreenElement: Element | null;
  webkitFullscreenElement?: Element | null;
  exitFullscreen?: () => Promise<void> | void;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export const FULLSCREEN_EVENTS = ["fullscreenchange", "webkitfullscreenchange"] as const;

export function isFullscreen(host: FullscreenHost): boolean {
  return host.fullscreenElement != null || host.webkitFullscreenElement != null;
}

export async function enterFullscreen(target: FullscreenTarget, host: FullscreenHost): Promise<ToggleResult> {
  const request = target.requestFullscreen ?? target.webkitRequestFullscreen;
  if (!request) return { ok: false, reason: "unavailable" };
  try {
    await request.call(target);
  } catch {
    return { ok: false, reason: "rejected" };
  }
  if (!isFullscreen(host)) return { ok: false, reason: "rejected" };
  return { ok: true, active: true };
}

export async function exitFullscreen(host: FullscreenHost): Promise<ToggleResult> {
  if (!isFullscreen(host)) return { ok: true, active: false };
  const exit = host.exitFullscreen ?? host.webkitExitFullscreen;
  if (!exit) return { ok: false, reason: "unavailable" };
  try {
    await exit.call(host);
  } catch {
    return { ok: false, reason: "rejected" };
  }
  return { ok: true, active: isFullscreen(host) };
}

export async function toggleFullscreen(target: FullscreenTarget, host: FullscreenHost): Promise<ToggleResult> {
  if (isFullscreen(host)) return exitFullscreen(host);
  return enterFullscreen(target, host);
}
