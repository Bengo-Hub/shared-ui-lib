import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { ReactNode } from 'react';
import * as lucide_react from 'lucide-react';

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

type NoticeTone = 'feature' | 'info' | 'warning';
declare const NOTICE_TONES: {
    readonly feature: {
        readonly icon: React.ForwardRefExoticComponent<Omit<lucide_react.LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        readonly badge: "New";
        readonly ring: "border-primary/30";
        readonly iconBox: "bg-primary/10 text-primary";
        readonly badgeCls: "bg-primary text-primary-foreground";
    };
    readonly info: {
        readonly icon: React.ForwardRefExoticComponent<Omit<lucide_react.LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        readonly badge: "Update";
        readonly ring: "border-sky-500/30";
        readonly iconBox: "bg-sky-500/10 text-sky-600 dark:text-sky-400";
        readonly badgeCls: "bg-sky-600 text-white";
    };
    readonly warning: {
        readonly icon: React.ForwardRefExoticComponent<Omit<lucide_react.LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        readonly badge: "Notice";
        readonly ring: "border-amber-500/40";
        readonly iconBox: "bg-amber-500/10 text-amber-600 dark:text-amber-400";
        readonly badgeCls: "bg-amber-500 text-white";
    };
};
interface NoticeCardProps {
    tone?: NoticeTone;
    /** Overrides the tone's default badge text (New, Update, Notice). */
    badge?: string;
    title: string;
    summary?: string;
    /** Extra points shown under a "What's included" toggle. */
    highlights?: string[];
    cta?: {
        label: string;
        href: string;
        external?: boolean;
    };
    /** Cut a long summary to three lines (the full text stays in the link target). */
    clampSummary?: boolean;
    /** Small text next to the title, for example "2 of 5". */
    counter?: string;
    /** Small muted text under the summary, for example the date and author of a notice. */
    meta?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    /** Controls such as previous and next, shown on the right below the dismiss button. */
    footer?: ReactNode;
    className?: string;
}
/**
 * The shared notice card: tone icon, badge, title, summary, optional highlights and link, and a
 * dismiss button. AnnouncementBanner (platform announcements) and NoticeCarousel (any list of
 * notices, such as KRA notices) both render it, so every notice in the apps looks the same.
 */
declare function NoticeCard({ tone, badge, title, summary, highlights, cta, clampSummary, counter, meta, dismissible, onDismiss, footer, className, }: NoticeCardProps): react_jsx_runtime.JSX.Element;

/** One notice for NoticeCarousel. The id must stay the same for the same notice: dismissals key on it. */
interface NoticeItem {
    id: string;
    title: string;
    summary?: string;
    tone?: NoticeTone;
    badge?: string;
    cta?: {
        label: string;
        href: string;
        external?: boolean;
    };
    /** Small text under the summary, for example the date a notice was posted. */
    meta?: string;
}
interface NoticeCarouselProps {
    notices: NoticeItem[];
    /**
     * Where dismissals are remembered on this device, for example `kra-notices:<tenant>:<viewer>`.
     * Include the viewer so two people on one browser do not hide each other's notices.
     */
    storageKey: string;
    /** How long each notice stays up before the next one slides in. Default 15 seconds. */
    rotateMs?: number;
    /** Notices can be dismissed unless this is false. */
    dismissible?: boolean;
    className?: string;
}
/**
 * A list of notices shown one at a time in the shared NoticeCard, advancing by itself (paused while
 * the pointer is over it) with previous, next and dots when there is more than one. Each notice can
 * be dismissed; the dismissal is remembered on this device, per storageKey, and forgotten once the
 * notice is no longer in the list so the stored list never outgrows the live set. Renders nothing
 * when no notice is left. The caller owns ordering and expiry.
 */
declare function NoticeCarousel({ notices, storageKey, rotateMs, dismissible, className }: NoticeCarouselProps): react_jsx_runtime.JSX.Element | null;

export { type Announcement, AnnouncementBanner, type AnnouncementBannerProps, type AnnouncementFlags, type AnnouncementVariant, NOTICE_TONES, NoticeCard, type NoticeCardProps, NoticeCarousel, type NoticeCarouselProps, type NoticeItem, type NoticeTone, resolveAnnouncement, resolveAnnouncementLink, visibleAnnouncements };
