'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { NoticeCard } from './notice-card';

/** One platform announcement, as notifications-api's public active read returns it. */
export interface Announcement {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
  cta_label?: string;
  cta_url?: string;
  audience: 'all' | 'admins';
  tone: 'feature' | 'info' | 'warning';
  priority: number;
  dismissible: boolean;
  starts_at: string;
  ends_at?: string;
  updated_at: string;
  /** Text for viewers whose app reports the flag as true, keyed by flag (e.g. payhero_active). */
  variants?: Record<string, AnnouncementVariant>;
}

/** An announcement's text for viewers in one state, replacing the base text. */
export interface AnnouncementVariant {
  title?: string;
  summary: string;
  highlights: string[];
  cta_label?: string;
  cta_url?: string;
}

/**
 * What the app knows about the viewer, by flag: true picks that variant, false keeps the base
 * text, undefined means still loading (an announcement with that variant waits rather than
 * flashing the wrong text). Flags the app does not pass count as false.
 */
export type AnnouncementFlags = Record<string, boolean | undefined>;

export interface AnnouncementBannerProps {
  /** App key the platform admin targets: pos, treasury, inventory, ... */
  service: string;
  /** Organization slug, substituted for {orgSlug} in the call-to-action link. */
  orgSlug?: string;
  /** Who is viewing (user id or email). Dismissals are remembered per viewer on this device. */
  viewerKey?: string;
  /** Whether the viewer can change settings; announcements aimed at admins show only then. */
  isAdmin?: boolean;
  /** The viewer's state for announcement variants (see AnnouncementFlags). */
  flags?: AnnouncementFlags;
  /** notifications-api base URL. Falls back to NEXT_PUBLIC_NOTIFICATIONS_API_URL, then production. */
  apiBaseUrl?: string;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = ((globalThis as any).process?.env ?? {}) as Record<string, string | undefined>;
const DEFAULT_API = env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || 'https://notificationsapi.codevertexafrica.com';
const REFRESH_MS = 10 * 60 * 1000;
const STORAGE_PREFIX = 'cv-announcements-dismissed:';

// One request per service per page load, however many banners mount (dashboard re-renders,
// route changes back to the dashboard).
const inflight = new Map<string, { at: number; promise: Promise<Announcement[]> }>();

function fetchActive(apiBaseUrl: string, service: string): Promise<Announcement[]> {
  const key = `${apiBaseUrl}|${service}`;
  const hit = inflight.get(key);
  if (hit && Date.now() - hit.at < REFRESH_MS) return hit.promise;
  const promise = fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/announcements/active?service=${encodeURIComponent(service)}`, {
    headers: { Accept: 'application/json' },
  })
    .then((res) => (res.ok ? res.json() : { announcements: [] }))
    .then((body: { announcements?: Announcement[] }) => body.announcements ?? [])
    .catch(() => {
      inflight.delete(key); // retry on the next mount or refresh
      return [] as Announcement[];
    });
  inflight.set(key, { at: Date.now(), promise });
  return promise;
}

function readDismissed(viewerKey: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + viewerKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeDismissed(viewerKey: string, ids: string[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + viewerKey, JSON.stringify(ids));
  } catch {
    // storage unavailable: the dismissal lasts for this page view only
  }
}

/** The link a call-to-action opens, and whether it leaves this app. */
export function resolveAnnouncementLink(url: string, orgSlug?: string): { href: string; external: boolean } {
  const href = url.replace(/\{orgSlug\}/g, encodeURIComponent(orgSlug ?? ''));
  // A mail link opens the mail app; a new tab for it would be left blank.
  if (href.startsWith('/') || href.startsWith('mailto:')) return { href, external: false };
  try {
    const external = typeof window === 'undefined' || new URL(href).origin !== window.location.origin;
    return { href, external };
  } catch {
    return { href, external: true };
  }
}

/**
 * The announcement as this viewer reads it: the first variant (in flag order) whose flag is true
 * replaces the text, and the dismissal key carries the variant, so a viewer who dismissed "how to
 * ask for it" still sees "how to use it" once the state changes. null while a flag the
 * announcement depends on is still loading.
 */
export function resolveAnnouncement(a: Announcement, flags: AnnouncementFlags = {}): (Announcement & { dismissKey: string }) | null {
  const keys = Object.keys(a.variants ?? {}).sort();
  if (keys.some((k) => k in flags && flags[k] === undefined)) return null;
  const hit = keys.find((k) => flags[k] === true);
  if (!hit) return { ...a, dismissKey: a.id };
  const v = a.variants![hit];
  return {
    ...a,
    title: v.title || a.title,
    summary: v.summary,
    highlights: v.highlights ?? [],
    cta_label: v.cta_label,
    cta_url: v.cta_url,
    dismissKey: `${a.id}:${hit}`,
  };
}

/** Announcements a viewer should see: right audience, resolved for its state, not dismissed, in server order. */
export function visibleAnnouncements(list: Announcement[], dismissed: string[], isAdmin: boolean, flags: AnnouncementFlags = {}) {
  return list
    .filter((a) => isAdmin || a.audience !== 'admins')
    .map((a) => resolveAnnouncement(a, flags))
    .filter((a): a is Announcement & { dismissKey: string } => !!a && !(a.dismissible && dismissed.includes(a.dismissKey)));
}

/**
 * Platform "what's new" banner. Shows the highest-priority announcement the platform admin has
 * running for this app; dismissing it reveals the next. The admin sets the message, audience,
 * link and how long it runs (notifications-api, Platform > Announcements); expired ones are
 * deleted server side.
 */
export function AnnouncementBanner({ service, orgSlug, viewerKey = 'anon', isAdmin = false, flags, apiBaseUrl = DEFAULT_API, className = '' }: AnnouncementBannerProps) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(readDismissed(viewerKey));
  }, [viewerKey]);

  useEffect(() => {
    let alive = true;
    const load = () => fetchActive(apiBaseUrl, service).then((list) => alive && setItems(list));
    void load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [apiBaseUrl, service]);

  // A stable key so a parent passing a fresh flags object each render does not re-run this.
  const flagsKey = JSON.stringify(flags ?? {});
  const visible = useMemo(
    () => visibleAnnouncements(items, dismissed, isAdmin, JSON.parse(flagsKey) as AnnouncementFlags),
    [items, dismissed, isAdmin, flagsKey],
  );
  const current = visible[0];

  const dismiss = useCallback(() => {
    if (!current) return;
    // Keep only keys of announcements still running so the stored list never grows past the live set.
    const live = new Set(items.map((a) => a.id));
    const next = [...dismissed.filter((key) => live.has(key.split(':')[0])), current.dismissKey];
    setDismissed(next);
    writeDismissed(viewerKey, next);
  }, [current, dismissed, items, viewerKey]);

  if (!current) return null;
  const link = current.cta_url ? resolveAnnouncementLink(current.cta_url, orgSlug) : null;

  return (
    <NoticeCard
      // Keyed so the expanded state of one announcement does not carry over to the next.
      key={current.dismissKey}
      tone={current.tone}
      title={current.title}
      summary={current.summary}
      highlights={current.highlights}
      cta={link && current.cta_label ? { label: current.cta_label, href: link.href, external: link.external } : undefined}
      counter={visible.length > 1 ? `1 of ${visible.length}` : undefined}
      dismissible={current.dismissible}
      onDismiss={dismiss}
      className={className}
    />
  );
}
