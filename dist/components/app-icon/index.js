import { jsx } from 'react/jsx-runtime';

// src/components/app-icon/index.tsx
var MIN_SIZE = 16;
var MAX_SIZE = 1024;
var MAX_REMOTE_BYTES = 1024 * 1024;
function clampIconSize(raw) {
  const n = typeof raw === "number" ? raw : Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 192;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)));
}
function appInitials(name) {
  const words = name.split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "A").slice(0, 2);
  return letters.toUpperCase();
}
function sniffImageMime(bytes) {
  const png = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  const head = Buffer.from(bytes.subarray(0, 512)).toString("utf8").replace(/^﻿/, "").trimStart();
  if (head.startsWith("<svg") || head.startsWith("<?xml") && head.includes("<svg")) return "image/svg+xml";
  return null;
}
function decodeDataUri(uri) {
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
async function loadIconDataUri(iconUrl) {
  if (!iconUrl) return null;
  let bytes = null;
  if (iconUrl.startsWith("data:image/")) {
    bytes = decodeDataUri(iconUrl);
  } else if (iconUrl.startsWith("https://")) {
    try {
      const res = await fetch(iconUrl, { next: { revalidate: 3600 } });
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
function frame(ImageResponse, size, background, content) {
  return new ImageResponse(
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background
        },
        children: content
      }
    ),
    { width: size, height: size }
  );
}
var HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
};
async function appIconResponse(ImageResponse, opts) {
  const size = clampIconSize(opts.size);
  const maskable = !!opts.maskable;
  const icon = await loadIconDataUri(opts.iconUrl);
  if (icon) {
    const inner = Math.round(size * (maskable ? 0.68 : 0.86));
    try {
      const res2 = frame(
        ImageResponse,
        size,
        maskable ? opts.themeColor : "#ffffff",
        // eslint-disable-next-line @next/next/no-img-element
        /* @__PURE__ */ jsx("img", { src: icon, width: inner, height: inner, style: { objectFit: "contain" }, alt: "" })
      );
      return new Response(await res2.arrayBuffer(), { headers: HEADERS });
    } catch {
    }
  }
  const res = frame(
    ImageResponse,
    size,
    opts.themeColor,
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          display: "flex",
          color: "#ffffff",
          fontSize: Math.round(size * (maskable ? 0.34 : 0.42)),
          fontWeight: 700,
          letterSpacing: -1
        },
        children: appInitials(opts.name)
      }
    )
  );
  return new Response(await res.arrayBuffer(), { headers: HEADERS });
}
function appIconPath(slug, size, maskable = false) {
  return `/${slug}/app-icon/${size}${maskable ? "?maskable=1" : ""}`;
}

export { appIconPath, appIconResponse, appInitials, clampIconSize, loadIconDataUri, sniffImageMime };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map