'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export interface PwaUpdaterProps {
  /** How often to poll the server for a newer deployed build, ms (default 60s). */
  checkIntervalMs?: number;
  className?: string;
}

// codevertexitsolutions.com -> codevertexafrica.com rebrand: any tab/installed-PWA still on the
// old domain gets a distinct, immediate "this app has moved" banner instead of waiting on the
// normal same-origin build-fingerprint poll (which never fires here — the old domain's Ingress no
// longer routes to this app at all, so every fetch the poll makes 404s and is silently ignored).
// Once every legacy host is retired this block (and the branch in applyUpdate) can be deleted.
const LEGACY_DOMAIN = 'codevertexitsolutions.com';
const CURRENT_DOMAIN = 'codevertexafrica.com';

function legacyRedirectUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const { hostname } = window.location;
  if (hostname !== LEGACY_DOMAIN && !hostname.endsWith(`.${LEGACY_DOMAIN}`)) return null;
  const newHost = hostname.slice(0, hostname.length - LEGACY_DOMAIN.length) + CURRENT_DOMAIN;
  return window.location.href.replace(hostname, newHost);
}

/** Extract the Next.js build id from a page's _buildManifest/_ssgManifest asset path. Only
 *  present for webpack (Pages Router-style) builds — Turbopack/App Router never emits this. */
function buildIdFrom(html: string): string | null {
  const m = html.match(/\/_next\/static\/([^/"']+)\/_(?:build|ssg)Manifest/);
  return m ? m[1] : null;
}

/** Fallback fingerprint for Turbopack/App Router builds, which don't reference a _buildManifest
 *  path anywhere in the served HTML (chunk filenames live under /_next/static/chunks/ instead,
 *  content-hashed but not build-id-scoped) — the old buildIdFrom() always returned null for these
 *  apps, so the updater could never detect a new deploy. Every deploy changes at least the
 *  entrypoint/layout chunk hashes, so the full sorted set of /_next/static/ script src values is a
 *  reliable per-deploy fingerprint regardless of bundler. */
function scriptFingerprintFrom(html: string): string | null {
  const matches = Array.from(html.matchAll(/<script[^>]+src="([^"]*\/_next\/static\/[^"]+)"/g)).map((m) => m[1]);
  if (matches.length === 0) return null;
  return matches.sort().join('|');
}

function fingerprintFrom(html: string): string | null {
  return buildIdFrom(html) ?? scriptFingerprintFrom(html);
}

/**
 * PWA update banner — uniform across every Codevertex frontend.
 *
 * The fleet ships a committed static service worker whose bytes don't change per deploy, so the
 * browser's SW-update lifecycle can't detect new releases. Instead this polls the server for a
 * per-deploy fingerprint — the Next.js build id embedded in the _buildManifest asset path on
 * webpack/Pages-Router builds, or the full sorted set of /_next/static/ script src values as a
 * fallback (Turbopack/App Router builds never reference _buildManifest in the served HTML at all,
 * so the build-id lookup alone always returned null and the banner could never fire on those
 * apps) — and compares it to the one this tab loaded. When the deployed build differs, it shows
 * "Update now" → clears caches, unregisters the SW, and hard-reloads to pull the latest version.
 *
 * Both the baseline and every later check fetch the SAME pinned URL (the one this tab was on when
 * the updater mounted) via the SAME method (a fresh `fetch`, never the live DOM). Two earlier bugs
 * made the banner reappear forever even right after a real update: (1) the baseline was read from
 * `document.documentElement.outerHTML` — the live, hydrated DOM — while later checks fetched raw
 * server HTML, an apples-to-oranges comparison that could mismatch even on an unchanged build; and
 * (2) later checks re-read `window.location.href` on every tick, so client-side SPA navigation to a
 * different route changed the URL being polled — each App Router route embeds a different subset
 * of `/_next/static/` chunk paths, so the fingerprint "changed" purely from navigating, not from a
 * new deploy. Pinning both the URL and the fetch-based method eliminates both false positives.
 */
export function PwaUpdater({ checkIntervalMs = 60_000, className = '' }: PwaUpdaterProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isLegacyDomain, setIsLegacyDomain] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (legacyRedirectUrl()) {
      setIsLegacyDomain(true);
      setUpdateAvailable(true);
      return; // no point polling a domain this app no longer serves
    }

    const url = window.location.href;
    let stopped = false;
    let mine: string | null = null;

    const check = async () => {
      try {
        const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
        if (!res.ok) return;
        const fp = fingerprintFrom(await res.text());
        if (stopped || !fp) return;
        if (mine === null) {
          mine = fp; // first successful fetch establishes the baseline for this tab's session
        } else if (fp !== mine) {
          setUpdateAvailable(true);
        }
      } catch {
        /* offline / cross-origin redirect — ignore, no false positive */
      }
    };
    void check(); // establish the baseline immediately, the same way every later check works
    const id = setInterval(check, checkIntervalMs);
    // Also check when the tab regains focus / comes back online.
    const onFocus = () => void check();
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    return () => {
      stopped = true;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
    };
  }, [checkIntervalMs]);

  const applyUpdate = async () => {
    // On the legacy domain the app itself is gone (Ingress no longer routes here), so there's no
    // "latest build" to reload into — the only correct action is to leave. Unregistering first
    // means the browser drops this origin's installed-app registration on next relaunch instead of
    // reopening a dead shell; the redirect below is what actually gets the user to a working app
    // (installing the new PWA from there is a separate, user-driven browser gesture we can't
    // trigger from script).
    const redirect = legacyRedirectUrl();
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (redirect) {
          await Promise.all(regs.map((r) => r.unregister().catch(() => {})));
        } else {
          await Promise.all(regs.map((r) => r.update().catch(() => {})));
        }
      }
    } catch {
      /* best-effort */
    }
    if (redirect) {
      window.location.replace(redirect);
    } else {
      window.location.reload();
    }
  };

  if (!updateAvailable) return null;

  return (
    <div
      role="status"
      className={`flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white ${className}`}
    >
      <RefreshCw className="h-4 w-4 shrink-0" />
      <span>{isLegacyDomain ? 'This app has moved to a new address.' : 'A new version is available.'}</span>
      <button
        type="button"
        onClick={() => void applyUpdate()}
        className="rounded-full bg-white px-3 py-0.5 text-xs font-bold text-slate-900 hover:bg-slate-100"
      >
        {isLegacyDomain ? 'Continue' : 'Update now'}
      </button>
    </div>
  );
}
