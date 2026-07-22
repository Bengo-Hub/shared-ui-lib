export { S as SSOLoginModal, a as SSOLoginModalProps, b as SSOLoginResult } from './sso-login-modal-a_tC0IDI.cjs';
export { BANK, CARD, CARD_MANUAL, CASH, CHEQUE, CUSTOMER_ADVANCE, MPESA_B2B, MPESA_B2C, MPESA_MANUAL, MPESA_STK, PAYOUT_METHODS, PAYSTACK, PAY_SUPPLIER_METHODS, PaymentResult, RECEIVE_METHODS, SETTLE_CREDIT_SALE_METHODS, STORE_CREDIT, SettlementMethod, SettlementModal, SettlementModalProps, SettlementMode, SettlementSubmitInput, TreasuryPaymentModal, TreasuryPaymentModalProps } from './components/payments/index.cjs';
export { TrackingIframeModal, TrackingIframeModalProps } from './components/tracking/index.cjs';
export { D as DocumentPreviewProps, O as OpenPreviewOptions, P as PdfPreview, a as PdfPreviewProps, u as useDocumentPreview } from './use-document-preview-Ch4RIS8N.cjs';
export { OfflineBar, OfflineBarProps, OfflineSyncBanner, OfflineSyncBannerProps, OfflineSyncState, PwaUpdater, PwaUpdaterProps, SyncedConfirmation, UseOfflineSyncOptions, registerServiceWorker, useOfflineSync, useOnlineStatus } from './components/offline/index.cjs';
export { CreatedSupplier, SupplierBankFieldRenderArgs, SupplierForm, SupplierFormProps, SupplierFormValues, SupplierPaymentMethod } from './components/suppliers/index.cjs';
export { ComboboxOption, SearchableCombobox, SearchableComboboxProps } from './components/combobox/index.cjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
export { B as BulkAction, a as BulkActionBar, C as Checkbox, b as ColumnFilterState, c as ColumnVisibilityButton, D as DataTable, d as DataTableColumn, e as DataTableProps, F as FilterMap, f as FilterOption, g as FunnelFilter, S as SortButton, h as SortDir, i as SortState, T as TableFooter, j as exportRowsAsCsv } from './export-C2Eni2VG.cjs';
import 'react';

interface PoweredByBadgeProps {
    /** Override the icon (defaults to the Codevertex Africa Limited icon). */
    iconUrl?: string;
    /** 'card' (default) — the creamy pill/card used on brand panels/footers.
     *  'inline' — a bare, no-background row for tight spaces. */
    variant?: 'card' | 'inline';
    /** 'row' (default) — thin one-line "Powered by Codevertex Africa Limited" pill, for app
     *  footers. 'stacked' — the taller two-line card (uppercase "POWERED BY" label over a bold
     *  name), for the prominent PIN-login brand panel placement. */
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
