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

/** Canonical service tag values for all Codevertex/BengoBox services.
 * Must match service_tag values in subscriptions-api seed data and
 * the SERVICE_OPTIONS list in auth-ui equity page.
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
    readonly CAFE: "cafe";
    readonly ISP_BILLING: "isp_billing";
    readonly NOTIFICATIONS: "notifications";
    readonly PROJECTS: "projects";
};
type ServiceTag = typeof SERVICE_TAGS[keyof typeof SERVICE_TAGS];
/** Human-readable labels for each service tag. Used in auth-ui billing tabs. */
declare const SERVICE_TAG_LABELS: Record<ServiceTag, string>;

export { SERVICE_TAGS, SERVICE_TAG_LABELS, type ServiceTag, SubscriptionBanner, type SubscriptionBannerProps };
