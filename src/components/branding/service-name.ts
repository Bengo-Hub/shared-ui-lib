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
export interface ServiceBrandingEntry {
  name?: string;
  short_name?: string;
  tagline?: string;
  theme_color?: string;
  icon_url?: string;
}

/** Home-screen labels longer than this fall back to the generated short name. */
const SHORT_NAME_MAX = 12;

/** Leading words that never name a business on their own. Compared case-insensitively. */
const LEADING_WORDS = new Set([
  // English articles and demonstratives
  'the', 'a', 'an', 'this', 'that', 'these', 'those',
  // Swahili has no articles; these are its demonstratives (this/that/those) across noun classes
  'huyu', 'huyo', 'yule', 'hawa', 'hao', 'wale', 'hii', 'hiyo', 'ile', 'hizi', 'hizo', 'zile',
  'huu', 'huo', 'ule', 'hiki', 'hicho', 'kile', 'hivi', 'hivyo', 'hili', 'hilo', 'lile', 'hayo', 'yale',
  // French, Spanish, Italian, Portuguese
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'el', 'los', 'las', 'una', 'unos', 'unas',
  'il', 'lo', 'gli', 'uno', 'o', 'os', 'as', 'um', 'uma',
  // German, Dutch
  'der', 'die', 'das', 'ein', 'eine', 'de', 'het', 'een',
  // Arabic definite article as written in Latin script
  'al',
]);

const clean = (s: string | null | undefined): string => (typeof s === 'string' ? s.trim() : '');

/**
 * The tenant's per-app branding map from raw tenant metadata (`metadata.service_branding`), or
 * undefined when none is set. The one parser for that field.
 */
export function serviceBrandingMap(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, ServiceBrandingEntry> | undefined {
  const all = metadata?.service_branding;
  return all && typeof all === 'object' ? (all as Record<string, ServiceBrandingEntry>) : undefined;
}

/** The tenant's branding for one app from raw tenant metadata, or null when it uses the default. */
export function serviceBrandingEntry(
  metadata: Record<string, unknown> | null | undefined,
  service: string,
): ServiceBrandingEntry | null {
  const entry = serviceBrandingMap(metadata)?.[service];
  return entry && typeof entry === 'object' ? entry : null;
}

/**
 * The short brand word of a tenant name: its first word, or its first two words when the first is
 * an article or demonstrative ("The Urban Loft Cafe" gives "The Urban"). Empty for a blank name.
 */
export function tenantBrandWord(tenantName: string | null | undefined): string {
  const words = clean(tenantName).split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length > 1 && LEADING_WORDS.has(words[0].toLowerCase())) {
    return `${words[0]} ${words[1]}`;
  }
  return words[0];
}

/**
 * The app's display name: the tenant's custom name when set (custom.name, e.g. "Urban Eats"),
 * else "<brand word> <service>" (serviceAppName("THE URBAN LOFT CAFE", "POS") gives
 * "THE URBAN POS"). fallback is the brand word when the tenant name is blank (a slug or a
 * platform name); with neither, the bare service name is returned.
 */
export function serviceAppName(
  tenantName: string | null | undefined,
  service: string,
  fallback?: string,
  custom?: ServiceBrandingEntry | null,
): string {
  const own = clean(custom?.name);
  if (own) return own;
  const word = tenantBrandWord(tenantName) || clean(fallback);
  return word ? `${word} ${service}` : service;
}

/**
 * The app's home-screen label: the tenant's custom short name, else its custom name (its first two
 * words when too long for a launcher, "Urban Eats Delivery Club" gives "Urban Eats"), else the
 * generated "<brand word> <service>".
 */
export function serviceShortName(
  tenantName: string | null | undefined,
  service: string,
  fallback?: string,
  custom?: ServiceBrandingEntry | null,
): string {
  const short = clean(custom?.short_name);
  if (short) return short;
  const own = clean(custom?.name);
  if (own) return own.length <= SHORT_NAME_MAX ? own : own.split(/\s+/).slice(0, 2).join(' ');
  return serviceAppName(tenantName, service, fallback);
}

/**
 * The app's full name (installed-app name, manifest `name`): the tenant's custom name, else the
 * whole business name with the service, "THE URBAN LOFT CAFE POS". fallback stands in for a blank
 * business name.
 */
export function serviceFullName(
  tenantName: string | null | undefined,
  service: string,
  fallback?: string,
  custom?: ServiceBrandingEntry | null,
): string {
  const own = clean(custom?.name);
  if (own) return own;
  const business = clean(tenantName) || clean(fallback);
  return business ? `${business} ${service}` : service;
}
