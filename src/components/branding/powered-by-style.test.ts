import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BRAND_ORANGE, BRAND_ORANGE_ON_LIGHT, NAME_STYLE, contrastRatio } from './powered-by-style.ts';

test('the company name passes 4.5:1 on light cards', () => {
  for (const bg of ['#FFFFFF', '#FFF4E6', '#F8FAFC']) {
    assert.ok(contrastRatio(BRAND_ORANGE_ON_LIGHT, bg) >= 4.5, `${BRAND_ORANGE_ON_LIGHT} on ${bg}`);
  }
});

test('the brand orange is kept for dark cards, where it passes', () => {
  for (const bg of ['#1C1917', '#0F172A', '#18181B']) {
    assert.ok(contrastRatio(BRAND_ORANGE, bg) >= 4.5, `${BRAND_ORANGE} on ${bg}`);
  }
  assert.ok(contrastRatio(BRAND_ORANGE, '#FFFFFF') < 4.5, 'the reason light themes need the deeper shade');
});

test('the scoped style switches on the dark class and the dark data-theme', () => {
  assert.match(NAME_STYLE, /^\.cvx-powered-by-name\{color:#B84A12\}/);
  assert.match(NAME_STYLE, /\.dark \.cvx-powered-by-name,\[data-theme="dark"\] \.cvx-powered-by-name\{color:#E8631E\}/);
});
