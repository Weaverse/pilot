import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "esbuild";
import {
  type ComponentType,
  createElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";

const APP_DIR = new URL("../../app/", import.meta.url);
const CACHE_DIR = new URL(
  "../../node_modules/.cache/pilot-tests/",
  import.meta.url,
);

/**
 * Compiles an app component and returns its module.
 *
 * Playwright owns the JSX runtime for files under `testDir`, and its elements
 * are not React nodes — importing an app `.tsx` directly yields objects React
 * refuses to render. Compiling with esbuild (already installed; the bundler
 * `@shopify/cli` ships) produces real `react/jsx-runtime` calls, so the
 * component under test is the one that ships.
 */
export async function loadComponent<T = Record<string, ComponentType<never>>>(
  entry: string,
): Promise<T> {
  return loadAppModule<T>(entry);
}

/**
 * Compiles any app module and returns it.
 *
 * Route modules import UI chains that use extensionless deep paths — legal for
 * a bundler, unresolvable for Node's ESM loader — so the module a test imports
 * has to be bundled the way the app itself is, not resolved by hand.
 */
export async function loadAppModule<T>(entry: string): Promise<T> {
  const out = await build({
    entryPoints: [new URL(entry, APP_DIR).pathname],
    bundle: true,
    write: false,
    format: "esm",
    platform: "neutral",
    jsx: "automatic",
    target: "es2022",
    external: [
      "react",
      "react/jsx-runtime",
      "react-dom",
      "react-dom/server",
      "react-router",
      "@weaverse/*",
      "@shopify/*",
      "@radix-ui/*",
      "clsx",
    ],
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    alias: { "~": new URL(".", APP_DIR).pathname },
    logLevel: "silent",
  });

  mkdirSync(CACHE_DIR, { recursive: true });
  const compiled = new URL(
    `${entry.replace(/[^a-z0-9]/gi, "-")}.mjs`,
    CACHE_DIR,
  );
  writeFileSync(compiled, out.outputFiles[0].contents);
  return (await import(compiled.href)) as T;
}

/**
 * Renders `children` under a real router whose root loader returns `rootData`.
 *
 * `useThemeSettings` reads `weaverseTheme` from the root route's loader data,
 * so a component can only be exercised inside a router that actually has one.
 */
export async function renderInApp(
  rootData: Record<string, unknown>,
  children: (() => ReactElement) | ReactNode,
): Promise<string> {
  const routes = [
    {
      id: "root",
      path: "/",
      loader: () => rootData,
      Component: typeof children === "function" ? children : () => children,
    },
  ];
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request("http://localhost/"));
  // A `Response` means the route redirected or threw; there is no tree to
  // render and a test asserting on markup would silently pass on empty output.
  if (context instanceof Response) {
    throw new Error(`root route did not render: ${context.status}`);
  }
  const router = createStaticRouter(routes, context);

  return renderToStaticMarkup(
    createElement(StaticRouterProvider, { router, context, hydrate: false }),
  );
}
