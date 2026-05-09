import { CacheShort, generateCacheControlHeader } from "@shopify/hydrogen";

let DEFAULT_CACHE = generateCacheControlHeader(CacheShort());

export function routeHeaders({ loaderHeaders }: { loaderHeaders: Headers }) {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control") || DEFAULT_CACHE,
  };
}
