import * as react_jsx_runtime from 'react/jsx-runtime';

/** One platform announcement, as notifications-api's public active read returns it. */
interface Announcement {
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
interface AnnouncementVariant {
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
type AnnouncementFlags = Record<string, boolean | undefined>;
interface AnnouncementBannerProps {
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
/** The link a call-to-action opens, and whether it leaves this app. */
declare function resolveAnnouncementLink(url: string, orgSlug?: string): {
    href: string;
    external: boolean;
};
/**
 * The announcement as this viewer reads it: the first variant (in flag order) whose flag is true
 * replaces the text, and the dismissal key carries the variant, so a viewer who dismissed "how to
 * ask for it" still sees "how to use it" once the state changes. null while a flag the
 * announcement depends on is still loading.
 */
declare function resolveAnnouncement(a: Announcement, flags?: AnnouncementFlags): (Announcement & {
    dismissKey: string;
}) | null;
/** Announcements a viewer should see: right audience, resolved for its state, not dismissed, in server order. */
declare function visibleAnnouncements(list: Announcement[], dismissed: string[], isAdmin: boolean, flags?: AnnouncementFlags): (Announcement & {
    dismissKey: string;
})[];
/**
 * Platform "what's new" banner. Shows the highest-priority announcement the platform admin has
 * running for this app; dismissing it reveals the next. The admin sets the message, audience,
 * link and how long it runs (notifications-api, Platform > Announcements); expired ones are
 * deleted server side.
 */
declare function AnnouncementBanner({ service, orgSlug, viewerKey, isAdmin, flags, apiBaseUrl, className }: AnnouncementBannerProps): react_jsx_runtime.JSX.Element | null;

export { type Announcement, AnnouncementBanner, type AnnouncementBannerProps, type AnnouncementFlags, type AnnouncementVariant, resolveAnnouncement, resolveAnnouncementLink, visibleAnnouncements };
