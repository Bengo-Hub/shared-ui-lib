'use client';

/**
 * PoweredByBadge — the platform attribution shown across every tenant-facing app: a creamy card
 * (same tone as the app's own cards/surfaces, so it always reads correctly whether the app is
 * light or dark) with the Codevertex icon + "Powered by Codevertex Africa Limited". Used both on
 * the shared PIN-login brand panel and as the app-wide footer badge (replacing each app's own
 * hand-rolled dark-pill version) so every service shows the exact same mark.
 */

import React from 'react';
import { cx } from '../data-table/types';

/** The Codevertex Africa Limited platform icon (not the full wordmark logo — this reads clearly
 *  at small sizes and is the mark used site-wide on codevertexitsolutions.com). */
const CODEVERTEX_ICON_URL = 'https://codevertexitsolutions.com/icon.svg';

export interface PoweredByBadgeProps {
  /** Override the icon (defaults to the Codevertex Africa Limited icon). */
  iconUrl?: string;
  /** 'card' (default) — the creamy bordered card used on brand panels/footers.
   *  'inline' — a bare, no-background row for tight spaces. */
  variant?: 'card' | 'inline';
  /** Icon box size in px-equivalent Tailwind units, e.g. 'h-11 w-11' (default). */
  iconClassName?: string;
  href?: string;
  className?: string;
}

export function PoweredByBadge({
  iconUrl = CODEVERTEX_ICON_URL,
  variant = 'card',
  iconClassName = 'h-11 w-11',
  href = 'https://codevertexitsolutions.com',
  className,
}: PoweredByBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        'inline-flex items-center gap-3 transition-shadow',
        variant === 'card' && 'rounded-2xl bg-card px-4 py-3.5 shadow-lg ring-1 ring-black/5 hover:shadow-xl',
        className
      )}
    >
      <img src={iconUrl} alt="Codevertex" className={cx(iconClassName, 'shrink-0 object-contain')} />
      <span className="text-left leading-tight">
        <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Powered by</span>
        <span className="block text-sm font-black text-foreground whitespace-nowrap">Codevertex Africa Limited</span>
      </span>
    </a>
  );
}
