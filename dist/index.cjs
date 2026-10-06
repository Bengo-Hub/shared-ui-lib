'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
var reactDom = require('react-dom');
var lucideReact = require('lucide-react');
var Link = require('@tiptap/extension-link');
var react$1 = require('@tiptap/react');
var StarterKit = require('@tiptap/starter-kit');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Link__default = /*#__PURE__*/_interopDefault(Link);
var StarterKit__default = /*#__PURE__*/_interopDefault(StarterKit);

// src/components/auth/sso-login-modal.tsx
function SSOLoginModal({
  open,
  onOpenChange,
  tenantSlug,
  authUiUrl = "https://accounts.codevertexafrica.com",
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
var DEFAULT_TREASURY_UI_URL = globalThis.process?.env?.NEXT_PUBLIC_TREASURY_UI_URL || "https://books.codevertexafrica.com";
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
  const [attempt, setAttempt] = react.useState(0);
  const onConfirmedRef = react.useRef(onPaymentConfirmed);
  const onFailedRef = react.useRef(onPaymentFailed);
  onConfirmedRef.current = onPaymentConfirmed;
  onFailedRef.current = onPaymentFailed;
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
        onConfirmedRef.current?.(result);
        break;
      }
      case "treasury:payment_failed":
        setErrorMessage(data.error || "Payment failed");
        setPaymentState("failed");
        onFailedRef.current?.(data.error || "Payment failed");
        break;
      case "treasury:resize":
        if (iframeRef.current && data.height) {
          iframeRef.current.style.height = `${data.height}px`;
        }
        break;
    }
  }, [treasuryUiUrl]);
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
          onFailedRef.current?.("Payment session expired. Please try again.");
        }, timeoutMs);
      }
    }
    return () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, handleMessage, timeoutMs]);
  const handleIframeLoad = react.useCallback(() => {
    if (paymentState === "loading") {
      setPaymentState("checkout");
    }
  }, [paymentState]);
  if (!open) return null;
  if (typeof document === "undefined") return null;
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          className: "absolute inset-0 bg-black/50",
          onClick: () => onOpenChange(false)
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-full sm:max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90dvh]", children: [
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
                setAttempt((n) => n + 1);
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
            },
            attempt
          )
        ] }) })
      ] })
    ] }),
    document.body
  );
}
var CASH = { value: "cash", label: "Cash" };
var MPESA_STK = { value: "mpesa", label: "M-Pesa (STK / Paybill)" };
var MPESA_MANUAL = { value: "mpesa_manual", label: "M-Pesa code (sighted)", requiresReference: true };
var BANK = { value: "bank", label: "Bank transfer", requiresReference: true };
var CHEQUE = { value: "cheque", label: "Cheque", requiresReference: true };
var CARD = { value: "card", label: "Card" };
var CARD_MANUAL = { value: "card_manual", label: "Card (PDQ)", requiresReference: true };
var PAYSTACK = { value: "paystack", label: "Paystack" };
var STORE_CREDIT = { value: "store_credit", label: "Store credit" };
var CUSTOMER_ADVANCE = { value: "customer_advance", label: "Customer advance" };
var MPESA_B2C = { value: "mpesa_b2c", label: "M-Pesa (send to customer)" };
var MPESA_B2B = { value: "mpesa_b2b", label: "M-Pesa (send to supplier till/paybill)" };
var MTN_MOMO = { value: "mtn_momo", label: "MTN Mobile Money", requiresReference: true };
var AIRTEL_MONEY = { value: "airtel_money", label: "Airtel Money", requiresReference: true };
var BANK_TRANSFER = { value: "bank_transfer", label: "Bank Transfer", requiresReference: true };
var RECEIVE_METHODS = [CASH, MPESA_STK, MPESA_MANUAL, BANK, CHEQUE, CARD, PAYSTACK, STORE_CREDIT, MTN_MOMO, AIRTEL_MONEY, BANK_TRANSFER];
var PAYOUT_METHODS = [CASH, MPESA_B2C, BANK, CHEQUE];
var PAY_SUPPLIER_METHODS = [CASH, MPESA_B2B, BANK, CHEQUE, CARD, BANK_TRANSFER];
var SETTLE_CREDIT_SALE_METHODS = [CASH, MPESA_MANUAL, CARD_MANUAL, BANK, CHEQUE, PAYSTACK, MTN_MOMO, AIRTEL_MONEY, BANK_TRANSFER];
function nowDatetimeLocal() {
  const d = /* @__PURE__ */ new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
function datetimeLocalToISO(value) {
  if (!value) return void 0;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? void 0 : d.toISOString();
}
function SettlementModal({
  open,
  mode,
  title,
  subjectName,
  amountLabel,
  amountValue,
  currency = "KES",
  defaultAmount,
  maxAmount,
  allowOverpayment = false,
  methods,
  onSubmit,
  onClose,
  isPending = false,
  extraFields,
  onMethodChange
}) {
  const [amount, setAmount] = react.useState(String(defaultAmount ?? amountValue));
  const [method, setMethod] = react.useState(methods[0]?.value ?? "");
  const onMethodChangeRef = react.useRef(onMethodChange);
  onMethodChangeRef.current = onMethodChange;
  react.useEffect(() => {
    if (method) onMethodChangeRef.current?.(method);
  }, [method]);
  const [reference, setReference] = react.useState("");
  const [effectiveAt, setEffectiveAt] = react.useState(nowDatetimeLocal());
  const [overpaymentAction, setOverpaymentAction] = react.useState("change");
  const [error, setError] = react.useState("");
  const selectedMethod = react.useMemo(() => methods.find((m) => m.value === method), [methods, method]);
  if (!open || typeof document === "undefined") return null;
  const fmt = (v) => `${currency} ${v.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const parsedAmount = parseFloat(amount) || 0;
  const overpaid = allowOverpayment && parsedAmount > amountValue + 1e-4;
  const surplus = overpaid ? parsedAmount - amountValue : 0;
  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (typeof maxAmount === "number" && amt > maxAmount + 1e-4) {
      setError(`Amount exceeds ${fmt(maxAmount)}.`);
      return;
    }
    if (selectedMethod?.requiresReference && !reference.trim()) {
      setError("A reference is required for this method.");
      return;
    }
    if (!effectiveAt) {
      setError("Enter the payment date & time.");
      return;
    }
    setError("");
    try {
      await onSubmit({
        amount: amt,
        method: methods.length ? method : void 0,
        reference: reference.trim() || void 0,
        effectiveAt: datetimeLocalToISO(effectiveAt),
        overpaymentAction: overpaid ? overpaymentAction : void 0
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4", onClick: () => !isPending && onClose(), children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full max-w-xl", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white rounded-2xl shadow-xl overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-gray-200", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-base font-bold text-gray-900", children: title }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: onClose,
            disabled: isPending,
            className: "p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg bg-gray-50 px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-semibold text-gray-900", children: subjectName }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs text-gray-500", children: [
            amountLabel,
            ": ",
            fmt(amountValue)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "text-xs font-semibold text-gray-500", children: [
              "Amount (",
              currency,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "number",
                inputMode: "decimal",
                value: amount,
                onChange: (e) => setAmount(e.target.value),
                className: "w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-xs font-semibold text-gray-500", children: "Payment date & time" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "datetime-local",
                value: effectiveAt,
                max: nowDatetimeLocal(),
                onChange: (e) => setEffectiveAt(e.target.value),
                className: "w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black"
              }
            )
          ] })
        ] }),
        overpaid && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs font-medium text-amber-800", children: [
            "This is ",
            fmt(surplus),
            " more than ",
            amountLabel.toLowerCase(),
            ". What should happen to the difference?"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                onClick: () => setOverpaymentAction("change"),
                className: `flex-1 py-1.5 rounded-md text-xs font-semibold border ${overpaymentAction === "change" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`,
                children: "Give change"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                onClick: () => setOverpaymentAction("store_credit"),
                className: `flex-1 py-1.5 rounded-md text-xs font-semibold border ${overpaymentAction === "store_credit" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`,
                children: "Add to store credit"
              }
            )
          ] })
        ] }),
        extraFields,
        (methods.length > 0 || selectedMethod?.requiresReference || mode === "apply_to_debt") && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `grid gap-3 ${methods.length > 0 && (selectedMethod?.requiresReference || mode === "apply_to_debt") ? "grid-cols-2" : "grid-cols-1"}`, children: [
          methods.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "text-xs font-semibold text-gray-500", children: "Method" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "select",
              {
                value: method,
                onChange: (e) => setMethod(e.target.value),
                className: "w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black",
                children: methods.map((m) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: m.value, children: m.label }, m.value))
              }
            )
          ] }),
          (selectedMethod?.requiresReference || mode === "apply_to_debt") && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "text-xs font-semibold text-gray-500", children: [
              "Reference ",
              selectedMethod?.requiresReference ? "" : "(optional)"
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                value: reference,
                onChange: (e) => setReference(e.target.value),
                placeholder: "M-Pesa code, cheque no., etc.",
                className: "w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black"
              }
            )
          ] })
        ] }),
        error && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-red-600", children: error }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              onClick: onClose,
              disabled: isPending,
              className: "flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              onClick: submit,
              disabled: isPending,
              className: "flex-1 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2",
              children: [
                isPending && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" }),
                "Confirm"
              ]
            }
          )
        ] })
      ] })
    ] }) }) }),
    document.body
  );
}

// src/components/payments/currency.ts
var CURRENCY_META = {
  KES: { code: "KES", name: "Kenyan Shilling", symbol: "Ksh", decimalPlaces: 2 },
  USD: { code: "USD", name: "US Dollar", symbol: "$", decimalPlaces: 2 },
  EUR: { code: "EUR", name: "Euro", symbol: "\u20AC", decimalPlaces: 2 },
  GBP: { code: "GBP", name: "British Pound", symbol: "\xA3", decimalPlaces: 2 },
  UGX: { code: "UGX", name: "Ugandan Shilling", symbol: "USh", decimalPlaces: 0 },
  TZS: { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", decimalPlaces: 2 },
  ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", decimalPlaces: 2 },
  NGN: { code: "NGN", name: "Nigerian Naira", symbol: "\u20A6", decimalPlaces: 2 },
  GHS: { code: "GHS", name: "Ghanaian Cedi", symbol: "GH\u20B5", decimalPlaces: 2 },
  RWF: { code: "RWF", name: "Rwandan Franc", symbol: "FRw", decimalPlaces: 0 },
  ETB: { code: "ETB", name: "Ethiopian Birr", symbol: "Br", decimalPlaces: 2 },
  EGP: { code: "EGP", name: "Egyptian Pound", symbol: "E\xA3", decimalPlaces: 2 },
  INR: { code: "INR", name: "Indian Rupee", symbol: "\u20B9", decimalPlaces: 2 },
  CNY: { code: "CNY", name: "Chinese Yuan", symbol: "\xA5", decimalPlaces: 2 },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "\xA5", decimalPlaces: 0 },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", decimalPlaces: 2 },
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", decimalPlaces: 2 },
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimalPlaces: 2 },
  AED: { code: "AED", name: "UAE Dirham", symbol: "\u062F.\u0625", decimalPlaces: 2 },
  SAR: { code: "SAR", name: "Saudi Riyal", symbol: "\uFDFC", decimalPlaces: 2 }
};
var SUPPORTED_CURRENCIES = Object.keys(CURRENCY_META);
function decimalPlacesFor(currency) {
  return CURRENCY_META[currency]?.decimalPlaces ?? 2;
}
function formatCurrency(amount, currency = "KES") {
  const dp = decimalPlacesFor(currency);
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      minimumFractionDigits: dp,
      maximumFractionDigits: dp
    }).format(Number(amount ?? 0));
  } catch {
    const meta = CURRENCY_META[currency];
    const n = Number(amount ?? 0);
    return `${meta?.symbol ?? currency} ${n.toLocaleString(void 0, { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
  }
}
function formatCompactCurrency(amount, currency = "KES") {
  const n = Number(amount) || 0;
  const abs = Math.abs(n);
  if (abs < 1e3) return formatCurrency(n, currency);
  const units = [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];
  for (const [div, suffix] of units) {
    if (abs >= div) {
      const v = n / div;
      const truncated = Math.trunc(v * 10) / 10;
      const s = truncated.toFixed(1).replace(/\.0$/, "");
      return `${currency} ${s}${suffix}`;
    }
  }
  return formatCurrency(n, currency);
}

// src/components/payments/payment-method-labels.ts
var PAYMENT_METHOD_LABELS = {
  cash: "Cash",
  card: "Card",
  card_manual: "Card / PDQ",
  pdq: "Card / PDQ",
  card_terminal: "Card / PDQ",
  cheque: "Cheque",
  bank_transfer: "Bank Transfer",
  bank: "Bank Transfer",
  mpesa: "M-Pesa",
  mpesa_stk: "M-Pesa (STK Push)",
  mpesa_manual: "M-Pesa (Code)",
  mpesa_b2c: "M-Pesa (sent to customer)",
  mpesa_b2b: "M-Pesa (sent to supplier)",
  // Legacy alias: rows captured before 2026-07-13 stored the M-Pesa-Code tender as bare
  // "manual" (backfilled server-side, but keep the label so any straggler still reads right).
  manual: "M-Pesa (Code)",
  paystack: "Paystack",
  wallet: "Wallet",
  cod: "Cash on Delivery",
  mtn_momo: "MTN Mobile Money",
  airtel_money: "Airtel Money",
  // PayHero (treasury gateway since 2026-10-02): cross-border mobile money, card hosted checkout,
  // bank deposits and the offline paybill all run on it.
  mobile_money: "Mobile Money",
  payhero: "PayHero",
  payhero_momo: "Mobile Money (PayHero)",
  payhero_card: "Card (PayHero)",
  payhero_bank: "Bank Deposit (PayHero)",
  payhero_offline: "M-Pesa Paybill (PayHero)",
  store_credit: "Store Credit",
  customer_advance: "Customer Advance",
  on_account: "On Account",
  room_charge: "Room Charge",
  complimentary: "Complimentary",
  insurance: "Insurance",
  loyalty: "Loyalty Points"
};
function getPaymentMethodLabel(method, providerName) {
  if (!method) return "\u2014";
  const base = method === "multiple" ? "Multiple" : PAYMENT_METHOD_LABELS[method] ?? method.replace(/_/g, " ");
  return providerName ? `${base} (${providerName})` : base;
}
function AirtelMoneyLogo({ className, style, title = "Airtel Money" }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 724.26 729.61", className, style, role: "img", "aria-label": title, children: [
    /* @__PURE__ */ jsxRuntime.jsx("title", { children: title }),
    /* @__PURE__ */ jsxRuntime.jsxs("g", { transform: "matrix(0.1,0,0,-0.1,-86.672636,774.61335)", fill: "#ff0000", children: [
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m 4880,7740 c -14,-4 -47,-8 -73,-9 -104,-2 -440,-87 -562,-141 -11,-5 -42,-18 -70,-29 -73,-28 -266,-120 -296,-142 -14,-9 -37,-21 -52,-24 -15,-4 -27,-11 -27,-15 0,-4 -8,-10 -17,-14 -10,-3 -31,-15 -48,-26 -16,-11 -40,-24 -53,-30 -13,-5 -38,-21 -56,-35 -18,-14 -36,-25 -39,-25 -23,0 -345,-234 -436,-316 -74,-67 -211,-213 -211,-225 0,-3 -9,-17 -21,-30 -30,-34 -120,-176 -146,-229 -11,-25 -33,-69 -47,-99 -49,-100 -69,-209 -64,-336 6,-125 34,-190 119,-276 89,-89 184,-128 334,-136 103,-5 177,3 280,32 33,9 77,20 98,26 21,5 45,13 55,19 23,12 152,70 158,70 18,0 229,129 424,259 129,86 242,161 252,166 9,6 70,42 135,81 65,38 145,84 178,101 33,17 80,42 105,55 25,12 72,34 105,46 33,13 74,30 90,37 17,7 41,18 55,24 39,16 127,32 213,38 186,12 316,-70 383,-242 16,-41 19,-75 19,-195 0,-146 -13,-226 -52,-320 -8,-19 -19,-46 -25,-60 -50,-120 -153,-292 -271,-448 -112,-150 -353,-399 -512,-530 -55,-46 -116,-96 -135,-112 -42,-35 -91,-70 -145,-106 -22,-14 -58,-38 -80,-54 -62,-42 -227,-130 -320,-170 -27,-12 -64,-28 -82,-36 -17,-8 -40,-14 -51,-14 -10,0 -33,-5 -51,-11 -65,-23 -131,21 -131,88 0,82 39,134 285,378 266,264 295,303 295,403 0,103 -49,173 -159,229 -48,25 -66,28 -150,28 -98,0 -155,-14 -226,-57 -16,-10 -41,-23 -55,-30 -14,-7 -27,-15 -30,-18 -3,-3 -23,-18 -45,-35 -53,-40 -146,-135 -199,-204 -37,-48 -64,-93 -127,-211 -52,-98 -99,-280 -99,-386 0,-215 112,-387 285,-436 52,-15 264,-15 337,-1 72,15 260,73 272,84 6,5 16,9 24,9 26,0 323,151 425,217 23,15 49,32 59,38 9,5 56,34 105,64 48,30 90,58 93,61 3,4 37,29 75,55 39,27 84,58 100,69 17,12 64,48 105,81 260,207 490,428 624,600 22,27 42,52 45,55 8,6 76,104 123,178 21,31 53,86 71,122 19,36 45,85 58,110 13,25 41,90 63,145 21,55 42,109 46,120 28,71 71,254 90,385 21,148 5,391 -36,525 -17,55 -21,65 -58,145 -80,172 -208,328 -355,430 -20,14 -45,33 -56,44 -36,32 -219,114 -326,145 -57,17 -142,35 -189,42 -108,14 -367,21 -400,9 z" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m 7779,2795 c -3,-2 -49,-11 -104,-20 -55,-8 -145,-23 -200,-33 l -100,-17 v -920 c 0,-999 -2,-957 57,-1082 20,-43 48,-80 91,-119 106,-97 205,-127 416,-128 180,0 173,-7 169,159 l -3,120 -77,7 c -137,12 -203,67 -218,181 -4,34 -7,462 -6,950 1,845 -1,926 -25,902 z" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m 5010,2775 c -222,-33 -296,-47 -305,-58 -7,-8 -8,-327 -5,-937 5,-852 7,-929 23,-970 38,-97 58,-131 109,-182 105,-105 239,-148 459,-148 122,0 139,2 147,18 10,19 15,193 7,233 -6,25 -10,26 -85,32 -95,6 -151,38 -190,107 l -25,45 -3,518 c -2,386 0,522 9,533 9,11 43,14 150,14 165,0 151,-16 147,175 l -3,130 -140,5 c -77,3 -146,9 -152,13 -10,6 -13,67 -13,248 v 239 l -22,-1 c -13,-1 -61,-7 -108,-14 z" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m 1545,2324 c -75,-7 -255,-50 -310,-74 -11,-5 -31,-12 -45,-16 -44,-12 -190,-85 -190,-95 0,-5 9,-28 19,-52 66,-145 91,-197 96,-197 3,0 13,4 23,9 51,26 113,51 162,66 30,9 66,21 80,26 56,20 205,30 274,19 136,-22 186,-85 194,-246 4,-89 4,-91 -19,-97 -13,-4 -105,-7 -204,-7 -238,0 -311,-14 -465,-89 -132,-64 -230,-185 -277,-341 -24,-83 -21,-238 6,-320 90,-272 304,-431 602,-447 271,-15 550,66 729,210 l 65,53 3,529 c 3,613 2,634 -72,784 -33,68 -144,176 -213,206 -32,15 -67,30 -78,35 -75,33 -265,55 -380,44 z m 295,-964 c 6,-8 10,-127 10,-271 0,-284 4,-266 -70,-305 -28,-15 -59,-18 -156,-19 h -121 l -50,34 c -27,18 -59,48 -70,65 -74,108 -69,301 9,396 23,29 111,90 127,90 10,0 21,4 27,9 14,15 60,19 177,17 84,-1 110,-4 117,-16 z" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m 4040,2300 c -199,-47 -358,-132 -518,-278 l -42,-38 v -730 c 0,-401 0,-737 0,-747 0,-16 15,-17 218,-15 l 217,3 3,697 2,696 38,30 c 45,36 67,47 125,67 69,23 177,34 258,25 40,-4 78,-6 84,-3 7,2 25,36 41,76 15,40 39,92 51,116 33,63 30,79 -14,89 -21,5 -59,14 -86,20 -71,18 -288,13 -377,-8 z" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m 6215,2298 c -33,-5 -64,-14 -69,-19 -6,-5 -16,-9 -24,-9 -8,0 -44,-14 -79,-32 -77,-38 -195,-147 -245,-228 -44,-71 -95,-177 -103,-215 -4,-16 -10,-39 -15,-50 -4,-11 -16,-54 -26,-95 -27,-108 -27,-454 -1,-555 24,-93 78,-235 88,-235 5,0 9,-5 9,-11 0,-38 119,-189 203,-257 37,-30 120,-73 182,-94 67,-23 215,-48 281,-48 142,0 398,61 483,115 20,12 47,26 61,30 30,9 96,50 104,64 9,14 -103,241 -118,241 -7,0 -25,-9 -39,-20 -14,-11 -31,-20 -39,-20 -7,0 -22,-6 -33,-14 -11,-7 -63,-28 -115,-46 -89,-31 -104,-33 -235,-34 -124,0 -145,2 -185,21 -140,67 -220,236 -220,464 0,49 1,90 3,91 1,2 223,5 492,8 l 490,5 -3,100 c -6,196 -58,460 -103,520 -4,6 -18,31 -31,56 -54,107 -168,199 -303,244 -99,34 -280,44 -410,23 z m 215,-318 c 42,-11 130,-82 130,-104 0,-6 7,-24 15,-39 23,-45 41,-193 25,-212 -10,-13 -49,-15 -251,-15 h -239 l -6,25 c -13,51 22,188 62,241 44,59 83,89 141,106 32,9 63,15 70,13 6,-2 30,-9 53,-15 z" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m 2770,3002 c -76,-39 -99,-58 -132,-107 -32,-49 -33,-53 -33,-155 v -106 l 38,-52 c 45,-61 75,-83 141,-106 89,-29 166,-18 255,38 107,68 144,242 79,370 -23,45 -43,66 -103,104 -54,35 -191,43 -245,14 z" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m 3015,2280 c -16,-5 -61,-14 -100,-19 -38,-5 -108,-15 -155,-22 -47,-6 -88,-15 -93,-18 -9,-8 -10,-1707 -2,-1722 4,-5 93,-9 210,-9 204,0 205,0 210,23 3,12 4,416 3,897 -3,867 -3,875 -23,877 -11,1 -33,-2 -50,-7 z" })
    ] })
  ] });
}
function MtnMomoLogo({ className, style, title = "MTN MoMo" }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 200 200", className, style, role: "img", "aria-label": title, children: [
    /* @__PURE__ */ jsxRuntime.jsx("title", { children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { width: "200", height: "200", fill: "#FFFFFF" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "9.75", y: "9.73", width: "180.52", height: "180.52", fill: "#FFCB05" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { fill: "#00678F", d: "M184.62,99.47c0,19.27-37.88,34.89-84.6,34.89c-46.73,0-84.61-15.62-84.61-34.89s37.88-34.88,84.61-34.88C146.74,64.59,184.62,80.2,184.62,99.47" }),
    /* @__PURE__ */ jsxRuntime.jsx("polygon", { fill: "#FFFFFF", points: "45.81,116.69 54.56,81.8 68.54,81.8 68.54,102.12 77.73,81.8 92.16,81.8 83.42,116.69 74.23,116.69 79.47,94.17 68.54,116.69 61.12,116.69 61.12,94.17 55.42,116.69" }),
    /* @__PURE__ */ jsxRuntime.jsx("polygon", { fill: "#ED1D24", points: "94.99,117.13 96.3,112.27 106.36,112.27 105.04,117.13" }),
    /* @__PURE__ */ jsxRuntime.jsx("polygon", { fill: "#FFFFFF", points: "117.5,116.69 126.24,81.8 136.3,81.8 140.68,100.36 145.48,81.8 154.66,81.8 145.92,116.69 136.3,116.69 131.49,97.7 126.68,116.69" }),
    /* @__PURE__ */ jsxRuntime.jsx("polygon", { fill: "#FFCB05", points: "94.99,81.8 92.8,90.64 101.99,90.64 97.04,109.81 107.09,109.81 112.05,90.64 121.23,90.64 123.41,81.8" })
  ] });
}
function MpesaLogo({ className, style, title = "M-Pesa" }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 512 273", className, style, role: "img", "aria-label": title, children: [
    /* @__PURE__ */ jsxRuntime.jsx("title", { children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { fill: "#39b54a", stroke: "#39b54a", strokeWidth: "2", d: "m361 184c-6.68-1.88-14.8-5.54-19.9-8.94-1.52-1.02-1.180-2.66 1.73-8.42l3.62-7.15 9.09 4.74c15.9 8.33 29 7.71 29-1.4 0-4.39-3.64-6.710-16.4-10.4-17.5-5.12-25.4-13.2-24.1-24.4 1.71-14 12.7-21.4 31.2-21.3 10.9 0.114 26.2 4.19 28.2 7.54 0.754 1.220-4.68 15.5-5.89 15.5-0.323 0-2.95-1.18-5.82-2.62-13.7-6.88-27.1-6.75-27.1 0.259 0 4.67 3.4 7.15 14.8 10.8 14.8 4.79 20 8.11 23.4 15.1 3.36 6.94 2.86 14-1.48 21.2-5.65 9.29-25.2 13.9-40.6 9.62zm-351-38.1v-38.8h21.2l11.3 22.6c6.22 12.4 11.6 22.6 12 22.6s5.77-10.2 12-22.6l11.3-22.6h21.2v77.6h-16.9v-24c0-13.2-0.486-24-1.08-24-0.595 0-5.3 8.88-10.5 19.7l-9.38 19.7h-13.1l-20.3-41.6-0.77 50.1h-16.9zm188-0.203v-38.9l21.7 0.73c18.6 0.626 22.7 1.18 28.2 3.85 9.45 4.57 12.7 9.93 13.3 21.9 0.942 19.9-8.5 28.6-32.1 30l-12.7 0.725v20.7h-18.3zm41.7-0.948c3.02-2.59 3.79-4.5 3.79-9.29 0-9.26-3.54-11.9-16.6-12.6l-10.6-0.533v25.7h9.79c8.21 0 10.4-0.53 13.6-3.27zm31.6 1.15v-38.8h59.2v15.5h-40.9v15.5h38.1v15.5h-38.1v15.5h42.3v15.5h-60.6zm142 30.7c1.93-4.5 9.38-21.9 16.5-38.5l13-30.3 19.7-0.805 15.1 36.4c8.32 20 15.5 37.5 16.1 38.9 0.83 2.31 0.0141 2.5-9.31 2.12l-10.2-0.417-4.68-12.7h-34.8l-4.95 12.7-20 0.828zm49.6-21.9c-6.36-17.3-10.1-26.4-10.8-26.4-0.478 7e-3 -3.09 5.84-5.81 13-2.71 7.12-5.15 13.5-5.4 14.1-0.258 0.625 4.72 1.14 11.1 1.14 8.64 0 11.4-0.443 10.9-1.76z" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { fill: "#d8e3d2", fillRule: "evenodd", d: "m172 80.6v9.36c-15.2 0.0524-30.2 0.0158-45.3 0.0158-12.9 0-14.4 6.09-14.4 15.7v131c0 7.81 6.44 14.1 14.4 14.1h43.1c7.99 0 14.4-6.29 14.4-14.1v-157c0-1.97-1.59-5.95-5.39-5.77-4.27 0.237-6.78 3.37-6.91 5.770zm-37.1 27.1h27.6c11.6 0 13.2 7.25 13.2 15.1v46.7c0 5.8-5.03 14.9-13.2 14.9h-27.6c-9.97 0-15.2-8.6-15.2-14.9v-46.7c0-7.81 4.13-15.1 15.2-15.1z" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { fill: "#9d4c44", fillRule: "evenodd", d: "m104 155c9.07-0.942 17.2-5.6 26.4-17.6 10.4 15.8 24.7 15.2 39.2 16.8-15.6 0.163-13.6 5.52-34.8 4.03-6.77-0.473-17.9-0.936-30.7-3.19z" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { fill: "#ed1c24", fillRule: "evenodd", d: "m161 122 33.8 16.4c-24.1 26.9-58.5 25.1-90.2 16.8 17.5-0.0728 33 6.4 56.3-33.1z" })
  ] });
}
var PAYSTACK_MARK = "M22.32 2.663H1.306C.594 2.663 0 3.263 0 3.985v2.37c0 .74.594 1.324 1.307 1.324h21.012c.73 0 1.307-.602 1.324-1.323V4.002c0-.738-.594-1.34-1.323-1.34zm0 13.192H1.306a1.3 1.3 0 00-.924.388 1.33 1.33 0 00-.383.935v2.37c0 .74.594 1.323 1.307 1.323h21.012c.73 0 1.307-.584 1.324-1.322v-2.371c0-.739-.594-1.323-1.323-1.323zm-9.183 6.58H1.307c-.347 0-.68.139-.924.387a1.33 1.33 0 00-.383.935v2.37c0 .74.594 1.323 1.307 1.323H13.12c.73 0 1.307-.6 1.307-1.322v-2.371a1.29 1.29 0 00-1.29-1.323zM23.643 9.258H1.307c-.347 0-.68.14-.924.387a1.33 1.33 0 00-.383.936v2.37c0 .739.594 1.323 1.307 1.323h22.32c.73 0 1.306-.601 1.306-1.323v-2.37a1.301 1.301 0 00-1.29-1.323z";
var PAYSTACK_WORDMARK = "M48.101 8.005a6.927 6.927 0 00-2.274-1.563 7.041 7.041 0 00-2.716-.55 5.767 5.767 0 00-2.63.567c-.55.263-1.046.63-1.46 1.082V7.13a.876.876 0 00-.22-.567.721.721 0 00-.56-.258h-2.937a.697.697 0 00-.56.258.796.796 0 00-.221.567v19.566c0 .206.085.412.22.566a.776.776 0 00.56.224h2.971c.204 0 .39-.086.543-.224a.7.7 0 00.238-.566v-6.683c.424.464.967.808 1.561 1.014.781.292 1.596.43 2.427.43.95 0 1.884-.173 2.75-.55a6.859 6.859 0 002.308-1.58 7.45 7.45 0 001.562-2.457 8.34 8.34 0 00.577-3.213 8.761 8.761 0 00-.577-3.229A7.775 7.775 0 0048.1 8.005zm-2.681 7.077a3.33 3.33 0 01-.696 1.117 3.177 3.177 0 01-2.36 1.013c-.458 0-.899-.086-1.306-.275a3.324 3.324 0 01-1.07-.738 3.673 3.673 0 01-.713-1.117 3.837 3.837 0 010-2.748c.153-.412.408-.79.713-1.1a3.576 3.576 0 011.07-.755 2.888 2.888 0 011.306-.275c.459 0 .9.086 1.324.274.39.19.747.43 1.053.74.305.326.526.686.696 1.099a3.976 3.976 0 01-.017 2.765zm20.808-8.778h-2.953a.728.728 0 00-.543.24.823.823 0 00-.237.585v.36a4.143 4.143 0 00-1.341-1.03 5.652 5.652 0 00-2.58-.567 7.222 7.222 0 00-5.075 2.096 7.733 7.733 0 00-1.63 2.456 8.036 8.036 0 00-.61 3.23 8.15 8.15 0 00.61 3.23 7.880 7.880 0 001.613 2.456 6.959 6.959 0 005.058 2.112c.9.018 1.782-.171 2.597-.567.509-.257.984-.6 1.358-1.03v.395c0 .206.084.412.237.567.153.137.34.223.543.223h2.953a.855.855 0 00.56-.223.768.768 0 00.221-.567V7.129a.796.796 0 00-.22-.567.697.697 0 00-.56-.258zm-3.988 8.761a3.33 3.33 0 01-.696 1.117 3.83 3.83 0 01-1.052.755c-.832.378-1.8.378-2.631 0a3.575 3.575 0 01-1.07-.755 3.326 3.326 0 01-.695-1.117 3.976 3.976 0 010-2.731c.152-.412.39-.773.696-1.1.305-.309.661-.566 1.069-.755a3.194 3.194 0 012.630 0c.391.189.748.429 1.053.738.289.327.526.687.696 1.1.34.893.34 1.872 0 2.748zm33.437-1.77a4.794 4.794 0 00-1.443-.875 10.054 10.054 0 00-1.731-.516l-2.258-.446c-.577-.103-.984-.258-1.205-.447a.712.712 0 01-.305-.567c0-.24.136-.446.424-.618.39-.206.815-.31 1.256-.275.577 0 1.154.12 1.68.343.51.224 1.019.482 1.477.79.662.413 1.222.344 1.612-.12l1.087-1.236c.203-.207.322-.481.34-.773a1.06 1.06 0 00-.408-.773c-.459-.395-1.188-.825-2.156-1.237-.967-.412-2.190-.636-3.632-.636a8.343 8.343 0 00-2.597.378 6.273 6.273 0 00-1.986 1.03 4.552 4.552 0 00-1.273 1.564 4.417 4.417 0 00-.441 1.907c0 1.22.373 2.216 1.103 2.954.73.739 1.698 1.22 2.903 1.46l2.342.516c.51.086 1.018.24 1.494.464.254.103.424.36.424.652 0 .258-.136.498-.424.705-.289.206-.764.343-1.375.343a4.051 4.051 0 01-1.85-.412 6.792 6.792 0 01-1.51-.996 2.037 2.037 0 00-.68-.378c-.271-.086-.594 0-.95.292l-1.29.979a1.147 1.147 0 00-.458 1.134c.067.43.424.858 1.086 1.357a9.543 9.543 0 005.516 1.632 8.993 8.993 0 002.699-.378 6.830 6.830 0 002.087-1.048c.56-.43 1.036-.98 1.358-1.615a4.543 4.543 0 00.475-2.01 4.168 4.168 0 00-.373-1.82 4.638 4.638 0 00-1.018-1.323zm12.899 3.574a.857.857 0 00-.645-.43c-.271 0-.543.086-.764.24a2.43 2.43 0 01-1.205.396c-.136 0-.288-.017-.424-.052a.777.777 0 01-.39-.206 1.43 1.43 0 01-.323-.446 2.092 2.092 0 01-.136-.79v-5.36h3.836a.86.86 0 00.594-.258.77.77 0 00.255-.567V7.13a.773.773 0 00-.255-.584.833.833 0 00-.577-.24h-3.836v-3.66a.736.736 0 00-.237-.584.814.814 0 00-.544-.223h-2.987a.817.817 0 00-.577.223.838.838 0 00-.254.584v3.66h-1.698a.697.697 0 00-.56.257.876.876 0 00-.22.567v2.267c0 .206.084.413.22.567a.65.65 0 00.56.258h1.698v6.373a5.140 5.140 0 00.441 2.199 4.575 4.575 0 001.137 1.477c.475.395 1.035.67 1.612.842a6.125 6.125 0 001.851.275 7.73 7.73 0 002.427-.396 4.802 4.802 0 001.918-1.202.999.999 0 00.101-1.271l-1.018-1.65zm16.175-10.565h-2.953a.728.728 0 00-.543.24.822.822 0 00-.238.585v.36a4.13 4.13 0 00-1.341-1.03 5.670 5.670 0 00-2.596-.567 7.152 7.152 0 00-5.058 2.096 7.468 7.468 0 00-1.63 2.456 8.017 8.017 0 00-.611 3.212 8.156 8.156 0 00.611 3.23c.374.91.934 1.752 1.613 2.456a7.006 7.006 0 005.041 2.13 5.884 5.884 0 002.596-.55c.51-.257.985-.6 1.358-1.03v.378c.002.21.084.41.23.557a.783.783 0 00.551.233h2.970a.78.78 0 00.781-.773V7.13a.795.795 0 00-.221-.567.696.696 0 00-.56-.258zm-3.988 8.761a3.34 3.34 0 01-.696 1.117 3.83 3.83 0 01-1.053.755 2.907 2.907 0 01-1.323.275c-.459 0-.9-.103-1.307-.275a3.576 3.576 0 01-1.070-.755 3.34 3.34 0 01-.696-1.117 3.982 3.982 0 010-2.731 3.27 3.27 0 01.696-1.1c.306-.309.662-.566 1.070-.755a3.077 3.077 0 011.307-.275c.458 0 .899.086 1.323.274.391.19.747.43 1.053.74.305.326.543.686.696 1.099a3.67 3.67 0 010 2.748zm20.198 1.615l-1.698-1.306c-.322-.257-.628-.326-.899-.223a1.82 1.82 0 00-.628.447 6.03 6.03 0 01-1.29 1.168c-.509.292-1.07.43-1.647.395a3.165 3.165 0 01-1.855-.575 3.224 3.224 0 01-1.183-1.555 4.046 4.046 0 01-.237-1.34c0-.464.067-.928.237-1.374.153-.413.374-.79.679-1.1.306-.309.662-.567 1.052-.739a3.175 3.175 0 011.324-.291 3.06 3.06 0 011.647.412 5.610 5.610 0 011.290 1.168c.169.189.373.343.611.447.271.103.577.034.882-.224l1.698-1.288c.203-.138.373-.344.441-.584a.923.923 0 00-.068-.79 7.35 7.35 0 00-2.614-2.457c-1.12-.635-2.461-.962-3.955-.962a8.163 8.163 0 00-3.072.601 7.650 7.650 0 00-2.495 1.65 7.357 7.357 0 00-1.663 2.473 8.154 8.154 0 000 6.133c.39.927.95 1.769 1.663 2.456a7.876 7.876 0 005.567 2.25c1.494 0 2.835-.326 3.955-.962a7.307 7.307 0 002.631-2.473.886.886 0 00.068-.773 1.167 1.167 0 00-.441-.584zm15.716 3.057l-4.667-6.854 3.989-5.273a.978.978 0 00.169-.86c-.068-.205-.254-.429-.746-.429h-3.157a1.39 1.39 0 00-.527.12 1.058 1.058 0 00-.458.447l-3.191 4.467h-.764V.79a.794.794 0 00-.22-.567.78.78 0 00-.56-.223h-2.954a.856.856 0 00-.56.223.72.72 0 00-.237.567v19.48c0 .223.084.43.237.567a.778.778 0 00.56.223h2.954a.856.856 0 00.56-.223.794.794 0 00.22-.567v-5.153h.849l3.479 5.342c.204.378.595.618 1.019.618h3.310c.509 0 .712-.24.797-.446a.933.933 0 00-.102-.894zM83.015 6.304h-3.310a.852.852 0 00-.662.258 1.178 1.178 0 00-.305.55l-2.445 9.104H75.7l-2.613-9.104a1.54 1.54 0 00-.255-.533.756.756 0 00-.594-.275h-3.429c-.44 0-.712.138-.831.43-.085.257-.085.55 0 .807l4.192 12.798c.068.189.17.378.323.515.17.155.39.24.627.223h1.766l-.153.413-.39 1.185c-.12.36-.34.687-.645.927a1.58 1.58 0 01-.985.327c-.305 0-.61-.069-.882-.19a3.618 3.618 0 01-.781-.463 1.29 1.29 0 00-.747-.24h-.034a.908.908 0 00-.747.463l-1.052 1.546c-.424.67-.187 1.1.085 1.34a5.36 5.36 0 001.952 1.151 7.679 7.679 0 002.495.412c1.51 0 2.783-.412 3.75-1.236a7.067 7.067 0 002.122-3.333l4.855-15.838c.102-.275.119-.567.017-.842-.085-.189-.272-.395-.73-.395z";
function PaystackLogo({ className, style, title = "Paystack", wordmark = false }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: wordmark ? "0 0 157 28" : "0 0 25 28", className, style, role: "img", "aria-label": title, fill: "none", children: [
    /* @__PURE__ */ jsxRuntime.jsx("title", { children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: PAYSTACK_MARK, fill: "#00C3F7" }),
    wordmark && /* @__PURE__ */ jsxRuntime.jsx("path", { d: PAYSTACK_WORDMARK, fill: "#011B33" })
  ] });
}
function CashMark({ className, style, title = "Cash" }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 32 32", className, style, role: "img", "aria-label": title, children: [
    /* @__PURE__ */ jsxRuntime.jsx("title", { children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "16", cy: "16", r: "16", fill: "#059669" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "6.5", y: "10.5", width: "19", height: "11", rx: "2", fill: "#fff" }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "16", cy: "16", r: "2.9", fill: "#059669" }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "9.6", cy: "16", r: "1", fill: "#059669" }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "22.4", cy: "16", r: "1", fill: "#059669" })
  ] });
}
function CardMark({ className, style, title = "Card" }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 32 32", className, style, role: "img", "aria-label": title, children: [
    /* @__PURE__ */ jsxRuntime.jsx("title", { children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "16", cy: "16", r: "16", fill: "#2563EB" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "6.5", y: "9.5", width: "19", height: "13", rx: "2", fill: "#fff" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "6.5", y: "12.2", width: "19", height: "2.6", fill: "#1E3A8A" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "9", y: "17.6", width: "6", height: "2", rx: "1", fill: "#93C5FD" })
  ] });
}
function SplitPayMark({ className, style, title = "Multiple Pay" }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 32 32", className, style, role: "img", "aria-label": title, children: [
    /* @__PURE__ */ jsxRuntime.jsx("title", { children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "16", cy: "16", r: "16", fill: "#7C3AED" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "7", y: "9", width: "8", height: "14", rx: "1.6", fill: "#fff" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "17", y: "9", width: "8", height: "14", rx: "1.6", fill: "#fff" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "9", y: "12", width: "4", height: "1.6", rx: ".8", fill: "#C4B5FD" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "9", y: "15.2", width: "4", height: "1.6", rx: ".8", fill: "#C4B5FD" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "19", y: "12", width: "4", height: "1.6", rx: ".8", fill: "#C4B5FD" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "19", y: "15.2", width: "4", height: "1.6", rx: ".8", fill: "#C4B5FD" })
  ] });
}
var PAYHERO_MARK_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABaCAMAAAAIGK1gAAAAYFBMVEUAqIMEBAU0NUEoKk8SZ2QAn3E1KzoyNEAyM0AyMT0tKzcAqoUZYVcIknYAp4JYWFcAp5sA2p1dDxcA//8EmnkA9noA/wAAAP8GlngfWlQWaC9nZw/7AABfBV8gXlb//wBO2OvVAAAAIHRSTlP8AfsYDBFhqWCd8qHk7WAFDwQTAV0CAQGbsgYDAgNZAVs28oMAAAiaSURBVHjarZsLm6I6DIZbegXkoqg46uz8/3950kIpQtMCnuzuMzsjI69JvyZNC6EJ4+Jmv17e3Bq9DD8/i44eMWb+Mea+faWuJ9FX7/wMGJyLa/0oS1IRQsryUV8Ft4jtPjaplTet5aZfigK2xnnXR0lWVpZXYRh5+g6NdZtW2dqUkmy84gDgHW7+FgE4T2kYu3sqog0NwU2Qcoz7TkAYbJTXJGVXPlyK0MGNmc5SplmEEQEE34gH2WIm1ALhg9jpIttgeqcHwSd8G97oxTOGl201jY3FEOCTv69kh5VXmIwC76NVtsP0a6sHOX2WZJ893rRbioPl2T7LtwHyne4bTbz5B+Ify/Ybs+MiDsj55QgfjEQyD3MjsyOmmxQg8JXkmD38tB2f+WKmEiG+k8N8QHihfBx/eZb9X4TkUx7kG6sGQsZV9oVFAEEf5GtCyB5f8QEhQwB505TfAZIH4V/zZYoxBPAdzh719Vovzfwk9Gmub55n31reBAE7ZH4pI7XsGvJKAjeU2pjU2Nwj5XiFHDK3nGU94v33DyuqRHteWiuMmapiiXgqAsJk1igCmLPRqJvdZQDwybEZmGKFc9eeBX0u/F6tAKUb9Rcku8jxdfaiaykTJ2CClS8tjVT2HZT9IuHCqbTHSkMHOLsgZ0vAyz80y9L40oOnCCcHYYBsDegrRDLWp7zC6/rE8m3pwwWgchFukPpmNq3MLqCv1wwwUsGUnN+neI52az/WnILWEcLc318hGplKtNkF+o95wK7heDVKb+HRN1uJiJgL9ThnwP2S9b76SHnNBMgveIFf+3q+LodZGr60MMU8t7lQuxqPSWzNNA3SYl02WMCIA0EjYtS5WISecg/Y4oByqsEwwIsbLzpQNRDrwEiN6maZ1XQC6DMfokJWqSHoRbwAHDxrAWkVWZzz5+il6/olL58SB3wHJBDWSL5cAQyAHT4HGo2MgTzTej08bwhg5QknETcUm2UaZBqyKZnEJeI1cqblGt6tQkRXYjH2aQIT8bRQYosZPn+OIb5UacD7LQTo55wSy8j+/ohGpsKAsVBxTejtHYkwacXgpW6lEQPYIyEGwGKqjweAHptlJo2sV4ImxoSKd6zLIQQm4tn4vK9fdDGeVuM9JmKXCdm6UZJbD17og6TzSBhwHIMdDqgYjc8yU6qmTAVW8pTALFLFAEU4WQzjc/Tgcw3oYuwzMcNmmemCQPifBvBfVCMjg7iXgSTTuYqrXgO6RMsQjc6bg5jKYQogItrqaKd8JgIibpFEMvOgn2VkolQIAkKIu8tPFPCJyYCIUeDwGdr1b46D0E0yPVat+la2DvYZQCRREVNUBj6PCFpigNMI6xlTRb4yJb2IZFBBJJpHJhGvR5lfSwkhCAY4KxWYDtnUnA42nGAOIIlEd3MerJcLAUFjDhxVor1GKQuZbyjScCsJAKMiHt00T3RlWQt69wKhQZUNHtTNnx9k/Qqvn3W0WXgWh1xcbRExbcVkNqzYkukTULKt21BNUES0IdFSATwVWsbNdkYwvgFQ7dgo0+FJKOrBctbU7W7O5s1oQbG9qAGQbd9kDCYaSaMeLLEtGuc+1H+jSHyDILwJ4l9+hVN1QsV1FJBDpYhvllkP6hlAv36Hfo6KrOkJpzFAvKlgxmFsq9ECSjprq6uVZaqJ921SE7Vvy9y5t1t7tippo3uNA6CbhV9YWyauETNRR3IxaGQqFZauFG28XVxlxTyPoG0ZGmjLfAKe8TVdKVjnuxszg+ZCqpttq5nU/WciCn+C3GQSLitcxHeXLEpv2xr+BlCOMuhfidYlVm9ro2LGqgNLzpR9agTtGyXWpNqUW3gyxtoymwF9MYpWq120+WrWJFSgKnFtGUH3A9qCegrgJVVOh0Wcg2fBg0wjLmz5Ldzk3TgEFW/im4uTiJC2iLYefGIqKX2tdd0f4cJotEmIeDrXExaxZH+2NyN/4sXgmdbHNMKmPntCI2ER2SWzbWCGY3x1bRm+W8TDmk6n9x8arC0zNY8B8BeJcXuf2jLlEQeCRsbuNCZiX+LIsIP7wYMsHGNo5o9DUOzXcGHTQB/vrfoFkwynkRGQs6ALfVumPSIRZHshtEHCghrRrsMKPXT6E6lW290aKQbARLWcULkazu5ZkbDQKKxjfaMNDpwvOQ90PdyvjztNgWwy9Y26nRqpihHQaQATcRTQxZ84nVV7+kZbHJj5AO7YRHRWyA9AOPaZV9vbMpscOOUxkq5WZSgNvz42tFfppIw0/7bwbeit+ml69QkKvdwvhiCfPgHv4m5tZ6I7eUDmFnRZopym+P6dPxLA5GeQ61t7s8cTBC+POHBWraLl9MWNr0D0V4BkkU9mK+LyCF+q1vuo95d8mpHAuZnPIO9dhAz2I2Xuz/i65S8SYuyCYlblzAA5Xw7D/XYCr8hvT/aAQGbdKfJxaPdLQsMHhMV3gBI7u2VaoF8RnsbJVX/Fpyl2dutbHxq+xsybG88mo5MPww84NscJqx/g48PMzg6PQyXlolG3OCL6C4Q/1RE+Jfm0LQhvcuyMnlrEN3DI1hDm+514yj2f7UvqI4R5oKVN1ufvucx3OhHCC8lycYo/34tY5Gv/hU+iWyduR6xO5pP/fhwkh+PGTOfFTvexjUfle6htclVVm/E0W7+3GYh7nAjuC3WJkachhjhv8GJ1At1xhj2toTfKWeWSMrbvgRcOOUslEMF7EBiOP1Jj5KyK5NhTmh14IofbGJ1OSKir6jQEl8cfyEl5scjz6HZU7JkmZmIkgREgZ5jmm5Ohk5qxLY+BwQfNke6RyrX1Xn/wqTA7GMHyk/o5OVPqJ5cyqAwc0XxSI5liXm3B2d/km5D020MdRqXFhL8GTZraDEbAb99v4ev7xu7FmmjDk2uwSazMfyxb+jOmAX8vzEAaIm7+2Kf/4Mf7nqlr2GzLmE47xenH3v4DlyB7pgGzCV0AAAAASUVORK5CYII=";
function PayHeroLogo({ className, style, title = "PayHero" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    /* @__PURE__ */ jsxRuntime.jsx("img", { src: PAYHERO_MARK_PNG, alt: title, className, style: { objectFit: "contain", ...style }, draggable: false })
  );
}
function CurrencyChangeConfirmModal({
  open,
  fromCurrency,
  toCurrency,
  rate,
  rateSource,
  exampleAmounts = [],
  onConfirm,
  onCancel,
  loading = false,
  error
}) {
  const [confirming, setConfirming] = react.useState(false);
  if (!open || typeof document === "undefined") return null;
  const busy = loading || confirming;
  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4", onClick: () => !busy && onCancel(), children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full max-w-md", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-neutral-800", children: /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-base font-bold text-gray-900 dark:text-gray-100", children: "Confirm currency change" }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-center gap-3 rounded-lg bg-gray-50 dark:bg-neutral-800 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm font-bold text-gray-700 dark:text-gray-300", children: fromCurrency }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-gray-400", "aria-hidden": true, children: "\u2192" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm font-bold text-gray-900 dark:text-gray-100", children: toCurrency })
        ] }),
        rate != null ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-300 text-center", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
            "Current rate: ",
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-mono font-semibold", children: [
              "1 ",
              fromCurrency,
              " = ",
              rate.toLocaleString(void 0, { maximumFractionDigits: 6 }),
              " ",
              toCurrency
            ] })
          ] }),
          rateSource && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-0.5", children: rateSource })
        ] }) : /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-amber-600 dark:text-amber-400 text-center", children: error || "No exchange rate is available for this pair yet \u2014 you can still switch, but nothing will be converted." }),
        exampleAmounts.length > 0 && rate != null && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-lg border border-gray-200 dark:border-neutral-800 divide-y divide-gray-100 dark:divide-neutral-800 overflow-hidden", children: exampleAmounts.map((row) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-3 py-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-gray-500 dark:text-gray-400", children: row.label }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-mono", children: [
            formatCurrency(row.originalAmount, fromCurrency),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-gray-400 mx-1", children: "\u2192" }),
            formatCurrency(row.originalAmount * rate, toCurrency)
          ] })
        ] }, row.label)) }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-500", children: [
          "New transactions will be recorded in ",
          toCurrency,
          " going forward. The rate and both currency values are stored on the change so it stays traceable."
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              onClick: onCancel,
              disabled: busy,
              className: "flex-1 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              onClick: handleConfirm,
              disabled: busy,
              className: "flex-1 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2",
              children: [
                busy && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-3.5 h-3.5 border-2 border-white/40 dark:border-black/40 border-t-white dark:border-t-black rounded-full animate-spin" }),
                "Confirm change"
              ]
            }
          )
        ] })
      ] })
    ] }) }) }),
    document.body
  );
}
var EMPTY_ACCOUNT_FORM = {
  account_type: "bank",
  account_name: "",
  bank_name: "",
  account_number: "",
  bank_branch: "",
  branch_code: "",
  currency: "KES",
  opening_balance: ""
};
var inputClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
var labelClass = "block text-xs font-medium text-muted-foreground mb-1";
function AccountForm({
  value,
  onChange,
  currencies,
  currencyLabel,
  banks,
  banksLoading,
  onVerifyBank,
  verifying,
  hideTypeSelector = false,
  className
}) {
  const [verifiedName, setVerifiedName] = react.useState(null);
  const [verifyError, setVerifyError] = react.useState(null);
  const [bankCode, setBankCode] = react.useState("");
  const set = (patch) => onChange({ ...value, ...patch });
  const handleVerify = () => {
    if (!onVerifyBank) return;
    setVerifiedName(null);
    setVerifyError(null);
    onVerifyBank(value.account_number, bankCode).then((res) => {
      if (res.accountName) {
        setVerifiedName(res.accountName);
        set({ account_name: res.accountName });
      } else {
        setVerifyError(res.error || "Could not resolve the account name \u2014 enter it manually.");
      }
    }).catch((e) => {
      setVerifyError(e instanceof Error ? e.message : "Verification failed \u2014 enter the name manually.");
    });
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: className ?? "space-y-4", children: [
    !hideTypeSelector && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "Account Type" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-3 gap-2 mt-1", children: ["bank", "mobile_money", "cash"].map((t) => /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: () => set({ account_type: t }),
          className: `rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${value.account_type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent/30"}`,
          children: t === "bank" ? "Bank Account" : t === "mobile_money" ? "Mobile Money" : "Cash Drawer"
        },
        t
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "Currency" }),
        /* @__PURE__ */ jsxRuntime.jsx("select", { value: value.currency, onChange: (e) => set({ currency: e.target.value }), className: inputClass, children: currencies.map((c) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: c, children: currencyLabel ? currencyLabel(c) : c }, c)) })
      ] }),
      value.account_type === "bank" && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("label", { className: labelClass, children: [
          "Bank ",
          banksLoading && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ml-1 text-[10px]", children: "(loading\u2026)" })
        ] }),
        banks && banks.length > 0 ? /* @__PURE__ */ jsxRuntime.jsxs(
          "select",
          {
            value: bankCode,
            onChange: (e) => {
              const selected = banks.find((b) => b.code === e.target.value);
              setBankCode(e.target.value);
              set({ bank_name: selected?.name ?? value.bank_name });
              setVerifiedName(null);
              setVerifyError(null);
            },
            className: inputClass,
            disabled: banksLoading,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "", children: value.bank_name ? `${value.bank_name} (change\u2026)` : "-- Select bank --" }),
              banks.map((b) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: b.code, children: b.name }, b.code))
            ]
          }
        ) : /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            value: value.bank_name,
            onChange: (e) => set({ bank_name: e.target.value }),
            className: inputClass,
            placeholder: "e.g. KCB Bank Kenya"
          }
        )
      ] })
    ] }),
    value.account_type === "bank" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "Account Number" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              value: value.account_number,
              onChange: (e) => {
                set({ account_number: e.target.value });
                setVerifiedName(null);
                setVerifyError(null);
              },
              className: inputClass,
              placeholder: "e.g. 0123456789"
            }
          ),
          onVerifyBank && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              disabled: !bankCode || !value.account_number || verifying,
              onClick: handleVerify,
              className: "shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent/30 disabled:opacity-50",
              title: !bankCode ? "Select a bank first" : "Verify account number",
              children: verifying ? "\u2026" : "Verify"
            }
          )
        ] }),
        verifiedName && /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mt-1 text-[11px] text-green-600", children: [
          "Verified: ",
          verifiedName
        ] }),
        verifyError && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-[11px] text-amber-600", children: verifyError })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "Account Name" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            value: value.account_name,
            onChange: (e) => set({ account_name: e.target.value }),
            className: inputClass,
            placeholder: "Auto-filled on verify, or enter manually"
          }
        )
      ] })
    ] }),
    value.account_type === "bank" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "Bank Branch (optional)" }),
        /* @__PURE__ */ jsxRuntime.jsx("input", { value: value.bank_branch, onChange: (e) => set({ bank_branch: e.target.value }), className: inputClass, placeholder: "e.g. Westlands" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "SWIFT / Branch Code (optional)" }),
        /* @__PURE__ */ jsxRuntime.jsx("input", { value: value.branch_code, onChange: (e) => set({ branch_code: e.target.value }), className: inputClass, placeholder: "e.g. EQBLKENA" })
      ] })
    ] }),
    value.account_type === "mobile_money" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "Account Name" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            value: value.account_name,
            onChange: (e) => set({ account_name: e.target.value }),
            className: inputClass,
            placeholder: "e.g. M-Pesa Till \u2014 Westlands Branch"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "Till / Paybill Number" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            value: value.account_number,
            onChange: (e) => set({ account_number: e.target.value }),
            className: inputClass,
            placeholder: "e.g. 174379"
          }
        )
      ] })
    ] }),
    value.account_type === "cash" && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "Account Name" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          value: value.account_name,
          onChange: (e) => set({ account_name: e.target.value }),
          className: inputClass,
          placeholder: "e.g. Petty Cash \u2014 Head Office"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelClass, children: "Opening Balance (optional)" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "number",
          min: "0",
          step: "0.01",
          value: value.opening_balance,
          onChange: (e) => set({ opening_balance: e.target.value }),
          className: inputClass,
          placeholder: "0.00"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Posted as a real journal entry against Opening Balance Equity." })
    ] })
  ] });
}
function isAccountFormValid(value) {
  if (!value.account_name.trim()) return false;
  if (value.account_type === "bank") return !!value.bank_name.trim() && !!value.account_number.trim();
  if (value.account_type === "mobile_money") return !!value.account_number.trim();
  return true;
}
function TrackingIframeModal({
  open,
  onOpenChange,
  trackingCode,
  logisticsUiUrl = "https://logistics.codevertexafrica.com",
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

// src/components/documents/extract-error.ts
async function extractErrorMessage(err, fallback = "Something went wrong") {
  try {
    if (err == null) return fallback;
    if (typeof err === "string") return err.trim() || fallback;
    const anyErr = err;
    const response = anyErr.response;
    if (response && "data" in response) {
      const fromData = await messageFromBody(response.data);
      if (fromData) return fromData;
      if (response.statusText) return response.statusText;
    }
    if (typeof Response !== "undefined" && err instanceof Response) {
      const text = await err.clone().text();
      const fromText = messageFromString(text);
      if (fromText) return fromText;
      if (err.statusText) return err.statusText;
    }
    if (typeof anyErr.message === "string" && anyErr.message.trim()) {
      return anyErr.message.trim();
    }
  } catch {
  }
  return fallback;
}
async function messageFromBody(data) {
  if (data == null) return null;
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    const text = await data.text();
    return messageFromString(text);
  }
  if (typeof data === "string") return messageFromString(data);
  if (typeof data === "object") return messageFromObject(data);
  return null;
}
function messageFromString(text) {
  const trimmed = text?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const fromObj = messageFromObject(parsed);
      if (fromObj) return fromObj;
    } catch {
    }
  }
  if (trimmed.startsWith("<")) return null;
  return trimmed;
}
function messageFromObject(obj) {
  if (!obj || typeof obj !== "object") return null;
  const o = obj;
  const candidate = pickString(o.message) ?? pickString(o.error) ?? pickString(o.detail) ?? pickString(o.title) ?? pickString(o.error?.message);
  return candidate ?? null;
}
function pickString(v) {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

// src/components/documents/use-document-preview.ts
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
      } catch (err) {
        const message = await extractErrorMessage(err, "Failed to load document");
        opts?.onError?.(message);
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
var S2 = {
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
    maxWidth: "90vw",
    maxHeight: "90vh",
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
  iconBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 8, borderRadius: 9999, border: 0, background: "transparent", color: "#6b7280", cursor: "pointer" },
  tabs: { display: "flex", gap: 4, padding: "10px 20px 0", borderBottom: "1px solid #e5e7eb" },
  tab: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: "8px 8px 0 0",
    border: 0,
    borderBottom: "2px solid transparent",
    background: "transparent",
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer"
  },
  tabActive: { color: "#111827", borderBottom: "2px solid #111827" },
  body: {
    position: "relative",
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  image: { maxWidth: "100%", maxHeight: "78vh", objectFit: "contain", borderRadius: 8 },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "#6b7280" }
};
var IconClose2 = () => /* @__PURE__ */ jsxRuntime.jsxs(
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
function ImagePreview({
  open,
  onOpenChange,
  src,
  alt = "Preview",
  title = "Image Preview",
  secondarySrc,
  secondaryLabel = "Back",
  primaryLabel = "Front"
}) {
  const [showSecondary, setShowSecondary] = react.useState(false);
  if (!open) return null;
  const hasSecondary = Boolean(secondarySrc);
  const activeSrc = hasSecondary && showSecondary ? secondarySrc : src;
  const activeAlt = hasSecondary ? showSecondary ? secondaryLabel : primaryLabel : alt;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { style: S2.overlay, role: "dialog", "aria-modal": "true", "aria-label": title, children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { style: S2.backdrop, onClick: () => onOpenChange(false) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { style: S2.modal, children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { style: S2.header, children: [
        /* @__PURE__ */ jsxRuntime.jsx("h2", { style: S2.title, children: title }),
        /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => onOpenChange(false), style: S2.iconBtn, "aria-label": "Close", children: /* @__PURE__ */ jsxRuntime.jsx(IconClose2, {}) })
      ] }),
      hasSecondary && /* @__PURE__ */ jsxRuntime.jsxs("div", { style: S2.tabs, children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => setShowSecondary(false),
            style: { ...S2.tab, ...showSecondary ? {} : S2.tabActive },
            children: primaryLabel
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => setShowSecondary(true),
            style: { ...S2.tab, ...showSecondary ? S2.tabActive : {} },
            children: secondaryLabel
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { style: S2.body, children: activeSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        /* @__PURE__ */ jsxRuntime.jsx("img", { src: activeSrc, alt: activeAlt, style: S2.image })
      ) : /* @__PURE__ */ jsxRuntime.jsx("div", { style: S2.center, children: /* @__PURE__ */ jsxRuntime.jsx("p", { style: { margin: 0, fontSize: 14 }, children: "No image available." }) }) })
    ] })
  ] });
}
var INITIAL2 = {
  open: false,
  src: null,
  secondarySrc: null,
  title: "Image Preview",
  alt: "Preview",
  secondaryLabel: "Back",
  primaryLabel: "Front"
};
function useImagePreview() {
  const [state, setState] = react.useState(INITIAL2);
  const openPreview = react.useCallback((o) => {
    setState({
      open: true,
      src: o.src,
      secondarySrc: o.secondarySrc ?? null,
      title: o.title ?? "Image Preview",
      alt: o.alt ?? "Preview",
      secondaryLabel: o.secondaryLabel ?? "Back",
      primaryLabel: o.primaryLabel ?? "Front"
    });
  }, []);
  const onOpenChange = react.useCallback((open) => setState((s) => ({ ...s, open })), []);
  const previewProps = {
    open: state.open,
    onOpenChange,
    src: state.src,
    alt: state.alt,
    title: state.title,
    secondarySrc: state.secondarySrc,
    secondaryLabel: state.secondaryLabel,
    primaryLabel: state.primaryLabel
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
var LEGACY_DOMAIN = "codevertexitsolutions.com";
var CURRENT_DOMAIN = "codevertexafrica.com";
function legacyRedirectUrl() {
  if (typeof window === "undefined") return null;
  const { hostname } = window.location;
  if (hostname !== LEGACY_DOMAIN && !hostname.endsWith(`.${LEGACY_DOMAIN}`)) return null;
  const newHost = hostname.slice(0, hostname.length - LEGACY_DOMAIN.length) + CURRENT_DOMAIN;
  return window.location.href.replace(hostname, newHost);
}
function buildIdFrom(html) {
  const m = html.match(/\/_next\/static\/([^/"']+)\/_(?:build|ssg)Manifest/);
  return m ? m[1] : null;
}
function scriptFingerprintFrom(html) {
  const matches = Array.from(html.matchAll(/<script[^>]+src="([^"]*\/_next\/static\/[^"]+)"/g)).map((m) => m[1]);
  if (matches.length === 0) return null;
  return matches.sort().join("|");
}
function fingerprintFrom(html) {
  return buildIdFrom(html) ?? scriptFingerprintFrom(html);
}
function PwaUpdater({ checkIntervalMs = 6e4, className = "" }) {
  const [updateAvailable, setUpdateAvailable] = react.useState(false);
  const [isLegacyDomain, setIsLegacyDomain] = react.useState(false);
  react.useEffect(() => {
    if (typeof window === "undefined") return;
    if (legacyRedirectUrl()) {
      setIsLegacyDomain(true);
      setUpdateAvailable(true);
      return;
    }
    const url = window.location.href;
    let stopped = false;
    let mine = null;
    const check = async () => {
      try {
        const res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) return;
        const fp = fingerprintFrom(await res.text());
        if (stopped || !fp) return;
        if (mine === null) {
          mine = fp;
        } else if (fp !== mine) {
          setUpdateAvailable(true);
        }
      } catch {
      }
    };
    void check();
    const id = setInterval(check, checkIntervalMs);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    return () => {
      stopped = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, [checkIntervalMs]);
  const applyUpdate = async () => {
    const redirect = legacyRedirectUrl();
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (redirect) {
          await Promise.all(regs.map((r) => r.unregister().catch(() => {
          })));
        } else {
          await Promise.all(regs.map((r) => r.update().catch(() => {
          })));
        }
      }
    } catch {
    }
    if (redirect) {
      window.location.replace(redirect);
    } else {
      window.location.reload();
    }
  };
  if (!updateAvailable) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      role: "status",
      className: `flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCw, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: isLegacyDomain ? "This app has moved to a new address." : "A new version is available." }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: () => void applyUpdate(),
            className: "rounded-full bg-white px-3 py-0.5 text-xs font-bold text-slate-900 hover:bg-slate-100",
            children: isLegacyDomain ? "Continue" : "Update now"
          }
        )
      ]
    }
  );
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
function OfflineBar({
  getPendingCount,
  availableOffline,
  disabledOffline,
  onSyncNow,
  swUrl = "/sw.js",
  registerSW = true,
  showUpdater = true,
  className
}) {
  react.useEffect(() => {
    if (registerSW) registerServiceWorker(swUrl);
  }, [registerSW, swUrl]);
  const { isOnline, pendingCount, syncing } = useOfflineSync({ getPendingCount });
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    showUpdater ? /* @__PURE__ */ jsxRuntime.jsx(PwaUpdater, {}) : null,
    /* @__PURE__ */ jsxRuntime.jsx(
      OfflineSyncBanner,
      {
        isOnline,
        pendingCount,
        syncing,
        availableOffline,
        disabledOffline,
        onSyncNow,
        className
      }
    )
  ] });
}
var PAYMENT_METHODS = [
  { value: "", label: "Not configured" },
  { value: "mpesa", label: "M-Pesa (Mobile)" },
  { value: "mpesa_b2b", label: "M-Pesa B2B (Paybill)" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" }
];
var inputCls = "w-full rounded-lg border border-input bg-transparent px-4 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none";
var labelCls = "text-sm font-medium";
var sectionLabelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3";
function SupplierForm({
  initialValues,
  isEdit = false,
  onSubmit,
  onSuccess,
  onCancel,
  onError,
  renderBankFields,
  hidePaymentConfig = false,
  className = "",
  submitLabel
}) {
  const iv = initialValues ?? {};
  const [name, setName] = react.useState(iv.name ?? "");
  const [contact, setContact] = react.useState(iv.contact_person ?? "");
  const [email, setEmail] = react.useState(iv.email ?? "");
  const [phone, setPhone] = react.useState(iv.phone ?? "");
  const [address, setAddress] = react.useState(iv.address ?? "");
  const [notes, setNotes] = react.useState(iv.notes ?? "");
  const [taxPin, setTaxPin] = react.useState(iv.tax_pin || iv.tax_number || "");
  const [paymentMethod, setPaymentMethod] = react.useState(
    iv.payment_method_type ?? ""
  );
  const [mpesaPhone, setMpesaPhone] = react.useState(iv.mpesa_phone ?? "");
  const [mpesaBusinessName, setMpesaBusinessName] = react.useState(iv.mpesa_business_name ?? "");
  const [bankAccount, setBankAccount] = react.useState(iv.bank_account_number ?? "");
  const [bankName, setBankName] = react.useState(iv.bank_name ?? "");
  const [bankCode, setBankCode] = react.useState("");
  const [bankBranch, setBankBranch] = react.useState(iv.bank_branch ?? "");
  const [autoPay, setAutoPay] = react.useState(iv.auto_pay_enabled ?? false);
  const [requiresInvoice, setRequiresInvoice] = react.useState(
    iv.requires_invoice_before_payment ?? false
  );
  const [paymentTerms, setPaymentTerms] = react.useState(
    iv.payment_terms_days != null ? String(iv.payment_terms_days) : ""
  );
  const [creditLimit, setCreditLimit] = react.useState(
    iv.credit_limit != null ? String(iv.credit_limit) : ""
  );
  const [pending, setPending] = react.useState(false);
  const [error, setError] = react.useState(null);
  const isMpesa = paymentMethod === "mpesa" || paymentMethod === "mpesa_b2b";
  const isBank = paymentMethod === "bank_transfer";
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Supplier name is required");
      return;
    }
    setError(null);
    setPending(true);
    const payload = {
      name: name.trim(),
      contact_person: contact.trim() || void 0,
      email: email.trim() || void 0,
      phone: phone.trim() || void 0,
      address: address.trim() || void 0,
      notes: notes.trim() || void 0,
      // KRA PINs are upper-case (e.g. A005049885J); normalise so lookups and eTIMS match.
      tax_pin: taxPin.trim().toUpperCase() || void 0,
      payment_method_type: hidePaymentConfig ? void 0 : paymentMethod || void 0,
      mpesa_phone: !hidePaymentConfig && isMpesa ? mpesaPhone.trim() || void 0 : void 0,
      mpesa_business_name: !hidePaymentConfig && isMpesa ? mpesaBusinessName.trim() || void 0 : void 0,
      bank_account_number: !hidePaymentConfig && isBank ? bankAccount.trim() || void 0 : void 0,
      bank_name: !hidePaymentConfig && isBank ? bankName.trim() || void 0 : void 0,
      bank_branch: !hidePaymentConfig && isBank ? bankBranch.trim() || void 0 : void 0,
      auto_pay_enabled: !hidePaymentConfig ? autoPay || void 0 : void 0,
      requires_invoice_before_payment: !hidePaymentConfig ? requiresInvoice || void 0 : void 0,
      payment_terms_days: !hidePaymentConfig && paymentTerms ? Number(paymentTerms) : void 0,
      credit_limit: !hidePaymentConfig && creditLimit ? Number(creditLimit) : void 0
    };
    try {
      const created = await onSubmit(payload);
      onSuccess?.(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save supplier. Please try again.";
      setError(msg);
      onError?.(msg);
    } finally {
      setPending(false);
    }
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: `space-y-5 ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: sectionLabelCls, children: "Basic Information" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Supplier Name *" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              className: inputCls,
              placeholder: "e.g. Acme Supplies Ltd",
              value: name,
              onChange: (e) => setName(e.target.value),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Contact Person" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              className: inputCls,
              placeholder: "Full name",
              value: contact,
              onChange: (e) => setContact(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Email" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                className: inputCls,
                type: "email",
                placeholder: "email@example.com",
                value: email,
                onChange: (e) => setEmail(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Phone" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                className: inputCls,
                placeholder: "+254 700 000000",
                value: phone,
                onChange: (e) => setPhone(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "KRA PIN" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              className: `${inputCls} uppercase`,
              placeholder: "e.g. A000000000B",
              value: taxPin,
              onChange: (e) => setTaxPin(e.target.value),
              autoComplete: "off"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: "Prefills on expenses and bills for this supplier so purchases can be recorded with KRA eTIMS (input VAT)." })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Address" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              className: inputCls,
              placeholder: "Physical or postal address",
              value: address,
              onChange: (e) => setAddress(e.target.value)
            }
          )
        ] })
      ] })
    ] }),
    !hidePaymentConfig && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border-t border-border pt-5", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: sectionLabelCls, children: "Payment Configuration" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Payment Method" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "select",
            {
              value: paymentMethod,
              onChange: (e) => setPaymentMethod(e.target.value),
              className: inputCls,
              children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: m.value, children: m.label }, m.value))
            }
          )
        ] }),
        isMpesa && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "M-Pesa Phone" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                className: inputCls,
                placeholder: "254700000000",
                value: mpesaPhone,
                onChange: (e) => setMpesaPhone(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Business Name" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                className: inputCls,
                placeholder: "Paybill business name",
                value: mpesaBusinessName,
                onChange: (e) => setMpesaBusinessName(e.target.value)
              }
            )
          ] })
        ] }),
        isBank && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
          renderBankFields ? renderBankFields({
            bankName,
            bankCode,
            accountNumber: bankAccount,
            onChange: (patch) => {
              if (patch.bank_name !== void 0) setBankName(patch.bank_name);
              if (patch.bank_code !== void 0) setBankCode(patch.bank_code);
              if (patch.account_number !== void 0) setBankAccount(patch.account_number);
            }
          }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Bank Name" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "input",
                {
                  className: inputCls,
                  placeholder: "Bank name",
                  value: bankName,
                  onChange: (e) => setBankName(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Account Number" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "input",
                {
                  className: inputCls,
                  placeholder: "Account number",
                  value: bankAccount,
                  onChange: (e) => setBankAccount(e.target.value)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Branch (optional)" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                className: inputCls,
                placeholder: "Branch name",
                value: bankBranch,
                onChange: (e) => setBankBranch(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Payment Terms (days)" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                className: inputCls,
                type: "number",
                min: "0",
                placeholder: "e.g. 30",
                value: paymentTerms,
                onChange: (e) => setPaymentTerms(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Credit Limit" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                className: inputCls,
                type: "number",
                min: "0",
                placeholder: "0",
                value: creditLimit,
                onChange: (e) => setCreditLimit(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-3 pt-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "checkbox",
                checked: autoPay,
                onChange: (e) => setAutoPay(e.target.checked),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm", children: "Enable Auto-Pay (automatically trigger payout on PO receipt)" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "checkbox",
                checked: requiresInvoice,
                onChange: (e) => setRequiresInvoice(e.target.checked),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm", children: "Requires Invoice Before Payment" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { className: labelCls, children: "Notes" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "textarea",
        {
          placeholder: "Additional notes about this supplier...",
          value: notes,
          onChange: (e) => setNotes(e.target.value),
          rows: 2,
          className: `${inputCls} resize-none`
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-destructive", children: error }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-3 pt-2", children: [
      onCancel && /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          className: "flex-1 rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "submit",
          disabled: pending,
          className: "flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity",
          children: pending ? "Saving..." : submitLabel ?? (isEdit ? "Update" : "Create")
        }
      )
    ] })
  ] });
}
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
function SearchableCombobox({
  options,
  value,
  onChange,
  valueLabel,
  onRemoteSearch,
  remoteThreshold = 5,
  onLoadMore,
  hasMore,
  loading,
  placeholder = "Select\u2026",
  searchPlaceholder = "Search\u2026",
  emptyText = "No matches",
  disabled,
  clearable = true,
  className,
  footer
}) {
  const [open, setOpen] = react.useState(false);
  const [query, setQuery] = react.useState("");
  const [remoteResults, setRemoteResults] = react.useState([]);
  const [remoteLoading, setRemoteLoading] = react.useState(false);
  const ref = react.useRef(null);
  const panelRef = react.useRef(null);
  const debounceRef = react.useRef(null);
  const requestSeq = react.useRef(0);
  const [panelPos, setPanelPos] = react.useState(null);
  react.useLayoutEffect(() => {
    if (!open) return;
    const anchor = ref.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const estimatedPanelHeight = 300;
    const top = spaceBelow < 260 && r.top > estimatedPanelHeight ? Math.max(8, r.top - 4 - estimatedPanelHeight) : r.bottom + 4;
    setPanelPos({ top, left: r.left, width: r.width });
  }, [open]);
  react.useEffect(() => {
    if (!open) return;
    const openedAt = Date.now();
    const KEYBOARD_SETTLE_MS = 400;
    function onScroll(e) {
      if (Date.now() - openedAt < KEYBOARD_SETTLE_MS) return;
      if (panelRef.current?.contains(e.target)) return;
      const anchor = ref.current;
      if (!anchor) return;
      const target = e.target;
      const isRelevant = target === document || target === window || target instanceof Node && target.contains(anchor);
      if (!isRelevant) return;
      setOpen(false);
    }
    function onResize() {
      if (Date.now() - openedAt < KEYBOARD_SETTLE_MS) return;
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  const [selectedCache, setSelectedCache] = react.useState(void 0);
  const selected = options.find((o) => o.value === value) ?? (selectedCache && selectedCache.value === value ? selectedCache : void 0) ?? (value && valueLabel ? { value, label: valueLabel } : void 0);
  const localMatches = react.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint ?? "").toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);
  react.useEffect(() => {
    if (!onRemoteSearch) return;
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || localMatches.length >= remoteThreshold) {
      setRemoteResults([]);
      setRemoteLoading(false);
      return;
    }
    setRemoteLoading(true);
    const seq = ++requestSeq.current;
    debounceRef.current = setTimeout(() => {
      onRemoteSearch(q).then((results) => {
        if (requestSeq.current !== seq) return;
        setRemoteResults(results);
      }).catch(() => {
        if (requestSeq.current === seq) setRemoteResults([]);
      }).finally(() => {
        if (requestSeq.current === seq) setRemoteLoading(false);
      });
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, localMatches.length, onRemoteSearch, remoteThreshold]);
  const merged = react.useMemo(() => {
    if (remoteResults.length === 0) return localMatches;
    const seen = new Set(localMatches.map((o) => o.value));
    return [...localMatches, ...remoteResults.filter((o) => !seen.has(o.value))];
  }, [localMatches, remoteResults]);
  const close = react.useCallback(() => {
    setOpen(false);
    setQuery("");
    setRemoteResults([]);
  }, []);
  react.useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) close();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  const select = (o) => {
    setSelectedCache(o);
    onChange(o.value, o);
    close();
  };
  const busy = loading || remoteLoading;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { ref, className: cx("relative", className), children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => open ? close() : setOpen(true),
        className: "flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: cx("flex min-w-0 items-center gap-2 text-left", !selected && "text-muted-foreground"), children: [
            selected?.icon,
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: selected ? selected.label : placeholder })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center gap-1", children: [
            clearable && selected && !disabled && /* @__PURE__ */ jsxRuntime.jsx(
              lucideReact.X,
              {
                className: "h-4 w-4 text-muted-foreground hover:text-foreground",
                onClick: (e) => {
                  e.stopPropagation();
                  setSelectedCache(void 0);
                  onChange("", void 0);
                }
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronsUpDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
          ] })
        ]
      }
    ),
    open && panelPos && /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        ref: panelRef,
        style: { position: "fixed", top: panelPos.top, left: panelPos.left, width: panelPos.width, zIndex: 60 },
        className: "overflow-hidden rounded-xl border border-border bg-card shadow-xl",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                autoFocus: true,
                value: query,
                onChange: (e) => setQuery(e.target.value),
                placeholder: searchPlaceholder,
                className: "w-full bg-transparent text-sm text-foreground focus:outline-none"
              }
            ),
            busy && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "h-4 w-4 shrink-0 animate-spin text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "max-h-60 overflow-y-auto py-1", children: [
            merged.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("li", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: busy ? "Searching\u2026" : emptyText }) : merged.map((o) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs(
              "button",
              {
                type: "button",
                onClick: () => select(o),
                className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60",
                children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
                    o.icon,
                    /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-baseline gap-2", children: [
                        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate text-foreground", children: o.label }),
                        o.hint && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: o.hint })
                      ] }),
                      o.description && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block truncate text-xs text-muted-foreground", children: o.description })
                    ] })
                  ] }),
                  o.value === value && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-4 w-4 shrink-0 text-primary" })
                ]
              }
            ) }, o.value)),
            hasMore && onLoadMore && /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                onClick: onLoadMore,
                className: "w-full px-3 py-2 text-center text-xs font-medium text-primary hover:bg-muted/60",
                children: "Load more\u2026"
              }
            ) })
          ] }),
          footer && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-border p-1", children: footer })
        ]
      }
    )
  ] });
}

// src/components/data-table/types.ts
function cellText(v) {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}
function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return a === b ? 0 : a ? -1 : 1;
  const an = Number(a);
  const bn = Number(b);
  if (!Number.isNaN(an) && !Number.isNaN(bn) && String(a).trim() !== "" && String(b).trim() !== "") {
    return an - bn;
  }
  return cellText(a).localeCompare(cellText(b), void 0, { sensitivity: "base", numeric: true });
}
function cx2(...classes) {
  return classes.filter(Boolean).join(" ");
}
var CODEVERTEX_ICON_URL = "https://codevertexafrica.com/icon.svg";
var BRAND_ORANGE = "#E8631E";
function PoweredByBadge({
  iconUrl = CODEVERTEX_ICON_URL,
  variant = "card",
  layout = "row",
  iconClassName,
  href = "https://codevertexafrica.com",
  className,
  partner
}) {
  const stacked = layout === "stacked";
  const iconSize = iconClassName ?? (stacked ? "h-10 w-10" : "h-7 w-7");
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "a",
    {
      href,
      target: "_blank",
      rel: "noopener noreferrer",
      className: cx2(
        "inline-flex items-center gap-2.5 transition-shadow",
        variant === "card" && (stacked ? "rounded-3xl bg-card pl-2 pr-5 py-2 shadow-md ring-1 ring-black/5 hover:shadow-lg" : "rounded-full bg-card pl-1.5 pr-4 py-1.5 shadow-md ring-1 ring-black/5 hover:shadow-lg"),
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 flex items-center justify-center rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-1", children: /* @__PURE__ */ jsxRuntime.jsx("img", { src: iconUrl, alt: "Codevertex", className: cx2(iconSize, "object-contain") }) }),
        stacked ? /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex flex-col items-start leading-tight text-left uppercase", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] font-bold tracking-wider text-foreground", children: "Powered by" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm font-extrabold tracking-wide whitespace-nowrap", style: { color: BRAND_ORANGE }, children: "Codevertex Africa Limited" }),
          partner && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[9px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap", children: [
            "Sold & supported by ",
            partner.name
          ] })
        ] }) : /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs font-extrabold uppercase tracking-wide whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground", children: "Powered by" }),
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("span", { style: { color: BRAND_ORANGE }, children: "Codevertex Africa Limited" }),
          partner && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-foreground/40 mx-1.5", children: "|" }),
            partner.logoUrl && /* @__PURE__ */ jsxRuntime.jsx(
              "img",
              {
                src: partner.logoUrl,
                alt: partner.name,
                className: "inline-block h-4 w-4 rounded-sm object-contain align-middle mr-1"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-foreground/70 normal-case font-semibold", children: [
              "Sold & supported by ",
              partner.name
            ] })
          ] })
        ] })
      ]
    }
  );
}
function cx3(...classes) {
  return classes.filter(Boolean).join(" ");
}
function ToolbarButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      "aria-label": label,
      "aria-pressed": active,
      title: label,
      disabled,
      onMouseDown: (e) => e.preventDefault(),
      onClick,
      className: cx3(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40",
        active && "bg-primary/10 text-primary"
      ),
      children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "size-4", "aria-hidden": true })
    }
  );
}
function Toolbar({ editor }) {
  const setLink = react.useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Bold, label: "Bold", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Italic, label: "Italic", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Strikethrough, label: "Strikethrough", active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run() }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Heading2, label: "Heading", active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Heading3, label: "Subheading", active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.List, label: "Bullet list", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.ListOrdered, label: "Numbered list", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run() }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Link2, label: "Add link", active: editor.isActive("link"), onClick: setLink }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Link2Off, label: "Remove link", disabled: !editor.isActive("link"), onClick: () => editor.chain().focus().unsetLink().run() }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Undo2, label: "Undo", disabled: !editor.can().undo(), onClick: () => editor.chain().focus().undo().run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Redo2, label: "Redo", disabled: !editor.can().redo(), onClick: () => editor.chain().focus().redo().run() })
  ] });
}
function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id
}) {
  const editor = react$1.useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit__default.default.configure({
        heading: { levels: [2, 3] },
        // Use our own Link config below (safe protocols + branded styling).
        link: false
      }),
      Link__default.default.configure({
        openOnClick: false,
        autolink: true,
        // Only allow safe schemes — strips javascript:/data: etc.
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer nofollow", class: "text-primary underline" }
      })
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cx3(
          "prose-editor min-h-[140px] w-full px-3 py-2 text-sm text-foreground focus:outline-none",
          disabled && "cursor-not-allowed opacity-60"
        ),
        ...placeholder ? { "data-placeholder": placeholder } : {}
      }
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    }
  });
  react.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current && !(next === "" && current === "<p></p>")) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);
  react.useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);
  if (!editor) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cx3("rounded-lg border border-input bg-background", className), children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-[180px] animate-pulse rounded-lg bg-muted/40" }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      id,
      className: cx3(
        "overflow-hidden rounded-lg border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(Toolbar, { editor }),
        /* @__PURE__ */ jsxRuntime.jsx(react$1.EditorContent, { editor })
      ]
    }
  );
}
var RichText = RichTextEditor;
function BulkActionBar({
  selectedKeys,
  actions,
  onClear
}) {
  const count = selectedKeys.length;
  if (count === 0) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs font-semibold text-foreground", children: [
      count,
      " selected"
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        onClick: onClear,
        className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-3 w-3" }),
          " Clear"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-px bg-border" }),
    actions.map((a) => /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        disabled: a.disabled,
        onClick: () => a.onClick(selectedKeys),
        className: cx2(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          a.variant === "destructive" ? "border-destructive/40 text-destructive hover:bg-destructive/10" : "border-input text-foreground hover:bg-accent",
          a.disabled && "opacity-50 cursor-not-allowed"
        ),
        children: [
          a.icon,
          a.label
        ]
      },
      a.key
    ))
  ] });
}
function AnchoredPopover({
  open,
  onClose,
  anchorRef,
  children,
  align = "start",
  width = 240
}) {
  const panelRef = react.useRef(null);
  const [pos, setPos] = react.useState(null);
  react.useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    let left = align === "end" ? r.right - width : r.left;
    left = Math.max(8, Math.min(left, vw - width - 8));
    const spaceBelow = window.innerHeight - r.bottom;
    const top = spaceBelow < 260 && r.top > 300 ? Math.max(8, r.top - 8 - 300) : r.bottom + 4;
    setPos({ top, left });
  }, [open, anchorRef, align, width]);
  react.useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      const t = e.target;
      if (panelRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    }
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    function onScroll(e) {
      if (panelRef.current?.contains(e.target)) return;
      onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [open, onClose, anchorRef]);
  if (!open || !pos) return null;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ref: panelRef,
      style: { position: "fixed", top: pos.top, left: pos.left, width, zIndex: 60 },
      className: "rounded-lg border border-border bg-background shadow-lg p-2 text-sm",
      children
    }
  );
}
function loadHiddenColumns(storageKey, columns) {
  const defaults = new Set(columns.filter((c) => c.defaultHidden).map((c) => c.key));
  if (!storageKey || typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(`dt-cols:${storageKey}`);
    if (!raw) return defaults;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.filter((k) => typeof k === "string"));
  } catch {
  }
  return defaults;
}
function ColumnVisibilityButton({
  columns,
  hidden,
  onChange,
  storageKey
}) {
  const [open, setOpen] = react.useState(false);
  const btnRef = react.useRef(null);
  react.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(`dt-cols:${storageKey}`, JSON.stringify([...hidden]));
    } catch {
    }
  }, [hidden, storageKey]);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        ref: btnRef,
        type: "button",
        onClick: () => setOpen((v) => !v),
        className: cx2(
          "inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium",
          "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        ),
        title: "Show / hide columns",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Columns3, { className: "h-3.5 w-3.5" }),
          "Columns",
          hidden.size > 0 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[10px] text-primary font-semibold", children: [
            hidden.size,
            " hidden"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(AnchoredPopover, { open, onClose: () => setOpen(false), anchorRef: btnRef, align: "end", width: 220, children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "px-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Columns" }),
      /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "max-h-64 overflow-y-auto space-y-0.5", children: columns.map((c) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2 rounded px-1.5 py-1 hover:bg-accent cursor-pointer text-xs", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "checkbox",
            checked: !hidden.has(c.key),
            onChange: () => {
              const next = new Set(hidden);
              if (next.has(c.key)) next.delete(c.key);
              else next.add(c.key);
              onChange(next);
            },
            className: "h-3.5 w-3.5 rounded border-input"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: c.label })
      ] }) }, c.key)) })
    ] })
  ] });
}
function Checkbox({ checked, indeterminate, onChange, disabled, className, ...rest }) {
  const active = checked || indeterminate;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      role: "checkbox",
      "aria-checked": indeterminate ? "mixed" : checked,
      "aria-label": rest["aria-label"] ?? "Select row",
      disabled,
      onClick: (e) => {
        e.stopPropagation();
        onChange(!checked);
      },
      className: cx2(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:border-primary/60",
        disabled && "opacity-40 cursor-not-allowed",
        className
      ),
      children: indeterminate ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Minus, { className: "h-3 w-3" }) : checked ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-3 w-3" }) : null
    }
  );
}
function SortButton({
  dir,
  onCycle
}) {
  const Icon = dir === "asc" ? lucideReact.ArrowUp : dir === "desc" ? lucideReact.ArrowDown : lucideReact.ArrowUpDown;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      onClick: onCycle,
      "aria-label": "Sort column",
      className: cx2(
        "p-0.5 rounded transition-colors",
        dir ? "text-primary" : "text-muted-foreground/50 hover:text-foreground"
      ),
      children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "h-3.5 w-3.5" })
    }
  );
}
function FunnelFilter({
  options,
  state,
  onChange
}) {
  const [open, setOpen] = react.useState(false);
  const [optionQuery, setOptionQuery] = react.useState("");
  const btnRef = react.useRef(null);
  const active = !!state && ((state.values?.length ?? 0) > 0 || !!state.query?.trim());
  const selected = react.useMemo(() => new Set(state?.values ?? []), [state]);
  const visibleOptions = react.useMemo(() => {
    const q = optionQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.label ?? o.value).toLowerCase().includes(q));
  }, [options, optionQuery]);
  function commit(next) {
    const empty = !(next.values?.length ?? 0) && !next.query?.trim();
    onChange(empty ? void 0 : next);
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        ref: btnRef,
        type: "button",
        onClick: () => setOpen((v) => !v),
        "aria-label": "Filter column",
        className: cx2(
          "p-0.5 rounded transition-colors",
          active ? "text-primary" : "text-muted-foreground/50 hover:text-foreground"
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Filter, { className: cx2("h-3.5 w-3.5", active && "fill-primary/20") })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(AnchoredPopover, { open, onClose: () => setOpen(false), anchorRef: btnRef, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { className: "absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            autoFocus: true,
            value: state?.query ?? "",
            onChange: (e) => commit({ ...state, query: e.target.value }),
            placeholder: "Contains\u2026",
            className: "w-full rounded-md border border-input bg-background pl-7 pr-2 py-1.5 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
          }
        )
      ] }),
      options.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        options.length > 8 && /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            value: optionQuery,
            onChange: (e) => setOptionQuery(e.target.value),
            placeholder: "Search values\u2026",
            className: "w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "max-h-52 overflow-y-auto space-y-0.5", children: [
          visibleOptions.map((o) => {
            const isOn = selected.has(o.value);
            return /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2 rounded px-1.5 py-1 hover:bg-accent cursor-pointer text-xs", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: isOn,
                  onChange: () => {
                    const values = isOn ? (state?.values ?? []).filter((v) => v !== o.value) : [...state?.values ?? [], o.value];
                    commit({ ...state, values });
                  },
                  className: "h-3.5 w-3.5 rounded border-input"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: o.label ?? (o.value === "" ? "(blank)" : o.value) })
            ] }) }, o.value);
          }),
          visibleOptions.length === 0 && /* @__PURE__ */ jsxRuntime.jsx("li", { className: "px-1.5 py-2 text-xs text-muted-foreground", children: "No values" })
        ] })
      ] }),
      active && /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            onChange(void 0);
            setOptionQuery("");
          },
          className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-3 w-3" }),
            " Clear filter"
          ]
        }
      )
    ] }) })
  ] });
}
function SkeletonBar({ widthClass = "w-3/4" }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: `h-3.5 rounded bg-muted animate-pulse ${widthClass}` });
}
function TableFooter({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize,
  shownCount
}) {
  const from = total != null && pageSize != null ? total === 0 ? 0 : (page - 1) * pageSize + 1 : null;
  const to = from != null && pageSize != null ? Math.min(from + shownCount - 1, total ?? from + shownCount - 1) : null;
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "\u2026") pages.push("\u2026");
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border", children: [
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: from != null && to != null && total != null ? `Showing ${from} to ${to} of ${total} entries` : `Page ${page} of ${totalPages}` }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          disabled: page <= 1,
          onClick: () => onPageChange(page - 1),
          "aria-label": "Previous page",
          className: "p-1.5 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronLeft, { className: "h-3.5 w-3.5" })
        }
      ),
      pages.map(
        (p, i) => p === "\u2026" ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "px-1 text-xs text-muted-foreground", children: "\u2026" }, `gap-${i}`) : /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: () => onPageChange(p),
            className: cx2(
              "min-w-[28px] rounded-md border px-2 py-1 text-xs font-medium transition-colors",
              p === page ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:text-foreground hover:bg-accent"
            ),
            children: p
          },
          p
        )
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          disabled: page >= totalPages,
          onClick: () => onPageChange(page + 1),
          "aria-label": "Next page",
          className: "p-1.5 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-3.5 w-3.5" })
        }
      )
    ] })
  ] });
}
var ALIGN = { left: "text-left", right: "text-right", center: "text-center" };
var HIDE = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell"
};
var SKELETON_WIDTHS = ["w-5/6", "w-2/3", "w-3/4", "w-1/2"];
function FragmentRow({ children }) {
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children });
}
function DataTableDesktop(props) {
  const {
    visibleColumns,
    processedRows,
    rowKey,
    accessorOf,
    loading,
    loadingRows,
    error,
    onRetry,
    gridLines,
    cellPad,
    colSpan,
    maxBodyHeight = "65vh",
    sort,
    cycleSort,
    filters,
    setColumnFilter,
    funnelOptionsFor,
    selectable,
    selected,
    setSelected,
    isRowSelectable,
    allSelected,
    someSelected,
    toggleAll,
    renderExpanded,
    expanded,
    setExpanded,
    onRowClick,
    rowClassName,
    page,
    totalPages,
    onPageChange,
    total,
    pageSize
  } = props;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "hidden md:block rounded-lg border border-border overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-auto", style: maxBodyHeight ? { maxHeight: maxBodyHeight } : void 0, children: /* @__PURE__ */ jsxRuntime.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntime.jsx("thead", { className: "sticky top-0 z-10 bg-muted", children: /* @__PURE__ */ jsxRuntime.jsxs("tr", { className: cx2("border-b border-border bg-muted/40", gridLines === "both" && "divide-x divide-border/50"), children: [
        selectable && /* @__PURE__ */ jsxRuntime.jsx("th", { className: cx2(cellPad, "w-10"), children: /* @__PURE__ */ jsxRuntime.jsx(
          Checkbox,
          {
            checked: allSelected,
            indeterminate: !allSelected && someSelected,
            onChange: toggleAll,
            "aria-label": "Select all rows"
          }
        ) }),
        renderExpanded && /* @__PURE__ */ jsxRuntime.jsx("th", { className: cx2(cellPad, "w-8") }),
        visibleColumns.map((col) => /* @__PURE__ */ jsxRuntime.jsx(
          "th",
          {
            className: cx2(
              cellPad,
              "font-medium text-muted-foreground",
              ALIGN[col.align ?? "left"],
              col.hideBelow && HIDE[col.hideBelow],
              col.headerClassName
            ),
            children: /* @__PURE__ */ jsxRuntime.jsxs("span", { className: cx2("inline-flex items-start gap-1", col.align === "right" && "flex-row-reverse"), children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "whitespace-normal", children: col.header }),
              col.sortable && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntime.jsx(SortButton, { dir: sort?.key === col.key ? sort.dir : null, onCycle: () => cycleSort(col.key) }) }),
              col.filterable && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntime.jsx(
                FunnelFilter,
                {
                  options: funnelOptionsFor(col),
                  state: filters[col.key],
                  onChange: (st) => setColumnFilter(col.key, st)
                }
              ) })
            ] })
          },
          col.key
        ))
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx("tbody", { className: "divide-y divide-border/70", children: loading ? loadingRows ? Array.from({ length: loadingRows }).map((_, i) => /* @__PURE__ */ jsxRuntime.jsxs("tr", { className: gridLines === "both" ? "divide-x divide-border/50" : void 0, children: [
        selectable && /* @__PURE__ */ jsxRuntime.jsx("td", { className: cellPad }),
        renderExpanded && /* @__PURE__ */ jsxRuntime.jsx("td", { className: cellPad }),
        visibleColumns.map((col, ci) => /* @__PURE__ */ jsxRuntime.jsx("td", { className: cellPad, children: /* @__PURE__ */ jsxRuntime.jsx(SkeletonBar, { widthClass: SKELETON_WIDTHS[(i + ci) % SKELETON_WIDTHS.length] }) }, col.key))
      ] }, `skeleton-${i}`)) : /* @__PURE__ */ jsxRuntime.jsx("tr", { children: /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan, className: "px-6 py-12 text-center text-muted-foreground", children: "Loading\u2026" }) }) : error ? /* @__PURE__ */ jsxRuntime.jsx("tr", { children: /* @__PURE__ */ jsxRuntime.jsxs("td", { colSpan, className: "px-6 py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "h-10 w-10 mx-auto text-destructive/60 mb-3" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground", children: "Couldn't load data" }),
        onRetry && /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: onRetry,
            className: "mt-3 rounded-lg border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors",
            children: "Retry"
          }
        )
      ] }) }) : processedRows.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("tr", { children: /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan, className: "px-6 py-12 text-center", children: props.emptyState ?? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Inbox, { className: "h-10 w-10 mx-auto text-muted-foreground/50 mb-3" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground", children: props.emptyText ?? "No records found" })
      ] }) }) }) : processedRows.map((row, i) => {
        const key = rowKey(row);
        const isExpanded = expanded.has(key);
        const canSelect = isRowSelectable?.(row) ?? true;
        return /* @__PURE__ */ jsxRuntime.jsxs(FragmentRow, { children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
            "tr",
            {
              className: cx2(
                "hover:bg-accent/30 transition-colors",
                gridLines === "both" && "divide-x divide-border/50",
                selected.has(key) && "bg-primary/5",
                onRowClick && "cursor-pointer",
                rowClassName?.(row)
              ),
              onClick: onRowClick ? () => onRowClick(row) : void 0,
              children: [
                selectable && /* @__PURE__ */ jsxRuntime.jsx("td", { className: cellPad, children: canSelect && /* @__PURE__ */ jsxRuntime.jsx(
                  Checkbox,
                  {
                    checked: selected.has(key),
                    onChange: () => {
                      const next = new Set(selected);
                      if (next.has(key)) next.delete(key);
                      else next.add(key);
                      setSelected(next);
                    }
                  }
                ) }),
                renderExpanded && /* @__PURE__ */ jsxRuntime.jsx("td", { className: cellPad, children: /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    type: "button",
                    "aria-label": isExpanded ? "Collapse row" : "Expand row",
                    onClick: (e) => {
                      e.stopPropagation();
                      const next = new Set(expanded);
                      if (next.has(key)) next.delete(key);
                      else next.add(key);
                      setExpanded(next);
                    },
                    className: "p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                    children: isExpanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4" })
                  }
                ) }),
                visibleColumns.map((col) => /* @__PURE__ */ jsxRuntime.jsx(
                  "td",
                  {
                    className: cx2(
                      cellPad,
                      ALIGN[col.align ?? "left"],
                      col.hideBelow && HIDE[col.hideBelow],
                      col.cellClassName
                    ),
                    children: col.render ? col.render(row, i) : cellText(accessorOf(col)(row)) || "\u2014"
                  },
                  col.key
                ))
              ]
            }
          ),
          isExpanded && renderExpanded && /* @__PURE__ */ jsxRuntime.jsx("tr", { className: "bg-muted/20", children: /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan, className: "px-6 py-3", children: renderExpanded(row) }) })
        ] }, key);
      }) })
    ] }) }),
    page != null && totalPages != null && onPageChange && !loading && processedRows.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(
      TableFooter,
      {
        page,
        totalPages,
        onPageChange,
        total,
        pageSize,
        shownCount: processedRows.length
      }
    )
  ] });
}
function DataTableMobile(props) {
  const {
    visibleColumns,
    processedRows,
    rowKey,
    accessorOf,
    loading,
    loadingRows,
    error,
    onRetry,
    selectable,
    selected,
    setSelected,
    isRowSelectable,
    renderExpanded,
    expanded,
    setExpanded,
    onRowClick,
    rowClassName,
    page,
    totalPages,
    onPageChange,
    total,
    pageSize
  } = props;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "md:hidden rounded-lg border border-border", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "divide-y divide-border", children: loading ? loadingRows ? Array.from({ length: loadingRows }).map((_, i) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(SkeletonBar, { widthClass: "w-2/3" }),
      /* @__PURE__ */ jsxRuntime.jsx(SkeletonBar, { widthClass: "w-1/2" })
    ] }, `skeleton-${i}`)) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-6 py-12 text-center text-muted-foreground", children: "Loading\u2026" }) : error ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "h-10 w-10 mx-auto text-destructive/60 mb-3" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground", children: "Couldn't load data" }),
      onRetry && /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: onRetry,
          className: "mt-3 rounded-lg border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors",
          children: "Retry"
        }
      )
    ] }) : processedRows.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-6 py-12 text-center", children: props.emptyState ?? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Inbox, { className: "h-10 w-10 mx-auto text-muted-foreground/50 mb-3" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground", children: props.emptyText ?? "No records found" })
    ] }) }) : processedRows.map((row, i) => {
      const key = rowKey(row);
      const isExpanded = expanded.has(key);
      const canSelect = isRowSelectable?.(row) ?? true;
      const primaryCol = visibleColumns.find((c) => c.primary);
      const actionCols = visibleColumns.filter((c) => c.mobileAction);
      const bodyCols = visibleColumns.filter((c) => !c.primary && !c.mobileAction && !c.mobileHidden);
      return /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: cx2(
            "p-4 active:bg-accent/40 transition-colors",
            (onRowClick || renderExpanded) && "cursor-pointer",
            selected.has(key) && "bg-primary/5",
            rowClassName?.(row)
          ),
          onClick: onRowClick ? () => onRowClick(row) : renderExpanded ? () => {
            const next = new Set(expanded);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            setExpanded(next);
          } : void 0,
          children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-3", children: [
              selectable && canSelect && /* @__PURE__ */ jsxRuntime.jsx("div", { onClick: (e) => e.stopPropagation(), className: "pt-0.5 shrink-0", children: /* @__PURE__ */ jsxRuntime.jsx(
                Checkbox,
                {
                  checked: selected.has(key),
                  onChange: () => {
                    const next = new Set(selected);
                    if (next.has(key)) next.delete(key);
                    else next.add(key);
                    setSelected(next);
                  }
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "min-w-0 flex-1", children: primaryCol && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "font-semibold text-foreground break-words", children: primaryCol.render ? primaryCol.render(row, i) : cellText(accessorOf(primaryCol)(row)) || "\u2014" }) }),
              (actionCols.length > 0 || renderExpanded) && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1 shrink-0", onClick: (e) => e.stopPropagation(), children: [
                actionCols.map((c) => /* @__PURE__ */ jsxRuntime.jsx("div", { children: c.render ? c.render(row, i) : cellText(accessorOf(c)(row)) }, c.key)),
                renderExpanded && /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    type: "button",
                    "aria-label": isExpanded ? "Collapse row" : "Expand row",
                    onClick: () => {
                      const next = new Set(expanded);
                      if (next.has(key)) next.delete(key);
                      else next.add(key);
                      setExpanded(next);
                    },
                    className: "p-1 rounded text-muted-foreground hover:text-foreground transition-colors",
                    children: isExpanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] }),
            bodyCols.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("dl", { className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-2", children: bodyCols.map((c) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntime.jsx("dt", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: c.mobileLabel ?? (typeof c.header === "string" ? c.header : c.key) }),
              /* @__PURE__ */ jsxRuntime.jsx("dd", { className: "text-sm text-foreground mt-0.5 break-words", children: c.render ? c.render(row, i) : cellText(accessorOf(c)(row)) || "\u2014" })
            ] }, c.key)) }),
            isExpanded && renderExpanded && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-3 pt-3 border-t border-border/70", onClick: (e) => e.stopPropagation(), children: renderExpanded(row) })
          ]
        },
        key
      );
    }) }),
    page != null && totalPages != null && onPageChange && !loading && processedRows.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(
      TableFooter,
      {
        page,
        totalPages,
        onPageChange,
        total,
        pageSize,
        shownCount: processedRows.length
      }
    )
  ] });
}

// src/components/data-table/export.ts
function exportRowsAsCsv(rows, columns, fileName) {
  const cols = columns.filter((c) => c.exportable !== false);
  const esc = (s) => /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const headerText = (h) => typeof h === "string" || typeof h === "number" ? String(h) : "";
  const lines = [
    cols.map((c) => esc(headerText(c.header) || c.key)).join(","),
    ...rows.map(
      (row) => cols.map((c) => {
        const v = c.accessor ? c.accessor(row) : row[c.key];
        return esc(cellText(v));
      }).join(",")
    )
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function DataTable(props) {
  const {
    columns,
    rows,
    rowKey,
    loading,
    loadingRows,
    error,
    onRetry,
    selectable,
    isRowSelectable,
    bulkActions = [],
    renderExpanded,
    storageKey,
    gridLines = "both",
    dense,
    pageSizeOptions = [1, 5, 10, 25, 50, 100, 500],
    maxBodyHeight = "65vh"
  } = props;
  const [internalSort, setInternalSort] = react.useState(props.defaultSort ?? null);
  const sort = props.sort !== void 0 ? props.sort : internalSort;
  const setSort = react.useCallback(
    (s) => {
      if (props.onSortChange) props.onSortChange(s);
      else setInternalSort(s);
    },
    [props.onSortChange]
  );
  const [internalFilters, setInternalFilters] = react.useState({});
  const filters = props.filters !== void 0 ? props.filters : internalFilters;
  const setColumnFilter = react.useCallback(
    (key, state) => {
      const next = { ...filters };
      if (state) next[key] = state;
      else delete next[key];
      if (props.onFiltersChange) props.onFiltersChange(next);
      else setInternalFilters(next);
    },
    [filters, props.onFiltersChange]
  );
  const [internalSelected, setInternalSelected] = react.useState(/* @__PURE__ */ new Set());
  const selected = props.selected ?? internalSelected;
  const setSelected = react.useCallback(
    (s) => {
      if (props.onSelectedChange) props.onSelectedChange(s);
      else setInternalSelected(s);
    },
    [props.onSelectedChange]
  );
  const [hiddenCols, setHiddenCols] = react.useState(() => loadHiddenColumns(storageKey, columns.map((c) => ({ key: c.key, label: cellText(c.header) || c.key, defaultHidden: c.defaultHidden }))));
  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key));
  const [expanded, setExpanded] = react.useState(/* @__PURE__ */ new Set());
  const accessorOf = react.useCallback(
    (col) => col.accessor ?? ((row) => row[col.key]),
    []
  );
  const processedRows = react.useMemo(() => {
    let out = rows;
    if (!props.onFiltersChange) {
      const active = Object.entries(filters).filter(([, st]) => st && ((st.values?.length ?? 0) > 0 || st.query?.trim()));
      if (active.length > 0) {
        out = out.filter(
          (row) => active.every(([key, st]) => {
            const col = columns.find((c) => c.key === key);
            if (!col) return true;
            const text = cellText(accessorOf(col)(row));
            if (st.values?.length && !st.values.includes(text)) return false;
            if (st.query?.trim() && !text.toLowerCase().includes(st.query.trim().toLowerCase())) return false;
            return true;
          })
        );
      }
    }
    if (!props.onSortChange && sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        const acc = accessorOf(col);
        out = [...out].sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compareValues(acc(a), acc(b)));
      }
    }
    return out;
  }, [rows, filters, sort, columns, props.onFiltersChange, props.onSortChange, accessorOf]);
  const selectableRows = react.useMemo(
    () => selectable ? processedRows.filter((r) => isRowSelectable?.(r) ?? true) : [],
    [processedRows, selectable, isRowSelectable]
  );
  const selectableKeys = selectableRows.map(rowKey);
  const allSelected = selectableKeys.length > 0 && selectableKeys.every((k) => selected.has(k));
  const someSelected = selectableKeys.some((k) => selected.has(k));
  function toggleAll() {
    const next = new Set(selected);
    if (allSelected) selectableKeys.forEach((k) => next.delete(k));
    else selectableKeys.forEach((k) => next.add(k));
    setSelected(next);
  }
  function cycleSort(key) {
    if (sort?.key !== key) setSort({ key, dir: "asc" });
    else if (sort.dir === "asc") setSort({ key, dir: "desc" });
    else setSort(null);
  }
  function funnelOptionsFor(col) {
    if (col.filterOptions) return col.filterOptions;
    const acc = accessorOf(col);
    const seen = /* @__PURE__ */ new Set();
    for (const row of rows) seen.add(cellText(acc(row)));
    return [...seen].sort().map((v) => ({ value: v }));
  }
  async function handleExportCsv() {
    const data = props.onExportAll ? await props.onExportAll() : processedRows;
    exportRowsAsCsv(data, visibleColumns, props.exportFileName ?? "export");
  }
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0);
  const cellPad = dense ? "px-4 py-2.5" : "px-4 py-3";
  const showToolbar = props.onPageSizeChange || props.toolbar || props.toolbarActions || props.showExportCsv || props.onPrint || storageKey;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cx2("space-y-3", props.className), children: [
    showToolbar && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      props.onPageSizeChange && /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
        "Show",
        /* @__PURE__ */ jsxRuntime.jsx(
          "select",
          {
            value: props.pageSize,
            onChange: (e) => props.onPageSizeChange?.(Number(e.target.value)),
            className: "rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:ring-1 focus:ring-ring focus:outline-none",
            children: pageSizeOptions.map((n) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: n, children: n }, n))
          }
        ),
        "entries"
      ] }),
      props.toolbar,
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        props.showExportCsv && /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: () => void handleExportCsv(),
            className: "inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileDown, { className: "h-3.5 w-3.5" }),
              " Export CSV"
            ]
          }
        ),
        props.onPrint && /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: props.onPrint,
            className: "inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Printer, { className: "h-3.5 w-3.5" }),
              " Print"
            ]
          }
        ),
        props.toolbarActions,
        storageKey && /* @__PURE__ */ jsxRuntime.jsx(
          ColumnVisibilityButton,
          {
            columns: columns.map((c) => ({ key: c.key, label: cellText(c.header) || c.key, defaultHidden: c.defaultHidden })),
            hidden: hiddenCols,
            onChange: setHiddenCols,
            storageKey
          }
        )
      ] })
    ] }),
    selectable && bulkActions.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(BulkActionBar, { selectedKeys: [...selected], actions: bulkActions, onClear: () => setSelected(/* @__PURE__ */ new Set()) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      DataTableDesktop,
      {
        visibleColumns,
        processedRows,
        rowKey,
        accessorOf,
        loading,
        loadingRows,
        error,
        onRetry,
        emptyState: props.emptyState,
        emptyText: props.emptyText,
        gridLines,
        cellPad,
        colSpan,
        maxBodyHeight,
        sort,
        cycleSort,
        filters,
        setColumnFilter,
        funnelOptionsFor,
        selectable,
        selected,
        setSelected,
        isRowSelectable,
        allSelected,
        someSelected,
        toggleAll,
        renderExpanded,
        expanded,
        setExpanded,
        onRowClick: props.onRowClick,
        rowClassName: props.rowClassName,
        page: props.page,
        totalPages: props.totalPages,
        onPageChange: props.onPageChange,
        total: props.total,
        pageSize: props.pageSize
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      DataTableMobile,
      {
        visibleColumns,
        processedRows,
        rowKey,
        accessorOf,
        loading,
        loadingRows,
        error,
        onRetry,
        emptyState: props.emptyState,
        emptyText: props.emptyText,
        selectable,
        selected,
        setSelected,
        isRowSelectable,
        renderExpanded,
        expanded,
        setExpanded,
        onRowClick: props.onRowClick,
        rowClassName: props.rowClassName,
        page: props.page,
        totalPages: props.totalPages,
        onPageChange: props.onPageChange,
        total: props.total,
        pageSize: props.pageSize
      }
    )
  ] });
}

// src/components/legal/consent-store.ts
var CONSENT_COOKIE = "cv_cookie_consent";
var CONSENT_CHANGED_EVENT = "cv:cookie-consent";
var OPEN_SETTINGS_EVENT = "cv:open-cookie-settings";
var ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
var PLATFORM_DOMAIN = "codevertexafrica.com";
var NO_OPTIONAL_CONSENT = { functional: false, analytics: false };
function parse(raw) {
  if (!raw) return null;
  if (raw === "accepted") return { functional: true, analytics: true };
  if (raw === "declined") return { ...NO_OPTIONAL_CONSENT };
  if (!raw.startsWith("v1:")) return null;
  const state = { ...NO_OPTIONAL_CONSENT };
  for (const pair of raw.slice(3).split(",")) {
    const [key, value] = pair.split("=");
    if (key === "functional" || key === "analytics") state[key] = value === "1";
  }
  return state;
}
function serialise(state) {
  return `v1:functional=${state.functional ? 1 : 0},analytics=${state.analytics ? 1 : 0}`;
}
function consentCookieDomain(hostname) {
  return hostname === PLATFORM_DOMAIN || hostname.endsWith(`.${PLATFORM_DOMAIN}`) ? `.${PLATFORM_DOMAIN}` : void 0;
}
function readCookieConsent() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return parse(match ? decodeURIComponent(match[1]) : null);
}
function writeCookieConsent(state) {
  if (typeof document === "undefined") return;
  const domain = consentCookieDomain(window.location.hostname);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(serialise(state))}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax` + (domain ? `; domain=${domain}` : "") + secure;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: state }));
}
function openCookieSettings() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

// src/components/legal/legal-urls.ts
var DEFAULT_LEGAL_BASE_URL = "https://accounts.codevertexafrica.com";
function resolveLegalBaseUrl(baseUrl) {
  const fromEnv = typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_LEGAL_BASE_URL : void 0;
  return (baseUrl || fromEnv || DEFAULT_LEGAL_BASE_URL).replace(/\/+$/, "");
}
function legalUrls(baseUrl) {
  const base = resolveLegalBaseUrl(baseUrl);
  return {
    privacy: `${base}/privacy`,
    terms: `${base}/terms-of-service`,
    cookies: `${base}/cookies`,
    refunds: `${base}/refund-policy`,
    dataRequests: `${base}/data-requests`
  };
}
var PLATFORM_LEGAL_ENTITY = {
  name: "Codevertex Africa Limited",
  address: "Pioneer House, Kisumu, Kenya",
  email: "info@codevertexafrica.com"
};
var CATEGORIES = [
  {
    key: "functional",
    label: "Functional",
    description: "Chat widgets and embedded help that remember you between visits."
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Anonymous usage statistics that help us improve the product."
  }
];
function CookieNotice({ legalBaseUrl, offsetClassName = "bottom-0", className = "" }) {
  const [open, setOpen] = react.useState(false);
  const [customising, setCustomising] = react.useState(false);
  const [draft, setDraft] = react.useState(NO_OPTIONAL_CONSENT);
  const titleId = react.useId();
  const urls = legalUrls(legalBaseUrl);
  react.useEffect(() => {
    if (readCookieConsent() === null) setOpen(true);
    function reopen() {
      setDraft(readCookieConsent() ?? NO_OPTIONAL_CONSENT);
      setCustomising(true);
      setOpen(true);
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);
  if (!open) return null;
  function save(state) {
    writeCookieConsent(state);
    setOpen(false);
    setCustomising(false);
  }
  const buttonClass = "flex-1 sm:flex-none min-h-10 px-4 rounded-lg text-sm font-semibold border border-border bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors";
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "dialog",
      "aria-modal": "false",
      "aria-labelledby": titleId,
      className: `fixed inset-x-0 z-[60] p-3 sm:p-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${offsetClassName} ${className}`,
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mx-auto max-w-3xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-4 sm:p-5", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Cookie, { className: "h-4 w-4", "aria-hidden": "true" }) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("p", { id: titleId, className: "text-sm font-semibold text-foreground", children: "Cookies on this site" }),
            /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
              "We use strictly necessary cookies to sign you in and keep the app secure. Optional cookies are off unless you turn them on. Read the",
              " ",
              /* @__PURE__ */ jsxRuntime.jsx("a", { href: urls.cookies, className: "underline underline-offset-2 hover:text-primary", target: "_blank", rel: "noopener noreferrer", children: "Cookie Policy" }),
              " ",
              "and",
              " ",
              /* @__PURE__ */ jsxRuntime.jsx("a", { href: urls.privacy, className: "underline underline-offset-2 hover:text-primary", target: "_blank", rel: "noopener noreferrer", children: "Privacy Policy" }),
              "."
            ] })
          ] })
        ] }),
        customising && /* @__PURE__ */ jsxRuntime.jsxs("fieldset", { className: "mt-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("legend", { className: "sr-only", children: "Optional cookie categories" }),
          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-start gap-3 rounded-xl border border-border p-3 opacity-80", children: [
            /* @__PURE__ */ jsxRuntime.jsx("input", { type: "checkbox", checked: true, disabled: true, className: "mt-0.5 h-4 w-4 accent-primary" }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold text-foreground", children: "Strictly necessary" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block text-muted-foreground", children: "Sign-in, security and your theme. Always on." })
            ] })
          ] }),
          CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-start gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-muted/50", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "checkbox",
                checked: draft[c.key],
                onChange: (e) => setDraft((d) => ({ ...d, [c.key]: e.target.checked })),
                className: "mt-0.5 h-4 w-4 accent-primary"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold text-foreground", children: c.label }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block text-muted-foreground", children: c.description })
            ] })
          ] }, c.key))
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 flex flex-wrap gap-2 sm:justify-end", children: [
          customising ? /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: buttonClass, onClick: () => save(draft), children: "Save choices" }) : /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: buttonClass, onClick: () => setCustomising(true), children: "Customise" }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: buttonClass, onClick: () => save(NO_OPTIONAL_CONSENT), children: "Reject optional" }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: buttonClass, onClick: () => save({ functional: true, analytics: true }), children: "Accept all" })
        ] })
      ] })
    }
  );
}
function LegalLinks({ legalBaseUrl, layout = "row", showEntity = true, className = "" }) {
  const urls = legalUrls(legalBaseUrl);
  const links = [
    { label: "Privacy", href: urls.privacy },
    { label: "Terms", href: urls.terms },
    { label: "Cookies", href: urls.cookies },
    { label: "Refunds", href: urls.refunds },
    { label: "Your data", href: urls.dataRequests }
  ];
  const linkClass = "rounded hover:text-foreground hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `text-xs text-muted-foreground ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "nav",
      {
        "aria-label": "Legal",
        className: layout === "row" ? "flex flex-wrap items-center gap-x-4 gap-y-1.5" : "flex flex-col gap-1.5",
        children: [
          links.map((l) => /* @__PURE__ */ jsxRuntime.jsx("a", { href: l.href, target: "_blank", rel: "noopener noreferrer", className: linkClass, children: l.label }, l.label)),
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: openCookieSettings, className: `text-left ${linkClass}`, children: "Cookie settings" })
        ]
      }
    ),
    showEntity && /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mt-2", children: [
      PLATFORM_LEGAL_ENTITY.name,
      ", ",
      PLATFORM_LEGAL_ENTITY.address,
      ".",
      " ",
      /* @__PURE__ */ jsxRuntime.jsx("a", { href: `mailto:${PLATFORM_LEGAL_ENTITY.email}`, className: linkClass, children: PLATFORM_LEGAL_ENTITY.email })
    ] })
  ] });
}
function subscribe(onChange) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}
var lastRaw;
var lastState = null;
function snapshot() {
  const raw = typeof document === "undefined" ? "" : document.cookie;
  if (raw !== lastRaw) {
    lastRaw = raw;
    const next = readCookieConsent();
    const same = next !== null && lastState !== null && next.functional === lastState.functional && next.analytics === lastState.analytics;
    if (!same) lastState = next;
  }
  return lastState;
}
function useCookieConsentState() {
  return react.useSyncExternalStore(subscribe, snapshot, () => null);
}
function useCookieConsent(category) {
  const state = useCookieConsentState();
  return state?.[category] === true;
}

exports.AIRTEL_MONEY = AIRTEL_MONEY;
exports.AccountForm = AccountForm;
exports.AirtelMoneyLogo = AirtelMoneyLogo;
exports.BANK = BANK;
exports.BANK_TRANSFER = BANK_TRANSFER;
exports.BulkActionBar = BulkActionBar;
exports.CARD = CARD;
exports.CARD_MANUAL = CARD_MANUAL;
exports.CASH = CASH;
exports.CHEQUE = CHEQUE;
exports.CURRENCY_META = CURRENCY_META;
exports.CUSTOMER_ADVANCE = CUSTOMER_ADVANCE;
exports.CardMark = CardMark;
exports.CashMark = CashMark;
exports.Checkbox = Checkbox;
exports.ColumnVisibilityButton = ColumnVisibilityButton;
exports.CookieNotice = CookieNotice;
exports.CurrencyChangeConfirmModal = CurrencyChangeConfirmModal;
exports.DataTable = DataTable;
exports.EMPTY_ACCOUNT_FORM = EMPTY_ACCOUNT_FORM;
exports.FunnelFilter = FunnelFilter;
exports.ImagePreview = ImagePreview;
exports.LegalLinks = LegalLinks;
exports.MPESA_B2B = MPESA_B2B;
exports.MPESA_B2C = MPESA_B2C;
exports.MPESA_MANUAL = MPESA_MANUAL;
exports.MPESA_STK = MPESA_STK;
exports.MTN_MOMO = MTN_MOMO;
exports.MpesaLogo = MpesaLogo;
exports.MtnMomoLogo = MtnMomoLogo;
exports.OfflineBar = OfflineBar;
exports.OfflineSyncBanner = OfflineSyncBanner;
exports.PAYMENT_METHOD_LABELS = PAYMENT_METHOD_LABELS;
exports.PAYOUT_METHODS = PAYOUT_METHODS;
exports.PAYSTACK = PAYSTACK;
exports.PAY_SUPPLIER_METHODS = PAY_SUPPLIER_METHODS;
exports.PLATFORM_LEGAL_ENTITY = PLATFORM_LEGAL_ENTITY;
exports.PayHeroLogo = PayHeroLogo;
exports.PaystackLogo = PaystackLogo;
exports.PdfPreview = PdfPreview;
exports.PoweredByBadge = PoweredByBadge;
exports.PwaUpdater = PwaUpdater;
exports.RECEIVE_METHODS = RECEIVE_METHODS;
exports.RichText = RichText;
exports.RichTextEditor = RichTextEditor;
exports.SETTLE_CREDIT_SALE_METHODS = SETTLE_CREDIT_SALE_METHODS;
exports.SSOLoginModal = SSOLoginModal;
exports.STORE_CREDIT = STORE_CREDIT;
exports.SUPPORTED_CURRENCIES = SUPPORTED_CURRENCIES;
exports.SearchableCombobox = SearchableCombobox;
exports.SettlementModal = SettlementModal;
exports.SortButton = SortButton;
exports.SplitPayMark = SplitPayMark;
exports.SupplierForm = SupplierForm;
exports.SyncedConfirmation = SyncedConfirmation;
exports.TableFooter = TableFooter;
exports.TrackingIframeModal = TrackingIframeModal;
exports.TreasuryPaymentModal = TreasuryPaymentModal;
exports.exportRowsAsCsv = exportRowsAsCsv;
exports.formatCompactCurrency = formatCompactCurrency;
exports.formatCurrency = formatCurrency;
exports.getPaymentMethodLabel = getPaymentMethodLabel;
exports.isAccountFormValid = isAccountFormValid;
exports.legalUrls = legalUrls;
exports.openCookieSettings = openCookieSettings;
exports.registerServiceWorker = registerServiceWorker;
exports.useCookieConsent = useCookieConsent;
exports.useCookieConsentState = useCookieConsentState;
exports.useDocumentPreview = useDocumentPreview;
exports.useImagePreview = useImagePreview;
exports.useOfflineSync = useOfflineSync;
exports.useOnlineStatus = useOnlineStatus;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map