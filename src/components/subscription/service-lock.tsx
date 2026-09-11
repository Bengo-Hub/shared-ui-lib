"use client";

import React, { useContext, useMemo, useState } from "react";
import { Lock, Zap, X } from "lucide-react";
import { SubscriptionContext, isServiceUnlocked, type ServiceUnlockPlan } from "./feature-gate";

/**
 * ServiceLock — the whole-module counterpart to FeatureLock. Where FeatureLock gates one
 * capability (a feature code), ServiceLock gates an entire service/module (a service tag —
 * "erp", "inventory", ...), matching the backend's RequireServiceAccess(serviceTag) gate.
 *
 * Same "show, don't hide" contract and render modes as FeatureLock, but defaults to mode="block"
 * (a full replacement card) rather than "overlay" — a whole locked MODULE is normally a
 * dedicated page/section, not a single dimmed control.
 */
export type ServiceLockMode = "overlay" | "badge" | "block";

export interface ServiceLockProps {
  serviceTag: string;
  mode?: ServiceLockMode;
  children: React.ReactNode;
  className?: string;
  /** Optional copy overrides for the block/dialog. */
  title?: string;
  description?: string;
}

/** Resolve the plan that would unlock a service tag + a pricing deep-link naming it. */
export function useServiceUpgrade(serviceTag: string): {
  locked: boolean;
  isLoading: boolean;
  plan?: ServiceUnlockPlan;
  tierLabel: string;
  upgradeHref: string;
} {
  const e = useContext(SubscriptionContext);
  const plan = e.serviceUnlockPlans?.[serviceTag];
  const locked = !isServiceUnlocked(e, serviceTag);
  const tierLabel = plan?.planName || "a higher plan";
  const upgradeHref = useMemo(() => {
    const base = (e.upgradeBaseUrl || "https://pricing.codevertexafrica.com").replace(/\/$/, "");
    const params = new URLSearchParams();
    params.set("service", serviceTag);
    if (plan?.planCode) params.set("plan", plan.planCode);
    const qs = params.toString();
    return `${base}/plans${qs ? `?${qs}` : ""}`;
  }, [e.upgradeBaseUrl, serviceTag, plan?.planCode]);
  return { locked, isLoading: !!e.isLoading, plan, tierLabel, upgradeHref };
}

/**
 * ServiceUpgradeDialog — the service-tag counterpart to UpgradeDialog. Names the specific plan
 * that unlocks the whole module (not just one feature within it) and links to the pricing UI.
 */
export function ServiceUpgradeDialog({
  serviceTag,
  open,
  onClose,
  title,
  description,
}: {
  serviceTag: string;
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}) {
  const { plan, tierLabel, upgradeHref } = useServiceUpgrade(serviceTag);
  if (!open) return null;
  const serviceLabel = title || `The ${serviceTag} module`;
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
          <span className="font-semibold">{serviceLabel}</span>{" "}
          {description || `is not included in your current plan. Upgrade to ${tierLabel} to unlock it.`}
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
            Upgrade{plan?.planName ? ` to ${plan.planName}` : ""}
          </a>
        </div>
      </div>
    </div>
  );
}

export function ServiceLock({ serviceTag, mode = "block", children, className, title, description }: ServiceLockProps) {
  const { locked, isLoading, tierLabel } = useServiceUpgrade(serviceTag);
  const [dialogOpen, setDialogOpen] = useState(false);

  // While entitlements load, or when entitled/exempt, render children untouched.
  if (isLoading || !locked) return <>{children}</>;

  const open = (ev: React.MouseEvent | React.KeyboardEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    setDialogOpen(true);
  };
  const dialog = (
    <ServiceUpgradeDialog serviceTag={serviceTag} open={dialogOpen} onClose={() => setDialogOpen(false)} title={title} description={description} />
  );

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

  if (mode === "overlay") {
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

  // block (default): a full upgrade CTA card replacing the whole gated section/page.
  return (
    <div className={"flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-12 text-center " + (className ?? "")}>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
        <Lock className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="text-base font-bold text-foreground">{title ?? "This service needs an upgrade"}</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {description ?? `This service is not included in your current plan. Available on ${tierLabel}.`}
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
