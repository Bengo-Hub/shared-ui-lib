'use client';

/**
 * PinLoginBrandPanel — the left-side brand column (large screens only; collapses to just the
 * header identity on small screens where space is tight).
 *
 * Per the shared design: the TENANT's own logo is shown large with no background box, so it
 * blends into the brand-tinted panel instead of sitting in a white card — the tenant's brand
 * should read as prominent and native to the page. Below it, a quiet Codevertex "powered by"
 * mark plus a generic arrow-linked workflow illustration (Select outlet → Enter PIN → Start
 * work) gives new staff an at-a-glance overview of the login flow.
 */

import React from 'react';
import { WorkflowIllustration } from './brand-mark';
import type { WorkflowStep } from './types';

/** The Codevertex Africa Limited platform's own public logo (accounts/auth-ui hosted) — the same
 *  asset used platform-wide, not tenant-specific, so it's a stable default here. */
const CODEVERTEX_LOGO_URL = 'https://accounts.codevertexitsolutions.com/images/logo/codevertex.png';

export interface PinLoginBrandPanelProps {
  tenantName: string;
  tenantLogoUrl?: string | null;
  workflowSteps: WorkflowStep[];
  /** Override the platform "Powered by" logo (defaults to the Codevertex Africa Limited logo). */
  poweredByLogoUrl?: string;
  className?: string;
}

export function PinLoginBrandPanel({
  tenantName, tenantLogoUrl, workflowSteps, poweredByLogoUrl = CODEVERTEX_LOGO_URL, className,
}: PinLoginBrandPanelProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-8 px-6 py-8 text-center ${className ?? ''}`}>
      {/* Tenant logo — no background, blends with the brand-tinted panel. Falls back to a plain
          tenant-name wordmark when no logo is configured. */}
      {tenantLogoUrl ? (
        <img
          src={tenantLogoUrl}
          alt={tenantName}
          className="max-h-28 sm:max-h-36 max-w-[85%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
        />
      ) : (
        <p className="text-3xl sm:text-4xl font-black text-white tracking-tight max-w-[85%]">{tenantName}</p>
      )}

      <WorkflowIllustration steps={workflowSteps} />

      {/* Platform attribution — a real card (creamy, same tone as the main login card), not a
          faint text mark, so "Powered by Codevertex Africa Limited" reads clearly against the
          brand-tinted panel. */}
      <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-lg ring-1 ring-black/5">
        <img
          src={poweredByLogoUrl}
          alt="Codevertex Africa Limited"
          className="h-9 w-9 rounded-lg object-contain shrink-0"
        />
        <div className="text-left leading-tight">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Powered by</p>
          <p className="text-sm font-black text-foreground whitespace-nowrap">Codevertex Africa Limited</p>
        </div>
      </div>
    </div>
  );
}
