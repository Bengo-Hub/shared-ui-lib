'use client';

import { useEffect, useState } from 'react';
import PhoneInput, { type Country, parsePhoneNumber } from 'react-phone-number-input';
import './phone-input.css';
import { repairPhoneNumber } from './phone-number';

type Flags = typeof import('react-phone-number-input/flags').default;

let loadedFlags: Flags | undefined;
let flagsLoading: Promise<Flags> | undefined;

function loadFlags(): Promise<Flags> {
  flagsLoading ??= import('react-phone-number-input/flags')
    .then((m) => (loadedFlags = m.default))
    .catch((err) => {
      flagsLoading = undefined; // the next field tries again
      throw err;
    });
  return flagsLoading;
}

/**
 * The library's default flag is an <img> from a third-party site, which a strict CSP blocks (a
 * broken image) and which tells that site every visitor's IP. These are the same flags from the
 * package itself, in their own chunk loaded when a phone field first mounts, so a page without a
 * phone field never pays for them. Until they arrive, or if they fail, the slot stays empty and
 * the number field works as usual.
 */
function LocalFlag({ country, countryName }: { country: Country; countryName: string }) {
  const [flags, setFlags] = useState(loadedFlags);
  useEffect(() => {
    if (flags) return;
    let live = true;
    loadFlags().then(
      (f) => {
        if (live) setFlags(f);
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, [flags]);
  const Flag = flags?.[country];
  return Flag ? <Flag title={countryName} /> : <span aria-hidden="true" />;
}

export interface PhoneInputFieldProps {
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
export function PhoneInputField({
  value,
  onChange,
  placeholder = 'e.g. 743 793 901',
  disabled,
  className,
  defaultCountry = 'KE',
  id,
}: PhoneInputFieldProps) {
  // A legacy free-text value with no leading "+" (e.g. "0743793901") can't be
  // attributed to any country by the library, so it renders as a generic
  // "International" placeholder instead of the right flag. Try once, on
  // mount, to reinterpret it as a NATIONAL number for defaultCountry and
  // upgrade it to real E.164 — after that this is a normal controlled input,
  // so it never fights the user's typing.
  const [displayValue, setDisplayValue] = useState<string | undefined>(() => {
    if (value && !value.startsWith('+')) {
      try {
        const parsed = parsePhoneNumber(value, defaultCountry);
        if (parsed?.isValid()) return parsed.number;
      } catch {
        // fall through — show the raw value as-is
      }
    }
    return value;
  });

  // The lazy initializer above only fixes what's DISPLAYED — if the parent's
  // form state still holds the raw legacy value (e.g. the user hits "Save"
  // without ever touching this field), it would resubmit the un-normalized
  // string, which the server correctly rejects (no country code to parse
  // from). Sync the upgraded value up once, immediately after mount.
  useEffect(() => {
    if (displayValue && displayValue !== value) {
      onChange(displayValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PhoneInput
      id={id}
      international
      defaultCountry={defaultCountry}
      flagComponent={LocalFlag}
      value={displayValue}
      onChange={(v) => {
        // "+254 254 7...", "+254 07..." or a pasted "07..." becomes the real number once complete.
        const fixed = v ? repairPhoneNumber(v, defaultCountry) : v;
        setDisplayValue(fixed);
        onChange(fixed ?? '');
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
