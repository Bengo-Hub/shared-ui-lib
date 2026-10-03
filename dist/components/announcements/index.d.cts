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
}
interface AnnouncementBannerProps {
    /** App key the platform admin targets: pos, treasury, inventory, ... */
    service: string;
    /** Organization slug, substituted for {orgSlug} in the call-to-action link. */
    orgSlug?: string;
    /** Who is viewing (user id or email). Dismissals are remembered per viewer on this device. */
    viewerKey?: string;
    /** Whether the viewer can change settings; announcements aimed at admins show only then. */
    isAdmin?: boolean;
    /** notifications-api base URL. Falls back to NEXT_PUBLIC_NOTIFICATIONS_API_URL, then production. */
    apiBaseUrl?: string;
    className?: string;
}
/** The link a call-to-action opens, and whether it leaves this app. */
declare function resolveAnnouncementLink(url: string, orgSlug?: string): {
    href: string;
    external: boolean;
};
/** Announcements a viewer should see: right audience, not dismissed, in server order. */
declare function visibleAnnouncements(list: Announcement[], dismissed: string[], isAdmin: boolean): Announcement[];
/**
 * Platform "what's new" banner. Shows the highest-priority announcement the platform admin has
 * running for this app; dismissing it reveals the next. The admin sets the message, audience,
 * link and how long it runs (notifications-api, Platform > Announcements); expired ones are
 * deleted server side.
 */
declare function AnnouncementBanner({ service, orgSlug, viewerKey, isAdmin, apiBaseUrl, className }: AnnouncementBannerProps): react_jsx_runtime.JSX.Element | null;

export { type Announcement, AnnouncementBanner, type AnnouncementBannerProps, resolveAnnouncementLink, visibleAnnouncements };
