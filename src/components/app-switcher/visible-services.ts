import type { ServiceDefinition, ServiceKey } from './service-registry';

export interface VisibleService extends ServiceDefinition {
  /** Absolute link target, or null for a 'coming-soon' entry / a service the host app didn't configure a URL for. */
  href: string | null;
  /** True for a service outside the tenant's plan, kept in the list only when the host sets
   *  `lockUnsubscribed`. Its `href` is then the host's `upgradeUrl` (or null). */
  locked?: boolean;
}

export interface VisibleServicesInput {
  orgSlug: string;
  urls: Partial<Record<ServiceKey, string>>;
  canManageLinks: boolean;
  activeServiceTags?: string[] | null;
  lockUnsubscribed?: boolean;
  upgradeUrl?: string | null;
  include?: ServiceKey[];
  /** The app the switcher is shown in: never listed, since the person is already in it. */
  current?: ServiceKey;
  /**
   * The page's origin (window.location.origin on the client). A service whose base URL is this
   * origin is the current app and is left out too, so apps that do not pass `current` still never
   * list themselves.
   */
  currentOrigin?: string;
}

function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * The pure filter behind useVisibleServices. The registry and the default URLs are arguments so the
 * function has no runtime imports and runs under `node --test` (see visible-services.test.ts).
 *
 * RBAC (manageOnly) and subscription (serviceTag) gating, with 'coming-soon' entries always included
 * (disabled, no href). A custom service (`onlyForTenant`) appears only for that tenant's slug.
 */
export function computeVisibleServices(
  {
    orgSlug,
    urls,
    canManageLinks,
    activeServiceTags,
    lockUnsubscribed = true,
    upgradeUrl,
    include,
    current,
    currentOrigin,
  }: VisibleServicesInput,
  registry: readonly ServiceDefinition[],
  defaults: Partial<Record<ServiceKey, string>>,
): VisibleService[] {
  const allow = include ? new Set(include) : null;
  const here = originOf(currentOrigin);
  const out: VisibleService[] = [];
  for (const svc of registry) {
    if (allow && !allow.has(svc.key)) continue;
    if (current && svc.key === current) continue;
    if (here && originOf(urls[svc.key] ?? defaults[svc.key]) === here) continue;
    if (svc.manageOnly && !canManageLinks) continue;
    if (svc.onlyForTenant && svc.onlyForTenant !== orgSlug) continue;
    const entitled = !!svc.serviceTag && activeServiceTags != null && activeServiceTags.includes(svc.serviceTag);
    const base = urls[svc.key] ?? defaults[svc.key];

    if (svc.status === 'coming-soon') {
      out.push({ ...svc, href: null });
      continue;
    }

    if (svc.serviceTag && activeServiceTags != null && !entitled) {
      // The tenant's subscription is known and does not cover this service.
      if (lockUnsubscribed && base) out.push({ ...svc, href: upgradeUrl ?? null, locked: true });
      continue;
    }

    if (!base) continue; // host app doesn't link to this service and it has no default

    out.push({ ...svc, href: svc.path ? `${base}${svc.path}` : `${base}/${orgSlug}` });
  }
  return out;
}
