'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createDebouncer,
  DEFAULT_SEARCH_DELAY_MS,
  normalizeSearchTerm,
  type Debounced,
  type DebounceOptions,
} from './debounce';

/** Keeps a ref pointing at the latest value, so timers never call a stale callback. */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/** `value`, but only after it has stopped changing for `delay` ms. */
export function useDebouncedValue<T>(value: T, delay: number = DEFAULT_SEARCH_DELAY_MS): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/**
 * A stable debounced version of `fn`. The latest `fn` is always the one called, so an
 * inline arrow from the host never restarts the timer. Pending calls are dropped on unmount.
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number = DEFAULT_SEARCH_DELAY_MS,
  options: DebounceOptions = {},
): Debounced<A> {
  const fnRef = useLatestRef(fn);
  const { maxWait } = options;
  const debounced = useMemo(
    () => createDebouncer<A>((...args) => fnRef.current(...args), delay, { maxWait }),
    [delay, maxWait, fnRef],
  );
  useEffect(() => () => debounced.cancel(), [debounced]);
  return debounced;
}

export interface UseDebouncedSearchOptions {
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

export interface DebouncedSearch {
  /** What is in the box right now. */
  value: string;
  /**
   * Set the box's text. Pass `{ immediate: true }` for text that did not come from typing,
   * such as a camera or scan-button result, so it is searched at once instead of after the pause.
   */
  setValue: (value: string, options?: { immediate?: boolean }) => void;
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
    onChange: (e: { target: { value: string } }) => void;
    onKeyDown: (e: { key: string; nativeEvent?: { isComposing?: boolean }; stopPropagation?: () => void }) => void;
    onCompositionStart: () => void;
    onCompositionEnd: (e: { currentTarget: { value: string } }) => void;
  };
}

/**
 * The one hook behind every search box. Keystrokes update `value` straight away (the box
 * never lags) while `term`, which drives the query, waits for a pause. Enter searches at
 * once, which also covers barcode scanners that end a scan with Enter. While an input
 * method editor is composing a character the wait does not start.
 */
export function useDebouncedSearch(options: UseDebouncedSearchOptions = {}): DebouncedSearch {
  const {
    initial = '',
    delay = DEFAULT_SEARCH_DELAY_MS,
    minChars = 1,
    maxLength,
    onTermChange,
  } = options;
  const normalise = useCallback(
    (raw: string) => normalizeSearchTerm(raw, { minChars, maxLength }),
    [minChars, maxLength],
  );
  const [value, setValueState] = useState(initial);
  const [term, setTerm] = useState(() => normalise(initial));
  const composing = useRef(false);
  const onTermChangeRef = useLatestRef(onTermChange);
  const lastTerm = useRef(term);

  const commit = useCallback(
    (raw: string) => {
      const next = normalise(raw);
      setTerm(next);
      if (next !== lastTerm.current) {
        lastTerm.current = next;
        onTermChangeRef.current?.(next);
      }
    },
    [normalise, onTermChangeRef],
  );

  const schedule = useDebouncedCallback(commit, delay);

  const setValue = useCallback(
    (next: string, opts?: { immediate?: boolean }) => {
      setValueState(next);
      if (opts?.immediate) {
        schedule.cancel();
        commit(next);
      } else if (!composing.current) {
        schedule(next);
      }
    },
    [schedule, commit],
  );

  const valueRef = useLatestRef(value);
  const flush = useCallback(() => {
    schedule.cancel();
    commit(valueRef.current);
  }, [schedule, commit, valueRef]);

  const clear = useCallback(() => {
    schedule.cancel();
    setValueState('');
    commit('');
  }, [schedule, commit]);

  const inputProps = useMemo<DebouncedSearch['inputProps']>(
    () => ({
      value,
      onChange: (e) => setValue(e.target.value),
      onKeyDown: (e) => {
        if (e.nativeEvent?.isComposing) return;
        if (e.key === 'Enter') flush();
        else if (e.key === 'Escape' && valueRef.current) {
          // The first Escape only empties the box; keep it from also closing a surrounding
          // dialog or popover. A second Escape on the empty box passes through as usual.
          e.stopPropagation?.();
          clear();
        }
      },
      onCompositionStart: () => {
        composing.current = true;
      },
      onCompositionEnd: (e) => {
        composing.current = false;
        schedule(e.currentTarget.value);
      },
    }),
    [value, setValue, flush, clear, schedule, valueRef],
  );

  return {
    value,
    setValue,
    term,
    isDebouncing: normalise(value) !== term,
    flush,
    clear,
    inputProps,
  };
}
