'use client';

import { type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Inbox } from 'lucide-react';
import { Checkbox } from './checkbox';
import { SkeletonBar } from './skeleton-bar';
import { TableFooter } from './table-footer';
import { cellText, cx, type DataTableColumn } from './types';

export interface DataTableMobileProps<T> {
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

  selectable?: boolean;
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  isRowSelectable?: (row: T) => boolean;

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

/** Stacked card-list render tree for DataTable (below `md:`) — same loading/error/empty/rows
 *  logic as the desktop grid, laid out as cards instead of a table (the native pattern for
 *  dense tabular data on phones, since fixed columns either cram unreadably or force
 *  sideways scrolling just to see one more field). */
export function DataTableMobile<T>(props: DataTableMobileProps<T>) {
  const {
    visibleColumns,
    processedRows,
    rowKey,
    accessorOf,
    loading,
    loadingRows,
    error,
    onRetry,
    selectable,
    selected,
    setSelected,
    isRowSelectable,
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
    <div className="md:hidden rounded-lg border border-border">
      <div className="divide-y divide-border">
        {loading ? (
          loadingRows ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <div key={`skeleton-${i}`} className="p-4 space-y-2">
                <SkeletonBar widthClass="w-2/3" />
                <SkeletonBar widthClass="w-1/2" />
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading…</div>
          )
        ) : error ? (
          <div className="px-6 py-12 text-center">
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
          </div>
        ) : processedRows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            {props.emptyState ?? (
              <>
                <Inbox className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{props.emptyText ?? 'No records found'}</p>
              </>
            )}
          </div>
        ) : (
          processedRows.map((row, i) => {
            const key = rowKey(row);
            const isExpanded = expanded.has(key);
            const canSelect = isRowSelectable?.(row) ?? true;
            const primaryCol = visibleColumns.find((c) => c.primary);
            const actionCols = visibleColumns.filter((c) => c.mobileAction);
            const bodyCols = visibleColumns.filter((c) => !c.primary && !c.mobileAction && !c.mobileHidden);
            return (
              <div
                key={key}
                className={cx(
                  'p-4 active:bg-accent/40 transition-colors',
                  (onRowClick || renderExpanded) && 'cursor-pointer',
                  selected.has(key) && 'bg-primary/5',
                  rowClassName?.(row),
                )}
                onClick={
                  onRowClick
                    ? () => onRowClick(row)
                    : renderExpanded
                      ? () => {
                          const next = new Set(expanded);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          setExpanded(next);
                        }
                      : undefined
                }
              >
                <div className="flex items-start gap-3">
                  {selectable && canSelect && (
                    <div onClick={(e) => e.stopPropagation()} className="pt-0.5 shrink-0">
                      <Checkbox
                        checked={selected.has(key)}
                        onChange={() => {
                          const next = new Set(selected);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          setSelected(next);
                        }}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {primaryCol && (
                      <div className="font-semibold text-foreground break-words">
                        {primaryCol.render ? primaryCol.render(row, i) : cellText(accessorOf(primaryCol)(row)) || '—'}
                      </div>
                    )}
                  </div>
                  {(actionCols.length > 0 || renderExpanded) && (
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {actionCols.map((c) => (
                        <div key={c.key}>{c.render ? c.render(row, i) : cellText(accessorOf(c)(row))}</div>
                      ))}
                      {renderExpanded && (
                        <button
                          type="button"
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          onClick={() => {
                            const next = new Set(expanded);
                            if (next.has(key)) next.delete(key);
                            else next.add(key);
                            setExpanded(next);
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {bodyCols.length > 0 && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {bodyCols.map((c) => (
                      <div key={c.key} className="min-w-0">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {c.mobileLabel ?? (typeof c.header === 'string' ? c.header : c.key)}
                        </dt>
                        <dd className="text-sm text-foreground mt-0.5 break-words">
                          {c.render ? c.render(row, i) : cellText(accessorOf(c)(row)) || '—'}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {isExpanded && renderExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/70" onClick={(e) => e.stopPropagation()}>
                    {renderExpanded(row)}
                  </div>
                )}
              </div>
            );
          })
        )}
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
