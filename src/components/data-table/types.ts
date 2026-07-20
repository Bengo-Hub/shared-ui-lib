import type { ReactNode } from 'react';

/**
 * Shared types for the platform DataTable (@bengo-hub/shared-ui-lib/data-table).
 *
 * The DataTable is the canonical list surface for inventory-ui, treasury-ui and
 * pos-ui: soft grid lines, sortable headers (arrow affordance), per-column
 * funnel filters, row-selection checkboxes with a bulk-action bar, a column
 * visibility manager, CSV export and an entries-per-page selector.
 *
 * Sorting/filtering run CLIENT-SIDE over the rows given, unless the host passes
 * `onSortChange` / `onFiltersChange` — then the table only renders the state and
 * the host drives its server query (?sort=, per-column params).
 */

export type SortDir = 'asc' | 'desc';

export interface SortState {
  /** Column key being sorted. */
  key: string;
  dir: SortDir;
}

/** Per-column funnel-filter state: selected distinct values and/or a text query. */
export interface ColumnFilterState {
  /** Values ticked in the funnel's checklist (matches accessor stringification). */
  values?: string[];
  /** Free-text "contains" query. */
  query?: string;
}

/** Column key → filter state. Empty/absent entries mean "no filter". */
export type FilterMap = Record<string, ColumnFilterState>;

export interface FilterOption {
  value: string;
  label?: string;
}

export interface DataTableColumn<T> {
  /** Stable key — used for sort/filter state, visibility prefs and CSV headers. */
  key: string;
  header: ReactNode;
  /**
   * Raw value used for client sorting, funnel filtering and CSV export.
   * Defaults to `(row as any)[key]`.
   */
  accessor?: (row: T) => unknown;
  /** Cell renderer. Defaults to the accessor value as text. */
  render?: (row: T, index: number) => ReactNode;
  /** Show the sort-arrows affordance on this header. */
  sortable?: boolean;
  /** Show the funnel filter icon on this header. */
  filterable?: boolean;
  /**
   * Fixed checklist for the funnel. Omit to derive the distinct accessor
   * values from the current rows (fine for client mode / small pages).
   */
  filterOptions?: FilterOption[];
  align?: 'left' | 'right' | 'center';
  headerClassName?: string;
  cellClassName?: string;
  /** Hide the column below a breakpoint (maps to `hidden {bp}:table-cell`). */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
  /** Include in CSV export (default true). */
  exportable?: boolean;
  /** Start hidden in the column-visibility manager. */
  defaultHidden?: boolean;
}

export interface BulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'destructive';
  /** Invoked with the currently selected row keys. */
  onClick: (selectedKeys: string[]) => void;
  disabled?: boolean;
}

/** Stringify an accessor value for filtering/CSV. */
export function cellText(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/** Compare accessor values for client-side sorting (numeric-aware, null-last). */
export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? -1 : 1;
  const an = Number(a);
  const bn = Number(b);
  if (!Number.isNaN(an) && !Number.isNaN(bn) && String(a).trim() !== '' && String(b).trim() !== '') {
    return an - bn;
  }
  return cellText(a).localeCompare(cellText(b), undefined, { sensitivity: 'base', numeric: true });
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
