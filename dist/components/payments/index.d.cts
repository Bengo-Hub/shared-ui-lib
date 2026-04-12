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
    /** Payment modal timeout in ms. Default: 600000 (10 minutes). Set 0 to disable. */
    timeoutMs?: number;
    /** Called when payment succeeds — receives payment details from postMessage */
    onPaymentConfirmed?: (result: PaymentResult) => void;
    /** Called when payment fails */
    onPaymentFailed?: (error: string) => void;
}
declare function TreasuryPaymentModal({ open, onOpenChange, paymentIntentId, tenantSlug, amount, currency, description, allowedMethods, treasuryUiUrl, initiateUrl, customerEmail, timeoutMs, onPaymentConfirmed, onPaymentFailed, }: TreasuryPaymentModalProps): react_jsx_runtime.JSX.Element | null;

export { type PaymentResult, TreasuryPaymentModal, type TreasuryPaymentModalProps };
