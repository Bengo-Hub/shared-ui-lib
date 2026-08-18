import {
  BookOpen,
  FolderKanban,
  Globe,
  HeartPulse,
  Landmark,
  Library,
  Mail,
  PackageSearch,
  Package,
  Bell,
  Scale,
  ShoppingCart,
  Tag,
  Ticket,
  Truck,
  UserSquare,
  Users,
  Waypoints,
  Wifi,
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
 *
 * `category` groups the AppSwitcherGrid presentation (Zoho-style sectioned grid, scaled to this
 * platform's real ~17-service suite, not Zoho's own ~50-app marketplace). `color` picks a
 * per-service accent tint for the grid's icon cell — additive fields, existing consumers that
 * only destructure {key,label,href,Icon} are unaffected.
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
  | 'ticketing'
  | 'treasury'
  | 'notifications'
  | 'library'
  | 'mail'
  | 'ispbilling'
  | 'truload';

export type ServiceCategory = 'Commerce' | 'Operations' | 'Growth & Finance' | 'Platform' | 'Specialized';

export type ServiceAccent = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'fuchsia';

export interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  Icon: LucideIcon;
  category: ServiceCategory;
  color: ServiceAccent;
  /** Hidden from non-manager principals (matches each app's own manager/admin permission check). */
  manageOnly: boolean;
  /** subscriptions-api service tag, when this service is billable/gateable. Omit if not yet billed. */
  serviceTag?: string;
  /** 'coming-soon' entries render disabled with a "Soon" badge and are never linkable. */
  status: 'live' | 'coming-soon';
}

export const SERVICE_REGISTRY: ServiceDefinition[] = [
  // Commerce
  { key: 'pos', label: 'POS', Icon: ShoppingCart, category: 'Commerce', color: 'violet', manageOnly: false, serviceTag: 'pos', status: 'live' },
  { key: 'inventory', label: 'Inventory', Icon: Package, category: 'Commerce', color: 'blue', manageOnly: false, serviceTag: 'inventory', status: 'live' },
  { key: 'ordering', label: 'Online Store', Icon: Globe, category: 'Commerce', color: 'emerald', manageOnly: false, serviceTag: 'ordering', status: 'live' },

  // Operations
  { key: 'logistics', label: 'Logistics', Icon: Truck, category: 'Operations', color: 'amber', manageOnly: true, serviceTag: 'logistics', status: 'live' },
  { key: 'projects', label: 'Projects', Icon: FolderKanban, category: 'Operations', color: 'cyan', manageOnly: true, serviceTag: 'projects', status: 'live' },
  { key: 'sourcing', label: 'Sourcing', Icon: PackageSearch, category: 'Operations', color: 'blue', manageOnly: false, status: 'coming-soon' },
  { key: 'traceability', label: 'Traceability', Icon: Waypoints, category: 'Operations', color: 'emerald', manageOnly: false, status: 'coming-soon' },
  { key: 'truload', label: 'TruLoad', Icon: Scale, category: 'Operations', color: 'amber', manageOnly: true, status: 'live' },

  // Growth & Finance
  { key: 'marketflow', label: 'CRM (MarketFlow)', Icon: UserSquare, category: 'Growth & Finance', color: 'fuchsia', manageOnly: true, serviceTag: 'marketflow', status: 'live' },
  { key: 'erp', label: 'ERP', Icon: Users, category: 'Growth & Finance', color: 'rose', manageOnly: true, serviceTag: 'erp', status: 'live' },
  { key: 'treasury', label: 'Treasury (Books)', Icon: Landmark, category: 'Growth & Finance', color: 'emerald', manageOnly: true, status: 'live' },
  { key: 'subscriptions', label: 'Subscriptions', Icon: Tag, category: 'Growth & Finance', color: 'violet', manageOnly: true, status: 'live' },

  // Platform
  { key: 'auth', label: 'Account Portal', Icon: BookOpen, category: 'Platform', color: 'violet', manageOnly: false, status: 'live' },
  { key: 'mail', label: 'Mail', Icon: Mail, category: 'Platform', color: 'fuchsia', manageOnly: false, status: 'live' },
  { key: 'notifications', label: 'Notifications', Icon: Bell, category: 'Platform', color: 'amber', manageOnly: true, status: 'live' },
  { key: 'ticketing', label: 'Ticketing', Icon: Ticket, category: 'Platform', color: 'rose', manageOnly: false, status: 'live' },

  // Specialized
  { key: 'afya', label: 'Afya', Icon: HeartPulse, category: 'Specialized', color: 'rose', manageOnly: false, serviceTag: 'afya', status: 'live' },
  { key: 'library', label: 'Library', Icon: Library, category: 'Specialized', color: 'blue', manageOnly: false, status: 'live' },
  { key: 'ispbilling', label: 'ISP Billing', Icon: Wifi, category: 'Specialized', color: 'cyan', manageOnly: true, status: 'live' },
];
