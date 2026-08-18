import * as React$1 from 'react';

/**
 * Right-side slide-over account panel — the piece missing from every *-ui's
 * profile menu today (a small anchored dropdown, not a real account surface).
 * Mirrors Zoho Accounts/Zoho Mail's own account popup: avatar, name, email,
 * Sign Out, an optional resource-links list, and an optional `children` slot
 * for host-specific content (subscription/plan info, storage usage, an
 * AppSwitcherGrid, etc. — this component only owns the shell/chrome).
 *
 * Portals to `document.body`: a `fixed inset-0` overlay rendered inline gets
 * clipped/mispositioned by ANY ancestor establishing a CSS containing block
 * for fixed descendants (a `transform`, `filter`, or `backdrop-filter` —
 * e.g. a header using `backdrop-blur-*`, a very common host pattern in this
 * fleet). Portalling to body is the only placement immune to a host's layout.
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
declare function AccountPanel({ open, onClose, user, onSignOut, links, children }: AccountPanelProps): React$1.ReactPortal | null;

export { AccountPanel, type AccountPanelLink, type AccountPanelProps, type AccountPanelUser };
