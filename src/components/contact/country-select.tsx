'use client';

import { useMemo } from 'react';
import { SearchableCombobox, type ComboboxOption } from '../combobox/searchable-combobox';
import { listCountries } from './country-list';
import { FlagIcon } from './flag-icon';

export interface CountrySelectProps {
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
export function CountrySelect({
  value,
  onChange,
  placeholder = 'Select a country…',
  searchPlaceholder = 'Search countries…',
  disabled,
  className,
}: CountrySelectProps) {
  const options = useMemo<ComboboxOption[]>(
    () => listCountries().map((c) => ({ value: c.code, label: c.name, icon: <FlagIcon code={c.code} /> })),
    []
  );

  const isKnown = value ? options.some((o) => o.value === value) : false;

  return (
    <SearchableCombobox
      options={options}
      value={value}
      onChange={onChange}
      valueLabel={value && !isKnown ? value : undefined}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText="No countries match"
      disabled={disabled}
      clearable={false}
      className={className}
    />
  );
}
