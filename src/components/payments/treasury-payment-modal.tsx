'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  /** Payment modal timeout in ms. Default: 600000 (10 minutes). Set 0 to disable. */
  timeoutMs?: number;
  /** Called when payment succeeds — receives payment details from postMessage */
  onPaymentConfirmed?: (result: PaymentResult) => void;
  /** Called when payment fails */
  onPaymentFailed?: (error: string) => void;
}

type PaymentState = 'loading' | 'checkout' | 'confirmed' | 'failed' | 'expired';

/** Default treasury-ui URL — prefer env var, fall back to production. */
const DEFAULT_TREASURY_UI_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_TREASURY_UI_URL) ||
  'https://books.codevertexitsolutions.com';

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
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onPaymentConfirmed,
  onPaymentFailed,
}: TreasuryPaymentModalProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>('loading');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    return `${treasuryUiUrl}/pay?${params.toString()}`;
  }, [paymentIntentId, tenantSlug, amount, currency, description, allowedMethods, treasuryUiUrl, initiateUrl, customerEmail]);

  // Prevent duplicate processing of payment events
  const processedRef = useRef(false);

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
        onPaymentConfirmed?.(result);
        break;
      }
      case 'treasury:payment_failed':
        setErrorMessage(data.error || 'Payment failed');
        setPaymentState('failed');
        onPaymentFailed?.(data.error || 'Payment failed');
        break;
      case 'treasury:resize':
        if (iframeRef.current && data.height) {
          iframeRef.current.style.height = `${data.height}px`;
        }
        break;
    }
  }, [treasuryUiUrl, onPaymentConfirmed, onPaymentFailed]);

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
          onPaymentFailed?.('Payment session expired. Please try again.');
        }, timeoutMs);
      }
    }
    return () => {
      window.removeEventListener('message', handleMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, handleMessage, timeoutMs, onPaymentFailed]);

  const handleIframeLoad = useCallback(() => {
    if (paymentState === 'loading') {
      setPaymentState('checkout');
    }
  }, [paymentState]);

  if (!open) return null;

  // Render as a modal overlay (pure CSS, no shadcn dependency)
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal — full-screen on mobile, constrained card on larger screens */}
      <div className="relative w-full sm:max-w-lg sm:mx-4 bg-white sm:rounded-2xl shadow-xl overflow-hidden flex flex-col h-dvh sm:h-auto sm:max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="min-w-0 mr-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Complete Payment</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {currency} {amount.toLocaleString()}
              {description && ` — ${description}`}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="shrink-0 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto relative">
          {paymentState === 'expired' ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Payment Session Expired</h3>
              <p className="text-sm text-gray-600">Your payment session has timed out. Please close this dialog and try again.</p>
              <button
                onClick={() => onOpenChange(false)}
                className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          ) : paymentState === 'confirmed' && paymentResult ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Payment Successful</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Amount: <span className="font-medium text-gray-900">{currency} {paymentResult.amount.toLocaleString()}</span></p>
                {paymentResult.reference && <p>Reference: <span className="font-mono text-gray-900">{paymentResult.reference}</span></p>}
                {paymentResult.channel && <p>Via: <span className="text-gray-900">{paymentResult.channel}</span></p>}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          ) : paymentState === 'failed' ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
              <p className="text-sm text-gray-600">{errorMessage}</p>
              <button
                onClick={() => { setPaymentState('loading'); setErrorMessage(''); }}
                className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="relative h-full">
              {paymentState === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading payment options...</p>
                  </div>
                </div>
              )}
              <iframe
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
    </div>
  );
}
