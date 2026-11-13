import * as react from 'react';
import { CSSProperties } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface PaymentResult {
    intentId: string;
    amount: number;
    reference: string;
    channel: string;
}
interface TreasuryPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Treasury payment intent ID */
    paymentIntentId: string;
    /** Tenant slug for treasury-ui URL construction */
    tenantSlug: string;
    amount: number;
    currency?: string;
    description?: string;
    /** Restrict gateway options (e.g., exclude cash for pickup). Comma-separated gateway types. */
    allowedMethods?: string;
    /** Treasury-UI base URL. Falls back to NEXT_PUBLIC_TREASURY_UI_URL env var, then production default. */
    treasuryUiUrl?: string;
    /** Treasury API initiate URL for the payment intent. Required for Paystack/gateway payments. */
    initiateUrl?: string;
    /** Customer email — pre-fills the email on the payment page so the user doesn't have to enter it again. */
    customerEmail?: string;
    /** Reference ID (e.g. order UUID) passed to treasury-ui so it can auto-create an intent as fallback when initiate_url is missing. */
    referenceId?: string;
    /** Reference type (e.g. "order"). Paired with referenceId for intent auto-creation. */
    referenceType?: string;
    /** Payment modal timeout in ms. Default: 600000 (10 minutes). Set 0 to disable. */
    timeoutMs?: number;
    /** Called when payment succeeds — receives payment details from postMessage */
    onPaymentConfirmed?: (result: PaymentResult) => void;
    /** Called when payment fails */
    onPaymentFailed?: (error: string) => void;
}
declare function TreasuryPaymentModal({ open, onOpenChange, paymentIntentId, tenantSlug, amount, currency, description, allowedMethods, treasuryUiUrl, initiateUrl, customerEmail, referenceId, referenceType, timeoutMs, onPaymentConfirmed, onPaymentFailed, }: TreasuryPaymentModalProps): react.ReactPortal | null;

/**
 * The ONE settlement-method registry shared by every "receive/record/pay out" surface across
 * the fleet (treasury-ui customer AR, vendor AP, pos-ui credit-sale settlement). Extend here,
 * never fork a parallel list — a payment recorded via any of these surfaces should read the
 * same everywhere.
 */
interface SettlementMethod {
    value: string;
    label: string;
    /** Whether this method needs a reference (M-Pesa code, cheque no., bank ref) — non-cash. */
    requiresReference?: boolean;
    /** Offers a reference field that may be left blank, labelled with this text (e.g. "M-Pesa code"). */
    optionalReferenceLabel?: string;
}
declare const CASH: SettlementMethod;
declare const MPESA_STK: SettlementMethod;
declare const MPESA_MANUAL: SettlementMethod;
declare const MTN_MOMO_MANUAL: SettlementMethod;
declare const AIRTEL_MONEY_MANUAL: SettlementMethod;
declare const OTHER_MANUAL: SettlementMethod;
declare const BANK: SettlementMethod;
declare const CHEQUE: SettlementMethod;
declare const CARD: SettlementMethod;
declare const CARD_MANUAL: SettlementMethod;
declare const PAYSTACK: SettlementMethod;
declare const STORE_CREDIT: SettlementMethod;
declare const CUSTOMER_ADVANCE: SettlementMethod;
declare const MPESA_B2C: SettlementMethod;
declare const MPESA_B2B: SettlementMethod;
declare const MTN_MOMO: SettlementMethod;
declare const AIRTEL_MONEY: SettlementMethod;
declare const BANK_TRANSFER: SettlementMethod;
/** Every method the platform supports for RECEIVING money (customer/supplier repayment). */
declare const RECEIVE_METHODS: SettlementMethod[];
/** Real cash-out channels only — paying money OUT, never a book-entry method. */
declare const PAYOUT_METHODS: SettlementMethod[];
/** Paying a supplier — offline references + online dispatch methods. */
declare const PAY_SUPPLIER_METHODS: SettlementMethod[];
/** Settling a completed on-account (credit) sale at the till — recording money already
 *  collected offline, never a live STK push (that's a separate checkout-time tender). */
declare const SETTLE_CREDIT_SALE_METHODS: SettlementMethod[];
type SettlementMode = 'receive' | 'payout' | 'apply_to_debt' | 'pay_supplier' | 'record_refund';
interface SettlementSubmitInput {
    amount: number;
    method?: string;
    reference?: string;
    /** ISO 8601 timestamp of when the payment actually happened — defaults to "now" in the form,
     *  but editable so a payment collected earlier can be backdated instead of always stamping the
     *  moment it was entered into the system. */
    effectiveAt?: string;
    /** Only present when `allowOverpayment` is set AND the entered amount exceeds `amountValue`:
     *  'change' (default) means the excess is physical change handed back, nothing to record;
     *  'store_credit' means the caller should ask the backend to bank the excess as the
     *  customer's store credit instead. Absent entirely for a non-overpaid submission. */
    overpaymentAction?: 'change' | 'store_credit';
}
/** Value for an `<input type="datetime-local">` representing the current local time (minute precision). */
declare function nowDatetimeLocal(): string;
/** Converts an `<input type="datetime-local">` value (local time, no offset) to a UTC ISO string. */
declare function datetimeLocalToISO(value: string): string | undefined;
interface SettlementModalProps {
    open: boolean;
    mode: SettlementMode;
    title: string;
    /** e.g. the customer/supplier/invoice name shown in the summary strip. */
    subjectName: string;
    /** e.g. "Balance due" / "Available credit" / "Outstanding payable". */
    amountLabel: string;
    amountValue: number;
    currency?: string;
    defaultAmount?: number;
    /** Client-side cap (server remains authoritative) — omit to skip the check. */
    maxAmount?: number;
    /** When true, an amount typed above `amountValue` is allowed (instead of being blocked by
     *  `maxAmount`) and a "Give change" / "Add to store credit" choice is shown so the caller
     *  learns, via `onSubmit`'s `overpaymentAction`, what to do with the difference. Omit (or
     *  false) to leave every other surface's behavior byte-for-byte unchanged. */
    allowOverpayment?: boolean;
    /** Method list for this mode — pass one of the exported registries, or a custom subset. */
    methods: SettlementMethod[];
    /** Called on Confirm; throw/reject to show the error inline and keep the modal open. */
    onSubmit: (input: SettlementSubmitInput) => Promise<void>;
    onClose: () => void;
    isPending?: boolean;
    /** Extra fields rendered between the amount and method (e.g. a payout recipient phone). */
    extraFields?: React.ReactNode;
    /** Called with the selected method on open and whenever it changes, so a caller that renders a
     *  method-dependent field in `extraFields` (e.g. a "paid into account" picker defaulting from the
     *  tenant's per-method default account) can follow the selection. */
    onMethodChange?: (method: string) => void;
}
/**
 * The ONE settlement modal for every "receive payment / pay out / apply credit / pay supplier /
 * record refund" surface across treasury-ui and pos-ui — replaces the previously-duplicated
 * RecordPaymentModal / ReceivePaymentModal / PayoutCreditModal / vendor dialogs / pos-ui
 * record-payment-modal, each of which had its own divergent method list. Backend-agnostic by
 * design (like TreasuryPaymentModal in this same package): the caller wires onSubmit to
 * whichever endpoint applies (treasury AR/AP, pos-api credit settlement) — this component only
 * owns the amount/method/reference form and its validation.
 */
declare function SettlementModal({ open, mode, title, subjectName, amountLabel, amountValue, currency, defaultAmount, maxAmount, allowOverpayment, methods, onSubmit, onClose, isPending, extraFields, onMethodChange, }: SettlementModalProps): react.ReactPortal | null;

/**
 * Which methods a payment form may offer a tenant. A method backed by a gateway works only when the
 * tenant has that gateway configured and switched on, so it is shown only when treasury lists it
 * (GET /{tenant}/gateways/settlement-methods). Offline methods need no gateway and always show,
 * including M-Pesa paid by hand with its optional code (mpesa_manual) and its MTN, Airtel and
 * Other siblings (mtn_momo_manual, airtel_money_manual, other_manual). Those manual codes must
 * never be added to the gateway set below.
 */
interface UsableSettlementMethods {
    /** Online methods money can come in on. */
    collect?: string[];
    /** Online methods money can go out on. */
    payout?: string[];
}
/** Drops the gateway methods the tenant cannot use. No answer yet, or a failed one, leaves offline methods only. */
declare function usableSettlementMethods<T extends {
    value: string;
}>(methods: readonly T[], usable?: UsableSettlementMethods | null): T[];

/**
 * The ONE payment-method label registry shared by every list/report surface that shows how a
 * customer paid or how a tenant was paid (pos-ui sales list, treasury-ui transactions list,
 * receipts, exports). Previously pos-ui (`sales-shared.tsx`) and treasury-ui each kept their own
 * dictionary; centralising here also lets new methods (MTN, Airtel, bank transfer/Equity) read
 * correctly everywhere the moment they're added, instead of needing a per-surface edit.
 */
declare const PAYMENT_METHOD_LABELS: Record<string, string>;
/**
 * Resolve a display label for a payment method. When `providerName` is supplied (the tenant's
 * configured gateway/account name, e.g. "Equity Bank Uganda" or "Urban Loft Till"), it's appended
 * in parens so a generic method like `bank_transfer` or `mpesa_manual` reads as e.g.
 * "Bank Transfer (Equity Bank Uganda)" — lets a tenant trace exactly which account/provider a
 * transaction moved through, not just the generic method bucket.
 *
 * For `other_manual` the second argument is the payment label the cashier typed, so
 * getPaymentMethodLabel('other_manual', 'Voucher') reads "Other (Voucher)". A blank label is
 * ignored and the method shows as plain "Other".
 */
declare function getPaymentMethodLabel(method: string | null | undefined, providerNameOrLabel?: string | null): string;

interface LogoProps {
    className?: string;
    style?: CSSProperties;
    title?: string;
}
declare function VisaLogo({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;
declare function MastercardLogo({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;
declare function WhatsAppLogo({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;
declare function AirtelMoneyLogo({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;
declare function MtnMomoLogo({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;
declare function MpesaLogo({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;
interface PaystackLogoProps extends LogoProps {
    /** Include the "paystack" wordmark beside the mark (default: the mark alone). */
    wordmark?: boolean;
}
declare function PaystackLogo({ className, style, title, wordmark }: PaystackLogoProps): react_jsx_runtime.JSX.Element;
declare function CashMark({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;
declare function CardMark({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;
/** Multiple Pay: one bill split into parts, each paid with its own tender. */
declare function SplitPayMark({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;
declare function PayHeroLogo({ className, style, title }: LogoProps): react_jsx_runtime.JSX.Element;

interface CurrencyChangeExampleRow {
    label: string;
    originalAmount: number;
}
interface CurrencyChangeConfirmModalProps {
    open: boolean;
    fromCurrency: string;
    toCurrency: string;
    /** 1 fromCurrency = rate toCurrency. */
    rate: number | null;
    /** e.g. "Live (exchangerate-api)" or "Manual rate" or the ExchangeRate.effective_date. */
    rateSource?: string;
    /** Optional illustrative amounts (e.g. current till float, a sale total) shown converted. */
    exampleAmounts?: CurrencyChangeExampleRow[];
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    /** Shown when `rate` is null (no rate available yet) — Confirm is disabled in that state. */
    error?: string | null;
}
/**
 * Shown whenever a tenant/outlet's configured currency is about to change (pos-ui GeneralTab,
 * treasury-ui currency settings). Summarizes the live conversion rate + a few example amounts
 * before committing, per the "always confirm a currency change with a rate summary" requirement —
 * never silently switches an outlet/tenant's currency.
 */
declare function CurrencyChangeConfirmModal({ open, fromCurrency, toCurrency, rate, rateSource, exampleAmounts, onConfirm, onCancel, loading, error, }: CurrencyChangeConfirmModalProps): react.ReactPortal | null;

type AccountType = 'bank' | 'mobile_money' | 'cash';
interface AccountFormValue {
    account_type: AccountType;
    account_name: string;
    bank_name: string;
    account_number: string;
    bank_branch: string;
    branch_code: string;
    currency: string;
    opening_balance: string;
}
declare const EMPTY_ACCOUNT_FORM: AccountFormValue;
interface AccountFormBankOption {
    code: string;
    name: string;
}
interface AccountFormProps {
    value: AccountFormValue;
    onChange: (value: AccountFormValue) => void;
    /** ISO codes this form's currency picker offers — pass shared-ui-lib's own SUPPORTED_CURRENCIES
     *  (this package's `./currency`) unless the consumer has a narrower/different list. */
    currencies: readonly string[];
    currencyLabel?: (code: string) => string;
    /** Optional Paystack-backed bank list + account-name verification for the `bank` type. Omit
     *  entirely to fall back to plain manual bank-name/account-number entry (no lookup). */
    banks?: AccountFormBankOption[];
    banksLoading?: boolean;
    onVerifyBank?: (accountNumber: string, bankCode: string) => Promise<{
        accountName?: string;
        error?: string;
    }>;
    verifying?: boolean;
    /** Hide the account-type selector (e.g. a consumer that only ever creates one type inline from
     *  a specific flow, like a "cash drawer" quick-add). Defaults to showing all three types. */
    hideTypeSelector?: boolean;
    className?: string;
}
declare function AccountForm({ value, onChange, currencies, currencyLabel, banks, banksLoading, onVerifyBank, verifying, hideTypeSelector, className, }: AccountFormProps): react_jsx_runtime.JSX.Element;
/** True once the fields required for the CURRENT account_type are filled in — gate a "Create"
 *  button on this rather than each consumer re-deriving the same per-type rule. */
declare function isAccountFormValid(value: AccountFormValue): boolean;

export { datetimeLocalToISO as $, AIRTEL_MONEY as A, BANK as B, CARD as C, PAYSTACK as D, EMPTY_ACCOUNT_FORM as E, PAY_SUPPLIER_METHODS as F, PayHeroLogo as G, type PaymentResult as H, PaystackLogo as I, type PaystackLogoProps as J, STORE_CREDIT as K, type SettlementMethod as L, MPESA_B2B as M, SettlementModal as N, OTHER_MANUAL as O, PAYMENT_METHOD_LABELS as P, type SettlementModalProps as Q, RECEIVE_METHODS as R, SETTLE_CREDIT_SALE_METHODS as S, type SettlementMode as T, type SettlementSubmitInput as U, SplitPayMark as V, TreasuryPaymentModal as W, type TreasuryPaymentModalProps as X, type UsableSettlementMethods as Y, VisaLogo as Z, WhatsAppLogo as _, AIRTEL_MONEY_MANUAL as a, getPaymentMethodLabel as a0, isAccountFormValid as a1, nowDatetimeLocal as a2, usableSettlementMethods as a3, AccountForm as b, type AccountFormBankOption as c, type AccountFormProps as d, type AccountFormValue as e, type AccountType as f, AirtelMoneyLogo as g, BANK_TRANSFER as h, CARD_MANUAL as i, CASH as j, CHEQUE as k, CUSTOMER_ADVANCE as l, CardMark as m, CashMark as n, CurrencyChangeConfirmModal as o, type CurrencyChangeConfirmModalProps as p, type CurrencyChangeExampleRow as q, MPESA_B2C as r, MPESA_MANUAL as s, MPESA_STK as t, MTN_MOMO as u, MTN_MOMO_MANUAL as v, MastercardLogo as w, MpesaLogo as x, MtnMomoLogo as y, PAYOUT_METHODS as z };
