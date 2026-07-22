'use client';

/** Floating "Demo PINs" panel — shown only on demo tenants. Generalized from pos-ui's original. */

import React from 'react';
import type { DemoHint } from './types';

export function DemoHints({ title = 'Demo PINs', subtitle, hints }: {
  title?: string;
  subtitle?: string | null;
  hints: DemoHint[];
}) {
  if (hints.length === 0) return null;
  return (
    <div className="absolute bottom-4 right-4 z-30 hidden sm:block">
      <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-lg p-3 max-w-[220px]">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
        {subtitle && (
          <p className="text-[8px] text-muted-foreground/70 uppercase tracking-wider mb-2">{subtitle}</p>
        )}
        <div className="grid grid-cols-2 gap-1">
          {hints.map(({ pin, role, accent }) => (
            <div key={pin} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: `${accent}14` }}>
              <span className="font-mono text-[11px] font-black" style={{ color: accent }}>{pin}</span>
              <span className="text-[10px] text-muted-foreground truncate">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
