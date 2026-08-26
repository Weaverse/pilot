import {
  delocalizePath,
  localizePath,
  resolveLocaleFromRequest,
} from "~/utils/locale";

/** Looks a redirect up in Shopify and returns its response. */
type LookupRedirect = (request: Request) => Promise<Response>;

/**
 * Resolves a Shopify URL redirect for a request that the app answered with 404,
 * keeping the shopper in the market they were already shopping.
 *
 * Shopify stores URL redirects on market-neutral paths and `storefrontRedirect`
 * matches the request path verbatim, so a localized URL never matches:
 * `/collections/all` redirects on the default market while
 * `/de-de/collections/all` 404s. The lookup is therefore delocalized and the
 * target relocalized.
 *
 * `lookup` is injected so this decision can be exercised without Shopify: it is
 * `storefrontRedirect` bound to the request context in `server.ts`.
 */
export async function marketAwareRedirect(
  request: Request,
  notFound: Response,
  lookup: LookupRedirect,
): Promise<Response> {
  const locale = resolveLocaleFromRequest(request);
  const url = new URL(request.url);
  const neutralPath = delocalizePath(url.pathname);

  // The default market's paths are already neutral, so the plain lookup is
  // both correct and one fewer `Request` allocation.
  if (neutralPath === url.pathname) {
    return lookup(request);
  }

  url.pathname = neutralPath;
  const redirected = await lookup(new Request(url, request));

  // A single-fetch navigation is answered with 204 + `X-Remix-Redirect` and no
  // `Location`, so both carriers must be read: handling only `Location` drops
  // every client-side redirect back to a 404.
  const header = redirected.headers.get("Location")
    ? "Location"
    : "X-Remix-Redirect";
  const location = redirected.headers.get(header);

  if (!location || redirected.status === 404) {
    return notFound;
  }

  const target = new URL(location, url);

  // An off-origin target is Shopify's own (checkout, admin); relocalizing it
  // would rewrite someone else's URL.
  if (target.origin !== url.origin) {
    return redirected;
  }

  const localized = localizePath(target.pathname, locale) + target.search;
  // `Headers` overwrites on `set`; spreading into an object literal would
  // append a second value and produce a comma-joined header.
  const headers = new Headers(redirected.headers);
  headers.set(
    header,
    // `X-Remix-Redirect` carries an app-relative path; `Location` is absolute,
    // matching what Hydrogen emitted.
    header === "Location" ? new URL(localized, url).toString() : localized,
  );

  return new Response(null, { status: redirected.status, headers });
}
