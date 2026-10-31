// The platform's VAT calculator for the browser. It mirrors github.com/Bengo-Hub/httpware/tax line
// for line and is held to the same test vectors (testdata/vectors.json), so the till, the invoice
// form and the services reach the same figures to the cent. Treasury serves the rates; nothing here
// builds one in.
//
// Rules: VAT is rounded to 2 decimal places on each line; a document discount is shared across the
// lines before VAT; totals and the per-band eTIMS figures are sums of the rounded lines.

/** KRA eTIMS OSCU tax band: A exempt, B standard, C zero-rated, D non-VAT, E reduced. */
export type TaxBand = 'A' | 'B' | 'C' | 'D' | 'E';

export const TAX_BANDS: readonly TaxBand[] = ['A', 'B', 'C', 'D', 'E'];

export const TAX_BAND_LABELS: Record<TaxBand, string> = {
  A: 'Exempt',
  B: 'Standard VAT',
  C: 'Zero-rated',
  D: 'Non-VAT',
  E: 'Reduced VAT',
};

export interface TaxLine {
  quantity: number;
  /** VAT-inclusive when `inclusive`, otherwise the taxable unit price. */
  unitPrice: number;
  /** Line discount amount, on the same basis as unitPrice. */
  discount?: number;
  /** VAT percent; 0 for exempt, zero-rated and non-VAT lines. */
  rate: number;
  inclusive?: boolean;
  /** Stored OSCU letter, resolved with taxBandFor. */
  band?: string | null;
}

export interface TaxLineResult {
  amount: number;
  discount: number;
  docDiscount: number;
  net: number;
  tax: number;
  gross: number;
  rate: number;
  band: TaxBand;
}

/** `net` takes a document discount off the taxable subtotal (invoices); `gross` off the bill (tills). */
export type DiscountBase = 'net' | 'gross';

export interface TaxDocument {
  lines: TaxLine[];
  /** Document discount amount; resolve a percentage first with percentOf. */
  discount?: number;
  discountBase?: DiscountBase;
}

export interface TaxBandTotal {
  taxable: number;
  tax: number;
}

export interface TaxResult {
  lines: TaxLineResult[];
  amount: number;
  lineDiscount: number;
  docDiscount: number;
  net: number;
  tax: number;
  gross: number;
  bands: Partial<Record<TaxBand, TaxBandTotal>>;
}

const NOISE_NUDGE = 1e-14;

/** Rounds half away from zero to dp places, stripping float noise (matches httpware/money.Round). */
export function roundMoney(v: number, dp = 2): number {
  if (!Number.isFinite(v)) return v;
  const scale = Math.pow(10, Math.max(0, dp));
  const out = (Math.sign(v) * Math.round(Math.abs(v) * scale * (1 + NOISE_NUDGE))) / scale;
  return out === 0 ? 0 : out;
}

/**
 * Splits total into n parts on the dp grid that add back to exactly total, in proportion to the
 * weights (largest remainder). Returns null for bad input. Matches httpware/money.Split.
 */
export function splitAmount(total: number, dp: number, weights: number[]): number[] | null {
  const n = weights.length;
  if (n < 1) return null;
  if (total < 0) {
    const parts = splitAmount(-total, dp, weights);
    return parts ? parts.map((p) => (p === 0 ? 0 : -p)) : null;
  }
  let sumW = 0;
  for (const w of weights) {
    if (w < 0) return null;
    sumW += w;
  }
  if (sumW === 0) return null;
  const scale = Math.pow(10, dp);
  const units = Math.round(roundMoney(total, dp) * scale);
  const floor: number[] = [];
  const frac: number[] = [];
  let allotted = 0;
  weights.forEach((w, i) => {
    const exact = (units * w) / sumW;
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

/** Normalises a stored letter; returns null for anything that is not an OSCU band. */
export function parseTaxBand(s: string | null | undefined): TaxBand | null {
  const b = (s ?? '').trim().toUpperCase();
  return (TAX_BANDS as readonly string[]).includes(b) ? (b as TaxBand) : null;
}

/**
 * Resolves the band of a line from its stored letter and VAT rate. A taxed rate decides B or E; a
 * zero rate trusts the stored zero band (A, C or D) and falls back to exempt.
 */
export function taxBandFor(stored: string | null | undefined, rate: number): TaxBand {
  if (rate >= 15) return 'B';
  if (rate >= 7 && rate <= 9) return 'E';
  const b = parseTaxBand(stored);
  return b && b !== 'B' && b !== 'E' ? b : 'A';
}

/** Separates an amount into taxable value, VAT and gross at rate percent, each rounded to 2dp. */
export function splitTax(amount: number, rate: number, inclusive: boolean): { net: number; tax: number; gross: number } {
  const a = roundMoney(amount);
  if (rate <= 0) return { net: a, tax: 0, gross: a };
  if (inclusive) {
    const tax = roundMoney((a * rate) / (100 + rate));
    return { net: roundMoney(a - tax), tax, gross: a };
  }
  const tax = roundMoney((a * rate) / 100);
  return { net: a, tax, gross: roundMoney(a + tax) };
}

/** Resolves a percentage discount against a base, rounded to 2dp. */
export function percentOf(base: number, percent: number): number {
  if (percent <= 0 || base <= 0) return 0;
  return roundMoney((base * Math.min(percent, 100)) / 100);
}

function onBasis(v: number, l: TaxLine, base: DiscountBase): number {
  if (v <= 0 || l.rate <= 0) return v;
  if (base === 'gross' && !l.inclusive) return (v * (100 + l.rate)) / 100;
  if (base === 'net' && l.inclusive) return (v * 100) / (100 + l.rate);
  return v;
}

/** Works out every line and the document totals. See the file header for the rules. */
export function computeTax(doc: TaxDocument): TaxResult {
  const base = doc.discountBase ?? 'net';
  const res: TaxResult = { lines: [], amount: 0, lineDiscount: 0, docDiscount: 0, net: 0, tax: 0, gross: 0, bands: {} };
  if (doc.lines.length === 0) return res;

  const after: number[] = [];
  const weight: number[] = [];
  let weightSum = 0;
  doc.lines.forEach((l, i) => {
    const amount = roundMoney((l.quantity || 0) * (l.unitPrice || 0));
    const discount = roundMoney(Math.max(0, l.discount ?? 0));
    after[i] = amount - discount;
    res.lines[i] = { amount, discount, docDiscount: 0, net: 0, tax: 0, gross: 0, rate: l.rate, band: taxBandFor(l.band, l.rate) };
    weight[i] = Math.max(0, onBasis(after[i], l, base));
    weightSum += weight[i];
  });

  let shares: number[] = doc.lines.map(() => 0);
  const d = roundMoney(Math.min(Math.max(0, doc.discount ?? 0), roundMoney(weightSum)));
  if (d > 0 && weightSum > 0) shares = splitAmount(d, 2, weight) ?? shares;

  doc.lines.forEach((l, i) => {
    const lr = res.lines[i];
    lr.docDiscount = shares[i];
    let r: { net: number; tax: number; gross: number };
    if (base === 'gross' && !l.inclusive) {
      r = splitTax(splitTax(after[i], l.rate, false).gross - shares[i], l.rate, true);
    } else if (base === 'net' && l.inclusive) {
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
