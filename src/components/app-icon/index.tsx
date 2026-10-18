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

import type { ReactElement } from "react";

const MIN_SIZE = 16;
const MAX_SIZE = 1024;
const MAX_REMOTE_BYTES = 1024 * 1024;

/** The constructor of next/og's ImageResponse (or anything shaped like it). */
export type ImageResponseCtor = new (
  element: ReactElement,
  options: { width: number; height: number },
) => Response;

export interface AppIconOptions {
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
export function clampIconSize(raw: string | number): number {
  const n = typeof raw === "number" ? raw : Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 192;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)));
}

/** Two initials from an app name ("Urban Eats" gives "UE"). */
export function appInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0]![0]! + words[1]![0]! : (words[0] ?? "A").slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Real image type from the file's first bytes. Declared types are often wrong (urban-loft's logo
 * is a JPEG served as image/png) and the renderer silently draws nothing on a mismatch. Only types
 * the renderer can draw are returned; anything else (WebP, ...) gets initials.
 */
export function sniffImageMime(bytes: Uint8Array): string | null {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  const head = Buffer.from(bytes.subarray(0, 512)).toString("utf8").replace(/^﻿/, "").trimStart();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "image/svg+xml";
  return null;
}

function decodeDataUri(uri: string): Buffer | null {
  const comma = uri.indexOf(",");
  if (comma < 0) return null;
  const meta = uri.slice(0, comma);
  const payload = uri.slice(comma + 1);
  try {
    return meta.includes(";base64") ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload), "utf8");
  } catch {
    return null;
  }
}

/** The icon as a correctly typed data URI the renderer can embed, or null when it is unusable. */
export async function loadIconDataUri(iconUrl: string | null | undefined): Promise<string | null> {
  if (!iconUrl) return null;
  let bytes: Buffer | null = null;
  if (iconUrl.startsWith("data:image/")) {
    bytes = decodeDataUri(iconUrl);
  } else if (iconUrl.startsWith("https://")) {
    try {
      // `next.revalidate` lets Next cache the logo for an hour; other runtimes ignore it.
      const res = await fetch(iconUrl, { next: { revalidate: 3600 } } as RequestInit);
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_REMOTE_BYTES) return null;
      bytes = Buffer.from(buf);
    } catch {
      return null;
    }
  }
  if (!bytes) return null;
  const mime = sniffImageMime(bytes);
  return mime ? `data:${mime};base64,${bytes.toString("base64")}` : null;
}

function frame(ImageResponse: ImageResponseCtor, size: number, background: string, content: ReactElement): Response {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
        }}
      >
        {content}
      </div>
    ),
    { width: size, height: size },
  );
}

const HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
};

/** Renders the square PNG icon: the tenant image on white (theme colour when maskable), else initials. */
export async function appIconResponse(ImageResponse: ImageResponseCtor, opts: AppIconOptions): Promise<Response> {
  const size = clampIconSize(opts.size);
  const maskable = !!opts.maskable;

  const icon = await loadIconDataUri(opts.iconUrl);
  if (icon) {
    const inner = Math.round(size * (maskable ? 0.68 : 0.86));
    try {
      const res = frame(
        ImageResponse,
        size,
        maskable ? opts.themeColor : "#ffffff",
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} width={inner} height={inner} style={{ objectFit: "contain" }} alt="" />,
      );
      // Render eagerly so an image the renderer cannot draw falls back to initials instead of
      // failing mid-response.
      return new Response(await res.arrayBuffer(), { headers: HEADERS });
    } catch {
      // fall through to initials
    }
  }

  const res = frame(
    ImageResponse,
    size,
    opts.themeColor,
    <div
      style={{
        display: "flex",
        color: "#ffffff",
        fontSize: Math.round(size * (maskable ? 0.34 : 0.42)),
        fontWeight: 700,
        letterSpacing: -1,
      }}
    >
      {appInitials(opts.name)}
    </div>,
  );
  return new Response(await res.arrayBuffer(), { headers: HEADERS });
}

/** Path of a generated icon: /{slug}/app-icon/{size}[?maskable=1]. */
export function appIconPath(slug: string, size: number, maskable = false): string {
  return `/${slug}/app-icon/${size}${maskable ? "?maskable=1" : ""}`;
}
