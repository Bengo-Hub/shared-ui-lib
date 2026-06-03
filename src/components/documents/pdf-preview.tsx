'use client';

import { useEffect, useState, type CSSProperties } from 'react';

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

// Inline styles keep this component fully self-contained: it renders correctly
// in any consumer regardless of whether their CSS/Tailwind pipeline scans
// node_modules, and it carries no shadcn/Tailwind-component dependency.
const S: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  backdrop: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' },
  modal: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    width: '100%', height: '90vh', margin: '0 16px',
    background: '#fff', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 16, padding: '12px 20px', borderBottom: '1px solid #e5e7eb',
  },
  title: { margin: 0, fontSize: 15, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  subtitle: { margin: 0, fontSize: 12, color: '#6b7280', fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  body: { position: 'relative', flex: 1, minHeight: 0, background: '#f3f4f6' },
  iframe: { width: '100%', height: '100%', border: 0 },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#6b7280' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid #e5e7eb' },
  iconBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 9999, border: 0, background: 'transparent', color: '#6b7280', cursor: 'pointer' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: 0, background: '#111827', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
};

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
 * the truload-frontend PdfPreviewDialog but uses inline styles only, so any
 * frontend can reuse it without shadcn or Tailwind content configuration.
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

  return (
    <div style={S.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <style>{'@keyframes bx-pdfp-rotate{to{transform:rotate(360deg)}}.bx-pdfp-spin{animation:bx-pdfp-rotate 0.8s linear infinite}'}</style>
      <div style={S.backdrop} onClick={() => onOpenChange(false)} />
      <div style={{ ...S.modal, maxWidth: orientation === 'landscape' ? '95vw' : '90vw' }}>
        {/* Header */}
        <div style={S.header}>
          <div style={{ minWidth: 0 }}>
            <h2 style={S.title}>{title}</h2>
            <p style={S.subtitle}>{fileName}</p>
          </div>
          <button onClick={() => onOpenChange(false)} style={S.iconBtn} aria-label="Close">
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {isLoading ? (
            <div style={S.center}>
              <Spinner />
              <p style={{ margin: 0, fontSize: 14 }}>Generating document…</p>
            </div>
          ) : previewUrl ? (
            <iframe src={previewUrl} title={title} style={S.iframe} />
          ) : blob ? (
            <div style={{ ...S.center, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 14 }}>Preview is not available for this file.</p>
              <button onClick={handleDownload} style={S.btnPrimary}>
                <IconDownload /> Download {fileName}
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={S.footer}>
          <button onClick={() => onOpenChange(false)} style={S.btn}>Close</button>
          {previewUrl && (
            <button onClick={handleOpenTab} style={S.btn}><IconExternal /> Open in tab</button>
          )}
          {previewUrl && (
            <button onClick={handlePrint} style={S.btn}><IconPrinter /> Print</button>
          )}
          <button onClick={handleDownload} disabled={!blob || isLoading}
            style={{ ...S.btnPrimary, opacity: !blob || isLoading ? 0.5 : 1 }}>
            <IconDownload /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
