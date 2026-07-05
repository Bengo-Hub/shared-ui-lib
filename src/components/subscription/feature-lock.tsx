"use client";

import React, { useContext, useMemo, useState } from "react";
import { Lock, Zap, X } from "lucide-react";
import { SubscriptionContext, type FeatureCatalogEntry } from "./feature-gate";

/**
 * FeatureLock — the canonical "show, don't hide" subscription gate.
 *
 * It ALWAYS renders its children. When the tenant's plan does not include `feature` (and the tenant
 * is not exempt), it wraps the children so interacting with them surfaces an UpgradeDialog naming the
 * tier that unlocks the feature — never `display:none`. This lets customers see that a feature exists
 * and learn how to get it, instead of a silently-missing control.
 *
 *  - mode="overlay" (default): children shown dimmed + non-interactive; a transparent overlay
 *    intercepts clicks and opens the dialog. Use for buttons, cards, form sections.
 *  - mode="badge": children shown inline with a small "🔒 <tier>" chip; clicking anywhere in the
 *    wrapper opens the dialog (capture-phase, so an inner <Link> won't navigate). Use for nav items.
 *  - mode="block": a full upgrade CTA card replacing the interactive body. Use for whole pages.
 */
export type FeatureLockMode = "overlay" | "badge" | "block";

export interface FeatureLockProps {
  feature: string;
  mode?: FeatureLockMode;
  children: React.ReactNode;
  className?: string;
  /** Optional copy overrides for the block/dialog. */
  title?: string;
  description?: string;
}

/** Resolve the tier metadata + a pricing deep-link for a feature the tenant lacks. */
export function useFeatureUpgrade(feature: string): {
  locked: boolean;
  isLoading: boolean;
  entry?: FeatureCatalogEntry;
  tierLabel: string;
  upgradeHref: string;
} {
  const e = useContext(SubscriptionContext);
  const entry = e.catalog?.[feature];
  const locked = !e.isExempt && !e.features.includes(feature);
  const tierLabel = entry?.minTierLabel || "a higher plan";
  const upgradeHref = useMemo(() => {
    const base = (e.upgradeBaseUrl || "https://pricing.codevertexitsolutions.com").replace(/\/$/, "");
    const params = new URLSearchParams();
    if (entry?.serviceTag) params.set("service", entry.serviceTag);
    if (entry?.minPlanCode) params.set("plan", entry.minPlanCode);
    const qs = params.toString();
    return `${base}/plans${qs ? `?${qs}` : ""}`;
  }, [e.upgradeBaseUrl, entry?.serviceTag, entry?.minPlanCode]);
  return { locked, isLoading: !!e.isLoading, entry, tierLabel, upgradeHref };
}

/**
 * UpgradeDialog — a dependency-free modal that names the unlocking tier and links to the pricing UI.
 * Rendered by FeatureLock; can also be used standalone (open controlled by the caller).
 */
export function UpgradeDialog({
  feature,
  open,
  onClose,
  title,
  description,
}: {
  feature: string;
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}) {
  const { entry, tierLabel, upgradeHref } = useFeatureUpgrade(feature);
  if (!open) return null;
  const featureLabel = entry?.label || title || "This feature";
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-foreground">Upgrade to unlock</h2>
              <p className="text-xs text-muted-foreground">Available on {tierLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-foreground">
          <span className="font-semibold">{featureLabel}</span>{" "}
          {description || `is part of the ${tierLabel} plan. Upgrade your subscription to start using it.`}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent"
          >
            Not now
          </button>
          <a
            href={upgradeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Zap className="h-4 w-4" />
            Upgrade{entry?.minTierLabel ? ` to ${entry.minTierLabel}` : ""}
          </a>
        </div>
      </div>
    </div>
  );
}

export function FeatureLock({ feature, mode = "overlay", children, className, title, description }: FeatureLockProps) {
  const { locked, isLoading, tierLabel } = useFeatureUpgrade(feature);
  const [dialogOpen, setDialogOpen] = useState(false);

  // While entitlements load, or when entitled/exempt, render children untouched.
  if (isLoading || !locked) return <>{children}</>;

  const open = (ev: React.MouseEvent | React.KeyboardEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    setDialogOpen(true);
  };
  const dialog = <UpgradeDialog feature={feature} open={dialogOpen} onClose={() => setDialogOpen(false)} title={title} description={description} />;

  if (mode === "badge") {
    return (
      <>
        <span
          className={"group/lock relative inline-flex w-full items-center " + (className ?? "")}
          onClickCapture={open}
          role="button"
          tabIndex={0}
          onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && open(ev)}
          title={`Available on ${tierLabel} — click to upgrade`}
        >
          <span className="pointer-events-none flex-1">{children}</span>
          <span className="ml-1 flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">
            <Lock className="h-2.5 w-2.5" />
            {tierLabel}
          </span>
        </span>
        {dialog}
      </>
    );
  }

  if (mode === "block") {
    return (
      <div className={"flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-12 text-center " + (className ?? "")}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
          <Lock className="h-6 w-6" />
        </span>
        <div className="space-y-1">
          <p className="text-base font-bold text-foreground">{title ?? "This feature needs an upgrade"}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {description ?? `Available on ${tierLabel}. Upgrade your plan to unlock it.`}
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Zap className="h-4 w-4" />
          Upgrade to unlock
        </button>
        {dialog}
      </div>
    );
  }

  // overlay (default): children visible but non-interactive; a transparent layer captures clicks.
  return (
    <div className={"relative " + (className ?? "")}>
      <div className="pointer-events-none select-none opacity-60" aria-disabled>
        {children}
      </div>
      <button
        type="button"
        onClick={open}
        aria-label={`Locked — available on ${tierLabel}. Click to upgrade.`}
        className="absolute inset-0 z-10 flex items-start justify-end p-1.5"
        title={`Available on ${tierLabel} — click to upgrade`}
      >
        <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-500 shadow-sm">
          <Lock className="h-2.5 w-2.5" />
          {tierLabel}
        </span>
      </button>
      {dialog}
    </div>
  );
}
