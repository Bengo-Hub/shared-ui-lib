/**
 * Tenant-derived app names ("<Tenant> POS", "<Tenant> Treasury" ...), the single rule every UI
 * uses for its header title, installed-app name and home-screen label. Plain functions with no
 * React, so server routes (manifest.webmanifest) can import them too.
 *
 * The brand word is the tenant name's first word, except when that word is an article or a
 * demonstrative (English, Swahili and common foreign ones): then it joins with the next word, so
 * "THE URBAN LOFT CAFE" reads "THE URBAN POS" rather than "THE POS", and "Al Noor Pharmacy" reads
 * "Al Noor POS". The tenant's own casing is kept. A word wrongly treated as leading costs nothing
 * worse than a two-word brand ("De Beers POS").
 */
/**
 * The short brand word of a tenant name: its first word, or its first two words when the first is
 * an article or demonstrative ("The Urban Loft Cafe" gives "The Urban"). Empty for a blank name.
 */
declare function tenantBrandWord(tenantName: string | null | undefined): string;
/**
 * "<brand word> <service>", e.g. serviceAppName("THE URBAN LOFT CAFE", "POS") gives "THE URBAN POS".
 * fallback is used as the brand word when the tenant name is blank (a slug or a platform name);
 * with neither, the bare service name is returned.
 */
declare function serviceAppName(tenantName: string | null | undefined, service: string, fallback?: string): string;

export { serviceAppName, tenantBrandWord };
