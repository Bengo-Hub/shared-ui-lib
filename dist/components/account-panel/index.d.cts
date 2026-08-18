import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Right-side slide-over account panel — the piece missing from every *-ui's
 * profile menu today (a small anchored dropdown, not a real account surface).
 * Mirrors Zoho Accounts/Zoho Mail's own account popup: avatar, name, email,
 * Sign Out, an optional resource-links list, and an optional `children` slot
 * for host-specific content (subscription/plan info, storage usage, an
 * AppSwitcherGrid, etc. — this component only owns the shell/chrome).
 *
 * Self-contained like the rest of shared-ui-lib: no portal/dialog dependency,
 * plain fixed-position backdrop + panel, raw Tailwind semantic-token classes.
 */
interface AccountPanelUser {
    name: string;
    email: string;
    avatarUrl?: string | null;
}
interface AccountPanelLink {
    label: string;
    href: string;
}
interface AccountPanelProps {
    open: boolean;
    onClose: () => void;
    user: AccountPanelUser;
    onSignOut: () => void;
    /** e.g. User Guide / Help / Docs — rendered as a simple link list below the main content. */
    links?: AccountPanelLink[];
    /** Host-specific content (plan/subscription info, storage bar, app switcher…). */
    children?: React.ReactNode;
}
declare function AccountPanel({ open, onClose, user, onSignOut, links, children }: AccountPanelProps): react_jsx_runtime.JSX.Element | null;

export { AccountPanel, type AccountPanelLink, type AccountPanelProps, type AccountPanelUser };
