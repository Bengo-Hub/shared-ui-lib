'use client';

/**
 * PinLoginLayout — the compact, non-scrolling shell shared by every PIN-login page.
 *
 * Fills the viewport exactly (no page scroll — the old per-app pages scrolled to reach the
 * keyboard/attendance card, which read as unpolished on a kiosk/tablet). A brand-tinted band runs
 * the full height on large screens: the header sits across the top, a brand panel (tenant logo +
 * Codevertex mark + workflow illustration) occupies a fixed-width left column, and the actual
 * login card STRETCHES to fill the remaining width — balanced on every screen size, never a
 * narrow centred box floating in empty space. On small screens the brand panel is hidden (there
 * isn't room for it) and the card takes the full width.
 *
 * Requires `--brand-dark` (RGB triplet) alongside the existing `--primary` design token — every
 * tenant-branding provider that already derives `--primary-dark` for buttons should derive this
 * the same way (see each app's branding provider).
 */

import React from 'react';
import { cx } from '../data-table/types';

export interface PinLoginLayoutProps {
  header: React.ReactNode;
  /** Left brand column — hidden below the `lg` breakpoint. Omit entirely for a header-only look. */
  brandPanel?: React.ReactNode;
  /** The actual login card content (SSO button / passcode field / keypad / scan-card slot / ...). */
  card: React.ReactNode;
  /** Absolutely-positioned extras that shouldn't affect flow (e.g. DemoHints). */
  footer?: React.ReactNode;
  /** Tenant screensaver/brand image shown heavily tinted behind the brand-dark gradient. */
  backdropUrl?: string | null;
  className?: string;
}

export function PinLoginLayout({ header, brandPanel, card, footer, backdropUrl, className }: PinLoginLayoutProps) {
  return (
    <div
      className={cx('relative h-dvh w-full overflow-hidden flex flex-col', className)}
      style={{ background: 'linear-gradient(135deg, rgb(var(--brand-dark)) 0%, hsl(var(--primary)) 130%)' }}
    >
      {backdropUrl && (
        <img src={backdropUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgb(var(--brand-dark) / 0.85) 0%, hsl(var(--primary) / 0.65) 100%)' }}
      />
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'hsl(var(--primary) / 0.35)' }}
      />
      <div
        className="pointer-events-none absolute -left-20 top-1/3 h-40 w-40 rounded-full ring-1 ring-inset ring-white/10"
        style={{ background: 'hsl(var(--primary) / 0.12)' }}
      />

      <div className="relative z-10 flex flex-col h-full min-h-0">
        {header}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(260px,340px)_1fr]">
          {brandPanel && <div className="hidden lg:flex min-h-0">{brandPanel}</div>}
          <div className="min-h-0 flex items-stretch justify-center p-2 sm:p-5 lg:p-6">
            <div className="w-full max-w-5xl bg-card rounded-2xl sm:rounded-3xl shadow-2xl ring-1 ring-black/5 flex flex-col min-h-0 overflow-hidden">
              {card}
            </div>
          </div>
        </div>
      </div>
      {footer}
    </div>
  );
}
