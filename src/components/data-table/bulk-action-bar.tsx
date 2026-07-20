'use client';

import { X } from 'lucide-react';
import { cx, type BulkAction } from './types';

/**
 * BulkActionBar — shown above the table whenever rows are selected.
 * Hosts pass RBAC-pre-filtered actions; each receives the selected keys.
 */
export function BulkActionBar({
  selectedKeys,
  actions,
  onClear,
}: {
  selectedKeys: string[];
  actions: BulkAction[];
  onClear: () => void;
}) {
  const count = selectedKeys.length;
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
      <span className="text-xs font-semibold text-foreground">
        {count} selected
      </span>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" /> Clear
      </button>
      <div className="h-4 w-px bg-border" />
      {actions.map((a) => (
        <button
          key={a.key}
          type="button"
          disabled={a.disabled}
          onClick={() => a.onClick(selectedKeys)}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
            a.variant === 'destructive'
              ? 'border-destructive/40 text-destructive hover:bg-destructive/10'
              : 'border-input text-foreground hover:bg-accent',
            a.disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          {a.icon}
          {a.label}
        </button>
      ))}
    </div>
  );
}
