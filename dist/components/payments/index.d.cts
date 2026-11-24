export { A as AIRTEL_MONEY, a as AIRTEL_MONEY_MANUAL, b as AccountForm, c as AccountFormBankOption, d as AccountFormProps, e as AccountFormValue, f as AccountType, g as AirtelMoneyLogo, B as BANK, h as BANK_TRANSFER, C as CARD, i as CARD_MANUAL, j as CASH, k as CHEQUE, l as CUSTOMER_ADVANCE, m as CardMark, n as CashMark, o as CurrencyChangeConfirmModal, p as CurrencyChangeConfirmModalProps, q as CurrencyChangeExampleRow, E as EMPTY_ACCOUNT_FORM, M as MPESA_B2B, r as MPESA_B2C, s as MPESA_MANUAL, t as MPESA_STK, u as MTN_MOMO, v as MTN_MOMO_MANUAL, w as MastercardLogo, x as MoneyInput, y as MoneyInputProps, z as MpesaLogo, D as MtnMomoLogo, O as OTHER_MANUAL, P as PAYMENT_METHOD_LABELS, F as PAYOUT_METHODS, G as PAYSTACK, H as PAY_SUPPLIER_METHODS, I as PayHeroLogo, J as PaymentResult, K as PaystackLogo, L as PaystackLogoProps, R as RECEIVE_METHODS, S as SETTLE_CREDIT_SALE_METHODS, N as STORE_CREDIT, Q as SettlementMethod, T as SettlementModal, U as SettlementModalProps, V as SettlementMode, W as SettlementSubmitInput, X as SplitPayMark, Y as TreasuryPaymentModal, Z as TreasuryPaymentModalProps, _ as UsableSettlementMethods, $ as VisaLogo, a0 as WhatsAppLogo, a1 as datetimeLocalToISO, a2 as getPaymentMethodLabel, a3 as isAccountFormValid, a4 as nowDatetimeLocal, a5 as usableSettlementMethods } from '../../account-form-BwvCyVwU.cjs';
export { C as CURRENCY_META, a as CurrencyMeta, S as SUPPORTED_CURRENCIES, d as decimalPlacesFor, f as formatCompactCurrency, b as formatCurrency, c as formatMoneyInputValue, e as formatMoneyText, n as normalizeCurrency, p as parseMoneyInput, r as roundMoney } from '../../currency-CGufjYK2.cjs';
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
    default_invoice_types?: string[] | null;
    outlet_id?: string | null;
    created_at?: string | null;
}
/**
 * The same rule as treasury-api's ledger.pickDefaultAccount, so the account a payment dialog
 * pre-selects is the account the books would use: among accounts defaulting to the method, one
 * scoped to the outlet beats a tenant-wide one (another outlet's never counts), then one that
 * also defaults to the invoice type wins, then the oldest. Two accounts defaulting to the same
 * method used to resolve differently here and in the books (INV-260928-000030, 2026-10-05).
 */
declare function resolveDefaultAccount<T extends DefaultAccountCandidate>(accounts: T[] | undefined | null, method?: string | null, outletId?: string | null, invoiceType?: string | null): T | undefined;

export { type DefaultAccountCandidate, resolveDefaultAccount };
