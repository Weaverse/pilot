// First path segment may be a locale prefix (e.g. /fr-fr/account).
const LOCALE_SEGMENT_RE = /^[a-z]{2}(?:-[a-z]{2})?$/i;

// Never full-page cache: personalized or mutating surfaces, plus dev tools.
const UNCACHEABLE_SEGMENTS = new Set([
  "account",
  "api",
  "cart",
  "discount",
  "graphiql",
  "subrequest-profiler",
]);

// Presence of any of these means the request comes from Weaverse Studio
// (design mode / revision preview) — it must always reach the worker.
const WEAVERSE_PREVIEW_PARAMS = [
  "__revisionId",
  "isDesignMode",
  "weaverseHost",
  "weaverseProjectId",
  "weaverseVersion",
];

/**
 * Decide whether this document response may enter Oxygen's full-page cache.
 *
 * Per https://shopify.dev/docs/storefronts/headless/hydrogen/caching/full-page-cache
 * a response is cacheable only with `Oxygen-Cache-Control: public` (non-zero
 * max-age) AND a `Vary` header AND no `Set-Cookie`. The Set-Cookie guard is
 * enforced by Oxygen itself (session commits in server.ts automatically keep
 * those responses out of the cache), so this gate only needs to exclude:
 *
 * - non-GET / non-200 responses
 * - personalized or mutating routes (account, cart, discount, api)
 * - Weaverse Studio design-mode and revision-preview requests
 *
 * The document itself is safe to share because all personalized state
 * (cart, customer access token) is bootstrapped client-side via /api/cart —
 * see CartStoreSync. Do not reintroduce personalized data into root/route
 * loaders without revisiting this.
 *
 * Freshness: 300s shared max-age (matching the Weaverse SDK's Builder-data
 * freshness — total worst-case publish-to-live is ~10 minutes; Oxygen's
 * full-page cache cannot be purged without a redeploy), while the 1-day
 * stale-while-revalidate keeps responses instant during background refresh.
 */
export function getFullPageCacheControl(
  request: Request,
  responseStatusCode: number,
): string | null {
  if (request.method !== "GET" || responseStatusCode !== 200) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return null;
  }

  for (const param of WEAVERSE_PREVIEW_PARAMS) {
    if (url.searchParams.has(param)) {
      return null;
    }
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase() ?? "";
  const second = segments[1]?.toLowerCase() ?? "";
  const routeSegment = LOCALE_SEGMENT_RE.test(first) ? second : first;
  if (UNCACHEABLE_SEGMENTS.has(routeSegment)) {
    return null;
  }

  return "public, max-age=300, stale-while-revalidate=86400";
}
