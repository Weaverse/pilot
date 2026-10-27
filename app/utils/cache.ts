import { CacheShort, generateCacheControlHeader } from "@shopify/hydrogen";

let DEFAULT_CACHE = generateCacheControlHeader(CacheShort());

/**
 * The root route's cache policy. A failed Weaverse load answers `no-store`
 * (see `~/weaverse/load-failure`), whether it failed in a route — and the
 * root error boundary renders it — or in the root loader itself.
 */
export function rootHeaders({
  loaderHeaders,
  errorHeaders,
}: {
  loaderHeaders: Headers;
  errorHeaders?: Headers;
}) {
  const cacheControl =
    errorHeaders?.get("Cache-Control") ?? loaderHeaders.get("Cache-Control");
  return cacheControl ? { "Cache-Control": cacheControl } : {};
}

export function routeHeaders({
  loaderHeaders,
  parentHeaders,
}: {
  loaderHeaders: Headers;
  parentHeaders?: Headers;
}) {
  // The root answers `no-store` when it rendered without the merchant's
  // theme settings; a route's own cache policy must not make that cacheable.
  const parent = parentHeaders?.get("Cache-Control");
  if (parent?.includes("no-store")) {
    return { "Cache-Control": parent };
  }
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control") || DEFAULT_CACHE,
  };
}
