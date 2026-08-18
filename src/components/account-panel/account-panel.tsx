'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';

/**
 * Right-side slide-over account panel — the piece missing from every *-ui's
 * profile menu today (a small anchored dropdown, not a real account surface).
 * Mirrors Zoho Accounts/Zoho Mail's own account popup: avatar, name, email,
 * Sign Out, an optional resource-links list, and an optional `children` slot
 * for host-specific content (subscription/plan info, storage usage, an
 * AppSwitcherGrid, etc. — this component only owns the shell/chrome).
 *
 * Portals to `document.body`: a `fixed inset-0` overlay rendered inline gets
 * clipped/mispositioned by ANY ancestor establishing a CSS containing block
 * for fixed descendants (a `transform`, `filter`, or `backdrop-filter` —
 * e.g. a header using `backdrop-blur-*`, a very common host pattern in this
 * fleet). Portalling to body is the only placement immune to a host's layout.
 */
export interface AccountPanelUser {
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface AccountPanelLink {
  label: string;
  href: string;
}

export interface AccountPanelProps {
  open: boolean;
  onClose: () => void;
  user: AccountPanelUser;
  onSignOut: () => void;
  /** e.g. User Guide / Help / Docs — rendered as a simple link list below the main content. */
  links?: AccountPanelLink[];
  /** Host-specific content (plan/subscription info, storage bar, app switcher…). */
  children?: React.ReactNode;
}

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)).toUpperCase();
}

export function AccountPanel({ open, onClose, user, onSignOut, links, children }: AccountPanelProps) {
  // Stay mounted through the close transition (unmounting immediately on
  // `open=false` would cut off the slide-out/fade-out animation), then drop
  // out of the DOM once it finishes via onTransitionEnd below.
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/30 transition-opacity duration-200 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={onClose}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && !open) setMounted(false);
      }}
    >
      <div
        className={`flex h-full w-full max-w-sm flex-col overflow-y-auto bg-card shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end p-3">
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 px-6 pb-6 text-center">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- host-app-supplied avatar, arbitrary origin
            <img src={user.avatarUrl} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {initials(user.name, user.email)}
            </div>
          )}
          <p className="text-base font-semibold text-foreground">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {children && <div className="border-t border-border px-4 py-4">{children}</div>}

        {links && links.length > 0 && (
          <div className="border-t border-border px-4 py-4">
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resources</p>
            <div className="flex flex-col gap-0.5">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-border p-4">
          <button
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/70"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
