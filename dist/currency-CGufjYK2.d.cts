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
/** Normalises a currency code: trimmed, upper case, empty when it is not three letters. */
declare function normalizeCurrency(code: string | null | undefined): string;
/**
 * Reads a typed amount. Grouping commas, spaces, underscores and a leading currency code or
 * symbol are ignored ("KES 5,000", "5 000", "$12.50"). Returns null for empty or unreadable text
 * and for negative amounts, which no budget or price field accepts.
 */
declare function parseMoneyInput(text: string | null | undefined): number | null;
/** Rounds an amount to the decimal places its currency uses (0 for UGX, 2 for KES). */
declare function roundMoney(amount: number, currency: string): number;
/**
 * The amount grouped for an input field, without the currency: "5,000" or "12.50". Whole amounts
 * drop their zero decimals so a typed 5000 reads back as "5,000", not "5,000.00".
 */
declare function formatMoneyInputValue(amount: number | null | undefined, currency: string): string;
/**
 * The amount with its currency code, for prose, prompts and notes: "KES 5,000", "USD 12.50".
 * The code (not a symbol) is used so text sent to a person or an assistant is never ambiguous
 * ("$" is several currencies, "Ksh" and "KES" are the same one).
 */
declare function formatMoneyText(amount: number | null | undefined, currency: string): string;

export { CURRENCY_META as C, SUPPORTED_CURRENCIES as S, type CurrencyMeta as a, formatCurrency as b, formatMoneyInputValue as c, decimalPlacesFor as d, formatMoneyText as e, formatCompactCurrency as f, normalizeCurrency as n, parseMoneyInput as p, roundMoney as r };
