'use client';

import { openCookieSettings } from './consent-store';
import { legalUrls, PLATFORM_LEGAL_ENTITY, type LegalEntity } from './legal-urls';

export interface LegalLinksProps {
  legalBaseUrl?: string;
  /** "row" for a page footer, "stack" for a narrow sidebar bottom. */
  layout?: 'row' | 'stack';
  /** Show the registered company name and address line. */
  showEntity?: boolean;
  /** The business running this app. Tenant apps on their own brand pass their own details. */
  entity?: LegalEntity;
  className?: string;
}

/**
 * Footer block every app mounts: links to the shared legal pages, a button that reopens the
 * cookie notice, and the registered business details.
 */
export function LegalLinks({
  legalBaseUrl,
  layout = 'row',
  showEntity = true,
  entity = PLATFORM_LEGAL_ENTITY,
  className = '',
}: LegalLinksProps) {
  const urls = legalUrls(legalBaseUrl);
  const links: { label: string; href: string }[] = [
    { label: 'Privacy', href: urls.privacy },
    { label: 'Terms', href: urls.terms },
    { label: 'Cookies', href: urls.cookies },
    { label: 'Refunds', href: urls.refunds },
    { label: 'Your data', href: urls.dataRequests },
  ];
  const linkClass =
    'rounded hover:text-foreground hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      <nav
        aria-label="Legal"
        className={layout === 'row' ? 'flex flex-wrap items-center gap-x-4 gap-y-1.5' : 'flex flex-col gap-1.5'}
      >
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {l.label}
          </a>
        ))}
        <button type="button" onClick={openCookieSettings} className={`text-left ${linkClass}`}>
          Cookie settings
        </button>
      </nav>
      {showEntity && (
        <p className="mt-2">
          {entity.name}, {entity.address}.{entity.registration ? ` ${entity.registration}.` : ''}{' '}
          <a href={`mailto:${entity.email}`} className={linkClass}>
            {entity.email}
          </a>
        </p>
      )}
    </div>
  );
}
