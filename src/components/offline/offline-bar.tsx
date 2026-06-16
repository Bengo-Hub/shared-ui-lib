'use client';

import { useEffect } from 'react';
import { OfflineSyncBanner } from './offline-sync-banner';
import { useOfflineSync, registerServiceWorker } from './use-offline-sync';

export interface OfflineBarProps {
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
  className?: string;
}

/**
 * Drop-in offline/sync ribbon for any Codevertex frontend: registers the offline-shell service
 * worker and renders the shared OfflineSyncBanner (offline-mode + "Syncing offline data…").
 * Place once at the top of the app shell. Apps without an offline queue simply omit
 * getPendingCount and get the offline-mode banner only.
 */
export function OfflineBar({
  getPendingCount,
  availableOffline,
  disabledOffline,
  onSyncNow,
  swUrl = '/sw.js',
  registerSW = true,
  className,
}: OfflineBarProps) {
  useEffect(() => {
    if (registerSW) registerServiceWorker(swUrl);
  }, [registerSW, swUrl]);

  const { isOnline, pendingCount, syncing } = useOfflineSync({ getPendingCount });

  return (
    <OfflineSyncBanner
      isOnline={isOnline}
      pendingCount={pendingCount}
      syncing={syncing}
      availableOffline={availableOffline}
      disabledOffline={disabledOffline}
      onSyncNow={onSyncNow}
      className={className}
    />
  );
}
