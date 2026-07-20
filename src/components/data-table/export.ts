import { cellText, type DataTableColumn } from './types';

/**
 * CSV export for the DataTable — exports the given rows using each exportable
 * column's accessor (raw values, not rendered JSX). Hosts wanting a full
 * server-side export pass `onExportAll` to fetch every page first.
 */
export function exportRowsAsCsv<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  fileName: string,
): void {
  const cols = columns.filter((c) => c.exportable !== false);
  const esc = (s: string) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const headerText = (h: unknown) => (typeof h === 'string' || typeof h === 'number' ? String(h) : '');
  const lines = [
    cols.map((c) => esc(headerText(c.header) || c.key)).join(','),
    ...rows.map((row) =>
      cols
        .map((c) => {
          const v = c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.key];
          return esc(cellText(v));
        })
        .join(','),
    ),
  ];
  // BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
