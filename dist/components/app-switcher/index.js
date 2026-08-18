import { ShoppingCart, Package, Globe, Truck, FolderKanban, PackageSearch, Waypoints, Scale, UserSquare, Users, Landmark, Tag, BookOpen, Mail, Bell, Ticket, HeartPulse, Library, Wifi } from 'lucide-react';
import { useMemo } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/components/app-switcher/service-registry.ts
var SERVICE_REGISTRY = [
  // Commerce
  { key: "pos", label: "POS", Icon: ShoppingCart, category: "Commerce", color: "violet", manageOnly: false, serviceTag: "pos", status: "live" },
  { key: "inventory", label: "Inventory", Icon: Package, category: "Commerce", color: "blue", manageOnly: false, serviceTag: "inventory", status: "live" },
  { key: "ordering", label: "Online Store", Icon: Globe, category: "Commerce", color: "emerald", manageOnly: false, serviceTag: "ordering", status: "live" },
  // Operations
  { key: "logistics", label: "Logistics", Icon: Truck, category: "Operations", color: "amber", manageOnly: true, serviceTag: "logistics", status: "live" },
  { key: "projects", label: "Projects", Icon: FolderKanban, category: "Operations", color: "cyan", manageOnly: true, serviceTag: "projects", status: "live" },
  { key: "sourcing", label: "Sourcing", Icon: PackageSearch, category: "Operations", color: "blue", manageOnly: false, status: "coming-soon" },
  { key: "traceability", label: "Traceability", Icon: Waypoints, category: "Operations", color: "emerald", manageOnly: false, status: "coming-soon" },
  { key: "truload", label: "TruLoad", Icon: Scale, category: "Operations", color: "amber", manageOnly: true, status: "live" },
  // Growth & Finance
  { key: "marketflow", label: "CRM (MarketFlow)", Icon: UserSquare, category: "Growth & Finance", color: "fuchsia", manageOnly: true, serviceTag: "marketflow", status: "live" },
  { key: "erp", label: "ERP", Icon: Users, category: "Growth & Finance", color: "rose", manageOnly: true, serviceTag: "erp", status: "live" },
  { key: "treasury", label: "Treasury (Books)", Icon: Landmark, category: "Growth & Finance", color: "emerald", manageOnly: true, status: "live" },
  { key: "subscriptions", label: "Subscriptions", Icon: Tag, category: "Growth & Finance", color: "violet", manageOnly: true, status: "live" },
  // Platform
  { key: "auth", label: "Account Portal", Icon: BookOpen, category: "Platform", color: "violet", manageOnly: false, status: "live" },
  { key: "mail", label: "Mail", Icon: Mail, category: "Platform", color: "fuchsia", manageOnly: false, status: "live" },
  { key: "notifications", label: "Notifications", Icon: Bell, category: "Platform", color: "amber", manageOnly: true, status: "live" },
  { key: "ticketing", label: "Ticketing", Icon: Ticket, category: "Platform", color: "rose", manageOnly: false, status: "live" },
  // Specialized
  { key: "afya", label: "Afya", Icon: HeartPulse, category: "Specialized", color: "rose", manageOnly: false, serviceTag: "afya", status: "live" },
  { key: "library", label: "Library", Icon: Library, category: "Specialized", color: "blue", manageOnly: false, status: "live" },
  { key: "ispbilling", label: "ISP Billing", Icon: Wifi, category: "Specialized", color: "cyan", manageOnly: true, status: "live" }
];
function useVisibleServices({
  orgSlug,
  urls,
  canManageLinks,
  activeServiceTags,
  include
}) {
  return useMemo(() => {
    const allow = include ? new Set(include) : null;
    const out = [];
    for (const svc of SERVICE_REGISTRY) {
      if (allow && !allow.has(svc.key)) continue;
      if (svc.manageOnly && !canManageLinks) continue;
      if (svc.status === "coming-soon") {
        out.push({ ...svc, href: null });
        continue;
      }
      if (svc.serviceTag && activeServiceTags != null && !activeServiceTags.includes(svc.serviceTag)) {
        continue;
      }
      const base = urls[svc.key];
      if (!base) continue;
      out.push({ ...svc, href: `${base}/${orgSlug}` });
    }
    return out;
  }, [orgSlug, urls, canManageLinks, activeServiceTags, include]);
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
  return /* @__PURE__ */ jsxs("div", { className, children: [
    label !== "" && /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 px-1", children: [
      /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary", "aria-hidden": true }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-primary", children: label ?? "Codevertex Suite" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4", children: groupByCategory(services).map(([category, items]) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: category }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1.5 sm:grid-cols-4", children: items.map(
        ({ key, label: svcLabel, href, Icon, status, color }) => href ? /* @__PURE__ */ jsxs(
          "a",
          {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            onClick: onNavigate,
            className: "group flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors hover:bg-secondary",
            children: [
              /* @__PURE__ */ jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${ACCENT_CLASSES[color]}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold leading-tight text-foreground", children: svcLabel })
            ]
          },
          key
        ) : /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center opacity-50",
            title: status === "coming-soon" ? `${svcLabel} \u2014 coming soon` : svcLabel,
            children: [
              /* @__PURE__ */ jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl ${ACCENT_CLASSES[color]}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold leading-tight text-foreground", children: svcLabel }),
              status === "coming-soon" && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: "Soon" })
            ]
          },
          key
        )
      ) })
    ] }, category)) })
  ] });
}

export { AppSwitcherGrid, SERVICE_REGISTRY, useVisibleServices };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map