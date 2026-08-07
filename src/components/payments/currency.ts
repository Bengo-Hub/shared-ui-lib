/**
 * The ONE currency registry + money formatter shared by every frontend (pos-ui, treasury-ui,
 * ordering-frontend, subscriptions UI). Centralised because pos-ui's `lib/utils.ts` and
 * treasury-ui's `lib/utils/currency.ts` had drifted into two independent copies — plus a THIRD
 * hardcoded `<select>` option list in pos-ui's GeneralTab — and all three forced
 * `minimumFractionDigits: 2` / `maximumFractionDigits: 2`, which is WRONG for zero-decimal
 * currencies (UGX, RWF, JPY render as "USh 1,000.00" instead of "USh 1,000"). This list mirrors
 * treasury-api's `internal/modules/currency.SupportedCurrencies()` Go list field-for-field — keep
 * the two in sync when adding a currency.
 */
export interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export const CURRENCY_META: Record<string, CurrencyMeta> = {
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'Ksh', decimalPlaces: 2 },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
  UGX: { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimalPlaces: 0 },
  TZS: { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimalPlaces: 2 },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalPlaces: 2 },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimalPlaces: 2 },
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', decimalPlaces: 2 },
  RWF: { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', decimalPlaces: 0 },
  ETB: { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', decimalPlaces: 2 },
  EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimalPlaces: 2 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimalPlaces: 2 },
};

/** Ordered currency codes — replaces the 3 independently-drifted lists. */
export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_META) as ReadonlyArray<string>;

function decimalPlacesFor(currency: string): number {
  return CURRENCY_META[currency]?.decimalPlaces ?? 2;
}

/**
 * Format a money amount for the given ISO 4217 currency code. Decimal places are looked up per
 * currency (0 for UGX/RWF/JPY, 2 otherwise) instead of being hardcoded — the real bug this
 * centralisation fixes. Falls back to 'KES' when no currency is supplied, matching prior behavior.
 */
export function formatCurrency(amount: number | string | null | undefined, currency = 'KES'): string {
  const dp = decimalPlacesFor(currency);
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    }).format(Number(amount ?? 0));
  } catch {
    // Intl throws on a currency code it doesn't recognize (e.g. a not-yet-ISO code) — fall back
    // to a plain symbol-prefixed string rather than crashing the render.
    const meta = CURRENCY_META[currency];
    const n = Number(amount ?? 0);
    return `${meta?.symbol ?? currency} ${n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
  }
}

/**
 * Compact currency — abbreviates large amounts to K / M / B / T so KPI tiles never truncate a
 * long figure (e.g. "KES 1,525,854.00" -> "KES 1.5M"). Ported from treasury-ui's version; now
 * decimal-place aware via formatCurrency for the under-1000 case.
 */
export function formatCompactCurrency(amount: number | string | null | undefined, currency = 'KES'): string {
  const n = Number(amount) || 0;
  const abs = Math.abs(n);
  if (abs < 1000) return formatCurrency(n, currency);
  const units: [number, string][] = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
  for (const [div, suffix] of units) {
    if (abs >= div) {
      const v = n / div;
      const truncated = Math.trunc(v * 10) / 10;
      const s = truncated.toFixed(1).replace(/\.0$/, '');
      return `${currency} ${s}${suffix}`;
    }
  }
  return formatCurrency(n, currency);
}
