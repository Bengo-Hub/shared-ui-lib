'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, FileDown, Inbox, Printer } from 'lucide-react';
import { BulkActionBar } from './bulk-action-bar';
import { Checkbox } from './checkbox';
import { ColumnVisibilityButton, loadHiddenColumns } from './column-visibility';
import { exportRowsAsCsv } from './export';
import { FunnelFilter, SortButton } from './header-controls';
import { TableFooter } from './table-footer';
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

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' } as const;
const HIDE = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
} as const;

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    columns,
    rows,
    rowKey,
    loading,
    error,
    onRetry,
    selectable,
    isRowSelectable,
    bulkActions = [],
    renderExpanded,
    storageKey,
    gridLines = 'both',
    dense,
    pageSizeOptions = [10, 25, 50, 100],
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
  const softCol = gridLines === 'both' ? 'border-r border-border/50 last:border-r-0' : '';

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

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className={cx('border-b border-border bg-muted/40', gridLines === 'both' && 'divide-x divide-border/50')}>
              {selectable && (
                <th className={cx(cellPad, 'w-10')}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {renderExpanded && <th className={cx(cellPad, 'w-8')} />}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={cx(
                    cellPad,
                    'font-medium text-muted-foreground whitespace-nowrap',
                    ALIGN[col.align ?? 'left'],
                    col.hideBelow && HIDE[col.hideBelow],
                    col.headerClassName,
                  )}
                >
                  <span className={cx('inline-flex items-center gap-1', col.align === 'right' && 'flex-row-reverse')}>
                    {col.header}
                    {col.sortable && (
                      <SortButton dir={sort?.key === col.key ? sort.dir : null} onCycle={() => cycleSort(col.key)} />
                    )}
                    {col.filterable && (
                      <FunnelFilter
                        options={funnelOptionsFor(col)}
                        state={filters[col.key]}
                        onChange={(st) => setColumnFilter(col.key, st)}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center">
                  <AlertTriangle className="h-10 w-10 mx-auto text-destructive/60 mb-3" />
                  <p className="text-muted-foreground">Couldn&apos;t load data</p>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-3 rounded-lg border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ) : processedRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center">
                  {props.emptyState ?? (
                    <>
                      <Inbox className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">{props.emptyText ?? 'No records found'}</p>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              processedRows.map((row, i) => {
                const key = rowKey(row);
                const isExpanded = expanded.has(key);
                const canSelect = isRowSelectable?.(row) ?? true;
                return (
                  <FragmentRow key={key}>
                    <tr
                      className={cx(
                        'hover:bg-accent/30 transition-colors',
                        gridLines === 'both' && 'divide-x divide-border/50',
                        selected.has(key) && 'bg-primary/5',
                        props.onRowClick && 'cursor-pointer',
                        props.rowClassName?.(row),
                      )}
                      onClick={props.onRowClick ? () => props.onRowClick?.(row) : undefined}
                    >
                      {selectable && (
                        <td className={cellPad}>
                          {canSelect && (
                            <Checkbox
                              checked={selected.has(key)}
                              onChange={() => {
                                const next = new Set(selected);
                                if (next.has(key)) next.delete(key);
                                else next.add(key);
                                setSelected(next);
                              }}
                            />
                          )}
                        </td>
                      )}
                      {renderExpanded && (
                        <td className={cellPad}>
                          <button
                            type="button"
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = new Set(expanded);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              setExpanded(next);
                            }}
                            className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={cx(
                            cellPad,
                            ALIGN[col.align ?? 'left'],
                            col.hideBelow && HIDE[col.hideBelow],
                            col.cellClassName,
                          )}
                        >
                          {col.render ? col.render(row, i) : cellText(accessorOf(col)(row)) || '—'}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && renderExpanded && (
                      <tr className="bg-muted/20">
                        <td colSpan={colSpan} className="px-6 py-3">
                          {renderExpanded(row)}
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                );
              })
            )}
          </tbody>
        </table>
        {props.page != null && props.totalPages != null && props.onPageChange && !loading && processedRows.length > 0 && (
          <TableFooter
            page={props.page}
            totalPages={props.totalPages}
            onPageChange={props.onPageChange}
            total={props.total}
            pageSize={props.pageSize}
            shownCount={processedRows.length}
          />
        )}
      </div>
    </div>
  );
}

/** Keyed fragment wrapper so a data row + its expansion row share one key. */
function FragmentRow({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
