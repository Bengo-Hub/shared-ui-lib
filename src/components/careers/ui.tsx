// Reusable, self-contained UI primitives for the public careers portal. No app providers,
// no shadcn — plain Tailwind v4 + inline brand CSS variables so these components stand alone
// in any host app (they only require Tailwind utility classes to be present in the build).

import { displayCompanyName } from './branding';
import type { PublicBranding } from './api';

// ---------------------------------------------------------------------------
// Date / label formatting
// ---------------------------------------------------------------------------

export function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function humanize(value?: string): string {
  if (!value) return '';
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Chips / badges (capsule pills)
// ---------------------------------------------------------------------------

export function Chip({
  children,
  tone = 'neutral',
  title,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand';
  title?: string;
}) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium leading-5';
  if (tone === 'brand') {
    return (
      <span title={title} className={base} style={{ background: 'var(--brand-primary-soft)', color: 'var(--brand-secondary)' }}>
        {children}
      </span>
    );
  }
  return (
    <span title={title} className={`${base} bg-slate-100 text-slate-700`}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Inline icons (Lucide-style strokes, 16px) — no emoji
// ---------------------------------------------------------------------------

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const IconPin = () => (
  <svg {...iconProps}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
export const IconBriefcase = () => (
  <svg {...iconProps}>
    <rect width="20" height="14" x="2" y="7" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
export const IconClock = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
export const IconUsers = () => (
  <svg {...iconProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
export const IconLayers = () => (
  <svg {...iconProps}>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);
export const IconSearch = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
export const IconArrowLeft = () => (
  <svg {...iconProps}>
    <path d="m12 19-7-7 7-7M19 12H5" />
  </svg>
);
export const IconArrowRight = () => (
  <svg {...iconProps}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
export const IconCheck = () => (
  <svg {...iconProps} width={20} height={20}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// ---------------------------------------------------------------------------
// Company header (hero)
// ---------------------------------------------------------------------------

export function CompanyHeader({
  branding,
  orgSlug,
  subtitle,
}: {
  branding: PublicBranding | null;
  orgSlug: string;
  subtitle?: string;
}) {
  const name = displayCompanyName(branding, orgSlug);
  const logo = branding?.logo_url;
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <header
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--brand-secondary) 0%, color-mix(in srgb, var(--brand-secondary) 78%, var(--brand-primary)) 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: 'var(--brand-primary)' }}
      />
      <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-5 px-4 py-12 sm:flex-row sm:items-center sm:py-16">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/20 sm:h-20 sm:w-20">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={`${name} logo`} className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>
              {initials || '•'}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Careers</p>
          <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">{name}</h1>
          <p className="mt-1.5 max-w-xl text-sm text-white/75 sm:text-base">{subtitle ?? "Join our team and help build what's next."}</p>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export function PortalFooter({ name, poweredByHref }: { name: string; poweredByHref?: string }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {name}.{' '}
        {poweredByHref ? (
          <a href={poweredByHref} className="hover:text-slate-500" target="_blank" rel="noopener noreferrer">
            Powered by Codevertex
          </a>
        ) : (
          'Powered by Codevertex'
        )}
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

export function BrandButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{
        background: 'var(--brand-primary)',
        color: 'var(--brand-on-primary)',
        ['--tw-ring-color' as string]: 'var(--brand-primary-ring)',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
