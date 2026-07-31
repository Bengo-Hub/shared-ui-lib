'use strict';

var lucideReact = require('lucide-react');
var react = require('react');
var reactDom = require('react-dom');
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
function PortaledOverlay({ children }) {
  const [mounted, setMounted] = react.useState(false);
  react.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === "undefined") return null;
  return reactDom.createPortal(children, document.body);
}
function SubscribeOverlay({ upgradeUrl }) {
  const isOnline = useOnlineStatus();
  const content = !isOnline ? /* @__PURE__ */ jsxRuntime.jsxs(
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
  ) : /* @__PURE__ */ jsxRuntime.jsxs(
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
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium", children: "support@codevertexafrica.com" }),
          " for assistance"
        ] })
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntime.jsx(PortaledOverlay, { children: content });
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
  const content = !isOnline ? /* @__PURE__ */ jsxRuntime.jsxs(
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
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: planLabel }),
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
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium", children: "support@codevertexafrica.com" }),
          " for assistance"
        ] })
      ]
    }
  ) : /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-background/95 backdrop-blur-sm px-4",
      role: "alertdialog",
      "aria-modal": "true",
      "aria-label": "Subscription expired",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ShieldAlert, { className: "size-8 text-red-600 dark:text-red-400" }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 text-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-2xl font-bold", children: "Subscription Expired" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "Your grace period has ended and access has been suspended. Renew your plan to restore access." })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: "Current plan" }),
              /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-0.5 text-lg font-bold text-foreground", children: planLabel })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-400", children: "Expired" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "a",
            {
              href: billingUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCw, { className: "size-4" }),
                "Renew ",
                planLabel
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "a",
          {
            href: upgradeUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "size-3.5" }),
              "View other plans"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Contact ",
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium", children: "support@codevertexafrica.com" }),
          " for assistance"
        ] })
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntime.jsx(PortaledOverlay, { children: content });
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
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: `border-b ${BANNER_COLORS[variant]}`, role: "alert", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 ${BANNER_TEXT_COLORS[variant]}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", children: icon }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "flex-1 text-sm", children: message }),
    onActionClick ? /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        onClick: onActionClick,
        className: `inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${BANNER_ACTION_COLORS[variant]}`,
        children: [
          actionLabel,
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowRight, { className: "size-3" })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntime.jsxs(
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
  isPerpetual,
  upgradeUrl,
  billingUrl,
  usageAlerts,
  brandColor
}) {
  const [dismissed, setDismissed] = react.useState(false);
  const [usageAlertDismissed, setUsageAlertDismissed] = react.useState(false);
  const [expanded, setExpanded] = react.useState(false);
  const isOnline = useOnlineStatus();
  if (isPlatformOwner || isServiceCharge || isDemo || !isCommercialTenant || isLoading || !isHydrated) return null;
  const normalizedStatus = (status ?? "").toUpperCase();
  const normalizedPlan = (plan ?? "STARTER").toUpperCase();
  const planLabel = formatPlanName(normalizedPlan);
  if (isExpired && !isInGracePeriod) {
    return /* @__PURE__ */ jsxRuntime.jsx(BlockingOverlay, { plan: normalizedPlan, billingUrl, upgradeUrl });
  }
  if (isInGracePeriod && gracePeriodEndsAt) {
    const daysLeft = Math.max(
      0,
      Math.ceil((gracePeriodEndsAt.getTime() - Date.now()) / (1e3 * 60 * 60 * 24))
    );
    if (!isOnline) {
      return /* @__PURE__ */ jsxRuntime.jsx(
        Banner,
        {
          variant: "warning",
          icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.WifiOff, { className: "size-4" }),
          message: "You're offline \u2014 connect to the internet to renew your subscription before access is blocked.",
          actionLabel: "Try again",
          actionHref: "#",
          onDismiss: null,
          onActionClick: () => window.location.reload()
        }
      );
    }
    return /* @__PURE__ */ jsxRuntime.jsx(
      Banner,
      {
        variant: "warning",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "size-4" }),
        message: `Subscription expired \u2014 ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to renew before access is blocked. Write operations (create, edit, delete) are currently restricted.`,
        actionLabel: "Renew now",
        actionHref: billingUrl,
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
        message: `${planLabel} trial \u2014 ${days} day${days === 1 ? "" : "s"} left. Expires ${formatDate(expiresAt)}.`,
        actionLabel: "Upgrade plan",
        actionHref: upgradeUrl,
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
        message: `${planLabel} plan cancelled${expiresAt ? ` \u2014 access until ${formatDate(expiresAt)}` : ""}. Reactivate to keep your features.`,
        actionLabel: "Reactivate",
        actionHref: upgradeUrl,
        onDismiss: () => setDismissed(true)
      }
    );
  }
  if (needsSubscription) {
    return /* @__PURE__ */ jsxRuntime.jsx(SubscribeOverlay, { upgradeUrl });
  }
  if (!usageAlertDismissed && usageAlerts && usageAlerts.length > 0) {
    const top = usageAlerts.reduce((a, b) => b.pct > a.pct ? b : a);
    return /* @__PURE__ */ jsxRuntime.jsx(
      Banner,
      {
        variant: "warning",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.TrendingUp, { className: "size-4" }),
        message: `${formatMetricLabel(top.metric)} at ${top.pct}% of your ${planLabel} limit (${top.current.toLocaleString()} / ${top.limit.toLocaleString()}). Upgrade to avoid interruption.`,
        actionLabel: "Upgrade plan",
        actionHref: upgradeUrl,
        onDismiss: () => setUsageAlertDismissed(true)
      }
    );
  }
  if (normalizedStatus === "ACTIVE") {
    const accent = brandColor || "var(--color-primary, #6366f1)";
    const daysLeft = daysUntilExpiry;
    const inRenewalWindow = !isPerpetual && daysLeft !== null && daysLeft <= 7 && expiresAt !== null;
    if (!inRenewalWindow) return null;
    const isDanger = daysLeft !== null && daysLeft <= 2;
    const severityClasses = isDanger ? { border: "border-red-200 dark:border-red-800", bg: "bg-red-50/80 dark:bg-red-950/30", text: "text-red-900 dark:text-red-100", subtext: "text-red-700 dark:text-red-300", icon: "text-red-600 dark:text-red-400", action: "bg-red-600 hover:bg-red-700 text-white", hover: "hover:bg-red-100 dark:hover:bg-red-900/40", divider: "border-red-200 dark:border-red-800" } : { border: "border-amber-200 dark:border-amber-800", bg: "bg-amber-50/80 dark:bg-amber-950/30", text: "text-amber-900 dark:text-amber-100", subtext: "text-amber-700 dark:text-amber-300", icon: "text-amber-600 dark:text-amber-400", action: "bg-amber-600 hover:bg-amber-700 text-white", hover: "hover:bg-amber-100 dark:hover:bg-amber-900/40", divider: "border-amber-200 dark:border-amber-800" };
    const renewalText = `Renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"} \xB7 ${formatDate(expiresAt)}`;
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: ["border-b", severityClasses.border, severityClasses.bg].join(" "),
        style: { borderLeftWidth: 3, borderLeftStyle: "solid", borderLeftColor: isDanger ? "#dc2626" : "#d97706" },
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-2", children: [
            isDanger ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ShieldAlert, { className: ["size-3.5 shrink-0", severityClasses.icon].join(" ") }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCw, { className: ["size-3.5 shrink-0", severityClasses.icon].join(" ") }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: ["text-sm font-semibold", severityClasses.text].join(" "), children: planLabel }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: ["text-xs hidden sm:inline", severityClasses.subtext].join(" "), children: [
              "\xB7 ",
              renewalText
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsxs(
                "a",
                {
                  href: billingUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: ["hidden sm:inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors", severityClasses.action].join(" "),
                  children: [
                    "Renew now",
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowRight, { className: "size-3" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: () => setExpanded((v) => !v),
                  className: ["rounded p-1 transition", severityClasses.subtext, severityClasses.hover].join(" "),
                  "aria-label": expanded ? "Collapse plan details" : "Expand plan details",
                  children: expanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "size-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "size-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: () => setDismissed(true),
                  className: ["rounded p-1 transition opacity-60 hover:opacity-100", severityClasses.subtext, severityClasses.hover].join(" "),
                  "aria-label": "Dismiss",
                  children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "size-3.5" })
                }
              )
            ] })
          ] }),
          expanded && /* @__PURE__ */ jsxRuntime.jsx("div", { className: ["mx-auto max-w-6xl border-t px-4 py-3", severityClasses.divider].join(" "), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium text-foreground", children: "Plan" }),
              " ",
              planLabel
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium text-foreground", children: "Status" }),
              " ",
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: [severityClasses.subtext, "font-medium"].join(" "), children: isDanger ? "Renews very soon" : "Renews soon" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium text-foreground", children: "Next renewal" }),
              " ",
              formatDate(expiresAt)
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "ml-auto flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntime.jsxs(
                "a",
                {
                  href: billingUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "inline-flex items-center gap-1 font-medium text-foreground hover:underline underline-offset-2",
                  children: [
                    "Renew now",
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ExternalLink, { className: "size-3" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsxs(
                "a",
                {
                  href: upgradeUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "inline-flex items-center gap-1 font-medium hover:underline underline-offset-2",
                  style: { color: accent },
                  children: [
                    "Upgrade plan",
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowRight, { className: "size-3" })
                  ]
                }
              )
            ] })
          ] }) })
        ]
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
  PROJECTS: "projects",
  AFYA: "afya"
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
  projects: "Projects & Invoicing",
  afya: "Afya (Hospital)"
};
var EMPTY = {
  features: [],
  limits: {},
  isExempt: false,
  status: null,
  isLoading: false,
  planCode: null,
  tierOrder: null,
  catalog: {},
  upgradeBaseUrl: ""
};
var SubscriptionContext = react.createContext(EMPTY);
function SubscriptionProvider({
  value,
  children
}) {
  const v = react.useMemo(
    () => ({ ...EMPTY, ...value }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value.features, value.limits, value.isExempt, value.status, value.isLoading, value.planCode, value.tierOrder, value.catalog, value.upgradeBaseUrl]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(SubscriptionContext.Provider, { value: v, children });
}
function useEntitlements() {
  return react.useContext(SubscriptionContext);
}
function planFamily(code) {
  if (!code) return "";
  const i = code.indexOf("_");
  return (i === -1 ? code : code.slice(0, i)).toUpperCase();
}
function isFeatureUnlocked(e, code) {
  if (e.isExempt) return true;
  if (e.features?.includes(code)) return true;
  const catalog = e.catalog;
  const hasCatalog = !!catalog && Object.keys(catalog).length > 0;
  if (!hasCatalog) return false;
  const entry = catalog[code];
  if (!entry) return true;
  if (e.planCode != null && entry.minPlanCode != null && typeof e.tierOrder === "number" && typeof entry.minTierOrder === "number" && entry.minTierOrder > 0 && planFamily(e.planCode) === planFamily(entry.minPlanCode) && e.tierOrder >= entry.minTierOrder) {
    return true;
  }
  return false;
}
function useFeature(code) {
  const e = react.useContext(SubscriptionContext);
  return isFeatureUnlocked(e, code);
}
function useAnyFeature(...codes) {
  const e = react.useContext(SubscriptionContext);
  return e.isExempt || codes.some((c) => isFeatureUnlocked(e, c));
}
function useLimit(key) {
  const e = react.useContext(SubscriptionContext);
  if (e.isExempt) return Infinity;
  const v = e.limits?.[key];
  if (v === void 0 || v === null || v < 0) return Infinity;
  return v;
}
function FeatureGate({
  feature,
  anyOf,
  fallback = null,
  loadingFallback = null,
  children
}) {
  const e = react.useContext(SubscriptionContext);
  if (e.isLoading) return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: loadingFallback });
  const ok = e.isExempt || (feature ? isFeatureUnlocked(e, feature) : false) || (anyOf ? anyOf.some((f) => isFeatureUnlocked(e, f)) : false);
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: ok ? children : fallback });
}
function UpgradeBadge({ label = "Upgrade", className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "span",
    {
      className: "flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-500 border border-amber-500/20 shrink-0 " + (className ?? ""),
      title: "Your plan doesn\u2019t include this \u2014 upgrade to unlock",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Lock, { className: "h-2.5 w-2.5" }),
        label
      ]
    }
  );
}
function FeatureLockBanner({
  feature,
  upgradeUrl,
  title = "This feature needs a plan upgrade",
  description = "You can view this page, but actions here require a plan that includes it."
}) {
  const e = react.useContext(SubscriptionContext);
  if (e.isLoading) return null;
  if (isFeatureUnlocked(e, feature)) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Lock, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm font-semibold text-foreground", children: title }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: description })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "a",
      {
        href: upgradeUrl,
        className: "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "h-3.5 w-3.5" }),
          "Upgrade plan"
        ]
      }
    )
  ] });
}
function useFeatureUpgrade(feature) {
  const e = react.useContext(SubscriptionContext);
  const entry = e.catalog?.[feature];
  const locked = !isFeatureUnlocked(e, feature);
  const tierLabel = entry?.minTierLabel || "a higher plan";
  const upgradeHref = react.useMemo(() => {
    const base = (e.upgradeBaseUrl || "https://pricing.codevertexafrica.com").replace(/\/$/, "");
    const params = new URLSearchParams();
    if (entry?.serviceTag) params.set("service", entry.serviceTag);
    if (entry?.minPlanCode) params.set("plan", entry.minPlanCode);
    const qs = params.toString();
    return `${base}/plans${qs ? `?${qs}` : ""}`;
  }, [e.upgradeBaseUrl, entry?.serviceTag, entry?.minPlanCode]);
  return { locked, isLoading: !!e.isLoading, entry, tierLabel, upgradeHref };
}
function UpgradeDialog({
  feature,
  open,
  onClose,
  title,
  description
}) {
  const { entry, tierLabel, upgradeHref } = useFeatureUpgrade(feature);
  if (!open) return null;
  const featureLabel = entry?.label || title || "This feature";
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4",
      role: "dialog",
      "aria-modal": "true",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: "w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl",
          onClick: (ev) => ev.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-4 flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Lock, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-base font-bold text-foreground", children: "Upgrade to unlock" }),
                  /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    "Available on ",
                    tierLabel
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: onClose,
                  "aria-label": "Close",
                  className: "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent",
                  children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-sm text-foreground", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: featureLabel }),
              " ",
              description || `is part of the ${tierLabel} plan. Upgrade your subscription to start using it.`
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-6 flex gap-3", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent",
                  children: "Not now"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsxs(
                "a",
                {
                  href: upgradeHref,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "h-4 w-4" }),
                    "Upgrade",
                    entry?.minTierLabel ? ` to ${entry.minTierLabel}` : ""
                  ]
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function FeatureLock({ feature, mode = "overlay", children, className, title, description }) {
  const { locked, isLoading, tierLabel } = useFeatureUpgrade(feature);
  const [dialogOpen, setDialogOpen] = react.useState(false);
  if (isLoading || !locked) return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children });
  const open = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    setDialogOpen(true);
  };
  const dialog = /* @__PURE__ */ jsxRuntime.jsx(UpgradeDialog, { feature, open: dialogOpen, onClose: () => setDialogOpen(false), title, description });
  if (mode === "badge") {
    return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "span",
        {
          className: "group/lock relative inline-flex w-full items-center " + (className ?? ""),
          onClickCapture: open,
          role: "button",
          tabIndex: 0,
          onKeyDown: (ev) => (ev.key === "Enter" || ev.key === " ") && open(ev),
          title: `Available on ${tierLabel} \u2014 click to upgrade`,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "pointer-events-none flex-1", children }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "ml-1 flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-500", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Lock, { className: "h-2.5 w-2.5" }),
              tierLabel
            ] })
          ]
        }
      ),
      dialog
    ] });
  }
  if (mode === "block") {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-12 text-center " + (className ?? ""), children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Lock, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-base font-bold text-foreground", children: title ?? "This feature needs an upgrade" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "max-w-md text-sm text-muted-foreground", children: description ?? `Available on ${tierLabel}. Upgrade your plan to unlock it.` })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          onClick: () => setDialogOpen(true),
          className: "inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "h-4 w-4" }),
            "Upgrade to unlock"
          ]
        }
      ),
      dialog
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative " + (className ?? ""), children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "pointer-events-none select-none opacity-60", "aria-disabled": true, children }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        onClick: open,
        "aria-label": `Locked \u2014 available on ${tierLabel}. Click to upgrade.`,
        className: "absolute inset-0 z-10 flex items-start justify-end p-1.5",
        title: `Available on ${tierLabel} \u2014 click to upgrade`,
        children: /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-500 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Lock, { className: "h-2.5 w-2.5" }),
          tierLabel
        ] })
      }
    ),
    dialog
  ] });
}

exports.FeatureGate = FeatureGate;
exports.FeatureLock = FeatureLock;
exports.FeatureLockBanner = FeatureLockBanner;
exports.SERVICE_TAGS = SERVICE_TAGS;
exports.SERVICE_TAG_LABELS = SERVICE_TAG_LABELS;
exports.SubscriptionBanner = SubscriptionBanner;
exports.SubscriptionContext = SubscriptionContext;
exports.SubscriptionProvider = SubscriptionProvider;
exports.UpgradeBadge = UpgradeBadge;
exports.UpgradeDialog = UpgradeDialog;
exports.isFeatureUnlocked = isFeatureUnlocked;
exports.useAnyFeature = useAnyFeature;
exports.useEntitlements = useEntitlements;
exports.useFeature = useFeature;
exports.useFeatureUpgrade = useFeatureUpgrade;
exports.useLimit = useLimit;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map