/**
 * The orange the company name is set in on the PoweredByBadge. The brand orange (#E8631E) reaches
 * only 3.4:1 on a white or cream card, under the 4.5:1 small text needs, so light themes get a
 * deeper shade of it and dark themes keep the brand orange. Shipped as a scoped style, so it works
 * in apps whose Tailwind build does not scan this library.
 */
export const BRAND_ORANGE = '#E8631E';
export const BRAND_ORANGE_ON_LIGHT = '#B84A12';

export const NAME_CLASS = 'cvx-powered-by-name';
export const NAME_STYLE =
  `.${NAME_CLASS}{color:${BRAND_ORANGE_ON_LIGHT}}` +
  `.dark .${NAME_CLASS},[data-theme="dark"] .${NAME_CLASS}{color:${BRAND_ORANGE}}`;

/** WCAG 2 contrast ratio of two #RRGGBB colours. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
