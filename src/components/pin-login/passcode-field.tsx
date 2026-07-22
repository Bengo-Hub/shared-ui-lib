'use client';

/**
 * PasscodeField — the SINGLE masked entry field for the PIN-login card.
 *
 * One field captures whichever the tenant's staff use — a numeric PIN or an alphanumeric
 * passcode — instead of showing a separate "PIN" field and "passcode" field side by side. The
 * caller owns the actual characters (digits from PinKeypad, letters from QwertyKeyboard, or a
 * physical keyboard) and passes the current `value` in for masking/submit; this component never
 * inspects the content beyond its length.
 *
 * Requires the consuming app to already define a `.animate-shake` keyframe utility (used for the
 * one-shot shake on a failed attempt) — every current PIN-login page already has one.
 */

import React from 'react';
import { Lock } from 'lucide-react';
import { cx } from '../data-table/types';

export interface PasscodeFieldProps {
  /** Current entered value (digits and/or letters) — only its length is rendered (masked dots). */
  value: string;
  error?: boolean;
  /** One-shot shake animation on a failed attempt. */
  shake?: boolean;
  onSubmit: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  className?: string;
}

export function PasscodeField({
  value, error, shake, onSubmit, isSubmitting, placeholder = 'Enter PIN or passcode',
  submitLabel = 'Login', submittingLabel = 'Signing in…', className,
}: PasscodeFieldProps) {
  return (
    <div className={cx('flex items-center justify-center gap-2.5 sm:gap-3', className)}>
      <div
        className={cx(
          'flex h-12 min-w-48 sm:min-w-64 items-center gap-3 rounded-full bg-card px-5 shadow-lg ring-1 ring-black/5 transition-all',
          error && 'ring-2 ring-destructive',
          shake && 'animate-shake'
        )}
      >
        <Lock className={cx('h-4 w-4 shrink-0', error ? 'text-destructive' : 'text-muted-foreground')} />
        {value.length === 0 ? (
          <span className="text-sm font-medium text-muted-foreground">{placeholder}</span>
        ) : (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: value.length }).map((_, i) => (
              <span
                key={i}
                className={cx('h-2.5 w-2.5 rounded-full', error ? 'bg-destructive' : 'bg-foreground')}
              />
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        data-testid="pin-login-submit"
        onClick={onSubmit}
        disabled={isSubmitting || value.length === 0}
        className={cx(
          'h-12 rounded-full px-7 text-sm font-bold text-primary-foreground shadow-lg',
          'ring-1 ring-inset ring-white/20 active:scale-95 transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        style={{ background: 'linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark, var(--primary))) 100%)' }}
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </div>
  );
}
