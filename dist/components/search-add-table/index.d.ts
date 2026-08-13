import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * SearchAddTable — the platform's canonical "search box that appends a row to a table" mechanic,
 * factored out of pos-ui's Add-Sale page (`sell/add/page.tsx`) and inventory-ui's `ItemSearchInput`,
 * which had both grown their own bespoke copy of: type → debounced remote search → click a result
 * → append a row → clear the query for the next pick, with already-added rows excluded from
 * further results.
 *
 * Deliberately does NOT render the table itself — the row shape (qty/unit/cost/etc. columns) is
 * entirely caller-defined and varies per surface (Purchase Order, Add-Sale, …). This component's
 * only job is the search-and-add-row mechanic: render the search input + results dropdown, exclude
 * IDs already in the caller's table, and hand back the picked option via `onAdd` so the caller can
 * push its own row into its own table state.
 *
 * Like the rest of shared-ui-lib, this ships raw Tailwind classNames resolved by the HOST app's
 * Tailwind build (no CSS pipeline of its own) and has no react-query dependency — `onSearch` is a
 * plain async function, debounced internally, so it works the same whether the host wires it to
 * react-query, SWR, or a bare fetch.
 */
interface SearchAddOption {
    id: string;
    label: string;
    /** Secondary text on the row (SKU, code, unit…). */
    hint?: string;
    /** Longer muted description line under the label. */
    description?: string;
}
interface SearchAddTableProps<T extends SearchAddOption = SearchAddOption> {
    /** Debounced as the user types; return the matching options for the current query. */
    onSearch: (query: string) => Promise<T[]>;
    /** Called when a result is picked. The caller appends its own table row from this option;
     *  the search input clears and closes immediately after, ready for the next pick. */
    onAdd: (option: T) => void;
    /**
     * IDs already present in the caller's table — filtered out of every result so a picked item
     * can't be added twice. Pass the caller's current row-id set (e.g. a `Set` built from
     * `table.map(r => r.itemId)`); recomputed on every render, so no memoization is required.
     */
    excludeIds?: Iterable<string>;
    /** Minimum query length before `onSearch` fires. Default 2. */
    minChars?: number;
    /** Debounce delay in ms. Default 250. */
    debounceMs?: number;
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    /** Use fixed positioning for the dropdown so it escapes overflow:auto parents (e.g. modals). */
    fixedDropdown?: boolean;
}
declare function SearchAddTable<T extends SearchAddOption = SearchAddOption>({ onSearch, onAdd, excludeIds, minChars, debounceMs, placeholder, emptyText, disabled, className, fixedDropdown, }: SearchAddTableProps<T>): react_jsx_runtime.JSX.Element;

export { type SearchAddOption, SearchAddTable, type SearchAddTableProps };
