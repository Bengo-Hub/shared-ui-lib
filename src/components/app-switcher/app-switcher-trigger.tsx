'use client';

import { useRef, useState } from 'react';
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
export interface AppSwitcherTriggerProps {
  services: VisibleService[];
  className?: string;
  /** Fires after a live service is clicked, or the backdrop is clicked. */
  onNavigate?: () => void;
}

export function AppSwitcherTrigger({ services, className, onNavigate }: AppSwitcherTriggerProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  if (services.length === 0) return null;

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: Math.max(8, window.innerWidth - r.right) });
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
              className="fixed z-[91] w-80 max-w-[calc(100vw-1rem)] max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-popover p-4 shadow-2xl"
              style={{ top: pos.top, right: pos.right }}
            >
              <AppSwitcherGrid services={services} onNavigate={close} />
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
