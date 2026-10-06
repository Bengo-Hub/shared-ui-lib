'use strict';

var lucideReact = require('lucide-react');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/components/announcements/announcement-banner.tsx
var env = globalThis.process?.env ?? {};
var DEFAULT_API = env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "https://notificationsapi.codevertexafrica.com";
var REFRESH_MS = 10 * 60 * 1e3;
var STORAGE_PREFIX = "cv-announcements-dismissed:";
var inflight = /* @__PURE__ */ new Map();
function fetchActive(apiBaseUrl, service) {
  const key = `${apiBaseUrl}|${service}`;
  const hit = inflight.get(key);
  if (hit && Date.now() - hit.at < REFRESH_MS) return hit.promise;
  const promise = fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/announcements/active?service=${encodeURIComponent(service)}`, {
    headers: { Accept: "application/json" }
  }).then((res) => res.ok ? res.json() : { announcements: [] }).then((body) => body.announcements ?? []).catch(() => {
    inflight.delete(key);
    return [];
  });
  inflight.set(key, { at: Date.now(), promise });
  return promise;
}
function readDismissed(viewerKey) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + viewerKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
function writeDismissed(viewerKey, ids) {
  try {
    localStorage.setItem(STORAGE_PREFIX + viewerKey, JSON.stringify(ids));
  } catch {
  }
}
function resolveAnnouncementLink(url, orgSlug) {
  const href = url.replace(/\{orgSlug\}/g, encodeURIComponent(orgSlug ?? ""));
  if (href.startsWith("/") || href.startsWith("mailto:")) return { href, external: false };
  try {
    const external = typeof window === "undefined" || new URL(href).origin !== window.location.origin;
    return { href, external };
  } catch {
    return { href, external: true };
  }
}
function resolveAnnouncement(a, flags = {}) {
  const keys = Object.keys(a.variants ?? {}).sort();
  if (keys.some((k) => k in flags && flags[k] === void 0)) return null;
  const hit = keys.find((k) => flags[k] === true);
  if (!hit) return { ...a, dismissKey: a.id };
  const v = a.variants[hit];
  return {
    ...a,
    title: v.title || a.title,
    summary: v.summary,
    highlights: v.highlights ?? [],
    cta_label: v.cta_label,
    cta_url: v.cta_url,
    dismissKey: `${a.id}:${hit}`
  };
}
function visibleAnnouncements(list, dismissed, isAdmin, flags = {}) {
  return list.filter((a) => isAdmin || a.audience !== "admins").map((a) => resolveAnnouncement(a, flags)).filter((a) => !!a && !(a.dismissible && dismissed.includes(a.dismissKey)));
}
var TONES = {
  feature: { icon: lucideReact.Sparkles, badge: "New", ring: "border-primary/30", iconBox: "bg-primary/10 text-primary", badgeCls: "bg-primary text-primary-foreground" },
  info: { icon: lucideReact.Info, badge: "Update", ring: "border-sky-500/30", iconBox: "bg-sky-500/10 text-sky-600 dark:text-sky-400", badgeCls: "bg-sky-600 text-white" },
  warning: { icon: lucideReact.AlertTriangle, badge: "Notice", ring: "border-amber-500/40", iconBox: "bg-amber-500/10 text-amber-600 dark:text-amber-400", badgeCls: "bg-amber-500 text-white" }
};
function AnnouncementBanner({ service, orgSlug, viewerKey = "anon", isAdmin = false, flags, apiBaseUrl = DEFAULT_API, className = "" }) {
  const [items, setItems] = react.useState([]);
  const [dismissed, setDismissed] = react.useState([]);
  const [expanded, setExpanded] = react.useState(false);
  react.useEffect(() => {
    setDismissed(readDismissed(viewerKey));
  }, [viewerKey]);
  react.useEffect(() => {
    let alive = true;
    const load = () => fetchActive(apiBaseUrl, service).then((list) => alive && setItems(list));
    void load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [apiBaseUrl, service]);
  const flagsKey = JSON.stringify(flags ?? {});
  const visible = react.useMemo(
    () => visibleAnnouncements(items, dismissed, isAdmin, JSON.parse(flagsKey)),
    [items, dismissed, isAdmin, flagsKey]
  );
  const current = visible[0];
  const dismiss = react.useCallback(() => {
    if (!current) return;
    const live = new Set(items.map((a) => a.id));
    const next = [...dismissed.filter((key) => live.has(key.split(":")[0])), current.dismissKey];
    setDismissed(next);
    writeDismissed(viewerKey, next);
    setExpanded(false);
  }, [current, dismissed, items, viewerKey]);
  if (!current) return null;
  const tone = TONES[current.tone] ?? TONES.feature;
  const Icon = tone.icon;
  const link = current.cta_url ? resolveAnnouncementLink(current.cta_url, orgSlug) : null;
  const hasMore = current.highlights.length > 0;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "section",
    {
      role: "status",
      "aria-label": current.title,
      className: `relative overflow-hidden rounded-2xl border ${tone.ring} bg-card text-card-foreground shadow-sm ${className}`,
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-3 p-4 sm:gap-4 sm:p-5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: `flex size-10 shrink-0 items-center justify-center rounded-xl ${tone.iconBox}`, children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-2 pr-8", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone.badgeCls}`, children: tone.badge }),
            /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-semibold sm:text-base", children: current.title }),
            visible.length > 1 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "1 of ",
              visible.length
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: current.summary }),
          expanded && hasMore && /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "mt-3 grid gap-1.5 text-sm sm:grid-cols-2", children: current.highlights.map((h) => /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: h })
          ] }, h)) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
            link && current.cta_label && /* @__PURE__ */ jsxRuntime.jsxs(
              "a",
              {
                href: link.href,
                target: link.external ? "_blank" : void 0,
                rel: link.external ? "noopener noreferrer" : void 0,
                className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
                children: [
                  current.cta_label,
                  /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowRight, { className: "size-4" })
                ]
              }
            ),
            hasMore && /* @__PURE__ */ jsxRuntime.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setExpanded((v) => !v),
                className: "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                "aria-expanded": expanded,
                children: [
                  expanded ? "Show less" : "What's included",
                  expanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, { className: "size-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "size-4" })
                ]
              }
            )
          ] })
        ] }),
        current.dismissible && /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: dismiss,
            "aria-label": "Dismiss announcement",
            className: "absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "size-4" })
          }
        )
      ] })
    }
  );
}

exports.AnnouncementBanner = AnnouncementBanner;
exports.resolveAnnouncement = resolveAnnouncement;
exports.resolveAnnouncementLink = resolveAnnouncementLink;
exports.visibleAnnouncements = visibleAnnouncements;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map