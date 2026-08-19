import * as react_jsx_runtime from 'react/jsx-runtime';

interface CareersListingProps {
    /** Tenant/org slug on erp-api whose public postings to show. */
    orgSlug: string;
    /** Base URL of the erp-api instance to call (e.g. https://erpapi.codevertexafrica.com). */
    apiBaseUrl: string;
    /** Given a posting slug, return the href to that posting's detail page. */
    linkToPosting: (postingSlug: string) => string;
    subtitle?: string;
    poweredByHref?: string;
}
declare function CareersListing({ orgSlug, apiBaseUrl, linkToPosting, subtitle, poweredByHref }: CareersListingProps): react_jsx_runtime.JSX.Element;

interface CareersPostingDetailProps {
    orgSlug: string;
    postingSlug: string;
    apiBaseUrl: string;
    /** Href back to the postings list for this org. */
    backHref: string;
    poweredByHref?: string;
}
declare function CareersPostingDetail({ orgSlug, postingSlug, apiBaseUrl, backHref, poweredByHref }: CareersPostingDetailProps): react_jsx_runtime.JSX.Element;

interface PublicPosting {
    slug: string;
    title: string;
    description?: string;
    department?: string;
    location?: string;
    employment_type?: string;
    num_positions?: number;
    application_deadline?: string;
    posted_at?: string;
}
interface ApplyPayload {
    full_name: string;
    email: string;
    phone?: string;
    cover_letter?: string;
}
interface PublicBranding {
    name?: string;
    slug?: string;
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    kra_pin?: string;
    address?: string;
}
declare class ApiError extends Error {
    status: number;
    code?: string;
    constructor(message: string, status: number, code?: string);
}
/** Builds a careers-portal API client bound to a specific erp-api base URL. */
declare function createCareersApi(apiBaseUrl: string): {
    listPostings: (orgSlug: string) => Promise<{
        data: PublicPosting[];
        count: number;
    }>;
    getPosting: (orgSlug: string, postingSlug: string) => Promise<PublicPosting>;
    getBranding: (orgSlug: string) => Promise<PublicBranding>;
    apply: (orgSlug: string, postingSlug: string, payload: ApplyPayload) => Promise<{
        id: string;
        status: string;
    }>;
};
type CareersApi = ReturnType<typeof createCareersApi>;

interface BrandTheme {
    primary: string;
    secondary: string;
    onPrimary: string;
    /** Inline CSS variables to spread onto a wrapper element. */
    vars: React.CSSProperties;
}
declare function buildTheme(branding: PublicBranding | null): BrandTheme;
interface BrandingState {
    branding: PublicBranding | null;
    theme: BrandTheme;
    loading: boolean;
}
declare function useBranding(apiBaseUrl: string, orgSlug: string): BrandingState;
declare function displayCompanyName(branding: PublicBranding | null, orgSlug: string): string;

export { type ApplyPayload, type BrandTheme, type BrandingState, type CareersApi, ApiError as CareersApiError, CareersListing, type CareersListingProps, CareersPostingDetail, type CareersPostingDetailProps, type PublicBranding, type PublicPosting, buildTheme, createCareersApi, displayCompanyName, useBranding };
