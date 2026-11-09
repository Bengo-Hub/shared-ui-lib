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

export { CURRENCY_META, SUPPORTED_CURRENCIES, decimalPlacesFor, formatCompactCurrency, formatCurrency };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map