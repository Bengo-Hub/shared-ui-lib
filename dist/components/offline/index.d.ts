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

export { PwaInstallPrompt, type PwaInstallPromptProps };
