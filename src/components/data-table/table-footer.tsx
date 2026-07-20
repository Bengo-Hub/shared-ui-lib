'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from './types';

/**
 * TableFooter — "Showing X to Y of Z entries" + numbered pagination.
 * Rendered only when the host passes page/onPageChange (server pagination)
 * — hosts with their own Pagination component can keep using it instead.
 */
export function TableFooter({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize,
  shownCount,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  total?: number;
  pageSize?: number;
  shownCount: number;
}) {
  const from = total != null && pageSize != null ? (total === 0 ? 0 : (page - 1) * pageSize + 1) : null;
  const to = from != null && pageSize != null ? Math.min(from + shownCount - 1, total ?? from + shownCount - 1) : null;

  // Windowed page numbers: 1 … p-1 p p+1 … N
  const pages: (number | '…')[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        {from != null && to != null && total != null
          ? `Showing ${from} to ${to} of ${total} entries`
          : `Page ${page} of ${totalPages}`}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className="p-1.5 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cx(
                  'min-w-[28px] rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                  p === page
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className="p-1.5 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
