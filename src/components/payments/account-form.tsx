'use client';

/**
 * AccountForm — the ONE cross-service form for creating a real, ledger-linked financial account
 * (bank / mobile money / cash drawer), so any service (pos-ui, treasury-ui, or a future consumer)
 * can offer "add a real account" inline without re-inventing the field set each time. Backend-
 * agnostic by design (same philosophy as SettlementModal in this same package): this component
 * owns the type selector + type-conditional fields + validation only. The caller wires the actual
 * create call (treasury-api's `POST /bank-accounts` for a JWT session, or a service's own S2S
 * proxy of it — e.g. pos-api's `/pos/accounts`) and, optionally, bank verification (Paystack-
 * backed account-name lookup) via the `banks`/`onVerifyBank` props; omit them entirely for a
 * consumer with no such gateway proxy wired yet — the bank/account-number fields still work as
 * plain manual entry.
 *
 * Mirrors treasury-api's real account_type enum (bank/mobile_money/cash — `gateway` is a
 * platform-internal fourth kind never created through a form) and the exact field shape
 * `POST /bank-accounts` expects, so a consumer can serialize `AccountFormValue` close to as-is.
 */

import { useState } from 'react';

export type AccountType = 'bank' | 'mobile_money' | 'cash';

export interface AccountFormValue {
  account_type: AccountType;
  account_name: string;
  bank_name: string;
  account_number: string;
  bank_branch: string;
  branch_code: string;
  currency: string;
  opening_balance: string;
}

export const EMPTY_ACCOUNT_FORM: AccountFormValue = {
  account_type: 'bank',
  account_name: '',
  bank_name: '',
  account_number: '',
  bank_branch: '',
  branch_code: '',
  currency: 'KES',
  opening_balance: '',
};

export interface AccountFormBankOption {
  code: string;
  name: string;
}

export interface AccountFormProps {
  value: AccountFormValue;
  onChange: (value: AccountFormValue) => void;
  /** ISO codes this form's currency picker offers — pass shared-ui-lib's own SUPPORTED_CURRENCIES
   *  (this package's `./currency`) unless the consumer has a narrower/different list. */
  currencies: readonly string[];
  currencyLabel?: (code: string) => string;
  /** Optional Paystack-backed bank list + account-name verification for the `bank` type. Omit
   *  entirely to fall back to plain manual bank-name/account-number entry (no lookup). */
  banks?: AccountFormBankOption[];
  banksLoading?: boolean;
  onVerifyBank?: (accountNumber: string, bankCode: string) => Promise<{ accountName?: string; error?: string }>;
  verifying?: boolean;
  /** Hide the account-type selector (e.g. a consumer that only ever creates one type inline from
   *  a specific flow, like a "cash drawer" quick-add). Defaults to showing all three types. */
  hideTypeSelector?: boolean;
  className?: string;
}

const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm';
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

export function AccountForm({
  value, onChange, currencies, currencyLabel, banks, banksLoading, onVerifyBank, verifying,
  hideTypeSelector = false, className,
}: AccountFormProps) {
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState('');

  const set = (patch: Partial<AccountFormValue>) => onChange({ ...value, ...patch });

  const handleVerify = () => {
    if (!onVerifyBank) return;
    setVerifiedName(null);
    setVerifyError(null);
    onVerifyBank(value.account_number, bankCode).then((res) => {
      if (res.accountName) {
        setVerifiedName(res.accountName);
        set({ account_name: res.accountName });
      } else {
        setVerifyError(res.error || 'Could not resolve the account name — enter it manually.');
      }
    }).catch((e: unknown) => {
      setVerifyError(e instanceof Error ? e.message : 'Verification failed — enter the name manually.');
    });
  };

  return (
    <div className={className ?? 'space-y-4'}>
      {!hideTypeSelector && (
        <div>
          <label className={labelClass}>Account Type</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {(['bank', 'mobile_money', 'cash'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ account_type: t })}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${value.account_type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent/30'}`}
              >
                {t === 'bank' ? 'Bank Account' : t === 'mobile_money' ? 'Mobile Money' : 'Cash Drawer'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Currency</label>
          <select value={value.currency} onChange={(e) => set({ currency: e.target.value })} className={inputClass}>
            {currencies.map((c) => (
              <option key={c} value={c}>{currencyLabel ? currencyLabel(c) : c}</option>
            ))}
          </select>
        </div>

        {value.account_type === 'bank' && (
          <div>
            <label className={labelClass}>
              Bank {banksLoading && <span className="ml-1 text-[10px]">(loading…)</span>}
            </label>
            {banks && banks.length > 0 ? (
              <select
                value={bankCode}
                onChange={(e) => {
                  const selected = banks.find((b) => b.code === e.target.value);
                  setBankCode(e.target.value);
                  set({ bank_name: selected?.name ?? value.bank_name });
                  setVerifiedName(null);
                  setVerifyError(null);
                }}
                className={inputClass}
                disabled={banksLoading}
              >
                <option value="">{value.bank_name ? `${value.bank_name} (change…)` : '-- Select bank --'}</option>
                {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            ) : (
              <input
                value={value.bank_name}
                onChange={(e) => set({ bank_name: e.target.value })}
                className={inputClass}
                placeholder="e.g. KCB Bank Kenya"
              />
            )}
          </div>
        )}
      </div>

      {value.account_type === 'bank' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Account Number</label>
            <div className="flex gap-2">
              <input
                value={value.account_number}
                onChange={(e) => { set({ account_number: e.target.value }); setVerifiedName(null); setVerifyError(null); }}
                className={inputClass}
                placeholder="e.g. 0123456789"
              />
              {onVerifyBank && (
                <button
                  type="button"
                  disabled={!bankCode || !value.account_number || verifying}
                  onClick={handleVerify}
                  className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent/30 disabled:opacity-50"
                  title={!bankCode ? 'Select a bank first' : 'Verify account number'}
                >
                  {verifying ? '…' : 'Verify'}
                </button>
              )}
            </div>
            {verifiedName && <p className="mt-1 text-[11px] text-green-600">Verified: {verifiedName}</p>}
            {verifyError && <p className="mt-1 text-[11px] text-amber-600">{verifyError}</p>}
          </div>
          <div>
            <label className={labelClass}>Account Name</label>
            <input
              value={value.account_name}
              onChange={(e) => set({ account_name: e.target.value })}
              className={inputClass}
              placeholder="Auto-filled on verify, or enter manually"
            />
          </div>
        </div>
      )}

      {value.account_type === 'bank' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Bank Branch (optional)</label>
            <input value={value.bank_branch} onChange={(e) => set({ bank_branch: e.target.value })} className={inputClass} placeholder="e.g. Westlands" />
          </div>
          <div>
            <label className={labelClass}>SWIFT / Branch Code (optional)</label>
            <input value={value.branch_code} onChange={(e) => set({ branch_code: e.target.value })} className={inputClass} placeholder="e.g. EQBLKENA" />
          </div>
        </div>
      )}

      {value.account_type === 'mobile_money' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Account Name</label>
            <input
              value={value.account_name}
              onChange={(e) => set({ account_name: e.target.value })}
              className={inputClass}
              placeholder="e.g. M-Pesa Till — Westlands Branch"
            />
          </div>
          <div>
            <label className={labelClass}>Till / Paybill Number</label>
            <input
              value={value.account_number}
              onChange={(e) => set({ account_number: e.target.value })}
              className={inputClass}
              placeholder="e.g. 174379"
            />
          </div>
        </div>
      )}

      {value.account_type === 'cash' && (
        <div>
          <label className={labelClass}>Account Name</label>
          <input
            value={value.account_name}
            onChange={(e) => set({ account_name: e.target.value })}
            className={inputClass}
            placeholder="e.g. Petty Cash — Head Office"
          />
        </div>
      )}

      <div>
        <label className={labelClass}>Opening Balance (optional)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value.opening_balance}
          onChange={(e) => set({ opening_balance: e.target.value })}
          className={inputClass}
          placeholder="0.00"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">Posted as a real journal entry against Opening Balance Equity.</p>
      </div>
    </div>
  );
}

/** True once the fields required for the CURRENT account_type are filled in — gate a "Create"
 *  button on this rather than each consumer re-deriving the same per-type rule. */
export function isAccountFormValid(value: AccountFormValue): boolean {
  if (!value.account_name.trim()) return false;
  if (value.account_type === 'bank') return !!value.bank_name.trim() && !!value.account_number.trim();
  if (value.account_type === 'mobile_money') return !!value.account_number.trim();
  return true; // cash: name only
}
