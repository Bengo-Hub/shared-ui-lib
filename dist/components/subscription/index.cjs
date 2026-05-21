'use strict';

var lucideReact = require('lucide-react');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/components/subscription/subscription-banner.tsx
function formatDate(d) {
  if (!d) return "";
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
function useOnlineStatus() {
  const [online, setOnline] = react.useState(
    () => typeof window !== "undefined" ? navigator.onLine : true
  );
  react.useEffect(() => {
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
function SubscribeOverlay({ upgradeUrl }) {
  const isOnline = useOnlineStatus();
  if (!isOnline) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": "No internet connection",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.WifiOff, { className: "size-8 text-gray-600 dark:text-gray-400" }) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-md space-y-2 px-4 text-center", children: [
            /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-2xl font-bold", children: "No Internet Connection" }),
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground", children: "Connect to the internet to activate your subscription and access the platform." })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              onClick: () => window.location.reload(),
              className: "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCw, { className: "size-4" }),
                "Try again"
              ]
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm",
      role: "alertdialog",
      "aria-modal": "true",
      "aria-label": "Subscription required",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex size-16 items-center justify-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "size-8 text-primary" }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-md space-y-2 px-4 text-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-2xl font-bold", children: "Subscription Required" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground", children: "Choose a plan to unlock access to the platform and all its features." })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "a",
          {
            href: upgradeUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "size-4" }),
              "Choose a plan"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Contact ",
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium", children: "support@codevertexitsolutions.com" }),
          " for assistance"
        ] })
      ]
    }
  );
}
function BlockingOverlay({
  plan,
  upgradeUrl
}) {
  const isOnline = useOnlineStatus();
  if (!isOnline) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": "No internet connection",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.WifiOff, { className: "size-8 text-gray-600 dark:text-gray-400" }) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-md space-y-2 px-4 text-center", children: [
            /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-2xl font-bold", children: "No Internet Connection" }),
            /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "Your ",
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: plan }),
              " plan has expired. Connect to the internet to renew your subscription and restore access."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              onClick: () => window.location.reload(),
              className: "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCw, { className: "size-4" }),
                "Try again"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Contact ",
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium", children: "support@codevertexitsolutions.com" }),
            " for assistance"
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm",
      role: "alertdialog",
      "aria-modal": "true",
      "aria-label": "Subscription expired",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ShieldAlert, { className: "size-8 text-red-600 dark:text-red-400" }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-md space-y-2 px-4 text-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-2xl font-bold", children: "Subscription Expired" }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Your ",
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: plan }),
            " plan has expired and the grace period has ended. Upgrade now to restore access."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "a",
          {
            href: upgradeUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "size-4" }),
              "Upgrade now"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Contact ",
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium", children: "support@codevertexitsolutions.com" }),
          " for assistance"
        ] })
      ]
    }
  );
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
  onDismiss
}) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: `border-b ${BANNER_COLORS[variant]}`, role: "alert", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 ${BANNER_TEXT_COLORS[variant]}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", children: icon }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "flex-1 text-sm", children: message }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "a",
      {
        href: actionHref,
        target: "_blank",
        rel: "noopener noreferrer",
        className: `inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${BANNER_ACTION_COLORS[variant]}`,
        children: [
          actionLabel,
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowRight, { className: "size-3" })
        ]
      }
    ),
    onDismiss && /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        onClick: onDismiss,
        className: `shrink-0 rounded p-1 opacity-60 transition hover:opacity-100 ${BANNER_DISMISS_COLORS[variant]}`,
        "aria-label": "Dismiss",
        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "size-3.5" })
      }
    )
  ] }) });
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
  billingUrl
}) {
  const [dismissed, setDismissed] = react.useState(false);
  if (isPlatformOwner || isServiceCharge || isDemo || !isCommercialTenant || isLoading || !isHydrated) return null;
  const normalizedStatus = (status ?? "").toUpperCase();
  const normalizedPlan = (plan ?? "STARTER").toUpperCase();
  if (isExpired && !isInGracePeriod) {
    return /* @__PURE__ */ jsxRuntime.jsx(BlockingOverlay, { plan: normalizedPlan, upgradeUrl });
  }
  if (isInGracePeriod && gracePeriodEndsAt) {
    const daysLeft = Math.max(
      0,
      Math.ceil((gracePeriodEndsAt.getTime() - Date.now()) / (1e3 * 60 * 60 * 24))
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      Banner,
      {
        variant: "warning",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "size-4" }),
        message: `Subscription expired \u2014 ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to renew before access is blocked.`,
        actionLabel: "Renew now",
        actionHref: upgradeUrl,
        onDismiss: null
      }
    );
  }
  if (dismissed) return null;
  if (normalizedStatus === "SUSPENDED") {
    return /* @__PURE__ */ jsxRuntime.jsx(
      Banner,
      {
        variant: "warning",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "size-4" }),
        message: "Your subscription is suspended. Please update your payment method to restore access.",
        actionLabel: "Update payment",
        actionHref: billingUrl,
        onDismiss: null
      }
    );
  }
  if (normalizedStatus === "TRIAL" && expiresAt) {
    const days = daysUntilExpiry ?? 0;
    return /* @__PURE__ */ jsxRuntime.jsx(
      Banner,
      {
        variant: "info",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Clock, { className: "size-4" }),
        message: `${normalizedPlan} trial \u2014 ${days} day${days === 1 ? "" : "s"} left. Expires ${formatDate(expiresAt)}. Upgrade to keep your features.`,
        actionLabel: "Subscribe",
        actionHref: upgradeUrl,
        onDismiss: () => setDismissed(true)
      }
    );
  }
  if (normalizedStatus === "ACTIVE" && expiresAt && daysUntilExpiry !== null && daysUntilExpiry <= 7) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      Banner,
      {
        variant: "warning",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCw, { className: "size-4" }),
        message: `${normalizedPlan} \u2014 Renews in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} on ${formatDate(expiresAt)}.`,
        actionLabel: "Manage billing",
        actionHref: billingUrl,
        onDismiss: () => setDismissed(true)
      }
    );
  }
  if (normalizedStatus === "CANCELLED") {
    return /* @__PURE__ */ jsxRuntime.jsx(
      Banner,
      {
        variant: "error",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "size-4" }),
        message: `${normalizedPlan} plan cancelled${expiresAt ? ` \u2014 access until ${formatDate(expiresAt)}` : ""}. Reactivate to keep your features.`,
        actionLabel: "Reactivate",
        actionHref: upgradeUrl,
        onDismiss: () => setDismissed(true)
      }
    );
  }
  if (needsSubscription) {
    return /* @__PURE__ */ jsxRuntime.jsx(SubscribeOverlay, { upgradeUrl });
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

exports.SERVICE_TAGS = SERVICE_TAGS;
exports.SERVICE_TAG_LABELS = SERVICE_TAG_LABELS;
exports.SubscriptionBanner = SubscriptionBanner;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map