import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';

// src/components/payments/treasury-payment-modal.tsx
var DEFAULT_TREASURY_UI_URL = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_TREASURY_UI_URL || "https://books.codevertexitsolutions.com";
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
    return `${treasuryUiUrl}/pay?${params.toString()}`;
  }, [paymentIntentId, tenantSlug, amount, currency, description, allowedMethods, treasuryUiUrl, initiateUrl, customerEmail]);
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
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/50",
        onClick: () => onOpenChange(false)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Complete Payment" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
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
            className: "p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 relative", children: paymentState === "expired" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
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
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        paymentState === "loading" && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white z-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Loading payment options..." })
        ] }) }),
        /* @__PURE__ */ jsx(
          "iframe",
          {
            ref: iframeRef,
            src: iframeSrc,
            className: "w-full border-0",
            style: { height: "500px" },
            title: `Complete payment of ${currency} ${amount.toLocaleString()}`,
            onLoad: handleIframeLoad,
            allow: "payment"
          }
        )
      ] }) })
    ] })
  ] });
}

export { TreasuryPaymentModal };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map