'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export interface PwaUpdaterProps {
  /** How often to check the server for a new service worker, ms (default 60s). */
  checkIntervalMs?: number;
  className?: string;
}

/**
 * Standard PWA update banner — uniform across every Codevertex frontend.
 *
 * next-pwa (built with `next build --webpack`) emits a fresh service worker on every build, so
 * the browser detects the change and the new worker installs into the "waiting" state (we keep
 * skipWaiting:false). This banner surfaces that, and on "Update now" tells the waiting worker to
 * activate (SKIP_WAITING) and reloads once it takes control — effectively replacing the old
 * cached version with the latest deploy.
 */
export function PwaUpdater({ checkIntervalMs = 60_000, className = '' }: PwaUpdaterProps) {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    let reg: ServiceWorkerRegistration | undefined;
    let reloaded = false;

    const trackInstalling = (worker: ServiceWorker | null) => {
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        // A new worker reaching "installed" while one already controls = an update is waiting.
        if (worker.state === 'installed' && navigator.serviceWorker.controller) setWaiting(worker);
      });
    };

    navigator.serviceWorker.getRegistration().then((r) => {
      if (!r) return;
      reg = r;
      if (r.waiting && navigator.serviceWorker.controller) setWaiting(r.waiting);
      r.addEventListener('updatefound', () => trackInstalling(r.installing));
    });

    // The new worker activating (after SKIP_WAITING) fires controllerchange → reload to the new version.
    const onController = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onController);

    // Periodically ask the browser to re-check sw.js so long-open sessions notice new deploys.
    const id = setInterval(() => reg?.update().catch(() => {}), checkIntervalMs);
    return () => {
      clearInterval(id);
      navigator.serviceWorker.removeEventListener('controllerchange', onController);
    };
  }, [checkIntervalMs]);

  if (!waiting) return null;

  return (
    <div
      role="status"
      className={`flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white ${className}`}
    >
      <RefreshCw className="h-4 w-4 shrink-0" />
      <span>A new version is available.</span>
      <button
        type="button"
        onClick={() => waiting.postMessage({ type: 'SKIP_WAITING' })}
        className="rounded-full bg-white px-3 py-0.5 text-xs font-bold text-slate-900 hover:bg-slate-100"
      >
        Update now
      </button>
    </div>
  );
}
