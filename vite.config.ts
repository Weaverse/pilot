import {reactRouter} from '@react-router/dev/vite';
import {hydrogen} from '@shopify/hydrogen/vite';
// import {oxygen} from '@shopify/mini-oxygen/vite';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({isSsrBuild}) => ({
  plugins: [
    hydrogen(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    // oxygen(),
    reactRouter(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  build: {
    assetsInlineLimit: 0,
    ...(!isSsrBuild && {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('react-player')) return 'vendor-media';
            if (id.includes('swiper')) return 'vendor-media';
            if (id.includes('react-share')) return 'vendor-social';
            if (id.includes('@phosphor-icons')) return 'vendor-icons';
            if (id.includes('@radix-ui')) return 'vendor-radix';
          },
        },
      },
    }),
  },
  server: {
    hmr: process.env.HMR !== 'false',
    warmup: {
      clientFiles: [
        './app/routes/**/*',
        './app/sections/**/*',
        './app/components/**/*',
      ],
    },
    allowedHosts: true,
  },
  ssr: {
    noExternal: [
      "use-sync-external-store",
      "void-elements",
      "deepmerge",
      "jsonp",
      "classnames",
      "react-share",
    ],
    optimizeDeps: {
      include: [
        "use-sync-external-store/shim",
        "void-elements",
        "deepmerge",
        "@radix-ui/react-primitive",
        "jsonp",
        "classnames",
        "react-share",
      ],
    },
  },
}));
