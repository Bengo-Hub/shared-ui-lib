'use strict';

var react = require('react');
var reactQuery = require('@tanstack/react-query');
var jsxRuntime = require('react/jsx-runtime');

// src/components/tenant/kv-cache.ts
function kvKey(dataset, tenantId, outletId) {
  return outletId ? `${dataset}:${tenantId}:${outletId}` : `${dataset}:${tenantId}`;
}
var DB_NAME = "shared-ui-lib-kv-cache";
var STORE_NAME = "kv";
var DB_VERSION = 1;
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function nativeGetKV(key) {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result?.data ?? void 0);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return void 0;
  }
}
async function nativeSetKV(key, tenantId, data) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({ key, tenant_id: tenantId, data, cached_at: (/* @__PURE__ */ new Date()).toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
  }
}
var defaultTenantCacheAdapter = {
  getKV: nativeGetKV,
  setKV: nativeSetKV
};

// src/components/tenant/tenant-api.ts
function parseBrandFromTenant(t) {
  const meta = t.metadata || {};
  const logoUrl = t.logo_url ?? meta.logo_url ?? meta.logoUrl ?? null;
  const primaryColor = t.brand_colors?.primary ?? (meta.primary_color ?? meta.primaryColor) ?? null;
  const secondaryColor = t.brand_colors?.secondary ?? (meta.secondary_color ?? meta.secondaryColor) ?? null;
  const orgName = meta.org_name ?? meta.orgName ?? t.name ?? "";
  const posScreensaverUrl = meta.pos_screensaver_url ?? null;
  return {
    id: t.id,
    name: t.name ?? "",
    slug: t.slug ?? "",
    logoUrl: typeof logoUrl === "string" ? logoUrl : null,
    primaryColor: typeof primaryColor === "string" ? primaryColor : null,
    secondaryColor: typeof secondaryColor === "string" ? secondaryColor : null,
    orgName: typeof orgName === "string" ? orgName : t.name ?? "",
    useCase: t.use_case ?? "other",
    posScreensaverUrl: typeof posScreensaverUrl === "string" ? posScreensaverUrl : null,
    contactEmail: typeof t.contact_email === "string" && t.contact_email ? t.contact_email : null
  };
}
async function fetchTenantBySlug(slug, authApiBase, cache = defaultTenantCacheAdapter, onFresh) {
  if (!slug) return null;
  const url = `${authApiBase}/api/v1/tenants/by-slug/${encodeURIComponent(slug)}`;
  const cacheKey = kvKey("tenant-brand", slug);
  const refresh = async () => {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(8e3) : void 0
    });
    if (!res.ok) return null;
    const brand = parseBrandFromTenant(await res.json());
    if (brand) await cache.setKV(cacheKey, slug, brand).catch(() => {
    });
    return brand;
  };
  try {
    const cached = await cache.getKV(cacheKey).catch(() => void 0);
    if (cached) {
      void refresh().then((fresh) => {
        if (fresh) onFresh?.(fresh);
      }).catch(() => {
      });
      return cached;
    }
    return await refresh();
  } catch {
    return await cache.getKV(cacheKey).catch(() => void 0) ?? null;
  }
}
function hexToRgbTriplet(hex) {
  const t = hex.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(t)) return "107 42 27";
  return `${parseInt(t.slice(0, 2), 16)} ${parseInt(t.slice(2, 4), 16)} ${parseInt(t.slice(4, 6), 16)}`;
}
function hexToDarkRgbTriplet(hex) {
  const raw = hex.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return "44 26 2";
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0;
  if (max !== mn) {
    const d = max - mn;
    h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  }
  const s = 0.38, l = 0.07;
  const q = l * (1 + s) ;
  const p = 2 * l - q;
  const hue2rgb = (pp, qq, x) => {
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return pp + (qq - pp) * 6 * x;
    if (x < 0.5) return qq;
    if (x < 2 / 3) return pp + (qq - pp) * (2 / 3 - x) * 6;
    return pp;
  };
  return `${Math.round(hue2rgb(p, q, h + 1 / 3) * 255)} ${Math.round(hue2rgb(p, q, h) * 255)} ${Math.round(hue2rgb(p, q, h - 1 / 3) * 255)}`;
}
function hexToHslTriplet(hex) {
  const t = hex.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(t)) return "24 91% 50%";
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
var TenantBrandingContext = react.createContext(void 0);
var FALLBACK_PRIMARY = "#6366f1";
var FALLBACK_SECONDARY = "#4f46e5";
function TenantBrandingProvider({
  children,
  slug,
  authApiBase,
  cache = defaultTenantCacheAdapter,
  defaultPrimaryColor = FALLBACK_PRIMARY,
  defaultSecondaryColor = FALLBACK_SECONDARY,
  applyCssVariables = true
}) {
  const DEFAULT_BRAND = react.useMemo(
    () => ({
      id: "",
      name: "",
      slug: "",
      logoUrl: null,
      primaryColor: defaultPrimaryColor,
      secondaryColor: defaultSecondaryColor,
      orgName: "",
      useCase: "general",
      posScreensaverUrl: null,
      contactEmail: null
    }),
    [defaultPrimaryColor, defaultSecondaryColor]
  );
  const queryClient = reactQuery.useQueryClient();
  const queryKey = react.useMemo(() => ["tenant", slug], [slug]);
  const { data: tenant, isLoading, error } = reactQuery.useQuery({
    queryKey,
    // A cache hit returns instantly (possibly stale — e.g. captured before this tenant's
    // logo/colors were ever set) and fires a background network refresh; onFresh pushes that
    // refreshed value straight into THIS query's cache so the UI actually updates once it
    // arrives, instead of the refresh only ever benefiting some future query call.
    queryFn: () => fetchTenantBySlug(slug, authApiBase, cache, (fresh) => {
      queryClient.setQueryData(queryKey, fresh);
    }),
    staleTime: 6 * 60 * 60 * 1e3,
    // 6 hours — aligned with JWT TTL
    enabled: !!slug,
    // Fail fast: fetchTenantBySlug already times out at 8s and returns null rather than
    // throwing, so retries mostly compound wait time with no benefit — one retry is enough
    // to ride out a single dropped request.
    retry: 1
  });
  const effectiveBrand = react.useMemo(() => {
    if (tenant) return tenant;
    if (!isLoading && !tenant && slug) {
      return { ...DEFAULT_BRAND, slug, name: slug, orgName: slug };
    }
    return DEFAULT_BRAND;
  }, [tenant, isLoading, slug, DEFAULT_BRAND]);
  react.useMemo(() => {
    if (!applyCssVariables) return;
    if (typeof window !== "undefined") {
      const primary = effectiveBrand?.primaryColor || DEFAULT_BRAND.primaryColor;
      const secondary = effectiveBrand?.secondaryColor || DEFAULT_BRAND.secondaryColor;
      const root = document.documentElement;
      root.style.setProperty("--tenant-primary", primary);
      root.style.setProperty("--tenant-secondary", secondary);
      if (effectiveBrand?.logoUrl) {
        root.style.setProperty("--tenant-logo-url", `url(${effectiveBrand.logoUrl})`);
      } else {
        root.style.removeProperty("--tenant-logo-url");
      }
      root.style.setProperty("--primary", hexToHslTriplet(primary));
      root.style.setProperty("--ring", hexToHslTriplet(primary));
      root.style.setProperty("--brand-primary", hexToRgbTriplet(primary));
      root.style.setProperty("--brand-emphasis", hexToRgbTriplet(secondary));
      root.style.setProperty("--brand-dark", hexToDarkRgbTriplet(primary));
      const hue = hexToHslTriplet(primary).split(" ")[0];
      root.style.setProperty("--primary-dark", `${hue} 68% 40%`);
    }
  }, [effectiveBrand, applyCssVariables, DEFAULT_BRAND]);
  const getServiceTitle = (appName) => {
    const tenantName = effectiveBrand?.orgName || effectiveBrand?.name || "";
    const firstWord = tenantName.split(" ")[0] || slug || "";
    return firstWord ? `${firstWord} ${appName}` : appName;
  };
  const value = react.useMemo(
    () => ({
      slug,
      tenant: effectiveBrand,
      isLoading,
      error,
      getServiceTitle
    }),
    [slug, effectiveBrand, isLoading, error]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(TenantBrandingContext.Provider, { value, children });
}
function useTenantBranding() {
  const context = react.useContext(TenantBrandingContext);
  if (!context) {
    return {
      slug: "",
      tenant: null,
      isLoading: false,
      error: null,
      getServiceTitle: (s) => s
    };
  }
  return context;
}

exports.TenantBrandingProvider = TenantBrandingProvider;
exports.defaultTenantCacheAdapter = defaultTenantCacheAdapter;
exports.fetchTenantBySlug = fetchTenantBySlug;
exports.kvKey = kvKey;
exports.parseBrandFromTenant = parseBrandFromTenant;
exports.useTenantBranding = useTenantBranding;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map