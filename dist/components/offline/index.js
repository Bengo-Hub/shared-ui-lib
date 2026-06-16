import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useRef, useCallback } from 'react';

// src/components/offline/offline-sync-banner.tsx
function OfflineSyncBanner({
  isOnline,
  pendingCount = 0,
  syncing,
  availableOffline,
  disabledOffline,
  onSyncNow,
  showSyncedConfirmation = true,
  className = ""
}) {
  const isSyncing = syncing ?? (isOnline && pendingCount > 0);
  if (!isOnline) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        role: "status",
        className: `flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
        children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(WifiOff, { className: "h-4 w-4 shrink-0" }),
            "Offline mode \u2014 your work is saved and will sync when you\u2019re back online."
          ] }),
          availableOffline?.length ? /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-amber-50/90", children: [
            "Available: ",
            availableOffline.join(", ")
          ] }) : null,
          disabledOffline?.length ? /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-amber-50/90", children: [
            "Unavailable: ",
            disabledOffline.join(", ")
          ] }) : null
        ]
      }
    );
  }
  if (isSyncing) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        role: "status",
        className: `flex w-full items-center justify-center gap-3 bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
        children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 shrink-0 animate-spin" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Syncing offline data\u2026",
            pendingCount > 0 ? ` (${pendingCount} remaining)` : ""
          ] }),
          onSyncNow ? /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onSyncNow,
              className: "ml-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold hover:bg-white/30",
              children: "Sync now"
            }
          ) : null
        ]
      }
    );
  }
  if (showSyncedConfirmation && pendingCount === 0) return null;
  return null;
}
function SyncedConfirmation({ className = "" }) {
  return /* @__PURE__ */ jsxs("div", { className: `inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 ${className}`, children: [
    /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
    " All offline data synced"
  ] });
}
function buildIdFrom(html) {
  const m = html.match(/\/_next\/static\/([^/"']+)\/_(?:build|ssg)Manifest/);
  return m ? m[1] : null;
}
function currentBuildId() {
  if (typeof document === "undefined") return null;
  const el = document.querySelector('script[src*="_buildManifest"], link[href*="_buildManifest"]');
  const src = el?.getAttribute("src") || el?.getAttribute("href") || "";
  const fromEl = buildIdFrom(src);
  if (fromEl) return fromEl;
  return buildIdFrom(document.documentElement.outerHTML);
}
function PwaUpdater({ checkIntervalMs = 6e4, className = "" }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mine = currentBuildId();
    if (!mine) return;
    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch(window.location.href, { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) return;
        const server = buildIdFrom(await res.text());
        if (!stopped && server && server !== mine) setUpdateAvailable(true);
      } catch {
      }
    };
    const id = setInterval(check, checkIntervalMs);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    return () => {
      stopped = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, [checkIntervalMs]);
  const applyUpdate = async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update().catch(() => {
        })));
      }
    } catch {
    }
    window.location.reload();
  };
  if (!updateAvailable) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "status",
      className: `flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
      children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsx("span", { children: "A new version is available." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => void applyUpdate(),
            className: "rounded-full bg-white px-3 py-0.5 text-xs font-bold text-slate-900 hover:bg-slate-100",
            children: "Update now"
          }
        )
      ]
    }
  );
}
function useOnlineStatus() {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}
function registerServiceWorker(swUrl = "/sw.js") {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production") return;
  navigator.serviceWorker.register(swUrl, { scope: "/" }).catch(() => {
  });
}
function useOfflineSync(opts = {}) {
  const { getPendingCount, pollMs = 4e3 } = opts;
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
function OfflineBar({
  getPendingCount,
  availableOffline,
  disabledOffline,
  onSyncNow,
  swUrl = "/sw.js",
  registerSW = true,
  showUpdater = true,
  className
}) {
  useEffect(() => {
    if (registerSW) registerServiceWorker(swUrl);
  }, [registerSW, swUrl]);
  const { isOnline, pendingCount, syncing } = useOfflineSync({ getPendingCount });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    showUpdater ? /* @__PURE__ */ jsx(PwaUpdater, {}) : null,
    /* @__PURE__ */ jsx(
      OfflineSyncBanner,
      {
        isOnline,
        pendingCount,
        syncing,
        availableOffline,
        disabledOffline,
        onSyncNow,
        className
      }
    )
  ] });
}

export { OfflineBar, OfflineSyncBanner, PwaUpdater, SyncedConfirmation, registerServiceWorker, useOfflineSync, useOnlineStatus };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map