'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/** Reactive online/offline status from navigator.onLine + the online/offline events. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

/**
 * Register a frontend's offline-shell service worker (served at /sw.js).
 *
 * Next.js 16 builds with Turbopack, under which @ducanh2912/next-pwa does not run and its
 * auto-register script is never injected — so apps must register the SW themselves or the PWA
 * has no offline shell (a reload during an outage shows a blank page). Production-only so dev
 * builds don't cache stale assets.
 */
export function registerServiceWorker(swUrl = '/sw.js'): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (process.env.NODE_ENV !== 'production') return;
  navigator.serviceWorker.register(swUrl, { scope: '/' }).catch(() => {
    /* registration failures are non-fatal — app still works online */
  });
}

export interface UseOfflineSyncOptions {
  /** Returns how many items are still queued to sync (e.g. read from IndexedDB). */
  getPendingCount?: () => number | Promise<number>;
  /** Poll interval for the pending count, ms (default 4000). */
  pollMs?: number;
}

export interface OfflineSyncState {
  isOnline: boolean;
  /** Items still queued to sync. */
  pendingCount: number;
  /** True while online with a non-empty queue — i.e. actively draining offline data. */
  syncing: boolean;
}

/**
 * One hook for the offline ribbon: tracks connectivity and (optionally) the offline queue depth.
 * `syncing` is true when back online with items still pending — drives the "Syncing offline data…"
 * ribbon. Apps with no offline queue simply omit getPendingCount and only get the offline state.
 */
export function useOfflineSync(opts: UseOfflineSyncOptions = {}): OfflineSyncState {
  const { getPendingCount, pollMs = 4000 } = opts;
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const fnRef = useRef(getPendingCount);
  fnRef.current = getPendingCount;

  const tick = useCallback(async () => {
    if (!fnRef.current) return;
    try {
      const n = await fnRef.current();
      setPendingCount(Number.isFinite(n) ? n : 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!getPendingCount) return;
    void tick();
    const id = setInterval(tick, pollMs);
    return () => clearInterval(id);
  }, [getPendingCount, pollMs, tick]);

  return { isOnline, pendingCount, syncing: isOnline && pendingCount > 0 };
}
