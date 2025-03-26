import { vitePlugin as remix } from "@remix-run/dev";
import { hydrogen } from "@shopify/hydrogen/vite";
import { oxygen } from "@shopify/mini-oxygen/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
declare module "@remix-run/server-runtime" {
  interface Future {
    v3_singleFetch: true;
  }
}
export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    remix({
      presets: [hydrogen.preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
  },
  server: {
    warmup: {
      clientFiles: [
        "./app/routes/**/*",
        "./app/sections/**/*",
        "./app/components/**/*",
      ],
    },
  },
  ssr: {
    optimizeDeps: {
      include: [
        "jsonp",
        "classnames",
        "typographic-trademark",
        "typographic-single-spaces",
        "typographic-registered-trademark",
        "typographic-math-symbols",
        "typographic-en-dashes",
        "typographic-em-dashes",
        "typographic-ellipses",
        "typographic-currency",
        "typographic-copyright",
        "typographic-apostrophes-for-possessive-plurals",
        "typographic-quotes",
        "typographic-apostrophes",
        "textr",
      ],
    },
  },
});
