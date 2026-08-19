import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

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
type SortDir = 'asc' | 'desc';
interface SortState {
    /** Column key being sorted. */
    key: string;
    dir: SortDir;
}
/** Per-column funnel-filter state: selected distinct values and/or a text query. */
interface ColumnFilterState {
    /** Values ticked in the funnel's checklist (matches accessor stringification). */
    values?: string[];
    /** Free-text "contains" query. */
    query?: string;
}
/** Column key → filter state. Empty/absent entries mean "no filter". */
type FilterMap = Record<string, ColumnFilterState>;
interface FilterOption {
    value: string;
    label?: string;
}
interface DataTableColumn<T> {
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
    /** Use this column as the card's title (big, top-left). Exactly one per table. */
    primary?: boolean;
    /** Render this column in the card's top-right slot instead of the field list
     *  (e.g. a status badge or an edit/menu button). */
    mobileAction?: boolean;
    /** Omit this column from the mobile card entirely (e.g. redundant with the primary title,
     *  or a column that only makes sense in the dense desktop grid). */
    mobileHidden?: boolean;
    /** Label shown before the value in the mobile card's field list. Defaults to `header`
     *  when it's a plain string. */
    mobileLabel?: string;
}
interface BulkAction {
    key: string;
    label: string;
    icon?: ReactNode;
    variant?: 'default' | 'destructive';
    /** Invoked with the currently selected row keys. */
    onClick: (selectedKeys: string[]) => void;
    disabled?: boolean;
}
/** Stringify an accessor value for filtering/CSV. */
declare function cellText(v: unknown): string;
/** Compare accessor values for client-side sorting (numeric-aware, null-last). */
declare function compareValues(a: unknown, b: unknown): number;

/**
 * DataTable — the platform's canonical data list (inventory-ui, treasury-ui,
 * pos-ui). Soft grid lines, sortable headers, per-column funnel filters,
 * row-selection + bulk actions, column visibility, CSV export, entries
 * selector and an optional pagination footer.
 *
 * Client mode (default): sorting + funnel filters run over `rows`.
 * Server mode: pass `onSortChange` / `onFiltersChange` and drive your query.
 *
 * Rendering is split into `DataTableDesktop` (the real `<table>`, `md:` and up)
 * and `DataTableMobile` (stacked cards, below `md:`) — two fully parallel trees
 * sharing this component's state/derived-data logic.
 */
interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    rows: T[];
    rowKey: (row: T) => string;
    loading?: boolean;
    error?: boolean;
    onRetry?: () => void;
    /** Rich empty state (icon + CTA). Default is a simple message. */
    emptyState?: ReactNode;
    emptyText?: string;
    /** Render this many shimmer skeleton rows/cards instead of the plain "Loading…" text while `loading` is true. Omit to keep the original text-only loading state (zero behavior change for existing callers). */
    loadingRows?: number;
    /** Controlled sort (server mode when onSortChange given). */
    sort?: SortState | null;
    onSortChange?: (s: SortState | null) => void;
    defaultSort?: SortState;
    /** Controlled funnel filters (server mode when onFiltersChange given). */
    filters?: FilterMap;
    onFiltersChange?: (f: FilterMap) => void;
    /** Row selection + bulk bar. */
    selectable?: boolean;
    selected?: Set<string>;
    onSelectedChange?: (s: Set<string>) => void;
    isRowSelectable?: (row: T) => boolean;
    bulkActions?: BulkAction[];
    /** Expandable rows (chevron column) — e.g. sale line items. */
    renderExpanded?: (row: T) => ReactNode;
    /** Column-visibility persistence key (localStorage). */
    storageKey?: string;
    /** 'both' = row + column grid lines (Go-Digital look, default); 'rows' = row dividers only. */
    gridLines?: 'both' | 'rows';
    dense?: boolean;
    /** Freezes the header and scrolls the body once rows exceed this height (desktop grid only). CSS length, e.g. '65vh' or '480px'. Set to `false` to disable and let the page scroll instead. */
    maxBodyHeight?: string | false;
    /** Host chrome (search box, custom filters) rendered in the toolbar row. */
    toolbar?: ReactNode;
    /** Right-aligned extra toolbar actions (e.g. Export PDF). */
    toolbarActions?: ReactNode;
    showExportCsv?: boolean;
    exportFileName?: string;
    /** Fetch ALL rows for export (server-paginated hosts); falls back to current rows. */
    onExportAll?: () => Promise<T[]>;
    onPrint?: () => void;
    /** Entries-per-page selector. */
    pageSize?: number;
    onPageSizeChange?: (n: number) => void;
    pageSizeOptions?: number[];
    /** Server pagination footer. */
    page?: number;
    totalPages?: number;
    onPageChange?: (p: number) => void;
    total?: number;
    onRowClick?: (row: T) => void;
    rowClassName?: (row: T) => string | undefined;
    className?: string;
}
declare function DataTable<T>(props: DataTableProps<T>): react_jsx_runtime.JSX.Element;

/**
 * Checkbox — themed selection checkbox (none of the host apps ship a Checkbox
 * primitive, all use raw <input type="checkbox">). Button-based so the checked
 * state renders with semantic tokens in both themes, with an indeterminate
 * state for the header select-all.
 */
interface CheckboxProps {
    checked: boolean;
    indeterminate?: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
    className?: string;
}
declare function Checkbox({ checked, indeterminate, onChange, disabled, className, ...rest }: CheckboxProps): react_jsx_runtime.JSX.Element;

/**
 * BulkActionBar — shown above the table whenever rows are selected.
 * Hosts pass RBAC-pre-filtered actions; each receives the selected keys.
 */
declare function BulkActionBar({ selectedKeys, actions, onClear, }: {
    selectedKeys: string[];
    actions: BulkAction[];
    onClear: () => void;
}): react_jsx_runtime.JSX.Element | null;

/** Sort-arrows affordance: neutral ⇅, active ↑/↓ (asc → desc → clear cycle). */
declare function SortButton({ dir, onCycle, }: {
    dir: SortDir | null;
    onCycle: () => void;
}): react_jsx_runtime.JSX.Element;
/**
 * FunnelFilter — per-column header filter: a text "contains" query plus a
 * checklist of distinct values. Highlighted when active.
 */
declare function FunnelFilter({ options, state, onChange, }: {
    options: FilterOption[];
    state: ColumnFilterState | undefined;
    onChange: (next: ColumnFilterState | undefined) => void;
}): react_jsx_runtime.JSX.Element;

/**
 * ColumnVisibilityButton — column show/hide manager (Go-Digital "Column
 * visibility"). Preferences persist per-table via `storageKey` in
 * localStorage. Modeled on treasury-ui's ColumnManager but generic.
 */
interface ColumnMeta {
    key: string;
    label: string;
    defaultHidden?: boolean;
}
declare function loadHiddenColumns(storageKey: string | undefined, columns: ColumnMeta[]): Set<string>;
declare function ColumnVisibilityButton({ columns, hidden, onChange, storageKey, }: {
    columns: ColumnMeta[];
    hidden: Set<string>;
    onChange: (hidden: Set<string>) => void;
    storageKey?: string;
}): react_jsx_runtime.JSX.Element;

/**
 * TableFooter — "Showing X to Y of Z entries" + numbered pagination.
 * Rendered only when the host passes page/onPageChange (server pagination)
 * — hosts with their own Pagination component can keep using it instead.
 */
declare function TableFooter({ page, totalPages, onPageChange, total, pageSize, shownCount, }: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
    total?: number;
    pageSize?: number;
    shownCount: number;
}): react_jsx_runtime.JSX.Element;

/**
 * CSV export for the DataTable — exports the given rows using each exportable
 * column's accessor (raw values, not rendered JSX). Hosts wanting a full
 * server-side export pass `onExportAll` to fetch every page first.
 */
declare function exportRowsAsCsv<T>(rows: T[], columns: DataTableColumn<T>[], fileName: string): void;

export { type BulkAction as B, Checkbox as C, DataTable as D, type FilterMap as F, SortButton as S, TableFooter as T, BulkActionBar as a, type ColumnFilterState as b, ColumnVisibilityButton as c, type DataTableColumn as d, type DataTableProps as e, type FilterOption as f, FunnelFilter as g, type SortDir as h, type SortState as i, exportRowsAsCsv as j, type CheckboxProps as k, type ColumnMeta as l, cellText as m, compareValues as n, loadHiddenColumns as o };
