/**
 * Tenant app names, the single rule every UI uses for its header title, installed-app name and
 * home-screen label. Plain functions with no React, so server routes (manifest.webmanifest) can
 * import them too.
 *
 * 1. The tenant's own name for the app wins: auth-api tenant metadata `service_branding.<service>`
 *    (set in auth-ui Accounts > Branding > App names), e.g. a restaurant calls its ordering app
 *    "Urban Eats".
 * 2. Otherwise "<brand word> <service>". The brand word is the tenant name's first word, except
 *    when that word is an article or a demonstrative (English, Swahili and common foreign ones):
 *    then it joins with the next word, so "THE URBAN LOFT CAFE" reads "THE URBAN POS" rather than
 *    "THE POS", and "Al Noor Pharmacy" reads "Al Noor POS". The tenant's own casing is kept. A word
 *    wrongly treated as leading costs nothing worse than a two-word brand ("De Beers POS").
 */
/** One app's tenant branding (auth-api tenant metadata `service_branding.<service>`). */
interface ServiceBrandingEntry {
    name?: string;
    short_name?: string;
    tagline?: string;
    theme_color?: string;
    icon_url?: string;
}
/**
 * The tenant's per-app branding map from raw tenant metadata (`metadata.service_branding`), or
 * undefined when none is set. The one parser for that field.
 */
declare function serviceBrandingMap(metadata: Record<string, unknown> | null | undefined): Record<string, ServiceBrandingEntry> | undefined;
/** The tenant's branding for one app from raw tenant metadata, or null when it uses the default. */
declare function serviceBrandingEntry(metadata: Record<string, unknown> | null | undefined, service: string): ServiceBrandingEntry | null;
/**
 * The short brand word of a tenant name: its first word, or its first two words when the first is
 * an article or demonstrative ("The Urban Loft Cafe" gives "The Urban"). Empty for a blank name.
 */
declare function tenantBrandWord(tenantName: string | null | undefined): string;
/**
 * The app's display name: the tenant's custom name when set (custom.name, e.g. "Urban Eats"),
 * else "<brand word> <service>" (serviceAppName("THE URBAN LOFT CAFE", "POS") gives
 * "THE URBAN POS"). fallback is the brand word when the tenant name is blank (a slug or a
 * platform name); with neither, the bare service name is returned.
 */
declare function serviceAppName(tenantName: string | null | undefined, service: string, fallback?: string, custom?: ServiceBrandingEntry | null): string;
/**
 * The app's home-screen label: the tenant's custom short name, else its custom name (its first two
 * words when too long for a launcher, "Urban Eats Delivery Club" gives "Urban Eats"), else the
 * generated "<brand word> <service>".
 */
declare function serviceShortName(tenantName: string | null | undefined, service: string, fallback?: string, custom?: ServiceBrandingEntry | null): string;
/**
 * The app's full name (installed-app name, manifest `name`): the tenant's custom name, else the
 * whole business name with the service, "THE URBAN LOFT CAFE POS". fallback stands in for a blank
 * business name.
 */
declare function serviceFullName(tenantName: string | null | undefined, service: string, fallback?: string, custom?: ServiceBrandingEntry | null): string;
/** The public tenant record (auth-api GET /api/v1/tenants/by-slug/{slug}) the app identity needs. */
interface PublicTenantBranding {
    name?: string;
    logo_url?: string;
    brand_colors?: {
        primary?: string;
        secondary?: string;
    };
    metadata?: Record<string, unknown>;
}
/** One app's identity for a tenant: page titles, PWA manifest and the generated app icons. */
interface AppIdentity {
    /** Business name, e.g. "Urban Loft". */
    businessName: string;
    /** Full app name, e.g. "Urban Eats" or "Urban Loft Ordering". */
    appName: string;
    /** Home-screen label. */
    shortName: string;
    description: string;
    themeColor: string;
    /** Background colour for the splash screen (brand secondary, else defaults). */
    backgroundColor: string;
    /** App icon: the app's own icon, else the business logo; null draws initials. */
    iconUrl: string | null;
    /** True when the tenant named the app itself. */
    custom: boolean;
}
/**
 * The one rule for an app's identity from the public tenant record: the tenant's own branding for
 * this app (service_branding.<service>) wins, then the business's brand colours and logo, then the
 * app's defaults. slug stands in for a missing business name.
 */
declare function resolveAppIdentity(tenant: PublicTenantBranding | null | undefined, opts: {
    slug: string;
    service: string;
    /** Name suffix, e.g. "Ordering" or "Logistics". */
    label: string;
    defaultThemeColor: string;
    defaultBackgroundColor?: string;
    defaultDescription: (businessName: string) => string;
}): AppIdentity;

export { type AppIdentity, type PublicTenantBranding, type ServiceBrandingEntry, resolveAppIdentity, serviceAppName, serviceBrandingEntry, serviceBrandingMap, serviceFullName, serviceShortName, tenantBrandWord };
