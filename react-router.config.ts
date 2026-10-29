import type { Config } from "@react-router/dev/config";

// Hydrogen 2026.10 has no React Router preset. These are the values the
// classic `hydrogenPreset()` applied, which Shopify's 2026.10 template keeps.
export default {
  appDirectory: "app",
  // `shopify hydrogen deploy --assets-dir dist/client --worker-dir dist/server`
  // reads this directory; React Router's default is `build/`.
  buildDirectory: "dist",
  ssr: true,
  subResourceIntegrity: false,
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: false,
    unstable_optimizeDeps: true,
    v8_passThroughRequests: true,
    v8_trailingSlashAwareDataRequests: true,
  },
} satisfies Config;
