'use strict';

var lucideReact = require('lucide-react');
var react = require('react');

// src/components/app-switcher/service-registry.ts
var SERVICE_REGISTRY = [
  { key: "pos", label: "POS", Icon: lucideReact.ShoppingCart, manageOnly: false, serviceTag: "pos", status: "live" },
  { key: "inventory", label: "Inventory", Icon: lucideReact.Package, manageOnly: false, serviceTag: "inventory", status: "live" },
  { key: "logistics", label: "Logistics", Icon: lucideReact.Truck, manageOnly: true, serviceTag: "logistics", status: "live" },
  { key: "marketflow", label: "CRM (MarketFlow)", Icon: lucideReact.UserSquare, manageOnly: true, serviceTag: "marketflow", status: "live" },
  { key: "erp", label: "ERP", Icon: lucideReact.Users, manageOnly: true, serviceTag: "erp", status: "live" },
  { key: "ordering", label: "Online Store", Icon: lucideReact.Globe, manageOnly: false, serviceTag: "ordering", status: "live" },
  { key: "projects", label: "Projects", Icon: lucideReact.FolderKanban, manageOnly: true, serviceTag: "projects", status: "live" },
  { key: "afya", label: "Afya", Icon: lucideReact.HeartPulse, manageOnly: false, serviceTag: "afya", status: "live" },
  { key: "subscriptions", label: "Subscriptions", Icon: lucideReact.Tag, manageOnly: true, serviceTag: void 0, status: "live" },
  { key: "auth", label: "Account Portal", Icon: lucideReact.BookOpen, manageOnly: false, serviceTag: void 0, status: "live" },
  { key: "sourcing", label: "Sourcing", Icon: lucideReact.PackageSearch, manageOnly: false, status: "coming-soon" },
  { key: "traceability", label: "Traceability", Icon: lucideReact.Waypoints, manageOnly: false, status: "coming-soon" },
  { key: "ticketing", label: "Ticketing", Icon: lucideReact.Ticket, manageOnly: false, status: "coming-soon" }
];
function useVisibleServices({
  orgSlug,
  urls,
  canManageLinks,
  activeServiceTags,
  include
}) {
  return react.useMemo(() => {
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

exports.SERVICE_REGISTRY = SERVICE_REGISTRY;
exports.useVisibleServices = useVisibleServices;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map