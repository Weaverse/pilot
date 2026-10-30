/**
 * Parses a Shopify global ID (`gid://shopify/Product/123?foo=bar#x`) into its
 * parts. Ported from classic hydrogen-react's `parseGid` (same return shape and
 * fallbacks), which Hydrogen 2026.10 no longer exports.
 */
export function parseGid(gid: string | undefined): {
  id: string;
  resource: string | null;
  resourceId: string | null;
  search: string;
  searchParams: URLSearchParams;
  hash: string;
} {
  let defaultReturn = {
    id: "",
    resource: null,
    resourceId: null,
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
  };
  if (typeof gid !== "string") {
    return defaultReturn;
  }
  try {
    let { search, searchParams, pathname, hash } = new URL(gid);
    let pathnameParts = pathname.split("/");
    let lastPathnamePart = pathnameParts[pathnameParts.length - 1];
    let resourcePart = pathnameParts[pathnameParts.length - 2];
    if (!(lastPathnamePart && resourcePart)) {
      return defaultReturn;
    }
    return {
      id: `${lastPathnamePart}${search}${hash}` || "",
      resource: resourcePart ?? null,
      resourceId: lastPathnamePart || null,
      search,
      searchParams,
      hash,
    };
  } catch {
    return defaultReturn;
  }
}

/**
 * Points `window.Shopify` at another market after a client-side navigation.
 *
 * `<ShopifyScripts>` writes the market (country, currency, locale, routes
 * root) into `window.Shopify` once, from its first props. Without this,
 * Shopify's analytics and web components keep reporting the market the
 * visitor landed on. Mirrors the fields of Hydrogen's bootstrap script.
 */
export function syncShopifyMarket({
  country,
  language,
  currency,
  pathPrefix,
}: {
  country: string;
  language: string;
  currency: string;
  pathPrefix: string;
}) {
  const shopify = typeof window === "undefined" ? undefined : window.Shopify;
  if (!shopify) {
    return;
  }
  shopify.country = country;
  shopify.currency = { ...shopify.currency, active: currency.toUpperCase() };
  shopify.locale = language.toLowerCase();
  if (shopify.routes) {
    shopify.routes.root = pathPrefix ? `${pathPrefix}/` : "/";
  }
  if (shopify.components?.config) {
    shopify.components.config.country = country;
    shopify.components.config.language = shopify.locale;
  }
}
