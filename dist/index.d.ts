export { S as SSOLoginModal, a as SSOLoginModalProps, b as SSOLoginResult } from './sso-login-modal-a_tC0IDI.js';
export { BANK, CARD, CARD_MANUAL, CASH, CHEQUE, CUSTOMER_ADVANCE, MPESA_B2B, MPESA_B2C, MPESA_MANUAL, MPESA_STK, PAYOUT_METHODS, PAYSTACK, PAY_SUPPLIER_METHODS, PaymentResult, RECEIVE_METHODS, SETTLE_CREDIT_SALE_METHODS, STORE_CREDIT, SettlementMethod, SettlementModal, SettlementModalProps, SettlementMode, SettlementSubmitInput, TreasuryPaymentModal, TreasuryPaymentModalProps } from './components/payments/index.js';
export { TrackingIframeModal, TrackingIframeModalProps } from './components/tracking/index.js';
export { D as DocumentPreviewProps, O as OpenPreviewOptions, P as PdfPreview, a as PdfPreviewProps, u as useDocumentPreview } from './use-document-preview-Ch4RIS8N.js';
export { OfflineBar, OfflineBarProps, OfflineSyncBanner, OfflineSyncBannerProps, OfflineSyncState, PwaUpdater, PwaUpdaterProps, SyncedConfirmation, UseOfflineSyncOptions, registerServiceWorker, useOfflineSync, useOnlineStatus } from './components/offline/index.js';
export { CreatedSupplier, SupplierBankFieldRenderArgs, SupplierForm, SupplierFormProps, SupplierFormValues, SupplierPaymentMethod } from './components/suppliers/index.js';
export { ComboboxOption, SearchableCombobox, SearchableComboboxProps } from './components/combobox/index.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
export { B as BulkAction, a as BulkActionBar, C as Checkbox, b as ColumnFilterState, c as ColumnVisibilityButton, D as DataTable, d as DataTableColumn, e as DataTableProps, F as FilterMap, f as FilterOption, g as FunnelFilter, S as SortButton, h as SortDir, i as SortState, T as TableFooter, j as exportRowsAsCsv } from './export-C2Eni2VG.js';
import 'react';

interface PoweredByBadgeProps {
    /** Override the icon (defaults to the Codevertex Africa Limited icon). */
    iconUrl?: string;
    /** 'card' (default) — the thin creamy pill used on brand panels/footers.
     *  'inline' — a bare, no-background row for tight spaces. */
    variant?: 'card' | 'inline';
    /** Icon size — this drives the pill's height (thin padding, not a fixed tall box), so pass a
     *  bigger size (e.g. 'h-10 w-10') for a more prominent placement and it stays proportioned.
     *  Defaults to a compact 'h-7 w-7' sized for a one-line footer badge. */
    iconClassName?: string;
    href?: string;
    className?: string;
}
declare function PoweredByBadge({ iconUrl, variant, iconClassName, href, className, }: PoweredByBadgeProps): react_jsx_runtime.JSX.Element;

export { PoweredByBadge, type PoweredByBadgeProps };
