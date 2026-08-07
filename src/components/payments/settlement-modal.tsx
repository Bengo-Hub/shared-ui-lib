'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * The ONE settlement-method registry shared by every "receive/record/pay out" surface across
 * the fleet (treasury-ui customer AR, vendor AP, pos-ui credit-sale settlement). Extend here,
 * never fork a parallel list — a payment recorded via any of these surfaces should read the
 * same everywhere.
 */
export interface SettlementMethod {
  value: string;
  label: string;
  /** Whether this method needs a reference (M-Pesa code, cheque no., bank ref) — non-cash. */
  requiresReference?: boolean;
}

export const CASH: SettlementMethod = { value: 'cash', label: 'Cash' };
export const MPESA_STK: SettlementMethod = { value: 'mpesa', label: 'M-Pesa (STK / Paybill)' };
export const MPESA_MANUAL: SettlementMethod = { value: 'mpesa_manual', label: 'M-Pesa code (sighted)', requiresReference: true };
export const BANK: SettlementMethod = { value: 'bank', label: 'Bank transfer', requiresReference: true };
export const CHEQUE: SettlementMethod = { value: 'cheque', label: 'Cheque', requiresReference: true };
export const CARD: SettlementMethod = { value: 'card', label: 'Card' };
export const CARD_MANUAL: SettlementMethod = { value: 'card_manual', label: 'Card (PDQ)', requiresReference: true };
export const PAYSTACK: SettlementMethod = { value: 'paystack', label: 'Paystack' };
export const STORE_CREDIT: SettlementMethod = { value: 'store_credit', label: 'Store credit' };
export const CUSTOMER_ADVANCE: SettlementMethod = { value: 'customer_advance', label: 'Customer advance' };
export const MPESA_B2C: SettlementMethod = { value: 'mpesa_b2c', label: 'M-Pesa (send to customer)' };
export const MPESA_B2B: SettlementMethod = { value: 'mpesa_b2b', label: 'M-Pesa (send to supplier till/paybill)' };
export const MTN_MOMO: SettlementMethod = { value: 'mtn_momo', label: 'MTN Mobile Money', requiresReference: true };
export const AIRTEL_MONEY: SettlementMethod = { value: 'airtel_money', label: 'Airtel Money', requiresReference: true };
export const BANK_TRANSFER: SettlementMethod = { value: 'bank_transfer', label: 'Bank Transfer', requiresReference: true };

/** Every method the platform supports for RECEIVING money (customer/supplier repayment). */
export const RECEIVE_METHODS: SettlementMethod[] = [CASH, MPESA_STK, MPESA_MANUAL, BANK, CHEQUE, CARD, PAYSTACK, STORE_CREDIT, MTN_MOMO, AIRTEL_MONEY, BANK_TRANSFER];
/** Real cash-out channels only — paying money OUT, never a book-entry method. */
export const PAYOUT_METHODS: SettlementMethod[] = [CASH, MPESA_B2C, BANK, CHEQUE];
/** Paying a supplier — offline references + online dispatch methods. */
export const PAY_SUPPLIER_METHODS: SettlementMethod[] = [CASH, MPESA_B2B, BANK, CHEQUE, CARD, BANK_TRANSFER];
/** Settling a completed on-account (credit) sale at the till — recording money already
 *  collected offline, never a live STK push (that's a separate checkout-time tender). */
export const SETTLE_CREDIT_SALE_METHODS: SettlementMethod[] = [CASH, MPESA_MANUAL, CARD_MANUAL, BANK, CHEQUE, PAYSTACK, MTN_MOMO, AIRTEL_MONEY, BANK_TRANSFER];

export type SettlementMode = 'receive' | 'payout' | 'apply_to_debt' | 'pay_supplier' | 'record_refund';

export interface SettlementSubmitInput {
  amount: number;
  method?: string;
  reference?: string;
}

export interface SettlementModalProps {
  open: boolean;
  mode: SettlementMode;
  title: string;
  /** e.g. the customer/supplier/invoice name shown in the summary strip. */
  subjectName: string;
  /** e.g. "Balance due" / "Available credit" / "Outstanding payable". */
  amountLabel: string;
  amountValue: number;
  currency?: string;
  defaultAmount?: number;
  /** Client-side cap (server remains authoritative) — omit to skip the check. */
  maxAmount?: number;
  /** Method list for this mode — pass one of the exported registries, or a custom subset. */
  methods: SettlementMethod[];
  /** Called on Confirm; throw/reject to show the error inline and keep the modal open. */
  onSubmit: (input: SettlementSubmitInput) => Promise<void>;
  onClose: () => void;
  isPending?: boolean;
  /** Extra fields rendered between the amount and method (e.g. a payout recipient phone). */
  extraFields?: React.ReactNode;
}

/**
 * The ONE settlement modal for every "receive payment / pay out / apply credit / pay supplier /
 * record refund" surface across treasury-ui and pos-ui — replaces the previously-duplicated
 * RecordPaymentModal / ReceivePaymentModal / PayoutCreditModal / vendor dialogs / pos-ui
 * record-payment-modal, each of which had its own divergent method list. Backend-agnostic by
 * design (like TreasuryPaymentModal in this same package): the caller wires onSubmit to
 * whichever endpoint applies (treasury AR/AP, pos-api credit settlement) — this component only
 * owns the amount/method/reference form and its validation.
 */
export function SettlementModal({
  open, mode, title, subjectName, amountLabel, amountValue, currency = 'KES',
  defaultAmount, maxAmount, methods, onSubmit, onClose, isPending = false, extraFields,
}: SettlementModalProps) {
  const [amount, setAmount] = useState(String(defaultAmount ?? amountValue));
  const [method, setMethod] = useState(methods[0]?.value ?? '');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const selectedMethod = useMemo(() => methods.find((m) => m.value === method), [methods, method]);

  if (!open || typeof document === 'undefined') return null;

  const fmt = (v: number) => `${currency} ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (typeof maxAmount === 'number' && amt > maxAmount + 0.0001) {
      setError(`Amount exceeds ${fmt(maxAmount)}.`);
      return;
    }
    if (selectedMethod?.requiresReference && !reference.trim()) {
      setError('A reference is required for this method.');
      return;
    }
    setError('');
    try {
      await onSubmit({ amount: amt, method: methods.length ? method : undefined, reference: reference.trim() || undefined });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !isPending && onClose()}>
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              disabled={isPending}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div className="p-5 space-y-3">
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <p className="font-semibold text-gray-900">{subjectName}</p>
              <p className="text-xs text-gray-500">{amountLabel}: {fmt(amountValue)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Amount ({currency})</label>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black"
              />
            </div>
            {extraFields}
            {methods.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-500">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black"
                >
                  {methods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            )}
            {(selectedMethod?.requiresReference || mode === 'apply_to_debt') && (
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Reference {selectedMethod?.requiresReference ? '' : '(optional)'}
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="M-Pesa code, cheque no., etc."
                  className="w-full mt-1 bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-black"
                />
              </div>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                disabled={isPending}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={isPending}
                className="flex-1 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
