export { S as SSOLoginModal, a as SSOLoginModalProps, b as SSOLoginResult } from '../../sso-login-modal-a_tC0IDI.js';
import * as react_jsx_runtime from 'react/jsx-runtime';

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
     * the embedded verify dialog. Use this in apps that cannot call auth-api's verify
     * endpoints directly (cross-origin) — the actual verification happens in the accounts
     * portal, while the graduated banner still surfaces the state in-app.
     */
    verifyUrl?: string;
    /** POST /auth/me/email/send-code {email} — required unless verifyUrl is set. */
    onSendCode?: (email: string) => Promise<void>;
    /** POST /auth/me/email/verify-code {email, code} — required unless verifyUrl is set. */
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
}
declare function VerifyEmailDialog({ state, onSendCode, onVerifyCode, onVerified, onClose }: VerifyEmailDialogProps): react_jsx_runtime.JSX.Element;

export { type EmailVerificationState, VerifyEmailBanner, type VerifyEmailBannerProps, VerifyEmailDialog, type VerifyEmailDialogProps, type VerifyEmailStage };
