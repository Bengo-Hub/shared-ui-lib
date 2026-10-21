import { useState, useEffect } from 'react';
import { jsx } from 'react/jsx-runtime';

// src/components/media/image-delivery.ts
var MEDIA_IMAGE_WIDTHS = [64, 128, 256, 512, 1024, 1600];
var ZONE = /(^|\.)codevertexafrica\.com$/i;
var SKIP_EXT = /\.(svg|gif)$/i;
var SIGNED_QUERY = /[?&](x-amz-signature|x-amz-credential|signature|token)=/i;
var DEFAULT_QUALITY = 75;
function transformsEnabled() {
  try {
    return (process.env.NEXT_PUBLIC_IMAGE_TRANSFORMS ?? "").toLowerCase() !== "off";
  } catch {
    return true;
  }
}
function snapImageWidth(width) {
  for (const w of MEDIA_IMAGE_WIDTHS) {
    if (width <= w) return w;
  }
  return MEDIA_IMAGE_WIDTHS[MEDIA_IMAGE_WIDTHS.length - 1];
}
function parse(src) {
  if (!src || !/^https:\/\//i.test(src)) return null;
  try {
    return new URL(src);
  } catch {
    return null;
  }
}
function isTransformableImage(src) {
  if (!transformsEnabled()) return false;
  const u = parse(src);
  if (!u || !ZONE.test(u.hostname)) return false;
  if (u.pathname.startsWith("/cdn-cgi/")) return false;
  if (SKIP_EXT.test(u.pathname)) return false;
  if (SIGNED_QUERY.test(u.search)) return false;
  return u.hostname.toLowerCase().startsWith("media.") || u.pathname.startsWith("/media/");
}
function transformImageUrl(src, width, opts = {}) {
  if (!isTransformableImage(src)) return src;
  const u = new URL(src);
  const w = snapImageWidth(width);
  const q = Math.min(100, Math.max(1, Math.round(opts.quality ?? DEFAULT_QUALITY)));
  const parts = [`width=${w}`, `quality=${q}`, "format=auto", `fit=${opts.fit ?? "scale-down"}`];
  if (opts.fit === "cover" && opts.aspect && opts.aspect > 0) {
    parts.push(`height=${Math.round(w * opts.aspect)}`);
  }
  parts.push("onerror=redirect");
  return `${u.origin}/cdn-cgi/image/${parts.join(",")}${u.pathname}${u.search}`;
}
function imageSrcSet(src, maxWidth = 1024, opts = {}) {
  if (!isTransformableImage(src)) return void 0;
  const cap = snapImageWidth(maxWidth);
  return MEDIA_IMAGE_WIDTHS.filter((w) => w <= cap).map((w) => `${transformImageUrl(src, w, opts)} ${w}w`).join(", ");
}
function mediaImageLoader({ src, width, quality }) {
  return transformImageUrl(src, width, { quality });
}
function mediaImageLoaderFor(src) {
  return isTransformableImage(src) ? mediaImageLoader : void 0;
}
function MediaImage({
  src,
  displayWidth = 256,
  fallbackSrc,
  quality,
  fit,
  aspect,
  sizes,
  loading = "lazy",
  decoding = "async",
  alt = "",
  onError,
  ...rest
}) {
  const [stage, setStage] = useState(0);
  useEffect(() => setStage(0), [src]);
  const original = src || "";
  const opts = { quality, fit, aspect };
  let current;
  let srcSet;
  if (original && stage === 0) {
    current = transformImageUrl(original, displayWidth, opts);
    srcSet = imageSrcSet(original, displayWidth * 2, opts);
  } else if (original && stage === 1) {
    current = original;
  } else {
    current = fallbackSrc;
  }
  if (!current) return null;
  return /* @__PURE__ */ jsx(
    "img",
    {
      ...rest,
      alt,
      src: current,
      srcSet,
      sizes: srcSet ? sizes ?? `${displayWidth}px` : sizes,
      loading,
      decoding,
      onError: (e) => {
        onError?.(e);
        setStage((s) => {
          if (s === 0) return current === original ? 2 : 1;
          return 2;
        });
      }
    }
  );
}

export { MEDIA_IMAGE_WIDTHS, MediaImage, imageSrcSet, isTransformableImage, mediaImageLoader, mediaImageLoaderFor, snapImageWidth, transformImageUrl };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map