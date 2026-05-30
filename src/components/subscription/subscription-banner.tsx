'use client';

import { AlertTriangle, ArrowRight, Clock, RefreshCw, ShieldAlert, TrendingUp, WifiOff, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface UsageAlert {
  metric: string;
  limit: number;
  current: number;
  pct: number;
}

export interface SubscriptionBannerProps {
  status: string | null;
  plan: string | null;
  isExpired: boolean;
  isInGracePeriod: boolean;
  expiresAt: Date | null;
  gracePeriodEndsAt: Date | null;
  daysUntilExpiry: number | null;
  needsSubscription: boolean;
  isPlatformOwner: boolean;
  isCommercialTenant: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  /** True for service-charge billing model tenants — subscription gating does not apply */
  isServiceCharge?: boolean;
  /** True for demo tenant/users — subscription gating does not apply */
  isDemo?: boolean;
  /** Full URL to the upgrade/plans page — include ?service=<tag> for service-specific filtering */
  upgradeUrl: string;
  /** Full URL to the billing/payment management page */
  billingUrl: string;
  /** Active usage threshold alerts — shown as a warning banner to prompt the tenant to upgrade */
  usageAlerts?: UsageAlert[];
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return '';
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof window !== 'undefined' ? navigator.onLine : true,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/**
 * Renders children into document.body via a React portal, bypassing any CSS
 * stacking contexts created by fixed/sticky sidebars, headers, or overflow
 * containers. The mounted guard prevents SSR hydration mismatches.
 */
function PortaledOverlay({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

function SubscribeOverlay({ upgradeUrl }: { upgradeUrl: string }) {
  const isOnline = useOnlineStatus();

  const content = !isOnline ? (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label="No internet connection"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <WifiOff className="size-8 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="max-w-md space-y-2 px-4 text-center">
        <h2 className="text-2xl font-bold">No Internet Connection</h2>
        <p className="text-sm text-muted-foreground">
          Connect to the internet to activate your subscription and access the platform.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        <RefreshCw className="size-4" />
        Try again
      </button>
    </div>
  ) : (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label="Subscription required"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Zap className="size-8 text-primary" />
      </div>
      <div className="max-w-md space-y-2 px-4 text-center">
        <h2 className="text-2xl font-bold">Subscription Required</h2>
        <p className="text-sm text-muted-foreground">
          Choose a plan to unlock access to the platform and all its features.
        </p>
      </div>
      <a
        href={upgradeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        <Zap className="size-4" />
        Choose a plan
      </a>
      <p className="text-xs text-muted-foreground">
        Contact <span className="font-medium">support@codevertexitsolutions.com</span> for assistance
      </p>
    </div>
  );

  return <PortaledOverlay>{content}</PortaledOverlay>;
}

function formatPlanName(plan: string): string {
  return plan
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function BlockingOverlay({
  plan,
  billingUrl,
  upgradeUrl,
}: {
  plan: string;
  billingUrl: string;
  upgradeUrl: string;
}) {
  const isOnline = useOnlineStatus();
  const planLabel = formatPlanName(plan);

  const content = !isOnline ? (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label="No internet connection"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <WifiOff className="size-8 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="max-w-md space-y-2 px-4 text-center">
        <h2 className="text-2xl font-bold">No Internet Connection</h2>
        <p className="text-sm text-muted-foreground">
          Your <span className="font-semibold">{planLabel}</span> plan has expired. Connect to the
          internet to renew your subscription and restore access.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        <RefreshCw className="size-4" />
        Try again
      </button>
      <p className="text-xs text-muted-foreground">
        Contact <span className="font-medium">support@codevertexitsolutions.com</span> for
        assistance
      </p>
    </div>
  ) : (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-background/95 backdrop-blur-sm px-4"
      role="alertdialog"
      aria-modal="true"
      aria-label="Subscription expired"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <ShieldAlert className="size-8 text-red-600 dark:text-red-400" />
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Subscription Expired</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your grace period has ended and access has been suspended. Renew your plan to restore access.
        </p>
      </div>

      {/* Current plan card */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current plan</p>
            <p className="mt-0.5 text-lg font-bold text-foreground">{planLabel}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-400">
            Expired
          </span>
        </div>
        <a
          href={billingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          <RefreshCw className="size-4" />
          Renew {planLabel}
        </a>
      </div>

      <a
        href={upgradeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <Zap className="size-3.5" />
        View other plans
      </a>

      <p className="text-xs text-muted-foreground">
        Contact <span className="font-medium">support@codevertexitsolutions.com</span> for assistance
      </p>
    </div>
  );

  return <PortaledOverlay>{content}</PortaledOverlay>;
}

type BannerVariant = 'info' | 'warning' | 'error';

const BANNER_COLORS: Record<BannerVariant, string> = {
  info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50',
  error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50',
};

const BANNER_TEXT_COLORS: Record<BannerVariant, string> = {
  info: 'text-blue-800 dark:text-blue-200',
  warning: 'text-amber-800 dark:text-amber-200',
  error: 'text-red-800 dark:text-red-200',
};

const BANNER_ACTION_COLORS: Record<BannerVariant, string> = {
  info: 'bg-blue-600 hover:bg-blue-700 text-white',
  warning: 'bg-amber-600 hover:bg-amber-700 text-white',
  error: 'bg-red-600 hover:bg-red-700 text-white',
};

const BANNER_DISMISS_COLORS: Record<BannerVariant, string> = {
  info: 'text-blue-700 dark:text-blue-300',
  warning: 'text-amber-700 dark:text-amber-300',
  error: 'text-red-700 dark:text-red-300',
};

function Banner({
  variant,
  icon,
  message,
  actionLabel,
  actionHref,
  onDismiss,
  onActionClick,
}: {
  variant: BannerVariant;
  icon: React.ReactNode;
  message: string;
  actionLabel: string;
  actionHref: string;
  onDismiss: (() => void) | null;
  onActionClick?: () => void;
}) {
  return (
    <div className={`border-b ${BANNER_COLORS[variant]}`} role="alert">
      <div className={`mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 ${BANNER_TEXT_COLORS[variant]}`}>
        <span className="shrink-0">{icon}</span>
        <p className="flex-1 text-sm">{message}</p>
        {onActionClick ? (
          <button
            onClick={onActionClick}
            className={`inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${BANNER_ACTION_COLORS[variant]}`}
          >
            {actionLabel}
            <ArrowRight className="size-3" />
          </button>
        ) : (
          <a
            href={actionHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${BANNER_ACTION_COLORS[variant]}`}
          >
            {actionLabel}
            <ArrowRight className="size-3" />
          </a>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`shrink-0 rounded p-1 opacity-60 transition hover:opacity-100 ${BANNER_DISMISS_COLORS[variant]}`}
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function formatMetricLabel(metric: string): string {
  return metric.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SubscriptionBanner({
  status,
  plan,
  isExpired,
  isInGracePeriod,
  expiresAt,
  gracePeriodEndsAt,
  daysUntilExpiry,
  needsSubscription,
  isPlatformOwner,
  isCommercialTenant,
  isLoading,
  isHydrated,
  isServiceCharge,
  isDemo,
  upgradeUrl,
  billingUrl,
  usageAlerts,
}: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [usageAlertDismissed, setUsageAlertDismissed] = useState(false);
  const [upgradeDismissed, setUpgradeDismissed] = useState(false);
  const isOnline = useOnlineStatus();

  // Service-charge and demo tenants are never gated by subscription.
  if (isPlatformOwner || isServiceCharge || isDemo || !isCommercialTenant || isLoading || !isHydrated) return null;

  const normalizedStatus = (status ?? '').toUpperCase();
  const normalizedPlan = (plan ?? 'STARTER').toUpperCase();
  const planLabel = formatPlanName(normalizedPlan);

  if (isExpired && !isInGracePeriod) {
    return <BlockingOverlay plan={normalizedPlan} billingUrl={billingUrl} upgradeUrl={upgradeUrl} />;
  }

  if (isInGracePeriod && gracePeriodEndsAt) {
    const daysLeft = Math.max(
      0,
      Math.ceil((gracePeriodEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );

    if (!isOnline) {
      return (
        <Banner
          variant="warning"
          icon={<WifiOff className="size-4" />}
          message="You're offline — connect to the internet to renew your subscription before access is blocked."
          actionLabel="Try again"
          actionHref="#"
          onDismiss={null}
          onActionClick={() => window.location.reload()}
        />
      );
    }

    return (
      <Banner
        variant="warning"
        icon={<AlertTriangle className="size-4" />}
        message={`Subscription expired — ${daysLeft} day${daysLeft === 1 ? '' : 's'} left to renew before access is blocked. Write operations (create, edit, delete) are currently restricted.`}
        actionLabel="Renew now"
        actionHref={billingUrl}
        onDismiss={null}
      />
    );
  }

  if (dismissed) return null;

  if (normalizedStatus === 'SUSPENDED') {
    return (
      <Banner
        variant="warning"
        icon={<AlertTriangle className="size-4" />}
        message="Your subscription is suspended. Please update your payment method to restore access."
        actionLabel="Update payment"
        actionHref={billingUrl}
        onDismiss={null}
      />
    );
  }

  if (normalizedStatus === 'TRIAL' && expiresAt) {
    const days = daysUntilExpiry ?? 0;
    return (
      <Banner
        variant="info"
        icon={<Clock className="size-4" />}
        message={`${planLabel} trial — ${days} day${days === 1 ? '' : 's'} left. Expires ${formatDate(expiresAt)}.`}
        actionLabel="Upgrade plan"
        actionHref={upgradeUrl}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  if (normalizedStatus === 'ACTIVE' && expiresAt && daysUntilExpiry !== null && daysUntilExpiry <= 7) {
    return (
      <Banner
        variant="warning"
        icon={<RefreshCw className="size-4" />}
        message={`${planLabel} — Renews in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} on ${formatDate(expiresAt)}.`}
        actionLabel="Manage billing"
        actionHref={billingUrl}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  if (normalizedStatus === 'CANCELLED') {
    return (
      <Banner
        variant="error"
        icon={<AlertTriangle className="size-4" />}
        message={`${planLabel} plan cancelled${expiresAt ? ` — access until ${formatDate(expiresAt)}` : ''}. Reactivate to keep your features.`}
        actionLabel="Reactivate"
        actionHref={upgradeUrl}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  if (needsSubscription) {
    return <SubscribeOverlay upgradeUrl={upgradeUrl} />;
  }

  // Usage threshold alert — shown when any metric approaches its plan limit (>= 80%).
  if (!usageAlertDismissed && usageAlerts && usageAlerts.length > 0) {
    const top = usageAlerts.reduce((a, b) => (b.pct > a.pct ? b : a));
    return (
      <Banner
        variant="warning"
        icon={<TrendingUp className="size-4" />}
        message={`${formatMetricLabel(top.metric)} at ${top.pct}% of your ${planLabel} limit (${top.current.toLocaleString()} / ${top.limit.toLocaleString()}). Upgrade to avoid interruption.`}
        actionLabel="Upgrade plan"
        actionHref={upgradeUrl}
        onDismiss={() => setUsageAlertDismissed(true)}
      />
    );
  }

  // Persistent upgrade nudge for ACTIVE tenants — dismissible.
  if (normalizedStatus === 'ACTIVE' && !upgradeDismissed) {
    return (
      <Banner
        variant="info"
        icon={<Zap className="size-4" />}
        message={`You're on the ${planLabel} plan. Upgrade for higher limits, more features, and priority support.`}
        actionLabel="Upgrade plan"
        actionHref={upgradeUrl}
        onDismiss={() => setUpgradeDismissed(true)}
      />
    );
  }

  return null;
}
