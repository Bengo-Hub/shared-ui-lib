'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface SSOLoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    [key: string]: unknown;
  };
}

export interface SSOLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tenant slug for auth-ui URL construction */
  tenantSlug: string;
  /** Auth-UI base URL */
  authUiUrl?: string;
  /** Called when SSO login succeeds — receives tokens and user info */
  onLoginSuccess?: (result: SSOLoginResult) => void;
  /** Called when login fails */
  onLoginFailed?: (error: string) => void;
  /** Optional title override */
  title?: string;
}

type LoginState = 'loading' | 'ready' | 'success' | 'failed';

export function SSOLoginModal({
  open,
  onOpenChange,
  tenantSlug,
  authUiUrl = 'https://accounts.codevertexitsolutions.com',
  onLoginSuccess,
  onLoginFailed,
  title = 'Sign In',
}: SSOLoginModalProps) {
  const [loginState, setLoginState] = useState<LoginState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build iframe URL
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      tenant: tenantSlug,
      embed: 'true',
      redirect_uri: 'postmessage',
    });
    return `${authUiUrl}/login?${params.toString()}`;
  }, [tenantSlug, authUiUrl]);

  // Listen for postMessage from auth-ui iframe
  const handleMessage = useCallback((event: MessageEvent) => {
    if (!authUiUrl || !event.origin.includes(new URL(authUiUrl).hostname)) return;

    const data = event.data;
    if (!data || typeof data.type !== 'string') return;

    switch (data.type) {
      case 'auth:login_success': {
        const result: SSOLoginResult = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        };
        setLoginState('success');
        onLoginSuccess?.(result);
        // Auto-close after brief delay so caller can process tokens
        setTimeout(() => onOpenChange(false), 300);
        break;
      }
      case 'auth:login_failed':
        setErrorMessage(data.error || 'Login failed');
        setLoginState('failed');
        onLoginFailed?.(data.error || 'Login failed');
        break;
      case 'auth:resize':
        if (iframeRef.current && data.height) {
          iframeRef.current.style.height = `${data.height}px`;
        }
        break;
    }
  }, [authUiUrl, onLoginSuccess, onLoginFailed, onOpenChange]);

  useEffect(() => {
    if (open) {
      window.addEventListener('message', handleMessage);
      setLoginState('loading');
      setErrorMessage('');
    }
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [open, handleMessage]);

  const handleIframeLoad = useCallback(() => {
    if (loginState === 'loading') {
      setLoginState('ready');
    }
  }, [loginState]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal — compact for login */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
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
          {loginState === 'failed' ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Login Failed</h3>
              <p className="text-sm text-gray-600">{errorMessage}</p>
              <button
                onClick={() => { setLoginState('loading'); setErrorMessage(''); }}
                className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {loginState === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading login...</p>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                className="w-full border-0"
                style={{ height: '450px' }}
                title="Login"
                onLoad={handleIframeLoad}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
