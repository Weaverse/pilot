// Pilot PWA service worker — intentionally minimal (v1).
//
// Whitelist-only caching: hashed build assets (cache-first) and Shopify CDN
// images (stale-while-revalidate, capped). EVERYTHING else — HTML documents,
// /cart, /account, /api/*, cross-origin checkout — is never intercepted, so
// personalized or price-sensitive responses can never enter a SW cache.
// The SSR document stays anonymous by design (Oxygen full-page cache); keep it
// that way here too.

const VERSION = "pilot-pwa-v1"; // bump on any change to this file
const ASSET_CACHE = `${VERSION}-assets`;
const IMG_CACHE = `${VERSION}-img`;
const IMG_CACHE_MAX_ENTRIES = 60;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  if (url.origin === location.origin && url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(ASSET_CACHE, request));
    return;
  }
  if (
    url.hostname === "cdn.shopify.com" &&
    request.destination === "image"
  ) {
    event.respondWith(staleWhileRevalidate(IMG_CACHE, request));
  }
  // Anything else: no respondWith — the network handles it untouched.
});

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        trimCache(cache);
      }
      return response;
    })
    .catch(() => cached);
  return cached || refresh;
}

// Best-effort LRU-ish cap: Cache API keys() preserves insertion order.
async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length > IMG_CACHE_MAX_ENTRIES) {
    await Promise.all(
      keys.slice(0, keys.length - IMG_CACHE_MAX_ENTRIES).map((key) => cache.delete(key)),
    );
  }
}
