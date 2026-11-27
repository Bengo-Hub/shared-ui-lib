'use strict';

var lucideReact = require('lucide-react');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
var reactDom = require('react-dom');

// src/components/app-switcher/service-registry.ts
var DEFAULT_SERVICE_URLS = {
  // Production hosts (devops-k8s ingress, 27 November 2026). Without a default, a service a host
  // app did not configure disappeared from its switcher entirely, even as a "Not in your plan" tile
  // (hadia-ui never listed MarketFlow).
  pos: "https://pos.codevertexafrica.com",
  inventory: "https://inventory.codevertexafrica.com",
  ordering: "https://ordering.codevertexafrica.com",
  treasury: "https://books.codevertexafrica.com",
  marketflow: "https://marketflow.codevertexafrica.com",
  projects: "https://projects.codevertexafrica.com",
  logistics: "https://logistics.codevertexafrica.com",
  afya: "https://afya.codevertexafrica.com",
  library: "https://library.codevertexafrica.com",
  maskani: "https://maskaniapp.codevertexafrica.com",
  ispbilling: "https://ispbilling.codevertexafrica.com",
  auth: "https://accounts.codevertexafrica.com",
  subscriptions: "https://pricing.codevertexafrica.com",
  notifications: "https://notifications.codevertexafrica.com",
  ticketing: "https://ticketing.codevertexafrica.com",
  mail: "https://webmail.codevertexafrica.com",
  hadia: "https://hadiafrica.com"
};
var SERVICE_REGISTRY = [
  // A label is the name, optionally followed by a short explanation in parentheses; AppSwitcherGrid
  // prints that part smaller, on its own line. Groups show in the order they first appear here.
  // Sourcing and Traceability are not built yet, so they are not listed (no "Soon" tiles).
  // Commerce
  { key: "pos", label: "Point of Sale (POS)", Icon: lucideReact.ShoppingCart, category: "Commerce", color: "violet", manageOnly: false, serviceTag: "pos", status: "live" },
  { key: "inventory", label: "Inventory & Procurement", Icon: lucideReact.Package, category: "Commerce", color: "blue", manageOnly: false, serviceTag: "inventory", status: "live" },
  { key: "ordering", label: "Storefront (e-Commerce)", Icon: lucideReact.Globe, category: "Commerce", color: "emerald", manageOnly: false, serviceTag: "ordering", status: "live" },
  // Finance & Growth
  { key: "treasury", label: "Treasury (Accounting & Ledgers)", Icon: lucideReact.Landmark, category: "Finance & Growth", color: "emerald", manageOnly: true, status: "live" },
  { key: "marketflow", label: "CRM (MarketFlow)", Icon: lucideReact.UserSquare, category: "Finance & Growth", color: "fuchsia", manageOnly: true, serviceTag: "marketflow", status: "live" },
  // People & Operations
  { key: "erp", label: "ERP (HR & Payroll)", Icon: lucideReact.Users, category: "People & Operations", color: "rose", manageOnly: true, serviceTag: "erp", status: "live" },
  { key: "projects", label: "Projects & Tenders", Icon: lucideReact.FolderKanban, category: "People & Operations", color: "cyan", manageOnly: true, serviceTag: "projects", status: "live" },
  { key: "logistics", label: "Logistics & Courier", Icon: lucideReact.Truck, category: "People & Operations", color: "amber", manageOnly: true, serviceTag: "logistics", status: "live" },
  // Industry
  { key: "afya", label: "Hospital Management (Afya)", Icon: lucideReact.HeartPulse, category: "Industry", color: "rose", manageOnly: false, serviceTag: "hospital", status: "live" },
  { key: "truload", label: "TruLoad (Weighing & Axle Load)", Icon: lucideReact.Scale, category: "Industry", color: "amber", manageOnly: true, serviceTag: "truload", status: "live" },
  { key: "library", label: "Library", Icon: lucideReact.Library, category: "Industry", color: "blue", manageOnly: false, serviceTag: "library", status: "live" },
  { key: "maskani", label: "Property (Maskani)", Icon: lucideReact.Building2, category: "Industry", color: "fuchsia", manageOnly: false, serviceTag: "maskani", status: "live" },
  { key: "ispbilling", label: "ISP Billing", Icon: lucideReact.Wifi, category: "Industry", color: "cyan", manageOnly: true, serviceTag: "isp_billing", status: "live" },
  // Custom service for one client: only the hadia tenant ever sees it.
  { key: "hadia", label: "Hadia", Icon: lucideReact.Gift, category: "Industry", color: "emerald", manageOnly: true, status: "live", onlyForTenant: "hadia", path: "/admin" },
  // Account & Support
  { key: "auth", label: "Manage Account", Icon: lucideReact.BookOpen, category: "Account & Support", color: "violet", manageOnly: false, status: "live", path: "/dashboard/my-tenant" },
  { key: "subscriptions", label: "Billing & Subscriptions", Icon: lucideReact.Tag, category: "Account & Support", color: "violet", manageOnly: true, status: "live", path: "/billing" },
  { key: "notifications", label: "Notifications", Icon: lucideReact.Bell, category: "Account & Support", color: "amber", manageOnly: true, status: "live", path: "/dashboard" },
  { key: "ticketing", label: "Ticketing", Icon: lucideReact.Ticket, category: "Account & Support", color: "rose", manageOnly: false, status: "live" },
  { key: "mail", label: "Mail", Icon: lucideReact.Mail, category: "Account & Support", color: "fuchsia", manageOnly: false, status: "live" }
];

// src/components/app-switcher/visible-services.ts
function originOf(url) {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}
function computeVisibleServices({
  orgSlug,
  urls,
  canManageLinks,
  activeServiceTags,
  lockUnsubscribed = true,
  upgradeUrl,
  include,
  current,
  currentOrigin
}, registry, defaults) {
  const allow = include ? new Set(include) : null;
  const here = originOf(currentOrigin);
  const out = [];
  for (const svc of registry) {
    if (allow && !allow.has(svc.key)) continue;
    if (current && svc.key === current) continue;
    if (here && originOf(urls[svc.key] ?? defaults[svc.key]) === here) continue;
    if (svc.manageOnly && !canManageLinks) continue;
    if (svc.onlyForTenant && svc.onlyForTenant !== orgSlug) continue;
    const entitled = !!svc.serviceTag && activeServiceTags != null && activeServiceTags.includes(svc.serviceTag);
    const base = urls[svc.key] ?? defaults[svc.key];
    if (svc.status === "coming-soon") {
      out.push({ ...svc, href: null });
      continue;
    }
    if (svc.serviceTag && activeServiceTags != null && !entitled) {
      if (lockUnsubscribed && base) out.push({ ...svc, href: upgradeUrl ?? null, locked: true });
      continue;
    }
    if (!base) continue;
    out.push({ ...svc, href: svc.path ? `${base}${svc.path}` : `${base}/${orgSlug}` });
  }
  return out;
}

// src/components/app-switcher/use-visible-services.ts
function computeVisibleServices2(opts) {
  return computeVisibleServices(opts, SERVICE_REGISTRY, DEFAULT_SERVICE_URLS);
}
function useVisibleServices(opts) {
  const { orgSlug, urls, canManageLinks, activeServiceTags, lockUnsubscribed, upgradeUrl, include, current } = opts;
  const currentOrigin = opts.currentOrigin ?? (typeof window !== "undefined" ? window.location.origin : void 0);
  return react.useMemo(
    () => computeVisibleServices2({ orgSlug, urls, canManageLinks, activeServiceTags, lockUnsubscribed, upgradeUrl, include, current, currentOrigin }),
    [orgSlug, urls, canManageLinks, activeServiceTags, lockUnsubscribed, upgradeUrl, include, current, currentOrigin]
  );
}

// src/components/app-switcher/service-tags-from-token.ts
function serviceTagsFromAccessToken(token) {
  if (!token) return void 0;
  const part = token.split(".")[1];
  if (!part) return void 0;
  try {
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    const json = typeof atob === "function" ? decodeURIComponent(
      Array.from(atob(b64), (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    ) : Buffer.from(b64, "base64").toString("utf8");
    const claims = JSON.parse(json);
    if (claims.is_platform_owner || claims.is_demo || claims.sub_exempt || claims.billing_mode === "service_charge") {
      return void 0;
    }
    const tags = claims.active_service_tags;
    return Array.isArray(tags) ? tags.filter((t) => typeof t === "string") : void 0;
  } catch {
    return void 0;
  }
}
var ACCENT_CLASSES = {
  violet: "bg-violet-500/10 text-violet-600 group-hover:bg-violet-500/15 dark:text-violet-400",
  blue: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/15 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/15 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500/15 dark:text-rose-400",
  cyan: "bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-500/15 dark:text-cyan-400",
  fuchsia: "bg-fuchsia-500/10 text-fuchsia-600 group-hover:bg-fuchsia-500/15 dark:text-fuchsia-400"
};
var GRID_STYLE = { gridTemplateColumns: "repeat(auto-fill, minmax(min(5.75rem, 100%), 1fr))" };
function TileLabel({ label }) {
  const m = /^(.+?)\s*\((.+)\)$/.exec(label);
  return /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "w-full break-words text-xs font-semibold leading-tight text-foreground", children: [
    m ? m[1] : label,
    m && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mt-0.5 block text-[10px] font-medium leading-tight text-muted-foreground", children: m[2] })
  ] });
}
function LockedTile({
  label,
  href,
  Icon,
  accent,
  onNavigate
}) {
  const body = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl opacity-60 ${accent}`, children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntime.jsx(TileLabel, { label }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: "Not in your plan" })
  ] });
  const cls = "flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center";
  return href ? /* @__PURE__ */ jsxRuntime.jsx("a", { href, target: "_blank", rel: "noopener noreferrer", onClick: onNavigate, title: `${label} is not in your plan. Open plans.`, className: `${cls} transition-colors hover:bg-secondary`, children: body }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${cls} opacity-70`, title: `${label} is not in your plan`, children: body });
}
function groupByCategory(services) {
  const groups = /* @__PURE__ */ new Map();
  for (const svc of services) {
    const list = groups.get(svc.category) ?? [];
    list.push(svc);
    groups.set(svc.category, list);
  }
  return Array.from(groups.entries());
}
function AppSwitcherGrid({ services, onNavigate, label, className }) {
  if (services.length === 0) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className, children: [
    label !== "" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-3 flex items-center gap-2 px-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-primary", children: label ?? "Codevertex Suite" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-4", children: groupByCategory(services).map(([category, items]) => /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: category }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid gap-1.5", style: GRID_STYLE, children: items.map(
        ({ key, label: svcLabel, href, Icon, status, color, locked }) => locked ? /* @__PURE__ */ jsxRuntime.jsx(LockedTile, { label: svcLabel, href, Icon, accent: ACCENT_CLASSES[color], onNavigate }, key) : href ? /* @__PURE__ */ jsxRuntime.jsxs(
          "a",
          {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            onClick: onNavigate,
            className: "group flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors hover:bg-secondary",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${ACCENT_CLASSES[color]}`, children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxRuntime.jsx(TileLabel, { label: svcLabel })
            ]
          },
          key
        ) : /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: "flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center opacity-50",
            title: status === "coming-soon" ? `${svcLabel} \u2014 coming soon` : svcLabel,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl ${ACCENT_CLASSES[color]}`, children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxRuntime.jsx(TileLabel, { label: svcLabel }),
              status === "coming-soon" && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: "Soon" })
            ]
          },
          key
        )
      ) })
    ] }, category)) })
  ] });
}
var PANEL_WIDTH = 420;
var EDGE = 8;
function AppSwitcherTrigger({ services, className, onNavigate }) {
  const [open, setOpen] = react.useState(false);
  const btnRef = react.useRef(null);
  const [pos, setPos] = react.useState(null);
  react.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  if (services.length === 0) return null;
  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const width = Math.min(PANEL_WIDTH, vw - 2 * EDGE);
      const right = Math.min(Math.max(EDGE, vw - r.right), vw - EDGE - width);
      setPos({ top: r.bottom + EDGE, right, width });
    }
    setOpen((v) => !v);
  };
  const close = () => {
    setOpen(false);
    onNavigate?.();
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        ref: btnRef,
        type: "button",
        onClick: toggle,
        "aria-label": "Codevertex apps",
        "aria-expanded": open,
        "aria-haspopup": "true",
        className: className ?? "relative inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Grid3x3, { className: "h-5 w-5" })
      }
    ),
    open && pos && typeof document !== "undefined" && reactDom.createPortal(
      /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 z-[90]", onClick: close, "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            role: "dialog",
            "aria-label": "Codevertex apps",
            className: "fixed z-[91] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover p-4 shadow-2xl",
            style: { top: pos.top, right: pos.right, width: pos.width, maxHeight: `calc(100dvh - ${pos.top + EDGE}px)` },
            children: /* @__PURE__ */ jsxRuntime.jsx(AppSwitcherGrid, { services, onNavigate: close })
          }
        )
      ] }),
      document.body
    )
  ] });
}

exports.AppSwitcherGrid = AppSwitcherGrid;
exports.AppSwitcherTrigger = AppSwitcherTrigger;
exports.DEFAULT_SERVICE_URLS = DEFAULT_SERVICE_URLS;
exports.SERVICE_REGISTRY = SERVICE_REGISTRY;
exports.computeVisibleServices = computeVisibleServices2;
exports.serviceTagsFromAccessToken = serviceTagsFromAccessToken;
exports.useVisibleServices = useVisibleServices;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map