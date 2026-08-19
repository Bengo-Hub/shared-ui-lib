'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { FileDown, Printer } from 'lucide-react';
import { BulkActionBar } from './bulk-action-bar';
import { ColumnVisibilityButton, loadHiddenColumns } from './column-visibility';
import { DataTableDesktop } from './data-table-desktop';
import { DataTableMobile } from './data-table-mobile';
import { exportRowsAsCsv } from './export';
import {
  cellText,
  compareValues,
  cx,
  type BulkAction,
  type ColumnFilterState,
  type DataTableColumn,
  type FilterMap,
  type SortState,
} from './types';

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
export interface DataTableProps<T> {
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

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    columns,
    rows,
    rowKey,
    loading,
    loadingRows,
    error,
    onRetry,
    selectable,
    isRowSelectable,
    bulkActions = [],
    renderExpanded,
    storageKey,
    gridLines = 'both',
    dense,
    pageSizeOptions = [1, 5, 10, 25, 50, 100, 500],
    maxBodyHeight = '65vh',
  } = props;

  // ── Sort (controlled or internal) ───────────────────────────────────────
  const [internalSort, setInternalSort] = useState<SortState | null>(props.defaultSort ?? null);
  const sort = props.sort !== undefined ? props.sort : internalSort;
  const setSort = useCallback(
    (s: SortState | null) => {
      if (props.onSortChange) props.onSortChange(s);
      else setInternalSort(s);
    },
    [props.onSortChange],
  );

  // ── Funnel filters (controlled or internal) ─────────────────────────────
  const [internalFilters, setInternalFilters] = useState<FilterMap>({});
  const filters = props.filters !== undefined ? props.filters : internalFilters;
  const setColumnFilter = useCallback(
    (key: string, state: ColumnFilterState | undefined) => {
      const next: FilterMap = { ...filters };
      if (state) next[key] = state;
      else delete next[key];
      if (props.onFiltersChange) props.onFiltersChange(next);
      else setInternalFilters(next);
    },
    [filters, props.onFiltersChange],
  );

  // ── Selection (controlled or internal) ──────────────────────────────────
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const selected = props.selected ?? internalSelected;
  const setSelected = useCallback(
    (s: Set<string>) => {
      if (props.onSelectedChange) props.onSelectedChange(s);
      else setInternalSelected(s);
    },
    [props.onSelectedChange],
  );

  // ── Column visibility ───────────────────────────────────────────────────
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(() => loadHiddenColumns(storageKey, columns.map((c) => ({ key: c.key, label: cellText(c.header) || c.key, defaultHidden: c.defaultHidden }))));
  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key));

  // ── Expansion ───────────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const accessorOf = useCallback(
    (col: DataTableColumn<T>) => col.accessor ?? ((row: T) => (row as Record<string, unknown>)[col.key]),
    [],
  );

  // ── Client-side filter + sort (skipped in server mode) ──────────────────
  const processedRows = useMemo(() => {
    let out = rows;
    if (!props.onFiltersChange) {
      const active = Object.entries(filters).filter(([, st]) => st && ((st.values?.length ?? 0) > 0 || st.query?.trim()));
      if (active.length > 0) {
        out = out.filter((row) =>
          active.every(([key, st]) => {
            const col = columns.find((c) => c.key === key);
            if (!col) return true;
            const text = cellText(accessorOf(col)(row));
            if (st.values?.length && !st.values.includes(text)) return false;
            if (st.query?.trim() && !text.toLowerCase().includes(st.query.trim().toLowerCase())) return false;
            return true;
          }),
        );
      }
    }
    if (!props.onSortChange && sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        const acc = accessorOf(col);
        out = [...out].sort((a, b) => (sort.dir === 'asc' ? 1 : -1) * compareValues(acc(a), acc(b)));
      }
    }
    return out;
  }, [rows, filters, sort, columns, props.onFiltersChange, props.onSortChange, accessorOf]);

  const selectableRows = useMemo(
    () => (selectable ? processedRows.filter((r) => isRowSelectable?.(r) ?? true) : []),
    [processedRows, selectable, isRowSelectable],
  );
  const selectableKeys = selectableRows.map(rowKey);
  const allSelected = selectableKeys.length > 0 && selectableKeys.every((k) => selected.has(k));
  const someSelected = selectableKeys.some((k) => selected.has(k));

  function toggleAll() {
    const next = new Set(selected);
    if (allSelected) selectableKeys.forEach((k) => next.delete(k));
    else selectableKeys.forEach((k) => next.add(k));
    setSelected(next);
  }

  function cycleSort(key: string) {
    if (sort?.key !== key) setSort({ key, dir: 'asc' });
    else if (sort.dir === 'asc') setSort({ key, dir: 'desc' });
    else setSort(null);
  }

  function funnelOptionsFor(col: DataTableColumn<T>) {
    if (col.filterOptions) return col.filterOptions;
    const acc = accessorOf(col);
    const seen = new Set<string>();
    for (const row of rows) seen.add(cellText(acc(row)));
    return [...seen].sort().map((v) => ({ value: v }));
  }

  async function handleExportCsv() {
    const data = props.onExportAll ? await props.onExportAll() : processedRows;
    exportRowsAsCsv(data, visibleColumns, props.exportFileName ?? 'export');
  }

  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0);
  const cellPad = dense ? 'px-4 py-2.5' : 'px-4 py-3';

  const showToolbar =
    props.onPageSizeChange || props.toolbar || props.toolbarActions || props.showExportCsv || props.onPrint || storageKey;

  return (
    <div className={cx('space-y-3', props.className)}>
      {/* Toolbar: entries selector · host chrome · export/print/columns */}
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          {props.onPageSizeChange && (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Show
              <select
                value={props.pageSize}
                onChange={(e) => props.onPageSizeChange?.(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              entries
            </label>
          )}
          {props.toolbar}
          <div className="ml-auto flex items-center gap-2">
            {props.showExportCsv && (
              <button
                type="button"
                onClick={() => void handleExportCsv()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <FileDown className="h-3.5 w-3.5" /> Export CSV
              </button>
            )}
            {props.onPrint && (
              <button
                type="button"
                onClick={props.onPrint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
            )}
            {props.toolbarActions}
            {storageKey && (
              <ColumnVisibilityButton
                columns={columns.map((c) => ({ key: c.key, label: cellText(c.header) || c.key, defaultHidden: c.defaultHidden }))}
                hidden={hiddenCols}
                onChange={setHiddenCols}
                storageKey={storageKey}
              />
            )}
          </div>
        </div>
      )}

      {selectable && bulkActions.length > 0 && (
        <BulkActionBar selectedKeys={[...selected]} actions={bulkActions} onClear={() => setSelected(new Set())} />
      )}

      <DataTableDesktop
        visibleColumns={visibleColumns}
        processedRows={processedRows}
        rowKey={rowKey}
        accessorOf={accessorOf}
        loading={loading}
        loadingRows={loadingRows}
        error={error}
        onRetry={onRetry}
        emptyState={props.emptyState}
        emptyText={props.emptyText}
        gridLines={gridLines}
        cellPad={cellPad}
        colSpan={colSpan}
        maxBodyHeight={maxBodyHeight}
        sort={sort}
        cycleSort={cycleSort}
        filters={filters}
        setColumnFilter={setColumnFilter}
        funnelOptionsFor={funnelOptionsFor}
        selectable={selectable}
        selected={selected}
        setSelected={setSelected}
        isRowSelectable={isRowSelectable}
        allSelected={allSelected}
        someSelected={someSelected}
        toggleAll={toggleAll}
        renderExpanded={renderExpanded}
        expanded={expanded}
        setExpanded={setExpanded}
        onRowClick={props.onRowClick}
        rowClassName={props.rowClassName}
        page={props.page}
        totalPages={props.totalPages}
        onPageChange={props.onPageChange}
        total={props.total}
        pageSize={props.pageSize}
      />

      <DataTableMobile
        visibleColumns={visibleColumns}
        processedRows={processedRows}
        rowKey={rowKey}
        accessorOf={accessorOf}
        loading={loading}
        loadingRows={loadingRows}
        error={error}
        onRetry={onRetry}
        emptyState={props.emptyState}
        emptyText={props.emptyText}
        selectable={selectable}
        selected={selected}
        setSelected={setSelected}
        isRowSelectable={isRowSelectable}
        renderExpanded={renderExpanded}
        expanded={expanded}
        setExpanded={setExpanded}
        onRowClick={props.onRowClick}
        rowClassName={props.rowClassName}
        page={props.page}
        totalPages={props.totalPages}
        onPageChange={props.onPageChange}
        total={props.total}
        pageSize={props.pageSize}
      />
    </div>
  );
}
