/**
 * Placement for dropdown panels that stay inline in the DOM (no portal) but must escape clipping
 * ancestors with `position: fixed`.
 *
 * Why inline: inside a @base-ui Dialog or Sheet, a panel portalled to <body> counts as "outside"
 * the popup, so clicking an option closes the dialog and the focus trap fights the search input.
 *
 * Why this helper: `position: fixed` is only relative to the viewport when no ancestor creates a
 * containing block. A centred dialog does (`transform: translate(-50%, -50%)`), and so do
 * filter, backdrop-filter, perspective, will-change, contain and container-type. Inside one, a
 * panel placed at viewport coordinates lands offset by the dialog's own position: far right and
 * low, partly off screen (maskani-ui Assign staff, 2026-10-09). The fix subtracts the containing
 * block's origin, then keeps the panel inside the viewport and flips it above the trigger when
 * there is more room there.
 */

export interface PanelPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

const GAP = 4;
const MARGIN = 8;

function makesContainingBlock(el: Element): boolean {
  const s = getComputedStyle(el);
  if (s.transform !== 'none' || s.perspective !== 'none' || s.filter !== 'none') return true;
  const backdrop = (s as CSSStyleDeclaration & { backdropFilter?: string }).backdropFilter;
  if (backdrop && backdrop !== 'none') return true;
  if (/transform|perspective|filter/.test(s.willChange)) return true;
  if (/paint|layout|strict|content/.test(s.contain)) return true;
  const containerType = (s as CSSStyleDeclaration & { containerType?: string }).containerType;
  return !!containerType && containerType !== 'normal';
}

/** The nearest ancestor that fixed-position descendants are placed against, or null for the viewport. */
export function fixedContainingBlock(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    if (makesContainingBlock(node)) return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * Converts a viewport point into the frame a `position: fixed` element inside `anchor`'s tree is
 * placed in (a transformed dialog, say). Use it when the caller computes its own placement.
 */
export function toFixedFrame(anchor: HTMLElement, top: number, left: number): { top: number; left: number } {
  const cb = fixedContainingBlock(anchor);
  if (!cb) return { top, left };
  const c = cb.getBoundingClientRect();
  return { top: top - c.top - cb.clientTop + cb.scrollTop, left: left - c.left - cb.clientLeft + cb.scrollLeft };
}

/**
 * Where to put a `position: fixed` panel under (or above) its trigger.
 *
 * @param anchor the trigger element
 * @param preferredHeight roughly how tall the open panel is (search row plus list)
 * @param minWidth the panel is at least this wide even under a narrow trigger
 */
export function fixedPanelPosition(anchor: HTMLElement, preferredHeight: number, minWidth = 0): PanelPosition {
  const r = anchor.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const width = Math.min(Math.max(r.width, minWidth), vw - MARGIN * 2);
  const left = Math.min(Math.max(r.left, MARGIN), vw - width - MARGIN);

  const below = vh - r.bottom - GAP - MARGIN;
  const above = r.top - GAP - MARGIN;
  const openAbove = below < Math.min(preferredHeight, 240) && above > below;
  const maxHeight = Math.max(160, openAbove ? above : below);
  const height = Math.min(preferredHeight, maxHeight);
  const top = openAbove ? r.top - GAP - height : r.bottom + GAP;

  // Viewport coordinates, shifted into the containing block's frame when there is one.
  return { ...toFixedFrame(anchor, top, left), width, maxHeight };
}
