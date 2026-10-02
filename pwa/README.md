# PWA service worker assets

`sw-media.js` is the canonical media cache every Codevertex frontend's service worker loads.
Copy it to the app's `public/sw-media.js` unchanged, then in `public/sw.js`:

1. Load it first: `importScripts('/sw-media.js');` right after the eslint header, so its fetch
   handler answers media requests before the app's own handler.
2. Keep its cache across version bumps: in the `activate` cleanup, skip `MEDIA_CACHE`
   (`!k.startsWith(VERSION) && k !== MEDIA_CACHE`).

What it caches: images from the API hosts' `/media/` tree and same-origin `/_next/image`, in a
bounded cache (400 entries, oldest dropped). It re-fetches cross-origin images in CORS mode so the
response is not opaque (opaque entries are padded by megabytes of quota), never stores responses
marked `no-store` or `private` (patient photos, KYC documents), serves immutable uploads straight
from cache and refreshes other names in the background.

Apps using it: pos-ui, inventory-ui, ordering-frontend.
