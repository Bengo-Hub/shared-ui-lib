import * as react_jsx_runtime from 'react/jsx-runtime';

interface CookieNoticeProps {
    /** Base URL of the legal pages. Defaults to NEXT_PUBLIC_LEGAL_BASE_URL, then the accounts portal. */
    legalBaseUrl?: string;
    /** Lift the notice above a fixed bottom nav on phones (e.g. "bottom-20 lg:bottom-0"). */
    offsetClassName?: string;
    className?: string;
}
/**
 * Cookie notice shown until the visitor makes a choice. Nothing optional is pre-selected, and
 * "Reject optional" and "Accept all" are the same size and weight so neither is nudged. The
 * notice reopens whenever OPEN_SETTINGS_EVENT fires (the LegalLinks "Cookie settings" button).
 */
declare function CookieNotice({ legalBaseUrl, offsetClassName, className }: CookieNoticeProps): react_jsx_runtime.JSX.Element | null;

interface LegalLinksProps {
    legalBaseUrl?: string;
    /** "row" for a page footer, "stack" for a narrow sidebar bottom. */
    layout?: 'row' | 'stack';
    /** Show the registered company name and address line. */
    showEntity?: boolean;
    className?: string;
}
/**
 * Footer block every app mounts: links to the shared legal pages, a button that reopens the
 * cookie notice, and the registered business details.
 */
declare function LegalLinks({ legalBaseUrl, layout, showEntity, className }: LegalLinksProps): react_jsx_runtime.JSX.Element;

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
type ConsentCategory = 'functional' | 'analytics';
interface CookieConsentState {
    functional: boolean;
    analytics: boolean;
}
declare const CONSENT_COOKIE = "cv_cookie_consent";
/** Fired on window after a choice is saved. `detail` is the new CookieConsentState. */
declare const CONSENT_CHANGED_EVENT = "cv:cookie-consent";
/** Fire on window to reopen the notice (for a "Cookie settings" link). */
declare const OPEN_SETTINGS_EVENT = "cv:open-cookie-settings";
declare const NO_OPTIONAL_CONSENT: CookieConsentState;
/** Parent-domain scope on platform hosts, host-only everywhere else (localhost, tenant domains). */
declare function consentCookieDomain(hostname: string): string | undefined;
/** Returns the saved choice, or null when the visitor has not chosen yet. */
declare function readCookieConsent(): CookieConsentState | null;
declare function writeCookieConsent(state: CookieConsentState): void;
declare function openCookieSettings(): void;

/**
 * The visitor's saved cookie choice, or null before they have chosen. Re-renders when the
 * choice changes in this tab.
 */
declare function useCookieConsentState(): CookieConsentState | null;
/**
 * True only once the visitor has opted in to the category. Gate any optional third-party
 * script on this, e.g. `{useCookieConsent('functional') && <Script src=... />}`.
 */
declare function useCookieConsent(category: ConsentCategory): boolean;

/**
 * The platform's legal pages all live in auth-ui (the accounts portal), so every app links to one
 * copy instead of keeping its own. Override the base with NEXT_PUBLIC_LEGAL_BASE_URL per
 * environment, or pass `baseUrl` to the components directly.
 */
declare const DEFAULT_LEGAL_BASE_URL = "https://accounts.codevertexafrica.com";
interface LegalUrls {
    privacy: string;
    terms: string;
    cookies: string;
    refunds: string;
    dataRequests: string;
}
declare function resolveLegalBaseUrl(baseUrl?: string): string;
declare function legalUrls(baseUrl?: string): LegalUrls;
/** Registered business details shown in every footer. */
declare const PLATFORM_LEGAL_ENTITY: {
    readonly name: "Codevertex Africa Limited";
    readonly address: "Pioneer House, Kisumu, Kenya";
    readonly email: "info@codevertexafrica.com";
};

export { CONSENT_CHANGED_EVENT, CONSENT_COOKIE, type ConsentCategory, type CookieConsentState, CookieNotice, type CookieNoticeProps, DEFAULT_LEGAL_BASE_URL, LegalLinks, type LegalLinksProps, type LegalUrls, NO_OPTIONAL_CONSENT, OPEN_SETTINGS_EVENT, PLATFORM_LEGAL_ENTITY, consentCookieDomain, legalUrls, openCookieSettings, readCookieConsent, resolveLegalBaseUrl, useCookieConsent, useCookieConsentState, writeCookieConsent };
