'use client';

import { useCallback, useState } from 'react';
import type { ImagePreviewProps } from './image-preview';

interface PreviewState {
  open: boolean;
  src: string | null;
  secondarySrc: string | null;
  title: string;
  alt: string;
  secondaryLabel: string;
  primaryLabel: string;
}

const INITIAL: PreviewState = {
  open: false,
  src: null,
  secondarySrc: null,
  title: 'Image Preview',
  alt: 'Preview',
  secondaryLabel: 'Back',
  primaryLabel: 'Front',
};

export interface OpenImagePreviewOptions {
  src: string;
  secondarySrc?: string | null;
  title?: string;
  alt?: string;
  secondaryLabel?: string;
  primaryLabel?: string;
}

/** Props ready to spread onto {@link ImagePreview}. */
export type ImagePreviewPropsShape = Pick<
  ImagePreviewProps,
  'open' | 'onOpenChange' | 'src' | 'alt' | 'title' | 'secondarySrc' | 'secondaryLabel' | 'primaryLabel'
>;

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
export function useImagePreview() {
  const [state, setState] = useState<PreviewState>(INITIAL);

  const openPreview = useCallback((o: OpenImagePreviewOptions) => {
    setState({
      open: true,
      src: o.src,
      secondarySrc: o.secondarySrc ?? null,
      title: o.title ?? 'Image Preview',
      alt: o.alt ?? 'Preview',
      secondaryLabel: o.secondaryLabel ?? 'Back',
      primaryLabel: o.primaryLabel ?? 'Front',
    });
  }, []);

  const onOpenChange = useCallback((open: boolean) => setState((s) => ({ ...s, open })), []);

  const previewProps: ImagePreviewPropsShape = {
    open: state.open,
    onOpenChange,
    src: state.src,
    alt: state.alt,
    title: state.title,
    secondarySrc: state.secondarySrc,
    secondaryLabel: state.secondaryLabel,
    primaryLabel: state.primaryLabel,
  };

  return { openPreview, previewProps };
}
