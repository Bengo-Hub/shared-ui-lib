/** Canonical service tag values for all Codevertex/BengoBox services.
 * Must match service_tag values in subscriptions-api seed data and
 * the SERVICE_OPTIONS list in auth-ui equity page.
 */
export const SERVICE_TAGS = {
  ORDERING:      'ordering',
  POS:           'pos',
  LOGISTICS:     'logistics',
  INVENTORY:     'inventory',
  ERP:           'erp',
  TREASURY:      'treasury',
  TRULOAD:       'truload',
  MARKETFLOW:    'marketflow',
  CAFE:          'cafe',
  ISP_BILLING:   'isp_billing',
  NOTIFICATIONS: 'notifications',
  PROJECTS:      'projects',
} as const;

export type ServiceTag = typeof SERVICE_TAGS[keyof typeof SERVICE_TAGS];

/** Human-readable labels for each service tag. Used in auth-ui billing tabs. */
export const SERVICE_TAG_LABELS: Record<ServiceTag, string> = {
  ordering:      'Ordering',
  pos:           'Point of Sale',
  logistics:     'Logistics',
  inventory:     'Inventory',
  erp:           'ERP / Accounting',
  treasury:      'Treasury & Finance',
  truload:       'Axle Load (TruLoad)',
  marketflow:    'MarketFlow',
  cafe:          'Cafe & Hospitality',
  isp_billing:   'ISP Billing',
  notifications: 'Notifications',
  projects:      'Projects & Invoicing',
};
