import {
  delocalizePath,
  localizePath,
  resolveLocaleFromRequest,
} from "~/utils/locale";

/** Looks a redirect up in Shopify; `null` when none matches. */
type LookupRedirect = (request: Request) => Promise<Response | null>;

const SINGLE_FETCH_DATA_SUFFIX = ".data";
const SINGLE_FETCH_ROOT_SEGMENT = "_root.data";
const SINGLE_FETCH_TRAILING_SLASH_SEGMENT = "_.data";

/**
 * The document path behind a React Router single-fetch request, and whether
 * the request was one (a client-side navigation).
 *
 * `/collections/all.data` → `/collections/all`, `/_root.data` → `/`, and
 * `/collections/_.data` → `/collections/` (a trailing-slash URL).
 */
function parseSingleFetchPathname(pathname: string) {
  if (!pathname.endsWith(SINGLE_FETCH_DATA_SUFFIX)) {
    return { pathname, isSoftNavigation: false };
  }
  if (pathname.endsWith(`/${SINGLE_FETCH_TRAILING_SLASH_SEGMENT}`)) {
    return {
      pathname: pathname.slice(0, -SINGLE_FETCH_TRAILING_SLASH_SEGMENT.length),
      isSoftNavigation: true,
    };
  }
  if (pathname.endsWith(`/${SINGLE_FETCH_ROOT_SEGMENT}`)) {
    const prefix = pathname.slice(0, -SINGLE_FETCH_ROOT_SEGMENT.length);
    return { pathname: prefix || "/", isSoftNavigation: true };
  }
  return {
    pathname: pathname.slice(0, -SINGLE_FETCH_DATA_SUFFIX.length),
    isSoftNavigation: true,
  };
}

/**
 * Resolves a Shopify URL redirect for a request that the app answered with 404,
 * keeping the shopper in the market they were already shopping.
 *
 * - **Markets.** Shopify stores URL redirects on market-neutral paths and
 *   `handleShopifyRedirects` matches the request path verbatim, so a localized
 *   URL never matches: `/collections/all` redirects on the default market
 *   while `/de-de/collections/all` 404s. The lookup is therefore delocalized
 *   and the target relocalized.
 * - **Client-side navigations.** Hydrogen 2026.10 only matches document paths,
 *   while a `<Link>` to a redirected URL fetches `/old-path.data`. The lookup
 *   uses the document path, and a matched redirect is answered the way
 *   classic Hydrogen's `storefrontRedirect` did: `204` with
 *   `X-Remix-Redirect`, which React Router follows client-side.
 *
 * `lookup` is injected so this decision can be exercised without Shopify: it is
 * `handleShopifyRedirects` bound to the storefront client in `server.ts`.
 * Resolves `null` when the 404 should stand.
 */
export async function marketAwareRedirect(
  request: Request,
  lookup: LookupRedirect,
): Promise<Response | null> {
  const locale = resolveLocaleFromRequest(request);
  const url = new URL(request.url);
  const { pathname, isSoftNavigation } = parseSingleFetchPathname(url.pathname);
  const neutralPath = delocalizePath(pathname);

  // The default market's document paths are already neutral, so the plain
  // lookup is both correct and one fewer `Request` allocation.
  const lookupUrl = new URL(url);
  lookupUrl.pathname = neutralPath;
  const redirected = await lookup(
    lookupUrl.pathname === url.pathname
      ? request
      : new Request(lookupUrl, request),
  );
  const location = redirected?.headers.get("Location");
  if (!redirected || !location) {
    return null;
  }

  const target = new URL(location, url);
  // An off-origin target is Shopify's own (checkout, admin); relocalizing it
  // would rewrite someone else's URL.
  const destination =
    target.origin === url.origin
      ? localizePath(target.pathname, locale) + target.search + target.hash
      : target.toString();

  // `Headers` overwrites on `set`; spreading into an object literal would
  // append a second value and produce a comma-joined header.
  const headers = new Headers(redirected.headers);
  if (isSoftNavigation) {
    headers.delete("Location");
    headers.set("X-Remix-Redirect", destination);
    headers.set("X-Remix-Status", String(redirected.status));
    return new Response(null, { status: 204, headers });
  }
  headers.set(
    "Location",
    target.origin === url.origin
      ? new URL(destination, url).toString()
      : destination,
  );
  return new Response(null, { status: redirected.status, headers });
}
