'use client';

import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export interface OfflineSyncBannerProps {
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
export function OfflineSyncBanner({
  isOnline,
  pendingCount = 0,
  syncing,
  availableOffline,
  disabledOffline,
  onSyncNow,
  showSyncedConfirmation = true,
  className = '',
}: OfflineSyncBannerProps) {
  const isSyncing = syncing ?? (isOnline && pendingCount > 0);

  // OFFLINE ribbon
  if (!isOnline) {
    return (
      <div
        role="status"
        className={`flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white ${className}`}
      >
        <span className="inline-flex items-center gap-2">
          <WifiOff className="h-4 w-4 shrink-0" />
          Offline mode — your work is saved and will sync when you’re back online.
        </span>
        {availableOffline?.length ? (
          <span className="text-xs font-medium text-amber-50/90">
            Available: {availableOffline.join(', ')}
          </span>
        ) : null}
        {disabledOffline?.length ? (
          <span className="text-xs font-medium text-amber-50/90">
            Unavailable: {disabledOffline.join(', ')}
          </span>
        ) : null}
      </div>
    );
  }

  // SYNCING ribbon (back online, queue draining)
  if (isSyncing) {
    return (
      <div
        role="status"
        className={`flex w-full items-center justify-center gap-3 bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white ${className}`}
      >
        <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
        <span>Syncing offline data…{pendingCount > 0 ? ` (${pendingCount} remaining)` : ''}</span>
        {onSyncNow ? (
          <button
            type="button"
            onClick={onSyncNow}
            className="ml-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold hover:bg-white/30"
          >
            Sync now
          </button>
        ) : null}
      </div>
    );
  }

  // ONLINE + idle → nothing (optional brief synced flash handled by host via key remount)
  if (showSyncedConfirmation && pendingCount === 0) return null;
  return null;
}

/** Tiny standalone "all synced" toast-style confirmation (optional helper for hosts). */
export function SyncedConfirmation({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 ${className}`}>
      <CheckCircle2 className="h-4 w-4" /> All offline data synced
    </div>
  );
}
