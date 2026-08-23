export { SSOLoginModal, type SSOLoginModalProps, type SSOLoginResult } from './components/auth/sso-login-modal';
export { TreasuryPaymentModal, type PaymentResult, type TreasuryPaymentModalProps } from './components/payments/treasury-payment-modal';
export {
  SettlementModal,
  type SettlementMode,
  type SettlementMethod,
  type SettlementModalProps,
  type SettlementSubmitInput,
  RECEIVE_METHODS,
  PAYOUT_METHODS,
  PAY_SUPPLIER_METHODS,
  SETTLE_CREDIT_SALE_METHODS,
  CASH,
  MPESA_STK,
  MPESA_MANUAL,
  BANK,
  CHEQUE,
  CARD,
  CARD_MANUAL,
  PAYSTACK,
  STORE_CREDIT,
  CUSTOMER_ADVANCE,
  MPESA_B2C,
  MPESA_B2B,
  MTN_MOMO,
  AIRTEL_MONEY,
  BANK_TRANSFER,
} from './components/payments/settlement-modal';
export {
  CURRENCY_META,
  SUPPORTED_CURRENCIES,
  formatCurrency,
  formatCompactCurrency,
  type CurrencyMeta,
} from './components/payments/currency';
export {
  PAYMENT_METHOD_LABELS,
  getPaymentMethodLabel,
} from './components/payments/payment-method-labels';
export {
  CurrencyChangeConfirmModal,
  type CurrencyChangeConfirmModalProps,
  type CurrencyChangeExampleRow,
} from './components/payments/currency-change-confirm-modal';
export { TrackingIframeModal, type TrackingIframeModalProps } from './components/tracking/tracking-iframe-modal';
export {
  PdfPreview,
  type PdfPreviewProps,
  useDocumentPreview,
  type DocumentPreviewProps,
  type OpenPreviewOptions,
  ImagePreview,
  type ImagePreviewProps,
  useImagePreview,
  type ImagePreviewPropsShape,
  type OpenImagePreviewOptions,
} from './components/documents';
export {
  OfflineSyncBanner,
  SyncedConfirmation,
  type OfflineSyncBannerProps,
  OfflineBar,
  type OfflineBarProps,
  PwaUpdater,
  type PwaUpdaterProps,
  useOnlineStatus,
  useOfflineSync,
  registerServiceWorker,
  type UseOfflineSyncOptions,
  type OfflineSyncState,
} from './components/offline';
export {
  SupplierForm,
  type SupplierFormProps,
  type SupplierFormValues,
  type SupplierPaymentMethod,
  type CreatedSupplier,
  type SupplierBankFieldRenderArgs,
} from './components/suppliers';
export {
  SearchableCombobox,
  type ComboboxOption,
  type SearchableComboboxProps,
} from './components/combobox';
export { PoweredByBadge, type PoweredByBadgeProps } from './components/branding/powered-by';
// PhoneInputField/CountrySelect/FlagIcon are deliberately NOT re-exported here — they pull in
// react-phone-number-input, a class-component library that breaks Turbopack's static-generation
// bundling for ANY consumer's page (confirmed live: hospital-ui's static "/" route failed with
// "Super expression must either be null or a function" purely from this barrel re-export, despite
// never importing PhoneInputField anywhere in its own source — v0.1.73 built clean, v0.1.74 broke
// it). Import from the dedicated subpath instead: '@bengo-hub/shared-ui-lib/contact' (already the
// documented, actually-used pattern in every real consumer — auth-ui, treasury-ui,
// ordering-frontend). This keeps that dependency out of every OTHER app's bundle entirely.
export {
  RichTextEditor,
  RichText,
  type RichTextEditorProps,
} from './components/rich-text-editor';
export {
  DataTable,
  type DataTableProps,
  Checkbox,
  BulkActionBar,
  SortButton,
  FunnelFilter,
  ColumnVisibilityButton,
  TableFooter,
  exportRowsAsCsv,
  type BulkAction,
  type ColumnFilterState,
  type DataTableColumn,
  type FilterMap,
  type FilterOption,
  type SortDir,
  type SortState,
} from './components/data-table';
