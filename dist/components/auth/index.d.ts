export { S as SSOLoginModal, a as SSOLoginModalProps, b as SSOLoginResult } from '../../sso-login-modal-a_tC0IDI.js';
import * as react_jsx_runtime from 'react/jsx-runtime';

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
interface SSOCallbackErrorProps {
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
declare function SSOCallbackError({ error, errorDescription, orgSlug, lastKnownTenant, onRetry, onSwitchTenant, }: SSOCallbackErrorProps): react_jsx_runtime.JSX.Element;

/**
 * Best-effort POST to revoke a user's backend SSO session: deletes their Redis
 * session_token keys + DB sessions and clears the cookie. Callers still proceed
 * with local logout/redirect regardless of outcome (a stolen refresh token is
 * invalidated server-side, but the local UX never blocks on this call). Never throws.
 */
declare function revokeServerSession(ssoBaseUrl: string, accessToken?: string | null): Promise<void>;

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
type VerifyEmailStage = 'notice' | 'final_warning' | 'enforced';
interface EmailVerificationState {
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
interface VerifyEmailBannerProps {
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
declare function VerifyEmailBanner({ state, verifyUrl, onSendCode, onVerifyCode, onVerified }: VerifyEmailBannerProps): react_jsx_runtime.JSX.Element | null;
interface VerifyEmailDialogProps extends Omit<VerifyEmailBannerProps, 'onVerified' | 'onSendCode' | 'onVerifyCode'> {
    onSendCode: (email: string) => Promise<void>;
    onVerifyCode: (email: string, code: string) => Promise<void>;
    onVerified: () => void;
    onClose: () => void;
    /** Suppress the built-in overlay/close chrome when embedding inside another card. */
    embedded?: boolean;
}
declare function VerifyEmailDialog({ state, onSendCode, onVerifyCode, onVerified, onClose, embedded }: VerifyEmailDialogProps): react_jsx_runtime.JSX.Element;

/**
 * One access-token refresh for every Codevertex web app.
 *
 * auth-api rotates the refresh token on every refresh, and every app keeps its session in a
 * per-tab store persisted to localStorage. With two tabs open, the tab that refreshes first
 * rotates the token the other tab still holds in memory, so that tab's refresh is refused and the
 * person is stuck on a page where every save fails with a 401. This helper closes that gap:
 *
 * 1. Before spending a refresh token it reloads the persisted session. If another tab already
 *    holds a newer, unexpired access token, that token is adopted and no refresh is sent.
 * 2. Tabs take turns through the Web Locks API, so only one tab refreshes at a time and the
 *    next one finds the fresh session waiting for it.
 * 3. A refused refresh is checked against storage once more before it counts as a sign-out.
 * 4. An enrolment-only answer (mfa_enrollment_required) is treated as a sign-out: its token
 *    opens the authenticator setup only, so the app must send the person to sign in.
 * 5. Network and server errors come back as `transient`, so a weak connection never signs
 *    anyone out.
 *
 * The helper knows nothing about the app's store: the app passes how to read, reload and save
 * its session. Pure TypeScript, safe to import on the server (it only touches `navigator` and
 * `window` when called).
 */
interface RefreshableSession {
    accessToken: string;
    refreshToken: string;
    /** ISO string or epoch milliseconds, whichever the app stores; the saved value keeps that type. */
    expiresAt: string | number;
}
/** The fields of auth-api's POST /api/v1/auth/refresh answer this helper reads. */
interface RefreshTokenPayload {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    mfa_enrollment_required?: boolean;
}
type RefreshOutcome = {
    token: string;
}
/** auth-api refused the session (expired, ended, rotated away, or enrolment only): sign out. */
 | {
    rejected: true;
}
/** auth-api could not be reached or failed: keep the session and let the request fail softly. */
 | {
    transient: true;
};
interface SessionRefresherOptions<S extends RefreshableSession> {
    /** Names the cross-tab lock; use the app's persisted store key, e.g. 'treasury-auth-storage'. */
    lockName: string;
    getSession: () => S | null;
    /** Re-reads the session another tab may have written (zustand: `useAuthStore.persist.rehydrate`). */
    reloadSession?: () => unknown | Promise<unknown>;
    saveSession: (next: S) => void;
    /** Calls auth-api's refresh endpoint; throw an error carrying `status` on a non-2xx answer. */
    refresh: (refreshToken: string) => Promise<RefreshTokenPayload>;
    /** A token closer than this to expiry is not adopted from another tab. Default 30 seconds. */
    minRemainingMs?: number;
    now?: () => number;
}
/** Epoch milliseconds of an ISO or epoch expiry; 0 when it cannot be read. */
declare function expiryMs(expiresAt: string | number | null | undefined): number;
/** The HTTP status on a fetch-style (`status`) or axios-style (`response.status`) error. */
declare function errorStatus(err: unknown): number | undefined;
/** 400, 401 and 403 mean auth-api refused the refresh token; anything else is transient. */
declare function isRefusal(status: number | undefined): boolean;
/**
 * Builds the app's refresh function. Concurrent calls in one tab share one attempt.
 *
 * Pass the access token the server just rejected as `failedToken` when it is known (the 401
 * handler has it); otherwise the token held in memory at call time is used.
 */
declare function createSessionRefresher<S extends RefreshableSession>(opts: SessionRefresherOptions<S>): (failedToken?: string | null) => Promise<RefreshOutcome>;
/**
 * Calls `onChange` when another tab writes the persisted session, so this tab picks up the new
 * tokens instead of writing its stale copy back over them. Returns the unsubscribe function.
 * zustand apps pass `() => useAuthStore.persist.rehydrate()` and then re-point their API client.
 */
declare function watchSessionAcrossTabs(storageKey: string, onChange: () => void): () => void;

export { type EmailVerificationState, type RefreshOutcome, type RefreshTokenPayload, type RefreshableSession, SSOCallbackError, type SSOCallbackErrorProps, type SessionRefresherOptions, VerifyEmailBanner, type VerifyEmailBannerProps, VerifyEmailDialog, type VerifyEmailDialogProps, type VerifyEmailStage, createSessionRefresher, errorStatus, expiryMs, isRefusal, revokeServerSession, watchSessionAcrossTabs };
