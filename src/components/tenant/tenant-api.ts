/**
 * Public tenant API from auth-service (no auth required) — GET /api/v1/tenants/by-slug/{slug}.
 *
 * Consolidates the three near-identical copies that had drifted across pos-ui, inventory-ui and
 * ordering-frontend. This module never reads `process.env` / Next.js `useParams()` itself —
 * matching this package's existing convention (see `app-switcher/service-registry.ts`) of never
 * reaching into a host app's env or router internally. The host app resolves its own auth-api
 * base URL and slug and passes them in.
 */

import { defaultTenantCacheAdapter, kvKey, type TenantCacheAdapter } from './kv-cache';

export interface TenantBrandMetadata {
  logo_url?: string;
  logoUrl?: string;
  primary_color?: string;
  primaryColor?: string;
  secondary_color?: string;
  secondaryColor?: string;
  org_name?: string;
  orgName?: string;
  /** Optional image or video URL shown on the POS terminal screensaver (pos-ui only). */
  pos_screensaver_url?: string;
}

export interface TenantBrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

export interface TenantResponse {
  id: string;
  name: string;
  slug: string;
  status?: string;
  use_case?: string;
  // Top-level fields (auth-api v2 response shape — preferred)
  logo_url?: string;
  brand_colors?: TenantBrandColors;
  contact_email?: string;
  website?: string;
  // Legacy metadata fallback (older auth-api versions)
  metadata?: Record<string, unknown>;
}

export interface TenantBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  orgName: string;
  useCase: string;
  /** Image or video URL for the POS terminal screensaver. Null/undefined = use default. Optional — pos-ui only. */
  posScreensaverUrl?: string | null;
  /** Tenant contact email — used as a default payer email so cashiers needn't type one. Optional — pos-ui only. */
  contactEmail?: string | null;
}

export function parseBrandFromTenant(t: TenantResponse): TenantBrand {
  // Prefer top-level fields (auth-api v2); fall back to metadata
  const meta = (t.metadata || {}) as TenantBrandMetadata;
  const logoUrl = t.logo_url ?? meta.logo_url ?? meta.logoUrl ?? null;
  const primaryColor = t.brand_colors?.primary ?? (meta.primary_color ?? meta.primaryColor) ?? null;
  const secondaryColor = t.brand_colors?.secondary ?? (meta.secondary_color ?? meta.secondaryColor) ?? null;
  const orgName = (meta.org_name ?? meta.orgName) ?? t.name ?? '';
  const posScreensaverUrl = meta.pos_screensaver_url ?? null;

  return {
    id: t.id,
    name: t.name ?? '',
    slug: t.slug ?? '',
    logoUrl: typeof logoUrl === 'string' ? logoUrl : null,
    primaryColor: typeof primaryColor === 'string' ? primaryColor : null,
    secondaryColor: typeof secondaryColor === 'string' ? secondaryColor : null,
    orgName: typeof orgName === 'string' ? orgName : (t.name ?? ''),
    useCase: t.use_case ?? 'other',
    posScreensaverUrl: typeof posScreensaverUrl === 'string' ? posScreensaverUrl : null,
    contactEmail: typeof t.contact_email === 'string' && t.contact_email ? t.contact_email : null,
  };
}

/**
 * Cache-first, background-refresh tenant lookup: a cached hit paints instantly (branding
 * survives offline reloads / weak wifi) while a fresh fetch refreshes the cache for next time.
 * On a cache miss, waits on the network fetch (bounded by an 8s AbortSignal timeout so a
 * slow/unreachable auth-api can't leave a caller's loading state stuck indefinitely).
 *
 * @param slug Tenant URL slug. Empty/falsy resolves to `null` immediately.
 * @param authApiBase Host app's own resolved auth-api base URL (this module never reads
 *   `process.env` itself).
 * @param cache Optional cache adapter. Defaults to the dependency-free native-IndexedDB
 *   adapter; pass your own to reuse an existing cache (e.g. pos-ui's Dexie-backed one).
 * @param onFresh Optional callback invoked with the network-refreshed brand once the
 *   background refresh (fired after a cache hit) resolves. Without this, a stale cached
 *   value (e.g. captured before a tenant's logo/colors were ever set) would be re-served
 *   verbatim on every subsequent call forever — the refresh updated the KV cache for a
 *   "next call" that itself always hits the same stale-serving cache-first branch, so the
 *   UI never actually caught up. Callers (e.g. TenantBrandingProvider) should use this to
 *   push the fresh value into whatever reactive state is driving the UI.
 */
export async function fetchTenantBySlug(
  slug: string,
  authApiBase: string,
  cache: TenantCacheAdapter = defaultTenantCacheAdapter,
  onFresh?: (brand: TenantBrand) => void
): Promise<TenantBrand | null> {
  if (!slug) return null;
  const url = `${authApiBase}/api/v1/tenants/by-slug/${encodeURIComponent(slug)}`;
  const cacheKey = kvKey('tenant-brand', slug);
  const refresh = async (): Promise<TenantBrand | null> => {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(8000) : undefined,
    });
    if (!res.ok) return null;
    const brand = parseBrandFromTenant((await res.json()) as TenantResponse);
    if (brand) await cache.setKV(cacheKey, slug, brand).catch(() => {});
    return brand;
  };
  try {
    const cached = await cache.getKV<TenantBrand>(cacheKey).catch(() => undefined);
    if (cached) {
      void refresh()
        .then((fresh) => {
          if (fresh) onFresh?.(fresh);
        })
        .catch(() => {});
      return cached;
    }
    return await refresh();
  } catch {
    return (await cache.getKV<TenantBrand>(cacheKey).catch(() => undefined)) ?? null;
  }
}
