'use client';

/**
 * PasscodeField — the SINGLE masked entry field for the PIN-login card.
 *
 * One field captures whichever the tenant's staff use — a numeric PIN or an alphanumeric
 * passcode — instead of showing a separate "PIN" field and "passcode" field side by side.
 *
 * Historically this rendered ONLY a masked-dot display div with no real `<input>` at all — the
 * caller's on-screen PinKeypad/QwertyKeyboard were the only way to enter anything, so a physical
 * keyboard (desktop, or a USB PIN-pad that types like one) did nothing, and tapping the field on
 * mobile never opened the native keyboard. Passing `onChange` now renders a real, focusable
 * `<input>` transparently overlaid on the masked-dot display: tapping/clicking it focuses the
 * input (native mobile keyboard opens, matching `inputMode`), typing fires `onChange` with the
 * full current string, and the caller updates its own PIN/passcode state from that — the on-screen
 * keyboards keep working exactly as before, as an alternate input method into the same state.
 * `onChange` is optional so existing callers that haven't wired it yet don't change behavior.
 *
 * Requires the consuming app to already define a `.animate-shake` keyframe utility (used for the
 * one-shot shake on a failed attempt) — every current PIN-login page already has one.
 */

import React, { useRef } from 'react';
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
  /**
   * Called with the field's full new value on every keystroke (physical keyboard, mobile
   * virtual keyboard, paste). Passing this renders a real `<input>` so the field actually
   * accepts keyboard input, not just on-screen keypad clicks.
   */
  onChange?: (value: string) => void;
  /** Virtual-keyboard hint for mobile: 'numeric' for a PIN, 'text' for an alphanumeric passcode. */
  inputMode?: 'numeric' | 'text';
  maxLength?: number;
  autoFocus?: boolean;
}

export function PasscodeField({
  value, error, shake, onSubmit, isSubmitting, placeholder = 'Enter PIN or passcode',
  submitLabel = 'Login', submittingLabel = 'Signing in…', className,
  onChange, inputMode = 'text', maxLength, autoFocus = true,
}: PasscodeFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={cx('flex items-center justify-center gap-2.5 sm:gap-3', className)}>
      <div
        className={cx(
          'relative flex h-12 min-w-48 sm:min-w-64 items-center gap-3 rounded-full bg-card px-5 shadow-lg ring-1 ring-black/5 transition-all',
          error && 'ring-2 ring-destructive',
          shake && 'animate-shake'
        )}
        onClick={() => inputRef.current?.focus()}
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
        {onChange && (
          <input
            ref={inputRef}
            type={inputMode === 'numeric' ? 'tel' : 'text'}
            inputMode={inputMode}
            autoFocus={autoFocus}
            value={value}
            maxLength={maxLength}
            disabled={isSubmitting}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
            aria-label={placeholder}
            className="absolute inset-0 h-full w-full cursor-text rounded-full opacity-0"
          />
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
