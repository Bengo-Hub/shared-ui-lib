/**
 * `@bengo-hub/shared-ui-lib/format`: money formatting with nothing else attached.
 *
 * The same functions as `/payments`, but importing them from here never pulls the payment
 * modal or its UI into a page. Use this entry on light pages (public, guest, first-load
 * budgets) that only need to print an amount.
 */
export {
  CURRENCY_META,
  SUPPORTED_CURRENCIES,
  decimalPlacesFor,
  formatCurrency,
  formatCompactCurrency,
  type CurrencyMeta,
} from '../payments/currency';
