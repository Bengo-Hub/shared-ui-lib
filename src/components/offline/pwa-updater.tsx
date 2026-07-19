'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export interface PwaUpdaterProps {
  /** How often to poll the server for a newer deployed build, ms (default 60s). */
  checkIntervalMs?: number;
  className?: string;
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

function currentBuildId(): string | null {
  if (typeof document === 'undefined') return null;
  const el = document.querySelector('script[src*="_buildManifest"], link[href*="_buildManifest"]');
  const src = el?.getAttribute('src') || el?.getAttribute('href') || '';
  const fromEl = buildIdFrom(src);
  if (fromEl) return fromEl;
  // Fallback: scan the full document (covers both the buildManifest pattern in inline scripts and
  // the Turbopack script-fingerprint fallback).
  return fingerprintFrom(document.documentElement.outerHTML);
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
 */
export function PwaUpdater({ checkIntervalMs = 60_000, className = '' }: PwaUpdaterProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mine = currentBuildId();
    if (!mine) return; // can't establish a baseline → don't risk false prompts

    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch(window.location.href, { cache: 'no-store', credentials: 'same-origin' });
        if (!res.ok) return;
        const server = fingerprintFrom(await res.text());
        if (!stopped && server && server !== mine) setUpdateAvailable(true);
      } catch {
        /* offline / cross-origin redirect — ignore, no false positive */
      }
    };
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
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update().catch(() => {})));
      }
    } catch {
      /* best-effort */
    }
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div
      role="status"
      className={`flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white ${className}`}
    >
      <RefreshCw className="h-4 w-4 shrink-0" />
      <span>A new version is available.</span>
      <button
        type="button"
        onClick={() => void applyUpdate()}
        className="rounded-full bg-white px-3 py-0.5 text-xs font-bold text-slate-900 hover:bg-slate-100"
      >
        Update now
      </button>
    </div>
  );
}
