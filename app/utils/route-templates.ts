import { createShopifyRouteTemplates } from "@shopify/hydrogen";

/**
 * How Shopify resources map to Pilot's routes. Hydrogen's request handlers use
 * this for `?variant=` product links and Shopify URL redirects, and
 * `ShopifyScripts` uses it to build links. Market prefixes are never part of a
 * template; Hydrogen adds `i18n.pathPrefix` itself.
 *
 * Pilot has no `/collections/:collectionHandle/products/:productHandle` route,
 * so products inside a collection resolve to the product page.
 */
export const routeTemplates = createShopifyRouteTemplates({
  productInCollection: "/products/:productHandle",
});
