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
interface CurrencyMeta {
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
}
declare const CURRENCY_META: Record<string, CurrencyMeta>;
/** Ordered currency codes — replaces the 3 independently-drifted lists. */
declare const SUPPORTED_CURRENCIES: ReadonlyArray<string>;
declare function decimalPlacesFor(currency: string): number;
/**
 * Format a money amount for the given ISO 4217 currency code. Decimal places are looked up per
 * currency (0 for UGX/RWF/JPY, 2 otherwise) instead of being hardcoded — the real bug this
 * centralisation fixes. Falls back to 'KES' when no currency is supplied, matching prior behavior.
 */
declare function formatCurrency(amount: number | string | null | undefined, currency?: string): string;
/**
 * Compact currency — abbreviates large amounts to K / M / B / T so KPI tiles never truncate a
 * long figure (e.g. "KES 1,525,854.00" -> "KES 1.5M"). Ported from treasury-ui's version; now
 * decimal-place aware via formatCurrency for the under-1000 case.
 */
declare function formatCompactCurrency(amount: number | string | null | undefined, currency?: string): string;

export { CURRENCY_META as C, SUPPORTED_CURRENCIES as S, type CurrencyMeta as a, formatCurrency as b, decimalPlacesFor as d, formatCompactCurrency as f };
