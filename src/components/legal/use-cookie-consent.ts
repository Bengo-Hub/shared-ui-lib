'use client';

import { useSyncExternalStore } from 'react';
import {
  CONSENT_CHANGED_EVENT,
  readCookieConsent,
  type ConsentCategory,
  type CookieConsentState,
} from './consent-store';

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}

// useSyncExternalStore compares snapshots with Object.is, so cache the parsed object per raw value.
let lastRaw: string | undefined;
let lastState: CookieConsentState | null = null;

function snapshot(): CookieConsentState | null {
  const raw = typeof document === 'undefined' ? '' : document.cookie;
  if (raw !== lastRaw) {
    lastRaw = raw;
    const next = readCookieConsent();
    const same =
      next !== null &&
      lastState !== null &&
      next.functional === lastState.functional &&
      next.analytics === lastState.analytics;
    if (!same) lastState = next;
  }
  return lastState;
}

/**
 * The visitor's saved cookie choice, or null before they have chosen. Re-renders when the
 * choice changes in this tab.
 */
export function useCookieConsentState(): CookieConsentState | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

/**
 * True only once the visitor has opted in to the category. Gate any optional third-party
 * script on this, e.g. `{useCookieConsent('functional') && <Script src=... />}`.
 */
export function useCookieConsent(category: ConsentCategory): boolean {
  const state = useCookieConsentState();
  return state?.[category] === true;
}
