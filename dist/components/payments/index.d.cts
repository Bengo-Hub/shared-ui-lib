import * as react_jsx_runtime from 'react/jsx-runtime';

interface PaymentResult {
    intentId: string;
    amount: number;
    reference: string;
    channel: string;
}
interface TreasuryCheckoutModalProps {
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
    /** Treasury-UI base URL */
    treasuryUiUrl?: string;
    /** Called when payment succeeds — receives payment details from postMessage */
    onPaymentConfirmed?: (result: PaymentResult) => void;
    /** Called when payment fails */
    onPaymentFailed?: (error: string) => void;
}
declare function TreasuryCheckoutModal({ open, onOpenChange, paymentIntentId, tenantSlug, amount, currency, description, allowedMethods, treasuryUiUrl, onPaymentConfirmed, onPaymentFailed, }: TreasuryCheckoutModalProps): react_jsx_runtime.JSX.Element | null;

export { type PaymentResult, TreasuryCheckoutModal, type TreasuryCheckoutModalProps };
