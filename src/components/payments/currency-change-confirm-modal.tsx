'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from './currency';

export interface CurrencyChangeExampleRow {
  label: string;
  originalAmount: number;
}

export interface CurrencyChangeConfirmModalProps {
  open: boolean;
  fromCurrency: string;
  toCurrency: string;
  /** 1 fromCurrency = rate toCurrency. */
  rate: number | null;
  /** e.g. "Live (exchangerate-api)" or "Manual rate" or the ExchangeRate.effective_date. */
  rateSource?: string;
  /** Optional illustrative amounts (e.g. current till float, a sale total) shown converted. */
  exampleAmounts?: CurrencyChangeExampleRow[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  /** Shown when `rate` is null (no rate available yet) — Confirm is disabled in that state. */
  error?: string | null;
}

/**
 * Shown whenever a tenant/outlet's configured currency is about to change (pos-ui GeneralTab,
 * treasury-ui currency settings). Summarizes the live conversion rate + a few example amounts
 * before committing, per the "always confirm a currency change with a rate summary" requirement —
 * never silently switches an outlet/tenant's currency.
 */
export function CurrencyChangeConfirmModal({
  open,
  fromCurrency,
  toCurrency,
  rate,
  rateSource,
  exampleAmounts = [],
  onConfirm,
  onCancel,
  loading = false,
  error,
}: CurrencyChangeConfirmModalProps) {
  const [confirming, setConfirming] = useState(false);
  if (!open || typeof document === 'undefined') return null;

  const busy = loading || confirming;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !busy && onCancel()}>
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-neutral-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Confirm currency change</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-center gap-3 rounded-lg bg-gray-50 dark:bg-neutral-800 px-4 py-3">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{fromCurrency}</span>
              <span className="text-gray-400" aria-hidden>→</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{toCurrency}</span>
            </div>

            {rate != null ? (
              <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
                <p>
                  Current rate: <span className="font-mono font-semibold">1 {fromCurrency} = {rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toCurrency}</span>
                </p>
                {rateSource && <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{rateSource}</p>}
              </div>
            ) : (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                {error || 'No exchange rate is available for this pair yet — you can still switch, but nothing will be converted.'}
              </p>
            )}

            {exampleAmounts.length > 0 && rate != null && (
              <div className="rounded-lg border border-gray-200 dark:border-neutral-800 divide-y divide-gray-100 dark:divide-neutral-800 overflow-hidden">
                {exampleAmounts.map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                    <span className="font-mono">
                      {formatCurrency(row.originalAmount, fromCurrency)}
                      <span className="text-gray-400 mx-1">→</span>
                      {formatCurrency(row.originalAmount * rate, toCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-500">
              New transactions will be recorded in {toCurrency} going forward. The rate and both
              currency values are stored on the change so it stays traceable.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onCancel}
                disabled={busy}
                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={busy}
                className="flex-1 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy && <span className="w-3.5 h-3.5 border-2 border-white/40 dark:border-black/40 border-t-white dark:border-t-black rounded-full animate-spin" />}
                Confirm change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
