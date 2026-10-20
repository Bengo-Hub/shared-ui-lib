"use client";

import React, { useMemo } from "react";
import { serviceTagsFromAccessToken } from "../app-switcher/service-tags-from-token";
import { SubscriptionContext, type SubscriptionEntitlements } from "./feature-gate";
import { ServiceLock } from "./service-lock";

export interface PlanServiceLockProps {
  /** The service this app is ("library", "maskani", "projects", ...). */
  serviceTag: string;
  /** The signed-in user's access token; the plan's service tags are read from its claims. */
  accessToken?: string | null;
  /** Pricing UI base URL for the upgrade link (for example NEXT_PUBLIC_SUBSCRIPTIONS_UI_URL). */
  upgradeBaseUrl?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * PlanServiceLock shows the "not in your plan" upgrade card in place of a whole app when the
 * tenant's plan has no entitlement in `serviceTag`, so opening the app directly never lands on a
 * bare 403. It reads the tags from the access token, so an app needs no subscription plumbing of
 * its own. Anything unknown (no token, no tag claim, exempt token) renders the app untouched, and
 * the services themselves still enforce the plan on every request.
 *
 * Unlike ServiceLock it provides no entitlement context to `children`; it only supplies one to the
 * lock card it renders, so an app's own SubscriptionProvider is never overridden.
 */
export function PlanServiceLock({
  serviceTag,
  accessToken,
  upgradeBaseUrl,
  title,
  description,
  children,
}: PlanServiceLockProps) {
  const tags = serviceTagsFromAccessToken(accessToken);
  const locked = !!tags && tags.length > 0 && !tags.includes(serviceTag);
  const value = useMemo<SubscriptionEntitlements>(
    () => ({
      features: [],
      limits: {},
      isExempt: false,
      status: null,
      isLoading: false,
      activeServiceTags: tags ?? [],
      upgradeBaseUrl: upgradeBaseUrl ?? "",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tags?.join(","), upgradeBaseUrl],
  );

  if (!locked) return <>{children}</>;
  return (
    <SubscriptionContext.Provider value={value}>
      <ServiceLock serviceTag={serviceTag} mode="block" title={title ?? "Not in your plan"} description={description}>
        {null}
      </ServiceLock>
    </SubscriptionContext.Provider>
  );
}
