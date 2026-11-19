export { S as SSOLoginModal, a as SSOLoginModalProps, b as SSOLoginResult } from './sso-login-modal-a_tC0IDI.js';
export { A as AIRTEL_MONEY, a as AIRTEL_MONEY_MANUAL, b as AccountForm, c as AccountFormBankOption, d as AccountFormProps, e as AccountFormValue, f as AccountType, g as AirtelMoneyLogo, B as BANK, h as BANK_TRANSFER, C as CARD, i as CARD_MANUAL, j as CASH, k as CHEQUE, l as CUSTOMER_ADVANCE, m as CardMark, n as CashMark, o as CurrencyChangeConfirmModal, p as CurrencyChangeConfirmModalProps, q as CurrencyChangeExampleRow, E as EMPTY_ACCOUNT_FORM, M as MPESA_B2B, r as MPESA_B2C, s as MPESA_MANUAL, t as MPESA_STK, u as MTN_MOMO, v as MTN_MOMO_MANUAL, x as MpesaLogo, y as MtnMomoLogo, O as OTHER_MANUAL, P as PAYMENT_METHOD_LABELS, z as PAYOUT_METHODS, D as PAYSTACK, F as PAY_SUPPLIER_METHODS, G as PayHeroLogo, H as PaymentResult, I as PaystackLogo, J as PaystackLogoProps, R as RECEIVE_METHODS, S as SETTLE_CREDIT_SALE_METHODS, K as STORE_CREDIT, L as SettlementMethod, N as SettlementModal, Q as SettlementModalProps, T as SettlementMode, U as SettlementSubmitInput, V as SplitPayMark, W as TreasuryPaymentModal, X as TreasuryPaymentModalProps, Y as UsableSettlementMethods, a0 as getPaymentMethodLabel, a1 as isAccountFormValid, a3 as usableSettlementMethods } from './account-form-IgILFGv8.js';
export { C as CURRENCY_META, a as CurrencyMeta, S as SUPPORTED_CURRENCIES, f as formatCompactCurrency, b as formatCurrency } from './currency-HfXim15h.js';
export { TrackingIframeModal, TrackingIframeModalProps } from './components/tracking/index.js';
export { D as DocumentPreviewProps, I as ImagePreview, a as ImagePreviewProps, b as ImagePreviewPropsShape, O as OpenImagePreviewOptions, c as OpenPreviewOptions, P as PdfPreview, d as PdfPreviewProps, u as useDocumentPreview, e as useImagePreview } from './use-image-preview-BunCXG40.js';
export { O as OfflineBar, a as OfflineBarProps, b as OfflineSyncBanner, c as OfflineSyncBannerProps, d as OfflineSyncState, P as PwaUpdater, e as PwaUpdaterProps, S as SyncedConfirmation, U as UseOfflineSyncOptions, r as registerServiceWorker, u as useOfflineSync, f as useOnlineStatus } from './use-offline-sync-C2m_aJej.js';
export { CreatedSupplier, SupplierBankFieldRenderArgs, SupplierForm, SupplierFormProps, SupplierFormValues, SupplierPaymentMethod } from './components/suppliers/index.js';
export { C as ComboboxOption, S as SearchableCombobox, a as SearchableComboboxProps } from './searchable-combobox-BU-y0sUG.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
export { serviceAppName, serviceBrandingEntry, serviceBrandingMap, serviceFullName, serviceShortName, tenantBrandWord } from './components/branding/index.js';
export { RichText, RichTextEditor, RichTextEditorProps } from './components/rich-text-editor/index.js';
export { B as BulkAction, a as BulkActionBar, C as Checkbox, c as ColumnFilterState, e as ColumnVisibilityButton, D as DataTable, f as DataTableColumn, g as DataTableProps, F as FilterMap, h as FilterOption, i as FunnelFilter, S as SortButton, j as SortDir, k as SortState, T as TableFooter, n as exportRowsAsCsv } from './export--_5Do4rL.js';
export { ConsentCategory, CookieConsentState, CookieNotice, CookieNoticeProps, LegalLinks, LegalLinksProps, PLATFORM_LEGAL_ENTITY, legalUrls, openCookieSettings, useCookieConsent, useCookieConsentState } from './components/legal/index.js';
export { ImageLoaderProps, MEDIA_IMAGE_WIDTHS, MediaImage, MediaImageProps, TransformOptions, imageSrcSet, isTransformableImage, mediaImageLoader, mediaImageLoaderFor, snapImageWidth, transformImageUrl } from './components/media/index.js';
import { TimeZoneUser, TimeZoneTenant } from './components/format/index.js';
export { DEFAULT_TIME_ZONE, DateFormatOptions, DateInput, applyUserTimeZone, formatDate, formatDateTime, formatTime, getActiveTimeZone, isValidTimeZone, resolveTimeZone, setActiveTimeZone, subscribeTimeZone, toUserZone } from './components/format/index.js';
import 'react';
import './debounce-BEP6JASM.js';

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

/**
 * The zone this screen should show times in. With no arguments it returns the active zone the
 * app set from /me (see applyUserTimeZone) and re-renders when it changes. Given a user and
 * tenant it resolves from them instead.
 */
declare function useUserTimeZone(user?: TimeZoneUser | null, tenant?: TimeZoneTenant | null): string;

export { PoweredByBadge, type PoweredByBadgeProps, TimeZoneTenant, TimeZoneUser, useUserTimeZone };
