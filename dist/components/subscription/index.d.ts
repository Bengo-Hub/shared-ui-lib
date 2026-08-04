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
    /** True for a paid ONE_TIME (perpetual) licence — it never renews or expires, so the banner
     *  shows "Lifetime licence" instead of a renewal date and hides the Upgrade CTA (there is
     *  nothing to upgrade a bought-outright suite to). Drive this from the tenant's real billing
     *  data (JWT `billing_mode === 'one_time'` / subscriptions `is_perpetual`), never hardcode. */
    isPerpetual?: boolean;
    /** Full URL to the upgrade/plans page — include ?service=<tag> for service-specific filtering */
    upgradeUrl: string;
    /** Full URL to the billing/payment management page */
    billingUrl: string;
    /** Active usage threshold alerts — shown as a warning banner to prompt the tenant to upgrade */
    usageAlerts?: UsageAlert[];
    /** Tenant brand color (hex) — used to style the active-plan bar. Falls back to primary. */
    brandColor?: string;
}
declare function SubscriptionBanner({ status, plan, isExpired, isInGracePeriod, expiresAt, gracePeriodEndsAt, daysUntilExpiry, needsSubscription, isPlatformOwner, isCommercialTenant, isLoading, isHydrated, isServiceCharge, isDemo, isPerpetual, upgradeUrl, billingUrl, usageAlerts, brandColor, }: SubscriptionBannerProps): react_jsx_runtime.JSX.Element | null;

/**
 * Canonical service tag values for all billable Codevertex services.
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
    readonly HELPDESK: "ticketing";
    readonly ISP_BILLING: "isp_billing";
    readonly PROJECTS: "projects";
    readonly AFYA: "afya";
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
/**
 * FeatureCatalogEntry is the per-feature tier metadata (from subscriptions-api
 * GET /features/catalog: minPlanCode/minTierLabel/serviceTag). It lets FeatureLock/UpgradeDialog
 * render "Available on <tier>" + deep-link to the right pricing plan without any per-app map.
 */
interface FeatureCatalogEntry {
    minPlanCode?: string;
    minTierLabel?: string;
    /** Numeric tier rank of the cheapest unlocking plan (from GET /features/catalog minTierOrder). */
    minTierOrder?: number;
    serviceTag?: string;
    label?: string;
}
interface SubscriptionEntitlements {
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
/** SubscriptionContext is exported so sibling gate components (FeatureLock) share one provider. */
declare const SubscriptionContext: React__default.Context<SubscriptionEntitlements>;
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
declare function isFeatureUnlocked(e: SubscriptionEntitlements, code: string): boolean;
/** useFeature reports whether a feature code is enabled (exempt + tier-aware, see isFeatureUnlocked). */
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

/**
 * FeatureLock — the canonical "show, don't hide" subscription gate.
 *
 * It ALWAYS renders its children. When the tenant's plan does not include `feature` (and the tenant
 * is not exempt), it wraps the children so interacting with them surfaces an UpgradeDialog naming the
 * tier that unlocks the feature — never `display:none`. This lets customers see that a feature exists
 * and learn how to get it, instead of a silently-missing control.
 *
 *  - mode="overlay" (default): children shown dimmed + non-interactive; a transparent overlay
 *    intercepts clicks and opens the dialog. Use for buttons, cards, form sections.
 *  - mode="badge": children shown inline with a small "🔒 <tier>" chip; clicking anywhere in the
 *    wrapper opens the dialog (capture-phase, so an inner <Link> won't navigate). Use for nav items.
 *  - mode="block": a full upgrade CTA card replacing the interactive body. Use for whole pages.
 */
type FeatureLockMode = "overlay" | "badge" | "block";
interface FeatureLockProps {
    feature: string;
    mode?: FeatureLockMode;
    children: React__default.ReactNode;
    className?: string;
    /** Optional copy overrides for the block/dialog. */
    title?: string;
    description?: string;
}
/** Resolve the tier metadata + a pricing deep-link for a feature the tenant lacks. */
declare function useFeatureUpgrade(feature: string): {
    locked: boolean;
    isLoading: boolean;
    entry?: FeatureCatalogEntry;
    tierLabel: string;
    upgradeHref: string;
};
/**
 * UpgradeDialog — a dependency-free modal that names the unlocking tier and links to the pricing UI.
 * Rendered by FeatureLock; can also be used standalone (open controlled by the caller).
 */
declare function UpgradeDialog({ feature, open, onClose, title, description, }: {
    feature: string;
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}): react_jsx_runtime.JSX.Element | null;
declare function FeatureLock({ feature, mode, children, className, title, description }: FeatureLockProps): react_jsx_runtime.JSX.Element;

export { type FeatureCatalogEntry, FeatureGate, type FeatureGateProps, FeatureLock, FeatureLockBanner, type FeatureLockMode, type FeatureLockProps, SERVICE_TAGS, SERVICE_TAG_LABELS, type ServiceTag, SubscriptionBanner, type SubscriptionBannerProps, SubscriptionContext, type SubscriptionEntitlements, SubscriptionProvider, UpgradeBadge, UpgradeDialog, type UsageAlert, isFeatureUnlocked, useAnyFeature, useEntitlements, useFeature, useFeatureUpgrade, useLimit };
