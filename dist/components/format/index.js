import { useSyncExternalStore } from 'react';

// src/components/payments/currency.ts
var CURRENCY_META = {
  KES: { code: "KES", name: "Kenyan Shilling", symbol: "Ksh", decimalPlaces: 2 },
  USD: { code: "USD", name: "US Dollar", symbol: "$", decimalPlaces: 2 },
  EUR: { code: "EUR", name: "Euro", symbol: "\u20AC", decimalPlaces: 2 },
  GBP: { code: "GBP", name: "British Pound", symbol: "\xA3", decimalPlaces: 2 },
  UGX: { code: "UGX", name: "Ugandan Shilling", symbol: "USh", decimalPlaces: 0 },
  TZS: { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", decimalPlaces: 2 },
  ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", decimalPlaces: 2 },
  NGN: { code: "NGN", name: "Nigerian Naira", symbol: "\u20A6", decimalPlaces: 2 },
  GHS: { code: "GHS", name: "Ghanaian Cedi", symbol: "GH\u20B5", decimalPlaces: 2 },
  RWF: { code: "RWF", name: "Rwandan Franc", symbol: "FRw", decimalPlaces: 0 },
  ETB: { code: "ETB", name: "Ethiopian Birr", symbol: "Br", decimalPlaces: 2 },
  EGP: { code: "EGP", name: "Egyptian Pound", symbol: "E\xA3", decimalPlaces: 2 },
  INR: { code: "INR", name: "Indian Rupee", symbol: "\u20B9", decimalPlaces: 2 },
  CNY: { code: "CNY", name: "Chinese Yuan", symbol: "\xA5", decimalPlaces: 2 },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "\xA5", decimalPlaces: 0 },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", decimalPlaces: 2 },
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", decimalPlaces: 2 },
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimalPlaces: 2 },
  AED: { code: "AED", name: "UAE Dirham", symbol: "\u062F.\u0625", decimalPlaces: 2 },
  SAR: { code: "SAR", name: "Saudi Riyal", symbol: "\uFDFC", decimalPlaces: 2 }
};
var SUPPORTED_CURRENCIES = Object.keys(CURRENCY_META);
function decimalPlacesFor(currency) {
  return CURRENCY_META[currency]?.decimalPlaces ?? 2;
}
function formatCurrency(amount, currency = "KES") {
  const dp = decimalPlacesFor(currency);
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      minimumFractionDigits: dp,
      maximumFractionDigits: dp
    }).format(Number(amount ?? 0));
  } catch {
    const meta = CURRENCY_META[currency];
    const n = Number(amount ?? 0);
    return `${meta?.symbol ?? currency} ${n.toLocaleString(void 0, { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
  }
}
function formatCompactCurrency(amount, currency = "KES") {
  const n = Number(amount) || 0;
  const abs = Math.abs(n);
  if (abs < 1e3) return formatCurrency(n, currency);
  const units = [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];
  for (const [div, suffix] of units) {
    if (abs >= div) {
      const v = n / div;
      const truncated = Math.trunc(v * 10) / 10;
      const s = truncated.toFixed(1).replace(/\.0$/, "");
      return `${currency} ${s}${suffix}`;
    }
  }
  return formatCurrency(n, currency);
}

// src/components/format/timezone.ts
var DEFAULT_TIME_ZONE = "Africa/Nairobi";
var validity = /* @__PURE__ */ new Map();
function isValidTimeZone(zone) {
  if (typeof zone !== "string" || zone.trim() === "") return false;
  const cached = validity.get(zone);
  if (cached !== void 0) return cached;
  let ok = true;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
  } catch {
    ok = false;
  }
  validity.set(zone, ok);
  return ok;
}
function resolveTimeZone(user, tenant) {
  const candidates = [user?.profile?.timezone, user?.timezone, tenant?.timezone];
  for (const zone of candidates) {
    const trimmed = typeof zone === "string" ? zone.trim() : zone;
    if (isValidTimeZone(trimmed)) return trimmed;
  }
  return DEFAULT_TIME_ZONE;
}
var STORE_KEY = /* @__PURE__ */ Symbol.for("@bengo-hub/shared-ui-lib/time-zone");
function store() {
  const g = globalThis;
  let s = g[STORE_KEY];
  if (!s) {
    s = { zone: DEFAULT_TIME_ZONE, listeners: /* @__PURE__ */ new Set() };
    g[STORE_KEY] = s;
  }
  return s;
}
function getActiveTimeZone() {
  return store().zone;
}
function setActiveTimeZone(zone) {
  const s = store();
  const next = isValidTimeZone(zone) ? zone : DEFAULT_TIME_ZONE;
  if (next !== s.zone) {
    s.zone = next;
    s.listeners.forEach((fn) => fn());
  }
  return next;
}
function applyUserTimeZone(user, tenant) {
  return setActiveTimeZone(resolveTimeZone(user, tenant));
}
function subscribeTimeZone(listener) {
  const s = store();
  s.listeners.add(listener);
  return () => {
    s.listeners.delete(listener);
  };
}
function toDate(value) {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function isCalendarDay(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
var formatters = /* @__PURE__ */ new Map();
function formatter(locale, opts) {
  const key = `${locale}|${JSON.stringify(opts)}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, opts);
    formatters.set(key, f);
  }
  return f;
}
var DATE_PARTS = { day: "2-digit", month: "short", year: "numeric" };
var TIME_PARTS = { hour: "2-digit", minute: "2-digit", hour12: false };
var PART_KEYS = [
  "dateStyle",
  "timeStyle",
  "weekday",
  "era",
  "year",
  "month",
  "day",
  "dayPeriod",
  "hour",
  "minute",
  "second",
  "fractionalSecondDigits",
  "timeZoneName"
];
function format(value, timeZone, defaults, options = {}) {
  const { locale = "en-KE", fallback = "", ...intl } = options;
  const date = toDate(value);
  if (!date) return typeof value === "string" && value !== "" ? value : fallback;
  const zone = isCalendarDay(value) ? "UTC" : isValidTimeZone(timeZone) ? timeZone : getActiveTimeZone();
  const named = intl;
  const base = PART_KEYS.some((k) => named[k] !== void 0) ? {} : defaults;
  return formatter(locale, { ...base, ...intl, timeZone: zone }).format(date);
}
function formatDate(value, timeZone, options) {
  return format(value, timeZone, DATE_PARTS, options);
}
function formatDateTime(value, timeZone, options) {
  return format(value, timeZone, { ...DATE_PARTS, ...TIME_PARTS }, options);
}
function formatTime(value, timeZone, options) {
  return format(value, timeZone, TIME_PARTS, options);
}
function useUserTimeZone(user, tenant) {
  const active = useSyncExternalStore(subscribeTimeZone, getActiveTimeZone, () => DEFAULT_TIME_ZONE);
  if (user === void 0 && tenant === void 0) return active;
  return resolveTimeZone(user, tenant);
}

export { CURRENCY_META, DEFAULT_TIME_ZONE, SUPPORTED_CURRENCIES, applyUserTimeZone, decimalPlacesFor, formatCompactCurrency, formatCurrency, formatDate, formatDateTime, formatTime, getActiveTimeZone, isValidTimeZone, resolveTimeZone, setActiveTimeZone, subscribeTimeZone, useUserTimeZone };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map