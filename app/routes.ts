import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

// Hydrogen's request handlers answer the routes it owns (`/api/cart`, the
// Storefront API proxy, checkout and cart permalinks, Customer Account OAuth)
// in `server.ts`, before React Router sees the request.
export default [
  route("robots.txt", "routes/seo/robots.ts"),
  route("manifest.webmanifest", "routes/pwa/manifest.webmanifest.ts"),
  ...prefix(":locale?", [
    index("routes/home.tsx"),
    route("search", "routes/search/index.tsx"),
    route(
      ":shopid/orders/:token/authenticate",
      "routes/others/order-redirect.tsx",
    ),
    route("sitemap.xml", "routes/seo/sitemap.ts"),
    route("sitemap/:type/:page.xml", "routes/seo/sitemap-page.ts"),
    route("sitemap-weaverse.xml", "routes/seo/sitemap-weaverse.xml.ts"),
    route("pages/:pageHandle", "routes/pages/regular-page.tsx"),
    route("discount/:code", "routes/others/discount-code.tsx"),
    ...prefix("api", [
      route("customer", "routes/api/customer.ts"),
      route("featured-products", "routes/api/featured-products.ts"),
      route("klaviyo", "routes/api/klaviyo.ts"),
      route("products", "routes/api/products.ts"),
      route("product/:productHandle", "routes/api/product.ts"),
      route(
        "collection/:handle/product-count",
        "routes/api/collection-product-count.ts",
      ),
      route("product/:productHandle/reviews", "routes/api/reviews.ts"),
    ]),
    ...prefix("blogs", [
      route(":blogHandle", "routes/blogs/blog.tsx"),
      route(":blogHandle/:articleHandle", "routes/blogs/article.tsx"),
    ]),
    // Redirect legacy article URLs emitted by Hydrogen's default sitemap.
    route("articles/:articleHandle", "routes/blogs/article-redirect.tsx"),
    ...prefix("policies", [
      index("routes/policies/list.tsx"),
      route(":policyHandle", "routes/policies/policy.tsx"),
    ]),
    ...prefix("cart", [
      index("routes/cart/cart-page.tsx"),
      route("checkout", "routes/cart/checkout.tsx"),
      route(":lines", "routes/cart/lines.tsx"),
    ]),
    ...prefix("collections", [
      index("routes/collections/list.tsx"),
      route(":collectionHandle", "routes/collections/collection.tsx"),
    ]),
    ...prefix("products", [
      index("routes/products/list.tsx"),
      route(":productHandle", "routes/products/product.tsx"),
    ]),
    ...prefix("account", [
      layout("routes/account/layout.tsx", [
        index("routes/account/dashboard/index.tsx"),
        route("profile", "routes/account/profile.tsx"),
        route("edit", "routes/account/edit.tsx"),
        route("addr", "routes/account/address/list.tsx"),
        route("address/:id", "routes/account/address/index.tsx"),
        ...prefix("orders", [
          index("routes/account/orders/list.tsx"),
          route(":id", "routes/account/orders/order.tsx"),
        ]),
        route("*", "routes/account/catch-all.ts"),
      ]),
    ]),
    route("*", "routes/catch-all.tsx"),
  ]),
] satisfies RouteConfig;
