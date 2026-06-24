import type { Config } from "@react-router/dev/config";
import { hydrogenPreset } from "@shopify/hydrogen/react-router-preset";

export default {
  presets: [hydrogenPreset()],
  appDirectory: "app",
  buildDirectory: "dist",
  ssr: true,
  // React Router 7.16 warns about two v8 future flags the Hydrogen preset does
  // not set. We explicitly opt out (the current resolved default) to silence the
  // warnings without changing behavior. This is deep-merged over the preset's
  // `future`, so its v8_middleware / v8_splitRouteModules stay enabled.
  //   - v8_passThroughRequests: in v8, React Router stops normalizing
  //     `request.url` (keeps the `.data` suffix + `_routes`/`index` params). This
  //     app reads `request.url` in ~46 places (getPaginationVariables,
  //     `new URL(request.url).searchParams` for collection filters, predictive
  //     search, cart, and api routes), so enabling it needs an audit. Hydrogen's
  //     preset has not validated it.
  //   - v8_trailingSlashAwareDataRequests: changes the data-request URL format.
  // Flip either to `true` only after verifying the affected loaders.
  future: {
    v8_passThroughRequests: false,
    v8_trailingSlashAwareDataRequests: false,
  },
} satisfies Config;
