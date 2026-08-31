'use client';

import { Gauge, Zap } from 'lucide-react';
import { useState } from 'react';

/**
 * The structured 402 body every service's usage-limit gate returns (pos-api's gate.go
 * writeLimitReached, subscriptions-api's usage.go ReportUsage) — the shape a host app's
 * error interceptor decodes into its local `useLimitModal` store before rendering this.
 */
export interface LimitReachedInfo {
  metric: string;
  limit: number;
  used: number;
  overageEligible?: boolean;
  overageUnitPrice?: number;
  overageUnit?: string;
  accruedOverageKes?: number;
  upgradeUrl?: string;
}

export interface LimitReachedModalProps {
  open: boolean;
  info: LimitReachedInfo | null;
  onClose: () => void;
  /** Full URL to the subscriptions-ui subscribe page, used when info.upgradeUrl is absent. */
  subscribeUrl: string;
  /** Formats a KES amount for display. Defaults to a plain "KES 375" formatter — pass the
   *  host app's own currency-aware formatter (e.g. pos-ui's tenant-currency formatCurrency)
   *  when the tenant may be on a non-KES currency. */
  formatCurrency?: (amountKes: number) => string;
  /** When provided, an "Enable extra usage" button appears for overage-eligible metrics with
   *  a seeded price. Called on click; the modal shows a spinner while the promise is pending.
   *  Resolve true on success (the modal closes and onRetry fires), false on failure (the modal
   *  stays open — showing an error toast for the failure is the host's responsibility).
   *  Omit entirely for apps whose plan limits are purely structural (never overage-eligible,
   *  e.g. inventory/treasury) — the modal then always renders the plain "Upgrade plan" CTA. */
  onEnableOverage?: () => Promise<boolean>;
  /** Called after onEnableOverage resolves true, so the host can retry the action that hit
   *  the limit (e.g. re-submit the order/request that received the 402). */
  onRetry?: () => void;
}

function prettyMetric(m: string): string {
  return m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const defaultFormatCurrency = (n: number) => `KES ${n.toLocaleString()}`;

/**
 * Global usage-limit-reached modal. Mounted once near an app's root; opened imperatively
 * (via the host's own useLimitModal-style store) when a mutation returns a structured 402.
 * The single canonical implementation of this UI — pos-ui, inventory-ui, and treasury-ui
 * each maintained a near-identical hand-copied version of this component before it was
 * extracted here; keep host-app-specific wiring (overage enrollment, currency formatting,
 * exemption checks) in each app's thin local wrapper, not in this component.
 */
export function LimitReachedModal({
  open,
  info,
  onClose,
  subscribeUrl,
  formatCurrency = defaultFormatCurrency,
  onEnableOverage,
  onRetry,
}: LimitReachedModalProps) {
  const [enabling, setEnabling] = useState(false);

  if (!open || !info) return null;

  const canOverage = !!(
    onEnableOverage &&
    info.overageEligible &&
    info.overageUnitPrice &&
    info.overageUnitPrice > 0
  );

  const handleEnable = async () => {
    if (!onEnableOverage) return;
    setEnabling(true);
    const ok = await onEnableOverage();
    setEnabling(false);
    if (ok) {
      onClose();
      onRetry?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="alertdialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-sm mx-4 rounded-xl border border-border bg-card shadow-lg p-6 space-y-4">
        <div className="flex size-11 items-center justify-center rounded-full bg-amber-500/15">
          <Gauge className="size-5 text-amber-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{prettyMetric(info.metric)} limit reached</h2>
          <p className="text-sm text-muted-foreground">
            Your plan allows <span className="font-semibold">{info.limit.toLocaleString()}</span>{' '}
            {prettyMetric(info.metric).toLowerCase()} this period and you&apos;ve used{' '}
            <span className="font-semibold">{info.used.toLocaleString()}</span>.
          </p>
        </div>

        {canOverage ? (
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Extra usage price</span>
              <span className="font-semibold">
                {formatCurrency(info.overageUnitPrice!)}
                {info.overageUnit ? ` ${info.overageUnit}` : ''}
              </span>
            </div>
            {!!info.accruedOverageKes && info.accruedOverageKes > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Accrued this period</span>
                <span className="font-semibold">{formatCurrency(info.accruedOverageKes)}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Enable extra usage to keep working now. The overage is added to your next renewal
              invoice; you can turn it off any time in Settings → Subscription.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This limit can&apos;t be extended with pay-as-you-go usage. Upgrade your plan to raise it.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Not now
          </button>
          {canOverage ? (
            <button
              type="button"
              onClick={handleEnable}
              disabled={enabling}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Zap className="size-4" />
              {enabling ? 'Enabling…' : 'Enable extra usage'}
            </button>
          ) : (
            <a
              href={info.upgradeUrl || `${subscribeUrl}/subscribe`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Zap className="size-4" />
              Upgrade plan
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
