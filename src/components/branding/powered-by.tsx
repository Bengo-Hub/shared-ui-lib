'use client';

/**
 * PoweredByBadge — the platform attribution shown across every tenant-facing app: a creamy card
 * (same tone as the app's own cards/surfaces, so it always reads correctly whether the app is
 * light or dark) with the Codevertex icon + "Powered by Codevertex Africa Limited". Used both on
 * the shared PIN-login brand panel and as the app-wide footer badge (replacing each app's own
 * hand-rolled dark-pill version) so every service shows the exact same mark.
 */

import { cx } from '../data-table/types';

/** The Codevertex Africa Limited platform icon (not the full wordmark logo — this reads clearly
 *  at small sizes and is the mark used site-wide on codevertexitsolutions.com). */
const CODEVERTEX_ICON_URL = 'https://codevertexitsolutions.com/icon.svg';

export interface PoweredByBadgeProps {
  /** Override the icon (defaults to the Codevertex Africa Limited icon). */
  iconUrl?: string;
  /** 'card' (default) — the thin creamy pill used on brand panels/footers.
   *  'inline' — a bare, no-background row for tight spaces. */
  variant?: 'card' | 'inline';
  /** Icon size — this drives the pill's height (thin padding, not a fixed tall box), so pass a
   *  bigger size (e.g. 'h-10 w-10') for a more prominent placement and it stays proportioned.
   *  Defaults to a compact 'h-7 w-7' sized for a one-line footer badge. */
  iconClassName?: string;
  href?: string;
  className?: string;
}

export function PoweredByBadge({
  iconUrl = CODEVERTEX_ICON_URL,
  variant = 'card',
  iconClassName = 'h-7 w-7',
  href = 'https://codevertexitsolutions.com',
  className,
}: PoweredByBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        'inline-flex items-center gap-2 transition-shadow',
        variant === 'card' && 'rounded-full bg-card pl-1.5 pr-3.5 py-1.5 shadow-md ring-1 ring-black/5 hover:shadow-lg',
        className
      )}
    >
      <img src={iconUrl} alt="Codevertex" className={cx(iconClassName, 'shrink-0 object-contain')} />
      <span className="text-xs font-bold text-foreground whitespace-nowrap">
        <span className="text-muted-foreground font-semibold">Powered by</span> Codevertex Africa Limited
      </span>
    </a>
  );
}
