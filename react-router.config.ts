import type { Config } from "@react-router/dev/config";
import { hydrogenPreset } from "@shopify/hydrogen/react-router-preset";

export default {
  presets: [hydrogenPreset()],
  appDirectory: "app",
  buildDirectory: "dist",
  ssr: true,
  // Silence the React Router v8 future-flag warnings without changing runtime
  // behavior. The Hydrogen preset enables v8_middleware/v8_splitRouteModules but
  // deliberately leaves these two unset, so we keep current (v7) behavior by
  // pinning them to false. RR deep-merges this on top of the preset's `future`.
  // Flip to true (and test) once Hydrogen validates v8 request handling.
  future: {
    v8_passThroughRequests: false,
    v8_trailingSlashAwareDataRequests: false,
  },
} satisfies Config;
