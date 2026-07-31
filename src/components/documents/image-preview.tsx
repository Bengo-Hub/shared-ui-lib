'use client';

import { useState, type CSSProperties } from 'react';

export interface ImagePreviewProps {
  /** Whether the preview modal is open. */
  open: boolean;
  /** Called when the modal requests to open/close. */
  onOpenChange: (open: boolean) => void;
  /** The image URL to preview. Null/undefined while unavailable. */
  src?: string | null;
  /** Alt text for the primary image. */
  alt?: string;
  /** Optional dialog title. */
  title?: string;
  /** Optional second image (e.g. the back of a book cover). When provided, a
   * front/back toggle is rendered above the image. */
  secondarySrc?: string | null;
  /** Label for the secondary image's tab (defaults to "Back"). */
  secondaryLabel?: string;
  /** Label for the primary image's tab, shown only when a secondary image exists (defaults to "Front"). */
  primaryLabel?: string;
}

// Inline styles keep this component fully self-contained: it renders correctly
// in any consumer regardless of whether their CSS/Tailwind pipeline scans
// node_modules, and it carries no shadcn/Tailwind-component dependency. This
// mirrors PdfPreview's modal chrome (overlay, border radius, header) so the two
// previews feel like one family.
const S: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  backdrop: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' },
  modal: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    width: '100%', maxWidth: '90vw', maxHeight: '90vh', margin: '0 16px',
    background: '#fff', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 16, padding: '12px 20px', borderBottom: '1px solid #e5e7eb',
  },
  title: { margin: 0, fontSize: 15, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  iconBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 9999, border: 0, background: 'transparent', color: '#6b7280', cursor: 'pointer' },
  tabs: { display: 'flex', gap: 4, padding: '10px 20px 0', borderBottom: '1px solid #e5e7eb' },
  tab: {
    display: 'inline-flex', alignItems: 'center', padding: '8px 14px', borderRadius: '8px 8px 0 0',
    border: 0, borderBottom: '2px solid transparent', background: 'transparent', color: '#6b7280',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  tabActive: { color: '#111827', borderBottom: '2px solid #111827' },
  body: {
    position: 'relative', flex: 1, minHeight: 0, minWidth: 0, background: '#f3f4f6',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  image: { maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain', borderRadius: 8 },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#6b7280' },
};

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

/**
 * ImagePreview is a self-contained modal that previews a full-size image (e.g.
 * a book cover) directly by URL — no blob-fetching is needed since images are
 * plain URLs, unlike {@link PdfPreview}'s authenticated-blob flow. When both
 * `src` and `secondarySrc` are given (e.g. front/back cover), a simple tab
 * toggle switches between them.
 *
 * Pair it with {@link useImagePreview} for a "call openPreview({ src }) then
 * spread previewProps" flow mirroring {@link useDocumentPreview}.
 */
export function ImagePreview({
  open,
  onOpenChange,
  src,
  alt = 'Preview',
  title = 'Image Preview',
  secondarySrc,
  secondaryLabel = 'Back',
  primaryLabel = 'Front',
}: ImagePreviewProps) {
  const [showSecondary, setShowSecondary] = useState(false);

  if (!open) return null;

  const hasSecondary = Boolean(secondarySrc);
  const activeSrc = hasSecondary && showSecondary ? secondarySrc : src;
  const activeAlt = hasSecondary ? (showSecondary ? secondaryLabel : primaryLabel) : alt;

  return (
    <div style={S.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <div style={S.backdrop} onClick={() => onOpenChange(false)} />
      <div style={S.modal}>
        {/* Header */}
        <div style={S.header}>
          <h2 style={S.title}>{title}</h2>
          <button onClick={() => onOpenChange(false)} style={S.iconBtn} aria-label="Close">
            <IconClose />
          </button>
        </div>

        {/* Front/back toggle */}
        {hasSecondary && (
          <div style={S.tabs}>
            <button
              onClick={() => setShowSecondary(false)}
              style={{ ...S.tab, ...(showSecondary ? {} : S.tabActive) }}
            >
              {primaryLabel}
            </button>
            <button
              onClick={() => setShowSecondary(true)}
              style={{ ...S.tab, ...(showSecondary ? S.tabActive : {}) }}
            >
              {secondaryLabel}
            </button>
          </div>
        )}

        {/* Body */}
        <div style={S.body}>
          {activeSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeSrc} alt={activeAlt} style={S.image} />
          ) : (
            <div style={S.center}>
              <p style={{ margin: 0, fontSize: 14 }}>No image available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
