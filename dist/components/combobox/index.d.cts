import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * SearchableCombobox — the platform's canonical rich searchable single-select.
 *
 * Search strategy: the prefetched `options` list is filtered client-side FIRST;
 * when a query exhausts the local list (fewer than `remoteThreshold` matches)
 * and `onRemoteSearch` is provided, the query falls back to a debounced API
 * search whose results are merged below the local matches (deduped by value).
 *
 * Like the rest of shared-ui-lib, this ships raw Tailwind classNames using the
 * platform's semantic tokens (border-input, bg-background, text-muted-foreground…)
 * that the HOST app's Tailwind build resolves — the lib has no CSS pipeline of
 * its own, so consumers must include the lib's dist in their content globs.
 * Self-contained (no portal/popover dependency) so it works on Tailwind v4 +
 * @base-ui hosts (pos-ui, inventory-ui, treasury-ui…).
 */
interface ComboboxOption {
    value: string;
    label: string;
    /** Secondary text on the row (sku, abbreviation, price, parent name…). */
    hint?: string;
    /** Longer muted description line under the label. */
    description?: string;
    /** Small leading visual (flag, swatch, glyph…) shown before the label, both closed and in the list. */
    icon?: React.ReactNode;
}
interface SearchableComboboxProps {
    /** Prefetched options — always searched first, client-side. */
    options: ComboboxOption[];
    value?: string;
    onChange: (value: string, option?: ComboboxOption) => void;
    /**
     * Fallback label shown when `value` is set but its record isn't in `options` or the
     * remote-search cache — e.g. an edit/amend flow pre-fills a value whose record lives
     * past the prefetched page. Without this, the closed control silently falls back to
     * `placeholder`, making an already-selected value look unselected. Host passes
     * whatever display name it already has on hand (e.g. `record.supplier_name`).
     */
    valueLabel?: string;
    /**
     * Optional async fallback invoked (debounced) when the client filter yields
     * fewer than `remoteThreshold` matches. Results merge below local matches,
     * deduped by value. Omit for pure client mode (small lists).
     */
    onRemoteSearch?: (query: string) => Promise<ComboboxOption[]>;
    /** Local-match count under which the remote fallback fires. Default 5. */
    remoteThreshold?: number;
    /** Optional "load more" for infinite server lists. */
    onLoadMore?: () => void;
    hasMore?: boolean;
    loading?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    clearable?: boolean;
    className?: string;
    /** Action row pinned under the list (e.g. "+ Add new") — host owns the dialog. */
    footer?: React.ReactNode;
}
declare function SearchableCombobox({ options, value, onChange, valueLabel, onRemoteSearch, remoteThreshold, onLoadMore, hasMore, loading, placeholder, searchPlaceholder, emptyText, disabled, clearable, className, footer, }: SearchableComboboxProps): react_jsx_runtime.JSX.Element;

export { type ComboboxOption, SearchableCombobox, type SearchableComboboxProps };
