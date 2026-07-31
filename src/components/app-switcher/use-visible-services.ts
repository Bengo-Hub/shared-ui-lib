import { useMemo } from 'react';
import { SERVICE_REGISTRY, type ServiceDefinition, type ServiceKey } from './service-registry';

export interface VisibleService extends ServiceDefinition {
  /** Absolute link target, or null for a 'coming-soon' entry / a service the host app didn't configure a URL for. */
  href: string | null;
}

export interface UseVisibleServicesOptions {
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
export function useVisibleServices({
  orgSlug,
  urls,
  canManageLinks,
  activeServiceTags,
  include,
}: UseVisibleServicesOptions): VisibleService[] {
  return useMemo(() => {
    const allow = include ? new Set(include) : null;
    const out: VisibleService[] = [];
    for (const svc of SERVICE_REGISTRY) {
      if (allow && !allow.has(svc.key)) continue;
      if (svc.manageOnly && !canManageLinks) continue;

      if (svc.status === 'coming-soon') {
        out.push({ ...svc, href: null });
        continue;
      }

      if (
        svc.serviceTag &&
        activeServiceTags != null &&
        !activeServiceTags.includes(svc.serviceTag)
      ) {
        continue; // tenant's subscription is known and does not cover this service
      }

      const base = urls[svc.key];
      if (!base) continue; // host app doesn't link to this service at all

      out.push({ ...svc, href: `${base}/${orgSlug}` });
    }
    return out;
  }, [orgSlug, urls, canManageLinks, activeServiceTags, include]);
}
