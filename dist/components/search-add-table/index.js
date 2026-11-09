import { useState, useRef, useMemo, useEffect } from 'react';
import { Loader2, Plus, Search } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

// src/components/search-add-table/search-add-table.tsx

// src/components/search/debounce.ts
var DEFAULT_SEARCH_DELAY_MS = 300;
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
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
function useDebouncedCallback(fn, delay = DEFAULT_SEARCH_DELAY_MS, options = {}) {
  const fnRef = useLatestRef(fn);
  const { maxWait } = options;
  const debounced = useMemo(
    () => createDebouncer((...args) => fnRef.current(...args), delay, { maxWait }),
    [delay, maxWait, fnRef]
  );
  useEffect(() => () => debounced.cancel(), [debounced]);
  return debounced;
}
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
function SearchAddTable({
  onSearch,
  onAdd,
  excludeIds,
  minChars = 2,
  debounceMs = DEFAULT_SEARCH_DELAY_MS,
  placeholder = "Search to add\u2026",
  emptyText = "No matches",
  errorText = "Search failed. Check the connection and try again.",
  onEnter,
  disabled,
  className,
  fixedDropdown,
  endAdornment,
  footer
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const ref = useRef(null);
  const inputRef = useRef(null);
  const onSearchRef = useLatestRef(onSearch);
  const runner = useMemo(() => createSearchRunner(() => (q, context) => onSearchRef.current(q, context)), [onSearchRef]);
  useEffect(() => () => runner.cancel(), [runner]);
  const runSearch = useDebouncedCallback((q) => {
    void runner.run(q).then((outcome) => {
      if (outcome.status === "stale") return;
      setResults(outcome.status === "ok" ? outcome.value : []);
      setFailed(outcome.status === "error");
      setLoading(false);
    });
  }, debounceMs);
  useEffect(() => {
    const q = query.trim();
    if (q.length < minChars) {
      runSearch.cancel();
      runner.cancel();
      setResults([]);
      setFailed(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    runSearch(q);
  }, [query, minChars, runSearch, runner]);
  async function handleEnter() {
    const q = query.trim();
    if (q.length < minChars) return;
    runSearch.flush();
    if (!onEnter) return;
    const picked = await onEnter(q);
    if (picked) pick(picked);
  }
  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  useEffect(() => {
    if (!fixedDropdown || !open || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
  }, [open, fixedDropdown, query]);
  const excluded = excludeIds ? new Set(excludeIds) : void 0;
  const visible = excluded ? results.filter((r) => !excluded.has(r.id)) : results;
  const dropdownVisible = open && query.trim().length >= minChars;
  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
  }
  function pick(option) {
    onAdd(option);
    clear();
  }
  const list = /* @__PURE__ */ jsx("ul", { className: "max-h-60 overflow-y-auto py-1", children: loading ? /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground", children: [
    /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
    " Searching\u2026"
  ] }) : visible.length === 0 ? /* @__PURE__ */ jsx("li", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: failed ? errorText : emptyText }) : visible.map((option) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onMouseDown: (e) => {
        e.preventDefault();
        pick(option);
      },
      className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60",
      children: [
        /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate text-foreground", children: option.label }),
            option.hint && /* @__PURE__ */ jsx("span", { className: "shrink-0 font-mono text-xs text-muted-foreground", children: option.hint })
          ] }),
          option.description && /* @__PURE__ */ jsx("span", { className: "block truncate text-xs text-muted-foreground", children: option.description })
        ] }),
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 shrink-0 text-primary" })
      ]
    }
  ) }, option.id)) });
  const panel = /* @__PURE__ */ jsxs(Fragment, { children: [
    list,
    !loading && footer?.({ query: query.trim(), clear })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: cx("relative", className), ref, children: [
    /* @__PURE__ */ jsxs("div", { className: "relative", ref: inputRef, children: [
      /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: query,
          disabled,
          placeholder,
          onChange: (e) => {
            setQuery(e.target.value);
            setOpen(true);
          },
          onKeyDown: (e) => {
            if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
            e.preventDefault();
            setOpen(true);
            void handleEnter();
          },
          onFocus: () => query.trim().length >= minChars && setOpen(true),
          className: cx(
            "w-full rounded-lg border border-input bg-background py-2 pl-10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60",
            endAdornment ? "pr-12" : "pr-3"
          )
        }
      ),
      endAdornment && /* @__PURE__ */ jsx("div", { className: "absolute right-1.5 top-1/2 -translate-y-1/2", children: endAdornment({ setQuery: (q) => {
        setQuery(q);
        setOpen(true);
      }, open: () => setOpen(true) }) })
    ] }),
    dropdownVisible && !fixedDropdown && /* @__PURE__ */ jsx("div", { className: "absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg", children: panel }),
    dropdownVisible && fixedDropdown && /* @__PURE__ */ jsx("div", { style: dropdownStyle, className: "rounded-lg border border-border bg-popover shadow-xl", children: panel })
  ] });
}

export { SearchAddTable };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map