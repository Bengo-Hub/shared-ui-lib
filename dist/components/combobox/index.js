import { useState, useRef, useLayoutEffect, useEffect, useMemo, useCallback } from 'react';
import { X, ChevronsUpDown, Search, Loader2, Check } from 'lucide-react';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/components/combobox/searchable-combobox.tsx
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
function SearchableCombobox({
  options,
  value,
  onChange,
  valueLabel,
  onRemoteSearch,
  remoteThreshold = 5,
  onLoadMore,
  hasMore,
  loading,
  placeholder = "Select\u2026",
  searchPlaceholder = "Search\u2026",
  emptyText = "No matches",
  disabled,
  clearable = true,
  className,
  footer
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const ref = useRef(null);
  const panelRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);
  const [panelPos, setPanelPos] = useState(null);
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = ref.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const estimatedPanelHeight = 300;
    const top = spaceBelow < 260 && r.top > estimatedPanelHeight ? Math.max(8, r.top - 4 - estimatedPanelHeight) : r.bottom + 4;
    setPanelPos({ top, left: r.left, width: r.width });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    function onScroll(e) {
      if (panelRef.current?.contains(e.target)) return;
      const anchor = ref.current;
      if (!anchor) return;
      const target = e.target;
      const isRelevant = target === document || target === window || target instanceof Node && target.contains(anchor);
      if (!isRelevant) return;
      setOpen(false);
    }
    function onResize() {
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  const [selectedCache, setSelectedCache] = useState(void 0);
  const selected = options.find((o) => o.value === value) ?? (selectedCache && selectedCache.value === value ? selectedCache : void 0) ?? (value && valueLabel ? { value, label: valueLabel } : void 0);
  const localMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint ?? "").toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);
  useEffect(() => {
    if (!onRemoteSearch) return;
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || localMatches.length >= remoteThreshold) {
      setRemoteResults([]);
      setRemoteLoading(false);
      return;
    }
    setRemoteLoading(true);
    const seq = ++requestSeq.current;
    debounceRef.current = setTimeout(() => {
      onRemoteSearch(q).then((results) => {
        if (requestSeq.current !== seq) return;
        setRemoteResults(results);
      }).catch(() => {
        if (requestSeq.current === seq) setRemoteResults([]);
      }).finally(() => {
        if (requestSeq.current === seq) setRemoteLoading(false);
      });
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, localMatches.length, onRemoteSearch, remoteThreshold]);
  const merged = useMemo(() => {
    if (remoteResults.length === 0) return localMatches;
    const seen = new Set(localMatches.map((o) => o.value));
    return [...localMatches, ...remoteResults.filter((o) => !seen.has(o.value))];
  }, [localMatches, remoteResults]);
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setRemoteResults([]);
  }, []);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) close();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  const select = (o) => {
    setSelectedCache(o);
    onChange(o.value, o);
    close();
  };
  const busy = loading || remoteLoading;
  return /* @__PURE__ */ jsxs("div", { ref, className: cx("relative", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => open ? close() : setOpen(true),
        className: "flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60",
        children: [
          /* @__PURE__ */ jsxs("span", { className: cx("flex min-w-0 items-center gap-2 text-left", !selected && "text-muted-foreground"), children: [
            selected?.icon,
            /* @__PURE__ */ jsx("span", { className: "truncate", children: selected ? selected.label : placeholder })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            clearable && selected && !disabled && /* @__PURE__ */ jsx(
              X,
              {
                className: "h-4 w-4 text-muted-foreground hover:text-foreground",
                onClick: (e) => {
                  e.stopPropagation();
                  setSelectedCache(void 0);
                  onChange("", void 0);
                }
              }
            ),
            /* @__PURE__ */ jsx(ChevronsUpDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
          ] })
        ]
      }
    ),
    open && panelPos && /* @__PURE__ */ jsxs(
      "div",
      {
        ref: panelRef,
        style: { position: "fixed", top: panelPos.top, left: panelPos.left, width: panelPos.width, zIndex: 60 },
        className: "overflow-hidden rounded-xl border border-border bg-card shadow-xl",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2", children: [
            /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                autoFocus: true,
                value: query,
                onChange: (e) => setQuery(e.target.value),
                placeholder: searchPlaceholder,
                className: "w-full bg-transparent text-sm text-foreground focus:outline-none"
              }
            ),
            busy && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 shrink-0 animate-spin text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "max-h-60 overflow-y-auto py-1", children: [
            merged.length === 0 ? /* @__PURE__ */ jsx("li", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: busy ? "Searching\u2026" : emptyText }) : merged.map((o) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => select(o),
                className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60",
                children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
                    o.icon,
                    /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsxs("span", { className: "flex items-baseline gap-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "truncate text-foreground", children: o.label }),
                        o.hint && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: o.hint })
                      ] }),
                      o.description && /* @__PURE__ */ jsx("span", { className: "block truncate text-xs text-muted-foreground", children: o.description })
                    ] })
                  ] }),
                  o.value === value && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 shrink-0 text-primary" })
                ]
              }
            ) }, o.value)),
            hasMore && onLoadMore && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: onLoadMore,
                className: "w-full px-3 py-2 text-center text-xs font-medium text-primary hover:bg-muted/60",
                children: "Load more\u2026"
              }
            ) })
          ] }),
          footer && /* @__PURE__ */ jsx("div", { className: "border-t border-border p-1", children: footer })
        ]
      }
    )
  ] });
}
function cx2(...classes) {
  return classes.filter(Boolean).join(" ");
}
function MultiSelectCombobox({
  options,
  values,
  onChange,
  placeholder = "Select\u2026",
  searchPlaceholder = "Search\u2026",
  emptyText = "No matches",
  disabled,
  className,
  footer
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const panelRef = useRef(null);
  const [panelPos, setPanelPos] = useState(null);
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = ref.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const estimatedPanelHeight = 300;
    const top = spaceBelow < 260 && r.top > estimatedPanelHeight ? Math.max(8, r.top - 4 - estimatedPanelHeight) : r.bottom + 4;
    setPanelPos({ top, left: r.left, width: r.width });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    function onScroll(e) {
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onResize() {
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) close();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  const selected = useMemo(
    () => values.map((v) => options.find((o) => o.value === v) ?? { value: v, label: v }),
    [values, options]
  );
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint ?? "").toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);
  function toggle(value) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }
  function remove(value) {
    onChange(values.filter((v) => v !== value));
  }
  return /* @__PURE__ */ jsxs("div", { ref, className: cx2("relative", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => open ? close() : setOpen(true),
        className: "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background px-2.5 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60",
        children: [
          selected.length === 0 && /* @__PURE__ */ jsx("span", { className: "px-0.5 text-muted-foreground", children: placeholder }),
          selected.map((o) => /* @__PURE__ */ jsxs(
            "span",
            {
              className: "inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground",
              children: [
                o.icon,
                o.label,
                !disabled && /* @__PURE__ */ jsx(
                  X,
                  {
                    className: "h-3 w-3 text-muted-foreground hover:text-foreground",
                    onClick: (e) => {
                      e.stopPropagation();
                      remove(o.value);
                    }
                  }
                )
              ]
            },
            o.value
          )),
          /* @__PURE__ */ jsx(ChevronsUpDown, { className: "ml-auto h-4 w-4 shrink-0 text-muted-foreground" })
        ]
      }
    ),
    open && panelPos && /* @__PURE__ */ jsxs(
      "div",
      {
        ref: panelRef,
        style: { position: "fixed", top: panelPos.top, left: panelPos.left, width: panelPos.width, zIndex: 60 },
        className: "overflow-hidden rounded-xl border border-border bg-card shadow-xl",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2", children: [
            /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                autoFocus: true,
                value: query,
                onChange: (e) => setQuery(e.target.value),
                placeholder: searchPlaceholder,
                className: "w-full bg-transparent text-sm text-foreground focus:outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "max-h-60 overflow-y-auto py-1", children: matches.length === 0 ? /* @__PURE__ */ jsx("li", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: emptyText }) : matches.map((o) => {
            const isSelected = values.includes(o.value);
            return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => toggle(o.value),
                className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60",
                children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
                    o.icon,
                    /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsxs("span", { className: "flex items-baseline gap-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "truncate text-foreground", children: o.label }),
                        o.hint && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: o.hint })
                      ] }),
                      o.description && /* @__PURE__ */ jsx("span", { className: "block truncate text-xs text-muted-foreground", children: o.description })
                    ] })
                  ] }),
                  isSelected && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 shrink-0 text-primary" })
                ]
              }
            ) }, o.value);
          }) }),
          footer && /* @__PURE__ */ jsx("div", { className: "border-t border-border p-1", children: footer })
        ]
      }
    )
  ] });
}

export { MultiSelectCombobox, SearchableCombobox };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map