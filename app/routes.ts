import {
  index,
  prefix,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";
import { hydrogenRoutes } from "@shopify/hydrogen";

// Manual route definitions can be added to this array, in addition to or instead of using the `flatRoutes` file-based routing convention.
// See https://remix.run/docs/en/main/guides/routing for more details
export default hydrogenRoutes([
  route("robots.txt", "routes/robots-txt.ts"),
  ...prefix(":locale?", [
    index("routes/home.tsx"),
    route("search", "routes/search.tsx"),
    route("sitemap.xml", "routes/sitemap/all.ts"),
    route("sitemap/:type/:page.xml", "routes/sitemap/page.ts"),
    route("pages/:pageHandle", "routes/page.tsx"),
    route("discount/:code", "routes/discount.tsx"),
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
    route("*", "routes/catch-all.tsx"),
  ]),
  // Flat routes for all other files in the routes directory
  // ...(await flatRoutes()),
]) satisfies RouteConfig;
