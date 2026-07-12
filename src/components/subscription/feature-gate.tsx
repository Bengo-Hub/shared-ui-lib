"use client";

import React, { createContext, useContext, useMemo } from "react";
import { Lock, Zap } from "lucide-react";

/**
 * SubscriptionEntitlements is the store-agnostic entitlement snapshot each app feeds into
 * the provider. Apps compute it from their own auth store / JWT claims (sub_features,
 * sub_limits, is_demo / is_platform_owner / billing_mode) and pass it down once.
 *
 * `isExempt` is the single bypass flag (platform owner OR demo OR service_charge). When set,
 * every feature reads as enabled and every limit as Infinity — matching the backend
 * IsGatingExempt funnel so the UI never hides a control the backend would actually allow.
 */
/**
 * FeatureCatalogEntry is the per-feature tier metadata (from subscriptions-api
 * GET /features/catalog: minPlanCode/minTierLabel/serviceTag). It lets FeatureLock/UpgradeDialog
 * render "Available on <tier>" + deep-link to the right pricing plan without any per-app map.
 */
export interface FeatureCatalogEntry {
  minPlanCode?: string;
  minTierLabel?: string;
  /** Numeric tier rank of the cheapest unlocking plan (from GET /features/catalog minTierOrder). */
  minTierOrder?: number;
  serviceTag?: string;
  label?: string;
}

export interface SubscriptionEntitlements {
  features: string[];
  limits: Record<string, number>;
  isExempt: boolean;
  status?: string | null;
  isLoading?: boolean;
  /** The tenant's current plan code + tier order (for "you're on X" context). */
  planCode?: string | null;
  tierOrder?: number | null;
  /** feature code → tier metadata, keyed as returned by GET /features/catalog. */
  catalog?: Record<string, FeatureCatalogEntry>;
  /** Base URL of the pricing UI (e.g. NEXT_PUBLIC_SUBSCRIPTIONS_UI_URL). Upgrade links target it. */
  upgradeBaseUrl?: string;
}

const EMPTY: SubscriptionEntitlements = {
  features: [],
  limits: {},
  isExempt: false,
  status: null,
  isLoading: false,
  planCode: null,
  tierOrder: null,
  catalog: {},
  upgradeBaseUrl: "",
};

/** SubscriptionContext is exported so sibling gate components (FeatureLock) share one provider. */
export const SubscriptionContext = createContext<SubscriptionEntitlements>(EMPTY);

/**
 * SubscriptionProvider makes the tenant's entitlements available to useFeature / useLimit /
 * FeatureGate anywhere below it. Wrap the authenticated app shell with it, fed from the
 * app's useSubscription hook.
 */
export function SubscriptionProvider({
  value,
  children,
}: {
  value: SubscriptionEntitlements;
  children: React.ReactNode;
}) {
  const v = useMemo(
    () => ({ ...EMPTY, ...value }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value.features, value.limits, value.isExempt, value.status, value.isLoading, value.planCode, value.tierOrder, value.catalog, value.upgradeBaseUrl],
  );
  return <SubscriptionContext.Provider value={v}>{children}</SubscriptionContext.Provider>;
}

/** useEntitlements returns the raw entitlement snapshot. */
export function useEntitlements(): SubscriptionEntitlements {
  return useContext(SubscriptionContext);
}

/** planFamily returns a plan code's family = its first underscore segment, upper-cased
 * (POWERSUITE_GROWTH_ONE_TIME → "POWERSUITE", ERP_STARTER_ONE_TIME → "ERP"). Mirrors the
 * pricing UI's planGroup rule so tier ranks are only compared within the same product family. */
function planFamily(code?: string | null): string {
  if (!code) return "";
  const i = code.indexOf("_");
  return (i === -1 ? code : code.slice(0, i)).toUpperCase();
}

/**
 * isFeatureUnlocked is the SINGLE gating decision shared by every gate (useFeature, useAnyFeature,
 * FeatureGate, FeatureLockBanner, and FeatureLock's useFeatureUpgrade). A feature is unlocked when:
 *   1. the tenant is exempt (platform owner / demo / service_charge), OR
 *   2. the tenant's plan literally grants the feature code, OR
 *   3. the app supplies a catalog and the code is NOT in it → unknown code, fail-open (never lock a
 *      typo'd/uncatalogued code — matches the pos-ui isKnownFeature rule), OR
 *   4. FAMILY-SCOPED TIER-RANK FALLBACK: the feature IS catalogued, the tenant's tier rank is >= the
 *      feature's cheapest-unlocking tier, AND both plans belong to the same family. This is what
 *      makes at/below-tier features never show an upgrade banner while a feature the tenant's suite
 *      does not cover cannot be falsely unlocked across families.
 * When the app supplies NO catalog (empty/absent), it falls back to strict has-code so gating is
 * never accidentally disabled.
 */
export function isFeatureUnlocked(e: SubscriptionEntitlements, code: string): boolean {
  if (e.isExempt) return true;
  if (e.features?.includes(code)) return true;

  const catalog = e.catalog;
  const hasCatalog = !!catalog && Object.keys(catalog).length > 0;
  if (!hasCatalog) return false; // no catalog to reason about tiers → strict has-code (unchanged)

  const entry = catalog[code];
  if (!entry) return true; // catalogued app, code absent from catalog → unknown → fail-open

  if (
    e.planCode != null &&
    entry.minPlanCode != null &&
    typeof e.tierOrder === "number" &&
    typeof entry.minTierOrder === "number" &&
    entry.minTierOrder > 0 &&
    planFamily(e.planCode) === planFamily(entry.minPlanCode) &&
    e.tierOrder >= entry.minTierOrder
  ) {
    return true;
  }
  return false;
}

/** useFeature reports whether a feature code is enabled (exempt + tier-aware, see isFeatureUnlocked). */
export function useFeature(code: string): boolean {
  const e = useContext(SubscriptionContext);
  return isFeatureUnlocked(e, code);
}

/** useAnyFeature reports whether ANY of the given feature codes is enabled. */
export function useAnyFeature(...codes: string[]): boolean {
  const e = useContext(SubscriptionContext);
  return e.isExempt || codes.some((c) => isFeatureUnlocked(e, c));
}

/**
 * useLimit returns the numeric cap for a metric. Exempt tenants and unlimited (-1) limits
 * return Infinity; an unset key also returns Infinity (treated as not-configured, allow).
 */
export function useLimit(key: string): number {
  const e = useContext(SubscriptionContext);
  if (e.isExempt) return Infinity;
  const v = e.limits?.[key];
  if (v === undefined || v === null || v < 0) return Infinity;
  return v;
}

export interface FeatureGateProps {
  /** Single required feature code. */
  feature?: string;
  /** Pass any of these feature codes (OR). */
  anyOf?: string[];
  /** Rendered when the feature is NOT available (default: nothing). */
  fallback?: React.ReactNode;
  /** Rendered while entitlements are still loading (default: nothing). */
  loadingFallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * FeatureGate renders its children only when the tenant's plan includes the feature (or the
 * tenant is exempt). It HIDES gated content by default (fallback = null).
 *
 * Prefer the non-hiding pattern for navigation and pages: keep the item/page visible and use
 * `useFeature()` + `<UpgradeBadge/>` on nav items and `<FeatureLockBanner/>` on pages, so users
 * always see what exists and get an upgrade prompt instead of a disappearing UI. Reserve
 * FeatureGate for genuinely invisible extras.
 */
export function FeatureGate({
  feature,
  anyOf,
  fallback = null,
  loadingFallback = null,
  children,
}: FeatureGateProps) {
  const e = useContext(SubscriptionContext);
  if (e.isLoading) return <>{loadingFallback}</>;
  const ok =
    e.isExempt ||
    (feature ? isFeatureUnlocked(e, feature) : false) ||
    (anyOf ? anyOf.some((f) => isFeatureUnlocked(e, f)) : false);
  return <>{ok ? children : fallback}</>;
}

/**
 * UpgradeBadge — a small amber "locked" pill for nav items / buttons whose plan-feature is
 * missing. It flags the item WITHOUT hiding it; the item stays clickable and the destination
 * surfaces the upgrade prompt. Render it only when `useFeature(code)` is false.
 */
export function UpgradeBadge({ label = "Upgrade", className }: { label?: string; className?: string }) {
  return (
    <span
      className={
        "flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-500 border border-amber-500/20 shrink-0 " +
        (className ?? "")
      }
      title="Your plan doesn’t include this — upgrade to unlock"
    >
      <Lock className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

/**
 * FeatureLockBanner — a non-hiding, top-of-page upgrade blocker. Drop it at the top of a gated
 * page; it renders nothing when the feature is available (or while loading), so the page keeps
 * all of its own content and buttons. Subscription gating explains what's locked, never hides it.
 */
export function FeatureLockBanner({
  feature,
  upgradeUrl,
  title = "This feature needs a plan upgrade",
  description = "You can view this page, but actions here require a plan that includes it.",
}: {
  feature: string;
  /** Absolute URL to the subscribe/upgrade page. */
  upgradeUrl: string;
  title?: string;
  description?: string;
}) {
  const e = useContext(SubscriptionContext);
  if (e.isLoading) return null;
  if (isFeatureUnlocked(e, feature)) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
          <Lock className="h-4 w-4" />
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <a
        href={upgradeUrl}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <Zap className="h-3.5 w-3.5" />
        Upgrade plan
      </a>
    </div>
  );
}
