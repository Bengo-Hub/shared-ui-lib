export { O as OfflineBar, a as OfflineBarProps, b as OfflineSyncBanner, c as OfflineSyncBannerProps, d as OfflineSyncState, P as PwaUpdater, e as PwaUpdaterProps, S as SyncedConfirmation, U as UseOfflineSyncOptions, r as registerServiceWorker, u as useOfflineSync, f as useOnlineStatus } from '../../use-offline-sync-An_S9Hq1.js';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface PwaInstallPromptProps {
    /** The installable app's display name, e.g. "Acme POS" or "Codevertex Library". */
    appName: string;
    /** Tenant/brand logo shown in the prompt's icon slot; falls back to a generic share/download icon. */
    logoUrl?: string | null;
    /** What installing gets them, e.g. "Full offline support — orders, payments & drawer." */
    tagline?: string;
    /** localStorage key remembering a dismissal — MUST be unique per app to avoid cross-app collisions. */
    dismissKey: string;
    /** Ms to wait after install-eligibility before showing the prompt (default 3000, uniform fleet-wide). */
    delayMs?: number;
    /** Ms before a dismissed prompt is offered again (default 24h, uniform fleet-wide). */
    repromptMs?: number;
    /** Called after the user accepts the native install prompt (e.g. request notification/camera permissions). */
    onInstalled?: () => unknown | Promise<unknown>;
    className?: string;
}
declare function PwaInstallPrompt({ appName, logoUrl, tagline, dismissKey, delayMs, repromptMs, onInstalled, className, }: PwaInstallPromptProps): react_jsx_runtime.JSX.Element | null;

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
declare const RELOAD_FLAG_KEY = "cv-stale-chunk-reload-at";
/** A chunk-load failure in its raw form, or React's downstream #185. */
declare function isStaleChunkError(reason: unknown): boolean;
declare function reloadOnce(): void;
/** Reloads for a chunk-load error; for a bare #185 only after confirming the bundle is stale. */
declare function recoverFromError(reason: unknown): void;
/** Window-level listener for chunk errors that never reach an error boundary. */
declare function StaleChunkRecovery(): null;

export { PwaInstallPrompt, type PwaInstallPromptProps, RELOAD_FLAG_KEY, StaleChunkRecovery, isStaleChunkError, recoverFromError, reloadOnce };
