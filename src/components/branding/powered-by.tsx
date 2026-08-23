'use client';

/**
 * PoweredByBadge — the platform attribution shown across every tenant-facing app: a rounded white
 * pill holding the Codevertex icon in its own light chip, then "POWERED BY" in bold dark type and
 * "CODEVERTEX AFRICA LIMITED" in the Codevertex brand orange — all uppercase, on one line (the
 * design in the reference mark). Used both on the shared PIN-login brand panel (`layout="stacked"`,
 * the two-line variant that stacks the label over the name) and as the app-wide footer badge
 * (`layout="row"`, default) so every service shows the same mark, sized for where it sits.
 */

import { cx } from '../data-table/types';

/** The Codevertex Africa Limited platform icon (not the full wordmark logo — this reads clearly
 *  at small sizes and is the mark used site-wide on codevertexafrica.com). */
const CODEVERTEX_ICON_URL = 'https://codevertexafrica.com/icon.svg';

/** Codevertex Africa Limited brand orange — the accent the company name is set in on the mark. */
const BRAND_ORANGE = '#E8631E';

/** Certified-reseller co-branding attribution — see the reseller-partner-program plan §6A/§9.
 *  Populated only when the current tenant has a reseller of record; the platform mark always
 *  stays primary and visible (co-branding, never white-label — §6A's Merchant-of-Record split). */
export interface PoweredByBadgePartner {
  /** The certified partner/reseller's display name. */
  name: string;
  /** Optional small partner logo, shown inline next to the attribution text. Only rendered in
   *  `layout="row"` — `layout="stacked"` (the compact PIN-login panel) stays text-only for space. */
  logoUrl?: string;
}

export interface PoweredByBadgeProps {
  /** Override the icon (defaults to the Codevertex Africa Limited icon). */
  iconUrl?: string;
  /** 'card' (default) — the rounded white pill. 'inline' — a bare, no-background row for tight spaces. */
  variant?: 'card' | 'inline';
  /** 'row' (default) — one-line "POWERED BY CODEVERTEX AFRICA LIMITED" pill, for app footers.
   *  'stacked' — the taller two-line card (label over the name), for the PIN-login brand panel. */
  layout?: 'row' | 'stacked';
  /** Icon size — for `layout="row"` this drives the pill's height (thin padding, not a fixed tall
   *  box), so pass a bigger size for a more prominent placement and it stays proportioned.
   *  Defaults to a compact 'h-7 w-7' for `row`, 'h-11 w-11' for `stacked`. */
  iconClassName?: string;
  href?: string;
  className?: string;
  /** Optional certified-reseller attribution rendered ALONGSIDE the Codevertex mark (never
   *  replacing it) — e.g. "Sold & supported by {partner.name}". Omit entirely for the default,
   *  unchanged badge; every existing call site with no `partner` renders byte-for-byte as before. */
  partner?: PoweredByBadgePartner;
}

export function PoweredByBadge({
  iconUrl = CODEVERTEX_ICON_URL,
  variant = 'card',
  layout = 'row',
  iconClassName,
  href = 'https://codevertexafrica.com',
  className,
  partner,
}: PoweredByBadgeProps) {
  const stacked = layout === 'stacked';
  const iconSize = iconClassName ?? (stacked ? 'h-10 w-10' : 'h-7 w-7');
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        'inline-flex items-center gap-2.5 transition-shadow',
        variant === 'card' && (stacked
          ? 'rounded-3xl bg-card pl-2 pr-5 py-2 shadow-md ring-1 ring-black/5 hover:shadow-lg'
          : 'rounded-full bg-card pl-1.5 pr-4 py-1.5 shadow-md ring-1 ring-black/5 hover:shadow-lg'),
        className
      )}
    >
      {/* Icon sits in its own light rounded chip, as in the reference mark. */}
      <span className="shrink-0 flex items-center justify-center rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-1">
        <img src={iconUrl} alt="Codevertex" className={cx(iconSize, 'object-contain')} />
      </span>
      {stacked ? (
        <span className="flex flex-col items-start leading-tight text-left uppercase">
          <span className="text-[10px] font-bold tracking-wider text-foreground">Powered by</span>
          <span className="text-sm font-extrabold tracking-wide whitespace-nowrap" style={{ color: BRAND_ORANGE }}>
            Codevertex Africa Limited
          </span>
          {partner && (
            <span className="text-[9px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap">
              Sold &amp; supported by {partner.name}
            </span>
          )}
        </span>
      ) : (
        <span className="text-xs font-extrabold uppercase tracking-wide whitespace-nowrap">
          <span className="text-foreground">Powered by</span>{' '}
          <span style={{ color: BRAND_ORANGE }}>Codevertex Africa Limited</span>
          {partner && (
            <>
              <span className="text-foreground/40 mx-1.5">|</span>
              {partner.logoUrl && (
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="inline-block h-4 w-4 rounded-sm object-contain align-middle mr-1"
                />
              )}
              <span className="text-foreground/70 normal-case font-semibold">
                Sold &amp; supported by {partner.name}
              </span>
            </>
          )}
        </span>
      )}
    </a>
  );
}
