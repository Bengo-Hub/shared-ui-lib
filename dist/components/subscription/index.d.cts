import * as react_jsx_runtime from 'react/jsx-runtime';

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
    /** Full URL to the upgrade/plans page — include ?service=<tag> for service-specific filtering */
    upgradeUrl: string;
    /** Full URL to the billing/payment management page */
    billingUrl: string;
}
declare function SubscriptionBanner({ status, plan, isExpired, isInGracePeriod, expiresAt, gracePeriodEndsAt, daysUntilExpiry, needsSubscription, isPlatformOwner, isCommercialTenant, isLoading, isHydrated, upgradeUrl, billingUrl, }: SubscriptionBannerProps): react_jsx_runtime.JSX.Element | null;

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

export { SERVICE_TAGS, SERVICE_TAG_LABELS, type ServiceTag, SubscriptionBanner, type SubscriptionBannerProps };
