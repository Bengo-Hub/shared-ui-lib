export { S as SSOLoginModal, a as SSOLoginModalProps, b as SSOLoginResult } from './sso-login-modal-a_tC0IDI.js';
export { A as AIRTEL_MONEY, a as AccountForm, b as AccountFormBankOption, c as AccountFormProps, d as AccountFormValue, e as AccountType, B as BANK, f as BANK_TRANSFER, C as CARD, g as CARD_MANUAL, h as CASH, i as CHEQUE, j as CURRENCY_META, k as CUSTOMER_ADVANCE, l as CurrencyChangeConfirmModal, m as CurrencyChangeConfirmModalProps, n as CurrencyChangeExampleRow, o as CurrencyMeta, E as EMPTY_ACCOUNT_FORM, M as MPESA_B2B, p as MPESA_B2C, q as MPESA_MANUAL, r as MPESA_STK, s as MTN_MOMO, P as PAYMENT_METHOD_LABELS, t as PAYOUT_METHODS, u as PAYSTACK, v as PAY_SUPPLIER_METHODS, w as PaymentResult, R as RECEIVE_METHODS, S as SETTLE_CREDIT_SALE_METHODS, x as STORE_CREDIT, y as SUPPORTED_CURRENCIES, z as SettlementMethod, D as SettlementModal, F as SettlementModalProps, G as SettlementMode, H as SettlementSubmitInput, T as TreasuryPaymentModal, I as TreasuryPaymentModalProps, J as formatCompactCurrency, K as formatCurrency, L as getPaymentMethodLabel, N as isAccountFormValid } from './account-form-DYSPnUJR.js';
export { TrackingIframeModal, TrackingIframeModalProps } from './components/tracking/index.js';
export { D as DocumentPreviewProps, I as ImagePreview, a as ImagePreviewProps, b as ImagePreviewPropsShape, O as OpenImagePreviewOptions, c as OpenPreviewOptions, P as PdfPreview, d as PdfPreviewProps, u as useDocumentPreview, e as useImagePreview } from './use-image-preview-BunCXG40.js';
export { O as OfflineBar, a as OfflineBarProps, b as OfflineSyncBanner, c as OfflineSyncBannerProps, d as OfflineSyncState, P as PwaUpdater, e as PwaUpdaterProps, S as SyncedConfirmation, U as UseOfflineSyncOptions, r as registerServiceWorker, u as useOfflineSync, f as useOnlineStatus } from './use-offline-sync-An_S9Hq1.js';
export { CreatedSupplier, SupplierBankFieldRenderArgs, SupplierForm, SupplierFormProps, SupplierFormValues, SupplierPaymentMethod } from './components/suppliers/index.js';
export { ComboboxOption, SearchableCombobox, SearchableComboboxProps } from './components/combobox/index.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
export { RichText, RichTextEditor, RichTextEditorProps } from './components/rich-text-editor/index.js';
export { B as BulkAction, a as BulkActionBar, C as Checkbox, b as ColumnFilterState, c as ColumnVisibilityButton, D as DataTable, d as DataTableColumn, e as DataTableProps, F as FilterMap, f as FilterOption, g as FunnelFilter, S as SortButton, h as SortDir, i as SortState, T as TableFooter, j as exportRowsAsCsv } from './export--eAJr1jb.js';
import 'react';

/** Certified-reseller co-branding attribution — see the reseller-partner-program plan §6A/§9.
 *  Populated only when the current tenant has a reseller of record; the platform mark always
 *  stays primary and visible (co-branding, never white-label — §6A's Merchant-of-Record split). */
interface PoweredByBadgePartner {
    /** The certified partner/reseller's display name. */
    name: string;
    /** Optional small partner logo, shown inline next to the attribution text. Only rendered in
     *  `layout="row"` — `layout="stacked"` (the compact PIN-login panel) stays text-only for space. */
    logoUrl?: string;
}
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
    /** Optional certified-reseller attribution rendered ALONGSIDE the Codevertex mark (never
     *  replacing it) — e.g. "Sold & supported by {partner.name}". Omit entirely for the default,
     *  unchanged badge; every existing call site with no `partner` renders byte-for-byte as before. */
    partner?: PoweredByBadgePartner;
}
declare function PoweredByBadge({ iconUrl, variant, layout, iconClassName, href, className, partner, }: PoweredByBadgeProps): react_jsx_runtime.JSX.Element;

export { PoweredByBadge, type PoweredByBadgeProps };
