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

/** useFeature reports whether a feature code is enabled (exempt tenants always pass). */
export function useFeature(code: string): boolean {
  const e = useContext(SubscriptionContext);
  return e.isExempt || e.features.includes(code);
}

/** useAnyFeature reports whether ANY of the given feature codes is enabled. */
export function useAnyFeature(...codes: string[]): boolean {
  const e = useContext(SubscriptionContext);
  return e.isExempt || codes.some((c) => e.features.includes(c));
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
    (feature ? e.features.includes(feature) : false) ||
    (anyOf ? anyOf.some((f) => e.features.includes(f)) : false);
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
  if (e.isExempt || e.features.includes(feature)) return null;

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
