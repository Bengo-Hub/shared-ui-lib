import { D as DebounceOptions, a as Debounced } from '../../debounce-BEP6JASM.js';
export { b as DEFAULT_SEARCH_DELAY_MS, c as DEFAULT_SEARCH_MAX_LENGTH, S as SearchContext, d as SearchFn, e as SearchOutcome, f as SearchRunner, g as SearchTermOptions, h as createDebouncer, i as createSearchRunner, j as isAbortError, n as normalizeSearchTerm } from '../../debounce-BEP6JASM.js';
import * as react from 'react';

/** Keeps a ref pointing at the latest value, so timers never call a stale callback. */
declare function useLatestRef<T>(value: T): react.RefObject<T>;
/** `value`, but only after it has stopped changing for `delay` ms. */
declare function useDebouncedValue<T>(value: T, delay?: number): T;
/**
 * A stable debounced version of `fn`. The latest `fn` is always the one called, so an
 * inline arrow from the host never restarts the timer. Pending calls are dropped on unmount.
 */
declare function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay?: number, options?: DebounceOptions): Debounced<A>;
interface UseDebouncedSearchOptions {
    /** Starting text, e.g. read from the URL. */
    initial?: string;
    /** Pause before the term updates. Default 300 ms. */
    delay?: number;
    /** Shorter terms become ''. Default 1. */
    minChars?: number;
    /** Input is capped at this length. Default 100. */
    maxLength?: number;
    /** Called whenever the searched term changes (store it in the URL, log it, etc.). */
    onTermChange?: (term: string) => void;
}
interface DebouncedSearch {
    /** What is in the box right now. */
    value: string;
    /**
     * Set the box's text. Pass `{ immediate: true }` for text that did not come from typing,
     * such as a camera or scan-button result, so it is searched at once instead of after the pause.
     */
    setValue: (value: string, options?: {
        immediate?: boolean;
    }) => void;
    /** The normalised term to search for. Updates after the pause, or at once on Enter. */
    term: string;
    /** True while the box holds text that has not been searched yet. */
    isDebouncing: boolean;
    /** Search the current text now (Enter, a barcode scan, a button). */
    flush: () => void;
    /** Empty the box and the term at once. */
    clear: () => void;
    /** Spread onto an `<input>`: value, change, Enter, Esc and IME handling. */
    inputProps: {
        value: string;
        onChange: (e: {
            target: {
                value: string;
            };
        }) => void;
        onKeyDown: (e: {
            key: string;
            nativeEvent?: {
                isComposing?: boolean;
            };
            stopPropagation?: () => void;
        }) => void;
        onCompositionStart: () => void;
        onCompositionEnd: (e: {
            currentTarget: {
                value: string;
            };
        }) => void;
    };
}
/**
 * The one hook behind every search box. Keystrokes update `value` straight away (the box
 * never lags) while `term`, which drives the query, waits for a pause. Enter searches at
 * once, which also covers barcode scanners that end a scan with Enter. While an input
 * method editor is composing a character the wait does not start.
 */
declare function useDebouncedSearch(options?: UseDebouncedSearchOptions): DebouncedSearch;

interface SearchInputProps {
    /** The object returned by `useDebouncedSearch()`. */
    search: DebouncedSearch;
    /** Show the spinner, e.g. `query.isFetching`. The spinner also shows while the pause runs. */
    busy?: boolean;
    placeholder?: string;
    /** Accessible name. Defaults to the placeholder. */
    label?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    className?: string;
    inputClassName?: string;
    /** Extra control at the right edge, such as a scan button. */
    endAdornment?: React.ReactNode;
    /** Called after Enter has flushed the search (e.g. pick the single exact barcode match). */
    onSubmit?: (term: string) => void;
}
/**
 * The standard search box: search icon, clear button and a small spinner while waiting.
 * Plain theme tokens only, resolved by the host app's Tailwind build.
 */
declare const SearchInput: react.ForwardRefExoticComponent<SearchInputProps & react.RefAttributes<HTMLInputElement>>;

export { DebounceOptions, Debounced, type DebouncedSearch, SearchInput, type SearchInputProps, type UseDebouncedSearchOptions, useDebouncedCallback, useDebouncedSearch, useDebouncedValue, useLatestRef };
