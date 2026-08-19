'use client';

import { type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Inbox } from 'lucide-react';
import { Checkbox } from './checkbox';
import { FunnelFilter, SortButton } from './header-controls';
import { SkeletonBar } from './skeleton-bar';
import { TableFooter } from './table-footer';
import { cellText, cx, type DataTableColumn, type FilterMap, type FilterOption, type SortState } from './types';

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' } as const;
const HIDE = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
} as const;
const SKELETON_WIDTHS = ['w-5/6', 'w-2/3', 'w-3/4', 'w-1/2'];

export interface DataTableDesktopProps<T> {
  visibleColumns: DataTableColumn<T>[];
  processedRows: T[];
  rowKey: (row: T) => string;
  accessorOf: (col: DataTableColumn<T>) => (row: T) => unknown;

  loading?: boolean;
  loadingRows?: number;
  error?: boolean;
  onRetry?: () => void;
  emptyState?: ReactNode;
  emptyText?: string;

  gridLines: 'both' | 'rows';
  cellPad: string;
  colSpan: number;
  maxBodyHeight?: string | false;

  sort: SortState | null;
  cycleSort: (key: string) => void;
  filters: FilterMap;
  setColumnFilter: (key: string, state: FilterMap[string] | undefined) => void;
  funnelOptionsFor: (col: DataTableColumn<T>) => FilterOption[];

  selectable?: boolean;
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  isRowSelectable?: (row: T) => boolean;
  allSelected: boolean;
  someSelected: boolean;
  toggleAll: () => void;

  renderExpanded?: (row: T) => ReactNode;
  expanded: Set<string>;
  setExpanded: (s: Set<string>) => void;

  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;

  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  total?: number;
  pageSize?: number;
}

/** Keyed fragment wrapper so a data row + its expansion row share one key. */
function FragmentRow({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Desktop/tablet grid render tree for DataTable (`md:` and up) — real `<table>`, sticky header. */
export function DataTableDesktop<T>(props: DataTableDesktopProps<T>) {
  const {
    visibleColumns,
    processedRows,
    rowKey,
    accessorOf,
    loading,
    loadingRows,
    error,
    onRetry,
    gridLines,
    cellPad,
    colSpan,
    maxBodyHeight = '65vh',
    sort,
    cycleSort,
    filters,
    setColumnFilter,
    funnelOptionsFor,
    selectable,
    selected,
    setSelected,
    isRowSelectable,
    allSelected,
    someSelected,
    toggleAll,
    renderExpanded,
    expanded,
    setExpanded,
    onRowClick,
    rowClassName,
    page,
    totalPages,
    onPageChange,
    total,
    pageSize,
  } = props;

  return (
    <div className="hidden md:block rounded-lg border border-border overflow-hidden">
      {/* Scroll region wraps only the table (not the footer below), so the header can
          freeze at its top via `sticky` while rows scroll underneath — the user never
          has to scroll back up to re-check a column label. */}
      <div className="overflow-auto" style={maxBodyHeight ? { maxHeight: maxBodyHeight } : undefined}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted">
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
              loadingRows ? (
                Array.from({ length: loadingRows }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className={gridLines === 'both' ? 'divide-x divide-border/50' : undefined}>
                    {selectable && <td className={cellPad} />}
                    {renderExpanded && <td className={cellPad} />}
                    {visibleColumns.map((col, ci) => (
                      <td key={col.key} className={cellPad}>
                        <SkeletonBar widthClass={SKELETON_WIDTHS[(i + ci) % SKELETON_WIDTHS.length]} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={colSpan} className="px-6 py-12 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )
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
                        onRowClick && 'cursor-pointer',
                        rowClassName?.(row),
                      )}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
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
      </div>
      {page != null && totalPages != null && onPageChange && !loading && processedRows.length > 0 && (
        <TableFooter
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          total={total}
          pageSize={pageSize}
          shownCount={processedRows.length}
        />
      )}
    </div>
  );
}
