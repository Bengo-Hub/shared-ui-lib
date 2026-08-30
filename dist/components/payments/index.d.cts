export { A as AIRTEL_MONEY, a as AccountForm, b as AccountFormBankOption, c as AccountFormProps, d as AccountFormValue, e as AccountType, B as BANK, f as BANK_TRANSFER, C as CARD, g as CARD_MANUAL, h as CASH, i as CHEQUE, j as CURRENCY_META, k as CUSTOMER_ADVANCE, l as CurrencyChangeConfirmModal, m as CurrencyChangeConfirmModalProps, n as CurrencyChangeExampleRow, o as CurrencyMeta, E as EMPTY_ACCOUNT_FORM, M as MPESA_B2B, p as MPESA_B2C, q as MPESA_MANUAL, r as MPESA_STK, s as MTN_MOMO, P as PAYMENT_METHOD_LABELS, t as PAYOUT_METHODS, u as PAYSTACK, v as PAY_SUPPLIER_METHODS, w as PaymentResult, R as RECEIVE_METHODS, S as SETTLE_CREDIT_SALE_METHODS, x as STORE_CREDIT, y as SUPPORTED_CURRENCIES, z as SettlementMethod, D as SettlementModal, F as SettlementModalProps, G as SettlementMode, H as SettlementSubmitInput, T as TreasuryPaymentModal, I as TreasuryPaymentModalProps, O as datetimeLocalToISO, J as formatCompactCurrency, K as formatCurrency, L as getPaymentMethodLabel, N as isAccountFormValid, Q as nowDatetimeLocal } from '../../account-form-DYSPnUJR.cjs';
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
