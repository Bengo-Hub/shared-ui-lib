'use strict';

var react = require('react');
var lucideReact = require('lucide-react');
var jsxRuntime = require('react/jsx-runtime');

// src/components/search/debounce.ts
var DEFAULT_SEARCH_DELAY_MS = 300;
var DEFAULT_SEARCH_MAX_LENGTH = 100;
function createDebouncer(fn, delay = DEFAULT_SEARCH_DELAY_MS, options = {}) {
  let timer = null;
  let maxTimer = null;
  let lastArgs = null;
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
  const debounced = ((...args) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(invoke, delay);
    if (options.maxWait !== void 0 && !maxTimer) {
      maxTimer = setTimeout(invoke, options.maxWait);
    }
  });
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
function normalizeSearchTerm(raw, options = {}) {
  const { minChars = 1, maxLength = DEFAULT_SEARCH_MAX_LENGTH } = options;
  const term = raw.replace(/\s+/g, " ").trim().slice(0, maxLength).trim();
  return term.length < minChars ? "" : term;
}
function isAbortError(error) {
  if (!error || typeof error !== "object") return false;
  const name = error.name;
  const code = error.code;
  return name === "AbortError" || name === "CanceledError" || code === "ERR_CANCELED";
}
function createSearchRunner(getSearch) {
  let seq = 0;
  let controller = null;
  const cancel = () => {
    seq += 1;
    controller?.abort();
    controller = null;
  };
  const run = async (term) => {
    cancel();
    const mine = seq;
    const own = new AbortController();
    controller = own;
    try {
      const value = await getSearch()(term, { signal: own.signal });
      return mine === seq ? { status: "ok", value } : { status: "stale" };
    } catch (error) {
      if (mine !== seq || isAbortError(error)) return { status: "stale" };
      return { status: "error", error };
    } finally {
      if (controller === own) controller = null;
    }
  };
  return { run, cancel };
}
function useLatestRef(value) {
  const ref = react.useRef(value);
  ref.current = value;
  return ref;
}
function useDebouncedValue(value, delay = DEFAULT_SEARCH_DELAY_MS) {
  const [debounced, setDebounced] = react.useState(value);
  react.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
function useDebouncedCallback(fn, delay = DEFAULT_SEARCH_DELAY_MS, options = {}) {
  const fnRef = useLatestRef(fn);
  const { maxWait } = options;
  const debounced = react.useMemo(
    () => createDebouncer((...args) => fnRef.current(...args), delay, { maxWait }),
    [delay, maxWait, fnRef]
  );
  react.useEffect(() => () => debounced.cancel(), [debounced]);
  return debounced;
}
function useDebouncedSearch(options = {}) {
  const {
    initial = "",
    delay = DEFAULT_SEARCH_DELAY_MS,
    minChars = 1,
    maxLength,
    onTermChange
  } = options;
  const normalise = react.useCallback(
    (raw) => normalizeSearchTerm(raw, { minChars, maxLength }),
    [minChars, maxLength]
  );
  const [value, setValueState] = react.useState(initial);
  const [term, setTerm] = react.useState(() => normalise(initial));
  const composing = react.useRef(false);
  const onTermChangeRef = useLatestRef(onTermChange);
  const lastTerm = react.useRef(term);
  const commit = react.useCallback(
    (raw) => {
      const next = normalise(raw);
      setTerm(next);
      if (next !== lastTerm.current) {
        lastTerm.current = next;
        onTermChangeRef.current?.(next);
      }
    },
    [normalise, onTermChangeRef]
  );
  const schedule = useDebouncedCallback(commit, delay);
  const setValue = react.useCallback(
    (next, opts) => {
      setValueState(next);
      if (opts?.immediate) {
        schedule.cancel();
        commit(next);
      } else if (!composing.current) {
        schedule(next);
      }
    },
    [schedule, commit]
  );
  const valueRef = useLatestRef(value);
  const flush = react.useCallback(() => {
    schedule.cancel();
    commit(valueRef.current);
  }, [schedule, commit, valueRef]);
  const clear = react.useCallback(() => {
    schedule.cancel();
    setValueState("");
    commit("");
  }, [schedule, commit]);
  const inputProps = react.useMemo(
    () => ({
      value,
      onChange: (e) => setValue(e.target.value),
      onKeyDown: (e) => {
        if (e.nativeEvent?.isComposing) return;
        if (e.key === "Enter") flush();
        else if (e.key === "Escape" && valueRef.current) {
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
      }
    }),
    [value, setValue, flush, clear, schedule, valueRef]
  );
  return {
    value,
    setValue,
    term,
    isDebouncing: normalise(value) !== term,
    flush,
    clear,
    inputProps
  };
}
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
var SearchInput = react.forwardRef(function SearchInput2({ search, busy, placeholder = "Search\u2026", label, autoFocus, disabled, className, inputClassName, endAdornment, onSubmit }, ref) {
  const { inputProps, value, clear, isDebouncing } = search;
  const showSpinner = Boolean(busy) || isDebouncing && value.trim() !== "";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cx("relative", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        ref,
        type: "search",
        role: "searchbox",
        "aria-label": label ?? placeholder,
        autoComplete: "off",
        spellCheck: false,
        autoFocus,
        disabled,
        placeholder,
        ...inputProps,
        onKeyDown: (e) => {
          inputProps.onKeyDown(e);
          if (e.key === "Enter" && !e.nativeEvent.isComposing && onSubmit) {
            onSubmit(e.currentTarget.value.trim());
          }
        },
        className: cx(
          "w-full rounded-lg border border-input bg-background py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60 [&::-webkit-search-cancel-button]:hidden",
          endAdornment ? "pr-20" : "pr-14",
          inputClassName
        )
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1", children: [
      showSpinner && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { "aria-hidden": true, className: "h-4 w-4 animate-spin text-muted-foreground" }),
      value && !disabled && /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: clear,
          "aria-label": "Clear search",
          className: "rounded p-1 text-muted-foreground hover:text-foreground",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-4 w-4" })
        }
      ),
      endAdornment
    ] })
  ] });
});

exports.DEFAULT_SEARCH_DELAY_MS = DEFAULT_SEARCH_DELAY_MS;
exports.DEFAULT_SEARCH_MAX_LENGTH = DEFAULT_SEARCH_MAX_LENGTH;
exports.SearchInput = SearchInput;
exports.createDebouncer = createDebouncer;
exports.createSearchRunner = createSearchRunner;
exports.isAbortError = isAbortError;
exports.normalizeSearchTerm = normalizeSearchTerm;
exports.useDebouncedCallback = useDebouncedCallback;
exports.useDebouncedSearch = useDebouncedSearch;
exports.useDebouncedValue = useDebouncedValue;
exports.useLatestRef = useLatestRef;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map