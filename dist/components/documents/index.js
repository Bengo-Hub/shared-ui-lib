import { useState, useEffect, useCallback } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/components/documents/pdf-preview.tsx
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
  const maxWidth = orientation === "landscape" ? "95vw" : "90vw";
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", role: "dialog", "aria-modal": "true", "aria-label": title, children: [
    /* @__PURE__ */ jsx("style", { children: "@keyframes bx-pdfp-rotate{to{transform:rotate(360deg)}}.bx-pdfp-spin{animation:bx-pdfp-rotate 0.8s linear infinite}" }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50", onClick: () => onOpenChange(false) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative mx-4 flex h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl",
        style: { maxWidth },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 border-b px-5 py-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("h2", { className: "truncate text-base font-semibold text-gray-900", children: title }),
              /* @__PURE__ */ jsx("p", { className: "truncate font-mono text-xs text-gray-500", children: fileName })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => onOpenChange(false),
                className: "rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsx(IconClose, {})
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "relative min-h-0 flex-1 bg-gray-100", children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-3 text-gray-500", children: [
            /* @__PURE__ */ jsx(Spinner, {}),
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Generating document\u2026" })
          ] }) : previewUrl ? /* @__PURE__ */ jsx("iframe", { src: previewUrl, title, className: "h-full w-full border-0" }) : blob ? /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-3 text-center text-gray-500", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Preview is not available for this file." }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleDownload,
                className: "inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800",
                children: [
                  /* @__PURE__ */ jsx(IconDownload, {}),
                  " Download ",
                  fileName
                ]
              }
            )
          ] }) : null }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 border-t px-5 py-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => onOpenChange(false),
                className: "inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
                children: "Close"
              }
            ),
            previewUrl && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleOpenTab,
                className: "inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
                children: [
                  /* @__PURE__ */ jsx(IconExternal, {}),
                  " Open in tab"
                ]
              }
            ),
            previewUrl && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handlePrint,
                className: "inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
                children: [
                  /* @__PURE__ */ jsx(IconPrinter, {}),
                  " Print"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleDownload,
                disabled: !blob || isLoading,
                className: "inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50",
                children: [
                  /* @__PURE__ */ jsx(IconDownload, {}),
                  " Download"
                ]
              }
            )
          ] })
        ]
      }
    )
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