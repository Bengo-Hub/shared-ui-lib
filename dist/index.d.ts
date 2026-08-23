export { S as SSOLoginModal, a as SSOLoginModalProps, b as SSOLoginResult } from './sso-login-modal-a_tC0IDI.js';
export { AIRTEL_MONEY, BANK, BANK_TRANSFER, CARD, CARD_MANUAL, CASH, CHEQUE, CURRENCY_META, CUSTOMER_ADVANCE, CurrencyChangeConfirmModal, CurrencyChangeConfirmModalProps, CurrencyChangeExampleRow, CurrencyMeta, MPESA_B2B, MPESA_B2C, MPESA_MANUAL, MPESA_STK, MTN_MOMO, PAYMENT_METHOD_LABELS, PAYOUT_METHODS, PAYSTACK, PAY_SUPPLIER_METHODS, PaymentResult, RECEIVE_METHODS, SETTLE_CREDIT_SALE_METHODS, STORE_CREDIT, SUPPORTED_CURRENCIES, SettlementMethod, SettlementModal, SettlementModalProps, SettlementMode, SettlementSubmitInput, TreasuryPaymentModal, TreasuryPaymentModalProps, formatCompactCurrency, formatCurrency, getPaymentMethodLabel } from './components/payments/index.js';
export { TrackingIframeModal, TrackingIframeModalProps } from './components/tracking/index.js';
export { D as DocumentPreviewProps, I as ImagePreview, a as ImagePreviewProps, b as ImagePreviewPropsShape, O as OpenImagePreviewOptions, c as OpenPreviewOptions, P as PdfPreview, d as PdfPreviewProps, u as useDocumentPreview, e as useImagePreview } from './use-image-preview-BunCXG40.js';
export { O as OfflineBar, a as OfflineBarProps, b as OfflineSyncBanner, c as OfflineSyncBannerProps, d as OfflineSyncState, P as PwaUpdater, e as PwaUpdaterProps, S as SyncedConfirmation, U as UseOfflineSyncOptions, r as registerServiceWorker, u as useOfflineSync, f as useOnlineStatus } from './use-offline-sync-An_S9Hq1.js';
export { CreatedSupplier, SupplierBankFieldRenderArgs, SupplierForm, SupplierFormProps, SupplierFormValues, SupplierPaymentMethod } from './components/suppliers/index.js';
export { ComboboxOption, SearchableCombobox, SearchableComboboxProps } from './components/combobox/index.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
export { RichText, RichTextEditor, RichTextEditorProps } from './components/rich-text-editor/index.js';
export { B as BulkAction, a as BulkActionBar, C as Checkbox, b as ColumnFilterState, c as ColumnVisibilityButton, D as DataTable, d as DataTableColumn, e as DataTableProps, F as FilterMap, f as FilterOption, g as FunnelFilter, S as SortButton, h as SortDir, i as SortState, T as TableFooter, j as exportRowsAsCsv } from './export--eAJr1jb.js';
import 'react';

interface PoweredByBadgeProps {
    /** Override the icon (defaults to the Codevertex Africa Limited icon). */
    iconUrl?: string;
    /** 'card' (default) — the rounded white pill. 'inline' — a bare, no-background row for tight spaces. */
    variant?: 'card' | 'inline';
    /** 'row' (default) — one-line "POWERED BY CODEVERTEX AFRICA LIMITED" pill, for app footers.
     *  'stacked' — the taller two-line card (label over the name), for the PIN-login brand panel. */
    layout?: 'row' | 'stacked';
    /** Icon size — for `layout="row"` this drives the pill's height (thin padding, not a fixed tall
     *  box), so pass a bigger size for a more prominent placement and it stays proportioned.
     *  Defaults to a compact 'h-7 w-7' for `row`, 'h-11 w-11' for `stacked`. */
    iconClassName?: string;
    href?: string;
    className?: string;
}
declare function PoweredByBadge({ iconUrl, variant, layout, iconClassName, href, className, }: PoweredByBadgeProps): react_jsx_runtime.JSX.Element;

export { PoweredByBadge, type PoweredByBadgeProps };
