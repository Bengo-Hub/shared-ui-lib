'use client';

/**
 * Outlet/branch selection card for the PIN-login outlet step. Generalized from pos-ui's original
 * (which was the most complete — use-case colour/icon theming) so Library/Inventory get the same
 * card without needing their own use_case concept: the theming maps are optional lookups that
 * fall back to a neutral Building2 badge when an outlet has no use_case.
 */

import React from 'react';
import {
  BedDouble, Building2, ChevronRight, Coffee, Pill, Scissors,
  ShoppingBag, Truck, UtensilsCrossed, Warehouse, Wine, Zap,
} from 'lucide-react';
import { cx } from '../data-table/types';
import type { BrandIcon, PinLoginOutlet } from './types';

export const USE_CASE_LABELS: Record<string, string> = {
  hospitality:   'Hospitality',
  quick_service: 'Quick Service',
  retail:        'Retail',
  pharmacy:      'Pharmacy',
  services:      'Services',
  cafe:          'Café',
  bar:           'Bar',
  hotel:         'Hotel',
  warehouse:     'Warehouse',
};

export const USE_CASE_COLORS: Record<string, { bg: string; text: string; accent: string; glow: string }> = {
  hospitality:   { bg: 'bg-amber-500/20',   text: 'text-amber-300',   accent: '#f59e0b', glow: 'hover:shadow-amber-500/15' },
  quick_service: { bg: 'bg-blue-500/20',    text: 'text-blue-300',    accent: '#3b82f6', glow: 'hover:shadow-blue-500/15' },
  retail:        { bg: 'bg-violet-500/20',  text: 'text-violet-300',  accent: '#8b5cf6', glow: 'hover:shadow-violet-500/15' },
  pharmacy:      { bg: 'bg-emerald-500/20', text: 'text-emerald-300', accent: '#10b981', glow: 'hover:shadow-emerald-500/15' },
  services:      { bg: 'bg-teal-500/20',    text: 'text-teal-300',    accent: '#14b8a6', glow: 'hover:shadow-teal-500/15' },
  cafe:          { bg: 'bg-orange-500/20',  text: 'text-orange-300',  accent: '#f97316', glow: 'hover:shadow-orange-500/15' },
  bar:           { bg: 'bg-purple-500/20',  text: 'text-purple-300',  accent: '#a855f7', glow: 'hover:shadow-purple-500/15' },
  hotel:         { bg: 'bg-sky-500/20',     text: 'text-sky-300',     accent: '#0ea5e9', glow: 'hover:shadow-sky-500/15' },
  warehouse:     { bg: 'bg-slate-500/20',   text: 'text-slate-300',   accent: '#94a3b8', glow: 'hover:shadow-slate-500/15' },
  logistics:     { bg: 'bg-cyan-500/20',    text: 'text-cyan-300',    accent: '#06b6d4', glow: 'hover:shadow-cyan-500/15' },
};

export const USE_CASE_ICONS: Record<string, BrandIcon> = {
  hospitality:   UtensilsCrossed,
  quick_service: Zap,
  retail:        ShoppingBag,
  pharmacy:      Pill,
  services:      Scissors,
  cafe:          Coffee,
  bar:           Wine,
  hotel:         BedDouble,
  warehouse:     Warehouse,
  logistics:     Truck,
};

export function OutletCard({
  outlet, index, onSelect,
}: {
  outlet: PinLoginOutlet;
  index: number;
  onSelect: () => void;
}) {
  const color = (outlet.use_case ? USE_CASE_COLORS[outlet.use_case] : null) ?? {
    bg: 'bg-slate-500/20', text: 'text-slate-300', accent: '#94a3b8', glow: 'hover:shadow-slate-500/15',
  };
  const label = outlet.use_case ? (USE_CASE_LABELS[outlet.use_case] ?? outlet.use_case) : null;
  const OutletIcon: BrandIcon = (outlet.use_case ? USE_CASE_ICONS[outlet.use_case] : undefined) ?? Building2;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        'group relative flex flex-col text-left rounded-2xl border overflow-hidden',
        'bg-card border-border',
        'hover:border-primary/40',
        'shadow-sm hover:shadow-lg',
        'active:scale-[0.97] transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
      )}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5 opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${color.accent}, transparent)` }}
      />
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center border transition-colors duration-200"
            style={{ background: `${color.accent}14`, borderColor: `${color.accent}33` }}
          >
            <OutletIcon className={cx('h-5 w-5 transition-transform duration-200 group-hover:scale-110', color.text)} />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {outlet.is_hq && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-muted text-muted-foreground uppercase tracking-widest">HQ</span>
            )}
            {label && (
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{ background: `${color.accent}1a`, color: color.accent }}
              >
                {label}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="font-bold text-foreground text-sm sm:text-base leading-snug transition-colors">
            {outlet.name}
          </p>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0 mb-0.5" />
        </div>
      </div>
    </button>
  );
}
