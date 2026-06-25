import * as react_jsx_runtime from 'react/jsx-runtime';

interface PdfPreviewProps {
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
/**
 * PdfPreview is a self-contained, framework-agnostic modal that previews a PDF
 * blob in an iframe with Download / Print / Open-in-new-tab actions. It mirrors
 * the truload-frontend PdfPreviewDialog but uses inline styles only, so any
 * frontend can reuse it without shadcn or Tailwind content configuration.
 *
 * Pair it with {@link useDocumentPreview} for "fetch → preview-first" flows.
 */
declare function PdfPreview({ open, onOpenChange, blob, fileName, title, isLoading, orientation, }: PdfPreviewProps): react_jsx_runtime.JSX.Element | null;

interface OpenPreviewOptions {
    fileName: string;
    title?: string;
    orientation?: 'portrait' | 'landscape';
}
/** Props ready to spread onto {@link PdfPreview}. */
type DocumentPreviewProps = Pick<PdfPreviewProps, 'open' | 'onOpenChange' | 'blob' | 'fileName' | 'title' | 'isLoading' | 'orientation'>;
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
declare function useDocumentPreview(opts?: {
    onError?: (message: string) => void;
}): {
    openPreview: (fetchFn: () => Promise<Blob>, o: OpenPreviewOptions) => Promise<void>;
    previewProps: DocumentPreviewProps;
};

export { type DocumentPreviewProps as D, type OpenPreviewOptions as O, PdfPreview as P, type PdfPreviewProps as a, useDocumentPreview as u };
