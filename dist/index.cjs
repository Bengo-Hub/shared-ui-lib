'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
var lucideReact = require('lucide-react');

// src/components/auth/sso-login-modal.tsx
function SSOLoginModal({
  open,
  onOpenChange,
  tenantSlug,
  authUiUrl = "https://accounts.codevertexitsolutions.com",
  onLoginSuccess,
  onLoginFailed,
  title = "Sign In"
}) {
  const [loginState, setLoginState] = react.useState("loading");
  const [errorMessage, setErrorMessage] = react.useState("");
  const iframeRef = react.useRef(null);
  const iframeSrc = react.useMemo(() => {
    const params = new URLSearchParams({
      tenant: tenantSlug,
      embed: "true",
      redirect_uri: "postmessage"
    });
    return `${authUiUrl}/login?${params.toString()}`;
  }, [tenantSlug, authUiUrl]);
  const handleMessage = react.useCallback((event) => {
    if (!authUiUrl || !event.origin.includes(new URL(authUiUrl).hostname)) return;
    const data = event.data;
    if (!data || typeof data.type !== "string") return;
    switch (data.type) {
      case "auth:login_success": {
        const result = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user
        };
        setLoginState("success");
        onLoginSuccess?.(result);
        setTimeout(() => onOpenChange(false), 300);
        break;
      }
      case "auth:login_failed":
        setErrorMessage(data.error || "Login failed");
        setLoginState("failed");
        onLoginFailed?.(data.error || "Login failed");
        break;
      case "auth:resize":
        if (iframeRef.current && data.height) {
          iframeRef.current.style.height = `${data.height}px`;
        }
        break;
    }
  }, [authUiUrl, onLoginSuccess, onLoginFailed, onOpenChange]);
  react.useEffect(() => {
    if (open) {
      window.addEventListener("message", handleMessage);
      setLoginState("loading");
      setErrorMessage("");
    }
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [open, handleMessage]);
  const handleIframeLoad = react.useCallback(() => {
    if (loginState === "loading") {
      setLoginState("ready");
    }
  }, [loginState]);
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/50",
        onClick: () => onOpenChange(false)
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-lg font-semibold", children: title }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => onOpenChange(false),
            className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 min-h-0 relative", children: loginState === "failed" ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-red-600", children: [
          /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m15 9-6 6" }),
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m9 9 6 6" })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-2", children: "Login Failed" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-600", children: errorMessage }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => {
              setLoginState("loading");
              setErrorMessage("");
            },
            className: "mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors",
            children: "Try Again"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        loginState === "loading" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white z-10", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "Loading login..." })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "iframe",
          {
            ref: iframeRef,
            src: iframeSrc,
            className: "w-full border-0",
            style: { height: "450px" },
            title: "Login",
            onLoad: handleIframeLoad
          }
        )
      ] }) })
    ] })
  ] });
}
var DEFAULT_TREASURY_UI_URL = globalThis.process?.env?.NEXT_PUBLIC_TREASURY_UI_URL || "https://books.codevertexitsolutions.com";
var DEFAULT_TIMEOUT_MS = 10 * 60 * 1e3;
function TreasuryPaymentModal({
  open,
  onOpenChange,
  paymentIntentId,
  tenantSlug,
  amount,
  currency = "KES",
  description,
  allowedMethods,
  treasuryUiUrl = DEFAULT_TREASURY_UI_URL,
  initiateUrl,
  customerEmail,
  referenceId,
  referenceType,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onPaymentConfirmed,
  onPaymentFailed
}) {
  const [paymentState, setPaymentState] = react.useState("loading");
  const [paymentResult, setPaymentResult] = react.useState(null);
  const [errorMessage, setErrorMessage] = react.useState("");
  const iframeRef = react.useRef(null);
  const timeoutRef = react.useRef(null);
  const iframeSrc = react.useMemo(() => {
    const params = new URLSearchParams({
      intent_id: paymentIntentId,
      tenant: tenantSlug,
      amount: String(amount),
      currency,
      embed: "true"
    });
    if (description) params.set("description", description);
    if (allowedMethods) params.set("gateways", allowedMethods);
    if (initiateUrl) params.set("initiate_url", initiateUrl);
    if (customerEmail) params.set("email", customerEmail);
    if (referenceId) params.set("reference_id", referenceId);
    if (referenceType) params.set("reference_type", referenceType);
    params.set("redirect_url", `${treasuryUiUrl}/pay/success?embed=true&intent_id=${encodeURIComponent(paymentIntentId)}&amount=${amount}`);
    return `${treasuryUiUrl}/pay?${params.toString()}`;
  }, [paymentIntentId, tenantSlug, amount, currency, description, allowedMethods, treasuryUiUrl, initiateUrl, customerEmail, referenceId, referenceType]);
  const processedRef = react.useRef(false);
  const handleMessage = react.useCallback((event) => {
    try {
      const expectedOrigin = new URL(treasuryUiUrl).origin;
      if (event.origin !== expectedOrigin) return;
    } catch {
      return;
    }
    const data = event.data;
    if (!data || typeof data.type !== "string") return;
    switch (data.type) {
      case "treasury:payment_initiated":
        setPaymentState("checkout");
        break;
      case "treasury:payment_confirmed": {
        if (processedRef.current) return;
        processedRef.current = true;
        const result = {
          intentId: data.intentId,
          amount: data.amount,
          reference: data.reference,
          channel: data.channel
        };
        setPaymentResult(result);
        setPaymentState("confirmed");
        onPaymentConfirmed?.(result);
        break;
      }
      case "treasury:payment_failed":
        setErrorMessage(data.error || "Payment failed");
        setPaymentState("failed");
        onPaymentFailed?.(data.error || "Payment failed");
        break;
      case "treasury:resize":
        if (iframeRef.current && data.height) {
          iframeRef.current.style.height = `${data.height}px`;
        }
        break;
    }
  }, [treasuryUiUrl, onPaymentConfirmed, onPaymentFailed]);
  react.useEffect(() => {
    if (open) {
      window.addEventListener("message", handleMessage);
      setPaymentState("loading");
      setPaymentResult(null);
      setErrorMessage("");
      processedRef.current = false;
      if (timeoutMs > 0) {
        timeoutRef.current = setTimeout(() => {
          if (processedRef.current) return;
          setPaymentState("expired");
          onPaymentFailed?.("Payment session expired. Please try again.");
        }, timeoutMs);
      }
    }
    return () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, handleMessage, timeoutMs, onPaymentFailed]);
  const handleIframeLoad = react.useCallback(() => {
    if (paymentState === "loading") {
      setPaymentState("checkout");
    }
  }, [paymentState]);
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "fixed inset-0 z-50 flex items-start sm:items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/50",
        onClick: () => onOpenChange(false)
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-full sm:max-w-lg sm:mx-4 bg-white sm:rounded-2xl shadow-xl overflow-hidden flex flex-col h-dvh sm:h-auto sm:max-h-[92vh]", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white shrink-0", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 mr-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-base sm:text-lg font-semibold text-gray-900 truncate", children: "Complete Payment" }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs sm:text-sm text-gray-500 truncate", children: [
            currency,
            " ",
            amount.toLocaleString(),
            description && ` \u2014 ${description}`
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => onOpenChange(false),
            className: "shrink-0 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 min-h-0 overflow-y-auto relative", children: paymentState === "expired" ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-amber-600", children: [
          /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsxRuntime.jsx("polyline", { points: "12 6 12 12 16 14" })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-2", children: "Payment Session Expired" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-600", children: "Your payment session has timed out. Please close this dialog and try again." }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => onOpenChange(false),
            className: "mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors",
            children: "Close"
          }
        )
      ] }) : paymentState === "confirmed" && paymentResult ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-green-600", children: [
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ jsxRuntime.jsx("polyline", { points: "22 4 12 14.01 9 11.01" })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-2", children: "Payment Successful" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
            "Amount: ",
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-medium text-gray-900", children: [
              currency,
              " ",
              paymentResult.amount.toLocaleString()
            ] })
          ] }),
          paymentResult.reference && /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
            "Reference: ",
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-gray-900", children: paymentResult.reference })
          ] }),
          paymentResult.channel && /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
            "Via: ",
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-gray-900", children: paymentResult.channel })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => onOpenChange(false),
            className: "mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors",
            children: "Done"
          }
        )
      ] }) : paymentState === "failed" ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-red-600", children: [
          /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m15 9-6 6" }),
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m9 9 6 6" })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-2", children: "Payment Failed" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-600", children: errorMessage }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => {
              setPaymentState("loading");
              setErrorMessage("");
            },
            className: "mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors",
            children: "Try Again"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative h-full", children: [
        paymentState === "loading" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white z-10", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "Loading payment options..." })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "iframe",
          {
            ref: iframeRef,
            src: iframeSrc,
            className: "w-full border-0 block",
            style: { height: "520px", minHeight: "420px" },
            title: `Complete payment of ${currency} ${amount.toLocaleString()}`,
            onLoad: handleIframeLoad,
            allow: "payment"
          }
        )
      ] }) })
    ] })
  ] });
}
function TrackingIframeModal({
  open,
  onOpenChange,
  trackingCode,
  logisticsUiUrl = "https://logistics.codevertexitsolutions.com",
  title = "Track Order"
}) {
  const [loadState, setLoadState] = react.useState("loading");
  const iframeRef = react.useRef(null);
  const iframeSrc = `${logisticsUiUrl}/track/${encodeURIComponent(trackingCode)}?embed=true`;
  const handleMessage = react.useCallback((event) => {
    if (!logisticsUiUrl || !event.origin.includes(new URL(logisticsUiUrl).hostname)) return;
    const data = event.data;
    if (!data || typeof data.type !== "string") return;
    if (data.type === "tracking:resize" || data.type === "logistics:resize") {
      if (iframeRef.current && data.height) {
        iframeRef.current.style.height = `${data.height}px`;
      }
    }
  }, [logisticsUiUrl]);
  react.useEffect(() => {
    if (open) {
      window.addEventListener("message", handleMessage);
      setLoadState("loading");
    }
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [open, handleMessage]);
  const handleIframeLoad = react.useCallback(() => {
    setLoadState("ready");
  }, []);
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/50",
        onClick: () => onOpenChange(false)
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-lg font-semibold", children: title }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-sm text-gray-500", children: [
            "Tracking: ",
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono", children: trackingCode })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => onOpenChange(false),
            className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 min-h-0 relative", children: [
        loadState === "loading" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white z-10", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "Loading tracking info..." })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "iframe",
          {
            ref: iframeRef,
            src: iframeSrc,
            className: "w-full border-0",
            style: { height: "500px" },
            title: "Order Tracking",
            onLoad: handleIframeLoad
          }
        )
      ] })
    ] })
  ] });
}
var S = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1e3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  backdrop: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" },
  modal: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "90vh",
    margin: "0 16px",
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 20px",
    borderBottom: "1px solid #e5e7eb"
  },
  title: { margin: 0, fontSize: 15, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  subtitle: { margin: 0, fontSize: 12, color: "#6b7280", fontFamily: "ui-monospace, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  body: { position: "relative", flex: 1, minHeight: 0, background: "#f3f4f6" },
  iframe: { width: "100%", height: "100%", border: 0 },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "#6b7280" },
  footer: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: "1px solid #e5e7eb" },
  iconBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 8, borderRadius: 9999, border: 0, background: "transparent", color: "#6b7280", cursor: "pointer" },
  btn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, border: 0, background: "#111827", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }
};
var Spinner = () => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    className: "bx-pdfp-spin",
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
  }
);
var IconDownload = () => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
      /* @__PURE__ */ jsxRuntime.jsx("polyline", { points: "7 10 12 15 17 10" }),
      /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "12", x2: "12", y1: "15", y2: "3" })
    ]
  }
);
var IconPrinter = () => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 9V2h12v7" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" }),
      /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "6", y: "14", width: "12", height: "8" })
    ]
  }
);
var IconExternal = () => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M15 3h6v6" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M10 14 21 3" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" })
    ]
  }
);
var IconClose = () => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m6 6 12 12" })
    ]
  }
);
function PdfPreview({
  open,
  onOpenChange,
  blob,
  fileName,
  title = "Document Preview",
  isLoading,
  orientation = "portrait"
}) {
  const [previewUrl, setPreviewUrl] = react.useState(null);
  react.useEffect(() => {
    if (blob && blob.type === "application/pdf") {
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => {
        window.URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }
    setPreviewUrl(null);
    return void 0;
  }, [blob]);
  if (!open) return null;
  const handleDownload = () => {
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  const handlePrint = () => {
    if (!previewUrl) return;
    const w = window.open(previewUrl, "_blank");
    w?.addEventListener("load", () => w.print());
  };
  const handleOpenTab = () => {
    if (previewUrl) window.open(previewUrl, "_blank");
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { style: S.overlay, role: "dialog", "aria-modal": "true", "aria-label": title, children: [
    /* @__PURE__ */ jsxRuntime.jsx("style", { children: "@keyframes bx-pdfp-rotate{to{transform:rotate(360deg)}}.bx-pdfp-spin{animation:bx-pdfp-rotate 0.8s linear infinite}" }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { style: S.backdrop, onClick: () => onOpenChange(false) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { ...S.modal, maxWidth: orientation === "landscape" ? "95vw" : "90vw" }, children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { style: S.header, children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { minWidth: 0 }, children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { style: S.title, children: title }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { style: S.subtitle, children: fileName })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => onOpenChange(false), style: S.iconBtn, "aria-label": "Close", children: /* @__PURE__ */ jsxRuntime.jsx(IconClose, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { style: S.body, children: isLoading ? /* @__PURE__ */ jsxRuntime.jsxs("div", { style: S.center, children: [
        /* @__PURE__ */ jsxRuntime.jsx(Spinner, {}),
        /* @__PURE__ */ jsxRuntime.jsx("p", { style: { margin: 0, fontSize: 14 }, children: "Generating document\u2026" })
      ] }) : previewUrl ? /* @__PURE__ */ jsxRuntime.jsx("iframe", { src: previewUrl, title, style: S.iframe }) : blob ? /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { ...S.center, textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { style: { margin: 0, fontSize: 14 }, children: "Preview is not available for this file." }),
        /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick: handleDownload, style: S.btnPrimary, children: [
          /* @__PURE__ */ jsxRuntime.jsx(IconDownload, {}),
          " Download ",
          fileName
        ] })
      ] }) : null }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { style: S.footer, children: [
        /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => onOpenChange(false), style: S.btn, children: "Close" }),
        previewUrl && /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick: handleOpenTab, style: S.btn, children: [
          /* @__PURE__ */ jsxRuntime.jsx(IconExternal, {}),
          " Open in tab"
        ] }),
        previewUrl && /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick: handlePrint, style: S.btn, children: [
          /* @__PURE__ */ jsxRuntime.jsx(IconPrinter, {}),
          " Print"
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            onClick: handleDownload,
            disabled: !blob || isLoading,
            style: { ...S.btnPrimary, opacity: !blob || isLoading ? 0.5 : 1 },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(IconDownload, {}),
              " Download"
            ]
          }
        )
      ] })
    ] })
  ] });
}
var INITIAL = {
  open: false,
  blob: null,
  isLoading: false,
  title: "Document Preview",
  fileName: "document.pdf",
  orientation: "portrait"
};
function useDocumentPreview(opts) {
  const [state, setState] = react.useState(INITIAL);
  const openPreview = react.useCallback(
    async (fetchFn, o) => {
      setState({
        open: true,
        blob: null,
        isLoading: true,
        title: o.title ?? "Document Preview",
        fileName: o.fileName,
        orientation: o.orientation ?? "portrait"
      });
      try {
        const blob = await fetchFn();
        setState((s) => ({ ...s, blob, isLoading: false }));
      } catch {
        opts?.onError?.("Failed to load document");
        setState((s) => ({ ...s, open: false, isLoading: false }));
      }
    },
    [opts]
  );
  const onOpenChange = react.useCallback((open) => setState((s) => ({ ...s, open })), []);
  const previewProps = {
    open: state.open,
    onOpenChange,
    blob: state.blob,
    fileName: state.fileName,
    title: state.title,
    isLoading: state.isLoading,
    orientation: state.orientation
  };
  return { openPreview, previewProps };
}
function OfflineSyncBanner({
  isOnline,
  pendingCount = 0,
  syncing,
  availableOffline,
  disabledOffline,
  onSyncNow,
  showSyncedConfirmation = true,
  className = ""
}) {
  const isSyncing = syncing ?? (isOnline && pendingCount > 0);
  if (!isOnline) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        role: "status",
        className: `flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.WifiOff, { className: "h-4 w-4 shrink-0" }),
            "Offline mode \u2014 your work is saved and will sync when you\u2019re back online."
          ] }),
          availableOffline?.length ? /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs font-medium text-amber-50/90", children: [
            "Available: ",
            availableOffline.join(", ")
          ] }) : null,
          disabledOffline?.length ? /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs font-medium text-amber-50/90", children: [
            "Unavailable: ",
            disabledOffline.join(", ")
          ] }) : null
        ]
      }
    );
  }
  if (isSyncing) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        role: "status",
        className: `flex w-full items-center justify-center gap-3 bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCw, { className: "h-4 w-4 shrink-0 animate-spin" }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            "Syncing offline data\u2026",
            pendingCount > 0 ? ` (${pendingCount} remaining)` : ""
          ] }),
          onSyncNow ? /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: onSyncNow,
              className: "ml-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold hover:bg-white/30",
              children: "Sync now"
            }
          ) : null
        ]
      }
    );
  }
  if (showSyncedConfirmation && pendingCount === 0) return null;
  return null;
}
function SyncedConfirmation({ className = "" }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckCircle2, { className: "h-4 w-4" }),
    " All offline data synced"
  ] });
}
function useOnlineStatus() {
  const [online, setOnline] = react.useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  react.useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}
function registerServiceWorker(swUrl = "/sw.js") {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production") return;
  navigator.serviceWorker.register(swUrl, { scope: "/" }).catch(() => {
  });
}
function useOfflineSync(opts = {}) {
  const { getPendingCount, pollMs = 4e3 } = opts;
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = react.useState(0);
  const fnRef = react.useRef(getPendingCount);
  fnRef.current = getPendingCount;
  const tick = react.useCallback(async () => {
    if (!fnRef.current) return;
    try {
      const n = await fnRef.current();
      setPendingCount(Number.isFinite(n) ? n : 0);
    } catch {
    }
  }, []);
  react.useEffect(() => {
    if (!getPendingCount) return;
    void tick();
    const id = setInterval(tick, pollMs);
    return () => clearInterval(id);
  }, [getPendingCount, pollMs, tick]);
  return { isOnline, pendingCount, syncing: isOnline && pendingCount > 0 };
}

exports.OfflineSyncBanner = OfflineSyncBanner;
exports.PdfPreview = PdfPreview;
exports.SSOLoginModal = SSOLoginModal;
exports.SyncedConfirmation = SyncedConfirmation;
exports.TrackingIframeModal = TrackingIframeModal;
exports.TreasuryPaymentModal = TreasuryPaymentModal;
exports.registerServiceWorker = registerServiceWorker;
exports.useDocumentPreview = useDocumentPreview;
exports.useOfflineSync = useOfflineSync;
exports.useOnlineStatus = useOnlineStatus;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map