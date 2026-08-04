import * as react_jsx_runtime from 'react/jsx-runtime';
import { ComponentType, ReactNode } from 'react';

interface MobileNavTab {
    key: string;
    label: string;
    href: string;
    icon: ComponentType<{
        className?: string;
    }>;
    /** Whether this tab represents the current route. Callers own their own route-matching. */
    active?: boolean;
}
interface MobileBottomNavCenterAction {
    label: string;
    href?: string;
    onClick?: () => void;
    icon: ComponentType<{
        className?: string;
    }>;
}
type MobileNavLinkComponent = ComponentType<{
    href: string;
    className?: string;
    'aria-label'?: string;
    children: ReactNode;
}>;
interface MobileBottomNavProps {
    /** Left-of-center and right-of-center tabs — typically 1-2 each side of the center action. */
    tabs: MobileNavTab[];
    /** Elevated circular button in the middle of the bar (e.g. "New Sale", "New Invoice"). Omit
     *  for a bar with no primary action — tabs then split evenly across the full width. */
    centerAction?: MobileBottomNavCenterAction;
    /** Trailing "More" tab that opens the full navigation drawer/sidebar. Omit to hide it. */
    onOpenMore?: () => void;
    moreLabel?: string;
    /** Renders a nav link — defaults to a plain `<a>` so this component has zero framework
     *  dependency. Pass Next.js `Link` (or your router's equivalent) for client-side navigation:
     *  `LinkComponent={Link}`. */
    LinkComponent?: MobileNavLinkComponent;
    className?: string;
}
/**
 * MobileBottomNav — app-style bottom navigation bar for phones/tablets, extracted from pos-ui's
 * mobile-bottom-nav.tsx (itself "ported from inventory-ui's pattern" per that file's own comment)
 * so a third consumer (e.g. treasury-ui) doesn't hand-copy it a third time. Fixed to the viewport
 * bottom, safe-area-aware (iOS home-indicator inset), with an optional elevated center action and
 * a trailing "More" tab that opens the app's full nav drawer. Callers own their own tab list,
 * active-route matching, and permission gating — this component is purely the shell/layout.
 */
declare function MobileBottomNav({ tabs, centerAction, onOpenMore, moreLabel, LinkComponent, className, }: MobileBottomNavProps): react_jsx_runtime.JSX.Element;

export { MobileBottomNav, type MobileBottomNavCenterAction, type MobileBottomNavProps, type MobileNavLinkComponent, type MobileNavTab };
