import { C as ComboboxOption } from '../../searchable-combobox-DVA5iCiB.cjs';
export { S as SearchableCombobox, a as SearchableComboboxProps } from '../../searchable-combobox-DVA5iCiB.cjs';
import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * MultiSelectCombobox — the platform's canonical chip-based multi-select, for picking several
 * values from a fixed, real option list (no free-text fallback — the point of this control is to
 * replace a comma-separated guess-the-value text input with a validated selection). Selected
 * options render as removable chips on the trigger; the panel stays open across multiple picks so
 * a user can select/deselect several options in one pass.
 *
 * Shares `SearchableCombobox`'s `position: fixed`-off-the-trigger's-own-rect panel technique (an
 * inline `absolute` panel gets clipped by any `overflow-hidden`/`overflow-y-auto` ancestor — a
 * Card, a scrollable modal body) but keeps its own copy of that logic rather than importing it,
 * matching that file's own documented reasoning: these two controls' consumers are different
 * enough that sharing internals risks one's future change breaking the other's very different
 * callers.
 */
interface MultiSelectComboboxProps {
    /** The full, real option list — every value here is one the receiving system actually accepts. */
    options: ComboboxOption[];
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    /** Action row pinned under the list (e.g. "+ Add new") — host owns the dialog. */
    footer?: React.ReactNode;
}
declare function MultiSelectCombobox({ options, values, onChange, placeholder, searchPlaceholder, emptyText, disabled, className, footer, }: MultiSelectComboboxProps): react_jsx_runtime.JSX.Element;

export { ComboboxOption, MultiSelectCombobox, type MultiSelectComboboxProps };
