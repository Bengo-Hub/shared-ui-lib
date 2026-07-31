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

interface ImagePreviewProps {
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
declare function ImagePreview({ open, onOpenChange, src, alt, title, secondarySrc, secondaryLabel, primaryLabel, }: ImagePreviewProps): react_jsx_runtime.JSX.Element | null;

interface OpenImagePreviewOptions {
    src: string;
    secondarySrc?: string | null;
    title?: string;
    alt?: string;
    secondaryLabel?: string;
    primaryLabel?: string;
}
/** Props ready to spread onto {@link ImagePreview}. */
type ImagePreviewPropsShape = Pick<ImagePreviewProps, 'open' | 'onOpenChange' | 'src' | 'alt' | 'title' | 'secondarySrc' | 'secondaryLabel' | 'primaryLabel'>;
/**
 * useImagePreview mirrors {@link useDocumentPreview}'s "openPreview → spread
 * previewProps" shape for the simpler image case: since images are plain URLs
 * (no authenticated-blob fetch), `openPreview` just stores the URL(s) and opens
 * the modal synchronously — there is no loading/error state to manage.
 *
 * @example
 *   const { openPreview, previewProps } = useImagePreview();
 *   <button onClick={() => openPreview({ src: coverUrl, secondarySrc: backCoverUrl, title: 'Book Cover' })} />
 *   <ImagePreview {...previewProps} />
 */
declare function useImagePreview(): {
    openPreview: (o: OpenImagePreviewOptions) => void;
    previewProps: ImagePreviewPropsShape;
};

export { type DocumentPreviewProps as D, ImagePreview as I, type OpenImagePreviewOptions as O, PdfPreview as P, type ImagePreviewProps as a, type ImagePreviewPropsShape as b, type OpenPreviewOptions as c, type PdfPreviewProps as d, useImagePreview as e, useDocumentPreview as u };
