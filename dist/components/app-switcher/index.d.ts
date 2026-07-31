import { LucideIcon } from 'lucide-react';

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
type ServiceKey = 'pos' | 'inventory' | 'logistics' | 'marketflow' | 'erp' | 'ordering' | 'subscriptions' | 'auth' | 'projects' | 'afya' | 'sourcing' | 'traceability' | 'ticketing';
interface ServiceDefinition {
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
}
/**
 * Filters the canonical SERVICE_REGISTRY down to what this user/tenant should actually see in
 * the "SERVICES" profile-menu dropdown: RBAC (manageOnly) + subscription (serviceTag) gating,
 * with 'coming-soon' entries always included (disabled, no href) so the whole roadmap is visible.
 */
declare function useVisibleServices({ orgSlug, urls, canManageLinks, activeServiceTags, }: UseVisibleServicesOptions): VisibleService[];

export { SERVICE_REGISTRY, type ServiceDefinition, type ServiceKey, type UseVisibleServicesOptions, type VisibleService, useVisibleServices };
