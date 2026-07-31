import {
  BookOpen,
  FolderKanban,
  Globe,
  HeartPulse,
  PackageSearch,
  Package,
  ShoppingCart,
  Tag,
  Ticket,
  Truck,
  UserSquare,
  Users,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';

/**
 * Canonical cross-service link registry for the "SERVICES" profile-menu dropdown.
 *
 * Previously this list was hand-copied into every `*-ui`'s header.tsx (treasury, pos, inventory,
 * logistics, library), drifting slightly each time (different labels/icons/coverage). This is the
 * single source of truth; see use-visible-services.ts for the RBAC + subscription filtering that
 * turns this static list into what a given user should actually see.
 *
 * Deliberately does NOT resolve URLs itself (no `process.env.NEXT_PUBLIC_*` reads here) — each
 * consuming Next.js app must keep resolving its own env vars as literal expressions in its own
 * source so its bundler can statically inline them, then pass the resolved base URLs in via
 * `useVisibleServices({ urls })`. See each header.tsx's `SERVICE_URLS` map for the convention.
 */
export type ServiceKey =
  | 'pos'
  | 'inventory'
  | 'logistics'
  | 'marketflow'
  | 'erp'
  | 'ordering'
  | 'subscriptions'
  | 'auth'
  | 'projects'
  | 'afya'
  | 'sourcing'
  | 'traceability'
  | 'ticketing';

export interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  Icon: LucideIcon;
  /** Hidden from non-manager principals (matches each app's own manager/admin permission check). */
  manageOnly: boolean;
  /** subscriptions-api service tag, when this service is billable/gateable. Omit if not yet billed. */
  serviceTag?: string;
  /** 'coming-soon' entries render disabled with a "Soon" badge and are never linkable. */
  status: 'live' | 'coming-soon';
}

export const SERVICE_REGISTRY: ServiceDefinition[] = [
  { key: 'pos', label: 'POS', Icon: ShoppingCart, manageOnly: false, serviceTag: 'pos', status: 'live' },
  { key: 'inventory', label: 'Inventory', Icon: Package, manageOnly: false, serviceTag: 'inventory', status: 'live' },
  { key: 'logistics', label: 'Logistics', Icon: Truck, manageOnly: true, serviceTag: 'logistics', status: 'live' },
  { key: 'marketflow', label: 'CRM (MarketFlow)', Icon: UserSquare, manageOnly: true, serviceTag: 'marketflow', status: 'live' },
  { key: 'erp', label: 'ERP', Icon: Users, manageOnly: true, serviceTag: 'erp', status: 'live' },
  { key: 'ordering', label: 'Online Store', Icon: Globe, manageOnly: false, serviceTag: 'ordering', status: 'live' },
  { key: 'projects', label: 'Projects', Icon: FolderKanban, manageOnly: true, serviceTag: 'projects', status: 'live' },
  { key: 'afya', label: 'Afya', Icon: HeartPulse, manageOnly: false, serviceTag: 'afya', status: 'live' },
  { key: 'subscriptions', label: 'Subscriptions', Icon: Tag, manageOnly: true, serviceTag: undefined, status: 'live' },
  { key: 'auth', label: 'Account Portal', Icon: BookOpen, manageOnly: false, serviceTag: undefined, status: 'live' },
  { key: 'sourcing', label: 'Sourcing', Icon: PackageSearch, manageOnly: false, status: 'coming-soon' },
  { key: 'traceability', label: 'Traceability', Icon: Waypoints, manageOnly: false, status: 'coming-soon' },
  { key: 'ticketing', label: 'Ticketing', Icon: Ticket, manageOnly: false, status: 'coming-soon' },
];
