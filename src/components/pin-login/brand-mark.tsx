'use client';

/**
 * Codevertex platform brand mark + generic workflow illustration for the PIN-login brand panel.
 * Renders on the brand-tinted (dark) panel alongside the tenant's own logo — small, "powered by"
 * scale, never competing with the tenant's identity which stays the visually dominant element.
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { WorkflowStep } from './types';

/** Abstract "C" monogram + wordmark — theme-aware (currentColor), sized for a quiet footer lockup. */
export function CodevertexMark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <svg viewBox="0 0 32 32" className="h-5 w-5 shrink-0" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="9" fill="currentColor" opacity="0.14" />
        <path
          d="M22 11.5a7 7 0 1 0 0 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="23" cy="16" r="1.8" fill="currentColor" />
      </svg>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Codevertex</span>
    </div>
  );
}

/**
 * A row of icon "nodes" connected by arrows — a high-level, use-case-agnostic overview of the
 * common flow (e.g. Select Outlet → Enter PIN → Start Work). Each consuming app supplies its own
 * icons/labels via `steps` so the illustration reads correctly for POS/Library/Inventory/etc.
 */
export function WorkflowIllustration({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="flex items-start justify-center gap-1 sm:gap-2">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5 w-16 sm:w-20">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/10 ring-1 ring-inset ring-white/15 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white/85" />
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-wide text-white/55 text-center leading-tight">
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 text-white/25 shrink-0 mt-2.5" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
