import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatMoneyInputValue, formatMoneyText, normalizeCurrency, parseMoneyInput, roundMoney } from './currency.ts';

test('parseMoneyInput reads typed amounts', () => {
  assert.equal(parseMoneyInput('5000'), 5000);
  assert.equal(parseMoneyInput('5,000'), 5000);
  assert.equal(parseMoneyInput(' 5 000 '), 5000);
  assert.equal(parseMoneyInput('KES 5,000.50'), 5000.5);
  assert.equal(parseMoneyInput('$12.5'), 12.5);
  assert.equal(parseMoneyInput('.5'), 0.5);
});

test('parseMoneyInput rejects empty, unreadable and negative text', () => {
  assert.equal(parseMoneyInput(''), null);
  assert.equal(parseMoneyInput(null), null);
  assert.equal(parseMoneyInput('abc'), null);
  assert.equal(parseMoneyInput('5k'), null);
  assert.equal(parseMoneyInput('1.2.3'), null);
  assert.equal(parseMoneyInput('-5'), null);
});

test('rounding follows the currency places', () => {
  assert.equal(roundMoney(10.555, 'KES'), 10.56);
  assert.equal(roundMoney(1000.6, 'UGX'), 1001);
});

test('input values group digits and drop zero decimals', () => {
  assert.equal(formatMoneyInputValue(5000, 'KES'), '5,000');
  assert.equal(formatMoneyInputValue(12.5, 'USD'), '12.50');
  assert.equal(formatMoneyInputValue(1500.4, 'UGX'), '1,500');
  assert.equal(formatMoneyInputValue(null, 'KES'), '');
});

test('money text always carries the currency code', () => {
  assert.equal(formatMoneyText(3000, 'KES'), 'KES 3,000');
  assert.equal(formatMoneyText(12.5, 'usd'), 'USD 12.50');
  assert.equal(formatMoneyText(100, ''), 'KES 100');
  assert.equal(normalizeCurrency(' ugx '), 'UGX');
  assert.equal(normalizeCurrency('KSH1'), '');
});
