import { flatRoutes } from "@remix-run/fs-routes";
import { type RouteConfig, layout } from "@remix-run/route-config";
import { hydrogenRoutes } from "@shopify/hydrogen";

export default hydrogenRoutes([
  // Your entire app reading from routes folder using Layout from layout.tsx
  layout("./layout.tsx", await flatRoutes()),
]) satisfies RouteConfig;
