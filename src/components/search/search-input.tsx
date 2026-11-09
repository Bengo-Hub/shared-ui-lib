'use client';

import { forwardRef } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import type { DebouncedSearch } from './use-debounced';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface SearchInputProps {
  /** The object returned by `useDebouncedSearch()`. */
  search: DebouncedSearch;
  /** Show the spinner, e.g. `query.isFetching`. The spinner also shows while the pause runs. */
  busy?: boolean;
  placeholder?: string;
  /** Accessible name. Defaults to the placeholder. */
  label?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  /** Extra control at the right edge, such as a scan button. */
  endAdornment?: React.ReactNode;
  /** Called after Enter has flushed the search (e.g. pick the single exact barcode match). */
  onSubmit?: (term: string) => void;
}

/**
 * The standard search box: search icon, clear button and a small spinner while waiting.
 * Plain theme tokens only, resolved by the host app's Tailwind build.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { search, busy, placeholder = 'Search…', label, autoFocus, disabled, className, inputClassName, endAdornment, onSubmit },
  ref,
) {
  const { inputProps, value, clear, isDebouncing } = search;
  const showSpinner = Boolean(busy) || (isDebouncing && value.trim() !== '');
  return (
    <div className={cx('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={ref}
        type="search"
        role="searchbox"
        aria-label={label ?? placeholder}
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        {...inputProps}
        onKeyDown={(e) => {
          inputProps.onKeyDown(e);
          if (e.key === 'Enter' && !e.nativeEvent.isComposing && onSubmit) {
            onSubmit(e.currentTarget.value.trim());
          }
        }}
        className={cx(
          'w-full rounded-lg border border-input bg-background py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60 [&::-webkit-search-cancel-button]:hidden',
          endAdornment ? 'pr-20' : 'pr-14',
          inputClassName,
        )}
      />
      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {showSpinner && <Loader2 aria-hidden className="h-4 w-4 animate-spin text-muted-foreground" />}
        {value && !disabled && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {endAdornment}
      </div>
    </div>
  );
});
