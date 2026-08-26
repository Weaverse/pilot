// Pilot PWA service worker — intentionally minimal (v1).
//
// Whitelist-only caching: hashed build assets (cache-first) and Shopify CDN
// images (stale-while-revalidate, capped). EVERYTHING else — HTML documents,
// /cart, /account, /api/*, cross-origin checkout — is never intercepted, so
// personalized or price-sensitive responses can never enter a SW cache.
// The SSR document stays anonymous by design (Oxygen full-page cache); keep it
// that way here too.

const CACHE_PREFIX = "pilot-pwa-";
const VERSION = `${CACHE_PREFIX}v1`; // bump on any change to this file
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
            // Cache Storage is origin-wide: only ever touch Pilot-owned caches,
            // and of those, only stale versions.
            .filter(
              (key) => key.startsWith(CACHE_PREFIX) && !key.startsWith(VERSION),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  let request = event.request;
  if (request.method !== "GET") {
    return;
  }
  let url = new URL(request.url);
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
  let cache = await caches.open(cacheName);
  let cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  let response = await fetch(request);
  if (response.ok) {
    try {
      // Await the write: respondWith's lifetime ends when we return, and the
      // browser may kill the worker before an un-awaited put() completes.
      await cache.put(request, response.clone());
    } catch {
      // Best-effort: a quota/uncacheable failure must not break the response.
    }
  }
  return response;
}

function staleWhileRevalidate(cacheName, request, event) {
  let cachedPromise = caches
    .open(cacheName)
    .then((cache) => cache.match(request));
  let refresh = cachedPromise.then((cached) =>
    fetch(request)
      .then(async (response) => {
        // Cross-origin <img> requests are no-cors, so successful responses are
        // opaque (status 0, ok=false) — those are exactly what we must cache.
        if (response.ok || response.type === "opaque") {
          let cache = await caches.open(cacheName);
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
  let keys = await cache.keys();
  if (keys.length > IMG_CACHE_MAX_ENTRIES) {
    await Promise.all(
      keys.slice(0, keys.length - IMG_CACHE_MAX_ENTRIES).map((key) => cache.delete(key)),
    );
  }
}
