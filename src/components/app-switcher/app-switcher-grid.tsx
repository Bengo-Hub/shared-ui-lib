'use client';

import type { ServiceAccent } from './service-registry';
import type { VisibleService } from './use-visible-services';

/**
 * Icon-grid presentation of useVisibleServices()'s output — the "SERVICES"
 * profile-menu content every *-ui currently hand-rolls as its own vertical
 * list (pos-ui/inventory-ui/treasury-ui/logistics-ui/library-ui/hospital-ui
 * header.tsx, byte-for-byte duplicated). Grouped by category and given a
 * distinct accent color per service — Zoho's own app-switcher groups by
 * category and colors each tile; this is the same idea scaled to this
 * platform's real ~17-service suite, not a copy of Zoho's ~50-app grid.
 *
 * Ships raw Tailwind semantic-token classNames like the rest of
 * shared-ui-lib — no CSS pipeline, no portal/popover dependency, works on
 * any host (Radix-based shadcn or @base-ui).
 *
 * Purely presentational: fetch/filter via useVisibleServices first, then
 * pass the result here. `onNavigate` fires on any click (link or disabled
 * coming-soon cell) — typically used to close the parent menu/panel.
 */
export interface AppSwitcherGridProps {
  services: VisibleService[];
  /** Called after a live service link is clicked (e.g. to close a menu). */
  onNavigate?: () => void;
  /** Shown above the grid — defaults to a Codevertex-branded eyebrow label.
   * Pass an empty string to suppress the header entirely (e.g. when embedding
   * this inside another surface, like AccountPanel, that already has its own heading). */
  label?: string;
  className?: string;
}

const ACCENT_CLASSES: Record<ServiceAccent, string> = {
  violet: 'bg-violet-500/10 text-violet-600 group-hover:bg-violet-500/15 dark:text-violet-400',
  blue: 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/15 dark:text-blue-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/15 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/15 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 group-hover:bg-rose-500/15 dark:text-rose-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-500/15 dark:text-cyan-400',
  fuchsia: 'bg-fuchsia-500/10 text-fuchsia-600 group-hover:bg-fuchsia-500/15 dark:text-fuchsia-400',
};

// As many columns as fit the PANEL (not the viewport): four in the wide drawer, three in the profile
// panel, two or three on a phone. Inline because the host's Tailwind resolves the classes, and an
// auto-fill arbitrary value is easy for a host build to miss. 5.75rem holds the longest single word
// ("Subscriptions", "Procurement") at text-xs, so labels wrap between words and never overlap.
const GRID_STYLE = { gridTemplateColumns: 'repeat(auto-fill, minmax(min(5.75rem, 100%), 1fr))' } as const;

/** "Treasury (Accounting & Ledgers)" as a name and a smaller line under it. */
function TileLabel({ label }: { label: string }) {
  const m = /^(.+?)\s*\((.+)\)$/.exec(label);
  return (
    <span className="w-full break-words text-xs font-semibold leading-tight text-foreground">
      {m ? m[1] : label}
      {m && <span className="mt-0.5 block text-[10px] font-medium leading-tight text-muted-foreground">{m[2]}</span>}
    </span>
  );
}

function LockedTile({
  label,
  href,
  Icon,
  accent,
  onNavigate,
}: {
  label: string;
  href: string | null;
  Icon: VisibleService['Icon'];
  accent: string;
  onNavigate?: () => void;
}) {
  const body = (
    <>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl opacity-60 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <TileLabel label={label} />
      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
        Not in your plan
      </span>
    </>
  );
  const cls = 'flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center';
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} title={`${label} is not in your plan. Open plans.`} className={`${cls} transition-colors hover:bg-secondary`}>
      {body}
    </a>
  ) : (
    <div className={`${cls} opacity-70`} title={`${label} is not in your plan`}>
      {body}
    </div>
  );
}

function groupByCategory(services: VisibleService[]): [string, VisibleService[]][] {
  const groups = new Map<string, VisibleService[]>();
  for (const svc of services) {
    const list = groups.get(svc.category) ?? [];
    list.push(svc);
    groups.set(svc.category, list);
  }
  return Array.from(groups.entries());
}

export function AppSwitcherGrid({ services, onNavigate, label, className }: AppSwitcherGridProps) {
  if (services.length === 0) return null;

  return (
    <div className={className}>
      {label !== '' && (
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {label ?? 'Codevertex Suite'}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {groupByCategory(services).map(([category, items]) => (
          <div key={category}>
            <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {category}
            </p>
            <div className="grid gap-1.5" style={GRID_STYLE}>
              {items.map(({ key, label: svcLabel, href, Icon, status, color, locked }) =>
                locked ? (
                  <LockedTile key={key} label={svcLabel} href={href} Icon={Icon} accent={ACCENT_CLASSES[color]} onNavigate={onNavigate} />
                ) : href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onNavigate}
                    // min-w-0: grid items default to min-width:auto, which sizes them to fit
                    // their content WITHOUT wrapping — a longer label like "Online Store"
                    // forced its column past its 1fr share and overflowed the grid's right
                    // edge instead of wrapping, on any host narrow enough for that to matter
                    // (e.g. AccountPanel's full-width mobile drawer, ~384px, not just the
                    // anchored-popover case the fixed grid-cols-4 above was reasoned for).
                    className="group flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors hover:bg-secondary"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${ACCENT_CLASSES[color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <TileLabel label={svcLabel} />
                  </a>
                ) : (
                  <div
                    key={key}
                    className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center opacity-50"
                    title={status === 'coming-soon' ? `${svcLabel} — coming soon` : svcLabel}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ACCENT_CLASSES[color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <TileLabel label={svcLabel} />
                    {status === 'coming-soon' && (
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
