import { reactRouter } from "@react-router/dev/vite";
import { hydrogen } from "@shopify/hydrogen/vite";
import { oxygen } from "@shopify/mini-oxygen/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vite-plus";
// Client-only heavy modules replaced with a stub in the SSR build. The
// worker bundle inlines all dynamic imports, so React.lazy alone cannot
// keep them out of the server file — react-player's media stack (hls.js,
// dashjs, media-chrome, Mux/Vimeo) is ~3MB of cold-start parse cost that
// can only ever run in a browser. See app/utils/ssr-client-only-stub.ts.
const SSR_STUBBED_MODULES = new Set(["react-player"]);
function ssrStubClientOnlyModules(): Plugin {
  return {
    name: "ssr-stub-client-only-modules",
    enforce: "pre",
    resolveId(id, _importer, options) {
      if (options?.ssr && SSR_STUBBED_MODULES.has(id)) {
        return fileURLToPath(
          new URL("./app/utils/ssr-client-only-stub.ts", import.meta.url),
        );
      }
      return null;
    },
  };
}
export default defineConfig(({ isSsrBuild }) => ({
  fmt: {
    ignorePatterns: [
      ".weaverse/**",
      ".react-router/**",
      ".shopify/**",
      "app/styles/**",
      "**/*.md",
      "dist/**",
      "node_modules/**",
    ],
    printWidth: 80,
    singleQuote: false,
    sortTailwindcss: {
      functions: ["clsx", "cva", "cn"],
    },
    trailingComma: "all",
  },
  lint: {
    ignorePatterns: [
      ".weaverse/**",
      ".react-router/**",
      ".shopify/**",
      "app/styles/**",
      "dist/**",
      "node_modules/**",
    ],
    jsPlugins: ["./other/oxlint-sonarjs-plugin.js"],
    plugins: ["typescript", "unicorn", "oxc", "react", "jsx-a11y"],
    rules: {
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/autocomplete-valid": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "no-alert": "off",
      "no-console": "off",
      "no-eval": "error",
      "no-magic-numbers": "off",
      "no-shadow": "warn",
      "no-unsafe-optional-chaining": "error",
      "no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "none",
          ignoreRestSiblings: true,
          vars: "local",
          varsIgnorePattern: ".*",
        },
      ],
      "sonarjs/cognitive-complexity": ["error", 50],
      "react/button-has-type": "warn",
      "react/exhaustive-deps": "warn",
      "react/no-children-prop": "warn",
      "react/no-danger": "off",
      "react/rules-of-hooks": "error",
    },
  },
  plugins: [
    hydrogen(),
    oxygen(),
    reactRouter(),
    tailwindcss(),
    ssrStubClientOnlyModules(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    assetsInlineLimit: 0,
    ...(!isSsrBuild && {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // Do NOT force react-player into a manual chunk: it is
            // lazy()-imported only by the hero-video section. Co-locating it
            // with an eager dep (swiper, used by the homepage slideshow) drags
            // its media stack (hls/mux/vimeo) onto every page and defeats the
            // lazy boundary. Let Rollup split it with its dynamic import.
            if (id.includes("swiper")) return "vendor-media";
            if (id.includes("react-share")) return "vendor-social";
            if (id.includes("@radix-ui")) return "vendor-radix";
          },
        },
      },
    }),
  },
  server: {
    hmr: process.env.HMR !== "false",
    warmup: {
      clientFiles: [
        "./app/routes/**/*",
        "./app/sections/**/*",
        "./app/components/**/*",
      ],
    },
    allowedHosts: true,
  },
  ssr: {
    optimizeDeps: {
      include: [
        "@radix-ui/react-primitive",
        "jsonp",
        "classnames",
        "react-share",
      ],
    },
  },
}));
