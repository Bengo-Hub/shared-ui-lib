/**
 * Canonical service tag values for all billable Codevertex services.
 *
 * Platform-level services (auth, subscriptions, codevertex-website) are NOT included
 * here — they have no subscription plans.
 *
 * NOTE: cafe-website is NOT a standalone service. Its subscription gating derives
 * from the `ordering` plan features (cafe_website_enabled, cafe_website_basic).
 * Notifications is platform infrastructure included in other plans, not billed separately.
 */
export const SERVICE_TAGS = {
  ORDERING:    'ordering',
  POS:         'pos',
  LOGISTICS:   'logistics',
  INVENTORY:   'inventory',
  ERP:         'erp',
  TREASURY:    'treasury',
  TRULOAD:     'truload',
  MARKETFLOW:  'marketflow',
  ISP_BILLING: 'isp_billing',
  PROJECTS:    'projects',
} as const;

export type ServiceTag = typeof SERVICE_TAGS[keyof typeof SERVICE_TAGS];

/** Human-readable labels for each billable service tag. Used in auth-ui billing tabs. */
export const SERVICE_TAG_LABELS: Record<ServiceTag, string> = {
  ordering:    'Ordering',
  pos:         'Point of Sale',
  logistics:   'Logistics',
  inventory:   'Inventory',
  erp:         'ERP / Accounting',
  treasury:    'Treasury & Finance',
  truload:     'Axle Load (TruLoad)',
  marketflow:  'MarketFlow',
  isp_billing: 'ISP Billing',
  projects:    'Projects & Invoicing',
};
