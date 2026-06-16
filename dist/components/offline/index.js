import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { jsxs, jsx } from 'react/jsx-runtime';
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

export { OfflineSyncBanner, SyncedConfirmation, registerServiceWorker, useOfflineSync, useOnlineStatus };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map