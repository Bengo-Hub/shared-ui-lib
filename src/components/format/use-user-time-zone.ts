'use client';

import { useSyncExternalStore } from 'react';
import {
  DEFAULT_TIME_ZONE,
  getActiveTimeZone,
  resolveTimeZone,
  subscribeTimeZone,
  type TimeZoneTenant,
  type TimeZoneUser,
} from './timezone';

/**
 * The zone this screen should show times in. With no arguments it returns the active zone the
 * app set from /me (see applyUserTimeZone) and re-renders when it changes. Given a user and
 * tenant it resolves from them instead.
 */
export function useUserTimeZone(user?: TimeZoneUser | null, tenant?: TimeZoneTenant | null): string {
  const active = useSyncExternalStore(subscribeTimeZone, getActiveTimeZone, () => DEFAULT_TIME_ZONE);
  if (user === undefined && tenant === undefined) return active;
  return resolveTimeZone(user, tenant);
}
