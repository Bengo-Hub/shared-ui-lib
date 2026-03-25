'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/components/tracking/tracking-iframe-modal.tsx
function TrackingIframeModal({
  open,
  onOpenChange,
  trackingCode,
  logisticsUiUrl = process.env.NEXT_PUBLIC_LOGISTICS_UI_URL || "https://logistics.codevertexitsolutions.com",
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

exports.TrackingIframeModal = TrackingIframeModal;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map