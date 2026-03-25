'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface TrackingIframeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tracking code / order reference */
  trackingCode: string;
  /** Logistics-UI base URL */
  logisticsUiUrl?: string;
  /** Optional title override */
  title?: string;
}

type LoadState = 'loading' | 'ready';

export function TrackingIframeModal({
  open,
  onOpenChange,
  trackingCode,
  logisticsUiUrl = 'https://logistics.codevertexitsolutions.com',
  title = 'Track Order',
}: TrackingIframeModalProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const iframeSrc = `${logisticsUiUrl}/track/${encodeURIComponent(trackingCode)}?embed=true`;

  // Listen for postMessage resize events from logistics-ui
  const handleMessage = useCallback((event: MessageEvent) => {
    if (!logisticsUiUrl || !event.origin.includes(new URL(logisticsUiUrl).hostname)) return;

    const data = event.data;
    if (!data || typeof data.type !== 'string') return;

    if (data.type === 'tracking:resize' || data.type === 'logistics:resize') {
      if (iframeRef.current && data.height) {
        iframeRef.current.style.height = `${data.height}px`;
      }
    }
  }, [logisticsUiUrl]);

  useEffect(() => {
    if (open) {
      window.addEventListener('message', handleMessage);
      setLoadState('loading');
    }
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [open, handleMessage]);

  const handleIframeLoad = useCallback(() => {
    setLoadState('ready');
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-500">Tracking: <span className="font-mono">{trackingCode}</span></p>
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
          {loadState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading tracking info...</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="w-full border-0"
            style={{ height: '500px' }}
            title="Order Tracking"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}
