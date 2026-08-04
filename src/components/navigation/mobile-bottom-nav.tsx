'use client';

import type { ComponentType, ReactNode } from 'react';

export interface MobileNavTab {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Whether this tab represents the current route. Callers own their own route-matching. */
  active?: boolean;
}

export interface MobileBottomNavCenterAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: ComponentType<{ className?: string }>;
}

export type MobileNavLinkComponent = ComponentType<{
  href: string;
  className?: string;
  'aria-label'?: string;
  children: ReactNode;
}>;

export interface MobileBottomNavProps {
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

const DefaultLink: MobileNavLinkComponent = ({ href, className, children, ...rest }) => (
  <a href={href} className={className} {...rest}>
    {children}
  </a>
);

/**
 * MobileBottomNav — app-style bottom navigation bar for phones/tablets, extracted from pos-ui's
 * mobile-bottom-nav.tsx (itself "ported from inventory-ui's pattern" per that file's own comment)
 * so a third consumer (e.g. treasury-ui) doesn't hand-copy it a third time. Fixed to the viewport
 * bottom, safe-area-aware (iOS home-indicator inset), with an optional elevated center action and
 * a trailing "More" tab that opens the app's full nav drawer. Callers own their own tab list,
 * active-route matching, and permission gating — this component is purely the shell/layout.
 */
export function MobileBottomNav({
  tabs,
  centerAction,
  onOpenMore,
  moreLabel = 'More',
  LinkComponent = DefaultLink,
  className = '',
}: MobileBottomNavProps) {
  const Link = LinkComponent;
  const hasCenter = !!centerAction;
  const colCount = tabs.length + (hasCenter ? 1 : 0) + (onOpenMore ? 1 : 0);

  return (
    <nav
      className={`lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] ${className}`}
    >
      <div className="grid items-end h-16" style={{ gridTemplateColumns: `repeat(${Math.max(colCount, 1)}, minmax(0, 1fr))` }}>
        {tabs.slice(0, Math.ceil(tabs.length / 2)).map((tab) => (
          <NavTab key={tab.key} tab={tab} Link={Link} />
        ))}

        {hasCenter && centerAction && (
          <div className="flex items-end justify-center">
            {centerAction.href ? (
              <Link
                href={centerAction.href}
                aria-label={centerAction.label}
                className="mb-2 flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              >
                <centerAction.icon className="h-7 w-7" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={centerAction.onClick}
                aria-label={centerAction.label}
                className="mb-2 flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              >
                <centerAction.icon className="h-7 w-7" />
              </button>
            )}
          </div>
        )}

        {tabs.slice(Math.ceil(tabs.length / 2)).map((tab) => (
          <NavTab key={tab.key} tab={tab} Link={Link} />
        ))}

        {onOpenMore && (
          <button
            type="button"
            onClick={onOpenMore}
            className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground active:text-foreground"
          >
            <MoreDotsIcon className="h-5 w-5" />
            <span className="text-[10px] font-semibold leading-none">{moreLabel}</span>
          </button>
        )}
      </div>
    </nav>
  );
}

function NavTab({ tab, Link }: { tab: MobileNavTab; Link: MobileNavLinkComponent }) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      className={`flex h-full flex-col items-center justify-center gap-1 transition-colors ${
        tab.active ? 'text-primary' : 'text-muted-foreground active:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="max-w-full truncate text-[10px] font-semibold leading-none">{tab.label}</span>
    </Link>
  );
}

// Inline so this component has no icon-library dependency beyond the caller-supplied tab/action
// icons — "More" is the one icon this component renders itself.
function MoreDotsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}
