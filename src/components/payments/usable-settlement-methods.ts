/**
 * Which methods a payment form may offer a tenant. A method backed by a gateway works only when the
 * tenant has that gateway configured and switched on, so it is shown only when treasury lists it
 * (GET /{tenant}/gateways/settlement-methods). Offline methods need no gateway and always show,
 * including M-Pesa paid by hand with its optional code (mpesa_manual) and its MTN, Airtel and
 * Other siblings (mtn_momo_manual, airtel_money_manual, other_manual). Those manual codes must
 * never be added to the gateway set below.
 */
export interface UsableSettlementMethods {
  /** Online methods money can come in on. */
  collect?: string[];
  /** Online methods money can go out on. */
  payout?: string[];
}

const GATEWAY_BACKED_METHODS = new Set([
  'mpesa', 'paystack', 'mtn_momo', 'airtel_money',
  'mpesa_b2b', 'mpesa_b2c', 'paystack_bank', 'paystack_mobile',
]);

/** Drops the gateway methods the tenant cannot use. No answer yet, or a failed one, leaves offline methods only. */
export function usableSettlementMethods<T extends { value: string }>(
  methods: readonly T[],
  usable?: UsableSettlementMethods | null,
): T[] {
  return methods.filter(
    (m) => !GATEWAY_BACKED_METHODS.has(m.value)
      || !!usable?.collect?.includes(m.value)
      || !!usable?.payout?.includes(m.value),
  );
}
