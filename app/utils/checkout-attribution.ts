/**
 * Forward ad-attribution URL parameters from the storefront onto the
 * Shopify checkout URL.
 *
 * Hydrogen storefronts live on one origin (e.g. `mystore.com`) and the
 * Shopify checkout lives on another (e.g. `checkout.mystore.com` or
 * `mystore.myshopify.com`). When a buyer arrives via a paid ad and the
 * landing URL carries identifiers like `?gclid=...` or `?utm_source=...`,
 * those identifiers stay on the storefront's URL only — they do NOT
 * automatically propagate to the checkout subdomain. Shopify's built-in
 * Customer Events / GA4 / Meta Pixel running on the checkout origin then
 * see organic / direct traffic, silently breaking last-click attribution
 * for every paid order.
 *
 * The fix is small and universal: whenever we hand the buyer off to the
 * Shopify checkout URL (either via the regular cart's "Continue to
 * Checkout" link or via Shopify's cart-permalink Buy-now flow), append
 * the standard set of attribution params from the storefront's current
 * URL onto the outbound checkout URL. The checkout's own tracking then
 * sees the same identifiers and ad-platform reports stay accurate.
 *
 * Existing params on the checkout URL are never overwritten — if the
 * caller already set something explicitly, that value wins.
 */

/**
 * The set of well-known ad / click / UTM identifiers worth forwarding.
 *
 * Limited to widely-recognised standard params on purpose — affiliate /
 * vendor-specific click IDs (e.g. `tj_clickid`, `awc`, `irclickid`) tend
 * to live in a first-party attribution cookie scoped to the apex domain
 * rather than on every checkout URL, so they don't need to round-trip
 * here. If your storefront also captures custom identifiers in URL
 * params, extend this list.
 */
export const FORWARDED_ATTRIBUTION_KEYS = [
  // Google / Bing / TikTok / Meta click IDs
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "ttclid",
  "msclkid",
  // UTM
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/**
 * Returns `checkoutUrl` with attribution params from `searchString`
 * appended (first-write-wins on key collisions — never clobbers params
 * the caller already set on the checkout URL).
 *
 * Falls back to the original `checkoutUrl` unchanged if either input
 * can't be parsed as a URL, so a malformed input never breaks the
 * checkout redirect.
 *
 * @param checkoutUrl   the outbound Shopify checkout URL
 * @param searchString  the storefront's current URL query string
 *                      (e.g. `request.url`'s search on the server, or
 *                      `window.location.search` in the browser)
 */
export function appendForwardedAttribution(
  checkoutUrl: string,
  searchString: string,
): string {
  if (!checkoutUrl) return checkoutUrl;
  if (!searchString) return checkoutUrl;

  let target: URL;
  try {
    target = new URL(checkoutUrl);
  } catch {
    return checkoutUrl;
  }

  const incoming = new URLSearchParams(searchString);
  for (const key of FORWARDED_ATTRIBUTION_KEYS) {
    const value = incoming.get(key);
    if (value && value.trim() !== "" && !target.searchParams.has(key)) {
      target.searchParams.set(key, value.trim());
    }
  }

  return target.toString();
}
