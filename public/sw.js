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
    staleWhileRevalidate(IMG_CACHE, request, event);
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

function staleWhileRevalidate(cacheName, request, event) {
  const cachedPromise = caches
    .open(cacheName)
    .then((cache) => cache.match(request));
  const refresh = cachedPromise.then((cached) =>
    fetch(request)
      .then(async (response) => {
        // Cross-origin <img> requests are no-cors, so successful responses are
        // opaque (status 0, ok=false) — those are exactly what we must cache.
        if (response.ok || response.type === "opaque") {
          const cache = await caches.open(cacheName);
          await cache.put(request, response.clone());
          await trimCache(cache);
        }
        return response;
      })
      .catch(() => cached),
  );
  event.respondWith(
    cachedPromise.then((cached) => {
      if (cached) {
        // Serve stale immediately; keep the worker alive until the background
        // refresh finishes so revalidation actually happens.
        event.waitUntil(refresh.then(() => undefined).catch(() => undefined));
        return cached;
      }
      return refresh;
    }),
  );
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
