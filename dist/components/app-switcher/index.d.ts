import { LucideIcon } from 'lucide-react';
import * as react_jsx_runtime from 'react/jsx-runtime';

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
type ServiceKey = 'pos' | 'inventory' | 'logistics' | 'marketflow' | 'erp' | 'ordering' | 'subscriptions' | 'auth' | 'projects' | 'afya' | 'sourcing' | 'traceability' | 'ticketing' | 'treasury' | 'notifications' | 'library' | 'mail' | 'ispbilling' | 'truload';
type ServiceCategory = 'Commerce' | 'Operations' | 'Growth & Finance' | 'Platform' | 'Specialized';
type ServiceAccent = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'fuchsia';
interface ServiceDefinition {
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
declare const SERVICE_REGISTRY: ServiceDefinition[];

interface VisibleService extends ServiceDefinition {
    /** Absolute link target, or null for a 'coming-soon' entry / a service the host app didn't configure a URL for. */
    href: string | null;
}
interface UseVisibleServicesOptions {
    /** Tenant/org slug appended to each service's base URL (`${base}/${orgSlug}`). */
    orgSlug: string;
    /**
     * Base URL per service, already resolved by the HOST app from its own
     * `process.env.NEXT_PUBLIC_*` literals (so its own bundler can statically inline them) —
     * see each header.tsx's own env-var block. A service the host doesn't configure a URL for is
     * silently omitted (not every app links to every service).
     */
    urls: Partial<Record<ServiceKey, string>>;
    /** Whether the current user can see 'manageOnly' (admin-flavored) shortcuts. */
    canManageLinks: boolean;
    /**
     * Service tags the tenant currently has an ACTIVE subscription for. `null`/`undefined` means
     * "subscription status unknown" (e.g. the fetch hasn't completed or failed) and fails OPEN —
     * every service still shows — matching this codebase's existing "never block the UI on a
     * subscription-fetch failure" convention (see fetchSubscriptionInfo). Pass the real (possibly
     * empty) array once known so an un-subscribed tenant stops seeing gated services.
     */
    activeServiceTags?: string[] | null;
    /**
     * Restricts the registry to exactly these keys (in registry order), for a host app that
     * intentionally curates a smaller cross-link list (e.g. logistics-ui/library-ui only ever
     * linked to Account Portal + Subscriptions). Omit to use the full registry.
     */
    include?: ServiceKey[];
}
/**
 * Filters the canonical SERVICE_REGISTRY down to what this user/tenant should actually see in
 * the "SERVICES" profile-menu dropdown: RBAC (manageOnly) + subscription (serviceTag) gating,
 * with 'coming-soon' entries always included (disabled, no href) so the whole roadmap is visible.
 */
declare function useVisibleServices({ orgSlug, urls, canManageLinks, activeServiceTags, include, }: UseVisibleServicesOptions): VisibleService[];

/**
 * Icon-grid presentation of useVisibleServices()'s output — the "SERVICES"
 * profile-menu content every *-ui currently hand-rolls as its own vertical
 * list (pos-ui/inventory-ui/treasury-ui/logistics-ui/library-ui/hospital-ui
 * header.tsx, byte-for-byte duplicated). Grouped by category and given a
 * distinct accent color per service — Zoho's own app-switcher groups by
 * category and colors each tile; this is the same idea scaled to this
 * platform's real ~17-service suite, not a copy of Zoho's ~50-app grid.
 *
 * Ships raw Tailwind semantic-token classNames like the rest of
 * shared-ui-lib — no CSS pipeline, no portal/popover dependency, works on
 * any host (Radix-based shadcn or @base-ui).
 *
 * Purely presentational: fetch/filter via useVisibleServices first, then
 * pass the result here. `onNavigate` fires on any click (link or disabled
 * coming-soon cell) — typically used to close the parent menu/panel.
 */
interface AppSwitcherGridProps {
    services: VisibleService[];
    /** Called after a live service link is clicked (e.g. to close a menu). */
    onNavigate?: () => void;
    /** Shown above the grid — defaults to a Codevertex-branded eyebrow label.
     * Pass an empty string to suppress the header entirely (e.g. when embedding
     * this inside another surface, like AccountPanel, that already has its own heading). */
    label?: string;
    className?: string;
}
declare function AppSwitcherGrid({ services, onNavigate, label, className }: AppSwitcherGridProps): react_jsx_runtime.JSX.Element | null;

/**
 * Self-contained quick-access "apps" launcher — a header icon button that opens
 * AppSwitcherGrid in a small anchored popover. Ports auth-ui's own Grid3x3
 * icon-trigger pattern (first built for DashboardTopNav) into a single reusable
 * component so every other *-ui gets the same quick-launch affordance instead
 * of only reaching the switcher through the full AccountPanel slide-over.
 *
 * Portals to `document.body` and positions itself from the trigger button's
 * own bounding rect (the same technique this fleet's headers already use for
 * their own anchored dropdowns) — required because a host header's
 * `backdrop-filter`/`transform` would otherwise clip a plain `fixed` popover
 * (see AccountPanel's own doc comment for the same gotcha).
 */
interface AppSwitcherTriggerProps {
    services: VisibleService[];
    className?: string;
    /** Fires after a live service is clicked, or the backdrop is clicked. */
    onNavigate?: () => void;
}
declare function AppSwitcherTrigger({ services, className, onNavigate }: AppSwitcherTriggerProps): react_jsx_runtime.JSX.Element | null;

export { AppSwitcherGrid, type AppSwitcherGridProps, AppSwitcherTrigger, type AppSwitcherTriggerProps, SERVICE_REGISTRY, type ServiceDefinition, type ServiceKey, type UseVisibleServicesOptions, type VisibleService, useVisibleServices };
