'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import type { ComboboxOption } from './searchable-combobox';

/**
 * MultiSelectCombobox — the platform's canonical chip-based multi-select, for picking several
 * values from a fixed, real option list (no free-text fallback — the point of this control is to
 * replace a comma-separated guess-the-value text input with a validated selection). Selected
 * options render as removable chips on the trigger; the panel stays open across multiple picks so
 * a user can select/deselect several options in one pass.
 *
 * Shares `SearchableCombobox`'s `position: fixed`-off-the-trigger's-own-rect panel technique (an
 * inline `absolute` panel gets clipped by any `overflow-hidden`/`overflow-y-auto` ancestor — a
 * Card, a scrollable modal body) but keeps its own copy of that logic rather than importing it,
 * matching that file's own documented reasoning: these two controls' consumers are different
 * enough that sharing internals risks one's future change breaking the other's very different
 * callers.
 */
export interface MultiSelectComboboxProps {
  /** The full, real option list — every value here is one the receiving system actually accepts. */
  options: ComboboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  /** Action row pinned under the list (e.g. "+ Add new") — host owns the dialog. */
  footer?: React.ReactNode;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function MultiSelectCombobox({
  options,
  values,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No matches',
  disabled,
  className,
  footer,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = ref.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const estimatedPanelHeight = 300; // search bar + max-h-60 list + optional footer, roughly
    const top = spaceBelow < 260 && r.top > estimatedPanelHeight
      ? Math.max(8, r.top - 4 - estimatedPanelHeight)
      : r.bottom + 4;
    setPanelPos({ top, left: r.left, width: r.width });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onScroll(e: Event) {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onResize() {
      setOpen(false);
    }
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const selected = useMemo(
    () => values.map((v) => options.find((o) => o.value === v) ?? { value: v, label: v }),
    [values, options],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.hint ?? '').toLowerCase().includes(q) ||
        (o.description ?? '').toLowerCase().includes(q),
    );
  }, [options, query]);

  function toggle(value: string) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }

  function remove(value: string) {
    onChange(values.filter((v) => v !== value));
  }

  return (
    <div ref={ref} className={cx('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background px-2.5 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
      >
        {selected.length === 0 && <span className="px-0.5 text-muted-foreground">{placeholder}</span>}
        {selected.map((o) => (
          <span
            key={o.value}
            className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
          >
            {o.icon}
            {o.label}
            {!disabled && (
              <X
                className="h-3 w-3 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(o.value);
                }}
              />
            )}
          </span>
        ))}
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && panelPos && (
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: panelPos.top, left: panelPos.left, width: panelPos.width, zIndex: 60 }}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-foreground focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {matches.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
            ) : (
              matches.map((o) => {
                const isSelected = values.includes(o.value);
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      onClick={() => toggle(o.value)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {o.icon}
                        <span className="min-w-0">
                          <span className="flex items-baseline gap-2">
                            <span className="truncate text-foreground">{o.label}</span>
                            {o.hint && <span className="shrink-0 text-xs text-muted-foreground">{o.hint}</span>}
                          </span>
                          {o.description && (
                            <span className="block truncate text-xs text-muted-foreground">{o.description}</span>
                          )}
                        </span>
                      </span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          {footer && <div className="border-t border-border p-1">{footer}</div>}
        </div>
      )}
    </div>
  );
}
