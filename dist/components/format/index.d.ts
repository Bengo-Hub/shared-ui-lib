export { C as CURRENCY_META, a as CurrencyMeta, S as SUPPORTED_CURRENCIES, d as decimalPlacesFor, f as formatCompactCurrency, b as formatCurrency } from '../../currency-HfXim15h.js';

/**
 * Time zones for screens. SSO (auth-api) owns them and GET /api/v1/auth/me carries both:
 * `profile.timezone` for the signed-in person and `tenant.timezone` for the active organisation.
 * A screen shows times in the person's zone, then the organisation's, then Africa/Nairobi.
 *
 * Each app calls `applyUserTimeZone(me, me.tenant)` once /me loads. From then on the formatters
 * below use that zone unless a call passes its own. Pure TypeScript, safe on the server, where
 * the active zone stays Africa/Nairobi.
 */
declare const DEFAULT_TIME_ZONE = "Africa/Nairobi";
/** The fields of the /me user this module reads. */
interface TimeZoneUser {
    profile?: {
        timezone?: string | null;
    } | null;
    timezone?: string | null;
}
/** The fields of the /me tenant this module reads. */
interface TimeZoneTenant {
    timezone?: string | null;
}
type DateInput = Date | string | number | null | undefined;
/**
 * Intl options plus a locale. Naming any date or time part (or dateStyle/timeStyle) replaces
 * the formatter's default parts; options such as hour12 alone merge with them.
 */
interface DateFormatOptions extends Intl.DateTimeFormatOptions {
    /** Defaults to en-KE ("14 Nov 2026"). */
    locale?: string;
    /** Returned for empty input. Unparseable strings come back unchanged. Defaults to ''. */
    fallback?: string;
}
/** True when this runtime knows the IANA zone name. */
declare function isValidTimeZone(zone: unknown): zone is string;
/** The user's zone, then the tenant's, then Africa/Nairobi. Unknown names are skipped. */
declare function resolveTimeZone(user?: TimeZoneUser | null, tenant?: TimeZoneTenant | null): string;
/** The zone screens use right now. */
declare function getActiveTimeZone(): string;
/** Sets the zone screens use. An unknown name resets it to Africa/Nairobi. */
declare function setActiveTimeZone(zone: string | null | undefined): string;
/** Resolves the zone from a /me answer and makes it the active one. Returns the zone. */
declare function applyUserTimeZone(user?: TimeZoneUser | null, tenant?: TimeZoneTenant | null): string;
/** Calls `listener` whenever the active zone changes. Returns the unsubscribe function. */
declare function subscribeTimeZone(listener: () => void): () => void;
/** "14 Nov 2026" in the given zone, or the active zone when none is given. */
declare function formatDate(value: DateInput, timeZone?: string | null, options?: DateFormatOptions): string;
/** "14 Nov 2026, 01:30" (24 hour) in the given zone, or the active zone when none is given. */
declare function formatDateTime(value: DateInput, timeZone?: string | null, options?: DateFormatOptions): string;
/** "01:30" (24 hour) in the given zone, or the active zone when none is given. */
declare function formatTime(value: DateInput, timeZone?: string | null, options?: DateFormatOptions): string;
/**
 * For date-fns `format`, which always reads the browser's own zone: a Date whose local fields
 * (getDate, getHours and so on) show the wall clock of `date` in the given zone, or the active
 * zone. Display only: never send the result to an API, and never pass a calendar day.
 */
declare function toUserZone(date: Date, timeZone?: string | null): Date;

export { DEFAULT_TIME_ZONE, type DateFormatOptions, type DateInput, type TimeZoneTenant, type TimeZoneUser, applyUserTimeZone, formatDate, formatDateTime, formatTime, getActiveTimeZone, isValidTimeZone, resolveTimeZone, setActiveTimeZone, subscribeTimeZone, toUserZone };
