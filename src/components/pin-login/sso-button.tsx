'use client';

/**
 * PinLoginSSOButton — the "sign in with company account" action shown alongside the
 * keypad/QWERTY zones. `tall` renders the large-screen 3-zone variant (stacked icon+label,
 * fills its column); the default is a COMPACT horizontal pill sized for phones, where a tall
 * stacked button previously ate a third of the visible viewport height for one label.
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cx } from '../data-table/types';

export interface PinLoginSSOButtonProps {
  onClick: () => void;
  tall?: boolean;
  label?: string;
  className?: string;
}

export function PinLoginSSOButton({ onClick, tall, label = 'SSO Login', className }: PinLoginSSOButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex items-center justify-center rounded-2xl',
        'text-primary-foreground font-bold shadow-md ring-1 ring-inset ring-white/15',
        'active:scale-[0.98] transition-all duration-150 hover:brightness-105',
        tall ? 'flex-1 flex-col gap-2 py-6' : 'w-full gap-2.5 py-2.5',
        className
      )}
      style={{ background: 'linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark, var(--primary))) 100%)' }}
    >
      <span
        className={cx(
          'rounded-xl bg-white/20 ring-1 ring-inset ring-white/25 flex items-center justify-center shrink-0',
          tall ? 'h-10 w-10 sm:h-12 sm:w-12 rounded-2xl' : 'h-7 w-7'
        )}
      >
        <ExternalLink className={tall ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-3.5 w-3.5'} />
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
