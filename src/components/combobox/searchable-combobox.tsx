'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';

/**
 * SearchableCombobox — the platform's canonical rich searchable single-select.
 *
 * Search strategy: the prefetched `options` list is filtered client-side FIRST;
 * when a query exhausts the local list (fewer than `remoteThreshold` matches)
 * and `onRemoteSearch` is provided, the query falls back to a debounced API
 * search whose results are merged below the local matches (deduped by value).
 *
 * Like the rest of shared-ui-lib, this ships raw Tailwind classNames using the
 * platform's semantic tokens (border-input, bg-background, text-muted-foreground…)
 * that the HOST app's Tailwind build resolves — the lib has no CSS pipeline of
 * its own, so consumers must include the lib's dist in their content globs.
 * Self-contained (no portal/popover dependency) so it works on Tailwind v4 +
 * @base-ui hosts (pos-ui, inventory-ui, treasury-ui…).
 */
export interface ComboboxOption {
  value: string;
  label: string;
  /** Secondary text on the row (sku, abbreviation, price, parent name…). */
  hint?: string;
  /** Longer muted description line under the label. */
  description?: string;
  /** Small leading visual (flag, swatch, glyph…) shown before the label, both closed and in the list. */
  icon?: React.ReactNode;
}

export interface SearchableComboboxProps {
  /** Prefetched options — always searched first, client-side. */
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string, option?: ComboboxOption) => void;
  /**
   * Fallback label shown when `value` is set but its record isn't in `options` or the
   * remote-search cache — e.g. an edit/amend flow pre-fills a value whose record lives
   * past the prefetched page. Without this, the closed control silently falls back to
   * `placeholder`, making an already-selected value look unselected. Host passes
   * whatever display name it already has on hand (e.g. `record.supplier_name`).
   */
  valueLabel?: string;
  /**
   * Optional async fallback invoked (debounced) when the client filter yields
   * fewer than `remoteThreshold` matches. Results merge below local matches,
   * deduped by value. Omit for pure client mode (small lists).
   */
  onRemoteSearch?: (query: string) => Promise<ComboboxOption[]>;
  /** Local-match count under which the remote fallback fires. Default 5. */
  remoteThreshold?: number;
  /** Optional "load more" for infinite server lists. */
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  /** Action row pinned under the list (e.g. "+ Add new") — host owns the dialog. */
  footer?: React.ReactNode;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  valueLabel,
  onRemoteSearch,
  remoteThreshold = 5,
  onLoadMore,
  hasMore,
  loading,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No matches',
  disabled,
  clearable = true,
  className,
  footer,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState<ComboboxOption[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  // The selected option may only exist in a past remote result set (not in the
  // prefetched list), so remember it for the closed-state label.
  const [selectedCache, setSelectedCache] = useState<ComboboxOption | undefined>(undefined);
  const selected =
    options.find((o) => o.value === value) ??
    (selectedCache && selectedCache.value === value ? selectedCache : undefined) ??
    (value && valueLabel ? { value, label: valueLabel } : undefined);

  const localMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.hint ?? '').toLowerCase().includes(q) ||
        (o.description ?? '').toLowerCase().includes(q),
    );
  }, [options, query]);

  // Remote fallback: prefetched list first, API only when local search runs dry.
  useEffect(() => {
    if (!onRemoteSearch) return;
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || localMatches.length >= remoteThreshold) {
      setRemoteResults([]);
      setRemoteLoading(false);
      return;
    }
    setRemoteLoading(true);
    const seq = ++requestSeq.current;
    debounceRef.current = setTimeout(() => {
      onRemoteSearch(q)
        .then((results) => {
          if (requestSeq.current !== seq) return; // stale response
          setRemoteResults(results);
        })
        .catch(() => {
          if (requestSeq.current === seq) setRemoteResults([]);
        })
        .finally(() => {
          if (requestSeq.current === seq) setRemoteLoading(false);
        });
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, localMatches.length, onRemoteSearch, remoteThreshold]);

  const merged = useMemo(() => {
    if (remoteResults.length === 0) return localMatches;
    const seen = new Set(localMatches.map((o) => o.value));
    return [...localMatches, ...remoteResults.filter((o) => !seen.has(o.value))];
  }, [localMatches, remoteResults]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setRemoteResults([]);
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

  const select = (o: ComboboxOption) => {
    setSelectedCache(o);
    onChange(o.value, o);
    close();
  };

  const busy = loading || remoteLoading;

  return (
    <div ref={ref} className={cx('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
      >
        <span className={cx('flex min-w-0 items-center gap-2 text-left', !selected && 'text-muted-foreground')}>
          {selected?.icon}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <span className="flex items-center gap-1">
          {clearable && selected && !disabled && (
            <X
              className="h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCache(undefined);
                onChange('', undefined);
              }}
            />
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-foreground focus:outline-none"
            />
            {busy && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {merged.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {busy ? 'Searching…' : emptyText}
              </li>
            ) : (
              merged.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => select(o)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {o.icon}
                      <span className="min-w-0">
                        <span className="flex items-baseline gap-2">
                          <span className="truncate text-foreground">{o.label}</span>
                          {o.hint && (
                            <span className="shrink-0 text-xs text-muted-foreground">{o.hint}</span>
                          )}
                        </span>
                        {o.description && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {o.description}
                          </span>
                        )}
                      </span>
                    </span>
                    {o.value === value && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                </li>
              ))
            )}
            {hasMore && onLoadMore && (
              <li>
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="w-full px-3 py-2 text-center text-xs font-medium text-primary hover:bg-muted/60"
                >
                  Load more…
                </button>
              </li>
            )}
          </ul>
          {footer && <div className="border-t border-border p-1">{footer}</div>}
        </div>
      )}
    </div>
  );
}
