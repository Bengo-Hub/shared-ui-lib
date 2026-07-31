import { ShoppingCart, Package, Truck, UserSquare, Users, Globe, FolderKanban, HeartPulse, Tag, BookOpen, PackageSearch, Waypoints, Ticket } from 'lucide-react';
import { useMemo } from 'react';

// src/components/app-switcher/service-registry.ts
var SERVICE_REGISTRY = [
  { key: "pos", label: "POS", Icon: ShoppingCart, manageOnly: false, serviceTag: "pos", status: "live" },
  { key: "inventory", label: "Inventory", Icon: Package, manageOnly: false, serviceTag: "inventory", status: "live" },
  { key: "logistics", label: "Logistics", Icon: Truck, manageOnly: true, serviceTag: "logistics", status: "live" },
  { key: "marketflow", label: "CRM (MarketFlow)", Icon: UserSquare, manageOnly: true, serviceTag: "marketflow", status: "live" },
  { key: "erp", label: "ERP", Icon: Users, manageOnly: true, serviceTag: "erp", status: "live" },
  { key: "ordering", label: "Online Store", Icon: Globe, manageOnly: false, serviceTag: "ordering", status: "live" },
  { key: "projects", label: "Projects", Icon: FolderKanban, manageOnly: true, serviceTag: "projects", status: "live" },
  { key: "afya", label: "Afya", Icon: HeartPulse, manageOnly: false, serviceTag: "afya", status: "live" },
  { key: "subscriptions", label: "Subscriptions", Icon: Tag, manageOnly: true, serviceTag: void 0, status: "live" },
  { key: "auth", label: "Account Portal", Icon: BookOpen, manageOnly: false, serviceTag: void 0, status: "live" },
  { key: "sourcing", label: "Sourcing", Icon: PackageSearch, manageOnly: false, status: "coming-soon" },
  { key: "traceability", label: "Traceability", Icon: Waypoints, manageOnly: false, status: "coming-soon" },
  { key: "ticketing", label: "Ticketing", Icon: Ticket, manageOnly: false, status: "coming-soon" }
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

export { SERVICE_REGISTRY, useVisibleServices };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map