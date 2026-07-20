'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * AnchoredPopover — minimal portal-less popover for table chrome (funnel
 * filters, column manager). Rendered `position: fixed` from the trigger's
 * rect so it escapes the table's `overflow-x-auto` container (an inline
 * absolute panel would be clipped). Closes on outside click, Escape, scroll
 * of any ancestor, or resize.
 */
export function AnchoredPopover({
  open,
  onClose,
  anchorRef,
  children,
  align = 'start',
  width = 240,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  align?: 'start' | 'end';
  width?: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    let left = align === 'end' ? r.right - width : r.left;
    left = Math.max(8, Math.min(left, vw - width - 8));
    // Flip above when there's no room below.
    const spaceBelow = window.innerHeight - r.bottom;
    const top = spaceBelow < 260 && r.top > 300 ? Math.max(8, r.top - 8 - 300) : r.bottom + 4;
    setPos({ top, left });
  }, [open, anchorRef, align, width]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function onScroll(e: Event) {
      // Ignore scrolls that originate inside the panel itself (option lists).
      if (panelRef.current?.contains(e.target as Node)) return;
      onClose();
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;
  return (
    <div
      ref={panelRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width, zIndex: 60 }}
      className="rounded-lg border border-border bg-background shadow-lg p-2 text-sm"
    >
      {children}
    </div>
  );
}
