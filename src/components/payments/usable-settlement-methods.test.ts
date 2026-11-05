import assert from 'node:assert/strict';
import { test } from 'node:test';
import { usableSettlementMethods } from './usable-settlement-methods.ts';

const all = ['cash', 'mpesa_manual', 'bank', 'mpesa', 'paystack', 'mtn_momo', 'mpesa_b2b', 'paystack_bank'].map((value) => ({ value }));
const values = (u?: Parameters<typeof usableSettlementMethods>[1]) => usableSettlementMethods(all, u).map((m) => m.value);

test('a tenant with no gateway sees offline methods only, M-Pesa code among them', () => {
  assert.deepEqual(values({ collect: [], payout: [] }), ['cash', 'mpesa_manual', 'bank']);
});

test('no answer from treasury leaves offline methods only', () => {
  assert.deepEqual(values(undefined), ['cash', 'mpesa_manual', 'bank']);
  assert.deepEqual(values(null), ['cash', 'mpesa_manual', 'bank']);
});

test('a gateway method shows only when treasury lists it', () => {
  assert.deepEqual(values({ collect: ['paystack'], payout: ['mpesa_b2b'] }), ['cash', 'mpesa_manual', 'bank', 'paystack', 'mpesa_b2b']);
});
