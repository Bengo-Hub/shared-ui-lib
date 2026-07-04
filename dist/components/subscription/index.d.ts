import * as react_jsx_runtime from 'react/jsx-runtime';
import React__default from 'react';

interface UsageAlert {
    metric: string;
    limit: number;
    current: number;
    pct: number;
}
interface SubscriptionBannerProps {
    status: string | null;
    plan: string | null;
    isExpired: boolean;
    isInGracePeriod: boolean;
    expiresAt: Date | null;
    gracePeriodEndsAt: Date | null;
    daysUntilExpiry: number | null;
    needsSubscription: boolean;
    isPlatformOwner: boolean;
    isCommercialTenant: boolean;
    isLoading: boolean;
    isHydrated: boolean;
    /** True for service-charge billing model tenants — subscription gating does not apply */
    isServiceCharge?: boolean;
    /** True for demo tenant/users — subscription gating does not apply */
    isDemo?: boolean;
    /** Full URL to the upgrade/plans page — include ?service=<tag> for service-specific filtering */
    upgradeUrl: string;
    /** Full URL to the billing/payment management page */
    billingUrl: string;
    /** Active usage threshold alerts — shown as a warning banner to prompt the tenant to upgrade */
    usageAlerts?: UsageAlert[];
    /** Tenant brand color (hex) — used to style the active-plan bar. Falls back to primary. */
    brandColor?: string;
}
declare function SubscriptionBanner({ status, plan, isExpired, isInGracePeriod, expiresAt, gracePeriodEndsAt, daysUntilExpiry, needsSubscription, isPlatformOwner, isCommercialTenant, isLoading, isHydrated, isServiceCharge, isDemo, upgradeUrl, billingUrl, usageAlerts, brandColor, }: SubscriptionBannerProps): react_jsx_runtime.JSX.Element | null;

/**
 * Canonical service tag values for all billable Codevertex/BengoBox services.
 *
 * Platform-level services (auth, subscriptions, codevertex-website) are NOT included
 * here — they have no subscription plans.
 *
 * NOTE: cafe-website is NOT a standalone service. Its subscription gating derives
 * from the `ordering` plan features (cafe_website_enabled, cafe_website_basic).
 * Notifications is platform infrastructure included in other plans, not billed separately.
 */
declare const SERVICE_TAGS: {
    readonly ORDERING: "ordering";
    readonly POS: "pos";
    readonly LOGISTICS: "logistics";
    readonly INVENTORY: "inventory";
    readonly ERP: "erp";
    readonly TREASURY: "treasury";
    readonly TRULOAD: "truload";
    readonly MARKETFLOW: "marketflow";
    readonly ISP_BILLING: "isp_billing";
    readonly PROJECTS: "projects";
};
type ServiceTag = typeof SERVICE_TAGS[keyof typeof SERVICE_TAGS];
/** Human-readable labels for each billable service tag. Used in auth-ui billing tabs. */
declare const SERVICE_TAG_LABELS: Record<ServiceTag, string>;

/**
 * SubscriptionEntitlements is the store-agnostic entitlement snapshot each app feeds into
 * the provider. Apps compute it from their own auth store / JWT claims (sub_features,
 * sub_limits, is_demo / is_platform_owner / billing_mode) and pass it down once.
 *
 * `isExempt` is the single bypass flag (platform owner OR demo OR service_charge). When set,
 * every feature reads as enabled and every limit as Infinity — matching the backend
 * IsGatingExempt funnel so the UI never hides a control the backend would actually allow.
 */
interface SubscriptionEntitlements {
    features: string[];
    limits: Record<string, number>;
    isExempt: boolean;
    status?: string | null;
    isLoading?: boolean;
}
/**
 * SubscriptionProvider makes the tenant's entitlements available to useFeature / useLimit /
 * FeatureGate anywhere below it. Wrap the authenticated app shell with it, fed from the
 * app's useSubscription hook.
 */
declare function SubscriptionProvider({ value, children, }: {
    value: SubscriptionEntitlements;
    children: React__default.ReactNode;
}): react_jsx_runtime.JSX.Element;
/** useEntitlements returns the raw entitlement snapshot. */
declare function useEntitlements(): SubscriptionEntitlements;
/** useFeature reports whether a feature code is enabled (exempt tenants always pass). */
declare function useFeature(code: string): boolean;
/** useAnyFeature reports whether ANY of the given feature codes is enabled. */
declare function useAnyFeature(...codes: string[]): boolean;
/**
 * useLimit returns the numeric cap for a metric. Exempt tenants and unlimited (-1) limits
 * return Infinity; an unset key also returns Infinity (treated as not-configured, allow).
 */
declare function useLimit(key: string): number;
interface FeatureGateProps {
    /** Single required feature code. */
    feature?: string;
    /** Pass any of these feature codes (OR). */
    anyOf?: string[];
    /** Rendered when the feature is NOT available (default: nothing). */
    fallback?: React__default.ReactNode;
    /** Rendered while entitlements are still loading (default: nothing). */
    loadingFallback?: React__default.ReactNode;
    children: React__default.ReactNode;
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
declare function FeatureGate({ feature, anyOf, fallback, loadingFallback, children, }: FeatureGateProps): react_jsx_runtime.JSX.Element;
/**
 * UpgradeBadge — a small amber "locked" pill for nav items / buttons whose plan-feature is
 * missing. It flags the item WITHOUT hiding it; the item stays clickable and the destination
 * surfaces the upgrade prompt. Render it only when `useFeature(code)` is false.
 */
declare function UpgradeBadge({ label, className }: {
    label?: string;
    className?: string;
}): react_jsx_runtime.JSX.Element;
/**
 * FeatureLockBanner — a non-hiding, top-of-page upgrade blocker. Drop it at the top of a gated
 * page; it renders nothing when the feature is available (or while loading), so the page keeps
 * all of its own content and buttons. Subscription gating explains what's locked, never hides it.
 */
declare function FeatureLockBanner({ feature, upgradeUrl, title, description, }: {
    feature: string;
    /** Absolute URL to the subscribe/upgrade page. */
    upgradeUrl: string;
    title?: string;
    description?: string;
}): react_jsx_runtime.JSX.Element | null;

export { FeatureGate, type FeatureGateProps, FeatureLockBanner, SERVICE_TAGS, SERVICE_TAG_LABELS, type ServiceTag, SubscriptionBanner, type SubscriptionBannerProps, type SubscriptionEntitlements, SubscriptionProvider, UpgradeBadge, type UsageAlert, useAnyFeature, useEntitlements, useFeature, useLimit };
