import * as react_jsx_runtime from 'react/jsx-runtime';
import { Country } from 'react-phone-number-input';

interface PhoneInputFieldProps {
    /** E.164 value, e.g. "+254743793901". */
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    /** ISO 3166-1 alpha-2 code assumed for national-format input/legacy values. Default "KE". */
    defaultCountry?: Country;
    id?: string;
}
/**
 * Country-flag + calling-code phone input (react-phone-number-input, built on
 * Google's libphonenumber). Always emits E.164 (e.g. "+254743793901") — the
 * canonical shape to validate/store server-side (see auth-api's
 * UpdateMyProfile/AddMyPhone for the reference validation using
 * github.com/nyaruka/phonenumbers, the Go port of the same library).
 *
 * Requires the host app to import '@bengo-hub/shared-ui-lib/contact/style.css'
 * once — this library ships no CSS pipeline of its own; the stylesheet is
 * plain CSS keyed off the HOST's own shadcn-style tokens (--border,
 * --background, --foreground, --ring, --muted-foreground), not Tailwind
 * classes, so no class-scanning is needed.
 */
declare function PhoneInputField({ value, onChange, placeholder, disabled, className, defaultCountry, id, }: PhoneInputFieldProps): react_jsx_runtime.JSX.Element;

/**
 * True when value is a complete, real phone number (libphonenumber rules for its country),
 * e.g. "+254743793901". Use it to validate what PhoneInputField emits before a form submits.
 */
declare function isValidPhone(value: string | null | undefined): boolean;
/**
 * Repairs the three ways people mistype a number in the field with its fixed "+254" prefix:
 * typing the country code again ("+254 254 743 793 901"), keeping the national 0
 * ("+254 0743 793 901"), or pasting a local number over the whole field ("0743793901", which the
 * field shows as "+0743793901"; read in defaultCountry). Returns the corrected E.164 number (a
 * valid number in its canonical form), or the value unchanged when it cannot be repaired.
 */
declare function repairPhoneNumber(value: string, defaultCountry?: Country): string;

interface CountrySelectProps {
    /** ISO 3166-1 alpha-2 code, e.g. "KE". */
    value?: string;
    onChange: (isoCode: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
}
/**
 * ISO 3166-1 alpha-2 country picker with real flag icons — built on the
 * platform's SearchableCombobox (no portal/popover dependency, works on any
 * Tailwind v4 / @base-ui host), so it shares its search/keyboard/click-outside
 * behavior instead of reimplementing a dropdown. Reuses the exact same
 * country list as PhoneInputField's country-code picker.
 *
 * A legacy free-text value (e.g. "Kenya" instead of "KE") won't match any
 * option and is shown via `valueLabel` as the closed-state label rather than
 * silently looking unselected — pick a real country to upgrade it.
 */
declare function CountrySelect({ value, onChange, placeholder, searchPlaceholder, disabled, className, }: CountrySelectProps): react_jsx_runtime.JSX.Element;

interface FlagIconProps {
    code: string;
    className?: string;
}
/** Small flag icon for a country code, reusing react-phone-number-input's own flag SVGs. */
declare function FlagIcon({ code, className }: FlagIconProps): react_jsx_runtime.JSX.Element;

/** Display name for an ISO 3166-1 alpha-2 code (e.g. "KE" -> "Kenya"). */
declare function countryName(iso: string): string;
interface CountryEntry {
    code: Country;
    name: string;
}
/**
 * Every ISO 3166-1 alpha-2 region react-phone-number-input knows about, sorted
 * by display name — the single country list backing both CountrySelect and
 * PhoneInputField's country-code picker, so the two are always in sync.
 */
declare function listCountries(): CountryEntry[];

export { type CountryEntry, CountrySelect, type CountrySelectProps, FlagIcon, type FlagIconProps, PhoneInputField, type PhoneInputFieldProps, countryName, isValidPhone, listCountries, repairPhoneNumber };
