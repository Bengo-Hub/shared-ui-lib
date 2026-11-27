import {
  BookOpen,
  Building2,
  Gift,
  FolderKanban,
  Globe,
  HeartPulse,
  Landmark,
  Library,
  Mail,
  Package,
  Bell,
  Scale,
  ShoppingCart,
  Tag,
  Ticket,
  Truck,
  UserSquare,
  Users,
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
  /** @deprecated Not listed any more; kept so host apps that still name it in `urls` type-check. */
  | 'sourcing'
  /** @deprecated Not listed any more; kept so host apps that still name it in `urls` type-check. */
  | 'traceability'
  | 'ticketing'
  | 'treasury'
  | 'notifications'
  | 'library'
  | 'mail'
  | 'ispbilling'
  | 'truload'
  | 'maskani'
  | 'hadia';

export type ServiceCategory = 'Commerce' | 'Finance & Growth' | 'People & Operations' | 'Industry' | 'Account & Support';

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
  /**
   * Tenant slug of a custom service built for one client (Hadia). Only that tenant ever sees it,
   * never as a locked tile, so other tenants never learn it exists. Its own users still see every
   * shared service. Billing stays on the tenant's ordinary plan (custom pricing), so this keys off
   * the tenant, not a service tag.
   */
  onlyForTenant?: string;
  /**
   * Fixed landing path for an app that does not route by tenant slug (it reads the tenant from the
   * session). When set, the link is `${base}${path}` instead of `${base}/${orgSlug}`.
   */
  path?: string;
}

/**
 * Production base URLs for services every host app should link to without configuring an env var.
 * A host's own `urls` entry always wins (staging, local). notifications-ui was missing from almost
 * every app's switcher because only two hosts passed its URL.
 */
export const DEFAULT_SERVICE_URLS: Partial<Record<ServiceKey, string>> = {
  // Production hosts (devops-k8s ingress, 27 November 2026). Without a default, a service a host
  // app did not configure disappeared from its switcher entirely, even as a "Not in your plan" tile
  // (hadia-ui never listed MarketFlow).
  pos: 'https://pos.codevertexafrica.com',
  inventory: 'https://inventory.codevertexafrica.com',
  ordering: 'https://ordering.codevertexafrica.com',
  treasury: 'https://books.codevertexafrica.com',
  marketflow: 'https://marketflow.codevertexafrica.com',
  projects: 'https://projects.codevertexafrica.com',
  logistics: 'https://logistics.codevertexafrica.com',
  afya: 'https://afya.codevertexafrica.com',
  library: 'https://library.codevertexafrica.com',
  maskani: 'https://maskaniapp.codevertexafrica.com',
  ispbilling: 'https://ispbilling.codevertexafrica.com',
  auth: 'https://accounts.codevertexafrica.com',
  subscriptions: 'https://pricing.codevertexafrica.com',
  notifications: 'https://notifications.codevertexafrica.com',
  ticketing: 'https://ticketing.codevertexafrica.com',
  mail: 'https://webmail.codevertexafrica.com',
  hadia: 'https://hadiafrica.com',
};

export const SERVICE_REGISTRY: ServiceDefinition[] = [
  // A label is the name, optionally followed by a short explanation in parentheses; AppSwitcherGrid
  // prints that part smaller, on its own line. Groups show in the order they first appear here.
  // Sourcing and Traceability are not built yet, so they are not listed (no "Soon" tiles).

  // Commerce
  { key: 'pos', label: 'Point of Sale (POS)', Icon: ShoppingCart, category: 'Commerce', color: 'violet', manageOnly: false, serviceTag: 'pos', status: 'live' },
  { key: 'inventory', label: 'Inventory & Procurement', Icon: Package, category: 'Commerce', color: 'blue', manageOnly: false, serviceTag: 'inventory', status: 'live' },
  { key: 'ordering', label: 'Storefront (e-Commerce)', Icon: Globe, category: 'Commerce', color: 'emerald', manageOnly: false, serviceTag: 'ordering', status: 'live' },

  // Finance & Growth
  { key: 'treasury', label: 'Treasury (Accounting & Ledgers)', Icon: Landmark, category: 'Finance & Growth', color: 'emerald', manageOnly: true, status: 'live' },
  { key: 'marketflow', label: 'CRM (MarketFlow)', Icon: UserSquare, category: 'Finance & Growth', color: 'fuchsia', manageOnly: true, serviceTag: 'marketflow', status: 'live' },

  // People & Operations
  { key: 'erp', label: 'ERP (HR & Payroll)', Icon: Users, category: 'People & Operations', color: 'rose', manageOnly: true, serviceTag: 'erp', status: 'live' },
  { key: 'projects', label: 'Projects & Tenders', Icon: FolderKanban, category: 'People & Operations', color: 'cyan', manageOnly: true, serviceTag: 'projects', status: 'live' },
  { key: 'logistics', label: 'Logistics & Courier', Icon: Truck, category: 'People & Operations', color: 'amber', manageOnly: true, serviceTag: 'logistics', status: 'live' },

  // Industry
  { key: 'afya', label: 'Hospital Management (Afya)', Icon: HeartPulse, category: 'Industry', color: 'rose', manageOnly: false, serviceTag: 'hospital', status: 'live' },
  { key: 'truload', label: 'TruLoad (Weighing & Axle Load)', Icon: Scale, category: 'Industry', color: 'amber', manageOnly: true, serviceTag: 'truload', status: 'live' },
  { key: 'library', label: 'Library', Icon: Library, category: 'Industry', color: 'blue', manageOnly: false, serviceTag: 'library', status: 'live' },
  { key: 'maskani', label: 'Property (Maskani)', Icon: Building2, category: 'Industry', color: 'fuchsia', manageOnly: false, serviceTag: 'maskani', status: 'live' },
  { key: 'ispbilling', label: 'ISP Billing', Icon: Wifi, category: 'Industry', color: 'cyan', manageOnly: true, serviceTag: 'isp_billing', status: 'live' },
  // Custom service for one client: only the hadia tenant ever sees it.
  { key: 'hadia', label: 'Hadia', Icon: Gift, category: 'Industry', color: 'emerald', manageOnly: true, status: 'live', onlyForTenant: 'hadia', path: '/admin' },

  // Account & Support
  { key: 'auth', label: 'Manage Account', Icon: BookOpen, category: 'Account & Support', color: 'violet', manageOnly: false, status: 'live', path: '/dashboard/my-tenant' },
  { key: 'subscriptions', label: 'Billing & Subscriptions', Icon: Tag, category: 'Account & Support', color: 'violet', manageOnly: true, status: 'live', path: '/billing' },
  { key: 'notifications', label: 'Notifications', Icon: Bell, category: 'Account & Support', color: 'amber', manageOnly: true, status: 'live', path: '/dashboard' },
  { key: 'ticketing', label: 'Ticketing', Icon: Ticket, category: 'Account & Support', color: 'rose', manageOnly: false, status: 'live' },
  { key: 'mail', label: 'Mail', Icon: Mail, category: 'Account & Support', color: 'fuchsia', manageOnly: false, status: 'live' },
];
