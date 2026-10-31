// Runs the vectors shared with httpware/tax: node --test src/components/tax/calc.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeTax, splitTax, taxBandFor, percentOf, roundMoney } from './calc.ts';

interface Vector {
  name: string;
  discount_base: 'net' | 'gross';
  discount: number;
  lines: { quantity: number; unit_price: number; discount: number; rate: number; inclusive: boolean; band: string }[];
  expect: {
    lines: { net: number; tax: number; gross: number; doc_discount: number; band: string }[];
    net: number;
    tax: number;
    gross: number;
    doc_discount: number;
    bands: Record<string, { taxable: number; tax: number }>;
  };
}

const vectors: Vector[] = JSON.parse(readFileSync(new URL('./testdata/vectors.json', import.meta.url), 'utf8'));

for (const v of vectors) {
  test(v.name, () => {
    const got = computeTax({
      discount: v.discount,
      discountBase: v.discount_base,
      lines: v.lines.map((l) => ({
        quantity: l.quantity, unitPrice: l.unit_price, discount: l.discount, rate: l.rate, inclusive: l.inclusive, band: l.band,
      })),
    });
    v.expect.lines.forEach((want, i) => {
      const g = got.lines[i];
      assert.deepEqual(
        { net: g.net, tax: g.tax, gross: g.gross, doc_discount: g.docDiscount, band: g.band },
        want,
        `line ${i}`,
      );
    });
    assert.deepEqual(
      { net: got.net, tax: got.tax, gross: got.gross, doc_discount: got.docDiscount },
      { net: v.expect.net, tax: v.expect.tax, gross: v.expect.gross, doc_discount: v.expect.doc_discount },
    );
    assert.deepEqual(got.bands, v.expect.bands);
  });
}

test('splitTax', () => {
  assert.deepEqual(splitTax(116, 16, true), { net: 100, tax: 16, gross: 116 });
  assert.deepEqual(splitTax(100, 16, false), { net: 100, tax: 16, gross: 116 });
  assert.deepEqual(splitTax(-116, 16, true), { net: -100, tax: -16, gross: -116 });
});

test('taxBandFor', () => {
  assert.equal(taxBandFor('A', 16), 'B');
  assert.equal(taxBandFor('E', 8), 'E');
  assert.equal(taxBandFor('d', 0), 'D');
  assert.equal(taxBandFor('B', 0), 'A');
  assert.equal(taxBandFor(null, 0), 'A');
});

test('roundMoney rounds half away from zero', () => {
  assert.equal(roundMoney(1.005), 1.01);
  assert.equal(roundMoney(-2.345), -2.35);
  assert.equal(roundMoney(-0.001), 0);
});

test('percentOf', () => {
  assert.equal(percentOf(613.6, 10), 61.36);
  assert.equal(percentOf(50, 150), 50);
  assert.equal(percentOf(50, -1), 0);
});

test('shares add up exactly and the bill falls by the discount', () => {
  const got = computeTax({
    discount: 10,
    discountBase: 'gross',
    lines: [1, 2, 3].map(() => ({ quantity: 1, unitPrice: 33.33, rate: 16, inclusive: true, band: 'B' })),
  });
  assert.equal(got.docDiscount, 10);
  assert.equal(got.gross, 89.99);
});
