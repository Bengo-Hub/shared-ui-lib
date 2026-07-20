'use client';

import { Check, Minus } from 'lucide-react';
import { cx } from './types';

/**
 * Checkbox — themed selection checkbox (none of the host apps ship a Checkbox
 * primitive, all use raw <input type="checkbox">). Button-based so the checked
 * state renders with semantic tokens in both themes, with an indeterminate
 * state for the header select-all.
 */
export interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

export function Checkbox({ checked, indeterminate, onChange, disabled, className, ...rest }: CheckboxProps) {
  const active = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={rest['aria-label'] ?? 'Select row'}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cx(
        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:border-primary/60',
        disabled && 'opacity-40 cursor-not-allowed',
        className,
      )}
    >
      {indeterminate ? <Minus className="h-3 w-3" /> : checked ? <Check className="h-3 w-3" /> : null}
    </button>
  );
}
