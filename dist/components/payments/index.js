import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/components/payments/treasury-payment-modal.tsx
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
  const [attempt, setAttempt] = useState(0);
  const onConfirmedRef = useRef(onPaymentConfirmed);
  const onFailedRef = useRef(onPaymentFailed);
  onConfirmedRef.current = onPaymentConfirmed;
  onFailedRef.current = onPaymentFailed;
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
          onFailedRef.current?.("Payment session expired. Please try again.");
        }, timeoutMs);
      }
    }
    return () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, handleMessage, timeoutMs]);
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
                setAttempt((n) => n + 1);
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
  const [amount, setAmount] = useState(String(defaultAmount ?? amountValue));
  const [method, setMethod] = useState(methods[0]?.value ?? "");
  const onMethodChangeRef = useRef(onMethodChange);
  onMethodChangeRef.current = onMethodChange;
  useEffect(() => {
    if (method) onMethodChangeRef.current?.(method);
  }, [method]);
  const [reference, setReference] = useState("");
  const [effectiveAt, setEffectiveAt] = useState(nowDatetimeLocal());
  const [overpaymentAction, setOverpaymentAction] = useState("change");
  const [error, setError] = useState("");
  const selectedMethod = useMemo(() => methods.find((m) => m.value === method), [methods, method]);
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
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4", onClick: () => !isPending && onClose(), children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-xl", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-xl overflow-hidden", children: [
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
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
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
          ] })
        ] }),
        overpaid && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-amber-800", children: [
            "This is ",
            fmt(surplus),
            " more than ",
            amountLabel.toLowerCase(),
            ". What should happen to the difference?"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setOverpaymentAction("change"),
                className: `flex-1 py-1.5 rounded-md text-xs font-semibold border ${overpaymentAction === "change" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`,
                children: "Give change"
              }
            ),
            /* @__PURE__ */ jsx(
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
        (methods.length > 0 || selectedMethod?.requiresReference || mode === "apply_to_debt") && /* @__PURE__ */ jsxs("div", { className: `grid gap-3 ${methods.length > 0 && (selectedMethod?.requiresReference || mode === "apply_to_debt") ? "grid-cols-2" : "grid-cols-1"}`, children: [
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
          ] })
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
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 724.26 729.61", className, style, role: "img", "aria-label": title, children: [
    /* @__PURE__ */ jsx("title", { children: title }),
    /* @__PURE__ */ jsxs("g", { transform: "matrix(0.1,0,0,-0.1,-86.672636,774.61335)", fill: "#ff0000", children: [
      /* @__PURE__ */ jsx("path", { d: "m 4880,7740 c -14,-4 -47,-8 -73,-9 -104,-2 -440,-87 -562,-141 -11,-5 -42,-18 -70,-29 -73,-28 -266,-120 -296,-142 -14,-9 -37,-21 -52,-24 -15,-4 -27,-11 -27,-15 0,-4 -8,-10 -17,-14 -10,-3 -31,-15 -48,-26 -16,-11 -40,-24 -53,-30 -13,-5 -38,-21 -56,-35 -18,-14 -36,-25 -39,-25 -23,0 -345,-234 -436,-316 -74,-67 -211,-213 -211,-225 0,-3 -9,-17 -21,-30 -30,-34 -120,-176 -146,-229 -11,-25 -33,-69 -47,-99 -49,-100 -69,-209 -64,-336 6,-125 34,-190 119,-276 89,-89 184,-128 334,-136 103,-5 177,3 280,32 33,9 77,20 98,26 21,5 45,13 55,19 23,12 152,70 158,70 18,0 229,129 424,259 129,86 242,161 252,166 9,6 70,42 135,81 65,38 145,84 178,101 33,17 80,42 105,55 25,12 72,34 105,46 33,13 74,30 90,37 17,7 41,18 55,24 39,16 127,32 213,38 186,12 316,-70 383,-242 16,-41 19,-75 19,-195 0,-146 -13,-226 -52,-320 -8,-19 -19,-46 -25,-60 -50,-120 -153,-292 -271,-448 -112,-150 -353,-399 -512,-530 -55,-46 -116,-96 -135,-112 -42,-35 -91,-70 -145,-106 -22,-14 -58,-38 -80,-54 -62,-42 -227,-130 -320,-170 -27,-12 -64,-28 -82,-36 -17,-8 -40,-14 -51,-14 -10,0 -33,-5 -51,-11 -65,-23 -131,21 -131,88 0,82 39,134 285,378 266,264 295,303 295,403 0,103 -49,173 -159,229 -48,25 -66,28 -150,28 -98,0 -155,-14 -226,-57 -16,-10 -41,-23 -55,-30 -14,-7 -27,-15 -30,-18 -3,-3 -23,-18 -45,-35 -53,-40 -146,-135 -199,-204 -37,-48 -64,-93 -127,-211 -52,-98 -99,-280 -99,-386 0,-215 112,-387 285,-436 52,-15 264,-15 337,-1 72,15 260,73 272,84 6,5 16,9 24,9 26,0 323,151 425,217 23,15 49,32 59,38 9,5 56,34 105,64 48,30 90,58 93,61 3,4 37,29 75,55 39,27 84,58 100,69 17,12 64,48 105,81 260,207 490,428 624,600 22,27 42,52 45,55 8,6 76,104 123,178 21,31 53,86 71,122 19,36 45,85 58,110 13,25 41,90 63,145 21,55 42,109 46,120 28,71 71,254 90,385 21,148 5,391 -36,525 -17,55 -21,65 -58,145 -80,172 -208,328 -355,430 -20,14 -45,33 -56,44 -36,32 -219,114 -326,145 -57,17 -142,35 -189,42 -108,14 -367,21 -400,9 z" }),
      /* @__PURE__ */ jsx("path", { d: "m 7779,2795 c -3,-2 -49,-11 -104,-20 -55,-8 -145,-23 -200,-33 l -100,-17 v -920 c 0,-999 -2,-957 57,-1082 20,-43 48,-80 91,-119 106,-97 205,-127 416,-128 180,0 173,-7 169,159 l -3,120 -77,7 c -137,12 -203,67 -218,181 -4,34 -7,462 -6,950 1,845 -1,926 -25,902 z" }),
      /* @__PURE__ */ jsx("path", { d: "m 5010,2775 c -222,-33 -296,-47 -305,-58 -7,-8 -8,-327 -5,-937 5,-852 7,-929 23,-970 38,-97 58,-131 109,-182 105,-105 239,-148 459,-148 122,0 139,2 147,18 10,19 15,193 7,233 -6,25 -10,26 -85,32 -95,6 -151,38 -190,107 l -25,45 -3,518 c -2,386 0,522 9,533 9,11 43,14 150,14 165,0 151,-16 147,175 l -3,130 -140,5 c -77,3 -146,9 -152,13 -10,6 -13,67 -13,248 v 239 l -22,-1 c -13,-1 -61,-7 -108,-14 z" }),
      /* @__PURE__ */ jsx("path", { d: "m 1545,2324 c -75,-7 -255,-50 -310,-74 -11,-5 -31,-12 -45,-16 -44,-12 -190,-85 -190,-95 0,-5 9,-28 19,-52 66,-145 91,-197 96,-197 3,0 13,4 23,9 51,26 113,51 162,66 30,9 66,21 80,26 56,20 205,30 274,19 136,-22 186,-85 194,-246 4,-89 4,-91 -19,-97 -13,-4 -105,-7 -204,-7 -238,0 -311,-14 -465,-89 -132,-64 -230,-185 -277,-341 -24,-83 -21,-238 6,-320 90,-272 304,-431 602,-447 271,-15 550,66 729,210 l 65,53 3,529 c 3,613 2,634 -72,784 -33,68 -144,176 -213,206 -32,15 -67,30 -78,35 -75,33 -265,55 -380,44 z m 295,-964 c 6,-8 10,-127 10,-271 0,-284 4,-266 -70,-305 -28,-15 -59,-18 -156,-19 h -121 l -50,34 c -27,18 -59,48 -70,65 -74,108 -69,301 9,396 23,29 111,90 127,90 10,0 21,4 27,9 14,15 60,19 177,17 84,-1 110,-4 117,-16 z" }),
      /* @__PURE__ */ jsx("path", { d: "m 4040,2300 c -199,-47 -358,-132 -518,-278 l -42,-38 v -730 c 0,-401 0,-737 0,-747 0,-16 15,-17 218,-15 l 217,3 3,697 2,696 38,30 c 45,36 67,47 125,67 69,23 177,34 258,25 40,-4 78,-6 84,-3 7,2 25,36 41,76 15,40 39,92 51,116 33,63 30,79 -14,89 -21,5 -59,14 -86,20 -71,18 -288,13 -377,-8 z" }),
      /* @__PURE__ */ jsx("path", { d: "m 6215,2298 c -33,-5 -64,-14 -69,-19 -6,-5 -16,-9 -24,-9 -8,0 -44,-14 -79,-32 -77,-38 -195,-147 -245,-228 -44,-71 -95,-177 -103,-215 -4,-16 -10,-39 -15,-50 -4,-11 -16,-54 -26,-95 -27,-108 -27,-454 -1,-555 24,-93 78,-235 88,-235 5,0 9,-5 9,-11 0,-38 119,-189 203,-257 37,-30 120,-73 182,-94 67,-23 215,-48 281,-48 142,0 398,61 483,115 20,12 47,26 61,30 30,9 96,50 104,64 9,14 -103,241 -118,241 -7,0 -25,-9 -39,-20 -14,-11 -31,-20 -39,-20 -7,0 -22,-6 -33,-14 -11,-7 -63,-28 -115,-46 -89,-31 -104,-33 -235,-34 -124,0 -145,2 -185,21 -140,67 -220,236 -220,464 0,49 1,90 3,91 1,2 223,5 492,8 l 490,5 -3,100 c -6,196 -58,460 -103,520 -4,6 -18,31 -31,56 -54,107 -168,199 -303,244 -99,34 -280,44 -410,23 z m 215,-318 c 42,-11 130,-82 130,-104 0,-6 7,-24 15,-39 23,-45 41,-193 25,-212 -10,-13 -49,-15 -251,-15 h -239 l -6,25 c -13,51 22,188 62,241 44,59 83,89 141,106 32,9 63,15 70,13 6,-2 30,-9 53,-15 z" }),
      /* @__PURE__ */ jsx("path", { d: "m 2770,3002 c -76,-39 -99,-58 -132,-107 -32,-49 -33,-53 -33,-155 v -106 l 38,-52 c 45,-61 75,-83 141,-106 89,-29 166,-18 255,38 107,68 144,242 79,370 -23,45 -43,66 -103,104 -54,35 -191,43 -245,14 z" }),
      /* @__PURE__ */ jsx("path", { d: "m 3015,2280 c -16,-5 -61,-14 -100,-19 -38,-5 -108,-15 -155,-22 -47,-6 -88,-15 -93,-18 -9,-8 -10,-1707 -2,-1722 4,-5 93,-9 210,-9 204,0 205,0 210,23 3,12 4,416 3,897 -3,867 -3,875 -23,877 -11,1 -33,-2 -50,-7 z" })
    ] })
  ] });
}
function MtnMomoLogo({ className, style, title = "MTN MoMo" }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 200 200", className, style, role: "img", "aria-label": title, children: [
    /* @__PURE__ */ jsx("title", { children: title }),
    /* @__PURE__ */ jsx("rect", { width: "200", height: "200", fill: "#FFFFFF" }),
    /* @__PURE__ */ jsx("rect", { x: "9.75", y: "9.73", width: "180.52", height: "180.52", fill: "#FFCB05" }),
    /* @__PURE__ */ jsx("path", { fill: "#00678F", d: "M184.62,99.47c0,19.27-37.88,34.89-84.6,34.89c-46.73,0-84.61-15.62-84.61-34.89s37.88-34.88,84.61-34.88C146.74,64.59,184.62,80.2,184.62,99.47" }),
    /* @__PURE__ */ jsx("polygon", { fill: "#FFFFFF", points: "45.81,116.69 54.56,81.8 68.54,81.8 68.54,102.12 77.73,81.8 92.16,81.8 83.42,116.69 74.23,116.69 79.47,94.17 68.54,116.69 61.12,116.69 61.12,94.17 55.42,116.69" }),
    /* @__PURE__ */ jsx("polygon", { fill: "#ED1D24", points: "94.99,117.13 96.3,112.27 106.36,112.27 105.04,117.13" }),
    /* @__PURE__ */ jsx("polygon", { fill: "#FFFFFF", points: "117.5,116.69 126.24,81.8 136.3,81.8 140.68,100.36 145.48,81.8 154.66,81.8 145.92,116.69 136.3,116.69 131.49,97.7 126.68,116.69" }),
    /* @__PURE__ */ jsx("polygon", { fill: "#FFCB05", points: "94.99,81.8 92.8,90.64 101.99,90.64 97.04,109.81 107.09,109.81 112.05,90.64 121.23,90.64 123.41,81.8" })
  ] });
}
function PayHeroLogo({ className, style, title = "PayHero", variant = "mark", basePath = "/brand" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    /* @__PURE__ */ jsx(
      "img",
      {
        src: `${basePath}/payhero-${variant}.png`,
        alt: title,
        className,
        style: { objectFit: "contain", ...style },
        draggable: false
      }
    )
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
  const [verifiedName, setVerifiedName] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [bankCode, setBankCode] = useState("");
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
  return /* @__PURE__ */ jsxs("div", { className: className ?? "space-y-4", children: [
    !hideTypeSelector && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: labelClass, children: "Account Type" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 mt-1", children: ["bank", "mobile_money", "cash"].map((t) => /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Currency" }),
        /* @__PURE__ */ jsx("select", { value: value.currency, onChange: (e) => set({ currency: e.target.value }), className: inputClass, children: currencies.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: currencyLabel ? currencyLabel(c) : c }, c)) })
      ] }),
      value.account_type === "bank" && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: labelClass, children: [
          "Bank ",
          banksLoading && /* @__PURE__ */ jsx("span", { className: "ml-1 text-[10px]", children: "(loading\u2026)" })
        ] }),
        banks && banks.length > 0 ? /* @__PURE__ */ jsxs(
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
              /* @__PURE__ */ jsx("option", { value: "", children: value.bank_name ? `${value.bank_name} (change\u2026)` : "-- Select bank --" }),
              banks.map((b) => /* @__PURE__ */ jsx("option", { value: b.code, children: b.name }, b.code))
            ]
          }
        ) : /* @__PURE__ */ jsx(
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
    value.account_type === "bank" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Account Number" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
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
          onVerifyBank && /* @__PURE__ */ jsx(
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
        verifiedName && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[11px] text-green-600", children: [
          "Verified: ",
          verifiedName
        ] }),
        verifyError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-amber-600", children: verifyError })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Account Name" }),
        /* @__PURE__ */ jsx(
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
    value.account_type === "bank" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Bank Branch (optional)" }),
        /* @__PURE__ */ jsx("input", { value: value.bank_branch, onChange: (e) => set({ bank_branch: e.target.value }), className: inputClass, placeholder: "e.g. Westlands" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "SWIFT / Branch Code (optional)" }),
        /* @__PURE__ */ jsx("input", { value: value.branch_code, onChange: (e) => set({ branch_code: e.target.value }), className: inputClass, placeholder: "e.g. EQBLKENA" })
      ] })
    ] }),
    value.account_type === "mobile_money" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Account Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: value.account_name,
            onChange: (e) => set({ account_name: e.target.value }),
            className: inputClass,
            placeholder: "e.g. M-Pesa Till \u2014 Westlands Branch"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Till / Paybill Number" }),
        /* @__PURE__ */ jsx(
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
    value.account_type === "cash" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: labelClass, children: "Account Name" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: value.account_name,
          onChange: (e) => set({ account_name: e.target.value }),
          className: inputClass,
          placeholder: "e.g. Petty Cash \u2014 Head Office"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: labelClass, children: "Opening Balance (optional)" }),
      /* @__PURE__ */ jsx(
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
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Posted as a real journal entry against Opening Balance Equity." })
    ] })
  ] });
}
function isAccountFormValid(value) {
  if (!value.account_name.trim()) return false;
  if (value.account_type === "bank") return !!value.bank_name.trim() && !!value.account_number.trim();
  if (value.account_type === "mobile_money") return !!value.account_number.trim();
  return true;
}

// src/components/payments/default-account.ts
function resolveDefaultAccount(accounts, method, outletId) {
  const active = (accounts ?? []).filter((a) => a.is_active !== false);
  if (method) {
    const matches = active.filter((a) => (a.default_payment_methods ?? []).includes(method));
    const outletMatch = outletId ? matches.find((a) => a.outlet_id === outletId) : void 0;
    if (outletMatch) return outletMatch;
    const tenantWideMatch = matches.find((a) => !a.outlet_id);
    if (tenantWideMatch) return tenantWideMatch;
    if (matches.length) return matches[0];
  }
  return active.find((a) => a.account_type === "cash");
}

export { AIRTEL_MONEY, AccountForm, AirtelMoneyLogo, BANK, BANK_TRANSFER, CARD, CARD_MANUAL, CASH, CHEQUE, CURRENCY_META, CUSTOMER_ADVANCE, CurrencyChangeConfirmModal, EMPTY_ACCOUNT_FORM, MPESA_B2B, MPESA_B2C, MPESA_MANUAL, MPESA_STK, MTN_MOMO, MtnMomoLogo, PAYMENT_METHOD_LABELS, PAYOUT_METHODS, PAYSTACK, PAY_SUPPLIER_METHODS, PayHeroLogo, RECEIVE_METHODS, SETTLE_CREDIT_SALE_METHODS, STORE_CREDIT, SUPPORTED_CURRENCIES, SettlementModal, TreasuryPaymentModal, datetimeLocalToISO, formatCompactCurrency, formatCurrency, getPaymentMethodLabel, isAccountFormValid, nowDatetimeLocal, resolveDefaultAccount };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map