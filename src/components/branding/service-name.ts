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

/**
 * The short brand word of a tenant name: its first word, or its first two words when the first is
 * an article or demonstrative ("The Urban Loft Cafe" gives "The Urban"). Empty for a blank name.
 */
export function tenantBrandWord(tenantName: string | null | undefined): string {
  const words = (tenantName ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length > 1 && LEADING_WORDS.has(words[0].toLowerCase())) {
    return `${words[0]} ${words[1]}`;
  }
  return words[0];
}

/**
 * "<brand word> <service>", e.g. serviceAppName("THE URBAN LOFT CAFE", "POS") gives "THE URBAN POS".
 * fallback is used as the brand word when the tenant name is blank (a slug or a platform name);
 * with neither, the bare service name is returned.
 */
export function serviceAppName(tenantName: string | null | undefined, service: string, fallback?: string): string {
  const word = tenantBrandWord(tenantName) || (fallback ?? '').trim();
  return word ? `${word} ${service}` : service;
}
