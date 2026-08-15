'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Search } from 'lucide-react';

/**
 * SearchAddTable — the platform's canonical "search box that appends a row to a table" mechanic,
 * factored out of pos-ui's Add-Sale page (`sell/add/page.tsx`) and inventory-ui's `ItemSearchInput`,
 * which had both grown their own bespoke copy of: type → debounced remote search → click a result
 * → append a row → clear the query for the next pick, with already-added rows excluded from
 * further results.
 *
 * Deliberately does NOT render the table itself — the row shape (qty/unit/cost/etc. columns) is
 * entirely caller-defined and varies per surface (Purchase Order, Add-Sale, …). This component's
 * only job is the search-and-add-row mechanic: render the search input + results dropdown, exclude
 * IDs already in the caller's table, and hand back the picked option via `onAdd` so the caller can
 * push its own row into its own table state.
 *
 * Like the rest of shared-ui-lib, this ships raw Tailwind classNames resolved by the HOST app's
 * Tailwind build (no CSS pipeline of its own) and has no react-query dependency — `onSearch` is a
 * plain async function, debounced internally, so it works the same whether the host wires it to
 * react-query, SWR, or a bare fetch.
 */
export interface SearchAddOption {
  id: string;
  label: string;
  /** Secondary text on the row (SKU, code, unit…). */
  hint?: string;
  /** Longer muted description line under the label. */
  description?: string;
}

export interface SearchAddTableProps<T extends SearchAddOption = SearchAddOption> {
  /** Debounced as the user types; return the matching options for the current query. */
  onSearch: (query: string) => Promise<T[]>;
  /** Called when a result is picked. The caller appends its own table row from this option;
   *  the search input clears and closes immediately after, ready for the next pick. */
  onAdd: (option: T) => void;
  /**
   * IDs already present in the caller's table — filtered out of every result so a picked item
   * can't be added twice. Pass the caller's current row-id set (e.g. a `Set` built from
   * `table.map(r => r.itemId)`); recomputed on every render, so no memoization is required.
   */
  excludeIds?: Iterable<string>;
  /** Minimum query length before `onSearch` fires. Default 2. */
  minChars?: number;
  /** Debounce delay in ms. Default 250. */
  debounceMs?: number;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  /** Use fixed positioning for the dropdown so it escapes overflow:auto parents (e.g. modals). */
  fixedDropdown?: boolean;
  /**
   * Optional control rendered inside the input's right edge (e.g. a barcode-scan button) — the
   * input gains extra right padding automatically when this is set. A render prop rather than a
   * plain node so the caller's control can drive the search box itself (e.g. a scanned code
   * should populate + trigger the search) without this component exposing its query state via a
   * ref: `setQuery` sets the text AND opens the dropdown, exactly like typing it.
   */
  endAdornment?: (helpers: { setQuery: (q: string) => void; open: () => void }) => React.ReactNode;
  /**
   * Optional row rendered below the results list (e.g. a "+ Create '{query}'" action when
   * nothing matches) — same convention as SearchableCombobox's `footer` prop, but a render prop
   * so the caller can read the current query text and reset the box (e.g. after opening a create
   * dialog) without this component exposing its internal state via a ref. Hidden while loading.
   */
  footer?: (helpers: { query: string; clear: () => void }) => React.ReactNode;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function SearchAddTable<T extends SearchAddOption = SearchAddOption>({
  onSearch,
  onAdd,
  excludeIds,
  minChars = 2,
  debounceMs = 250,
  placeholder = 'Search to add…',
  emptyText = 'No matches',
  disabled,
  className,
  fixedDropdown,
  endAdornment,
  footer,
}: SearchAddTableProps<T>) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < minChars) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const seq = ++requestSeq.current;
    debounceRef.current = setTimeout(() => {
      onSearch(q)
        .then((res) => {
          if (requestSeq.current !== seq) return; // stale response
          setResults(res);
        })
        .catch(() => {
          if (requestSeq.current === seq) setResults([]);
        })
        .finally(() => {
          if (requestSeq.current === seq) setLoading(false);
        });
    }, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, minChars, debounceMs]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!fixedDropdown || !open || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
  }, [open, fixedDropdown, query]);

  const excluded = excludeIds ? new Set(excludeIds) : undefined;
  const visible = excluded ? results.filter((r) => !excluded.has(r.id)) : results;
  const dropdownVisible = open && query.trim().length >= minChars;

  function clear() {
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  function pick(option: T) {
    onAdd(option);
    clear();
  }

  const list = (
    <ul className="max-h-60 overflow-y-auto py-1">
      {loading ? (
        <li className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching…
        </li>
      ) : visible.length === 0 ? (
        <li className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
      ) : (
        visible.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                pick(option);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
            >
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-foreground">{option.label}</span>
                  {option.hint && <span className="shrink-0 font-mono text-xs text-muted-foreground">{option.hint}</span>}
                </span>
                {option.description && (
                  <span className="block truncate text-xs text-muted-foreground">{option.description}</span>
                )}
              </span>
              <Plus className="h-4 w-4 shrink-0 text-primary" />
            </button>
          </li>
        ))
      )}
    </ul>
  );

  const panel = (
    <>
      {list}
      {!loading && footer?.({ query: query.trim(), clear })}
    </>
  );

  return (
    <div className={cx('relative', className)} ref={ref}>
      <div className="relative" ref={inputRef}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim().length >= minChars && setOpen(true)}
          className={cx(
            'w-full rounded-lg border border-input bg-background py-2 pl-10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60',
            endAdornment ? 'pr-12' : 'pr-3',
          )}
        />
        {endAdornment && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {endAdornment({ setQuery: (q: string) => { setQuery(q); setOpen(true); }, open: () => setOpen(true) })}
          </div>
        )}
      </div>
      {dropdownVisible && !fixedDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">{panel}</div>
      )}
      {dropdownVisible && fixedDropdown && (
        <div style={dropdownStyle} className="rounded-lg border border-border bg-popover shadow-xl">
          {panel}
        </div>
      )}
    </div>
  );
}
