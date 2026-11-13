export { B as BulkAction, a as BulkActionBar, C as Checkbox, b as CheckboxProps, c as ColumnFilterState, d as ColumnMeta, e as ColumnVisibilityButton, D as DataTable, f as DataTableColumn, g as DataTableProps, F as FilterMap, h as FilterOption, i as FunnelFilter, S as SortButton, j as SortDir, k as SortState, T as TableFooter, l as cellText, m as compareValues, n as exportRowsAsCsv, o as loadHiddenColumns } from '../../export--_5Do4rL.cjs';
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
