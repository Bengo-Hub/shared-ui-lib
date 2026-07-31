export { D as DocumentPreviewProps, I as ImagePreview, a as ImagePreviewProps, b as ImagePreviewPropsShape, O as OpenImagePreviewOptions, c as OpenPreviewOptions, P as PdfPreview, d as PdfPreviewProps, u as useDocumentPreview, e as useImagePreview } from '../../use-image-preview-BunCXG40.cjs';
import 'react/jsx-runtime';

/**
 * extractErrorMessage — dependency-free extraction of a human-readable message
 * from whatever an API call threw. It understands the shapes the platform's
 * services actually return, so callers can show the REAL backend error (code +
 * message) instead of a generic fallback.
 *
 * Handled shapes (in priority order):
 *  1. Axios-style error with `response.data`:
 *     - `data` is a Blob (responseType:'blob' requests return JSON even on error)
 *       → read it as text, JSON.parse, then pull message/error/detail.
 *     - `data` is a string → JSON.parse if it looks like JSON, else use as-is.
 *     - `data` is an object → message | error | detail | title.
 *  2. A native `Response` (fetch) → read text/JSON body.
 *  3. A plain `Error` → `.message`.
 *  4. A bare string.
 * Falls back to `fallback` when nothing useful can be derived.
 *
 * The function is async because Blob/Response bodies must be read asynchronously;
 * it never throws (any failure to parse degrades to the fallback).
 */
declare function extractErrorMessage(err: unknown, fallback?: string): Promise<string>;

export { extractErrorMessage };
