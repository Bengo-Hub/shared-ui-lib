import * as react_jsx_runtime from 'react/jsx-runtime';

interface OfflineSyncBannerProps {
    /** Connectivity (from useOnlineStatus / useOfflineSync). */
    isOnline: boolean;
    /** Items still queued to sync; when > 0 after reconnect the ribbon shows "Syncing offline data…". */
    pendingCount?: number;
    /** Explicit syncing override (defaults to isOnline && pendingCount > 0). */
    syncing?: boolean;
    /** What still works while offline (shown in the offline ribbon so users know the fallback). */
    availableOffline?: string[];
    /** What is unavailable while offline. */
    disabledOffline?: string[];
    /** Optional "Sync now" action on the syncing ribbon (manual drain trigger). */
    onSyncNow?: () => void;
    /** Briefly show an "all synced" confirmation when the queue drains to zero (default true). */
    showSyncedConfirmation?: boolean;
    className?: string;
}
/**
 * Full-width offline / sync ribbon for the top of the app shell — consistent across every
 * Codevertex frontend. Three states:
 *   - OFFLINE  → amber bar: "Offline mode" + what works / what's disabled.
 *   - SYNCING  → blue bar with an animated sync icon: "Syncing offline data… (N)".
 *   - ONLINE/IDLE → renders nothing (or a brief "all synced" flash if it was just syncing).
 *
 * Drop it directly under (or above) the app header. Data is supplied by the host app
 * (see useOfflineSync) so the same component serves apps with and without an offline queue.
 */
declare function OfflineSyncBanner({ isOnline, pendingCount, syncing, availableOffline, disabledOffline, onSyncNow, showSyncedConfirmation, className, }: OfflineSyncBannerProps): react_jsx_runtime.JSX.Element | null;
/** Tiny standalone "all synced" toast-style confirmation (optional helper for hosts). */
declare function SyncedConfirmation({ className }: {
    className?: string;
}): react_jsx_runtime.JSX.Element;

/** Reactive online/offline status from navigator.onLine + the online/offline events. */
declare function useOnlineStatus(): boolean;
/**
 * Register a frontend's offline-shell service worker (served at /sw.js).
 *
 * Next.js 16 builds with Turbopack, under which @ducanh2912/next-pwa does not run and its
 * auto-register script is never injected — so apps must register the SW themselves or the PWA
 * has no offline shell (a reload during an outage shows a blank page). Production-only so dev
 * builds don't cache stale assets.
 */
declare function registerServiceWorker(swUrl?: string): void;
interface UseOfflineSyncOptions {
    /** Returns how many items are still queued to sync (e.g. read from IndexedDB). */
    getPendingCount?: () => number | Promise<number>;
    /** Poll interval for the pending count, ms (default 4000). */
    pollMs?: number;
}
interface OfflineSyncState {
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
declare function useOfflineSync(opts?: UseOfflineSyncOptions): OfflineSyncState;

export { OfflineSyncBanner, type OfflineSyncBannerProps, type OfflineSyncState, SyncedConfirmation, type UseOfflineSyncOptions, registerServiceWorker, useOfflineSync, useOnlineStatus };
