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
declare const PAYSTACK: SettlementMethod;
declare const STORE_CREDIT: SettlementMethod;
declare const CUSTOMER_ADVANCE: SettlementMethod;
declare const MPESA_B2C: SettlementMethod;
declare const MPESA_B2B: SettlementMethod;
/** Every method the platform supports for RECEIVING money (customer/supplier repayment). */
declare const RECEIVE_METHODS: SettlementMethod[];
/** Real cash-out channels only — paying money OUT, never a book-entry method. */
declare const PAYOUT_METHODS: SettlementMethod[];
/** Paying a supplier — offline references + online dispatch methods. */
declare const PAY_SUPPLIER_METHODS: SettlementMethod[];
type SettlementMode = 'receive' | 'payout' | 'apply_to_debt' | 'pay_supplier' | 'record_refund';
interface SettlementSubmitInput {
    amount: number;
    method?: string;
    reference?: string;
}
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

export { BANK, CARD, CASH, CHEQUE, CUSTOMER_ADVANCE, MPESA_B2B, MPESA_B2C, MPESA_MANUAL, MPESA_STK, PAYOUT_METHODS, PAYSTACK, PAY_SUPPLIER_METHODS, type PaymentResult, RECEIVE_METHODS, STORE_CREDIT, type SettlementMethod, SettlementModal, type SettlementModalProps, type SettlementMode, type SettlementSubmitInput, TreasuryPaymentModal, type TreasuryPaymentModalProps };
