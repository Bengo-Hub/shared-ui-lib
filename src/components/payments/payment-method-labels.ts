/**
 * The ONE payment-method label registry shared by every list/report surface that shows how a
 * customer paid or how a tenant was paid (pos-ui sales list, treasury-ui transactions list,
 * receipts, exports). Previously pos-ui (`sales-shared.tsx`) and treasury-ui each kept their own
 * dictionary; centralising here also lets new methods (MTN, Airtel, bank transfer/Equity) read
 * correctly everywhere the moment they're added, instead of needing a per-surface edit.
 */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  card_manual: 'Card / PDQ',
  pdq: 'Card / PDQ',
  card_terminal: 'Card / PDQ',
  cheque: 'Cheque',
  bank_transfer: 'Bank Transfer',
  bank: 'Bank Transfer',
  mpesa: 'M-Pesa',
  mpesa_stk: 'M-Pesa (STK Push)',
  mpesa_manual: 'M-Pesa (Code)',
  mpesa_b2c: 'M-Pesa (sent to customer)',
  mpesa_b2b: 'M-Pesa (sent to supplier)',
  // Legacy alias: rows captured before 2026-07-13 stored the M-Pesa-Code tender as bare
  // "manual" (backfilled server-side, but keep the label so any straggler still reads right).
  manual: 'M-Pesa (Code)',
  paystack: 'Paystack',
  wallet: 'Wallet',
  cod: 'Cash on Delivery',
  mtn_momo: 'MTN Mobile Money',
  airtel_money: 'Airtel Money',
  store_credit: 'Store Credit',
  customer_advance: 'Customer Advance',
  on_account: 'On Account',
  room_charge: 'Room Charge',
  complimentary: 'Complimentary',
  insurance: 'Insurance',
  loyalty: 'Loyalty Points',
};

/**
 * Resolve a display label for a payment method. When `providerName` is supplied (the tenant's
 * configured gateway/account name, e.g. "Equity Bank Uganda" or "Urban Loft Till"), it's appended
 * in parens so a generic method like `bank_transfer` or `mpesa_manual` reads as e.g.
 * "Bank Transfer (Equity Bank Uganda)" — lets a tenant trace exactly which account/provider a
 * transaction moved through, not just the generic method bucket.
 */
export function getPaymentMethodLabel(method: string | null | undefined, providerName?: string | null): string {
  if (!method) return '—';
  const base = method === 'multiple'
    ? 'Multiple'
    : PAYMENT_METHOD_LABELS[method] ?? method.replace(/_/g, ' ');
  return providerName ? `${base} (${providerName})` : base;
}
