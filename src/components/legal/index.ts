export { CookieNotice, type CookieNoticeProps } from './cookie-notice';
export { LegalLinks, type LegalLinksProps } from './legal-links';
export { useCookieConsent, useCookieConsentState } from './use-cookie-consent';
export {
  CONSENT_COOKIE,
  CONSENT_CHANGED_EVENT,
  OPEN_SETTINGS_EVENT,
  NO_OPTIONAL_CONSENT,
  consentCookieDomain,
  openCookieSettings,
  readCookieConsent,
  writeCookieConsent,
  type ConsentCategory,
  type CookieConsentState,
} from './consent-store';
export {
  DEFAULT_LEGAL_BASE_URL,
  PLATFORM_LEGAL_ENTITY,
  legalUrls,
  resolveLegalBaseUrl,
  type LegalEntity,
  type LegalUrls,
} from './legal-urls';
