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

interface OfflineBarProps {
    /** Optional offline-queue depth provider (apps with offline data sync, e.g. POS). */
    getPendingCount?: () => number | Promise<number>;
    /** What still works while offline. */
    availableOffline?: string[];
    /** What is unavailable while offline. */
    disabledOffline?: string[];
    /** Manual "Sync now" trigger shown on the syncing ribbon. */
    onSyncNow?: () => void;
    /** Service worker URL to register (default /sw.js). */
    swUrl?: string;
    /** Register the offline-shell service worker on mount (default true, production only). */
    registerSW?: boolean;
    /** Also render the PWA update banner (new-version → update). Default true. */
    showUpdater?: boolean;
    className?: string;
}
/**
 * Drop-in offline/sync ribbon for any Codevertex frontend: registers the offline-shell service
 * worker and renders the shared OfflineSyncBanner (offline-mode + "Syncing offline data…").
 * Place once at the top of the app shell. Apps without an offline queue simply omit
 * getPendingCount and get the offline-mode banner only.
 */
declare function OfflineBar({ getPendingCount, availableOffline, disabledOffline, onSyncNow, swUrl, registerSW, showUpdater, className, }: OfflineBarProps): react_jsx_runtime.JSX.Element;

interface PwaUpdaterProps {
    /** How often to poll the server for a newer deployed build, ms (default 60s). */
    checkIntervalMs?: number;
    className?: string;
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
declare function PwaUpdater({ checkIntervalMs, className }: PwaUpdaterProps): react_jsx_runtime.JSX.Element | null;

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

export { OfflineBar as O, PwaUpdater as P, SyncedConfirmation as S, type UseOfflineSyncOptions as U, type OfflineBarProps as a, OfflineSyncBanner as b, type OfflineSyncBannerProps as c, type OfflineSyncState as d, type PwaUpdaterProps as e, useOnlineStatus as f, registerServiceWorker as r, useOfflineSync as u };
