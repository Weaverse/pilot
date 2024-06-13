// vite.config.ts
import { defineConfig } from "file:///Users/paul/Workspace/Weaverse/weaverse/templates/pilot/node_modules/vite/dist/node/index.js";
import { hydrogen } from "file:///Users/paul/Workspace/Weaverse/weaverse/templates/pilot/node_modules/@shopify/hydrogen/dist/vite/plugin.js";
import { oxygen } from "file:///Users/paul/Workspace/Weaverse/weaverse/templates/pilot/node_modules/@shopify/mini-oxygen/dist/vite/plugin.js";
import { vitePlugin as remix } from "file:///Users/paul/Workspace/Weaverse/weaverse/templates/pilot/node_modules/@remix-run/dev/dist/index.js";
import tsconfigPaths from "file:///Users/paul/Workspace/Weaverse/weaverse/templates/pilot/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    remix({ presets: [hydrogen.preset()] }),
    tsconfigPaths()
  ],
  ssr: {
    optimizeDeps: {
      include: ["typographic-base/index", "textr"]
    }
  },
  server: {
    warmup: {
      clientFiles: [
        "./app/entry.client.tsx",
        "./app/root.tsx",
        "./app/routes/**/*"
      ]
    }
  },
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcGF1bC9Xb3Jrc3BhY2UvV2VhdmVyc2Uvd2VhdmVyc2UvdGVtcGxhdGVzL3BpbG90XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcGF1bC9Xb3Jrc3BhY2UvV2VhdmVyc2Uvd2VhdmVyc2UvdGVtcGxhdGVzL3BpbG90L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9wYXVsL1dvcmtzcGFjZS9XZWF2ZXJzZS93ZWF2ZXJzZS90ZW1wbGF0ZXMvcGlsb3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgaHlkcm9nZW4gfSBmcm9tIFwiQHNob3BpZnkvaHlkcm9nZW4vdml0ZVwiO1xuaW1wb3J0IHsgb3h5Z2VuIH0gZnJvbSBcIkBzaG9waWZ5L21pbmktb3h5Z2VuL3ZpdGVcIjtcbmltcG9ydCB7IHZpdGVQbHVnaW4gYXMgcmVtaXggfSBmcm9tIFwiQHJlbWl4LXJ1bi9kZXZcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBoeWRyb2dlbigpLFxuICAgIG94eWdlbigpLFxuICAgIHJlbWl4KHsgcHJlc2V0czogW2h5ZHJvZ2VuLnByZXNldCgpXSB9KSxcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gIF0sXG4gIHNzcjoge1xuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogW1widHlwb2dyYXBoaWMtYmFzZS9pbmRleFwiLCBcInRleHRyXCJdLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHdhcm11cDoge1xuICAgICAgY2xpZW50RmlsZXM6IFtcbiAgICAgICAgXCIuL2FwcC9lbnRyeS5jbGllbnQudHN4XCIsXG4gICAgICAgIFwiLi9hcHAvcm9vdC50c3hcIixcbiAgICAgICAgXCIuL2FwcC9yb3V0ZXMvKiovKlwiLFxuICAgICAgXSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIC8vIEFsbG93IGEgc3RyaWN0IENvbnRlbnQtU2VjdXJpdHktUG9saWN5XG4gICAgLy8gd2l0aHRvdXQgaW5saW5pbmcgYXNzZXRzIGFzIGJhc2U2NDpcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogMCxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1VixTQUFTLG9CQUFvQjtBQUNwWCxTQUFTLGdCQUFnQjtBQUN6QixTQUFTLGNBQWM7QUFDdkIsU0FBUyxjQUFjLGFBQWE7QUFDcEMsT0FBTyxtQkFBbUI7QUFFMUIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLElBQ1AsTUFBTSxFQUFFLFNBQVMsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFBQSxJQUN0QyxjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQywwQkFBMEIsT0FBTztBQUFBLElBQzdDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sYUFBYTtBQUFBLFFBQ1g7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBQUE7QUFBQSxJQUdMLG1CQUFtQjtBQUFBLEVBQ3JCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
