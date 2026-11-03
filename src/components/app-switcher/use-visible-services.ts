import { useMemo } from 'react';
import { DEFAULT_SERVICE_URLS, SERVICE_REGISTRY, type ServiceKey } from './service-registry';
import { computeVisibleServices as compute, type VisibleService } from './visible-services';

export type { VisibleService };

export interface UseVisibleServicesOptions {
  /** Tenant/org slug appended to each service's base URL (`${base}/${orgSlug}`). */
  orgSlug: string;
  /**
   * Base URL per service, already resolved by the HOST app from its own
   * `process.env.NEXT_PUBLIC_*` literals (so its own bundler can statically inline them) —
   * see each header.tsx's own env-var block. A service the host doesn't configure a URL for falls
   * back to DEFAULT_SERVICE_URLS, and is omitted only when it has no default either.
   */
  urls: Partial<Record<ServiceKey, string>>;
  /** Whether the current user can see 'manageOnly' (admin-flavored) shortcuts. */
  canManageLinks: boolean;
  /**
   * Service tags the tenant currently has an ACTIVE subscription for. `null`/`undefined` means
   * "subscription status unknown" (e.g. the fetch hasn't completed or failed) and fails OPEN —
   * every shared service still shows — matching this codebase's existing "never block the UI on a
   * subscription-fetch failure" convention (see fetchSubscriptionInfo). Exclusive (single-client)
   * services never fail open. Pass the real (possibly empty) array once known so an un-subscribed
   * tenant stops seeing gated services.
   */
  activeServiceTags?: string[] | null;
  /**
   * A service the plan does not cover stays in the list as a locked entry (`locked`, shown as "Not in
   * your plan" with an upgrade link) instead of disappearing, so the tenant discovers the rest of
   * the suite and never lands on a 403 page in the destination app. This is the standard (pos-ui's
   * long-standing behaviour); pass false only to hide such services. Default true. Exclusive
   * services are never shown locked.
   */
  lockUnsubscribed?: boolean;
  /** Where a locked entry links to (for example the subscriptions plans page). Null = not clickable. */
  upgradeUrl?: string | null;
  /**
   * Restricts the registry to exactly these keys (in registry order), for a host app that
   * intentionally curates a smaller cross-link list (e.g. logistics-ui/library-ui only ever
   * linked to Account Portal + Subscriptions). Omit to use the full registry.
   */
  include?: ServiceKey[];
}

/** The filter over the real registry and default URLs, for non-React callers. */
export function computeVisibleServices(opts: UseVisibleServicesOptions): VisibleService[] {
  return compute(opts, SERVICE_REGISTRY, DEFAULT_SERVICE_URLS);
}

/**
 * Filters the canonical SERVICE_REGISTRY down to what this user/tenant should actually see in
 * the "SERVICES" profile-menu dropdown (visible-services.ts holds the rules).
 */
export function useVisibleServices(opts: UseVisibleServicesOptions): VisibleService[] {
  const { orgSlug, urls, canManageLinks, activeServiceTags, lockUnsubscribed, upgradeUrl, include } = opts;
  return useMemo(
    () => computeVisibleServices({ orgSlug, urls, canManageLinks, activeServiceTags, lockUnsubscribed, upgradeUrl, include }),
    [orgSlug, urls, canManageLinks, activeServiceTags, lockUnsubscribed, upgradeUrl, include],
  );
}
