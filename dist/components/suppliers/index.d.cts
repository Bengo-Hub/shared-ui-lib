import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

/**
 * Supplier/vendor master shape. The supplier MASTER is owned by inventory-api
 * (`POST /inventory/suppliers`); treasury reaches it via an S2S proxy. This form is
 * intentionally dependency-light (only React + Tailwind classNames resolved by the host)
 * and props-driven so any consumer can pass its OWN create function — inventory-ui passes
 * its apiClient-backed create; treasury-ui can later pass an S2S create. It never imports a
 * concrete apiClient, so there are NO hard inventory-ui imports.
 */
type SupplierPaymentMethod = 'mpesa' | 'mpesa_b2b' | 'bank_transfer' | 'cash' | 'cheque' | '';
interface SupplierFormValues {
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    tax_number?: string;
    tax_pin?: string;
    notes?: string;
    payment_method_type?: SupplierPaymentMethod;
    mpesa_phone?: string;
    mpesa_business_name?: string;
    bank_account_number?: string;
    bank_name?: string;
    bank_branch?: string;
    auto_pay_enabled?: boolean;
    requires_invoice_before_payment?: boolean;
    payment_terms_days?: number;
    credit_limit?: number;
}
/** Minimal created-supplier shape the form needs back for onSuccess. */
interface CreatedSupplier {
    id: string;
    name: string;
    [key: string]: unknown;
}
interface SupplierBankFieldRenderArgs {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    onChange: (patch: {
        bank_name?: string;
        bank_code?: string;
        account_number?: string;
    }) => void;
}
interface SupplierFormProps {
    /** Seed values (edit mode, or a prefilled name from an inline "+ Add new vendor" flow). */
    initialValues?: Partial<SupplierFormValues>;
    /** When true, the form is in edit mode (button label + heading copy). */
    isEdit?: boolean;
    /**
     * Async submit. Receives the cleaned payload; should create/update the supplier and resolve
     * with the persisted record. The form awaits this and surfaces a pending state + errors.
     * Consumers wire their own transport here (inventory apiClient, treasury S2S, …).
     */
    onSubmit: (values: SupplierFormValues) => Promise<CreatedSupplier | void>;
    /** Called with the created/updated supplier after onSubmit resolves successfully. */
    onSuccess?: (supplier: CreatedSupplier | void) => void;
    /** Called when the user cancels/closes (optional — caller owns the dialog chrome). */
    onCancel?: () => void;
    /** Optional async error surface (e.g. a toast). Defaults to inline message only. */
    onError?: (message: string) => void;
    /**
     * Optional render-prop for the bank fields, letting a consumer inject a richer widget
     * (e.g. inventory-ui's Paystack account-verify). When omitted, plain bank inputs render.
     */
    renderBankFields?: (args: SupplierBankFieldRenderArgs) => ReactNode;
    /** Hide the payment-configuration section entirely (e.g. lightweight vendor capture). */
    hidePaymentConfig?: boolean;
    /** Optional extra className on the root <form>. */
    className?: string;
    /** Submit button label override. */
    submitLabel?: string;
}
declare function SupplierForm({ initialValues, isEdit, onSubmit, onSuccess, onCancel, onError, renderBankFields, hidePaymentConfig, className, submitLabel, }: SupplierFormProps): react_jsx_runtime.JSX.Element;

export { type CreatedSupplier, type SupplierBankFieldRenderArgs, SupplierForm, type SupplierFormProps, type SupplierFormValues, type SupplierPaymentMethod };
