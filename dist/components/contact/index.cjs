'use strict';

var react = require('react');
var PhoneInput = require('react-phone-number-input');
var jsxRuntime = require('react/jsx-runtime');
var lucideReact = require('lucide-react');
var flags = require('react-phone-number-input/flags');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var PhoneInput__default = /*#__PURE__*/_interopDefault(PhoneInput);
var flags__default = /*#__PURE__*/_interopDefault(flags);

// src/components/contact/phone-input.tsx
function PhoneInputField({
  value,
  onChange,
  placeholder = "e.g. 743 793 901",
  disabled,
  className,
  defaultCountry = "KE",
  id
}) {
  const [displayValue, setDisplayValue] = react.useState(() => {
    if (value && !value.startsWith("+")) {
      try {
        const parsed = PhoneInput.parsePhoneNumber(value, defaultCountry);
        if (parsed?.isValid()) return parsed.number;
      } catch {
      }
    }
    return value;
  });
  react.useEffect(() => {
    if (displayValue && displayValue !== value) {
      onChange(displayValue);
    }
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsx(
    PhoneInput__default.default,
    {
      id,
      international: true,
      defaultCountry,
      value: displayValue,
      onChange: (v) => {
        setDisplayValue(v);
        onChange(v ?? "");
      },
      placeholder,
      disabled,
      className
    }
  );
}
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
  const [open, setOpen] = react.useState(false);
  const [query, setQuery] = react.useState("");
  const [remoteResults, setRemoteResults] = react.useState([]);
  const [remoteLoading, setRemoteLoading] = react.useState(false);
  const ref = react.useRef(null);
  const debounceRef = react.useRef(null);
  const requestSeq = react.useRef(0);
  const [selectedCache, setSelectedCache] = react.useState(void 0);
  const selected = options.find((o) => o.value === value) ?? (selectedCache && selectedCache.value === value ? selectedCache : void 0) ?? (value && valueLabel ? { value, label: valueLabel } : void 0);
  const localMatches = react.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint ?? "").toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);
  react.useEffect(() => {
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
  const merged = react.useMemo(() => {
    if (remoteResults.length === 0) return localMatches;
    const seen = new Set(localMatches.map((o) => o.value));
    return [...localMatches, ...remoteResults.filter((o) => !seen.has(o.value))];
  }, [localMatches, remoteResults]);
  const close = react.useCallback(() => {
    setOpen(false);
    setQuery("");
    setRemoteResults([]);
  }, []);
  react.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { ref, className: cx("relative", className), children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => open ? close() : setOpen(true),
        className: "flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: cx("flex min-w-0 items-center gap-2 text-left", !selected && "text-muted-foreground"), children: [
            selected?.icon,
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: selected ? selected.label : placeholder })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center gap-1", children: [
            clearable && selected && !disabled && /* @__PURE__ */ jsxRuntime.jsx(
              lucideReact.X,
              {
                className: "h-4 w-4 text-muted-foreground hover:text-foreground",
                onClick: (e) => {
                  e.stopPropagation();
                  setSelectedCache(void 0);
                  onChange("", void 0);
                }
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronsUpDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
          ] })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            autoFocus: true,
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: searchPlaceholder,
            className: "w-full bg-transparent text-sm text-foreground focus:outline-none"
          }
        ),
        busy && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "h-4 w-4 shrink-0 animate-spin text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "max-h-60 overflow-y-auto py-1", children: [
        merged.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("li", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: busy ? "Searching\u2026" : emptyText }) : merged.map((o) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: () => select(o),
            className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60",
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
                o.icon,
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-baseline gap-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate text-foreground", children: o.label }),
                    o.hint && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: o.hint })
                  ] }),
                  o.description && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block truncate text-xs text-muted-foreground", children: o.description })
                ] })
              ] }),
              o.value === value && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-4 w-4 shrink-0 text-primary" })
            ]
          }
        ) }, o.value)),
        hasMore && onLoadMore && /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: onLoadMore,
            className: "w-full px-3 py-2 text-center text-xs font-medium text-primary hover:bg-muted/60",
            children: "Load more\u2026"
          }
        ) })
      ] }),
      footer && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-border p-1", children: footer })
    ] })
  ] });
}
var regionNames;
function countryName(iso) {
  if (regionNames === void 0) {
    try {
      regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      regionNames = null;
    }
  }
  return regionNames?.of(iso) ?? iso;
}
function listCountries() {
  return PhoneInput.getCountries().map((code) => ({ code, name: countryName(code) })).sort((a, b) => a.name.localeCompare(b.name));
}
function FlagIcon({ code, className }) {
  const Flag = flags__default.default[code];
  return /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      className: className ?? "inline-flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[2px] ring-1 ring-black/10",
      children: Flag ? /* @__PURE__ */ jsxRuntime.jsx(Flag, { title: code }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "h-full w-full bg-muted" })
    }
  );
}
function CountrySelect({
  value,
  onChange,
  placeholder = "Select a country\u2026",
  searchPlaceholder = "Search countries\u2026",
  disabled,
  className
}) {
  const options = react.useMemo(
    () => listCountries().map((c) => ({ value: c.code, label: c.name, icon: /* @__PURE__ */ jsxRuntime.jsx(FlagIcon, { code: c.code }) })),
    []
  );
  const isKnown = value ? options.some((o) => o.value === value) : false;
  return /* @__PURE__ */ jsxRuntime.jsx(
    SearchableCombobox,
    {
      options,
      value,
      onChange,
      valueLabel: value && !isKnown ? value : void 0,
      placeholder,
      searchPlaceholder,
      emptyText: "No countries match",
      disabled,
      clearable: false,
      className
    }
  );
}

exports.CountrySelect = CountrySelect;
exports.FlagIcon = FlagIcon;
exports.PhoneInputField = PhoneInputField;
exports.countryName = countryName;
exports.listCountries = listCountries;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map