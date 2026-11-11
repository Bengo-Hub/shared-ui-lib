import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPaymentMethodLabel } from './payment-method-labels.ts';

test('manual MTN and Airtel tenders read as codes', () => {
  assert.equal(getPaymentMethodLabel('mtn_momo_manual'), 'MTN MoMo (Code)');
  assert.equal(getPaymentMethodLabel('airtel_money_manual'), 'Airtel Money (Code)');
});

test('Other shows its payment label when one exists', () => {
  assert.equal(getPaymentMethodLabel('other_manual'), 'Other');
  assert.equal(getPaymentMethodLabel('other_manual', 'Voucher'), 'Other (Voucher)');
  assert.equal(getPaymentMethodLabel('other_manual', '  '), 'Other');
  assert.equal(getPaymentMethodLabel('other_manual', null), 'Other');
});

test('the provider name argument still works for other methods', () => {
  assert.equal(getPaymentMethodLabel('bank_transfer', 'Equity Bank'), 'Bank Transfer (Equity Bank)');
  assert.equal(getPaymentMethodLabel('mpesa_manual'), 'M-Pesa (Code)');
  assert.equal(getPaymentMethodLabel(null), '—');
});
