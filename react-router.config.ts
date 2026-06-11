import type { Config } from "@react-router/dev/config";
import { hydrogenPreset } from "@shopify/hydrogen/react-router-preset";

export default {
  presets: [hydrogenPreset()],
  appDirectory: "app",
  buildDirectory: "dist",
  ssr: true,
  // Silence the React Router future-flag warning without changing runtime
  // behavior. RR 7.16 exposes this as an `unstable_` option; keep current
  // trailing-slash data-request behavior until Hydrogen validates the v8 path.
  future: {
    unstable_trailingSlashAwareDataRequests: false,
  },
} satisfies Config;
