'use strict';

var react = require('react');
var lucideReact = require('lucide-react');
var jsxRuntime = require('react/jsx-runtime');

// src/components/data-table/data-table.tsx

// src/components/data-table/types.ts
function cellText(v) {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}
function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return a === b ? 0 : a ? -1 : 1;
  const an = Number(a);
  const bn = Number(b);
  if (!Number.isNaN(an) && !Number.isNaN(bn) && String(a).trim() !== "" && String(b).trim() !== "") {
    return an - bn;
  }
  return cellText(a).localeCompare(cellText(b), void 0, { sensitivity: "base", numeric: true });
}
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
function BulkActionBar({
  selectedKeys,
  actions,
  onClear
}) {
  const count = selectedKeys.length;
  if (count === 0) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs font-semibold text-foreground", children: [
      count,
      " selected"
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        onClick: onClear,
        className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-3 w-3" }),
          " Clear"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-px bg-border" }),
    actions.map((a) => /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        disabled: a.disabled,
        onClick: () => a.onClick(selectedKeys),
        className: cx(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          a.variant === "destructive" ? "border-destructive/40 text-destructive hover:bg-destructive/10" : "border-input text-foreground hover:bg-accent",
          a.disabled && "opacity-50 cursor-not-allowed"
        ),
        children: [
          a.icon,
          a.label
        ]
      },
      a.key
    ))
  ] });
}
function Checkbox({ checked, indeterminate, onChange, disabled, className, ...rest }) {
  const active = checked || indeterminate;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      role: "checkbox",
      "aria-checked": indeterminate ? "mixed" : checked,
      "aria-label": rest["aria-label"] ?? "Select row",
      disabled,
      onClick: (e) => {
        e.stopPropagation();
        onChange(!checked);
      },
      className: cx(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:border-primary/60",
        disabled && "opacity-40 cursor-not-allowed",
        className
      ),
      children: indeterminate ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Minus, { className: "h-3 w-3" }) : checked ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-3 w-3" }) : null
    }
  );
}
function AnchoredPopover({
  open,
  onClose,
  anchorRef,
  children,
  align = "start",
  width = 240
}) {
  const panelRef = react.useRef(null);
  const [pos, setPos] = react.useState(null);
  react.useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    let left = align === "end" ? r.right - width : r.left;
    left = Math.max(8, Math.min(left, vw - width - 8));
    const spaceBelow = window.innerHeight - r.bottom;
    const top = spaceBelow < 260 && r.top > 300 ? Math.max(8, r.top - 8 - 300) : r.bottom + 4;
    setPos({ top, left });
  }, [open, anchorRef, align, width]);
  react.useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      const t = e.target;
      if (panelRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    }
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    function onScroll(e) {
      if (panelRef.current?.contains(e.target)) return;
      onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [open, onClose, anchorRef]);
  if (!open || !pos) return null;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ref: panelRef,
      style: { position: "fixed", top: pos.top, left: pos.left, width, zIndex: 60 },
      className: "rounded-lg border border-border bg-background shadow-lg p-2 text-sm",
      children
    }
  );
}
function loadHiddenColumns(storageKey, columns) {
  const defaults = new Set(columns.filter((c) => c.defaultHidden).map((c) => c.key));
  if (!storageKey || typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(`dt-cols:${storageKey}`);
    if (!raw) return defaults;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.filter((k) => typeof k === "string"));
  } catch {
  }
  return defaults;
}
function ColumnVisibilityButton({
  columns,
  hidden,
  onChange,
  storageKey
}) {
  const [open, setOpen] = react.useState(false);
  const btnRef = react.useRef(null);
  react.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(`dt-cols:${storageKey}`, JSON.stringify([...hidden]));
    } catch {
    }
  }, [hidden, storageKey]);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        ref: btnRef,
        type: "button",
        onClick: () => setOpen((v) => !v),
        className: cx(
          "inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium",
          "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        ),
        title: "Show / hide columns",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Columns3, { className: "h-3.5 w-3.5" }),
          "Columns",
          hidden.size > 0 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[10px] text-primary font-semibold", children: [
            hidden.size,
            " hidden"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(AnchoredPopover, { open, onClose: () => setOpen(false), anchorRef: btnRef, align: "end", width: 220, children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "px-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Columns" }),
      /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "max-h-64 overflow-y-auto space-y-0.5", children: columns.map((c) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2 rounded px-1.5 py-1 hover:bg-accent cursor-pointer text-xs", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "checkbox",
            checked: !hidden.has(c.key),
            onChange: () => {
              const next = new Set(hidden);
              if (next.has(c.key)) next.delete(c.key);
              else next.add(c.key);
              onChange(next);
            },
            className: "h-3.5 w-3.5 rounded border-input"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: c.label })
      ] }) }, c.key)) })
    ] })
  ] });
}

// src/components/data-table/export.ts
function exportRowsAsCsv(rows, columns, fileName) {
  const cols = columns.filter((c) => c.exportable !== false);
  const esc = (s) => /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const headerText = (h) => typeof h === "string" || typeof h === "number" ? String(h) : "";
  const lines = [
    cols.map((c) => esc(headerText(c.header) || c.key)).join(","),
    ...rows.map(
      (row) => cols.map((c) => {
        const v = c.accessor ? c.accessor(row) : row[c.key];
        return esc(cellText(v));
      }).join(",")
    )
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function SortButton({
  dir,
  onCycle
}) {
  const Icon = dir === "asc" ? lucideReact.ArrowUp : dir === "desc" ? lucideReact.ArrowDown : lucideReact.ArrowUpDown;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      onClick: onCycle,
      "aria-label": "Sort column",
      className: cx(
        "p-0.5 rounded transition-colors",
        dir ? "text-primary" : "text-muted-foreground/50 hover:text-foreground"
      ),
      children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "h-3.5 w-3.5" })
    }
  );
}
function FunnelFilter({
  options,
  state,
  onChange
}) {
  const [open, setOpen] = react.useState(false);
  const [optionQuery, setOptionQuery] = react.useState("");
  const btnRef = react.useRef(null);
  const active = !!state && ((state.values?.length ?? 0) > 0 || !!state.query?.trim());
  const selected = react.useMemo(() => new Set(state?.values ?? []), [state]);
  const visibleOptions = react.useMemo(() => {
    const q = optionQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.label ?? o.value).toLowerCase().includes(q));
  }, [options, optionQuery]);
  function commit(next) {
    const empty = !(next.values?.length ?? 0) && !next.query?.trim();
    onChange(empty ? void 0 : next);
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        ref: btnRef,
        type: "button",
        onClick: () => setOpen((v) => !v),
        "aria-label": "Filter column",
        className: cx(
          "p-0.5 rounded transition-colors",
          active ? "text-primary" : "text-muted-foreground/50 hover:text-foreground"
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Filter, { className: cx("h-3.5 w-3.5", active && "fill-primary/20") })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(AnchoredPopover, { open, onClose: () => setOpen(false), anchorRef: btnRef, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { className: "absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            autoFocus: true,
            value: state?.query ?? "",
            onChange: (e) => commit({ ...state, query: e.target.value }),
            placeholder: "Contains\u2026",
            className: "w-full rounded-md border border-input bg-background pl-7 pr-2 py-1.5 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
          }
        )
      ] }),
      options.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        options.length > 8 && /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            value: optionQuery,
            onChange: (e) => setOptionQuery(e.target.value),
            placeholder: "Search values\u2026",
            className: "w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "max-h-52 overflow-y-auto space-y-0.5", children: [
          visibleOptions.map((o) => {
            const isOn = selected.has(o.value);
            return /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2 rounded px-1.5 py-1 hover:bg-accent cursor-pointer text-xs", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: isOn,
                  onChange: () => {
                    const values = isOn ? (state?.values ?? []).filter((v) => v !== o.value) : [...state?.values ?? [], o.value];
                    commit({ ...state, values });
                  },
                  className: "h-3.5 w-3.5 rounded border-input"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: o.label ?? (o.value === "" ? "(blank)" : o.value) })
            ] }) }, o.value);
          }),
          visibleOptions.length === 0 && /* @__PURE__ */ jsxRuntime.jsx("li", { className: "px-1.5 py-2 text-xs text-muted-foreground", children: "No values" })
        ] })
      ] }),
      active && /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            onChange(void 0);
            setOptionQuery("");
          },
          className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-3 w-3" }),
            " Clear filter"
          ]
        }
      )
    ] }) })
  ] });
}
function TableFooter({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize,
  shownCount
}) {
  const from = total != null && pageSize != null ? total === 0 ? 0 : (page - 1) * pageSize + 1 : null;
  const to = from != null && pageSize != null ? Math.min(from + shownCount - 1, total ?? from + shownCount - 1) : null;
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "\u2026") pages.push("\u2026");
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border", children: [
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: from != null && to != null && total != null ? `Showing ${from} to ${to} of ${total} entries` : `Page ${page} of ${totalPages}` }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          disabled: page <= 1,
          onClick: () => onPageChange(page - 1),
          "aria-label": "Previous page",
          className: "p-1.5 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronLeft, { className: "h-3.5 w-3.5" })
        }
      ),
      pages.map(
        (p, i) => p === "\u2026" ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "px-1 text-xs text-muted-foreground", children: "\u2026" }, `gap-${i}`) : /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: () => onPageChange(p),
            className: cx(
              "min-w-[28px] rounded-md border px-2 py-1 text-xs font-medium transition-colors",
              p === page ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:text-foreground hover:bg-accent"
            ),
            children: p
          },
          p
        )
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          disabled: page >= totalPages,
          onClick: () => onPageChange(page + 1),
          "aria-label": "Next page",
          className: "p-1.5 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-3.5 w-3.5" })
        }
      )
    ] })
  ] });
}
var ALIGN = { left: "text-left", right: "text-right", center: "text-center" };
var HIDE = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell"
};
function DataTable(props) {
  const {
    columns,
    rows,
    rowKey,
    loading,
    error,
    onRetry,
    selectable,
    isRowSelectable,
    bulkActions = [],
    renderExpanded,
    storageKey,
    gridLines = "both",
    dense,
    pageSizeOptions = [10, 25, 50, 100]
  } = props;
  const [internalSort, setInternalSort] = react.useState(props.defaultSort ?? null);
  const sort = props.sort !== void 0 ? props.sort : internalSort;
  const setSort = react.useCallback(
    (s) => {
      if (props.onSortChange) props.onSortChange(s);
      else setInternalSort(s);
    },
    [props.onSortChange]
  );
  const [internalFilters, setInternalFilters] = react.useState({});
  const filters = props.filters !== void 0 ? props.filters : internalFilters;
  const setColumnFilter = react.useCallback(
    (key, state) => {
      const next = { ...filters };
      if (state) next[key] = state;
      else delete next[key];
      if (props.onFiltersChange) props.onFiltersChange(next);
      else setInternalFilters(next);
    },
    [filters, props.onFiltersChange]
  );
  const [internalSelected, setInternalSelected] = react.useState(/* @__PURE__ */ new Set());
  const selected = props.selected ?? internalSelected;
  const setSelected = react.useCallback(
    (s) => {
      if (props.onSelectedChange) props.onSelectedChange(s);
      else setInternalSelected(s);
    },
    [props.onSelectedChange]
  );
  const [hiddenCols, setHiddenCols] = react.useState(() => loadHiddenColumns(storageKey, columns.map((c) => ({ key: c.key, label: cellText(c.header) || c.key, defaultHidden: c.defaultHidden }))));
  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key));
  const [expanded, setExpanded] = react.useState(/* @__PURE__ */ new Set());
  const accessorOf = react.useCallback(
    (col) => col.accessor ?? ((row) => row[col.key]),
    []
  );
  const processedRows = react.useMemo(() => {
    let out = rows;
    if (!props.onFiltersChange) {
      const active = Object.entries(filters).filter(([, st]) => st && ((st.values?.length ?? 0) > 0 || st.query?.trim()));
      if (active.length > 0) {
        out = out.filter(
          (row) => active.every(([key, st]) => {
            const col = columns.find((c) => c.key === key);
            if (!col) return true;
            const text = cellText(accessorOf(col)(row));
            if (st.values?.length && !st.values.includes(text)) return false;
            if (st.query?.trim() && !text.toLowerCase().includes(st.query.trim().toLowerCase())) return false;
            return true;
          })
        );
      }
    }
    if (!props.onSortChange && sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        const acc = accessorOf(col);
        out = [...out].sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compareValues(acc(a), acc(b)));
      }
    }
    return out;
  }, [rows, filters, sort, columns, props.onFiltersChange, props.onSortChange, accessorOf]);
  const selectableRows = react.useMemo(
    () => selectable ? processedRows.filter((r) => isRowSelectable?.(r) ?? true) : [],
    [processedRows, selectable, isRowSelectable]
  );
  const selectableKeys = selectableRows.map(rowKey);
  const allSelected = selectableKeys.length > 0 && selectableKeys.every((k) => selected.has(k));
  const someSelected = selectableKeys.some((k) => selected.has(k));
  function toggleAll() {
    const next = new Set(selected);
    if (allSelected) selectableKeys.forEach((k) => next.delete(k));
    else selectableKeys.forEach((k) => next.add(k));
    setSelected(next);
  }
  function cycleSort(key) {
    if (sort?.key !== key) setSort({ key, dir: "asc" });
    else if (sort.dir === "asc") setSort({ key, dir: "desc" });
    else setSort(null);
  }
  function funnelOptionsFor(col) {
    if (col.filterOptions) return col.filterOptions;
    const acc = accessorOf(col);
    const seen = /* @__PURE__ */ new Set();
    for (const row of rows) seen.add(cellText(acc(row)));
    return [...seen].sort().map((v) => ({ value: v }));
  }
  async function handleExportCsv() {
    const data = props.onExportAll ? await props.onExportAll() : processedRows;
    exportRowsAsCsv(data, visibleColumns, props.exportFileName ?? "export");
  }
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0);
  const cellPad = dense ? "px-4 py-2.5" : "px-4 py-3";
  const showToolbar = props.onPageSizeChange || props.toolbar || props.toolbarActions || props.showExportCsv || props.onPrint || storageKey;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cx("space-y-3", props.className), children: [
    showToolbar && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      props.onPageSizeChange && /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
        "Show",
        /* @__PURE__ */ jsxRuntime.jsx(
          "select",
          {
            value: props.pageSize,
            onChange: (e) => props.onPageSizeChange?.(Number(e.target.value)),
            className: "rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:ring-1 focus:ring-ring focus:outline-none",
            children: pageSizeOptions.map((n) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: n, children: n }, n))
          }
        ),
        "entries"
      ] }),
      props.toolbar,
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        props.showExportCsv && /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: () => void handleExportCsv(),
            className: "inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileDown, { className: "h-3.5 w-3.5" }),
              " Export CSV"
            ]
          }
        ),
        props.onPrint && /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: props.onPrint,
            className: "inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Printer, { className: "h-3.5 w-3.5" }),
              " Print"
            ]
          }
        ),
        props.toolbarActions,
        storageKey && /* @__PURE__ */ jsxRuntime.jsx(
          ColumnVisibilityButton,
          {
            columns: columns.map((c) => ({ key: c.key, label: cellText(c.header) || c.key, defaultHidden: c.defaultHidden })),
            hidden: hiddenCols,
            onChange: setHiddenCols,
            storageKey
          }
        )
      ] })
    ] }),
    selectable && bulkActions.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(BulkActionBar, { selectedKeys: [...selected], actions: bulkActions, onClear: () => setSelected(/* @__PURE__ */ new Set()) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "overflow-x-auto rounded-lg border border-border", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsxs("tr", { className: cx("border-b border-border bg-muted/40", gridLines === "both" && "divide-x divide-border/50"), children: [
          selectable && /* @__PURE__ */ jsxRuntime.jsx("th", { className: cx(cellPad, "w-10"), children: /* @__PURE__ */ jsxRuntime.jsx(
            Checkbox,
            {
              checked: allSelected,
              indeterminate: !allSelected && someSelected,
              onChange: toggleAll,
              "aria-label": "Select all rows"
            }
          ) }),
          renderExpanded && /* @__PURE__ */ jsxRuntime.jsx("th", { className: cx(cellPad, "w-8") }),
          visibleColumns.map((col) => /* @__PURE__ */ jsxRuntime.jsx(
            "th",
            {
              className: cx(
                cellPad,
                "font-medium text-muted-foreground whitespace-nowrap",
                ALIGN[col.align ?? "left"],
                col.hideBelow && HIDE[col.hideBelow],
                col.headerClassName
              ),
              children: /* @__PURE__ */ jsxRuntime.jsxs("span", { className: cx("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse"), children: [
                col.header,
                col.sortable && /* @__PURE__ */ jsxRuntime.jsx(SortButton, { dir: sort?.key === col.key ? sort.dir : null, onCycle: () => cycleSort(col.key) }),
                col.filterable && /* @__PURE__ */ jsxRuntime.jsx(
                  FunnelFilter,
                  {
                    options: funnelOptionsFor(col),
                    state: filters[col.key],
                    onChange: (st) => setColumnFilter(col.key, st)
                  }
                )
              ] })
            },
            col.key
          ))
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx("tbody", { className: "divide-y divide-border/70", children: loading ? /* @__PURE__ */ jsxRuntime.jsx("tr", { children: /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan, className: "px-6 py-12 text-center text-muted-foreground", children: "Loading\u2026" }) }) : error ? /* @__PURE__ */ jsxRuntime.jsx("tr", { children: /* @__PURE__ */ jsxRuntime.jsxs("td", { colSpan, className: "px-6 py-12 text-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "h-10 w-10 mx-auto text-destructive/60 mb-3" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground", children: "Couldn't load data" }),
          onRetry && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: onRetry,
              className: "mt-3 rounded-lg border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors",
              children: "Retry"
            }
          )
        ] }) }) : processedRows.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("tr", { children: /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan, className: "px-6 py-12 text-center", children: props.emptyState ?? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Inbox, { className: "h-10 w-10 mx-auto text-muted-foreground/50 mb-3" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground", children: props.emptyText ?? "No records found" })
        ] }) }) }) : processedRows.map((row, i) => {
          const key = rowKey(row);
          const isExpanded = expanded.has(key);
          const canSelect = isRowSelectable?.(row) ?? true;
          return /* @__PURE__ */ jsxRuntime.jsxs(FragmentRow, { children: [
            /* @__PURE__ */ jsxRuntime.jsxs(
              "tr",
              {
                className: cx(
                  "hover:bg-accent/30 transition-colors",
                  gridLines === "both" && "divide-x divide-border/50",
                  selected.has(key) && "bg-primary/5",
                  props.onRowClick && "cursor-pointer",
                  props.rowClassName?.(row)
                ),
                onClick: props.onRowClick ? () => props.onRowClick?.(row) : void 0,
                children: [
                  selectable && /* @__PURE__ */ jsxRuntime.jsx("td", { className: cellPad, children: canSelect && /* @__PURE__ */ jsxRuntime.jsx(
                    Checkbox,
                    {
                      checked: selected.has(key),
                      onChange: () => {
                        const next = new Set(selected);
                        if (next.has(key)) next.delete(key);
                        else next.add(key);
                        setSelected(next);
                      }
                    }
                  ) }),
                  renderExpanded && /* @__PURE__ */ jsxRuntime.jsx("td", { className: cellPad, children: /* @__PURE__ */ jsxRuntime.jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": isExpanded ? "Collapse row" : "Expand row",
                      onClick: (e) => {
                        e.stopPropagation();
                        const next = new Set(expanded);
                        if (next.has(key)) next.delete(key);
                        else next.add(key);
                        setExpanded(next);
                      },
                      className: "p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                      children: isExpanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4" })
                    }
                  ) }),
                  visibleColumns.map((col) => /* @__PURE__ */ jsxRuntime.jsx(
                    "td",
                    {
                      className: cx(
                        cellPad,
                        ALIGN[col.align ?? "left"],
                        col.hideBelow && HIDE[col.hideBelow],
                        col.cellClassName
                      ),
                      children: col.render ? col.render(row, i) : cellText(accessorOf(col)(row)) || "\u2014"
                    },
                    col.key
                  ))
                ]
              }
            ),
            isExpanded && renderExpanded && /* @__PURE__ */ jsxRuntime.jsx("tr", { className: "bg-muted/20", children: /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan, className: "px-6 py-3", children: renderExpanded(row) }) })
          ] }, key);
        }) })
      ] }),
      props.page != null && props.totalPages != null && props.onPageChange && !loading && processedRows.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(
        TableFooter,
        {
          page: props.page,
          totalPages: props.totalPages,
          onPageChange: props.onPageChange,
          total: props.total,
          pageSize: props.pageSize,
          shownCount: processedRows.length
        }
      )
    ] })
  ] });
}
function FragmentRow({ children }) {
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children });
}

exports.AnchoredPopover = AnchoredPopover;
exports.BulkActionBar = BulkActionBar;
exports.Checkbox = Checkbox;
exports.ColumnVisibilityButton = ColumnVisibilityButton;
exports.DataTable = DataTable;
exports.FunnelFilter = FunnelFilter;
exports.SortButton = SortButton;
exports.TableFooter = TableFooter;
exports.cellText = cellText;
exports.compareValues = compareValues;
exports.exportRowsAsCsv = exportRowsAsCsv;
exports.loadHiddenColumns = loadHiddenColumns;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map