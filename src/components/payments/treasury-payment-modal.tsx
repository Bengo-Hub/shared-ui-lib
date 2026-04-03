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
  /** Treasury-UI base URL */
  treasuryUiUrl?: string;
  /** Called when payment succeeds — receives payment details from postMessage */
  onPaymentConfirmed?: (result: PaymentResult) => void;
  /** Called when payment fails */
  onPaymentFailed?: (error: string) => void;
}

type PaymentState = 'loading' | 'checkout' | 'confirmed' | 'failed';

export function TreasuryPaymentModal({
  open,
  onOpenChange,
  paymentIntentId,
  tenantSlug,
  amount,
  currency = 'KES',
  description,
  allowedMethods,
  treasuryUiUrl = 'https://books.codevertexitsolutions.com',
  onPaymentConfirmed,
  onPaymentFailed,
}: TreasuryPaymentModalProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>('loading');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    return `${treasuryUiUrl}/pay?${params.toString()}`;
  }, [paymentIntentId, tenantSlug, amount, currency, description, allowedMethods, treasuryUiUrl]);

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
    }
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [open, handleMessage]);

  const handleIframeLoad = useCallback(() => {
    if (paymentState === 'loading') {
      setPaymentState('checkout');
    }
  }, [paymentState]);

  if (!open) return null;

  // Render as a modal overlay (pure CSS, no shadcn dependency)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Complete Payment</h2>
            <p className="text-sm text-gray-500">
              {currency} {amount.toLocaleString()}
              {description && ` — ${description}`}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative">
          {paymentState === 'confirmed' && paymentResult ? (
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
            <>
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
                className="w-full border-0"
                style={{ height: '500px' }}
                title={`Complete payment of ${currency} ${amount.toLocaleString()}`}
                onLoad={handleIframeLoad}
                allow="payment"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
