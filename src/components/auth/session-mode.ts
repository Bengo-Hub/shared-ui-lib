/**
 * Which sign-in flow a page uses (fleet plan G11).
 *
 * The cookie session keeps the refresh token in auth-api's host-only HttpOnly cookie on
 * sso.codevertexafrica.com and the access token in memory (createCookieSession). The browser sends
 * that cookie only to a page on the same site, so the flow works on *.codevertexafrica.com and
 * nowhere else. A tenant's custom domain (alphachinamarket.co.ke, erp.masterspace.co.ke, kura.go.ke
 * and the self-service domains) keeps the stored-token flow, whatever the build flag says (owner
 * decision 2026-11-17).
 */

/** The registrable domain whose subdomains share the sso cookie. */
export const COOKIE_SESSION_SITE = 'codevertexafrica.com';

/**
 * True when this page uses the cookie session: the build flag (an app's
 * NEXT_PUBLIC_COOKIE_SESSION, passed in because Next.js inlines it per app) is "true" or "1" and
 * the page is served over https from a subdomain of codevertexafrica.com. hostname defaults to the
 * current page's; on the server there is no page, so it is false.
 */
export function cookieSessionAllowed(flag: string | undefined | null, hostname?: string, protocol?: string): boolean {
  if (flag !== 'true' && flag !== '1') return false;
  const loc = typeof window !== 'undefined' ? window.location : undefined;
  const host = (hostname ?? loc?.hostname ?? '').toLowerCase().replace(/\.$/, '');
  const proto = protocol ?? loc?.protocol ?? 'https:';
  if (proto !== 'https:') return false;
  return host.endsWith('.' + COOKIE_SESSION_SITE);
}

/**
 * Drops the tokens the stored-token flow left in a persisted zustand store, keeping everything else
 * (the profile, tenant choices). Call it before the store loads, so the first page load of a build
 * with the cookie session removes them. field is the state key holding the tokens ("session" in
 * every fleet app). Never throws: no storage (server render, private mode) is a no-op.
 */
export function scrubStoredSession(storageKey: string, field = 'session'): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> } | null;
    if (!parsed?.state || !(field in parsed.state)) return;
    delete parsed.state[field];
    localStorage.setItem(storageKey, JSON.stringify(parsed));
  } catch {
    /* an unreadable entry: the store's own load handles it */
  }
}
