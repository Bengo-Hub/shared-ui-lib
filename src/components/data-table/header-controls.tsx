'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Filter, Search, X } from 'lucide-react';
import { AnchoredPopover } from './popover';
import { cx, type ColumnFilterState, type FilterOption, type SortDir } from './types';

/** Sort-arrows affordance: neutral ⇅, active ↑/↓ (asc → desc → clear cycle). */
export function SortButton({
  dir,
  onCycle,
}: {
  dir: SortDir | null;
  onCycle: () => void;
}) {
  const Icon = dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label="Sort column"
      className={cx(
        'p-0.5 rounded transition-colors',
        dir ? 'text-primary' : 'text-muted-foreground/50 hover:text-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

/**
 * FunnelFilter — per-column header filter: a text "contains" query plus a
 * checklist of distinct values. Highlighted when active.
 */
export function FunnelFilter({
  options,
  state,
  onChange,
}: {
  options: FilterOption[];
  state: ColumnFilterState | undefined;
  onChange: (next: ColumnFilterState | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [optionQuery, setOptionQuery] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const active = !!state && ((state.values?.length ?? 0) > 0 || !!state.query?.trim());
  const selected = useMemo(() => new Set(state?.values ?? []), [state]);

  const visibleOptions = useMemo(() => {
    const q = optionQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.label ?? o.value).toLowerCase().includes(q));
  }, [options, optionQuery]);

  function commit(next: ColumnFilterState) {
    const empty = !(next.values?.length ?? 0) && !next.query?.trim();
    onChange(empty ? undefined : next);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Filter column"
        className={cx(
          'p-0.5 rounded transition-colors',
          active ? 'text-primary' : 'text-muted-foreground/50 hover:text-foreground',
        )}
      >
        <Filter className={cx('h-3.5 w-3.5', active && 'fill-primary/20')} />
      </button>
      <AnchoredPopover open={open} onClose={() => setOpen(false)} anchorRef={btnRef}>
        <div className="space-y-2">
          {/* Contains query */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              autoFocus
              value={state?.query ?? ''}
              onChange={(e) => commit({ ...state, query: e.target.value })}
              placeholder="Contains…"
              className="w-full rounded-md border border-input bg-background pl-7 pr-2 py-1.5 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
            />
          </div>
          {options.length > 0 && (
            <>
              {options.length > 8 && (
                <input
                  value={optionQuery}
                  onChange={(e) => setOptionQuery(e.target.value)}
                  placeholder="Search values…"
                  className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
                />
              )}
              <ul className="max-h-52 overflow-y-auto space-y-0.5">
                {visibleOptions.map((o) => {
                  const isOn = selected.has(o.value);
                  return (
                    <li key={o.value}>
                      <label className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-accent cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isOn}
                          onChange={() => {
                            const values = isOn
                              ? (state?.values ?? []).filter((v) => v !== o.value)
                              : [...(state?.values ?? []), o.value];
                            commit({ ...state, values });
                          }}
                          className="h-3.5 w-3.5 rounded border-input"
                        />
                        <span className="truncate">{o.label ?? (o.value === '' ? '(blank)' : o.value)}</span>
                      </label>
                    </li>
                  );
                })}
                {visibleOptions.length === 0 && (
                  <li className="px-1.5 py-2 text-xs text-muted-foreground">No values</li>
                )}
              </ul>
            </>
          )}
          {active && (
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOptionQuery('');
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear filter
            </button>
          )}
        </div>
      </AnchoredPopover>
    </>
  );
}
