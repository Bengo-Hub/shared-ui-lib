import { WifiOff, AlertTriangle, Clock, RefreshCw, TrendingUp, Zap, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { jsx, jsxs } from 'react/jsx-runtime';

// src/components/subscription/subscription-banner.tsx
function formatDate(d) {
  if (!d) return "";
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
function useOnlineStatus() {
  const [online, setOnline] = useState(
    () => typeof window !== "undefined" ? navigator.onLine : true
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
function PortaledOverlay({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
function SubscribeOverlay({ upgradeUrl }) {
  const isOnline = useOnlineStatus();
  const content = !isOnline ? /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm",
      role: "alertdialog",
      "aria-modal": "true",
      "aria-label": "No internet connection",
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800", children: /* @__PURE__ */ jsx(WifiOff, { className: "size-8 text-gray-600 dark:text-gray-400" }) }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-md space-y-2 px-4 text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "No Internet Connection" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Connect to the internet to activate your subscription and access the platform." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "size-4" }),
              "Try again"
            ]
          }
        )
      ]
    }
  ) : /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm",
      role: "alertdialog",
      "aria-modal": "true",
      "aria-label": "Subscription required",
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex size-16 items-center justify-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsx(Zap, { className: "size-8 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-md space-y-2 px-4 text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Subscription Required" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Choose a plan to unlock access to the platform and all its features." })
        ] }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: upgradeUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
            children: [
              /* @__PURE__ */ jsx(Zap, { className: "size-4" }),
              "Choose a plan"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Contact ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "support@codevertexitsolutions.com" }),
          " for assistance"
        ] })
      ]
    }
  );
  return /* @__PURE__ */ jsx(PortaledOverlay, { children: content });
}
function formatPlanName(plan) {
  return plan.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function BlockingOverlay({
  plan,
  billingUrl,
  upgradeUrl
}) {
  const isOnline = useOnlineStatus();
  const planLabel = formatPlanName(plan);
  const content = !isOnline ? /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm",
      role: "alertdialog",
      "aria-modal": "true",
      "aria-label": "No internet connection",
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800", children: /* @__PURE__ */ jsx(WifiOff, { className: "size-8 text-gray-600 dark:text-gray-400" }) }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-md space-y-2 px-4 text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "No Internet Connection" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Your ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: planLabel }),
            " plan has expired. Connect to the internet to renew your subscription and restore access."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "size-4" }),
              "Try again"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Contact ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "support@codevertexitsolutions.com" }),
          " for assistance"
        ] })
      ]
    }
  ) : /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-background/95 backdrop-blur-sm px-4",
      role: "alertdialog",
      "aria-modal": "true",
      "aria-label": "Subscription expired",
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30", children: /* @__PURE__ */ jsx(ShieldAlert, { className: "size-8 text-red-600 dark:text-red-400" }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Subscription Expired" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "Your grace period has ended and access has been suspended. Renew your plan to restore access." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: "Current plan" }),
              /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-lg font-bold text-foreground", children: planLabel })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-400", children: "Expired" })
          ] }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: billingUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "size-4" }),
                "Renew ",
                planLabel
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: upgradeUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
            children: [
              /* @__PURE__ */ jsx(Zap, { className: "size-3.5" }),
              "View other plans"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Contact ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "support@codevertexitsolutions.com" }),
          " for assistance"
        ] })
      ]
    }
  );
  return /* @__PURE__ */ jsx(PortaledOverlay, { children: content });
}
var BANNER_COLORS = {
  info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50",
  error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50"
};
var BANNER_TEXT_COLORS = {
  info: "text-blue-800 dark:text-blue-200",
  warning: "text-amber-800 dark:text-amber-200",
  error: "text-red-800 dark:text-red-200"
};
var BANNER_ACTION_COLORS = {
  info: "bg-blue-600 hover:bg-blue-700 text-white",
  warning: "bg-amber-600 hover:bg-amber-700 text-white",
  error: "bg-red-600 hover:bg-red-700 text-white"
};
var BANNER_DISMISS_COLORS = {
  info: "text-blue-700 dark:text-blue-300",
  warning: "text-amber-700 dark:text-amber-300",
  error: "text-red-700 dark:text-red-300"
};
function Banner({
  variant,
  icon,
  message,
  actionLabel,
  actionHref,
  onDismiss,
  onActionClick
}) {
  return /* @__PURE__ */ jsx("div", { className: `border-b ${BANNER_COLORS[variant]}`, role: "alert", children: /* @__PURE__ */ jsxs("div", { className: `mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 ${BANNER_TEXT_COLORS[variant]}`, children: [
    /* @__PURE__ */ jsx("span", { className: "shrink-0", children: icon }),
    /* @__PURE__ */ jsx("p", { className: "flex-1 text-sm", children: message }),
    onActionClick ? /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onActionClick,
        className: `inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${BANNER_ACTION_COLORS[variant]}`,
        children: [
          actionLabel,
          /* @__PURE__ */ jsx(ArrowRight, { className: "size-3" })
        ]
      }
    ) : /* @__PURE__ */ jsxs(
      "a",
      {
        href: actionHref,
        target: "_blank",
        rel: "noopener noreferrer",
        className: `inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${BANNER_ACTION_COLORS[variant]}`,
        children: [
          actionLabel,
          /* @__PURE__ */ jsx(ArrowRight, { className: "size-3" })
        ]
      }
    ),
    onDismiss && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onDismiss,
        className: `shrink-0 rounded p-1 opacity-60 transition hover:opacity-100 ${BANNER_DISMISS_COLORS[variant]}`,
        "aria-label": "Dismiss",
        children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
      }
    )
  ] }) });
}
function formatMetricLabel(metric) {
  return metric.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function SubscriptionBanner({
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
  usageAlerts
}) {
  const [dismissed, setDismissed] = useState(false);
  const [usageAlertDismissed, setUsageAlertDismissed] = useState(false);
  const [upgradeDismissed, setUpgradeDismissed] = useState(false);
  const isOnline = useOnlineStatus();
  if (isPlatformOwner || isServiceCharge || isDemo || !isCommercialTenant || isLoading || !isHydrated) return null;
  const normalizedStatus = (status ?? "").toUpperCase();
  const normalizedPlan = (plan ?? "STARTER").toUpperCase();
  const planLabel = formatPlanName(normalizedPlan);
  if (isExpired && !isInGracePeriod) {
    return /* @__PURE__ */ jsx(BlockingOverlay, { plan: normalizedPlan, billingUrl, upgradeUrl });
  }
  if (isInGracePeriod && gracePeriodEndsAt) {
    const daysLeft = Math.max(
      0,
      Math.ceil((gracePeriodEndsAt.getTime() - Date.now()) / (1e3 * 60 * 60 * 24))
    );
    if (!isOnline) {
      return /* @__PURE__ */ jsx(
        Banner,
        {
          variant: "warning",
          icon: /* @__PURE__ */ jsx(WifiOff, { className: "size-4" }),
          message: "You're offline \u2014 connect to the internet to renew your subscription before access is blocked.",
          actionLabel: "Try again",
          actionHref: "#",
          onDismiss: null,
          onActionClick: () => window.location.reload()
        }
      );
    }
    return /* @__PURE__ */ jsx(
      Banner,
      {
        variant: "warning",
        icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4" }),
        message: `Subscription expired \u2014 ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to renew before access is blocked. Write operations (create, edit, delete) are currently restricted.`,
        actionLabel: "Renew now",
        actionHref: billingUrl,
        onDismiss: null
      }
    );
  }
  if (dismissed) return null;
  if (normalizedStatus === "SUSPENDED") {
    return /* @__PURE__ */ jsx(
      Banner,
      {
        variant: "warning",
        icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4" }),
        message: "Your subscription is suspended. Please update your payment method to restore access.",
        actionLabel: "Update payment",
        actionHref: billingUrl,
        onDismiss: null
      }
    );
  }
  if (normalizedStatus === "TRIAL" && expiresAt) {
    const days = daysUntilExpiry ?? 0;
    return /* @__PURE__ */ jsx(
      Banner,
      {
        variant: "info",
        icon: /* @__PURE__ */ jsx(Clock, { className: "size-4" }),
        message: `${planLabel} trial \u2014 ${days} day${days === 1 ? "" : "s"} left. Expires ${formatDate(expiresAt)}.`,
        actionLabel: "Upgrade plan",
        actionHref: upgradeUrl,
        onDismiss: () => setDismissed(true)
      }
    );
  }
  if (normalizedStatus === "ACTIVE" && expiresAt && daysUntilExpiry !== null && daysUntilExpiry <= 7) {
    return /* @__PURE__ */ jsx(
      Banner,
      {
        variant: "warning",
        icon: /* @__PURE__ */ jsx(RefreshCw, { className: "size-4" }),
        message: `${planLabel} \u2014 Renews in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} on ${formatDate(expiresAt)}.`,
        actionLabel: "Manage billing",
        actionHref: billingUrl,
        onDismiss: () => setDismissed(true)
      }
    );
  }
  if (normalizedStatus === "CANCELLED") {
    return /* @__PURE__ */ jsx(
      Banner,
      {
        variant: "error",
        icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4" }),
        message: `${planLabel} plan cancelled${expiresAt ? ` \u2014 access until ${formatDate(expiresAt)}` : ""}. Reactivate to keep your features.`,
        actionLabel: "Reactivate",
        actionHref: upgradeUrl,
        onDismiss: () => setDismissed(true)
      }
    );
  }
  if (needsSubscription) {
    return /* @__PURE__ */ jsx(SubscribeOverlay, { upgradeUrl });
  }
  if (!usageAlertDismissed && usageAlerts && usageAlerts.length > 0) {
    const top = usageAlerts.reduce((a, b) => b.pct > a.pct ? b : a);
    return /* @__PURE__ */ jsx(
      Banner,
      {
        variant: "warning",
        icon: /* @__PURE__ */ jsx(TrendingUp, { className: "size-4" }),
        message: `${formatMetricLabel(top.metric)} at ${top.pct}% of your ${planLabel} limit (${top.current.toLocaleString()} / ${top.limit.toLocaleString()}). Upgrade to avoid interruption.`,
        actionLabel: "Upgrade plan",
        actionHref: upgradeUrl,
        onDismiss: () => setUsageAlertDismissed(true)
      }
    );
  }
  if (normalizedStatus === "ACTIVE" && !upgradeDismissed) {
    return /* @__PURE__ */ jsx(
      Banner,
      {
        variant: "info",
        icon: /* @__PURE__ */ jsx(Zap, { className: "size-4" }),
        message: `You're on the ${planLabel} plan. Upgrade for higher limits, more features, and priority support.`,
        actionLabel: "Upgrade plan",
        actionHref: upgradeUrl,
        onDismiss: () => setUpgradeDismissed(true)
      }
    );
  }
  return null;
}

// src/components/subscription/service-tags.ts
var SERVICE_TAGS = {
  ORDERING: "ordering",
  POS: "pos",
  LOGISTICS: "logistics",
  INVENTORY: "inventory",
  ERP: "erp",
  TREASURY: "treasury",
  TRULOAD: "truload",
  MARKETFLOW: "marketflow",
  ISP_BILLING: "isp_billing",
  PROJECTS: "projects"
};
var SERVICE_TAG_LABELS = {
  ordering: "Ordering",
  pos: "Point of Sale",
  logistics: "Logistics",
  inventory: "Inventory",
  erp: "ERP / Accounting",
  treasury: "Treasury & Finance",
  truload: "Axle Load (TruLoad)",
  marketflow: "MarketFlow",
  isp_billing: "ISP Billing",
  projects: "Projects & Invoicing"
};

export { SERVICE_TAGS, SERVICE_TAG_LABELS, SubscriptionBanner };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map