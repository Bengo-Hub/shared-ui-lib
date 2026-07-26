import { WifiOff, RefreshCw, CheckCircle2, Share, Download, X } from 'lucide-react';
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
var LEGACY_DOMAIN = "codevertexitsolutions.com";
var CURRENT_DOMAIN = "codevertexafrica.com";
function legacyRedirectUrl() {
  if (typeof window === "undefined") return null;
  const { hostname } = window.location;
  if (hostname !== LEGACY_DOMAIN && !hostname.endsWith(`.${LEGACY_DOMAIN}`)) return null;
  const newHost = hostname.slice(0, hostname.length - LEGACY_DOMAIN.length) + CURRENT_DOMAIN;
  return window.location.href.replace(hostname, newHost);
}
function buildIdFrom(html) {
  const m = html.match(/\/_next\/static\/([^/"']+)\/_(?:build|ssg)Manifest/);
  return m ? m[1] : null;
}
function scriptFingerprintFrom(html) {
  const matches = Array.from(html.matchAll(/<script[^>]+src="([^"]*\/_next\/static\/[^"]+)"/g)).map((m) => m[1]);
  if (matches.length === 0) return null;
  return matches.sort().join("|");
}
function fingerprintFrom(html) {
  return buildIdFrom(html) ?? scriptFingerprintFrom(html);
}
function PwaUpdater({ checkIntervalMs = 6e4, className = "" }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isLegacyDomain, setIsLegacyDomain] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (legacyRedirectUrl()) {
      setIsLegacyDomain(true);
      setUpdateAvailable(true);
      return;
    }
    const url = window.location.href;
    let stopped = false;
    let mine = null;
    const check = async () => {
      try {
        const res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) return;
        const fp = fingerprintFrom(await res.text());
        if (stopped || !fp) return;
        if (mine === null) {
          mine = fp;
        } else if (fp !== mine) {
          setUpdateAvailable(true);
        }
      } catch {
      }
    };
    void check();
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
    const redirect = legacyRedirectUrl();
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (redirect) {
          await Promise.all(regs.map((r) => r.unregister().catch(() => {
          })));
        } else {
          await Promise.all(regs.map((r) => r.update().catch(() => {
          })));
        }
      }
    } catch {
    }
    if (redirect) {
      window.location.replace(redirect);
    } else {
      window.location.reload();
    }
  };
  if (!updateAvailable) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "status",
      className: `flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
      children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsx("span", { children: isLegacyDomain ? "This app has moved to a new address." : "A new version is available." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => void applyUpdate(),
            className: "rounded-full bg-white px-3 py-0.5 text-xs font-bold text-slate-900 hover:bg-slate-100",
            children: isLegacyDomain ? "Continue" : "Update now"
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
var DEFAULT_DELAY_MS = 3e3;
var DEFAULT_REPROMPT_MS = 24 * 60 * 60 * 1e3;
function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}
function PwaInstallPrompt({
  appName,
  logoUrl,
  tagline = "Install for a faster, full-screen experience with offline access.",
  dismissKey,
  delayMs = DEFAULT_DELAY_MS,
  repromptMs = DEFAULT_REPROMPT_MS,
  onInstalled,
  className = ""
}) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ios, setIos] = useState(false);
  const promptRef = useRef(null);
  const isDismissedRecently = useCallback(() => {
    if (typeof window === "undefined") return false;
    return Date.now() < parseInt(localStorage.getItem(dismissKey) ?? "0", 10);
  }, [dismissKey]);
  useEffect(() => {
    if (isStandalone() || isDismissedRecently()) return;
    if (isIOS()) {
      setIos(true);
      const t = setTimeout(() => setVisible(true), delayMs);
      return () => clearTimeout(t);
    }
    const onPrompt = (e) => {
      e.preventDefault();
      promptRef.current = e;
      if (!isDismissedRecently()) setTimeout(() => setVisible(true), delayMs);
    };
    const onInstalledEvent = () => setVisible(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalledEvent);
    const timer = setInterval(() => {
      if (!isDismissedRecently() && promptRef.current) setVisible(true);
    }, repromptMs);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalledEvent);
      clearInterval(timer);
    };
  }, [delayMs, repromptMs, isDismissedRecently]);
  useEffect(() => {
    if (!visible) return;
    setMounted(false);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [visible]);
  const dismiss = useCallback(() => {
    localStorage.setItem(dismissKey, String(Date.now() + repromptMs));
    setVisible(false);
  }, [dismissKey, repromptMs]);
  const install = useCallback(async () => {
    if (!promptRef.current) return;
    promptRef.current.prompt();
    const { outcome } = await promptRef.current.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      await onInstalled?.();
    }
  }, [onInstalled]);
  if (!visible) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 sm:inset-x-auto sm:right-4 sm:justify-end transition-all duration-300 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`,
      style: { paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1rem)" },
      children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-black/25 ring-1 ring-black/5 backdrop-blur-xl", children: [
        /* @__PURE__ */ jsx("div", { className: "h-1 w-full bg-gradient-to-r from-primary/70 via-primary to-primary/70" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3.5 px-4 pt-4 pb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 rounded-2xl bg-primary/25 blur-md", "aria-hidden": true }),
            /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-2xl overflow-hidden ring-1 ring-border bg-white shadow-sm flex items-center justify-center", children: logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: appName, className: "h-full w-full object-contain p-1" }) : ios ? /* @__PURE__ */ jsx(Share, { className: "h-5 w-5 text-primary" }) : /* @__PURE__ */ jsx(Download, { className: "h-5 w-5 text-primary" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 pt-0.5", children: [
            /* @__PURE__ */ jsxs("p", { className: "font-semibold text-[0.95rem] leading-tight tracking-tight", children: [
              "Install ",
              appName
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-snug", children: ios ? "Add to your Home Screen for offline access." : tagline })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: dismiss,
              className: "h-7 w-7 rounded-lg flex items-center justify-center hover:bg-accent shrink-0 transition-colors -mt-0.5 -mr-1 text-muted-foreground",
              "aria-label": "Dismiss",
              children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }),
        ios ? /* @__PURE__ */ jsxs("ol", { className: "px-4 pb-4 space-y-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0", children: "1" }),
            "Tap ",
            /* @__PURE__ */ jsx(Share, { className: "h-3.5 w-3.5 inline mx-0.5 text-primary shrink-0" }),
            " ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Share" }),
            " in Safari"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0", children: "2" }),
            "Tap ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: '"Add to Home Screen"' })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: "h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0", children: "3" }),
            "Tap ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: '"Add"' })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 pb-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: dismiss,
              className: "flex-1 h-9 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors",
              children: "Later"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => void install(),
              className: "flex-1 h-9 rounded-lg text-sm font-medium text-primary-foreground flex items-center justify-center gap-1.5 bg-gradient-to-b from-primary to-primary/90 shadow-lg shadow-primary/25 hover:opacity-95 transition-opacity",
              children: [
                /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
                "Install"
              ]
            }
          )
        ] })
      ] })
    }
  );
}

export { OfflineBar, OfflineSyncBanner, PwaInstallPrompt, PwaUpdater, SyncedConfirmation, registerServiceWorker, useOfflineSync, useOnlineStatus };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map