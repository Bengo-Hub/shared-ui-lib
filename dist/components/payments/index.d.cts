export { A as AIRTEL_MONEY, a as AccountForm, b as AccountFormBankOption, c as AccountFormProps, d as AccountFormValue, e as AccountType, f as AirtelMoneyLogo, B as BANK, g as BANK_TRANSFER, C as CARD, h as CARD_MANUAL, i as CASH, j as CHEQUE, k as CURRENCY_META, l as CUSTOMER_ADVANCE, m as CurrencyChangeConfirmModal, n as CurrencyChangeConfirmModalProps, o as CurrencyChangeExampleRow, p as CurrencyMeta, E as EMPTY_ACCOUNT_FORM, M as MPESA_B2B, q as MPESA_B2C, r as MPESA_MANUAL, s as MPESA_STK, t as MTN_MOMO, u as MpesaLogo, v as MtnMomoLogo, P as PAYMENT_METHOD_LABELS, w as PAYOUT_METHODS, x as PAYSTACK, y as PAY_SUPPLIER_METHODS, z as PayHeroLogo, D as PaymentResult, F as PaystackLogo, G as PaystackLogoProps, R as RECEIVE_METHODS, S as SETTLE_CREDIT_SALE_METHODS, H as STORE_CREDIT, I as SUPPORTED_CURRENCIES, J as SettlementMethod, K as SettlementModal, L as SettlementModalProps, N as SettlementMode, O as SettlementSubmitInput, T as TreasuryPaymentModal, Q as TreasuryPaymentModalProps, Y as datetimeLocalToISO, U as formatCompactCurrency, V as formatCurrency, W as getPaymentMethodLabel, X as isAccountFormValid, Z as nowDatetimeLocal } from '../../account-form-BBdC5cGo.cjs';
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
