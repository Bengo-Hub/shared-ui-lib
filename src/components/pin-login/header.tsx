'use client';

/**
 * PinLoginHeader — top identity bar for the PIN-login screen.
 *
 * Layout (per the platform's shared design): service eyebrow ("Codevertex POS" / "Codevertex
 * Library" / "Codevertex Inventory" / ...) → big tenant name → outlet/branch name with a clearly
 * visible "Switch" button right beside it (not a small link below), plus an optional right-side
 * slot for a clock/offline pill/settings gear that each app already owns.
 */

import React from 'react';
import { Building2, ChevronRight, WifiOff } from 'lucide-react';
import { cx } from '../data-table/types';

export interface PinLoginHeaderProps {
  /** "Codevertex POS" / "Codevertex Library" / "Codevertex Inventory" / etc. */
  serviceName: string;
  tenantName: string;
  outletName?: string;
  isHQ?: boolean;
  showSwitchOutlet?: boolean;
  onSwitchOutlet?: () => void;
  isOnline?: boolean;
  /** Clock / settings-gear / other app-owned controls, right-aligned. */
  rightSlot?: React.ReactNode;
  className?: string;
}

export function PinLoginHeader({
  serviceName, tenantName, outletName, isHQ, showSwitchOutlet, onSwitchOutlet,
  isOnline = true, rightSlot, className,
}: PinLoginHeaderProps) {
  return (
    <div className={cx('relative z-10 px-5 sm:px-8 pt-5 pb-4 shrink-0', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/65">
            {serviceName}
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight truncate">
            {tenantName}
          </h1>
          {(outletName || showSwitchOutlet) && (
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              {outletName && (
                <span className="text-sm font-semibold text-white/85 truncate max-w-[16rem]">
                  {outletName}
                </span>
              )}
              {isHQ && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white ring-1 ring-inset ring-white/20">
                  <Building2 className="h-2.5 w-2.5" />HQ
                </span>
              )}
              {showSwitchOutlet && onSwitchOutlet && (
                <button
                  type="button"
                  onClick={onSwitchOutlet}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/12 hover:bg-white/20 ring-1 ring-inset ring-white/25 text-[11px] font-bold text-white transition-colors"
                >
                  Switch
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isOnline && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-400/20 ring-1 ring-inset ring-amber-200/40 text-amber-100 text-[11px] font-semibold">
              <WifiOff className="h-3 w-3" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}
          {rightSlot}
        </div>
      </div>
    </div>
  );
}
