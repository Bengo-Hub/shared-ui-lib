import { useState, useRef, useEffect } from 'react';
import { Loader2, Plus, Search } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

// src/components/search-add-table/search-add-table.tsx
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
function SearchAddTable({
  onSearch,
  onAdd,
  excludeIds,
  minChars = 2,
  debounceMs = 250,
  placeholder = "Search to add\u2026",
  emptyText = "No matches",
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
  const [dropdownStyle, setDropdownStyle] = useState({});
  const ref = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < minChars) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const seq = ++requestSeq.current;
    debounceRef.current = setTimeout(() => {
      onSearch(q).then((res) => {
        if (requestSeq.current !== seq) return;
        setResults(res);
      }).catch(() => {
        if (requestSeq.current === seq) setResults([]);
      }).finally(() => {
        if (requestSeq.current === seq) setLoading(false);
      });
    }, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, minChars, debounceMs]);
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
  ] }) : visible.length === 0 ? /* @__PURE__ */ jsx("li", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: emptyText }) : visible.map((option) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
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