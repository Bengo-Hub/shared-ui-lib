import { useState, useEffect, useCallback } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/components/documents/pdf-preview.tsx
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
      } catch {
        opts?.onError?.("Failed to load document");
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

export { PdfPreview, useDocumentPreview };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map