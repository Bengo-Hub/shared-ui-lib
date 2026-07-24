export { B as BulkAction, a as BulkActionBar, C as Checkbox, k as CheckboxProps, b as ColumnFilterState, l as ColumnMeta, c as ColumnVisibilityButton, D as DataTable, d as DataTableColumn, e as DataTableProps, F as FilterMap, f as FilterOption, g as FunnelFilter, S as SortButton, h as SortDir, i as SortState, T as TableFooter, m as cellText, n as compareValues, j as exportRowsAsCsv, o as loadHiddenColumns } from '../../export-RDNHdXWh.cjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

/**
 * AnchoredPopover — minimal portal-less popover for table chrome (funnel
 * filters, column manager). Rendered `position: fixed` from the trigger's
 * rect so it escapes the table's `overflow-x-auto` container (an inline
 * absolute panel would be clipped). Closes on outside click, Escape, scroll
 * of any ancestor, or resize.
 */
declare function AnchoredPopover({ open, onClose, anchorRef, children, align, width, }: {
    open: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLElement | null>;
    children: ReactNode;
    align?: 'start' | 'end';
    width?: number;
}): react_jsx_runtime.JSX.Element | null;

export { AnchoredPopover };
