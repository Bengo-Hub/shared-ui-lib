import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';

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
 * Repairs the two ways people mistype a number after the field's fixed "+254" prefix:
 * typing the country code again ("+254 254 743 793 901") or keeping the national 0
 * ("+254 0743 793 901"). Returns the corrected E.164 number (a valid number in its canonical
 * form), or the value unchanged when it cannot be repaired into a valid number.
 */
export function repairPhoneNumber(value: string): string {
  if (!value || !value.startsWith('+')) return value;
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
