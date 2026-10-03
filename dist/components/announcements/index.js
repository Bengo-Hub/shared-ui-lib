import { AlertTriangle, Info, Sparkles, ArrowRight, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

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
  if (href.startsWith("/")) return { href, external: false };
  try {
    const external = typeof window === "undefined" || new URL(href).origin !== window.location.origin;
    return { href, external };
  } catch {
    return { href, external: true };
  }
}
function visibleAnnouncements(list, dismissed, isAdmin) {
  return list.filter((a) => (isAdmin || a.audience !== "admins") && !(a.dismissible && dismissed.includes(a.id)));
}
var TONES = {
  feature: { icon: Sparkles, badge: "New", ring: "border-primary/30", iconBox: "bg-primary/10 text-primary", badgeCls: "bg-primary text-primary-foreground" },
  info: { icon: Info, badge: "Update", ring: "border-sky-500/30", iconBox: "bg-sky-500/10 text-sky-600 dark:text-sky-400", badgeCls: "bg-sky-600 text-white" },
  warning: { icon: AlertTriangle, badge: "Notice", ring: "border-amber-500/40", iconBox: "bg-amber-500/10 text-amber-600 dark:text-amber-400", badgeCls: "bg-amber-500 text-white" }
};
function AnnouncementBanner({ service, orgSlug, viewerKey = "anon", isAdmin = false, apiBaseUrl = DEFAULT_API, className = "" }) {
  const [items, setItems] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setDismissed(readDismissed(viewerKey));
  }, [viewerKey]);
  useEffect(() => {
    let alive = true;
    const load = () => fetchActive(apiBaseUrl, service).then((list) => alive && setItems(list));
    void load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [apiBaseUrl, service]);
  const visible = useMemo(() => visibleAnnouncements(items, dismissed, isAdmin), [items, dismissed, isAdmin]);
  const current = visible[0];
  const dismiss = useCallback(() => {
    if (!current) return;
    const live = new Set(items.map((a) => a.id));
    const next = [...dismissed.filter((id) => live.has(id)), current.id];
    setDismissed(next);
    writeDismissed(viewerKey, next);
    setExpanded(false);
  }, [current, dismissed, items, viewerKey]);
  if (!current) return null;
  const tone = TONES[current.tone] ?? TONES.feature;
  const Icon = tone.icon;
  const link = current.cta_url ? resolveAnnouncementLink(current.cta_url, orgSlug) : null;
  const hasMore = current.highlights.length > 0;
  return /* @__PURE__ */ jsx(
    "section",
    {
      role: "status",
      "aria-label": current.title,
      className: `relative overflow-hidden rounded-2xl border ${tone.ring} bg-card text-card-foreground shadow-sm ${className}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-4 sm:gap-4 sm:p-5", children: [
        /* @__PURE__ */ jsx("div", { className: `flex size-10 shrink-0 items-center justify-center rounded-xl ${tone.iconBox}`, children: /* @__PURE__ */ jsx(Icon, { className: "size-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 pr-8", children: [
            /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone.badgeCls}`, children: tone.badge }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold sm:text-base", children: current.title }),
            visible.length > 1 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "1 of ",
              visible.length
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: current.summary }),
          expanded && hasMore && /* @__PURE__ */ jsx("ul", { className: "mt-3 grid gap-1.5 text-sm sm:grid-cols-2", children: current.highlights.map((h) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" }),
            /* @__PURE__ */ jsx("span", { children: h })
          ] }, h)) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
            link && current.cta_label && /* @__PURE__ */ jsxs(
              "a",
              {
                href: link.href,
                target: link.external ? "_blank" : void 0,
                rel: link.external ? "noopener noreferrer" : void 0,
                className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
                children: [
                  current.cta_label,
                  /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
                ]
              }
            ),
            hasMore && /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setExpanded((v) => !v),
                className: "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                "aria-expanded": expanded,
                children: [
                  expanded ? "Show less" : "What's included",
                  expanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "size-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "size-4" })
                ]
              }
            )
          ] })
        ] }),
        current.dismissible && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: dismiss,
            "aria-label": "Dismiss announcement",
            className: "absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            children: /* @__PURE__ */ jsx(X, { className: "size-4" })
          }
        )
      ] })
    }
  );
}

export { AnnouncementBanner, resolveAnnouncementLink, visibleAnnouncements };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map