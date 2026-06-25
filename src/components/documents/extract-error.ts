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
export async function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): Promise<string> {
  try {
    if (err == null) return fallback;
    if (typeof err === 'string') return err.trim() || fallback;

    const anyErr = err as Record<string, unknown>;

    // 1. Axios error: { response: { data } }
    const response = anyErr.response as { data?: unknown; statusText?: string } | undefined;
    if (response && 'data' in response) {
      const fromData = await messageFromBody(response.data);
      if (fromData) return fromData;
      if (response.statusText) return response.statusText;
    }

    // 2. fetch Response
    if (typeof Response !== 'undefined' && err instanceof Response) {
      const text = await err.clone().text();
      const fromText = messageFromString(text);
      if (fromText) return fromText;
      if (err.statusText) return err.statusText;
    }

    // 3. plain Error / object with a message
    if (typeof anyErr.message === 'string' && anyErr.message.trim()) {
      return anyErr.message.trim();
    }
  } catch {
    // fall through to fallback
  }
  return fallback;
}

/** Resolve a message from an axios `response.data` payload (Blob | string | object). */
async function messageFromBody(data: unknown): Promise<string | null> {
  if (data == null) return null;
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    const text = await data.text();
    return messageFromString(text);
  }
  if (typeof data === 'string') return messageFromString(data);
  if (typeof data === 'object') return messageFromObject(data as Record<string, unknown>);
  return null;
}

/** Parse a string body — JSON.parse when it looks structured, else trim the raw text. */
function messageFromString(text: string): string | null {
  const trimmed = text?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const fromObj = messageFromObject(parsed);
      if (fromObj) return fromObj;
    } catch {
      // not JSON after all — use the raw text
    }
  }
  // Avoid dumping an HTML error page at the user.
  if (trimmed.startsWith('<')) return null;
  return trimmed;
}

/** Pull the conventional message field from a decoded error object. */
function messageFromObject(obj: unknown): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const o = obj as Record<string, unknown>;
  const candidate =
    pickString(o.message) ??
    pickString(o.error) ??
    pickString(o.detail) ??
    pickString(o.title) ??
    pickString((o.error as Record<string, unknown> | undefined)?.message);
  return candidate ?? null;
}

function pickString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}
