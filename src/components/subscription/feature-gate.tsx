"use client";

import React, { createContext, useContext, useMemo } from "react";

/**
 * SubscriptionEntitlements is the store-agnostic entitlement snapshot each app feeds into
 * the provider. Apps compute it from their own auth store / JWT claims (sub_features,
 * sub_limits, is_demo / is_platform_owner / billing_mode) and pass it down once.
 *
 * `isExempt` is the single bypass flag (platform owner OR demo OR service_charge). When set,
 * every feature reads as enabled and every limit as Infinity — matching the backend
 * IsGatingExempt funnel so the UI never hides a control the backend would actually allow.
 */
export interface SubscriptionEntitlements {
  features: string[];
  limits: Record<string, number>;
  isExempt: boolean;
  status?: string | null;
  isLoading?: boolean;
}

const EMPTY: SubscriptionEntitlements = {
  features: [],
  limits: {},
  isExempt: false,
  status: null,
  isLoading: false,
};

const SubscriptionContext = createContext<SubscriptionEntitlements>(EMPTY);

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
    [value.features, value.limits, value.isExempt, value.status, value.isLoading],
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
 * tenant is exempt). Use it to wrap premium buttons, pages, and nav items so they disappear
 * for plans that don't include them — the same codes the backend RequireFeature() gates on.
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
