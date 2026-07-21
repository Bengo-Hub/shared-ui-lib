'use strict';

var react = require('react');
var reactDom = require('react-dom');
var jsxRuntime = require('react/jsx-runtime');

// src/components/payments/treasury-payment-modal.tsx
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
var RECEIVE_METHODS = [CASH, MPESA_STK, MPESA_MANUAL, BANK, CHEQUE, CARD, PAYSTACK, STORE_CREDIT];
var PAYOUT_METHODS = [CASH, MPESA_B2C, BANK, CHEQUE];
var PAY_SUPPLIER_METHODS = [CASH, MPESA_B2B, BANK, CHEQUE, CARD];
var SETTLE_CREDIT_SALE_METHODS = [CASH, MPESA_MANUAL, CARD_MANUAL, BANK, CHEQUE, PAYSTACK];
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
  const [amount, setAmount] = react.useState(String(defaultAmount ?? amountValue));
  const [method, setMethod] = react.useState(methods[0]?.value ?? "");
  const [reference, setReference] = react.useState("");
  const [error, setError] = react.useState("");
  const selectedMethod = react.useMemo(() => methods.find((m) => m.value === method), [methods, method]);
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
    setError("");
    try {
      await onSubmit({ amount: amt, method: methods.length ? method : void 0, reference: reference.trim() || void 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4", onClick: () => !isPending && onClose(), children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full max-w-md", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-white rounded-2xl shadow-xl overflow-hidden", children: [
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
        extraFields,
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

exports.BANK = BANK;
exports.CARD = CARD;
exports.CARD_MANUAL = CARD_MANUAL;
exports.CASH = CASH;
exports.CHEQUE = CHEQUE;
exports.CUSTOMER_ADVANCE = CUSTOMER_ADVANCE;
exports.MPESA_B2B = MPESA_B2B;
exports.MPESA_B2C = MPESA_B2C;
exports.MPESA_MANUAL = MPESA_MANUAL;
exports.MPESA_STK = MPESA_STK;
exports.PAYOUT_METHODS = PAYOUT_METHODS;
exports.PAYSTACK = PAYSTACK;
exports.PAY_SUPPLIER_METHODS = PAY_SUPPLIER_METHODS;
exports.RECEIVE_METHODS = RECEIVE_METHODS;
exports.SETTLE_CREDIT_SALE_METHODS = SETTLE_CREDIT_SALE_METHODS;
exports.STORE_CREDIT = STORE_CREDIT;
exports.SettlementModal = SettlementModal;
exports.TreasuryPaymentModal = TreasuryPaymentModal;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map