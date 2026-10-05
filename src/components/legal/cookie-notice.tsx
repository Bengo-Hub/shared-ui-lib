'use client';

import { useEffect, useId, useState } from 'react';
import { Cookie } from 'lucide-react';
import {
  NO_OPTIONAL_CONSENT,
  OPEN_SETTINGS_EVENT,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentState,
} from './consent-store';
import { legalUrls } from './legal-urls';

export interface CookieNoticeProps {
  /** Base URL of the legal pages. Defaults to NEXT_PUBLIC_LEGAL_BASE_URL, then the accounts portal. */
  legalBaseUrl?: string;
  /** Lift the notice above a fixed bottom nav on phones (e.g. "bottom-20 lg:bottom-0"). */
  offsetClassName?: string;
  className?: string;
}

const CATEGORIES: { key: keyof CookieConsentState; label: string; description: string }[] = [
  {
    key: 'functional',
    label: 'Functional',
    description: 'Chat widgets and embedded help that remember you between visits.',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Anonymous usage statistics that help us improve the product.',
  },
];

/**
 * Cookie notice shown until the visitor makes a choice. Nothing optional is pre-selected, and
 * "Reject optional" and "Accept all" are the same size and weight so neither is nudged. The
 * notice reopens whenever OPEN_SETTINGS_EVENT fires (the LegalLinks "Cookie settings" button).
 */
export function CookieNotice({ legalBaseUrl, offsetClassName = 'bottom-0', className = '' }: CookieNoticeProps) {
  const [open, setOpen] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [draft, setDraft] = useState<CookieConsentState>(NO_OPTIONAL_CONSENT);
  const titleId = useId();
  const urls = legalUrls(legalBaseUrl);

  useEffect(() => {
    if (readCookieConsent() === null) setOpen(true);
    function reopen() {
      setDraft(readCookieConsent() ?? NO_OPTIONAL_CONSENT);
      setCustomising(true);
      setOpen(true);
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  if (!open) return null;

  function save(state: CookieConsentState) {
    writeCookieConsent(state);
    setOpen(false);
    setCustomising(false);
  }

  const buttonClass =
    'flex-1 sm:flex-none min-h-10 px-4 rounded-lg text-sm font-semibold border border-border bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className={`fixed inset-x-0 z-[60] p-3 sm:p-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${offsetClassName} ${className}`}
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cookie className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p id={titleId} className="text-sm font-semibold text-foreground">
              Cookies on this site
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              We use strictly necessary cookies to sign you in and keep the app secure. Optional cookies are
              off unless you turn them on. Read the{' '}
              <a href={urls.cookies} className="underline underline-offset-2 hover:text-primary" target="_blank" rel="noopener noreferrer">
                Cookie Policy
              </a>{' '}
              and{' '}
              <a href={urls.privacy} className="underline underline-offset-2 hover:text-primary" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        {customising && (
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Optional cookie categories</legend>
            <label className="flex items-start gap-3 rounded-xl border border-border p-3 opacity-80">
              <input type="checkbox" checked disabled className="mt-0.5 h-4 w-4 accent-primary" />
              <span className="text-sm">
                <span className="font-semibold text-foreground">Strictly necessary</span>
                <span className="block text-muted-foreground">Sign-in, security and your theme. Always on.</span>
              </span>
            </label>
            {CATEGORIES.map((c) => (
              <label key={c.key} className="flex items-start gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={draft[c.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [c.key]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span className="text-sm">
                  <span className="font-semibold text-foreground">{c.label}</span>
                  <span className="block text-muted-foreground">{c.description}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="mt-4 flex flex-wrap gap-2 sm:justify-end">
          {customising ? (
            <button type="button" className={buttonClass} onClick={() => save(draft)}>
              Save choices
            </button>
          ) : (
            <button type="button" className={buttonClass} onClick={() => setCustomising(true)}>
              Customise
            </button>
          )}
          <button type="button" className={buttonClass} onClick={() => save(NO_OPTIONAL_CONSENT)}>
            Reject optional
          </button>
          <button type="button" className={buttonClass} onClick={() => save({ functional: true, analytics: true })}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
