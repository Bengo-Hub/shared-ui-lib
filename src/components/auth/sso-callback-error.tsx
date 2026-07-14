'use client';

import * as React from 'react';
import { AlertTriangle, ArrowRight, Building2, RefreshCcw } from 'lucide-react';

/**
 * Uniform SSO callback error card.
 *
 * Every service UI's /auth/callback must render THIS component whenever the SSO
 * redirect carries `?error=` (or the token exchange fails) instead of hanging on
 * a spinner, looping, or dead-ending on a raw `access_denied` code. Before this,
 * the eight frontends had eight divergent behaviours (infinite spinner, silent
 * redirect loop, misleading copy…) and a wrong-organisation error was
 * unrecoverable without hand-editing the URL.
 *
 * Behaviour:
 *  - `access_denied` + a "not a member" description renders wrong-organisation
 *    copy. "Sign in again" restarts the SSO flow — auth-api then routes the user
 *    through the accounts organisation picker, so the retry genuinely recovers.
 *  - When a previously-used tenant slug is remembered (`lastKnownTenant`) and it
 *    differs from the URL slug, a rescue button offers to continue there.
 *
 * Styling is fully self-contained (scoped `sce-` CSS) — it must NOT depend on
 * the host app's Tailwind palette (see verify-email-banner for the precedent).
 */
export interface SSOCallbackErrorProps {
  /** OAuth error code from the callback query string (e.g. "access_denied"). */
  error?: string | null;
  /** Human-readable `error_description` from the callback query string. */
  errorDescription?: string | null;
  /** Tenant slug from the current URL path, when the app is tenant-scoped. */
  orgSlug?: string | null;
  /** Remembered tenant slug from a previous successful login (e.g. localStorage). */
  lastKnownTenant?: string | null;
  /** Restart the SSO login flow for the current org (fresh PKCE + authorize). */
  onRetry: () => void;
  /** Navigate to the remembered tenant's login (rescue path). */
  onSwitchTenant?: (slug: string) => void;
}

function cleanDescription(desc: string | null | undefined): string {
  if (!desc) return '';
  let out = desc;
  try {
    out = decodeURIComponent(out);
  } catch {
    /* already decoded */
  }
  return out.replace(/\+/g, ' ').trim();
}

export function SSOCallbackError({
  error,
  errorDescription,
  orgSlug,
  lastKnownTenant,
  onRetry,
  onSwitchTenant,
}: SSOCallbackErrorProps) {
  const description = cleanDescription(errorDescription);
  const isWrongOrg =
    error === 'access_denied' && /member|tenant|organisation|organization/i.test(description);

  const title = isWrongOrg ? 'Wrong organisation' : 'Sign-in failed';
  const message = isWrongOrg
    ? `Your account does not belong to${orgSlug ? ` “${orgSlug}”` : ' this organisation'}. Sign in again and pick one of your organisations when prompted — you won't need to retype your credentials if you're already signed in.`
    : description ||
      (error === 'access_denied'
        ? 'Access was denied while signing you in.'
        : 'Something went wrong while completing your sign-in.');

  const showRescue =
    !!onSwitchTenant && !!lastKnownTenant && !!orgSlug && lastKnownTenant !== orgSlug;

  return (
    <div className="sce-wrap">
      <style>{`
        .sce-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;background:transparent;font-family:inherit}
        .sce-card{max-width:420px;width:100%;border:1px solid rgba(220,90,60,.25);background:rgba(220,90,60,.05);border-radius:16px;padding:32px 28px;text-align:center}
        .sce-icon{width:44px;height:44px;border-radius:12px;background:rgba(245,158,11,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
        .sce-title{font-size:19px;font-weight:700;color:#b91c1c;margin:0 0 8px}
        .sce-msg{font-size:14px;line-height:1.55;color:#6b7280;margin:0 0 6px}
        .sce-code{font-size:11px;color:#9ca3af;margin:0 0 18px;word-break:break-all}
        .sce-actions{display:flex;flex-direction:column;gap:10px}
        .sce-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 18px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:opacity .15s}
        .sce-btn:hover{opacity:.9}
        .sce-btn-primary{background:#111827;color:#ffffff}
        .sce-btn-secondary{background:transparent;color:#111827;border-color:#d1d5db}
        @media (prefers-color-scheme: dark){
          .sce-title{color:#f87171}
          .sce-msg{color:#9ca3af}
          .sce-btn-primary{background:#f9fafb;color:#111827}
          .sce-btn-secondary{color:#f9fafb;border-color:#4b5563}
        }
      `}</style>
      <div className="sce-card" role="alert">
        <div className="sce-icon">
          <AlertTriangle size={22} color="#d97706" />
        </div>
        <h1 className="sce-title">{title}</h1>
        <p className="sce-msg">{message}</p>
        {error && <p className="sce-code">({error})</p>}
        <div className="sce-actions">
          <button type="button" className="sce-btn sce-btn-primary" onClick={onRetry}>
            <RefreshCcw size={15} />
            Sign in again
          </button>
          {showRescue && (
            <button
              type="button"
              className="sce-btn sce-btn-secondary"
              onClick={() => onSwitchTenant!(lastKnownTenant!)}
            >
              <Building2 size={15} />
              Continue to {lastKnownTenant}
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
