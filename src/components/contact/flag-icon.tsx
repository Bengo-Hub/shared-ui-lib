import flags from 'react-phone-number-input/flags';
import type { Country } from 'react-phone-number-input';

export interface FlagIconProps {
  code: string;
  className?: string;
}

/** Small flag icon for a country code, reusing react-phone-number-input's own flag SVGs. */
export function FlagIcon({ code, className }: FlagIconProps) {
  const Flag = flags[code as Country];
  return (
    <span
      className={
        className ?? 'inline-flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[2px] ring-1 ring-black/10'
      }
    >
      {Flag ? <Flag title={code} /> : <span className="h-full w-full bg-muted" />}
    </span>
  );
}
