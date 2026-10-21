// Image delivery through Cloudflare Image Transformations.
//
// Media lives on the shared object storage behind https://media.codevertexafrica.com (and a few
// shipped images still come from the API hosts' /media/ tree). Every one of those hosts is on the
// codevertexafrica.com zone, so Cloudflare can resize and re-encode them at the edge:
//
//   https://<host>/cdn-cgi/image/width=256,quality=75,format=auto,fit=scale-down,onerror=redirect/<path>
//
// Rules that keep this inside the free allowance (5,000 unique transformations a month) and safe:
//   - Widths snap to MEDIA_IMAGE_WIDTHS and quality is fixed per call site, so one image has at
//     most a handful of variants however many screen sizes ask for it.
//   - onerror=redirect: if a transformation fails (for example the monthly allowance is used up)
//     Cloudflare redirects to the original file, so the image still shows.
//   - Only public files are transformed. A presigned link (private bucket, signed query) is never
//     rewritten, because the variant would be cached at the edge without the signature check.
//   - SVG and GIF are left alone (vector, or animation that a resize would flatten).
//   - NEXT_PUBLIC_IMAGE_TRANSFORMS=off turns every helper into a pass-through (originals served),
//     a kill switch that needs no code change.

/** The widths a transformed image can have. Requests snap up to the next one. */
export const MEDIA_IMAGE_WIDTHS = [64, 128, 256, 512, 1024, 1600] as const;

const ZONE = /(^|\.)codevertexafrica\.com$/i;
const SKIP_EXT = /\.(svg|gif)$/i;
const SIGNED_QUERY = /[?&](x-amz-signature|x-amz-credential|signature|token)=/i;
const DEFAULT_QUALITY = 75;

function transformsEnabled(): boolean {
  try {
    return (process.env.NEXT_PUBLIC_IMAGE_TRANSFORMS ?? '').toLowerCase() !== 'off';
  } catch {
    return true; // no process in this runtime
  }
}

/** Snaps a requested width up to the nearest allowed width (the largest one at most). */
export function snapImageWidth(width: number): number {
  for (const w of MEDIA_IMAGE_WIDTHS) {
    if (width <= w) return w;
  }
  return MEDIA_IMAGE_WIDTHS[MEDIA_IMAGE_WIDTHS.length - 1];
}

function parse(src: string | null | undefined): URL | null {
  if (!src || !/^https:\/\//i.test(src)) return null;
  try {
    return new URL(src);
  } catch {
    return null;
  }
}

/**
 * Whether src can be served through Cloudflare Image Transformations: a public https file on the
 * codevertexafrica.com zone that is not vector, animated, signed or already transformed.
 */
export function isTransformableImage(src: string | null | undefined): boolean {
  if (!transformsEnabled()) return false;
  const u = parse(src);
  if (!u || !ZONE.test(u.hostname)) return false;
  if (u.pathname.startsWith('/cdn-cgi/')) return false;
  if (SKIP_EXT.test(u.pathname)) return false;
  if (SIGNED_QUERY.test(u.search)) return false;
  // Only the shared media host and the API hosts' shipped /media/ tree hold images.
  return u.hostname.toLowerCase().startsWith('media.') || u.pathname.startsWith('/media/');
}

export interface TransformOptions {
  /** 1 to 100; defaults to 75. Keep it fixed per screen so variants stay few. */
  quality?: number;
  /** scale-down (default) never enlarges; cover crops to fill the width and aspect. */
  fit?: 'scale-down' | 'contain' | 'cover';
  /** Only with fit=cover: height divided by width (1 for a square), applied to the snapped width. */
  aspect?: number;
}

/**
 * The transformed link for src at the given display width (snapped), or src unchanged when it
 * cannot be transformed.
 */
export function transformImageUrl(src: string, width: number, opts: TransformOptions = {}): string {
  if (!isTransformableImage(src)) return src;
  const u = new URL(src);
  const w = snapImageWidth(width);
  const q = Math.min(100, Math.max(1, Math.round(opts.quality ?? DEFAULT_QUALITY)));
  const parts = [`width=${w}`, `quality=${q}`, 'format=auto', `fit=${opts.fit ?? 'scale-down'}`];
  if (opts.fit === 'cover' && opts.aspect && opts.aspect > 0) {
    parts.push(`height=${Math.round(w * opts.aspect)}`);
  }
  parts.push('onerror=redirect');
  return `${u.origin}/cdn-cgi/image/${parts.join(',')}${u.pathname}${u.search}`;
}

/**
 * A srcset for src covering the allowed widths up to maxWidth (the largest size the image is ever
 * shown at, already doubled for high-density screens if needed). Undefined when src cannot be
 * transformed, so callers can spread it straight onto an <img>.
 */
export function imageSrcSet(src: string, maxWidth = 1024, opts: TransformOptions = {}): string | undefined {
  if (!isTransformableImage(src)) return undefined;
  const cap = snapImageWidth(maxWidth);
  return MEDIA_IMAGE_WIDTHS.filter((w) => w <= cap)
    .map((w) => `${transformImageUrl(src, w, opts)} ${w}w`)
    .join(', ');
}

/** The props next/image passes to a loader. */
export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/** A next/image loader that serves zone images through Cloudflare. */
export function mediaImageLoader({ src, width, quality }: ImageLoaderProps): string {
  return transformImageUrl(src, width, { quality });
}

/**
 * The loader to give next/image for src: the Cloudflare loader for transformable images, or
 * undefined to keep Next's own optimizer for everything else (local assets, other hosts).
 * Images served this way no longer go through the app pod or need an images.remotePatterns entry.
 */
export function mediaImageLoaderFor(
  src: string | null | undefined,
): ((p: ImageLoaderProps) => string) | undefined {
  return isTransformableImage(src) ? mediaImageLoader : undefined;
}
