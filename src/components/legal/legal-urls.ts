/**
 * The platform's legal pages all live in auth-ui (the accounts portal), so every app links to one
 * copy instead of keeping its own. Override the base with NEXT_PUBLIC_LEGAL_BASE_URL per
 * environment, or pass `baseUrl` to the components directly.
 */

export const DEFAULT_LEGAL_BASE_URL = 'https://accounts.codevertexafrica.com';

export interface LegalUrls {
  privacy: string;
  terms: string;
  cookies: string;
  refunds: string;
  dataRequests: string;
}

export function resolveLegalBaseUrl(baseUrl?: string): string {
  const fromEnv =
    typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_LEGAL_BASE_URL : undefined;
  return (baseUrl || fromEnv || DEFAULT_LEGAL_BASE_URL).replace(/\/+$/, '');
}

export function legalUrls(baseUrl?: string): LegalUrls {
  const base = resolveLegalBaseUrl(baseUrl);
  return {
    privacy: `${base}/privacy`,
    terms: `${base}/terms-of-service`,
    cookies: `${base}/cookies`,
    refunds: `${base}/refund-policy`,
    dataRequests: `${base}/data-requests`,
  };
}

/** Registered business details shown in every footer. */
export const PLATFORM_LEGAL_ENTITY = {
  name: 'Codevertex Africa Limited',
  address: 'Pioneer House, Kisumu, Kenya',
  email: 'info@codevertexafrica.com',
} as const;
