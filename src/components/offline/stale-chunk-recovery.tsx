'use client';

import { useEffect } from 'react';

/**
 * Stale-bundle recovery for long-open app tabs (POS terminals, back-office screens).
 *
 * A tab left open across a deploy keeps running the old bundle. The first time it needs a chunk
 * it has not fetched yet, the server no longer has that content-hashed file: a ChunkLoadError.
 * With no error boundary, React's retries often surface it only as error #185 ("Maximum update
 * depth exceeded"). One hard reload fetches the current build and clears the stale module graph.
 *
 * A bare #185 is also what a genuine render loop throws on a current bundle. Reloading on every
 * #185 made such a loop look like the app refreshing itself every 30 seconds (pos-ui terminal,
 * 2026-10-03), so a bare #185 reloads only after a HEAD of one of the page's own chunk scripts
 * returns 404. Raw chunk-load failures reload straight away.
 *
 * Mount <StaleChunkRecovery /> once in the app shell, and call recoverFromError(error) from the
 * app's error.tsx / global-error.tsx boundaries.
 */

export const RELOAD_FLAG_KEY = 'cv-stale-chunk-reload-at';
// One reload per window: a real deploy gap is a one-time miss, so this self-heals without a
// refresh storm against a backend that is genuinely failing.
const RELOAD_COOLDOWN_MS = 30_000;

const REACT_185 = /Minified React error #185/;

function messageOf(reason: unknown): string {
  return String((reason as { message?: unknown })?.message ?? reason);
}

/** A chunk-load failure in its raw form, or React's downstream #185. */
export function isStaleChunkError(reason: unknown): boolean {
  if (!reason) return false;
  const name = (reason as { name?: string })?.name ?? '';
  const message = messageOf(reason);
  return (
    name === 'ChunkLoadError' ||
    /Loading chunk [\w.-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    REACT_185.test(message)
  );
}

/** Whether one of this page's own chunk scripts is gone from the server (a deploy replaced it). */
async function bundleIsStale(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const src = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src*="/_next/static/chunks/"]'))
    .map((s) => s.src)
    .find(Boolean);
  if (!src) return false;
  try {
    const res = await fetch(src, { method: 'HEAD', cache: 'no-store' });
    return res.status === 404;
  } catch {
    return false; // offline: a reload would not help
  }
}

export function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG_KEY) || 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
    sessionStorage.setItem(RELOAD_FLAG_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private mode): reload anyway, this path is rare.
  }
  window.location.reload();
}

/** Reloads for a chunk-load error; for a bare #185 only after confirming the bundle is stale. */
export function recoverFromError(reason: unknown) {
  if (!isStaleChunkError(reason)) return;
  if (!REACT_185.test(messageOf(reason))) {
    reloadOnce();
    return;
  }
  void bundleIsStale().then((stale) => {
    if (stale) reloadOnce();
    else console.error('Render loop (React #185) on a current bundle; not reloading', reason);
  });
}

/** Window-level listener for chunk errors that never reach an error boundary. */
export function StaleChunkRecovery() {
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => recoverFromError(event.reason);
    const onError = (event: ErrorEvent) => recoverFromError(event.error);
    window.addEventListener('unhandledrejection', onRejection);
    // Capture phase: a failed <script>/<link> load fires a non-bubbling 'error' on the element.
    window.addEventListener('error', onError, true);
    return () => {
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('error', onError, true);
    };
  }, []);
  return null;
}
