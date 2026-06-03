'use client';

import { useEffect, useState } from 'react';

export interface PdfPreviewProps {
  /** Whether the preview modal is open. */
  open: boolean;
  /** Called when the modal requests to open/close. */
  onOpenChange: (open: boolean) => void;
  /** The PDF (or other) blob to preview. Null while loading. */
  blob: Blob | null;
  /** Suggested file name for download (e.g. "INV-260408-000123.pdf"). */
  fileName: string;
  /** Optional dialog title. */
  title?: string;
  /** Show the loading spinner instead of the document. */
  isLoading?: boolean;
  /** Page orientation — controls the dialog width. */
  orientation?: 'portrait' | 'landscape';
}

// Minimal inline icons keep this component dependency-free (lucide-react is an
// optional peer dep that may be absent in some consumers).
const Spinner = () => (
  <svg className="bx-pdfp-spin" width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
const IconPrinter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
  </svg>
);
const IconExternal = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);
const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

/**
 * PdfPreview is a self-contained, framework-agnostic modal that previews a PDF
 * blob in an iframe with Download / Print / Open-in-new-tab actions. It mirrors
 * the truload-frontend PdfPreviewDialog but carries no shadcn/Tailwind-component
 * dependency, so any frontend can reuse it.
 *
 * Pair it with {@link useDocumentPreview} for "fetch → preview-first" flows.
 */
export function PdfPreview({
  open,
  onOpenChange,
  blob,
  fileName,
  title = 'Document Preview',
  isLoading,
  orientation = 'portrait',
}: PdfPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob && blob.type === 'application/pdf') {
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => {
        window.URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }
    setPreviewUrl(null);
    return undefined;
  }, [blob]);

  if (!open) return null;

  const handleDownload = () => {
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!previewUrl) return;
    const w = window.open(previewUrl, '_blank');
    w?.addEventListener('load', () => w.print());
  };

  const handleOpenTab = () => {
    if (previewUrl) window.open(previewUrl, '_blank');
  };

  const maxWidth = orientation === 'landscape' ? '95vw' : '90vw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <style>{'@keyframes bx-pdfp-rotate{to{transform:rotate(360deg)}}.bx-pdfp-spin{animation:bx-pdfp-rotate 0.8s linear infinite}'}</style>
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div
        className="relative mx-4 flex h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900">{title}</h2>
            <p className="truncate font-mono text-xs text-gray-500">{fileName}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div className="relative min-h-0 flex-1 bg-gray-100">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-500">
              <Spinner />
              <p className="text-sm">Generating document…</p>
            </div>
          ) : previewUrl ? (
            <iframe src={previewUrl} title={title} className="h-full w-full border-0" />
          ) : blob ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-500">
              <p className="text-sm">Preview is not available for this file.</p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <IconDownload /> Download {fileName}
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          {previewUrl && (
            <button
              onClick={handleOpenTab}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <IconExternal /> Open in tab
            </button>
          )}
          {previewUrl && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <IconPrinter /> Print
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={!blob || isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <IconDownload /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
