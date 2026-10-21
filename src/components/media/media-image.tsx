'use client';

import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { imageSrcSet, transformImageUrl, type TransformOptions } from './image-delivery';

export interface MediaImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /** The stored image link. Empty shows fallbackSrc (or nothing). */
  src?: string | null;
  /**
   * The widest the image is ever displayed, in CSS pixels. The srcset goes up to twice this for
   * high-density screens, and sizes defaults to it.
   */
  displayWidth?: number;
  /** Shown when src is empty or fails to load. */
  fallbackSrc?: string;
  quality?: TransformOptions['quality'];
  fit?: TransformOptions['fit'];
  aspect?: TransformOptions['aspect'];
}

/**
 * An <img> for stored media: resized at the edge (Cloudflare Image Transformations, see
 * image-delivery.ts) with a srcset, lazy loading and async decoding by default. If the resized
 * file fails it retries the original, then fallbackSrc. Links that cannot be transformed (other
 * hosts, SVG, signed private links) render as a plain image.
 */
export function MediaImage({
  src,
  displayWidth = 256,
  fallbackSrc,
  quality,
  fit,
  aspect,
  sizes,
  loading = 'lazy',
  decoding = 'async',
  alt = '',
  onError,
  ...rest
}: MediaImageProps) {
  // 0: resized, 1: original, 2: fallback
  const [stage, setStage] = useState(0);
  useEffect(() => setStage(0), [src]);

  const original = src || '';
  const opts: TransformOptions = { quality, fit, aspect };
  let current: string | undefined;
  let srcSet: string | undefined;
  if (original && stage === 0) {
    current = transformImageUrl(original, displayWidth, opts);
    srcSet = imageSrcSet(original, displayWidth * 2, opts);
  } else if (original && stage === 1) {
    current = original;
  } else {
    current = fallbackSrc;
  }
  if (!current) return null;

  return (
    <img
      {...rest}
      alt={alt}
      src={current}
      srcSet={srcSet}
      sizes={srcSet ? (sizes ?? `${displayWidth}px`) : sizes}
      loading={loading}
      decoding={decoding}
      onError={(e) => {
        onError?.(e);
        setStage((s) => {
          if (s === 0) return current === original ? 2 : 1;
          return 2;
        });
      }}
    />
  );
}
