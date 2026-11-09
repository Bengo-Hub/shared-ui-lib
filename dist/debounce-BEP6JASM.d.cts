/**
 * Framework-free search primitives shared by every search box in the platform.
 *
 * Typing "pizza" must not send five requests. A debouncer waits until the user pauses
 * (300 ms by default) and only then runs the search; each keystroke restarts the wait.
 * The search runner then makes sure only the newest request can update the screen: it
 * aborts the previous request and ignores any late reply.
 *
 * Nothing here imports React, so it runs under `node --test` and in any host.
 */
declare const DEFAULT_SEARCH_DELAY_MS = 300;
declare const DEFAULT_SEARCH_MAX_LENGTH = 100;
interface Debounced<A extends unknown[]> {
    (...args: A): void;
    /** Drops the scheduled call, if any. */
    cancel(): void;
    /** Runs the scheduled call now (Enter key, barcode scan). No-op when nothing is scheduled. */
    flush(): void;
    /** True while a call is scheduled. */
    pending(): boolean;
}
interface DebounceOptions {
    /**
     * Longest time a call can be held back while the user keeps typing. Unset means no cap.
     * Useful for live filters that should still refresh during a long burst of input.
     */
    maxWait?: number;
}
/** Trailing-edge debounce with cancel, flush and an optional maxWait cap. */
declare function createDebouncer<A extends unknown[]>(fn: (...args: A) => void, delay?: number, options?: DebounceOptions): Debounced<A>;
interface SearchTermOptions {
    /** Terms shorter than this (after trimming) become '' so no search runs. Default 1. */
    minChars?: number;
    /** Longer input is cut to this length before it reaches the server. Default 100. */
    maxLength?: number;
}
/**
 * Turns raw input into the term that is actually searched: trims, collapses runs of
 * whitespace, caps the length, and returns '' when it is shorter than `minChars`.
 * The same rule runs on the server (Go `pagination.SearchTerm`).
 */
declare function normalizeSearchTerm(raw: string, options?: SearchTermOptions): string;
/** True for the error a fetch or axios call throws after its AbortSignal fires. */
declare function isAbortError(error: unknown): boolean;
interface SearchContext {
    /** Aborted as soon as a newer search starts or the box closes. Pass it to fetch or axios. */
    signal: AbortSignal;
}
type SearchFn<R> = (term: string, context: SearchContext) => Promise<R>;
type SearchOutcome<R> = {
    status: 'ok';
    value: R;
} | {
    status: 'error';
    error: unknown;
}
/** A newer search started (or `cancel` ran) before this one finished: ignore it. */
 | {
    status: 'stale';
};
interface SearchRunner<R> {
    /** Starts a search and aborts the one before it. Never rejects. */
    run(term: string): Promise<SearchOutcome<R>>;
    /** Aborts the search in flight; its outcome becomes 'stale'. */
    cancel(): void;
}
/**
 * Latest-wins search: every `run` aborts the previous request, and only the newest
 * request's outcome is reported as 'ok' or 'error'. `getSearch` is read on every run,
 * so a host can pass a fresh callback each render without restarting anything.
 */
declare function createSearchRunner<R>(getSearch: () => SearchFn<R>): SearchRunner<R>;

export { type DebounceOptions as D, type SearchContext as S, type Debounced as a, DEFAULT_SEARCH_DELAY_MS as b, DEFAULT_SEARCH_MAX_LENGTH as c, type SearchFn as d, type SearchOutcome as e, type SearchRunner as f, type SearchTermOptions as g, createDebouncer as h, createSearchRunner as i, isAbortError as j, normalizeSearchTerm as n };
