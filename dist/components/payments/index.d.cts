import * as React$1 from 'react';

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
declare function TreasuryPaymentModal({ open, onOpenChange, paymentIntentId, tenantSlug, amount, currency, description, allowedMethods, treasuryUiUrl, initiateUrl, customerEmail, referenceId, referenceType, timeoutMs, onPaymentConfirmed, onPaymentFailed, }: TreasuryPaymentModalProps): React$1.ReactPortal | null;

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
}
declare const CASH: SettlementMethod;
declare const MPESA_STK: SettlementMethod;
declare const MPESA_MANUAL: SettlementMethod;
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
    /** Method list for this mode — pass one of the exported registries, or a custom subset. */
    methods: SettlementMethod[];
    /** Called on Confirm; throw/reject to show the error inline and keep the modal open. */
    onSubmit: (input: SettlementSubmitInput) => Promise<void>;
    onClose: () => void;
    isPending?: boolean;
    /** Extra fields rendered between the amount and method (e.g. a payout recipient phone). */
    extraFields?: React.ReactNode;
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
declare function SettlementModal({ open, mode, title, subjectName, amountLabel, amountValue, currency, defaultAmount, maxAmount, methods, onSubmit, onClose, isPending, extraFields, }: SettlementModalProps): React$1.ReactPortal | null;

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
 */
declare function getPaymentMethodLabel(method: string | null | undefined, providerName?: string | null): string;

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
declare function CurrencyChangeConfirmModal({ open, fromCurrency, toCurrency, rate, rateSource, exampleAmounts, onConfirm, onCancel, loading, error, }: CurrencyChangeConfirmModalProps): React$1.ReactPortal | null;

export { AIRTEL_MONEY, BANK, BANK_TRANSFER, CARD, CARD_MANUAL, CASH, CHEQUE, CURRENCY_META, CUSTOMER_ADVANCE, CurrencyChangeConfirmModal, type CurrencyChangeConfirmModalProps, type CurrencyChangeExampleRow, type CurrencyMeta, MPESA_B2B, MPESA_B2C, MPESA_MANUAL, MPESA_STK, MTN_MOMO, PAYMENT_METHOD_LABELS, PAYOUT_METHODS, PAYSTACK, PAY_SUPPLIER_METHODS, type PaymentResult, RECEIVE_METHODS, SETTLE_CREDIT_SALE_METHODS, STORE_CREDIT, SUPPORTED_CURRENCIES, type SettlementMethod, SettlementModal, type SettlementModalProps, type SettlementMode, type SettlementSubmitInput, TreasuryPaymentModal, type TreasuryPaymentModalProps, datetimeLocalToISO, formatCompactCurrency, formatCurrency, getPaymentMethodLabel, nowDatetimeLocal };
