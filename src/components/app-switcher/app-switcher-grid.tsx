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
            {/* Fixed column count (not a viewport-width breakpoint): this grid always renders
                inside a narrow anchored panel/popover regardless of the host window's size, so a
                `sm:` breakpoint keyed off viewport width — not the panel's own width — produced
                an inconsistent column count in practice. */}
            <div className="grid grid-cols-4 gap-1.5">
              {items.map(({ key, label: svcLabel, href, Icon, status, color }) =>
                href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onNavigate}
                    className="group flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors hover:bg-secondary"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${ACCENT_CLASSES[color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold leading-tight text-foreground">{svcLabel}</span>
                  </a>
                ) : (
                  <div
                    key={key}
                    className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center opacity-50"
                    title={status === 'coming-soon' ? `${svcLabel} — coming soon` : svcLabel}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ACCENT_CLASSES[color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold leading-tight text-foreground">{svcLabel}</span>
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
