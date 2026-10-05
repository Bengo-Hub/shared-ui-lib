export { A as AIRTEL_MONEY, a as AccountForm, b as AccountFormBankOption, c as AccountFormProps, d as AccountFormValue, e as AccountType, f as AirtelMoneyLogo, B as BANK, g as BANK_TRANSFER, C as CARD, h as CARD_MANUAL, i as CASH, j as CHEQUE, k as CURRENCY_META, l as CUSTOMER_ADVANCE, m as CardMark, n as CashMark, o as CurrencyChangeConfirmModal, p as CurrencyChangeConfirmModalProps, q as CurrencyChangeExampleRow, r as CurrencyMeta, E as EMPTY_ACCOUNT_FORM, M as MPESA_B2B, s as MPESA_B2C, t as MPESA_MANUAL, u as MPESA_STK, v as MTN_MOMO, w as MpesaLogo, x as MtnMomoLogo, P as PAYMENT_METHOD_LABELS, y as PAYOUT_METHODS, z as PAYSTACK, D as PAY_SUPPLIER_METHODS, F as PayHeroLogo, G as PaymentResult, H as PaystackLogo, I as PaystackLogoProps, R as RECEIVE_METHODS, S as SETTLE_CREDIT_SALE_METHODS, J as STORE_CREDIT, K as SUPPORTED_CURRENCIES, L as SettlementMethod, N as SettlementModal, O as SettlementModalProps, Q as SettlementMode, T as SettlementSubmitInput, U as SplitPayMark, V as TreasuryPaymentModal, W as TreasuryPaymentModalProps, $ as datetimeLocalToISO, X as formatCompactCurrency, Y as formatCurrency, Z as getPaymentMethodLabel, _ as isAccountFormValid, a0 as nowDatetimeLocal } from '../../account-form-CSrk6A3f.js';
import 'react';
import 'react/jsx-runtime';

/**
 * The ONE "which real account should this payment default to" resolver, shared by every
 * receive/pay/settle modal across treasury-ui and pos-ui. Mirrors treasury-api's own
 * `ledger.ResolveCashCode` tier-2 precedence client-side (method match, outlet-scoped preferred
 * over tenant-wide) purely against the account list the caller already has from `useBankAccounts`
 * — no extra request. Falls back to the first active cash-type account when no method is given or
 * nothing matches, the same convention `MarkExpensePaidModal`/pos-ui's `add-expense-modal`
 * independently duplicated before this existed.
 *
 * A pre-selected default is never a lock-in — every caller still renders a normal, editable
 * account picker; this only decides what shows up already selected.
 */
interface DefaultAccountCandidate {
    id: string;
    is_active?: boolean;
    account_type?: string;
    default_payment_methods?: string[] | null;
    outlet_id?: string | null;
}
declare function resolveDefaultAccount<T extends DefaultAccountCandidate>(accounts: T[] | undefined | null, method?: string | null, outletId?: string | null): T | undefined;

export { type DefaultAccountCandidate, resolveDefaultAccount };
