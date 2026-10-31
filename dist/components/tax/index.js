// src/components/tax/calc.ts
var TAX_BANDS = ["A", "B", "C", "D", "E"];
var TAX_BAND_LABELS = {
  A: "Exempt",
  B: "Standard VAT",
  C: "Zero-rated",
  D: "Non-VAT",
  E: "Reduced VAT"
};
var NOISE_NUDGE = 1e-14;
function roundMoney(v, dp = 2) {
  if (!Number.isFinite(v)) return v;
  const scale = Math.pow(10, Math.max(0, dp));
  const out = Math.sign(v) * Math.round(Math.abs(v) * scale * (1 + NOISE_NUDGE)) / scale;
  return out === 0 ? 0 : out;
}
function splitAmount(total, dp, weights) {
  const n = weights.length;
  if (n < 1) return null;
  if (total < 0) {
    const parts = splitAmount(-total, dp, weights);
    return parts ? parts.map((p) => p === 0 ? 0 : -p) : null;
  }
  let sumW = 0;
  for (const w of weights) {
    if (w < 0) return null;
    sumW += w;
  }
  if (sumW === 0) return null;
  const scale = Math.pow(10, dp);
  const units = Math.round(roundMoney(total, dp) * scale);
  const floor = [];
  const frac = [];
  let allotted = 0;
  weights.forEach((w, i) => {
    const exact = units * w / sumW;
    floor[i] = Math.floor(exact);
    frac[i] = exact - floor[i];
    allotted += floor[i];
  });
  for (let left = units - allotted; left > 0; left--) {
    let best = 0;
    for (let i = 1; i < n; i++) if (frac[i] > frac[best]) best = i;
    floor[best]++;
    frac[best] = -1;
  }
  return floor.map((f) => f / scale);
}
function parseTaxBand(s) {
  const b = (s ?? "").trim().toUpperCase();
  return TAX_BANDS.includes(b) ? b : null;
}
function taxBandFor(stored, rate) {
  if (rate >= 15) return "B";
  if (rate >= 7 && rate <= 9) return "E";
  const b = parseTaxBand(stored);
  return b && b !== "B" && b !== "E" ? b : "A";
}
function splitTax(amount, rate, inclusive) {
  const a = roundMoney(amount);
  if (rate <= 0) return { net: a, tax: 0, gross: a };
  if (inclusive) {
    const tax2 = roundMoney(a * rate / (100 + rate));
    return { net: roundMoney(a - tax2), tax: tax2, gross: a };
  }
  const tax = roundMoney(a * rate / 100);
  return { net: a, tax, gross: roundMoney(a + tax) };
}
function percentOf(base, percent) {
  if (percent <= 0 || base <= 0) return 0;
  return roundMoney(base * Math.min(percent, 100) / 100);
}
function onBasis(v, l, base) {
  if (v <= 0 || l.rate <= 0) return v;
  if (base === "gross" && !l.inclusive) return v * (100 + l.rate) / 100;
  if (base === "net" && l.inclusive) return v * 100 / (100 + l.rate);
  return v;
}
function computeTax(doc) {
  const base = doc.discountBase ?? "net";
  const res = { lines: [], amount: 0, lineDiscount: 0, docDiscount: 0, net: 0, tax: 0, gross: 0, bands: {} };
  if (doc.lines.length === 0) return res;
  const after = [];
  const weight = [];
  let weightSum = 0;
  doc.lines.forEach((l, i) => {
    const amount = roundMoney((l.quantity || 0) * (l.unitPrice || 0));
    const discount = roundMoney(Math.max(0, l.discount ?? 0));
    after[i] = amount - discount;
    res.lines[i] = { amount, discount, docDiscount: 0, net: 0, tax: 0, gross: 0, rate: l.rate, band: taxBandFor(l.band, l.rate) };
    weight[i] = Math.max(0, onBasis(after[i], l, base));
    weightSum += weight[i];
  });
  let shares = doc.lines.map(() => 0);
  const d = roundMoney(Math.min(Math.max(0, doc.discount ?? 0), roundMoney(weightSum)));
  if (d > 0 && weightSum > 0) shares = splitAmount(d, 2, weight) ?? shares;
  doc.lines.forEach((l, i) => {
    const lr = res.lines[i];
    lr.docDiscount = shares[i];
    let r;
    if (base === "gross" && !l.inclusive) {
      r = splitTax(splitTax(after[i], l.rate, false).gross - shares[i], l.rate, true);
    } else if (base === "net" && l.inclusive) {
      r = splitTax(after[i] - splitTax(shares[i], l.rate, false).gross, l.rate, true);
    } else {
      r = splitTax(after[i] - shares[i], l.rate, !!l.inclusive);
    }
    lr.net = r.net;
    lr.tax = r.tax;
    lr.gross = r.gross;
    res.amount += lr.amount;
    res.lineDiscount += lr.discount;
    res.docDiscount += lr.docDiscount;
    res.net += lr.net;
    res.tax += lr.tax;
    res.gross += lr.gross;
    const bt = res.bands[lr.band] ?? { taxable: 0, tax: 0 };
    res.bands[lr.band] = { taxable: roundMoney(bt.taxable + lr.net), tax: roundMoney(bt.tax + lr.tax) };
  });
  res.amount = roundMoney(res.amount);
  res.lineDiscount = roundMoney(res.lineDiscount);
  res.docDiscount = roundMoney(res.docDiscount);
  res.net = roundMoney(res.net);
  res.tax = roundMoney(res.tax);
  res.gross = roundMoney(res.gross);
  return res;
}

export { TAX_BANDS, TAX_BAND_LABELS, computeTax, parseTaxBand, percentOf, roundMoney, splitAmount, splitTax, taxBandFor };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map