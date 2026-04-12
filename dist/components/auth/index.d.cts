import * as react_jsx_runtime from 'react/jsx-runtime';

interface SSOLoginResult {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        [key: string]: unknown;
    };
}
interface SSOLoginModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Tenant slug for auth-ui URL construction */
    tenantSlug: string;
    /** Auth-UI base URL */
    authUiUrl?: string;
    /** Called when SSO login succeeds — receives tokens and user info */
    onLoginSuccess?: (result: SSOLoginResult) => void;
    /** Called when login fails */
    onLoginFailed?: (error: string) => void;
    /** Optional title override */
    title?: string;
}
declare function SSOLoginModal({ open, onOpenChange, tenantSlug, authUiUrl, onLoginSuccess, onLoginFailed, title, }: SSOLoginModalProps): react_jsx_runtime.JSX.Element | null;

export { SSOLoginModal, type SSOLoginModalProps, type SSOLoginResult };
