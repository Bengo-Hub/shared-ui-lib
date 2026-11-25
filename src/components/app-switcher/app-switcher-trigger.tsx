'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Grid3x3 } from 'lucide-react';
import { AppSwitcherGrid } from './app-switcher-grid';
import type { VisibleService } from './use-visible-services';

/**
 * Self-contained quick-access "apps" launcher — a header icon button that opens
 * AppSwitcherGrid in a small anchored popover. Ports auth-ui's own Grid3x3
 * icon-trigger pattern (first built for DashboardTopNav) into a single reusable
 * component so every other *-ui gets the same quick-launch affordance instead
 * of only reaching the switcher through the full AccountPanel slide-over.
 *
 * Portals to `document.body` and positions itself from the trigger button's
 * own bounding rect (the same technique this fleet's headers already use for
 * their own anchored dropdowns) — required because a host header's
 * `backdrop-filter`/`transform` would otherwise clip a plain `fixed` popover
 * (see AccountPanel's own doc comment for the same gotcha).
 */
const PANEL_WIDTH = 420;
const EDGE = 8;

export interface AppSwitcherTriggerProps {
  services: VisibleService[];
  className?: string;
  /** Fires after a live service is clicked, or the backdrop is clicked. */
  onNavigate?: () => void;
}

export function AppSwitcherTrigger({ services, className, onNavigate }: AppSwitcherTriggerProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number; width: number } | null>(null);

  // Escape closes; a rotated or resized screen closes too, since the stored position is then stale.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => setOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  if (services.length === 0) return null;

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      // clientWidth leaves out the scrollbar. Measured here (not viewport classes) so the panel is
      // as wide as useful and never leaves the screen: the trigger is often not the last header
      // button, and a panel right-aligned to it ran off the left edge of a phone.
      const vw = document.documentElement.clientWidth;
      const width = Math.min(PANEL_WIDTH, vw - 2 * EDGE);
      const right = Math.min(Math.max(EDGE, vw - r.right), vw - EDGE - width);
      setPos({ top: r.bottom + EDGE, right, width });
    }
    setOpen((v) => !v);
  };

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label="Codevertex apps"
        aria-expanded={open}
        aria-haspopup="true"
        className={
          className ??
          'relative inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors'
        }
      >
        <Grid3x3 className="h-5 w-5" />
      </button>

      {open && pos && typeof document !== 'undefined' &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={close} aria-hidden />
            <div
              role="dialog"
              aria-label="Codevertex apps"
              className="fixed z-[91] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover p-4 shadow-2xl"
              style={{ top: pos.top, right: pos.right, width: pos.width, maxHeight: `calc(100dvh - ${pos.top + EDGE}px)` }}
            >
              <AppSwitcherGrid services={services} onNavigate={close} />
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
