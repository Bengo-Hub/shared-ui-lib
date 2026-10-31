/** KRA eTIMS OSCU tax band: A exempt, B standard, C zero-rated, D non-VAT, E reduced. */
type TaxBand = 'A' | 'B' | 'C' | 'D' | 'E';
declare const TAX_BANDS: readonly TaxBand[];
declare const TAX_BAND_LABELS: Record<TaxBand, string>;
interface TaxLine {
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
interface TaxLineResult {
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
type DiscountBase = 'net' | 'gross';
interface TaxDocument {
    lines: TaxLine[];
    /** Document discount amount; resolve a percentage first with percentOf. */
    discount?: number;
    discountBase?: DiscountBase;
}
interface TaxBandTotal {
    taxable: number;
    tax: number;
}
interface TaxResult {
    lines: TaxLineResult[];
    amount: number;
    lineDiscount: number;
    docDiscount: number;
    net: number;
    tax: number;
    gross: number;
    bands: Partial<Record<TaxBand, TaxBandTotal>>;
}
/** Rounds half away from zero to dp places, stripping float noise (matches httpware/money.Round). */
declare function roundMoney(v: number, dp?: number): number;
/**
 * Splits total into n parts on the dp grid that add back to exactly total, in proportion to the
 * weights (largest remainder). Returns null for bad input. Matches httpware/money.Split.
 */
declare function splitAmount(total: number, dp: number, weights: number[]): number[] | null;
/** Normalises a stored letter; returns null for anything that is not an OSCU band. */
declare function parseTaxBand(s: string | null | undefined): TaxBand | null;
/**
 * Resolves the band of a line from its stored letter and VAT rate. A taxed rate decides B or E; a
 * zero rate trusts the stored zero band (A, C or D) and falls back to exempt.
 */
declare function taxBandFor(stored: string | null | undefined, rate: number): TaxBand;
/** Separates an amount into taxable value, VAT and gross at rate percent, each rounded to 2dp. */
declare function splitTax(amount: number, rate: number, inclusive: boolean): {
    net: number;
    tax: number;
    gross: number;
};
/** Resolves a percentage discount against a base, rounded to 2dp. */
declare function percentOf(base: number, percent: number): number;
/** Works out every line and the document totals. See the file header for the rules. */
declare function computeTax(doc: TaxDocument): TaxResult;

export { type DiscountBase, TAX_BANDS, TAX_BAND_LABELS, type TaxBand, type TaxBandTotal, type TaxDocument, type TaxLine, type TaxLineResult, type TaxResult, computeTax, parseTaxBand, percentOf, roundMoney, splitAmount, splitTax, taxBandFor };
