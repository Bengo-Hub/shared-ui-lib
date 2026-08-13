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

export { AIRTEL_MONEY, BANK, BANK_TRANSFER, CARD, CARD_MANUAL, CASH, CHEQUE, CURRENCY_META, CUSTOMER_ADVANCE, CurrencyChangeConfirmModal, MPESA_B2B, MPESA_B2C, MPESA_MANUAL, MPESA_STK, MTN_MOMO, PAYMENT_METHOD_LABELS, PAYOUT_METHODS, PAYSTACK, PAY_SUPPLIER_METHODS, RECEIVE_METHODS, SETTLE_CREDIT_SALE_METHODS, STORE_CREDIT, SUPPORTED_CURRENCIES, SettlementModal, TreasuryPaymentModal, formatCompactCurrency, formatCurrency, getPaymentMethodLabel };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map