'use client';

import * as React from 'react';
import { AlertTriangle, ArrowRight, MailWarning, X } from 'lucide-react';

/**
 * Graduated email-verification prompt.
 *
 * Existing SSO accounts are not silently trusted: they must prove their email. Access is
 * never hard-blocked — it degrades on a schedule computed by auth-api and returned on
 * /me as `email_verification`:
 *
 *   notice        (0-30d)  dismissible amber banner + explanatory dialog
 *   final_warning (30-37d) red banner: the account will be disabled; 7-day grace
 *   enforced      (37d+)   dialog imposes a wait (60s, +30s per day) before it can close
 *
 * Accounts provisioned with a placeholder address (e.g. <id>@unknown.local) are asked for
 * a REAL email; once the code is confirmed, that address REPLACES the one on file.
 */

export type VerifyEmailStage = 'notice' | 'final_warning' | 'enforced';

export interface EmailVerificationState {
  verified: boolean;
  email: string;
  /** Synthetic address that can never receive mail — user must supply a real one. */
  is_placeholder: boolean;
  /**
   * True only for roles that actually receive notifications. Those escalate to
   * final_warning/enforced. Non-notified roles stay on `notice` forever: a standing
   * reminder that never threatens or degrades their access.
   */
  strict: boolean;
  stage?: VerifyEmailStage;
  required_since?: string;
  disable_at?: string;
  days_until_disable?: number;
  /** Forced countdown (seconds) before the dialog may be dismissed. Enforced stage only. */
  wait_seconds?: number;
}

export interface VerifyEmailBannerProps {
  state: EmailVerificationState | null | undefined;
  /** POST /auth/me/email/send-code {email} */
  onSendCode: (email: string) => Promise<void>;
  /** POST /auth/me/email/verify-code {email, code} */
  onVerifyCode: (email: string, code: string) => Promise<void>;
  /** Called after a successful verification so the app can refetch /me. */
  onVerified?: () => void;
}

const BANNER_STYLES: Record<VerifyEmailStage, string> = {
  notice: 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40',
  final_warning: 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40',
  enforced: 'border-red-300 bg-red-100 dark:border-red-800 dark:bg-red-950/60',
};

const TEXT_STYLES: Record<VerifyEmailStage, string> = {
  notice: 'text-amber-800 dark:text-amber-200',
  final_warning: 'text-red-800 dark:text-red-200',
  enforced: 'text-red-900 dark:text-red-100',
};

const ACTION_STYLES: Record<VerifyEmailStage, string> = {
  notice: 'bg-amber-600 text-white hover:bg-amber-700',
  final_warning: 'bg-red-600 text-white hover:bg-red-700',
  enforced: 'bg-red-700 text-white hover:bg-red-800',
};

function bannerMessage(state: EmailVerificationState): string {
  const stage = state.stage ?? 'notice';
  const days = state.days_until_disable ?? 0;
  if (stage === 'notice') {
    return state.is_placeholder
      ? 'Your account has no real email address. Add and verify one to secure your account and receive important notifications.'
      : 'Please verify your email address to secure your account and keep receiving important notifications.';
  }
  if (stage === 'final_warning') {
    return `Your email is still unverified. This account will be disabled in ${days} day${days === 1 ? '' : 's'} unless you verify it.`;
  }
  return 'Your email is unverified and the grace period has passed. Verify now to restore full access.';
}

export function VerifyEmailBanner({ state, onSendCode, onVerifyCode, onVerified }: VerifyEmailBannerProps) {
  const [open, setOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  const stage: VerifyEmailStage = (state?.stage as VerifyEmailStage) ?? 'notice';
  const mustAct = stage === 'enforced';

  // In the enforced stage the dialog opens on its own and cannot be waved away.
  React.useEffect(() => {
    if (state && !state.verified && mustAct) setOpen(true);
  }, [state, mustAct]);

  if (!state || state.verified) return null;
  if (dismissed && stage === 'notice') return null;

  return (
    <>
      <div className={`border-b ${BANNER_STYLES[stage]}`} role="alert">
        <div className={`mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 ${TEXT_STYLES[stage]}`}>
          <span className="shrink-0">
            {stage === 'notice' ? <MailWarning className="size-4" /> : <AlertTriangle className="size-4" />}
          </span>
          <p className="flex-1 text-sm">{bannerMessage(state)}</p>
          <button
            onClick={() => setOpen(true)}
            className={`inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${ACTION_STYLES[stage]}`}
          >
            {state.is_placeholder ? 'Add email' : 'Verify email'}
            <ArrowRight className="size-3" />
          </button>
          {/* Only the soft notice can be dismissed for the session. */}
          {stage === 'notice' && (
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {open && (
        <VerifyEmailDialog
          state={state}
          onSendCode={onSendCode}
          onVerifyCode={onVerifyCode}
          onVerified={() => {
            setOpen(false);
            onVerified?.();
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export interface VerifyEmailDialogProps extends Omit<VerifyEmailBannerProps, 'onVerified'> {
  onVerified: () => void;
  onClose: () => void;
}

export function VerifyEmailDialog({ state, onSendCode, onVerifyCode, onVerified, onClose }: VerifyEmailDialogProps) {
  const s = state!;
  const stage: VerifyEmailStage = (s.stage as VerifyEmailStage) ?? 'notice';

  const [email, setEmail] = React.useState(s.is_placeholder ? '' : s.email);
  const [code, setCode] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Enforced stage: a mandatory wait that grows each day past the grace period. The dialog
  // cannot be closed until it elapses (verifying ends it immediately).
  const [wait, setWait] = React.useState(stage === 'enforced' ? (s.wait_seconds ?? 60) : 0);
  React.useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const canClose = stage !== 'enforced' || wait <= 0;

  async function handleSend() {
    setError(null);
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      await onSendCode(email);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    setError(null);
    if (!code.trim()) {
      setError('Enter the 6-digit code we emailed you.');
      return;
    }
    setBusy(true);
    try {
      await onVerifyCode(email, code.trim());
      onVerified();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code is not valid.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="mb-3 flex items-start gap-3">
          <span className={stage === 'notice' ? 'text-amber-600' : 'text-red-600'}>
            {stage === 'notice' ? <MailWarning className="size-5" /> : <AlertTriangle className="size-5" />}
          </span>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {s.is_placeholder ? 'Add a real email address' : 'Verify your email address'}
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {s.is_placeholder
                ? 'Your account was set up without a real email, so we cannot reach you. Add your email below — we will send a 6-digit code to confirm it, and it will replace the placeholder on your account.'
                : 'We need to confirm this address is yours so we can send receipts, alerts and password resets, and so you can recover your account.'}
            </p>
          </div>
        </div>

        {stage === 'final_warning' && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            <strong>Your account will be disabled in {s.days_until_disable ?? 0} day
            {(s.days_until_disable ?? 0) === 1 ? '' : 's'}.</strong> Verify your email to keep access.
          </div>
        )}
        {stage === 'enforced' && (
          <div className="mb-3 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100">
            <strong>The grace period has passed.</strong> Verify your email to remove this
            interruption — it gets longer each day until you do.
          </div>
        )}

        <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Email address
        </label>
        <input
          type="email"
          value={email}
          disabled={sent}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:disabled:bg-neutral-800/60"
        />

        {sent && (
          <>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              6-digit code sent to {email}
            </label>
            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm tracking-widest dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </>
        )}

        {error && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-end gap-2">
          {canClose ? (
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Later
            </button>
          ) : (
            <span className="mr-auto text-xs text-neutral-500 dark:text-neutral-400">
              You can continue in {wait}s
            </span>
          )}
          {!sent ? (
            <button
              onClick={handleSend}
              disabled={busy}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            >
              {busy ? 'Sending…' : 'Send code'}
            </button>
          ) : (
            <>
              <button
                onClick={handleSend}
                disabled={busy}
                className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Resend
              </button>
              <button
                onClick={handleVerify}
                disabled={busy}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
              >
                {busy ? 'Verifying…' : 'Verify'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
