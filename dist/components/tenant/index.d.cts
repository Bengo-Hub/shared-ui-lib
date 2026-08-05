import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

/**
 * Dependency-free tenant-brand cache backed by native IndexedDB.
 *
 * shared-ui-lib has no Dexie (or any other IndexedDB wrapper) dependency, so this is a small
 * native implementation — just enough to cache-first paint tenant branding and survive offline
 * reloads / weak wifi, matching the shape pos-ui's Dexie-backed `kv-cache.ts` already used
 * (`kvKey` / `getKV` / `setKV`) before this module existed.
 *
 * Host apps that already have a richer cache for OTHER datasets too (pos-ui's Dexie `kvCache`
 * table backs POS settings, tenders, categories, outlet info, recent orders, etc. — not just
 * tenant branding) should NOT be forced onto a second, competing cache implementation just for
 * this module. Instead they can construct a `TenantCacheAdapter` that wraps their own
 * get/set and pass it into `fetchTenantBySlug` / `TenantBrandingProvider`. Apps with no
 * pre-existing cache (inventory-ui, ordering-frontend) can just use `defaultTenantCacheAdapter`.
 */
/** Minimal interface `fetchTenantBySlug` needs from a cache — swap in any backing store. */
interface TenantCacheAdapter {
    getKV<T = unknown>(key: string): Promise<T | undefined>;
    setKV(key: string, tenantId: string, data: unknown): Promise<void>;
}
/** Namespaces a cache key per dataset + tenant (and outlet, where the dataset is outlet-scoped). */
declare function kvKey(dataset: string, tenantId: string, outletId?: string): string;
/** Default cache adapter — native IndexedDB, zero extra dependencies. */
declare const defaultTenantCacheAdapter: TenantCacheAdapter;

/**
 * Public tenant API from auth-service (no auth required) — GET /api/v1/tenants/by-slug/{slug}.
 *
 * Consolidates the three near-identical copies that had drifted across pos-ui, inventory-ui and
 * ordering-frontend. This module never reads `process.env` / Next.js `useParams()` itself —
 * matching this package's existing convention (see `app-switcher/service-registry.ts`) of never
 * reaching into a host app's env or router internally. The host app resolves its own auth-api
 * base URL and slug and passes them in.
 */

interface TenantBrandMetadata {
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
interface TenantBrandColors {
    primary?: string;
    secondary?: string;
    accent?: string;
}
interface TenantResponse {
    id: string;
    name: string;
    slug: string;
    status?: string;
    use_case?: string;
    logo_url?: string;
    brand_colors?: TenantBrandColors;
    contact_email?: string;
    website?: string;
    metadata?: Record<string, unknown>;
}
interface TenantBrand {
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
declare function parseBrandFromTenant(t: TenantResponse): TenantBrand;
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
 */
declare function fetchTenantBySlug(slug: string, authApiBase: string, cache?: TenantCacheAdapter): Promise<TenantBrand | null>;

interface TenantBrandingContextType {
    slug: string;
    tenant: TenantBrand | null;
    isLoading: boolean;
    error: Error | null;
    getServiceTitle: (appName: string) => string;
}
interface TenantBrandingProviderProps {
    children: ReactNode;
    /** Tenant URL slug. The host app resolves this itself (e.g. via `useParams()`); this module never reads the router. */
    slug: string;
    /** Host app's own resolved auth-api base URL. This module never reads `process.env` itself. */
    authApiBase: string;
    /** Cache adapter. Defaults to the dependency-free native-IndexedDB adapter; pass your own (e.g. a Dexie-backed one) to reuse an existing cache instead of running a second one. */
    cache?: TenantCacheAdapter;
    /** Fallback primary color used ONLY while no tenant has resolved yet. Defaults to a generic indigo — pass your app's own default brand color to avoid an unbranded flash. */
    defaultPrimaryColor?: string;
    /** Fallback secondary color used ONLY while no tenant has resolved yet. Defaults to a generic indigo. */
    defaultSecondaryColor?: string;
    /**
     * Set to `false` to disable this provider's own CSS-variable side effects
     * (`--tenant-primary`/`--tenant-secondary`/`--tenant-logo-url` and the derived
     * `--primary`/`--ring`/`--brand-primary`/`--brand-emphasis`/`--brand-dark`/`--primary-dark`
     * tokens). Use this when the host app already drives theming from a separate source (e.g. its
     * own `/config`-based brand-theme sync) and would otherwise fight this provider over the same
     * variables. Defaults to `true`.
     */
    applyCssVariables?: boolean;
}
declare function TenantBrandingProvider({ children, slug, authApiBase, cache, defaultPrimaryColor, defaultSecondaryColor, applyCssVariables, }: TenantBrandingProviderProps): react_jsx_runtime.JSX.Element;
declare function useTenantBranding(): TenantBrandingContextType;

export { type TenantBrand, type TenantBrandColors, type TenantBrandMetadata, type TenantBrandingContextType, TenantBrandingProvider, type TenantBrandingProviderProps, type TenantCacheAdapter, type TenantResponse, defaultTenantCacheAdapter, fetchTenantBySlug, kvKey, parseBrandFromTenant, useTenantBranding };
