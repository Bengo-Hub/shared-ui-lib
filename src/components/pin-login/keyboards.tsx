'use client';

/**
 * On-screen keyboards for the PIN-login card (presentational only — no state/queries/mutations).
 * Generalized from pos-ui's original (numeric-only) keypad + QWERTY pair onto semantic Tailwind
 * tokens (bg-card/border-border/text-muted-foreground/...) so it themes correctly across every
 * consuming app's tenant palette, not just POS's literal slate/white pairing.
 */

import React from 'react';
import { ArrowBigUp, CornerDownLeft, Delete } from 'lucide-react';
import { cx } from '../data-table/types';

const NUMBER_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
] as const;

const KEY_BASE =
  'h-12 sm:h-16 min-h-11 rounded-2xl flex items-center justify-center transition-all duration-100 touch-manipulation active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed';

export interface PinKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  /** Switch the active on-screen keyboard to the QWERTY layout ("ABC" key). */
  onToggleQwerty?: () => void;
  disabled: boolean;
  /** True while the last digit is submitting — render a pulse on number keys. */
  isSubmitting: boolean;
  digitsLength: number;
  pinLength: number;
  /** Render the "ABC" layout-switch key. Defaults to true; pass false when both keyboards render
   *  side-by-side (large screens) so no toggle key is needed. */
  showToggle?: boolean;
}

export function PinKeypad({
  onDigit, onBackspace, onClear, onToggleQwerty, disabled, isSubmitting, digitsLength, pinLength,
  showToggle = true,
}: PinKeypadProps) {
  const NumberKey = (key: string) => (
    <button
      key={key}
      data-testid={`pin-key-${key}`}
      type="button"
      onClick={() => onDigit(key)}
      disabled={disabled || digitsLength >= pinLength}
      className={cx(
        KEY_BASE,
        'text-primary-foreground text-2xl sm:text-3xl font-black',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_14px_hsl(var(--primary)/0.35)]'
      )}
      style={{ background: 'linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark, var(--primary))) 100%)' }}
    >
      {isSubmitting && digitsLength === pinLength ? (
        <span className="h-2.5 w-2.5 rounded-full bg-white/80 animate-pulse" />
      ) : key}
    </button>
  );

  return (
    <div className="flex w-full flex-col gap-2.5 sm:gap-3">
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {NUMBER_ROWS.flat().map(NumberKey)}

        {showToggle ? (
          <button
            type="button"
            onClick={onToggleQwerty}
            disabled={disabled}
            aria-label="Switch to letters keyboard"
            data-testid="kbd-toggle-qwerty"
            className={cx(
              KEY_BASE,
              'bg-muted border border-border text-muted-foreground text-sm font-black uppercase tracking-wider',
              'hover:bg-accent hover:text-foreground'
            )}
          >
            ABC
          </button>
        ) : (
          <div aria-hidden />
        )}
        {NumberKey('0')}
        <button
          type="button"
          onClick={onBackspace}
          disabled={disabled || digitsLength === 0}
          aria-label="Delete"
          className={cx(
            KEY_BASE,
            'bg-muted border border-border text-muted-foreground',
            'hover:bg-accent hover:text-foreground'
          )}
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={disabled || digitsLength === 0}
        aria-label="Clear"
        data-testid="pin-key-clear"
        className={cx(
          KEY_BASE,
          'w-full bg-destructive/10 border border-destructive/25 text-destructive text-sm font-black uppercase tracking-wider',
          'hover:bg-destructive/15 hover:border-destructive/40'
        )}
      >
        Clear
      </button>
    </div>
  );
}

// ── QWERTY keyboard ──────────────────────────────────────────────────────────

const QWERTY_ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export interface QwertyKeyboardProps {
  /** Append a single character (already shift-cased by the caller). */
  onKey: (char: string) => void;
  onBackspace: () => void;
  /** ENTER submits the current passcode. */
  onEnter: () => void;
  shift: boolean;
  onToggleShift: () => void;
  /** Switch the active on-screen keyboard back to the numeric PIN keypad ("?123" key). */
  onToggleNumeric?: () => void;
  disabled: boolean;
  /** Render the "?123" layout-switch key. Defaults to true; pass false when both keyboards
   *  render side-by-side (large screens). */
  showToggle?: boolean;
}

function KbdKey({
  label, char, onPress, disabled, className, testChar, style,
}: {
  label: React.ReactNode;
  char?: string;
  onPress: () => void;
  disabled: boolean;
  className?: string;
  testChar?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      style={style}
      data-testid={`kbd-key-${testChar ?? char}`}
      className={cx(
        'flex h-11 min-h-11 min-w-0 flex-1 items-center justify-center rounded-xl',
        'bg-card text-foreground text-sm font-semibold',
        'border border-border shadow-sm',
        'hover:bg-accent active:scale-95',
        'transition-all duration-100 touch-manipulation select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
    >
      {label}
    </button>
  );
}

export function QwertyKeyboard({
  onKey, onBackspace, onEnter, shift, onToggleShift, onToggleNumeric, disabled, showToggle = true,
}: QwertyKeyboardProps) {
  const cased = (c: string) => (shift ? c.toUpperCase() : c);

  return (
    <div className="flex w-full flex-col gap-1.5 sm:gap-2">
      <div className="flex gap-1.5 sm:gap-2">
        {QWERTY_ROWS[0].map((c) => (
          <KbdKey key={c} char={c} label={cased(c)} disabled={disabled} onPress={() => onKey(cased(c))} />
        ))}
        <KbdKey
          char="backspace"
          label={<Delete className="h-4 w-4" />}
          disabled={disabled}
          onPress={onBackspace}
          className="flex-[1.4] bg-muted text-muted-foreground"
        />
      </div>

      <div className="flex gap-1.5 sm:gap-2 px-3">
        {QWERTY_ROWS[1].map((c) => (
          <KbdKey key={c} char={c} label={cased(c)} disabled={disabled} onPress={() => onKey(cased(c))} />
        ))}
        <KbdKey
          char="enter"
          label={<span className="flex items-center gap-1 text-xs font-bold"><CornerDownLeft className="h-3.5 w-3.5" />Enter</span>}
          disabled={disabled}
          onPress={onEnter}
          className="flex-[2] text-primary-foreground border-transparent shadow-sm hover:opacity-90"
          style={{ background: 'linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark, var(--primary))) 100%)' }}
        />
      </div>

      <div className="flex gap-1.5 sm:gap-2">
        <KbdKey
          char="shift-l"
          label={<ArrowBigUp className="h-4 w-4" />}
          disabled={disabled}
          onPress={onToggleShift}
          className={cx('flex-[1.6]', shift ? 'bg-primary/15 text-primary border-primary/40' : 'bg-muted text-muted-foreground')}
        />
        {QWERTY_ROWS[2].map((c) => (
          <KbdKey key={c} char={c} label={cased(c)} disabled={disabled} onPress={() => onKey(cased(c))} />
        ))}
        <KbdKey char="comma" label="," disabled={disabled} onPress={() => onKey(',')} className="bg-muted/60" />
        <KbdKey char="period" label="." disabled={disabled} onPress={() => onKey('.')} className="bg-muted/60" />
        <KbdKey
          char="shift-r"
          label={<ArrowBigUp className="h-4 w-4" />}
          disabled={disabled}
          onPress={onToggleShift}
          className={cx('flex-[1.6]', shift ? 'bg-primary/15 text-primary border-primary/40' : 'bg-muted text-muted-foreground')}
        />
      </div>

      <div className="flex gap-1.5 sm:gap-2">
        {showToggle && (
          <button
            type="button"
            onClick={onToggleNumeric}
            disabled={disabled}
            aria-label="Switch to numbers keyboard"
            data-testid="kbd-toggle-numeric"
            className={cx(
              'flex h-11 min-h-11 flex-[1.6] items-center justify-center rounded-xl',
              'bg-muted text-muted-foreground text-sm font-bold',
              'border border-border shadow-sm',
              'hover:bg-accent hover:text-foreground active:scale-95',
              'transition-all duration-100 touch-manipulation select-none',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            ?123
          </button>
        )}
        <KbdKey
          char="space"
          label={<span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Space</span>}
          disabled={disabled}
          onPress={() => onKey(' ')}
          className="flex-1"
        />
      </div>
    </div>
  );
}
