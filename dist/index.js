import { useState, useRef, useMemo, useCallback, useEffect, useLayoutEffect } from 'react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';
import { WifiOff, RefreshCw, CheckCircle2, X, ChevronsUpDown, Search, Loader2, Check, Columns3, Minus, ArrowUp, ArrowDown, ArrowUpDown, Filter, ChevronLeft, ChevronRight, FileDown, Printer, Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered, Link2, Link2Off, Undo2, Redo2, AlertTriangle, Inbox, ChevronDown } from 'lucide-react';
import Link from '@tiptap/extension-link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

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
  const [loginState, setLoginState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const iframeRef = useRef(null);
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      tenant: tenantSlug,
      embed: "true",
      redirect_uri: "postmessage"
    });
    return `${authUiUrl}/login?${params.toString()}`;
  }, [tenantSlug, authUiUrl]);
  const handleMessage = useCallback((event) => {
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
  useEffect(() => {
    if (open) {
      window.addEventListener("message", handleMessage);
      setLoginState("loading");
      setErrorMessage("");
    }
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [open, handleMessage]);
  const handleIframeLoad = useCallback(() => {
    if (loginState === "loading") {
      setLoginState("ready");
    }
  }, [loginState]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/50",
        onClick: () => onOpenChange(false)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: title }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onOpenChange(false),
            className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 relative", children: loginState === "failed" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-red-600", children: [
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsx("path", { d: "m15 9-6 6" }),
          /* @__PURE__ */ jsx("path", { d: "m9 9 6 6" })
        ] }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Login Failed" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: errorMessage }),
        /* @__PURE__ */ jsx(
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
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        loginState === "loading" && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white z-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Loading login..." })
        ] }) }),
        /* @__PURE__ */ jsx(
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
  const [paymentState, setPaymentState] = useState("loading");
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);
  const iframeSrc = useMemo(() => {
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
  const processedRef = useRef(false);
  const handleMessage = useCallback((event) => {
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
  useEffect(() => {
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
  const handleIframeLoad = useCallback(() => {
    if (paymentState === "loading") {
      setPaymentState("checkout");
    }
  }, [paymentState]);
  if (!open) return null;
  if (typeof document === "undefined") return null;
  return createPortal(
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black/50",
          onClick: () => onOpenChange(false)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90dvh]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white shrink-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 mr-3", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base sm:text-lg font-semibold text-gray-900 truncate", children: "Complete Payment" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm text-gray-500 truncate", children: [
              currency,
              " ",
              amount.toLocaleString(),
              description && ` \u2014 ${description}`
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onOpenChange(false),
              className: "shrink-0 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors",
              "aria-label": "Close",
              children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
                /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-y-auto relative", children: paymentState === "expired" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-amber-600", children: [
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })
          ] }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Payment Session Expired" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Your payment session has timed out. Please close this dialog and try again." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onOpenChange(false),
              className: "mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors",
              children: "Close"
            }
          )
        ] }) : paymentState === "confirmed" && paymentResult ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-green-600", children: [
            /* @__PURE__ */ jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
            /* @__PURE__ */ jsx("polyline", { points: "22 4 12 14.01 9 11.01" })
          ] }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Payment Successful" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              "Amount: ",
              /* @__PURE__ */ jsxs("span", { className: "font-medium text-gray-900", children: [
                currency,
                " ",
                paymentResult.amount.toLocaleString()
              ] })
            ] }),
            paymentResult.reference && /* @__PURE__ */ jsxs("p", { children: [
              "Reference: ",
              /* @__PURE__ */ jsx("span", { className: "font-mono text-gray-900", children: paymentResult.reference })
            ] }),
            paymentResult.channel && /* @__PURE__ */ jsxs("p", { children: [
              "Via: ",
              /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: paymentResult.channel })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onOpenChange(false),
              className: "mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors",
              children: "Done"
            }
          )
        ] }) : paymentState === "failed" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-red-600", children: [
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ jsx("path", { d: "m15 9-6 6" }),
            /* @__PURE__ */ jsx("path", { d: "m9 9 6 6" })
          ] }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Payment Failed" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: errorMessage }),
          /* @__PURE__ */ jsx(
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
        ] }) : /* @__PURE__ */ jsxs("div", { className: "relative h-full", children: [
          paymentState === "loading" && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white z-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Loading payment options..." })
          ] }) }),
          /* @__PURE__ */ jsx(
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
  methods,
  onSubmit,
  onClose,
  isPending = false,
  extraFields
}) {
  const [amount, setAmount] = useState(String(defaultAmount ?? amountValue));
  const [method, setMethod] = useState(methods[0]?.value ?? "");
  const [reference, setReference] = useState("");
  const [effectiveAt, setEffectiveAt] = useState(nowDatetimeLocal());
  const [error, setError] = useState("");
  const selectedMethod = useMemo(() => methods.find((m) => m.value === method), [methods, method]);
  if (!open || typeof document === "undefined") return null;
  const fmt = (v) => `${currency} ${v.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        effectiveAt: datetimeLocalToISO(effectiveAt)
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4", onClick: () => !isPending && onClose(), children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-md", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-xl overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-gray-200", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-gray-900", children: title }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            disabled: isPending,
            className: "p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-50 px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: subjectName }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
            amountLabel,
            ": ",
            fmt(amountValue)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-gray-500", children: [
            "Amount (",
            currency,
            ")"
          ] }),
          /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-500", children: "Payment date & time" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "datetime-local",
              value: effectiveAt,
              max: nowDatetimeLocal(),
              onChange: (e) => setEffectiveAt(e.target.value),
              className: "w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black"
            }
          )
        ] }),
        extraFields,
        methods.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-500", children: "Method" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: method,
              onChange: (e) => setMethod(e.target.value),
              className: "w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black",
              children: methods.map((m) => /* @__PURE__ */ jsx("option", { value: m.value, children: m.label }, m.value))
            }
          )
        ] }),
        (selectedMethod?.requiresReference || mode === "apply_to_debt") && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-gray-500", children: [
            "Reference ",
            selectedMethod?.requiresReference ? "" : "(optional)"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: reference,
              onChange: (e) => setReference(e.target.value),
              placeholder: "M-Pesa code, cheque no., etc.",
              className: "w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black"
            }
          )
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              disabled: isPending,
              className: "flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: submit,
              disabled: isPending,
              className: "flex-1 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2",
              children: [
                isPending && /* @__PURE__ */ jsx("span", { className: "w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" }),
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
  const [confirming, setConfirming] = useState(false);
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
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4", onClick: () => !busy && onCancel(), children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-md", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-neutral-800", children: /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-gray-900 dark:text-gray-100", children: "Confirm currency change" }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-3 rounded-lg bg-gray-50 dark:bg-neutral-800 px-4 py-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-gray-700 dark:text-gray-300", children: fromCurrency }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", "aria-hidden": true, children: "\u2192" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-gray-900 dark:text-gray-100", children: toCurrency })
        ] }),
        rate != null ? /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-300 text-center", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Current rate: ",
            /* @__PURE__ */ jsxs("span", { className: "font-mono font-semibold", children: [
              "1 ",
              fromCurrency,
              " = ",
              rate.toLocaleString(void 0, { maximumFractionDigits: 6 }),
              " ",
              toCurrency
            ] })
          ] }),
          rateSource && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-0.5", children: rateSource })
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-600 dark:text-amber-400 text-center", children: error || "No exchange rate is available for this pair yet \u2014 you can still switch, but nothing will be converted." }),
        exampleAmounts.length > 0 && rate != null && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-200 dark:border-neutral-800 divide-y divide-gray-100 dark:divide-neutral-800 overflow-hidden", children: exampleAmounts.map((row) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2 text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-500 dark:text-gray-400", children: row.label }),
          /* @__PURE__ */ jsxs("span", { className: "font-mono", children: [
            formatCurrency(row.originalAmount, fromCurrency),
            /* @__PURE__ */ jsx("span", { className: "text-gray-400 mx-1", children: "\u2192" }),
            formatCurrency(row.originalAmount * rate, toCurrency)
          ] })
        ] }, row.label)) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-500", children: [
          "New transactions will be recorded in ",
          toCurrency,
          " going forward. The rate and both currency values are stored on the change so it stays traceable."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onCancel,
              disabled: busy,
              className: "flex-1 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleConfirm,
              disabled: busy,
              className: "flex-1 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2",
              children: [
                busy && /* @__PURE__ */ jsx("span", { className: "w-3.5 h-3.5 border-2 border-white/40 dark:border-black/40 border-t-white dark:border-t-black rounded-full animate-spin" }),
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
function TrackingIframeModal({
  open,
  onOpenChange,
  trackingCode,
  logisticsUiUrl = "https://logistics.codevertexafrica.com",
  title = "Track Order"
}) {
  const [loadState, setLoadState] = useState("loading");
  const iframeRef = useRef(null);
  const iframeSrc = `${logisticsUiUrl}/track/${encodeURIComponent(trackingCode)}?embed=true`;
  const handleMessage = useCallback((event) => {
    if (!logisticsUiUrl || !event.origin.includes(new URL(logisticsUiUrl).hostname)) return;
    const data = event.data;
    if (!data || typeof data.type !== "string") return;
    if (data.type === "tracking:resize" || data.type === "logistics:resize") {
      if (iframeRef.current && data.height) {
        iframeRef.current.style.height = `${data.height}px`;
      }
    }
  }, [logisticsUiUrl]);
  useEffect(() => {
    if (open) {
      window.addEventListener("message", handleMessage);
      setLoadState("loading");
    }
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [open, handleMessage]);
  const handleIframeLoad = useCallback(() => {
    setLoadState("ready");
  }, []);
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/50",
        onClick: () => onOpenChange(false)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: title }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
            "Tracking: ",
            /* @__PURE__ */ jsx("span", { className: "font-mono", children: trackingCode })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onOpenChange(false),
            className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 relative", children: [
        loadState === "loading" && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white z-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Loading tracking info..." })
        ] }) }),
        /* @__PURE__ */ jsx(
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
var Spinner = () => /* @__PURE__ */ jsx(
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
    children: /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
  }
);
var IconDownload = () => /* @__PURE__ */ jsxs(
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
      /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
      /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
      /* @__PURE__ */ jsx("line", { x1: "12", x2: "12", y1: "15", y2: "3" })
    ]
  }
);
var IconPrinter = () => /* @__PURE__ */ jsxs(
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
      /* @__PURE__ */ jsx("path", { d: "M6 9V2h12v7" }),
      /* @__PURE__ */ jsx("path", { d: "M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" }),
      /* @__PURE__ */ jsx("rect", { x: "6", y: "14", width: "12", height: "8" })
    ]
  }
);
var IconExternal = () => /* @__PURE__ */ jsxs(
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
      /* @__PURE__ */ jsx("path", { d: "M15 3h6v6" }),
      /* @__PURE__ */ jsx("path", { d: "M10 14 21 3" }),
      /* @__PURE__ */ jsx("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" })
    ]
  }
);
var IconClose = () => /* @__PURE__ */ jsxs(
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
      /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
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
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
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
  return /* @__PURE__ */ jsxs("div", { style: S.overlay, role: "dialog", "aria-modal": "true", "aria-label": title, children: [
    /* @__PURE__ */ jsx("style", { children: "@keyframes bx-pdfp-rotate{to{transform:rotate(360deg)}}.bx-pdfp-spin{animation:bx-pdfp-rotate 0.8s linear infinite}" }),
    /* @__PURE__ */ jsx("div", { style: S.backdrop, onClick: () => onOpenChange(false) }),
    /* @__PURE__ */ jsxs("div", { style: { ...S.modal, maxWidth: orientation === "landscape" ? "95vw" : "90vw" }, children: [
      /* @__PURE__ */ jsxs("div", { style: S.header, children: [
        /* @__PURE__ */ jsxs("div", { style: { minWidth: 0 }, children: [
          /* @__PURE__ */ jsx("h2", { style: S.title, children: title }),
          /* @__PURE__ */ jsx("p", { style: S.subtitle, children: fileName })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => onOpenChange(false), style: S.iconBtn, "aria-label": "Close", children: /* @__PURE__ */ jsx(IconClose, {}) })
      ] }),
      /* @__PURE__ */ jsx("div", { style: S.body, children: isLoading ? /* @__PURE__ */ jsxs("div", { style: S.center, children: [
        /* @__PURE__ */ jsx(Spinner, {}),
        /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: 14 }, children: "Generating document\u2026" })
      ] }) : previewUrl ? /* @__PURE__ */ jsx("iframe", { src: previewUrl, title, style: S.iframe }) : blob ? /* @__PURE__ */ jsxs("div", { style: { ...S.center, textAlign: "center" }, children: [
        /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: 14 }, children: "Preview is not available for this file." }),
        /* @__PURE__ */ jsxs("button", { onClick: handleDownload, style: S.btnPrimary, children: [
          /* @__PURE__ */ jsx(IconDownload, {}),
          " Download ",
          fileName
        ] })
      ] }) : null }),
      /* @__PURE__ */ jsxs("div", { style: S.footer, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => onOpenChange(false), style: S.btn, children: "Close" }),
        previewUrl && /* @__PURE__ */ jsxs("button", { onClick: handleOpenTab, style: S.btn, children: [
          /* @__PURE__ */ jsx(IconExternal, {}),
          " Open in tab"
        ] }),
        previewUrl && /* @__PURE__ */ jsxs("button", { onClick: handlePrint, style: S.btn, children: [
          /* @__PURE__ */ jsx(IconPrinter, {}),
          " Print"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleDownload,
            disabled: !blob || isLoading,
            style: { ...S.btnPrimary, opacity: !blob || isLoading ? 0.5 : 1 },
            children: [
              /* @__PURE__ */ jsx(IconDownload, {}),
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
  const [state, setState] = useState(INITIAL);
  const openPreview = useCallback(
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
  const onOpenChange = useCallback((open) => setState((s) => ({ ...s, open })), []);
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
var IconClose2 = () => /* @__PURE__ */ jsxs(
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
      /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
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
  const [showSecondary, setShowSecondary] = useState(false);
  if (!open) return null;
  const hasSecondary = Boolean(secondarySrc);
  const activeSrc = hasSecondary && showSecondary ? secondarySrc : src;
  const activeAlt = hasSecondary ? showSecondary ? secondaryLabel : primaryLabel : alt;
  return /* @__PURE__ */ jsxs("div", { style: S2.overlay, role: "dialog", "aria-modal": "true", "aria-label": title, children: [
    /* @__PURE__ */ jsx("div", { style: S2.backdrop, onClick: () => onOpenChange(false) }),
    /* @__PURE__ */ jsxs("div", { style: S2.modal, children: [
      /* @__PURE__ */ jsxs("div", { style: S2.header, children: [
        /* @__PURE__ */ jsx("h2", { style: S2.title, children: title }),
        /* @__PURE__ */ jsx("button", { onClick: () => onOpenChange(false), style: S2.iconBtn, "aria-label": "Close", children: /* @__PURE__ */ jsx(IconClose2, {}) })
      ] }),
      hasSecondary && /* @__PURE__ */ jsxs("div", { style: S2.tabs, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowSecondary(false),
            style: { ...S2.tab, ...showSecondary ? {} : S2.tabActive },
            children: primaryLabel
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowSecondary(true),
            style: { ...S2.tab, ...showSecondary ? S2.tabActive : {} },
            children: secondaryLabel
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { style: S2.body, children: activeSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        /* @__PURE__ */ jsx("img", { src: activeSrc, alt: activeAlt, style: S2.image })
      ) : /* @__PURE__ */ jsx("div", { style: S2.center, children: /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: 14 }, children: "No image available." }) }) })
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
  const [state, setState] = useState(INITIAL2);
  const openPreview = useCallback((o) => {
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
  const onOpenChange = useCallback((open) => setState((s) => ({ ...s, open })), []);
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
    return /* @__PURE__ */ jsxs(
      "div",
      {
        role: "status",
        className: `flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
        children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(WifiOff, { className: "h-4 w-4 shrink-0" }),
            "Offline mode \u2014 your work is saved and will sync when you\u2019re back online."
          ] }),
          availableOffline?.length ? /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-amber-50/90", children: [
            "Available: ",
            availableOffline.join(", ")
          ] }) : null,
          disabledOffline?.length ? /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-amber-50/90", children: [
            "Unavailable: ",
            disabledOffline.join(", ")
          ] }) : null
        ]
      }
    );
  }
  if (isSyncing) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        role: "status",
        className: `flex w-full items-center justify-center gap-3 bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
        children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 shrink-0 animate-spin" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Syncing offline data\u2026",
            pendingCount > 0 ? ` (${pendingCount} remaining)` : ""
          ] }),
          onSyncNow ? /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs("div", { className: `inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 ${className}`, children: [
    /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
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
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isLegacyDomain, setIsLegacyDomain] = useState(false);
  useEffect(() => {
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
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "status",
      className: `flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white ${className}`,
      children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsx("span", { children: isLegacyDomain ? "This app has moved to a new address." : "A new version is available." }),
        /* @__PURE__ */ jsx(
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
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
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
  const [pendingCount, setPendingCount] = useState(0);
  const fnRef = useRef(getPendingCount);
  fnRef.current = getPendingCount;
  const tick = useCallback(async () => {
    if (!fnRef.current) return;
    try {
      const n = await fnRef.current();
      setPendingCount(Number.isFinite(n) ? n : 0);
    } catch {
    }
  }, []);
  useEffect(() => {
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
  useEffect(() => {
    if (registerSW) registerServiceWorker(swUrl);
  }, [registerSW, swUrl]);
  const { isOnline, pendingCount, syncing } = useOfflineSync({ getPendingCount });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    showUpdater ? /* @__PURE__ */ jsx(PwaUpdater, {}) : null,
    /* @__PURE__ */ jsx(
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
  const [name, setName] = useState(iv.name ?? "");
  const [contact, setContact] = useState(iv.contact_person ?? "");
  const [email, setEmail] = useState(iv.email ?? "");
  const [phone, setPhone] = useState(iv.phone ?? "");
  const [address, setAddress] = useState(iv.address ?? "");
  const [notes, setNotes] = useState(iv.notes ?? "");
  const [taxNumber, setTaxNumber] = useState(iv.tax_number ?? "");
  const [taxPin, setTaxPin] = useState(iv.tax_pin ?? "");
  const [paymentMethod, setPaymentMethod] = useState(
    iv.payment_method_type ?? ""
  );
  const [mpesaPhone, setMpesaPhone] = useState(iv.mpesa_phone ?? "");
  const [mpesaBusinessName, setMpesaBusinessName] = useState(iv.mpesa_business_name ?? "");
  const [bankAccount, setBankAccount] = useState(iv.bank_account_number ?? "");
  const [bankName, setBankName] = useState(iv.bank_name ?? "");
  const [bankCode, setBankCode] = useState("");
  const [bankBranch, setBankBranch] = useState(iv.bank_branch ?? "");
  const [autoPay, setAutoPay] = useState(iv.auto_pay_enabled ?? false);
  const [requiresInvoice, setRequiresInvoice] = useState(
    iv.requires_invoice_before_payment ?? false
  );
  const [paymentTerms, setPaymentTerms] = useState(
    iv.payment_terms_days != null ? String(iv.payment_terms_days) : ""
  );
  const [creditLimit, setCreditLimit] = useState(
    iv.credit_limit != null ? String(iv.credit_limit) : ""
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
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
      tax_number: taxNumber.trim() || void 0,
      tax_pin: taxPin.trim() || void 0,
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
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: `space-y-5 ${className}`, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: sectionLabelCls, children: "Basic Information" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Supplier Name *" }),
          /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Contact Person" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: inputCls,
              placeholder: "Full name",
              value: contact,
              onChange: (e) => setContact(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Email" }),
            /* @__PURE__ */ jsx(
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
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Phone" }),
            /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Tax Number (KRA PIN)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                placeholder: "e.g. A000000000B",
                value: taxNumber,
                onChange: (e) => setTaxNumber(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Tax PIN" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                placeholder: "Tax PIN",
                value: taxPin,
                onChange: (e) => setTaxPin(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Address" }),
          /* @__PURE__ */ jsx(
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
    !hidePaymentConfig && /* @__PURE__ */ jsxs("div", { className: "border-t border-border pt-5", children: [
      /* @__PURE__ */ jsx("p", { className: sectionLabelCls, children: "Payment Configuration" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Payment Method" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: paymentMethod,
              onChange: (e) => setPaymentMethod(e.target.value),
              className: inputCls,
              children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsx("option", { value: m.value, children: m.label }, m.value))
            }
          )
        ] }),
        isMpesa && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "M-Pesa Phone" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                placeholder: "254700000000",
                value: mpesaPhone,
                onChange: (e) => setMpesaPhone(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Business Name" }),
            /* @__PURE__ */ jsx(
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
        isBank && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          renderBankFields ? renderBankFields({
            bankName,
            bankCode,
            accountNumber: bankAccount,
            onChange: (patch) => {
              if (patch.bank_name !== void 0) setBankName(patch.bank_name);
              if (patch.bank_code !== void 0) setBankCode(patch.bank_code);
              if (patch.account_number !== void 0) setBankAccount(patch.account_number);
            }
          }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Bank Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: inputCls,
                  placeholder: "Bank name",
                  value: bankName,
                  onChange: (e) => setBankName(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Account Number" }),
              /* @__PURE__ */ jsx(
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
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Branch (optional)" }),
            /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Payment Terms (days)" }),
            /* @__PURE__ */ jsx(
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
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Credit Limit" }),
            /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 pt-1", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: autoPay,
                onChange: (e) => setAutoPay(e.target.checked),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Enable Auto-Pay (automatically trigger payout on PO receipt)" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: requiresInvoice,
                onChange: (e) => setRequiresInvoice(e.target.checked),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Requires Invoice Before Payment" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("label", { className: labelCls, children: "Notes" }),
      /* @__PURE__ */ jsx(
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
    error && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
      onCancel && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          className: "flex-1 rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const ref = useRef(null);
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);
  const [selectedCache, setSelectedCache] = useState(void 0);
  const selected = options.find((o) => o.value === value) ?? (selectedCache && selectedCache.value === value ? selectedCache : void 0) ?? (value && valueLabel ? { value, label: valueLabel } : void 0);
  const localMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint ?? "").toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);
  useEffect(() => {
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
  const merged = useMemo(() => {
    if (remoteResults.length === 0) return localMatches;
    const seen = new Set(localMatches.map((o) => o.value));
    return [...localMatches, ...remoteResults.filter((o) => !seen.has(o.value))];
  }, [localMatches, remoteResults]);
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setRemoteResults([]);
  }, []);
  useEffect(() => {
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
  return /* @__PURE__ */ jsxs("div", { ref, className: cx("relative", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => open ? close() : setOpen(true),
        className: "flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60",
        children: [
          /* @__PURE__ */ jsxs("span", { className: cx("flex min-w-0 items-center gap-2 text-left", !selected && "text-muted-foreground"), children: [
            selected?.icon,
            /* @__PURE__ */ jsx("span", { className: "truncate", children: selected ? selected.label : placeholder })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            clearable && selected && !disabled && /* @__PURE__ */ jsx(
              X,
              {
                className: "h-4 w-4 text-muted-foreground hover:text-foreground",
                onClick: (e) => {
                  e.stopPropagation();
                  setSelectedCache(void 0);
                  onChange("", void 0);
                }
              }
            ),
            /* @__PURE__ */ jsx(ChevronsUpDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
          ] })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2", children: [
        /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            autoFocus: true,
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: searchPlaceholder,
            className: "w-full bg-transparent text-sm text-foreground focus:outline-none"
          }
        ),
        busy && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 shrink-0 animate-spin text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "max-h-60 overflow-y-auto py-1", children: [
        merged.length === 0 ? /* @__PURE__ */ jsx("li", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: busy ? "Searching\u2026" : emptyText }) : merged.map((o) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => select(o),
            className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60",
            children: [
              /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
                o.icon,
                /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-baseline gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "truncate text-foreground", children: o.label }),
                    o.hint && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: o.hint })
                  ] }),
                  o.description && /* @__PURE__ */ jsx("span", { className: "block truncate text-xs text-muted-foreground", children: o.description })
                ] })
              ] }),
              o.value === value && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 shrink-0 text-primary" })
            ]
          }
        ) }, o.value)),
        hasMore && onLoadMore && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onLoadMore,
            className: "w-full px-3 py-2 text-center text-xs font-medium text-primary hover:bg-muted/60",
            children: "Load more\u2026"
          }
        ) })
      ] }),
      footer && /* @__PURE__ */ jsx("div", { className: "border-t border-border p-1", children: footer })
    ] })
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
  className
}) {
  const stacked = layout === "stacked";
  const iconSize = iconClassName ?? (stacked ? "h-10 w-10" : "h-7 w-7");
  return /* @__PURE__ */ jsxs(
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
        /* @__PURE__ */ jsx("span", { className: "shrink-0 flex items-center justify-center rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-1", children: /* @__PURE__ */ jsx("img", { src: iconUrl, alt: "Codevertex", className: cx2(iconSize, "object-contain") }) }),
        stacked ? /* @__PURE__ */ jsxs("span", { className: "flex flex-col items-start leading-tight text-left uppercase", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-wider text-foreground", children: "Powered by" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-extrabold tracking-wide whitespace-nowrap", style: { color: BRAND_ORANGE }, children: "Codevertex Africa Limited" })
        ] }) : /* @__PURE__ */ jsxs("span", { className: "text-xs font-extrabold uppercase tracking-wide whitespace-nowrap", children: [
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Powered by" }),
          " ",
          /* @__PURE__ */ jsx("span", { style: { color: BRAND_ORANGE }, children: "Codevertex Africa Limited" })
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
  return /* @__PURE__ */ jsx(
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
      children: /* @__PURE__ */ jsx(Icon, { className: "size-4", "aria-hidden": true })
    }
  );
}
function Toolbar({ editor }) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5", children: [
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Bold, label: "Bold", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Italic, label: "Italic", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Strikethrough, label: "Strikethrough", active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run() }),
    /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Heading2, label: "Heading", active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Heading3, label: "Subheading", active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() }),
    /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: List, label: "Bullet list", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: ListOrdered, label: "Numbered list", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run() }),
    /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Link2, label: "Add link", active: editor.isActive("link"), onClick: setLink }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Link2Off, label: "Remove link", disabled: !editor.isActive("link"), onClick: () => editor.chain().focus().unsetLink().run() }),
    /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Undo2, label: "Undo", disabled: !editor.can().undo(), onClick: () => editor.chain().focus().undo().run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Redo2, label: "Redo", disabled: !editor.can().redo(), onClick: () => editor.chain().focus().redo().run() })
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
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Use our own Link config below (safe protocols + branded styling).
        link: false
      }),
      Link.configure({
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
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current && !(next === "" && current === "<p></p>")) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);
  if (!editor) {
    return /* @__PURE__ */ jsx("div", { className: cx3("rounded-lg border border-input bg-background", className), children: /* @__PURE__ */ jsx("div", { className: "h-[180px] animate-pulse rounded-lg bg-muted/40" }) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id,
      className: cx3(
        "overflow-hidden rounded-lg border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(Toolbar, { editor }),
        /* @__PURE__ */ jsx(EditorContent, { editor })
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2", children: [
    /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold text-foreground", children: [
      count,
      " selected"
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: onClear,
        className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
        children: [
          /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }),
          " Clear"
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "h-4 w-px bg-border" }),
    actions.map((a) => /* @__PURE__ */ jsxs(
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
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null);
  useLayoutEffect(() => {
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
  useEffect(() => {
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
  return /* @__PURE__ */ jsx(
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
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(`dt-cols:${storageKey}`, JSON.stringify([...hidden]));
    } catch {
    }
  }, [hidden, storageKey]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
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
          /* @__PURE__ */ jsx(Columns3, { className: "h-3.5 w-3.5" }),
          "Columns",
          hidden.size > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-primary font-semibold", children: [
            hidden.size,
            " hidden"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(AnchoredPopover, { open, onClose: () => setOpen(false), anchorRef: btnRef, align: "end", width: 220, children: [
      /* @__PURE__ */ jsx("p", { className: "px-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Columns" }),
      /* @__PURE__ */ jsx("ul", { className: "max-h-64 overflow-y-auto space-y-0.5", children: columns.map((c) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded px-1.5 py-1 hover:bg-accent cursor-pointer text-xs", children: [
        /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsx("span", { className: "truncate", children: c.label })
      ] }) }, c.key)) })
    ] })
  ] });
}
function Checkbox({ checked, indeterminate, onChange, disabled, className, ...rest }) {
  const active = checked || indeterminate;
  return /* @__PURE__ */ jsx(
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
      children: indeterminate ? /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" }) : checked ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }) : null
    }
  );
}
function SortButton({
  dir,
  onCycle
}) {
  const Icon = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown;
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: onCycle,
      "aria-label": "Sort column",
      className: cx2(
        "p-0.5 rounded transition-colors",
        dir ? "text-primary" : "text-muted-foreground/50 hover:text-foreground"
      ),
      children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" })
    }
  );
}
function FunnelFilter({
  options,
  state,
  onChange
}) {
  const [open, setOpen] = useState(false);
  const [optionQuery, setOptionQuery] = useState("");
  const btnRef = useRef(null);
  const active = !!state && ((state.values?.length ?? 0) > 0 || !!state.query?.trim());
  const selected = useMemo(() => new Set(state?.values ?? []), [state]);
  const visibleOptions = useMemo(() => {
    const q = optionQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.label ?? o.value).toLowerCase().includes(q));
  }, [options, optionQuery]);
  function commit(next) {
    const empty = !(next.values?.length ?? 0) && !next.query?.trim();
    onChange(empty ? void 0 : next);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
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
        children: /* @__PURE__ */ jsx(Filter, { className: cx2("h-3.5 w-3.5", active && "fill-primary/20") })
      }
    ),
    /* @__PURE__ */ jsx(AnchoredPopover, { open, onClose: () => setOpen(false), anchorRef: btnRef, children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsx(
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
      options.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        options.length > 8 && /* @__PURE__ */ jsx(
          "input",
          {
            value: optionQuery,
            onChange: (e) => setOptionQuery(e.target.value),
            placeholder: "Search values\u2026",
            className: "w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsxs("ul", { className: "max-h-52 overflow-y-auto space-y-0.5", children: [
          visibleOptions.map((o) => {
            const isOn = selected.has(o.value);
            return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded px-1.5 py-1 hover:bg-accent cursor-pointer text-xs", children: [
              /* @__PURE__ */ jsx(
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
              /* @__PURE__ */ jsx("span", { className: "truncate", children: o.label ?? (o.value === "" ? "(blank)" : o.value) })
            ] }) }, o.value);
          }),
          visibleOptions.length === 0 && /* @__PURE__ */ jsx("li", { className: "px-1.5 py-2 text-xs text-muted-foreground", children: "No values" })
        ] })
      ] }),
      active && /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            onChange(void 0);
            setOptionQuery("");
          },
          className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
          children: [
            /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }),
            " Clear filter"
          ]
        }
      )
    ] }) })
  ] });
}
function SkeletonBar({ widthClass = "w-3/4" }) {
  return /* @__PURE__ */ jsx("div", { className: `h-3.5 rounded bg-muted animate-pulse ${widthClass}` });
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: from != null && to != null && total != null ? `Showing ${from} to ${to} of ${total} entries` : `Page ${page} of ${totalPages}` }),
    totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          disabled: page <= 1,
          onClick: () => onPageChange(page - 1),
          "aria-label": "Previous page",
          className: "p-1.5 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
        }
      ),
      pages.map(
        (p, i) => p === "\u2026" ? /* @__PURE__ */ jsx("span", { className: "px-1 text-xs text-muted-foreground", children: "\u2026" }, `gap-${i}`) : /* @__PURE__ */ jsx(
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
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          disabled: page >= totalPages,
          onClick: () => onPageChange(page + 1),
          "aria-label": "Next page",
          className: "p-1.5 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" })
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
  return /* @__PURE__ */ jsx(Fragment, { children });
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
  return /* @__PURE__ */ jsxs("div", { className: "hidden md:block rounded-lg border border-border overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "overflow-auto", style: maxBodyHeight ? { maxHeight: maxBodyHeight } : void 0, children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "sticky top-0 z-10 bg-muted", children: /* @__PURE__ */ jsxs("tr", { className: cx2("border-b border-border bg-muted/40", gridLines === "both" && "divide-x divide-border/50"), children: [
        selectable && /* @__PURE__ */ jsx("th", { className: cx2(cellPad, "w-10"), children: /* @__PURE__ */ jsx(
          Checkbox,
          {
            checked: allSelected,
            indeterminate: !allSelected && someSelected,
            onChange: toggleAll,
            "aria-label": "Select all rows"
          }
        ) }),
        renderExpanded && /* @__PURE__ */ jsx("th", { className: cx2(cellPad, "w-8") }),
        visibleColumns.map((col) => /* @__PURE__ */ jsx(
          "th",
          {
            className: cx2(
              cellPad,
              "font-medium text-muted-foreground whitespace-nowrap",
              ALIGN[col.align ?? "left"],
              col.hideBelow && HIDE[col.hideBelow],
              col.headerClassName
            ),
            children: /* @__PURE__ */ jsxs("span", { className: cx2("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse"), children: [
              col.header,
              col.sortable && /* @__PURE__ */ jsx(SortButton, { dir: sort?.key === col.key ? sort.dir : null, onCycle: () => cycleSort(col.key) }),
              col.filterable && /* @__PURE__ */ jsx(
                FunnelFilter,
                {
                  options: funnelOptionsFor(col),
                  state: filters[col.key],
                  onChange: (st) => setColumnFilter(col.key, st)
                }
              )
            ] })
          },
          col.key
        ))
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/70", children: loading ? loadingRows ? Array.from({ length: loadingRows }).map((_, i) => /* @__PURE__ */ jsxs("tr", { className: gridLines === "both" ? "divide-x divide-border/50" : void 0, children: [
        selectable && /* @__PURE__ */ jsx("td", { className: cellPad }),
        renderExpanded && /* @__PURE__ */ jsx("td", { className: cellPad }),
        visibleColumns.map((col, ci) => /* @__PURE__ */ jsx("td", { className: cellPad, children: /* @__PURE__ */ jsx(SkeletonBar, { widthClass: SKELETON_WIDTHS[(i + ci) % SKELETON_WIDTHS.length] }) }, col.key))
      ] }, `skeleton-${i}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan, className: "px-6 py-12 text-center text-muted-foreground", children: "Loading\u2026" }) }) : error ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan, className: "px-6 py-12 text-center", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-10 w-10 mx-auto text-destructive/60 mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Couldn't load data" }),
        onRetry && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onRetry,
            className: "mt-3 rounded-lg border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors",
            children: "Retry"
          }
        )
      ] }) }) : processedRows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan, className: "px-6 py-12 text-center", children: props.emptyState ?? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Inbox, { className: "h-10 w-10 mx-auto text-muted-foreground/50 mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: props.emptyText ?? "No records found" })
      ] }) }) }) : processedRows.map((row, i) => {
        const key = rowKey(row);
        const isExpanded = expanded.has(key);
        const canSelect = isRowSelectable?.(row) ?? true;
        return /* @__PURE__ */ jsxs(FragmentRow, { children: [
          /* @__PURE__ */ jsxs(
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
                selectable && /* @__PURE__ */ jsx("td", { className: cellPad, children: canSelect && /* @__PURE__ */ jsx(
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
                renderExpanded && /* @__PURE__ */ jsx("td", { className: cellPad, children: /* @__PURE__ */ jsx(
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
                    children: isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
                  }
                ) }),
                visibleColumns.map((col) => /* @__PURE__ */ jsx(
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
          isExpanded && renderExpanded && /* @__PURE__ */ jsx("tr", { className: "bg-muted/20", children: /* @__PURE__ */ jsx("td", { colSpan, className: "px-6 py-3", children: renderExpanded(row) }) })
        ] }, key);
      }) })
    ] }) }),
    page != null && totalPages != null && onPageChange && !loading && processedRows.length > 0 && /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs("div", { className: "md:hidden rounded-lg border border-border", children: [
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: loading ? loadingRows ? Array.from({ length: loadingRows }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-2", children: [
      /* @__PURE__ */ jsx(SkeletonBar, { widthClass: "w-2/3" }),
      /* @__PURE__ */ jsx(SkeletonBar, { widthClass: "w-1/2" })
    ] }, `skeleton-${i}`)) : /* @__PURE__ */ jsx("div", { className: "px-6 py-12 text-center text-muted-foreground", children: "Loading\u2026" }) : error ? /* @__PURE__ */ jsxs("div", { className: "px-6 py-12 text-center", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-10 w-10 mx-auto text-destructive/60 mb-3" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Couldn't load data" }),
      onRetry && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onRetry,
          className: "mt-3 rounded-lg border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors",
          children: "Retry"
        }
      )
    ] }) : processedRows.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-6 py-12 text-center", children: props.emptyState ?? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Inbox, { className: "h-10 w-10 mx-auto text-muted-foreground/50 mb-3" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: props.emptyText ?? "No records found" })
    ] }) }) : processedRows.map((row, i) => {
      const key = rowKey(row);
      const isExpanded = expanded.has(key);
      const canSelect = isRowSelectable?.(row) ?? true;
      const primaryCol = visibleColumns.find((c) => c.primary);
      const actionCols = visibleColumns.filter((c) => c.mobileAction);
      const bodyCols = visibleColumns.filter((c) => !c.primary && !c.mobileAction && !c.mobileHidden);
      return /* @__PURE__ */ jsxs(
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
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              selectable && canSelect && /* @__PURE__ */ jsx("div", { onClick: (e) => e.stopPropagation(), className: "pt-0.5 shrink-0", children: /* @__PURE__ */ jsx(
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
              /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1", children: primaryCol && /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground break-words", children: primaryCol.render ? primaryCol.render(row, i) : cellText(accessorOf(primaryCol)(row)) || "\u2014" }) }),
              (actionCols.length > 0 || renderExpanded) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", onClick: (e) => e.stopPropagation(), children: [
                actionCols.map((c) => /* @__PURE__ */ jsx("div", { children: c.render ? c.render(row, i) : cellText(accessorOf(c)(row)) }, c.key)),
                renderExpanded && /* @__PURE__ */ jsx(
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
                    children: isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] }),
            bodyCols.length > 0 && /* @__PURE__ */ jsx("dl", { className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-2", children: bodyCols.map((c) => /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: c.mobileLabel ?? (typeof c.header === "string" ? c.header : c.key) }),
              /* @__PURE__ */ jsx("dd", { className: "text-sm text-foreground mt-0.5 break-words", children: c.render ? c.render(row, i) : cellText(accessorOf(c)(row)) || "\u2014" })
            ] }, c.key)) }),
            isExpanded && renderExpanded && /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-border/70", onClick: (e) => e.stopPropagation(), children: renderExpanded(row) })
          ]
        },
        key
      );
    }) }),
    page != null && totalPages != null && onPageChange && !loading && processedRows.length > 0 && /* @__PURE__ */ jsx(
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
  const [internalSort, setInternalSort] = useState(props.defaultSort ?? null);
  const sort = props.sort !== void 0 ? props.sort : internalSort;
  const setSort = useCallback(
    (s) => {
      if (props.onSortChange) props.onSortChange(s);
      else setInternalSort(s);
    },
    [props.onSortChange]
  );
  const [internalFilters, setInternalFilters] = useState({});
  const filters = props.filters !== void 0 ? props.filters : internalFilters;
  const setColumnFilter = useCallback(
    (key, state) => {
      const next = { ...filters };
      if (state) next[key] = state;
      else delete next[key];
      if (props.onFiltersChange) props.onFiltersChange(next);
      else setInternalFilters(next);
    },
    [filters, props.onFiltersChange]
  );
  const [internalSelected, setInternalSelected] = useState(/* @__PURE__ */ new Set());
  const selected = props.selected ?? internalSelected;
  const setSelected = useCallback(
    (s) => {
      if (props.onSelectedChange) props.onSelectedChange(s);
      else setInternalSelected(s);
    },
    [props.onSelectedChange]
  );
  const [hiddenCols, setHiddenCols] = useState(() => loadHiddenColumns(storageKey, columns.map((c) => ({ key: c.key, label: cellText(c.header) || c.key, defaultHidden: c.defaultHidden }))));
  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key));
  const [expanded, setExpanded] = useState(/* @__PURE__ */ new Set());
  const accessorOf = useCallback(
    (col) => col.accessor ?? ((row) => row[col.key]),
    []
  );
  const processedRows = useMemo(() => {
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
  const selectableRows = useMemo(
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
  return /* @__PURE__ */ jsxs("div", { className: cx2("space-y-3", props.className), children: [
    showToolbar && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      props.onPageSizeChange && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
        "Show",
        /* @__PURE__ */ jsx(
          "select",
          {
            value: props.pageSize,
            onChange: (e) => props.onPageSizeChange?.(Number(e.target.value)),
            className: "rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:ring-1 focus:ring-ring focus:outline-none",
            children: pageSizeOptions.map((n) => /* @__PURE__ */ jsx("option", { value: n, children: n }, n))
          }
        ),
        "entries"
      ] }),
      props.toolbar,
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        props.showExportCsv && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => void handleExportCsv(),
            className: "inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            children: [
              /* @__PURE__ */ jsx(FileDown, { className: "h-3.5 w-3.5" }),
              " Export CSV"
            ]
          }
        ),
        props.onPrint && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: props.onPrint,
            className: "inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            children: [
              /* @__PURE__ */ jsx(Printer, { className: "h-3.5 w-3.5" }),
              " Print"
            ]
          }
        ),
        props.toolbarActions,
        storageKey && /* @__PURE__ */ jsx(
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
    selectable && bulkActions.length > 0 && /* @__PURE__ */ jsx(BulkActionBar, { selectedKeys: [...selected], actions: bulkActions, onClear: () => setSelected(/* @__PURE__ */ new Set()) }),
    /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsx(
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

export { AIRTEL_MONEY, BANK, BANK_TRANSFER, BulkActionBar, CARD, CARD_MANUAL, CASH, CHEQUE, CURRENCY_META, CUSTOMER_ADVANCE, Checkbox, ColumnVisibilityButton, CurrencyChangeConfirmModal, DataTable, FunnelFilter, ImagePreview, MPESA_B2B, MPESA_B2C, MPESA_MANUAL, MPESA_STK, MTN_MOMO, OfflineBar, OfflineSyncBanner, PAYMENT_METHOD_LABELS, PAYOUT_METHODS, PAYSTACK, PAY_SUPPLIER_METHODS, PdfPreview, PoweredByBadge, PwaUpdater, RECEIVE_METHODS, RichText, RichTextEditor, SETTLE_CREDIT_SALE_METHODS, SSOLoginModal, STORE_CREDIT, SUPPORTED_CURRENCIES, SearchableCombobox, SettlementModal, SortButton, SupplierForm, SyncedConfirmation, TableFooter, TrackingIframeModal, TreasuryPaymentModal, exportRowsAsCsv, formatCompactCurrency, formatCurrency, getPaymentMethodLabel, registerServiceWorker, useDocumentPreview, useImagePreview, useOfflineSync, useOnlineStatus };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map