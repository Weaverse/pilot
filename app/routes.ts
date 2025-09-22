import { type RouteConfig, route } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";
import { hydrogenRoutes } from "@shopify/hydrogen";

// Manual route definitions can be added to this array, in addition to or instead of using the `flatRoutes` file-based routing convention.
// See https://remix.run/docs/en/main/guides/routing for more details
export default hydrogenRoutes([
  // APIs
  route(
    "/:locale?/api/product/:productHandle/reviews?",
    "routes/api/product.$productHandle.ts",
  ),
  // Flat routes for all other files in the routes directory
  ...(await flatRoutes()),
]) satisfies RouteConfig;
