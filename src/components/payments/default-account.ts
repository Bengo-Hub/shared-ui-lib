/**
 * The ONE "which real account should this payment default to" resolver, shared by every
 * receive/pay/settle modal across treasury-ui and pos-ui. Mirrors treasury-api's own
 * `ledger.ResolveCashCode` tier-2 precedence client-side (method match, outlet-scoped preferred
 * over tenant-wide) purely against the account list the caller already has from `useBankAccounts`
 * — no extra request. Falls back to the first active cash-type account when no method is given or
 * nothing matches, the same convention `MarkExpensePaidModal`/pos-ui's `add-expense-modal`
 * independently duplicated before this existed.
 *
 * A pre-selected default is never a lock-in — every caller still renders a normal, editable
 * account picker; this only decides what shows up already selected.
 */

export interface DefaultAccountCandidate {
  id: string;
  is_active?: boolean;
  account_type?: string;
  default_payment_methods?: string[] | null;
  outlet_id?: string | null;
}

export function resolveDefaultAccount<T extends DefaultAccountCandidate>(
  accounts: T[] | undefined | null,
  method?: string | null,
  outletId?: string | null,
): T | undefined {
  const active = (accounts ?? []).filter((a) => a.is_active !== false);

  if (method) {
    const matches = active.filter((a) => (a.default_payment_methods ?? []).includes(method));
    const outletMatch = outletId ? matches.find((a) => a.outlet_id === outletId) : undefined;
    if (outletMatch) return outletMatch;
    const tenantWideMatch = matches.find((a) => !a.outlet_id);
    if (tenantWideMatch) return tenantWideMatch;
    if (matches.length) return matches[0];
  }

  return active.find((a) => a.account_type === 'cash');
}
