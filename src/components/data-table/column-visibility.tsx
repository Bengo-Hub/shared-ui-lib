'use client';

import { useEffect, useRef, useState } from 'react';
import { Columns3 } from 'lucide-react';
import { AnchoredPopover } from './popover';
import { cx } from './types';

/**
 * ColumnVisibilityButton — column show/hide manager (Go-Digital "Column
 * visibility"). Preferences persist per-table via `storageKey` in
 * localStorage. Modeled on treasury-ui's ColumnManager but generic.
 */
export interface ColumnMeta {
  key: string;
  label: string;
  defaultHidden?: boolean;
}

export function loadHiddenColumns(storageKey: string | undefined, columns: ColumnMeta[]): Set<string> {
  const defaults = new Set(columns.filter((c) => c.defaultHidden).map((c) => c.key));
  if (!storageKey || typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(`dt-cols:${storageKey}`);
    if (!raw) return defaults;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.filter((k): k is string => typeof k === 'string'));
  } catch {
    /* corrupted prefs → defaults */
  }
  return defaults;
}

export function ColumnVisibilityButton({
  columns,
  hidden,
  onChange,
  storageKey,
}: {
  columns: ColumnMeta[];
  hidden: Set<string>;
  onChange: (hidden: Set<string>) => void;
  storageKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Persist on change.
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`dt-cols:${storageKey}`, JSON.stringify([...hidden]));
    } catch {
      /* quota — non-fatal */
    }
  }, [hidden, storageKey]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          'inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium',
          'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
        )}
        title="Show / hide columns"
      >
        <Columns3 className="h-3.5 w-3.5" />
        Columns
        {hidden.size > 0 && <span className="text-[10px] text-primary font-semibold">{hidden.size} hidden</span>}
      </button>
      <AnchoredPopover open={open} onClose={() => setOpen(false)} anchorRef={btnRef} align="end" width={220}>
        <p className="px-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Columns
        </p>
        <ul className="max-h-64 overflow-y-auto space-y-0.5">
          {columns.map((c) => (
            <li key={c.key}>
              <label className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-accent cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={!hidden.has(c.key)}
                  onChange={() => {
                    const next = new Set(hidden);
                    if (next.has(c.key)) next.delete(c.key);
                    else next.add(c.key);
                    onChange(next);
                  }}
                  className="h-3.5 w-3.5 rounded border-input"
                />
                <span className="truncate">{c.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </AnchoredPopover>
    </>
  );
}
