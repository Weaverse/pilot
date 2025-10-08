import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";
import { hydrogenRoutes } from "@shopify/hydrogen";

// Manual route definitions can be added to this array, in addition to or instead of using the `flatRoutes` file-based routing convention.
// See https://remix.run/docs/en/main/guides/routing for more details
export default hydrogenRoutes([
  route("robots.txt", "routes/seo/robots.ts"),
  ...prefix(":locale?", [
    index("routes/home.tsx"),
    route("search", "routes/search/index.tsx"),
    route(
      ":shopid/orders/:token/authenticate",
      "routes/others/order-redirect.tsx",
    ),
    route("sitemap.xml", "routes/seo/sitemap.ts"),
    route("sitemap/:type/:page.xml", "routes/seo/sitemap-page.ts"),
    route("pages/:pageHandle", "routes/pages/regular-page.tsx"),
    route("discount/:code", "routes/others/discount-code.tsx"),
    ...prefix("api", [
      route("countries", "routes/api/countries.ts"),
      route("customer", "routes/api/customer.ts"),
      route("featured-items", "routes/api/featured-items.ts"),
      route("klaviyo", "routes/api/klaviyo.ts"),
      route("predictive-search", "routes/api/predictive-search.ts"),
      route("products", "routes/api/products.ts"),
      route(":version/graphql.json", "routes/api/graphql.json.ts"),
      route("product/:productHandle/reviews?", "routes/api/product.ts"),
    ]),
    ...prefix("blogs", [
      route(":blogHandle", "routes/blogs/blog.tsx"),
      route(":blogHandle/:articleHandle", "routes/blogs/article.tsx"),
    ]),
    ...prefix("policies", [
      index("routes/policies/list.tsx"),
      route(":policyHandle", "routes/policies/policy.tsx"),
    ]),
    ...prefix("cart", [
      index("routes/cart/cart-page.tsx"),
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
      route("authorize", "routes/account/auth/authorize.ts"),
      route("login", "routes/account/auth/login.ts"),
      route("logout", "routes/account/auth/logout.ts"),
      layout("routes/account/layout.tsx", [
        index("routes/account/dashboard/index.tsx"),
        route("profile", "routes/account/profile.tsx"),
        route("edit", "routes/account/edit.tsx"),
        route("addresses", "routes/account/address/list.tsx"),
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
]) satisfies RouteConfig;
