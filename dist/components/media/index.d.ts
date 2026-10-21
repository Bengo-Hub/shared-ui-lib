import * as react_jsx_runtime from 'react/jsx-runtime';
import { ImgHTMLAttributes } from 'react';

/** The widths a transformed image can have. Requests snap up to the next one. */
declare const MEDIA_IMAGE_WIDTHS: readonly [64, 128, 256, 512, 1024, 1600];
/** Snaps a requested width up to the nearest allowed width (the largest one at most). */
declare function snapImageWidth(width: number): number;
/**
 * Whether src can be served through Cloudflare Image Transformations: a public https file on the
 * codevertexafrica.com zone that is not vector, animated, signed or already transformed.
 */
declare function isTransformableImage(src: string | null | undefined): boolean;
interface TransformOptions {
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
declare function transformImageUrl(src: string, width: number, opts?: TransformOptions): string;
/**
 * A srcset for src covering the allowed widths up to maxWidth (the largest size the image is ever
 * shown at, already doubled for high-density screens if needed). Undefined when src cannot be
 * transformed, so callers can spread it straight onto an <img>.
 */
declare function imageSrcSet(src: string, maxWidth?: number, opts?: TransformOptions): string | undefined;
/** The props next/image passes to a loader. */
interface ImageLoaderProps {
    src: string;
    width: number;
    quality?: number;
}
/** A next/image loader that serves zone images through Cloudflare. */
declare function mediaImageLoader({ src, width, quality }: ImageLoaderProps): string;
/**
 * The loader to give next/image for src: the Cloudflare loader for transformable images, or
 * undefined to keep Next's own optimizer for everything else (local assets, other hosts).
 * Images served this way no longer go through the app pod or need an images.remotePatterns entry.
 */
declare function mediaImageLoaderFor(src: string | null | undefined): ((p: ImageLoaderProps) => string) | undefined;

interface MediaImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
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
declare function MediaImage({ src, displayWidth, fallbackSrc, quality, fit, aspect, sizes, loading, decoding, alt, onError, ...rest }: MediaImageProps): react_jsx_runtime.JSX.Element | null;

export { type ImageLoaderProps, MEDIA_IMAGE_WIDTHS, MediaImage, type MediaImageProps, type TransformOptions, imageSrcSet, isTransformableImage, mediaImageLoader, mediaImageLoaderFor, snapImageWidth, transformImageUrl };
