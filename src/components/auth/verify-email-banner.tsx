'use client';

import * as React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Mail, MailWarning, X } from 'lucide-react';

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
 *
 * IMPORTANT: this component's own visual styling is fully self-contained via a scoped
 * <style> block (class prefix `veb-`). It must NOT rely on the host app's Tailwind config
 * being present, because the same component ships into many apps with different design
 * tokens/content globs. Earlier the action button used Tailwind class *names*
 * (bg-neutral-900 / text-white); apps whose Tailwind build didn't emit the neutral palette
 * rendered a transparent button with white text — an invisible primary action. Everything
 * that matters visually is now inline style or scoped CSS.
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
  /**
   * When set, the banner's action DEEP-LINKS here (the accounts portal) instead of opening
   * the embedded verify dialog. Use this ONLY in apps that cannot call auth-api's verify
   * endpoints directly. Prefer wiring onSendCode/onVerifyCode — the embedded OTP flow is a
   * better experience and works cross-origin (auth-api CORS allows it).
   */
  verifyUrl?: string;
  /** POST /auth/me/email/send-code {email} — required for the embedded flow. */
  onSendCode?: (email: string) => Promise<void>;
  /** POST /auth/me/email/verify-code {email, code} — required for the embedded flow. */
  onVerifyCode?: (email: string, code: string) => Promise<void>;
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

// Inline background/foreground for the banner action so it is NEVER invisible, regardless
// of the host app's Tailwind palette.
const ACTION_COLORS: Record<VerifyEmailStage, { bg: string; fg: string }> = {
  notice: { bg: '#d97706', fg: '#ffffff' },
  final_warning: { bg: '#dc2626', fg: '#ffffff' },
  enforced: { bg: '#b91c1c', fg: '#ffffff' },
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

export function VerifyEmailBanner({ state, verifyUrl, onSendCode, onVerifyCode, onVerified }: VerifyEmailBannerProps) {
  const [open, setOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  const stage: VerifyEmailStage = (state?.stage as VerifyEmailStage) ?? 'notice';
  const mustAct = stage === 'enforced';
  // Embedded mode is preferred: the app supplies the verify callbacks and we open the OTP
  // dialog in-place. Deep-link mode (verifyUrl only, no callbacks) sends the user to the
  // accounts portal — a fallback for apps that don't wire the callbacks.
  const canEmbed = !!onSendCode && !!onVerifyCode;
  const linkMode = !canEmbed && !!verifyUrl;

  // In the enforced stage the embedded dialog opens on its own and cannot be waved away.
  // In link mode there is no dialog to force open.
  React.useEffect(() => {
    if (state && !state.verified && mustAct && canEmbed) setOpen(true);
  }, [state, mustAct, canEmbed]);

  if (!state || state.verified) return null;
  if (dismissed && stage === 'notice') return null;

  const actionLabel = state.is_placeholder ? 'Add email' : 'Verify email';
  const colors = ACTION_COLORS[stage];

  return (
    <>
      <div className={`border-b ${BANNER_STYLES[stage]}`} role="alert">
        <div className={`mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 ${TEXT_STYLES[stage]}`}>
          <span className="shrink-0">
            {stage === 'notice' ? <MailWarning className="size-4" /> : <AlertTriangle className="size-4" />}
          </span>
          <p className="flex-1 text-sm">{bannerMessage(state)}</p>
          {linkMode ? (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.bg, color: colors.fg }}
            >
              {actionLabel}
              <ArrowRight className="size-3" />
            </a>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.bg, color: colors.fg }}
            >
              {actionLabel}
              <ArrowRight className="size-3" />
            </button>
          )}
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

      {open && onSendCode && onVerifyCode && (
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

export interface VerifyEmailDialogProps extends Omit<VerifyEmailBannerProps, 'onVerified' | 'onSendCode' | 'onVerifyCode'> {
  onSendCode: (email: string) => Promise<void>;
  onVerifyCode: (email: string, code: string) => Promise<void>;
  onVerified: () => void;
  onClose: () => void;
  /** Suppress the built-in overlay/close chrome when embedding inside another card. */
  embedded?: boolean;
}

/* ------------------------------------------------------------------ *
 * Self-contained styling. Injected once; scoped by the `veb-` prefix.
 * Uses the prefers-color-scheme media query for dark mode so it needs
 * nothing from the host app.
 * ------------------------------------------------------------------ */
const DIALOG_CSS = `
.veb-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.55);backdrop-filter:blur(2px);}
.veb-card{width:100%;max-width:440px;border-radius:18px;background:#ffffff;color:#0f172a;box-shadow:0 20px 60px -12px rgba(15,23,42,.35);padding:28px 26px;box-sizing:border-box;font-family:inherit;}
.veb-card *{box-sizing:border-box;}
.veb-icon{width:52px;height:52px;margin:0 auto 12px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(147,51,234,.12);color:#9333ea;}
.veb-title{margin:0;text-align:center;font-size:19px;font-weight:700;line-height:1.25;color:#0f172a;}
.veb-sub{margin:6px auto 0;text-align:center;font-size:13.5px;line-height:1.5;color:#64748b;max-width:340px;}
.veb-sub b{color:#334155;font-weight:600;}
.veb-alert{margin:16px 0 4px;border-radius:12px;padding:11px 13px;font-size:13px;line-height:1.45;border:1px solid;}
.veb-alert-warn{background:#fef2f2;border-color:#fecaca;color:#b91c1c;}
.veb-label{display:block;margin:18px 0 7px;font-size:12px;font-weight:600;color:#475569;}
.veb-input{width:100%;height:46px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;padding:0 14px;font-size:15px;outline:none;transition:border-color .15s,box-shadow .15s;}
.veb-input:focus{border-color:#9333ea;box-shadow:0 0 0 3px rgba(147,51,234,.18);}
.veb-input:disabled{background:#f8fafc;color:#94a3b8;cursor:not-allowed;}
.veb-otp{display:flex;justify-content:center;gap:9px;margin-top:6px;}
.veb-otp-box{width:46px;height:56px;text-align:center;font-size:22px;font-weight:700;color:#0f172a;border-radius:13px;border:1.5px solid #e2e8f0;background:#fff;outline:none;transition:border-color .15s,box-shadow .15s;}
.veb-otp-box:focus{border-color:#9333ea;box-shadow:0 0 0 3px rgba(147,51,234,.18);}
.veb-otp-box:disabled{opacity:.6;}
.veb-err{display:flex;align-items:flex-start;gap:8px;margin-top:14px;padding:10px 12px;font-size:13px;line-height:1.4;border-radius:11px;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;}
.veb-ok{margin-top:12px;text-align:center;font-size:12.5px;color:#059669;}
.veb-btn{width:100%;height:48px;margin-top:20px;border:none;border-radius:13px;font-size:15px;font-weight:700;color:#fff;background:#9333ea;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 24px -8px rgba(147,51,234,.6);transition:background .15s,opacity .15s;}
.veb-btn:hover:not(:disabled){background:#7e22ce;}
.veb-btn:disabled{opacity:.55;cursor:not-allowed;box-shadow:none;}
.veb-foot{margin-top:16px;text-align:center;font-size:13px;color:#64748b;}
.veb-link{background:none;border:none;padding:0;font-size:13px;font-weight:700;color:#9333ea;cursor:pointer;text-decoration:none;}
.veb-link:hover:not(:disabled){text-decoration:underline;}
.veb-link:disabled{opacity:.5;cursor:not-allowed;}
.veb-later{background:none;border:none;font-size:13px;color:#94a3b8;cursor:pointer;padding:6px;margin-top:10px;width:100%;}
.veb-later:hover{color:#64748b;}
.veb-wait{margin-top:14px;text-align:center;font-size:12.5px;color:#94a3b8;}
.veb-spin{animation:veb-spin 1s linear infinite;}
@keyframes veb-spin{to{transform:rotate(360deg);}}
@media (prefers-color-scheme: dark){
  .veb-card{background:#0f172a;color:#e2e8f0;box-shadow:0 20px 60px -12px rgba(0,0,0,.6);}
  .veb-title{color:#f1f5f9;}
  .veb-sub{color:#94a3b8;}
  .veb-sub b{color:#cbd5e1;}
  .veb-label{color:#94a3b8;}
  .veb-input{background:#1e293b;border-color:#334155;color:#f1f5f9;}
  .veb-input:disabled{background:#1e293b;color:#64748b;}
  .veb-otp-box{background:#1e293b;border-color:#334155;color:#f1f5f9;}
  .veb-alert-warn{background:rgba(127,29,29,.35);border-color:rgba(153,27,27,.6);color:#fca5a5;}
  .veb-err{background:rgba(127,29,29,.3);border-color:rgba(153,27,27,.5);color:#fca5a5;}
  .veb-foot{color:#94a3b8;}
}
`;

let cssInjected = false;
function useDialogCss() {
  React.useEffect(() => {
    if (cssInjected || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.setAttribute('data-veb', '');
    el.textContent = DIALOG_CSS;
    document.head.appendChild(el);
    cssInjected = true;
  }, []);
}

/** Six-box OTP entry with auto-advance, paste, and backspace, mirroring the signup wizard. */
function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: (v: string) => void;
  disabled?: boolean;
}) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(() => {
    const arr = value.split('');
    return Array.from({ length: 6 }, (_, i) => arr[i] ?? '');
  }, [value]);

  React.useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (i: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (clean.length > 1) {
      const next = clean.slice(0, 6);
      onChange(next);
      if (next.length === 6) onComplete(next);
      else refs.current[Math.min(next.length, 5)]?.focus();
      return;
    }
    const copy = [...digits];
    copy[i] = clean;
    const joined = copy.join('');
    onChange(joined);
    if (clean && i < 5) refs.current[i + 1]?.focus();
    if (joined.length === 6 && !copy.includes('')) onComplete(joined);
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="veb-otp">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="veb-otp-box"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          value={d}
          disabled={disabled}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
        />
      ))}
    </div>
  );
}

export function VerifyEmailDialog({ state, onSendCode, onVerifyCode, onVerified, onClose, embedded }: VerifyEmailDialogProps) {
  useDialogCss();
  const s = state!;
  const stage: VerifyEmailStage = (s.stage as VerifyEmailStage) ?? 'notice';

  const [email, setEmail] = React.useState(s.is_placeholder ? '' : s.email);
  const [code, setCode] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resent, setResent] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  // Resend cooldown countdown.
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Enforced stage: a mandatory wait that grows each day past the grace period. The dialog
  // cannot be closed until it elapses (verifying ends it immediately).
  const [wait, setWait] = React.useState(stage === 'enforced' ? (s.wait_seconds ?? 60) : 0);
  React.useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const canClose = !embedded && (stage !== 'enforced' || wait <= 0);

  const doSend = React.useCallback(async (isResend: boolean) => {
    setError(null);
    if (!email.includes('@') || !email.includes('.')) {
      setError('Enter a valid email address.');
      return;
    }
    setSending(true);
    try {
      await onSendCode(email);
      setSent(true);
      if (isResend) {
        setResent(true);
        setCooldown(45);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code. Please try again.');
    } finally {
      setSending(false);
    }
  }, [email, onSendCode]);

  const doVerify = React.useCallback(async (full: string) => {
    setError(null);
    setResent(false);
    if (full.length !== 6) {
      setError('Enter the 6-digit code we emailed you.');
      return;
    }
    setVerifying(true);
    try {
      await onVerifyCode(email, full);
      onVerified();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code is incorrect or has expired.');
      setCode('');
    } finally {
      setVerifying(false);
    }
  }, [email, onVerifyCode, onVerified]);

  const changeEmail = () => {
    setSent(false);
    setCode('');
    setError(null);
    setResent(false);
    setCooldown(0);
  };

  const busy = sending || verifying;

  const card = (
    <div className="veb-card" role="dialog" aria-modal="true" aria-label="Verify your email">
      <div className="veb-icon">
        <Mail className="size-6" />
      </div>
      <h2 className="veb-title">
        {s.is_placeholder ? 'Add a real email address' : 'Verify your email'}
      </h2>
      <p className="veb-sub">
        {!sent ? (
          s.is_placeholder
            ? 'Your account was set up without a reachable email. Add yours below — we’ll send a 6-digit code, and it will replace the placeholder on your account.'
            : 'Confirm this address is yours so we can send receipts, alerts and password resets, and so you can recover your account.'
        ) : (
          <>We sent a 6-digit code to <b>{email}</b>.</>
        )}
      </p>

      {stage === 'final_warning' && (
        <div className="veb-alert veb-alert-warn">
          <strong>
            Your account will be disabled in {s.days_until_disable ?? 0} day
            {(s.days_until_disable ?? 0) === 1 ? '' : 's'}.
          </strong>{' '}
          Verify your email to keep access.
        </div>
      )}
      {stage === 'enforced' && (
        <div className="veb-alert veb-alert-warn">
          <strong>The grace period has passed.</strong> Verify your email to remove this
          interruption — the wait grows each day until you do.
        </div>
      )}

      {!sent ? (
        <>
          <label className="veb-label" htmlFor="veb-email">Email address</label>
          <input
            id="veb-email"
            className="veb-input"
            type="email"
            value={email}
            disabled={sending}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSend(false); }}
            placeholder="name@example.com"
          />
          {error && (
            <div className="veb-err"><AlertTriangle className="size-4" style={{ flexShrink: 0, marginTop: 1 }} /><span>{error}</span></div>
          )}
          <button className="veb-btn" onClick={() => doSend(false)} disabled={busy}>
            {sending ? <Loader2 className="size-5 veb-spin" /> : <>Send code <ArrowRight className="size-4" /></>}
          </button>
        </>
      ) : (
        <>
          <label className="veb-label" style={{ textAlign: 'center' }}>Enter the code</label>
          <OtpInput value={code} onChange={setCode} onComplete={doVerify} disabled={verifying} />
          {error && (
            <div className="veb-err"><AlertTriangle className="size-4" style={{ flexShrink: 0, marginTop: 1 }} /><span>{error}</span></div>
          )}
          {resent && !error && <p className="veb-ok">A new code has been sent.</p>}
          <button className="veb-btn" onClick={() => doVerify(code)} disabled={busy || code.length !== 6}>
            {verifying ? <Loader2 className="size-5 veb-spin" /> : <><CheckCircle2 className="size-4" /> Verify &amp; Continue</>}
          </button>
          <div className="veb-foot">
            Didn&apos;t get it?{' '}
            <button className="veb-link" onClick={() => doSend(true)} disabled={sending || cooldown > 0}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : sending ? 'Sending…' : 'Resend code'}
            </button>
            {' · '}
            <button className="veb-link" onClick={changeEmail} disabled={busy}>Change email</button>
          </div>
        </>
      )}

      {canClose && (
        <button className="veb-later" onClick={onClose}>Later</button>
      )}
      {!embedded && !canClose && stage === 'enforced' && (
        <div className="veb-wait">You can continue in {wait}s</div>
      )}
    </div>
  );

  if (embedded) return card;

  return <div className="veb-overlay">{card}</div>;
}
