import { getCountries, type Country } from 'react-phone-number-input';

let regionNames: Intl.DisplayNames | null | undefined;

/** Display name for an ISO 3166-1 alpha-2 code (e.g. "KE" -> "Kenya"). */
export function countryName(iso: string): string {
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {
      regionNames = null;
    }
  }
  return regionNames?.of(iso) ?? iso;
}

export interface CountryEntry {
  code: Country;
  name: string;
}

/**
 * Every ISO 3166-1 alpha-2 region react-phone-number-input knows about, sorted
 * by display name — the single country list backing both CountrySelect and
 * PhoneInputField's country-code picker, so the two are always in sync.
 */
export function listCountries(): CountryEntry[] {
  return getCountries()
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
