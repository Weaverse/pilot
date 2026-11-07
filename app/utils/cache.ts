import { Cache, type CachingStrategy } from "@shopify/hydrogen";

/**
 * Classic Hydrogen's implicit Storefront API cache (`CacheDefault`): fresh for
 * a second, then served stale for a day while it refreshes. Hydrogen 2026.10
 * has no default, so every Pilot query passes a strategy explicitly; this one
 * keeps the behavior queries had before the upgrade.
 */
export const CACHE_DEFAULT = Cache({
  mode: "public",
  maxAge: 1,
  staleWhileRevalidate: 86_399,
});
export const CACHE_SHORT = Cache.short();
export const CACHE_LONG = Cache.long();
export const CACHE_NONE = Cache.none();

const CACHE_CONTROL_DIRECTIVES = {
  maxAge: "max-age",
  staleWhileRevalidate: "stale-while-revalidate",
  sMaxAge: "s-maxage",
  staleIfError: "stale-if-error",
} as const;

/**
 * A `Cache-Control` value for a caching strategy, as classic Hydrogen's
 * `generateCacheControlHeader` built it: `public, max-age=1,
 * stale-while-revalidate=9`.
 */
export function cacheControlHeader(strategy: CachingStrategy): string {
  const directives: string[] = [];
  for (const [key, value] of Object.entries(strategy)) {
    if (key === "mode") {
      directives.push(String(value));
    } else if (key in CACHE_CONTROL_DIRECTIVES && value !== undefined) {
      directives.push(
        `${CACHE_CONTROL_DIRECTIVES[key as keyof typeof CACHE_CONTROL_DIRECTIVES]}=${value}`,
      );
    }
  }
  return directives.join(", ");
}

const DEFAULT_CACHE = cacheControlHeader(CACHE_SHORT);

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
