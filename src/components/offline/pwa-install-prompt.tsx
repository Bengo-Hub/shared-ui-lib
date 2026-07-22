'use client';

/**
 * PwaInstallPrompt — the single "Install this app" banner used across the whole fleet, replacing
 * four near-identical copy-pasted implementations (pos-ui, library-ui, inventory-ui, auth-ui) that
 * had drifted in delay timing, dismiss-window length, and animation, and in two apps were mounted
 * BOTH in the root layout and again inside the tenant-scoped shell — firing twice on the same page
 * (the root-layout copy rendering with no tenant branding since it sits outside the branding
 * provider, the shell copy rendering correctly branded). Each app now mounts this ONCE, inside its
 * tenant-branding provider, passing its own app name / tenant logo / tagline / dismiss key.
 *
 * Uses a mount-transition (translate + opacity via a `mounted` flag) rather than a named keyframe
 * class, so the slide-in animation is guaranteed identical across apps regardless of whether their
 * own globals.css happens to define one.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaInstallPromptProps {
  /** The installable app's display name, e.g. "Acme POS" or "Codevertex Library". */
  appName: string;
  /** Tenant/brand logo shown in the prompt's icon slot; falls back to a generic share/download icon. */
  logoUrl?: string | null;
  /** What installing gets them, e.g. "Full offline support — orders, payments & drawer." */
  tagline?: string;
  /** localStorage key remembering a dismissal — MUST be unique per app to avoid cross-app collisions. */
  dismissKey: string;
  /** Ms to wait after install-eligibility before showing the prompt (default 3000, uniform fleet-wide). */
  delayMs?: number;
  /** Ms before a dismissed prompt is offered again (default 24h, uniform fleet-wide). */
  repromptMs?: number;
  /** Called after the user accepts the native install prompt (e.g. request notification/camera permissions). */
  onInstalled?: () => void | Promise<void>;
  className?: string;
}

const DEFAULT_DELAY_MS = 3000;
const DEFAULT_REPROMPT_MS = 24 * 60 * 60 * 1000;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;
}

export function PwaInstallPrompt({
  appName,
  logoUrl,
  tagline = 'Install for a faster, full-screen experience with offline access.',
  dismissKey,
  delayMs = DEFAULT_DELAY_MS,
  repromptMs = DEFAULT_REPROMPT_MS,
  onInstalled,
  className = '',
}: PwaInstallPromptProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ios, setIos] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  const isDismissedRecently = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return Date.now() < parseInt(localStorage.getItem(dismissKey) ?? '0', 10);
  }, [dismissKey]);

  useEffect(() => {
    if (isStandalone() || isDismissedRecently()) return;

    if (isIOS()) {
      setIos(true);
      const t = setTimeout(() => setVisible(true), delayMs);
      return () => clearTimeout(t);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
      if (!isDismissedRecently()) setTimeout(() => setVisible(true), delayMs);
    };
    const onInstalledEvent = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalledEvent);
    const timer = setInterval(() => {
      if (!isDismissedRecently() && promptRef.current) setVisible(true);
    }, repromptMs);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalledEvent);
      clearInterval(timer);
    };
  }, [delayMs, repromptMs, isDismissedRecently]);

  useEffect(() => {
    if (!visible) return;
    setMounted(false);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [visible]);

  const dismiss = useCallback(() => {
    localStorage.setItem(dismissKey, String(Date.now() + repromptMs));
    setVisible(false);
  }, [dismissKey, repromptMs]);

  const install = useCallback(async () => {
    if (!promptRef.current) return;
    promptRef.current.prompt();
    const { outcome } = await promptRef.current.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      await onInstalled?.();
    }
  }, [onInstalled]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 sm:inset-x-auto sm:right-4 sm:justify-end transition-all duration-300 ease-out ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-black/25 ring-1 ring-black/5 backdrop-blur-xl">
        <div className="h-1 w-full bg-gradient-to-r from-primary/70 via-primary to-primary/70" />

        <div className="flex items-start gap-3.5 px-4 pt-4 pb-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/25 blur-md" aria-hidden />
            <div className="h-12 w-12 rounded-2xl overflow-hidden ring-1 ring-border bg-white shadow-sm flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt={appName} className="h-full w-full object-contain p-1" />
              ) : ios ? (
                <Share className="h-5 w-5 text-primary" />
              ) : (
                <Download className="h-5 w-5 text-primary" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-semibold text-[0.95rem] leading-tight tracking-tight">Install {appName}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">
              {ios ? 'Add to your Home Screen for offline access.' : tagline}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-accent shrink-0 transition-colors -mt-0.5 -mr-1 text-muted-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {ios ? (
          <ol className="px-4 pb-4 space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              Tap <Share className="h-3.5 w-3.5 inline mx-0.5 text-primary shrink-0" /> <strong className="text-foreground">Share</strong> in Safari
            </li>
            <li className="flex items-center gap-2.5">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              Tap <strong className="text-foreground">"Add to Home Screen"</strong>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              Tap <strong className="text-foreground">"Add"</strong>
            </li>
          </ol>
        ) : (
          <div className="flex items-center gap-2 px-4 pb-4">
            <button
              onClick={dismiss}
              className="flex-1 h-9 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Later
            </button>
            <button
              onClick={() => void install()}
              className="flex-1 h-9 rounded-lg text-sm font-medium text-primary-foreground flex items-center justify-center gap-1.5 bg-gradient-to-b from-primary to-primary/90 shadow-lg shadow-primary/25 hover:opacity-95 transition-opacity"
            >
              <Download className="h-4 w-4" />
              Install
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
