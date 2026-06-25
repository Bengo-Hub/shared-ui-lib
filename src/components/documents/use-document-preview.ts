'use client';

import { useCallback, useState } from 'react';
import type { PdfPreviewProps } from './pdf-preview';
import { extractErrorMessage } from './extract-error';

interface PreviewState {
  open: boolean;
  blob: Blob | null;
  isLoading: boolean;
  title: string;
  fileName: string;
  orientation: 'portrait' | 'landscape';
}

const INITIAL: PreviewState = {
  open: false,
  blob: null,
  isLoading: false,
  title: 'Document Preview',
  fileName: 'document.pdf',
  orientation: 'portrait',
};

export interface OpenPreviewOptions {
  fileName: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
}

/** Props ready to spread onto {@link PdfPreview}. */
export type DocumentPreviewProps = Pick<
  PdfPreviewProps,
  'open' | 'onOpenChange' | 'blob' | 'fileName' | 'title' | 'isLoading' | 'orientation'
>;

/**
 * useDocumentPreview provides uniform "preview-first" handling for generated
 * PDFs: it opens the modal in a loading state, runs the supplied fetch function,
 * then shows the resulting blob in {@link PdfPreview} (which offers Download /
 * Print / Open-in-tab) rather than triggering a direct download.
 *
 * Pass an optional `onError` to surface failures (e.g. a toast); the hook stays
 * dependency-free so the shared lib does not bundle a toast library.
 *
 * @example
 *   const { openPreview, previewProps } = useDocumentPreview({ onError: (m) => toast.error(m) });
 *   <button onClick={() => openPreview(() => downloadInvoicePdf(id), { fileName: `${no}.pdf`, title: 'Invoice' })} />
 *   <PdfPreview {...previewProps} />
 */
export function useDocumentPreview(opts?: { onError?: (message: string) => void }) {
  const [state, setState] = useState<PreviewState>(INITIAL);

  const openPreview = useCallback(
    async (fetchFn: () => Promise<Blob>, o: OpenPreviewOptions) => {
      setState({
        open: true,
        blob: null,
        isLoading: true,
        title: o.title ?? 'Document Preview',
        fileName: o.fileName,
        orientation: o.orientation ?? 'portrait',
      });
      try {
        const blob = await fetchFn();
        setState((s) => ({ ...s, blob, isLoading: false }));
      } catch (err) {
        // Surface the REAL backend error (e.g. "No items matched the selection")
        // instead of a generic "Failed to load document". Blob error bodies (the
        // server returns JSON even on a responseType:'blob' request) are decoded.
        const message = await extractErrorMessage(err, 'Failed to load document');
        opts?.onError?.(message);
        setState((s) => ({ ...s, open: false, isLoading: false }));
      }
    },
    [opts]
  );

  const onOpenChange = useCallback((open: boolean) => setState((s) => ({ ...s, open })), []);

  const previewProps: DocumentPreviewProps = {
    open: state.open,
    onOpenChange,
    blob: state.blob,
    fileName: state.fileName,
    title: state.title,
    isLoading: state.isLoading,
    orientation: state.orientation,
  };

  return { openPreview, previewProps };
}
