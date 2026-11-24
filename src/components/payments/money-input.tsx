'use client';

import { useEffect, useRef, useState } from 'react';
import { decimalPlacesFor, formatMoneyInputValue, normalizeCurrency, parseMoneyInput, roundMoney } from './currency';

export interface MoneyInputProps {
  /** The amount, or null when the field is empty. */
  value: number | null | undefined;
  /** Called with the typed amount (rounded to the currency's places), or null when cleared. */
  onChange: (value: number | null) => void;
  /** ISO 4217 code shown inside the field and used for decimal places, e.g. "KES". */
  currency: string;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Smallest and largest accepted amounts; the browser's validity reflects them. */
  min?: number;
  max?: number;
  /** Whole amounts only (ad budgets are whole units of the ad account's currency). */
  wholeOnly?: boolean;
  className?: string;
  inputClassName?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  onBlur?: () => void;
}

/**
 * The one amount field: the currency code sits inside the field so every budget, price and
 * amount always shows its currency, the digits group as you leave the field ("5,000"), and the
 * value is a number rounded at the currency's decimal places (0 for UGX, 2 for KES). Styled with
 * the platform's semantic tokens like the shared comboboxes.
 */
export function MoneyInput({
  value,
  onChange,
  currency,
  id,
  name,
  placeholder,
  disabled,
  required,
  min,
  max,
  wholeOnly,
  className,
  inputClassName,
  onBlur,
  ...aria
}: MoneyInputProps) {
  const code = normalizeCurrency(currency) || 'KES';
  const [text, setText] = useState(() => formatMoneyInputValue(value, code));
  const focused = useRef(false);

  // Follow outside changes (a form reset, a loaded record) while the person is not typing.
  useEffect(() => {
    if (!focused.current) setText(formatMoneyInputValue(value, code));
  }, [value, code]);

  const commit = (raw: string) => {
    const n = parseMoneyInput(raw);
    if (n == null) return onChange(null);
    onChange(wholeOnly ? Math.round(n) : roundMoney(n, code));
  };

  const outOfRange =
    value != null && ((min != null && value < min) || (max != null && value > max));
  const dp = wholeOnly ? 0 : decimalPlacesFor(code);

  return (
    <div
      className={[
        'flex w-full items-center rounded-xl border border-input bg-background text-sm focus-within:ring-2 focus-within:ring-ring',
        disabled ? 'opacity-60' : '',
        className ?? '',
      ].join(' ')}
    >
      <span className="select-none pl-3 pr-1 text-muted-foreground tabular-nums" aria-hidden="true">
        {code}
      </span>
      <input
        id={id}
        name={name}
        type="text"
        inputMode={dp > 0 ? 'decimal' : 'numeric'}
        autoComplete="off"
        className={[
          'h-10 w-full min-w-0 bg-transparent py-2 pr-3 text-foreground tabular-nums outline-none placeholder:text-muted-foreground',
          inputClassName ?? '',
        ].join(' ')}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-label={aria['aria-label']}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid'] ?? (outOfRange || undefined)}
        data-currency={code}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(e) => {
          const raw = e.target.value;
          // Keep only what an amount can hold; the rest is ignored as it is typed.
          if (raw !== '' && !/^[\d,\s.]*$/.test(raw)) return;
          if (dp === 0 && raw.includes('.')) return;
          setText(raw);
          commit(raw);
        }}
        onBlur={() => {
          focused.current = false;
          setText(formatMoneyInputValue(parseMoneyInput(text) == null ? null : value, code));
          onBlur?.();
        }}
      />
    </div>
  );
}
