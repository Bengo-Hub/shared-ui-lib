/**
 * `@bengo-hub/shared-ui-lib/format`: money and date formatting with nothing else attached.
 * Dates show in the signed-in user's time zone (see timezone.ts).
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
export {
  DEFAULT_TIME_ZONE,
  isValidTimeZone,
  resolveTimeZone,
  getActiveTimeZone,
  setActiveTimeZone,
  applyUserTimeZone,
  subscribeTimeZone,
  formatDate,
  formatDateTime,
  formatTime,
  type TimeZoneUser,
  type TimeZoneTenant,
  type DateInput,
  type DateFormatOptions,
} from './timezone';
export { useUserTimeZone } from './use-user-time-zone';
