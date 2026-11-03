// node --test src/components/contact/phone-number.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { repairPhoneNumber } from './phone-number.ts';

test('a complete number is kept', () => {
  assert.equal(repairPhoneNumber('+254743793901', 'KE'), '+254743793901');
});

test('the country code typed twice is dropped', () => {
  assert.equal(repairPhoneNumber('+254254743793901', 'KE'), '+254743793901');
});

test('the national 0 after the prefix is dropped', () => {
  assert.equal(repairPhoneNumber('+2540743793901', 'KE'), '+254743793901');
});

test('a local number pasted over the prefix is read in the default country', () => {
  assert.equal(repairPhoneNumber('+0743793901', 'KE'), '+254743793901');
  assert.equal(repairPhoneNumber('+0743793901'), '+0743793901', 'without a default country it is left alone');
});

test('a national number typed into an empty field is read in the default country, not as +7', () => {
  // "712345678" typed into the empty international field arrives as "+712345678".
  assert.equal(repairPhoneNumber('+712345678', 'KE'), '+254712345678');
  assert.equal(repairPhoneNumber('+743793901', 'KE'), '+254743793901');
});

test('a valid foreign number is never rewritten', () => {
  assert.equal(repairPhoneNumber('+447400123456', 'KE'), '+447400123456');
  assert.equal(repairPhoneNumber('+79161234567', 'KE'), '+79161234567');
});

test('a number still being typed is left alone', () => {
  assert.equal(repairPhoneNumber('+07437', 'KE'), '+07437');
  assert.equal(repairPhoneNumber('+2547437', 'KE'), '+2547437');
});
