/**
 * The platform's legal pages all live in auth-ui (the accounts portal), so every app links to one
 * copy instead of keeping its own. Override the base with NEXT_PUBLIC_LEGAL_BASE_URL per
 * environment, or pass `baseUrl` to the components directly.
 */

export const DEFAULT_LEGAL_BASE_URL = 'https://accounts.codevertexafrica.com';

/**
 * MarketFlow's data deletion page, where a Meta deletion confirmation code is checked. Override it
 * with NEXT_PUBLIC_DATA_DELETION_URL, or pass `dataDeletionUrl`.
 */
export const DEFAULT_DATA_DELETION_URL = 'https://marketflow.codevertexafrica.com/data-deletion';

export interface LegalUrls {
  privacy: string;
  terms: string;
  cookies: string;
  refunds: string;
  dataRequests: string;
  /** Data deletion instructions and the confirmation code check. */
  dataDeletion: string;
  /** The MarketFlow Autopilot auto-publish terms. */
  autopilotTerms: string;
}

export interface LegalUrlOptions {
  /** Replaces the data deletion page (default DEFAULT_DATA_DELETION_URL). */
  dataDeletionUrl?: string;
}

export function resolveLegalBaseUrl(baseUrl?: string): string {
  const fromEnv =
    typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_LEGAL_BASE_URL : undefined;
  return (baseUrl || fromEnv || DEFAULT_LEGAL_BASE_URL).replace(/\/+$/, '');
}

export function legalUrls(baseUrl?: string, options: LegalUrlOptions = {}): LegalUrls {
  const base = resolveLegalBaseUrl(baseUrl);
  const deletionFromEnv =
    typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_DATA_DELETION_URL : undefined;
  return {
    privacy: `${base}/privacy`,
    terms: `${base}/terms-of-service`,
    cookies: `${base}/cookies`,
    refunds: `${base}/refund-policy`,
    dataRequests: `${base}/data-requests`,
    dataDeletion: options.dataDeletionUrl || deletionFromEnv || DEFAULT_DATA_DELETION_URL,
    autopilotTerms: `${base}/legal/marketflow-autopublish-terms`,
  };
}

/** A business's registered details as shown in a footer. */
export interface LegalEntity {
  name: string;
  address: string;
  email: string;
  /** Optional extra line, such as a registration number or KRA PIN. */
  registration?: string;
}

/** Registered business details shown in every footer. */
export const PLATFORM_LEGAL_ENTITY: LegalEntity = {
  name: 'Codevertex Africa Limited',
  address: 'Pioneer House, Kisumu, Kenya',
  email: 'info@codevertexafrica.com',
};
