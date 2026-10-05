'use client';

/**
 * Cookie consent store shared by every Codevertex app.
 *
 * One first-party cookie (`cv_cookie_consent`) holds the visitor's choice. When the app runs on a
 * codevertexafrica.com host the cookie is scoped to the parent domain, so a choice made in one app
 * applies to all of them. Strictly necessary cookies (session, CSRF, theme) never need consent and
 * are not represented here.
 *
 * Stored value format: `v1:functional=0,analytics=0`. The website's older values `accepted` and
 * `declined` are still understood so nobody is asked twice after the upgrade.
 */

export type ConsentCategory = 'functional' | 'analytics';

export interface CookieConsentState {
  functional: boolean;
  analytics: boolean;
}

export const CONSENT_COOKIE = 'cv_cookie_consent';
/** Fired on window after a choice is saved. `detail` is the new CookieConsentState. */
export const CONSENT_CHANGED_EVENT = 'cv:cookie-consent';
/** Fire on window to reopen the notice (for a "Cookie settings" link). */
export const OPEN_SETTINGS_EVENT = 'cv:open-cookie-settings';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const PLATFORM_DOMAIN = 'codevertexafrica.com';

export const NO_OPTIONAL_CONSENT: CookieConsentState = { functional: false, analytics: false };

function parse(raw: string | null): CookieConsentState | null {
  if (!raw) return null;
  if (raw === 'accepted') return { functional: true, analytics: true };
  if (raw === 'declined') return { ...NO_OPTIONAL_CONSENT };
  if (!raw.startsWith('v1:')) return null;
  const state: CookieConsentState = { ...NO_OPTIONAL_CONSENT };
  for (const pair of raw.slice(3).split(',')) {
    const [key, value] = pair.split('=');
    if (key === 'functional' || key === 'analytics') state[key] = value === '1';
  }
  return state;
}

function serialise(state: CookieConsentState): string {
  return `v1:functional=${state.functional ? 1 : 0},analytics=${state.analytics ? 1 : 0}`;
}

/** Parent-domain scope on platform hosts, host-only everywhere else (localhost, tenant domains). */
export function consentCookieDomain(hostname: string): string | undefined {
  return hostname === PLATFORM_DOMAIN || hostname.endsWith(`.${PLATFORM_DOMAIN}`) ? `.${PLATFORM_DOMAIN}` : undefined;
}

/** Returns the saved choice, or null when the visitor has not chosen yet. */
export function readCookieConsent(): CookieConsentState | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return parse(match ? decodeURIComponent(match[1]) : null);
}

export function writeCookieConsent(state: CookieConsentState): void {
  if (typeof document === 'undefined') return;
  const domain = consentCookieDomain(window.location.hostname);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(serialise(state))}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax` +
    (domain ? `; domain=${domain}` : '') +
    secure;
  window.dispatchEvent(new CustomEvent<CookieConsentState>(CONSENT_CHANGED_EVENT, { detail: state }));
}

export function openCookieSettings(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

// Exposed for unit tests of the value format.
export const __consentFormat = { parse, serialise };
