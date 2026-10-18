import { ReactElement } from 'react';

/**
 * Tenant app icons for every Codevertex PWA (server only).
 *
 * Each app serves square PNG icons at /{slug}/app-icon/{size} for its favicon, apple-touch-icon
 * and manifest, generated from the tenant's icon for that app (service_branding icon, else the
 * business logo; SVG or raster, often a wide wordmark). With no usable image the icon is the app's
 * initials on its theme colour. The app passes its own `ImageResponse` (next/og), so this package
 * does not depend on Next.js:
 *
 *   import { ImageResponse } from "next/og";
 *   import { appIconResponse } from "@bengo-hub/shared-ui-lib/app-icon";
 *   export async function GET(req, { params }) {
 *     const { orgSlug, size } = await params;
 *     const b = await getAppBranding(orgSlug);
 *     return appIconResponse(ImageResponse, { size, maskable: req.nextUrl.searchParams.get("maskable") === "1",
 *       iconUrl: b.iconUrl, name: b.appName, themeColor: b.themeColor });
 *   }
 *
 * Uses Node's Buffer: keep the route on the Node.js runtime.
 */

/** The constructor of next/og's ImageResponse (or anything shaped like it). */
type ImageResponseCtor = new (element: ReactElement, options: {
    width: number;
    height: number;
}) => Response;
interface AppIconOptions {
    /** Requested pixel size (string from the route or a number); clamped to 16..1024. */
    size: string | number;
    /** Android crops maskable icons to a circle: artwork stays in the central safe zone. */
    maskable?: boolean;
    /** The tenant's icon: https URL or data:image URI. Null draws initials. */
    iconUrl: string | null | undefined;
    /** App name the initials come from, e.g. "Urban Eats". */
    name: string;
    themeColor: string;
}
/** Clamps a requested icon size (192 when unparsable). */
declare function clampIconSize(raw: string | number): number;
/** Two initials from an app name ("Urban Eats" gives "UE"). */
declare function appInitials(name: string): string;
/**
 * Real image type from the file's first bytes. Declared types are often wrong (urban-loft's logo
 * is a JPEG served as image/png) and the renderer silently draws nothing on a mismatch. Only types
 * the renderer can draw are returned; anything else (WebP, ...) gets initials.
 */
declare function sniffImageMime(bytes: Uint8Array): string | null;
/** The icon as a correctly typed data URI the renderer can embed, or null when it is unusable. */
declare function loadIconDataUri(iconUrl: string | null | undefined): Promise<string | null>;
/** Renders the square PNG icon: the tenant image on white (theme colour when maskable), else initials. */
declare function appIconResponse(ImageResponse: ImageResponseCtor, opts: AppIconOptions): Promise<Response>;
/** Path of a generated icon: /{slug}/app-icon/{size}[?maskable=1]. */
declare function appIconPath(slug: string, size: number, maskable?: boolean): string;

export { type AppIconOptions, type ImageResponseCtor, appIconPath, appIconResponse, appInitials, clampIconSize, loadIconDataUri, sniffImageMime };
