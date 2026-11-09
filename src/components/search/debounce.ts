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

export const DEFAULT_SEARCH_DELAY_MS = 300;
export const DEFAULT_SEARCH_MAX_LENGTH = 100;

export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  /** Drops the scheduled call, if any. */
  cancel(): void;
  /** Runs the scheduled call now (Enter key, barcode scan). No-op when nothing is scheduled. */
  flush(): void;
  /** True while a call is scheduled. */
  pending(): boolean;
}

export interface DebounceOptions {
  /**
   * Longest time a call can be held back while the user keeps typing. Unset means no cap.
   * Useful for live filters that should still refresh during a long burst of input.
   */
  maxWait?: number;
}

/** Trailing-edge debounce with cancel, flush and an optional maxWait cap. */
export function createDebouncer<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number = DEFAULT_SEARCH_DELAY_MS,
  options: DebounceOptions = {},
): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | null = null;

  const clearTimers = () => {
    if (timer) clearTimeout(timer);
    if (maxTimer) clearTimeout(maxTimer);
    timer = null;
    maxTimer = null;
  };

  const invoke = () => {
    const args = lastArgs;
    clearTimers();
    lastArgs = null;
    if (args) fn(...args);
  };

  const debounced = ((...args: A) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(invoke, delay);
    if (options.maxWait !== undefined && !maxTimer) {
      maxTimer = setTimeout(invoke, options.maxWait);
    }
  }) as Debounced<A>;

  debounced.cancel = () => {
    clearTimers();
    lastArgs = null;
  };
  debounced.flush = () => {
    if (lastArgs) invoke();
  };
  debounced.pending = () => lastArgs !== null;
  return debounced;
}

export interface SearchTermOptions {
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
export function normalizeSearchTerm(raw: string, options: SearchTermOptions = {}): string {
  const { minChars = 1, maxLength = DEFAULT_SEARCH_MAX_LENGTH } = options;
  const term = raw.replace(/\s+/g, ' ').trim().slice(0, maxLength).trim();
  return term.length < minChars ? '' : term;
}

/** True for the error a fetch or axios call throws after its AbortSignal fires. */
export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = (error as { name?: unknown }).name;
  const code = (error as { code?: unknown }).code;
  return name === 'AbortError' || name === 'CanceledError' || code === 'ERR_CANCELED';
}

export interface SearchContext {
  /** Aborted as soon as a newer search starts or the box closes. Pass it to fetch or axios. */
  signal: AbortSignal;
}

export type SearchFn<R> = (term: string, context: SearchContext) => Promise<R>;

export type SearchOutcome<R> =
  | { status: 'ok'; value: R }
  | { status: 'error'; error: unknown }
  /** A newer search started (or `cancel` ran) before this one finished: ignore it. */
  | { status: 'stale' };

export interface SearchRunner<R> {
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
export function createSearchRunner<R>(getSearch: () => SearchFn<R>): SearchRunner<R> {
  let seq = 0;
  let controller: AbortController | null = null;

  const cancel = () => {
    seq += 1;
    controller?.abort();
    controller = null;
  };

  const run = async (term: string): Promise<SearchOutcome<R>> => {
    cancel();
    const mine = seq;
    const own = new AbortController();
    controller = own;
    try {
      const value = await getSearch()(term, { signal: own.signal });
      return mine === seq ? { status: 'ok', value } : { status: 'stale' };
    } catch (error) {
      if (mine !== seq || isAbortError(error)) return { status: 'stale' };
      return { status: 'error', error };
    } finally {
      if (controller === own) controller = null;
    }
  };

  return { run, cancel };
}
