'use client';

/**
 * PoweredByBadge — the platform attribution shown across every tenant-facing app: a creamy card
 * (same tone as the app's own cards/surfaces, so it always reads correctly whether the app is
 * light or dark) with the Codevertex icon + "Powered by Codevertex Africa Limited", set in the
 * Codevertex brand purple rather than generic gray/black text. Used both on the shared PIN-login
 * brand panel (`layout="stacked"` — the original taller two-line card: uppercase "POWERED BY"
 * label over a bold name) and as the app-wide footer badge (`layout="row"`, default — a thin
 * one-line pill; replaces each app's own hand-rolled dark-pill version) so every service shows the
 * same mark, sized appropriately for where it sits.
 */

import { cx } from '../data-table/types';

/** The Codevertex Africa Limited platform icon (not the full wordmark logo — this reads clearly
 *  at small sizes and is the mark used site-wide on codevertexitsolutions.com). */
const CODEVERTEX_ICON_URL = 'https://codevertexitsolutions.com/icon.svg';

/** Codevertex Africa Limited brand purple (matches codevertex-website's `--primary` / Tailwind
 *  `brand.purple` token: hsl(291 100% 35%) = #9100B0) — used instead of theme-neutral gray/black
 *  so the mark reads as a Codevertex brand element wherever it's placed. */
const BRAND_PURPLE = '#9100B0';

export interface PoweredByBadgeProps {
  /** Override the icon (defaults to the Codevertex Africa Limited icon). */
  iconUrl?: string;
  /** 'card' (default) — the creamy pill/card used on brand panels/footers.
   *  'inline' — a bare, no-background row for tight spaces. */
  variant?: 'card' | 'inline';
  /** 'row' (default) — thin one-line "Powered by Codevertex Africa Limited" pill, for app
   *  footers. 'stacked' — the taller two-line card (uppercase "POWERED BY" label over a bold
   *  name), for the prominent PIN-login brand panel placement. */
  layout?: 'row' | 'stacked';
  /** Icon size — for `layout="row"` this drives the pill's height (thin padding, not a fixed tall
   *  box), so pass a bigger size for a more prominent placement and it stays proportioned.
   *  Defaults to a compact 'h-7 w-7' for `row`, 'h-11 w-11' for `stacked`. */
  iconClassName?: string;
  href?: string;
  className?: string;
}

export function PoweredByBadge({
  iconUrl = CODEVERTEX_ICON_URL,
  variant = 'card',
  layout = 'row',
  iconClassName,
  href = 'https://codevertexitsolutions.com',
  className,
}: PoweredByBadgeProps) {
  const stacked = layout === 'stacked';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        'inline-flex items-center transition-shadow',
        stacked ? 'gap-3' : 'gap-2',
        variant === 'card' && (stacked
          ? 'rounded-2xl bg-card px-4 py-2.5 shadow-md ring-1 ring-black/5 hover:shadow-lg'
          : 'rounded-full bg-card pl-1.5 pr-3.5 py-1.5 shadow-md ring-1 ring-black/5 hover:shadow-lg'),
        className
      )}
    >
      <img
        src={iconUrl}
        alt="Codevertex"
        className={cx(iconClassName ?? (stacked ? 'h-11 w-11' : 'h-7 w-7'), 'shrink-0 object-contain')}
      />
      {stacked ? (
        <span className="flex flex-col items-start leading-tight text-left">
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: BRAND_PURPLE, opacity: 0.65 }}
          >
            Powered by
          </span>
          <span className="text-sm font-extrabold whitespace-nowrap" style={{ color: BRAND_PURPLE }}>
            Codevertex Africa Limited
          </span>
        </span>
      ) : (
        <span className="text-xs font-bold whitespace-nowrap" style={{ color: BRAND_PURPLE }}>
          <span className="font-semibold" style={{ opacity: 0.65 }}>Powered by</span> Codevertex Africa Limited
        </span>
      )}
    </a>
  );
}
