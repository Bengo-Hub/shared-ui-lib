import { type Country, isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';

/**
 * True when value is a complete, real phone number (libphonenumber rules for its country),
 * e.g. "+254743793901". Use it to validate what PhoneInputField emits before a form submits.
 */
export function isValidPhone(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
}

/**
 * Repairs the three ways people mistype a number in the field with its fixed "+254" prefix:
 * typing the country code again ("+254 254 743 793 901"), keeping the national 0
 * ("+254 0743 793 901"), or pasting a local number over the whole field ("0743793901", which the
 * field shows as "+0743793901"; read in defaultCountry). Returns the corrected E.164 number (a
 * valid number in its canonical form), or the value unchanged when it cannot be repaired.
 */
export function repairPhoneNumber(value: string, defaultCountry?: Country): string {
  if (!value || !value.startsWith('+')) return value;
  if (defaultCountry && value.startsWith('+0')) {
    try {
      const local = parsePhoneNumber(value.slice(1), defaultCountry);
      if (local?.isValid()) return local.number;
    } catch {
      // not a complete local number yet
    }
  }
  try {
    const parsed = parsePhoneNumber(value);
    if (!parsed) return value;
    if (parsed.isValid()) return parsed.number;
    const code = parsed.countryCallingCode;
    const national = parsed.nationalNumber;
    const candidates: string[] = [];
    if (national.startsWith(code)) candidates.push(`+${national}`);
    if (national.startsWith('0')) candidates.push(`+${code}${national.replace(/^0+/, '')}`);
    for (const c of candidates) {
      if (isValidPhone(c)) return c;
    }
  } catch {
    // not a parseable number yet (still being typed)
  }
  return value;
}
