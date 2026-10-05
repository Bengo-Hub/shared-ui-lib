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
  default_invoice_types?: string[] | null;
  outlet_id?: string | null;
  created_at?: string | null;
}

/**
 * The same rule as treasury-api's ledger.pickDefaultAccount, so the account a payment dialog
 * pre-selects is the account the books would use: among accounts defaulting to the method, one
 * scoped to the outlet beats a tenant-wide one (another outlet's never counts), then one that
 * also defaults to the invoice type wins, then the oldest. Two accounts defaulting to the same
 * method used to resolve differently here and in the books (INV-260928-000030, 2026-10-05).
 */
export function resolveDefaultAccount<T extends DefaultAccountCandidate>(
  accounts: T[] | undefined | null,
  method?: string | null,
  outletId?: string | null,
  invoiceType?: string | null,
): T | undefined {
  const active = (accounts ?? []).filter((a) => a.is_active !== false);

  if (method) {
    const oldestFirst = [...active].sort((a, b) =>
      (a.created_at ?? '').localeCompare(b.created_at ?? '') || a.id.localeCompare(b.id));
    let best: T | undefined;
    let bestScore = -1;
    for (const a of oldestFirst) {
      if (!(a.default_payment_methods ?? []).includes(method)) continue;
      let score = 0;
      if (a.outlet_id) {
        if (!outletId || a.outlet_id !== outletId) continue;
        score += 2;
      }
      if (invoiceType && (a.default_invoice_types ?? []).includes(invoiceType)) score += 1;
      if (score > bestScore) {
        best = a;
        bestScore = score;
      }
    }
    if (best) return best;
  }

  return active.find((a) => a.account_type === 'cash');
}
