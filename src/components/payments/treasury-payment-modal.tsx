'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PaymentResult {
  intentId: string;
  amount: number;
  reference: string;
  channel: string;
}

export interface TreasuryPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Treasury payment intent ID */
  paymentIntentId: string;
  /** Tenant slug for treasury-ui URL construction */
  tenantSlug: string;
  amount: number;
  currency?: string;
  description?: string;
  /** Restrict gateway options (e.g., exclude cash for pickup). Comma-separated gateway types. */
  allowedMethods?: string;
  /** Treasury-UI base URL. Falls back to NEXT_PUBLIC_TREASURY_UI_URL env var, then production default. */
  treasuryUiUrl?: string;
  /** Treasury API initiate URL for the payment intent. Required for Paystack/gateway payments. */
  initiateUrl?: string;
  /** Customer email — pre-fills the email on the payment page so the user doesn't have to enter it again. */
  customerEmail?: string;
  /** Reference ID (e.g. order UUID) passed to treasury-ui so it can auto-create an intent as fallback when initiate_url is missing. */
  referenceId?: string;
  /** Reference type (e.g. "order"). Paired with referenceId for intent auto-creation. */
  referenceType?: string;
  /** Payment modal timeout in ms. Default: 600000 (10 minutes). Set 0 to disable. */
  timeoutMs?: number;
  /** Called when payment succeeds — receives payment details from postMessage */
  onPaymentConfirmed?: (result: PaymentResult) => void;
  /** Called when payment fails */
  onPaymentFailed?: (error: string) => void;
}

type PaymentState = 'loading' | 'checkout' | 'confirmed' | 'failed' | 'expired';

/** Default treasury-ui URL — prefer env var, fall back to production. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_TREASURY_UI_URL: string =
  ((globalThis as any).process?.env?.NEXT_PUBLIC_TREASURY_UI_URL as string | undefined) ||
  'https://books.codevertexafrica.com';

/** Default timeout: 10 minutes */
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

export function TreasuryPaymentModal({
  open,
  onOpenChange,
  paymentIntentId,
  tenantSlug,
  amount,
  currency = 'KES',
  description,
  allowedMethods,
  treasuryUiUrl = DEFAULT_TREASURY_UI_URL,
  initiateUrl,
  customerEmail,
  referenceId,
  referenceType,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onPaymentConfirmed,
  onPaymentFailed,
}: TreasuryPaymentModalProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>('loading');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Build iframe URL
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      intent_id: paymentIntentId,
      tenant: tenantSlug,
      amount: String(amount),
      currency,
      embed: 'true',
    });
    if (description) params.set('description', description);
    if (allowedMethods) params.set('gateways', allowedMethods);
    if (initiateUrl) params.set('initiate_url', initiateUrl);
    if (customerEmail) params.set('email', customerEmail);
    // Fallback: let treasury-ui auto-create an intent if initiate_url + intent_id are missing
    if (referenceId) params.set('reference_id', referenceId);
    if (referenceType) params.set('reference_type', referenceType);
    // Paystack redirect: after payment, redirect back to treasury-ui success page within
    // the iframe so it fires treasury:payment_confirmed to this parent modal.
    // Include intent_id and amount so the success page can pass them back via postMessage.
    params.set('redirect_url', `${treasuryUiUrl}/pay/success?embed=true&intent_id=${encodeURIComponent(paymentIntentId)}&amount=${amount}`);
    return `${treasuryUiUrl}/pay?${params.toString()}`;
  }, [paymentIntentId, tenantSlug, amount, currency, description, allowedMethods, treasuryUiUrl, initiateUrl, customerEmail, referenceId, referenceType]);

  // Prevent duplicate processing of payment events
  const processedRef = useRef(false);
  // Bumped by "Try Again" so the iframe remounts and loads the pay page afresh (its onLoad then
  // clears the spinner). Without it the retry showed "Loading payment options..." forever.
  const [attempt, setAttempt] = useState(0);

  // Callbacks live in refs: a host that passes inline handlers re-renders with new identities,
  // and when they were effect dependencies every host re-render reset the modal to 'loading'
  // after the iframe had already loaded, leaving the spinner up for good.
  const onConfirmedRef = useRef(onPaymentConfirmed);
  const onFailedRef = useRef(onPaymentFailed);
  onConfirmedRef.current = onPaymentConfirmed;
  onFailedRef.current = onPaymentFailed;

  // Listen for postMessage from treasury-ui iframe
  const handleMessage = useCallback((event: MessageEvent) => {
    // Strict origin check — exact match, not substring
    try {
      const expectedOrigin = new URL(treasuryUiUrl).origin;
      if (event.origin !== expectedOrigin) return;
    } catch {
      return;
    }

    const data = event.data;
    if (!data || typeof data.type !== 'string') return;

    switch (data.type) {
      case 'treasury:payment_initiated':
        setPaymentState('checkout');
        break;
      case 'treasury:payment_confirmed': {
        // Guard against duplicate processing
        if (processedRef.current) return;
        processedRef.current = true;

        const result: PaymentResult = {
          intentId: data.intentId,
          amount: data.amount,
          reference: data.reference,
          channel: data.channel,
        };
        setPaymentResult(result);
        setPaymentState('confirmed');
        onConfirmedRef.current?.(result);
        break;
      }
      case 'treasury:payment_failed':
        setErrorMessage(data.error || 'Payment failed');
        setPaymentState('failed');
        onFailedRef.current?.(data.error || 'Payment failed');
        break;
      case 'treasury:resize':
        if (iframeRef.current && data.height) {
          iframeRef.current.style.height = `${data.height}px`;
        }
        break;
    }
  }, [treasuryUiUrl]);

  useEffect(() => {
    if (open) {
      window.addEventListener('message', handleMessage);
      setPaymentState('loading');
      setPaymentResult(null);
      setErrorMessage('');
      processedRef.current = false;

      // Start timeout timer (auto-expire payment modal)
      if (timeoutMs > 0) {
        timeoutRef.current = setTimeout(() => {
          if (processedRef.current) return; // Already confirmed
          setPaymentState('expired');
          onFailedRef.current?.('Payment session expired. Please try again.');
        }, timeoutMs);
      }
    }
    return () => {
      window.removeEventListener('message', handleMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, handleMessage, timeoutMs]);

  // Move focus into the dialog on open and hand it back on close; Escape closes, and Tab stays inside.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleIframeLoad = useCallback(() => {
    if (paymentState === 'loading') {
      setPaymentState('checkout');
    }
  }, [paymentState]);

  // One short sentence per state for screen readers. It sits in its own live region, apart from the
  // iframe, so a reader announces the change of state and not the whole pay page.
  const statusText =
    paymentState === 'loading'
      ? 'Loading payment options.'
      : paymentState === 'checkout'
        ? 'Payment options are ready.'
        : paymentState === 'confirmed'
          ? 'Payment successful.'
          : paymentState === 'failed'
            ? `Payment failed. ${errorMessage}`
            : 'Payment session expired.';

  if (!open) return null;
  // Portal to <body> so the overlay is positioned relative to the VIEWPORT, not to whatever
  // transformed/relative ancestor it happens to render inside (a `position:fixed` element is
  // trapped by any ancestor with a transform/filter — that's what pushed this modal off-centre
  // and let it overflow below the screen inside the POS terminal panel).
  if (typeof document === 'undefined') return null;

  // Render as a modal overlay (no shadcn dependency). Colours come from the host's shadcn tokens
  // (card, foreground, muted, primary, border, destructive), so the modal follows the host's brand
  // and dark mode instead of a fixed white and black. The pay page inside the iframe keeps its own
  // colours. Buttons are at least 44 px tall (WCAG 2.2, 2.5.8) and show a visible focus ring.
  const actionButton =
    'mt-6 min-h-11 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop: a mouse or touch target only; keyboard users close with Escape or the Close button. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal: a constrained card that always fits and scrolls internally, centred on all sizes. */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative w-full sm:max-w-lg bg-card text-card-foreground rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90dvh] outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="min-w-0 mr-3">
            <h2 id={titleId} className="text-base sm:text-lg font-semibold text-foreground truncate">Complete Payment</h2>
            <p id={descriptionId} className="text-xs sm:text-sm text-muted-foreground truncate">
              {currency} {amount.toLocaleString()}
              {description && `, ${description}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 inline-flex items-center justify-center min-h-11 min-w-11 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close payment"
          >
            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Announced state, kept apart from the iframe so a reader does not read the pay page aloud. */}
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {statusText}
        </p>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto relative">
          {paymentState === 'expired' ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div aria-hidden="true" className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-700"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Payment Session Expired</h3>
              <p className="text-sm text-muted-foreground">Your payment session has timed out. Please close this dialog and try again.</p>
              <button type="button" onClick={() => onOpenChange(false)} className={actionButton}>
                Close
              </button>
            </div>
          ) : paymentState === 'confirmed' && paymentResult ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div aria-hidden="true" className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Payment Successful</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Amount: <span className="font-medium text-foreground">{currency} {paymentResult.amount.toLocaleString()}</span></p>
                {paymentResult.reference && <p>Reference: <span className="font-mono text-foreground">{paymentResult.reference}</span></p>}
                {paymentResult.channel && <p>Via: <span className="text-foreground">{paymentResult.channel}</span></p>}
              </div>
              <button type="button" onClick={() => onOpenChange(false)} className={actionButton}>
                Done
              </button>
            </div>
          ) : paymentState === 'failed' ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div aria-hidden="true" className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-700"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Payment Failed</h3>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <button
                type="button"
                onClick={() => { setPaymentState('loading'); setErrorMessage(''); setAttempt((n) => n + 1); }}
                className={actionButton}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="relative h-full">
              {paymentState === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div aria-hidden="true" className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin motion-reduce:animate-none" />
                    <p className="text-sm text-muted-foreground">Loading payment options...</p>
                  </div>
                </div>
              )}
              <iframe
                key={attempt}
                ref={iframeRef}
                src={iframeSrc}
                className="w-full border-0 block"
                style={{ height: '520px', minHeight: '420px' }}
                title={`Complete payment of ${currency} ${amount.toLocaleString()}`}
                onLoad={handleIframeLoad}
                allow="payment"
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
