'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTenantBySlug, type TenantBrand } from './tenant-api';
import { defaultTenantCacheAdapter, type TenantCacheAdapter } from './kv-cache';

function hexToRgbTriplet(hex: string): string {
  const t = hex.replace(/^#/, '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(t)) return '107 42 27';
  return `${parseInt(t.slice(0, 2), 16)} ${parseInt(t.slice(2, 4), 16)} ${parseInt(t.slice(4, 6), 16)}`;
}

function hexToDarkRgbTriplet(hex: string): string {
  const raw = hex.replace(/^#/, '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return '44 26 2';
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0;
  if (max !== mn) {
    const d = max - mn;
    h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6
      : max === g ? ((b - r) / d + 2) / 6
      : ((r - g) / d + 4) / 6;
  }
  // Very dark variant: L=7%, S=38%
  const s = 0.38, l = 0.07;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (pp: number, qq: number, x: number) => {
    if (x < 0) x += 1; if (x > 1) x -= 1;
    if (x < 1 / 6) return pp + (qq - pp) * 6 * x;
    if (x < 0.5) return qq;
    if (x < 2 / 3) return pp + (qq - pp) * (2 / 3 - x) * 6;
    return pp;
  };
  return `${Math.round(hue2rgb(p, q, h + 1 / 3) * 255)} ${Math.round(hue2rgb(p, q, h) * 255)} ${Math.round(hue2rgb(p, q, h - 1 / 3) * 255)}`;
}

function hexToHslTriplet(hex: string): string {
  const t = hex.replace(/^#/, '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(t)) return '24 91% 50%';
  const r = parseInt(t.slice(0, 2), 16) / 255;
  const g = parseInt(t.slice(2, 4), 16) / 255;
  const b = parseInt(t.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export interface TenantBrandingContextType {
  slug: string;
  tenant: TenantBrand | null;
  isLoading: boolean;
  error: Error | null;
  getServiceTitle: (appName: string) => string;
}

const TenantBrandingContext = createContext<TenantBrandingContextType | undefined>(undefined);

const FALLBACK_PRIMARY = '#6366f1';
const FALLBACK_SECONDARY = '#4f46e5';

export interface TenantBrandingProviderProps {
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

export function TenantBrandingProvider({
  children,
  slug,
  authApiBase,
  cache = defaultTenantCacheAdapter,
  defaultPrimaryColor = FALLBACK_PRIMARY,
  defaultSecondaryColor = FALLBACK_SECONDARY,
  applyCssVariables = true,
}: TenantBrandingProviderProps) {
  // Neutral placeholder used ONLY while a tenant hasn't resolved yet (or failed to resolve).
  // This must never claim a real tenant's identity — `logoUrl` is intentionally `null` (no
  // bundled photo); consumers must render a generic mark or nothing while it's null, never
  // assume a string. id/name/slug/orgName are intentionally empty for the same reason.
  const DEFAULT_BRAND: TenantBrand = useMemo(
    () => ({
      id: '',
      name: '',
      slug: '',
      logoUrl: null,
      primaryColor: defaultPrimaryColor,
      secondaryColor: defaultSecondaryColor,
      orgName: '',
      useCase: 'general',
      posScreensaverUrl: null,
      contactEmail: null,
    }),
    [defaultPrimaryColor, defaultSecondaryColor]
  );

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant', slug],
    queryFn: () => fetchTenantBySlug(slug, authApiBase, cache),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours — aligned with JWT TTL
    enabled: !!slug,
    // Fail fast: fetchTenantBySlug already times out at 8s and returns null rather than
    // throwing, so retries mostly compound wait time with no benefit — one retry is enough
    // to ride out a single dropped request.
    retry: 1,
  });

  const effectiveBrand = useMemo(() => {
    if (tenant) return tenant;
    if (!isLoading && !tenant && slug) {
      // Resolved with nothing found: fall back to the URL slug as the displayed name rather
      // than any hardcoded identity.
      return { ...DEFAULT_BRAND, slug, name: slug, orgName: slug };
    }
    return DEFAULT_BRAND;
  }, [tenant, isLoading, slug, DEFAULT_BRAND]);

  useMemo(() => {
    if (!applyCssVariables) return;
    if (typeof window !== 'undefined') {
      const primary = effectiveBrand?.primaryColor || DEFAULT_BRAND.primaryColor!;
      const secondary = effectiveBrand?.secondaryColor || DEFAULT_BRAND.secondaryColor!;
      const root = document.documentElement;

      root.style.setProperty('--tenant-primary', primary);
      root.style.setProperty('--tenant-secondary', secondary);
      // Only set a logo CSS var when a real one resolved — never fall back to a bundled photo.
      if (effectiveBrand?.logoUrl) {
        root.style.setProperty('--tenant-logo-url', `url(${effectiveBrand.logoUrl})`);
      } else {
        root.style.removeProperty('--tenant-logo-url');
      }
      // Drive Tailwind semantic tokens from tenant brand color
      root.style.setProperty('--primary', hexToHslTriplet(primary));
      root.style.setProperty('--ring', hexToHslTriplet(primary));
      // Drive brand RGB triplets for bg-brand-primary / bg-brand-emphasis
      root.style.setProperty('--brand-primary', hexToRgbTriplet(primary));
      root.style.setProperty('--brand-emphasis', hexToRgbTriplet(secondary));
      // Derive dark terminal background and primary-dark accent from brand color
      root.style.setProperty('--brand-dark', hexToDarkRgbTriplet(primary));
      const hue = hexToHslTriplet(primary).split(' ')[0];
      root.style.setProperty('--primary-dark', `${hue} 68% 40%`);
    }
  }, [effectiveBrand, applyCssVariables, DEFAULT_BRAND]);

  const getServiceTitle = (appName: string) => {
    const tenantName = effectiveBrand?.orgName || effectiveBrand?.name || '';
    // Falls back to the slug (never a hardcoded platform name) while nothing has resolved yet.
    const firstWord = tenantName.split(' ')[0] || slug || '';
    return firstWord ? `${firstWord} ${appName}` : appName;
  };

  const value = useMemo(
    () => ({
      slug,
      tenant: effectiveBrand,
      isLoading,
      error: error as Error | null,
      getServiceTitle,
    }),
    [slug, effectiveBrand, isLoading, error]
  );

  return <TenantBrandingContext.Provider value={value}>{children}</TenantBrandingContext.Provider>;
}

export function useTenantBranding(): TenantBrandingContextType {
  const context = useContext(TenantBrandingContext);
  if (!context) {
    return {
      slug: '',
      tenant: null,
      isLoading: false,
      error: null,
      getServiceTitle: (s: string) => s,
    };
  }
  return context;
}
