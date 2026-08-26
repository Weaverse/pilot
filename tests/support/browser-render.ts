import { mkdirSync, writeFileSync } from "node:fs";
import { type Browser, type BrowserContext, chromium } from "@playwright/test";
import { build, type Plugin } from "esbuild";

const APP_DIR = new URL("../../app/", import.meta.url);
const CACHE_DIR = new URL(
  "../../node_modules/.cache/pilot-tests/",
  import.meta.url,
);

/**
 * Resolves imports that exist in the dependency graph but not on disk.
 *
 * Same reasoning as the server harness: several packages declare peers that
 * were never installed, and esbuild fails the whole bundle on an unresolved
 * specifier. The stub throws if one is ever actually called.
 */
const stubUnresolvable: Plugin = {
  name: "stub-unresolvable",
  setup(esbuild) {
    const missing = /^(debug|custom-media-element|super-media-element)(\/|$)/;
    esbuild.onResolve({ filter: missing }, (args) => ({
      path: args.path,
      namespace: "stub-unresolvable",
    }));
    esbuild.onLoad(
      { filter: /.*/, namespace: "stub-unresolvable" },
      (args) => ({
        contents: `module.exports = new Proxy(function () {}, {
          get: () => {
            throw new Error(${JSON.stringify(`${args.path} is stubbed in tests but was used`)});
          },
        });`,
        loader: "js",
      }),
    );
  },
};

let browserPromise: Promise<Browser> | undefined;

/** Compiled mounts, keyed by everything that affects the bundle. */
const bundleCache = new Map<string, string>();

/**
 * One browser for the whole file: launching Chromium costs seconds, and these
 * tests differ by page, not by browser. Contexts stay per call for isolation.
 */
function sharedBrowser(): Promise<Browser> {
  browserPromise ??= chromium.launch();
  return browserPromise;
}

/** Closes the shared browser. Playwright calls this after the last test. */
export async function closeSharedBrowser(): Promise<void> {
  const browser = await browserPromise;
  browserPromise = undefined;
  await browser?.close();
}

/**
 * Mounts `entry`'s named export in a real browser and returns the API requests
 * it issued.
 *
 * These components build a URL during render and request it from an effect.
 * Effects never run under `renderToStaticMarkup`, and observing the URL as it
 * is built proves only that a string was computed — not that it was the one
 * fetched. A component can compute a localized path and request a different
 * literal, which is exactly the regression under test.
 *
 * So this hydrates for real and records what left the page. The browser is the
 * only place where "what did this component actually request" is a fact rather
 * than an inference.
 */
export async function apiRequestsFrom({
  entry,
  exportName,
  props,
  pathname,
  rootData,
  wrapInTranslationProvider = true,
  click,
}: {
  entry: string;
  exportName: string;
  props: Record<string, unknown>;
  pathname: string;
  rootData?: Record<string, unknown>;
  wrapInTranslationProvider?: boolean;
  /** Clicked after mount, for components that only request once opened. */
  click?: string;
}): Promise<string[]> {
  const theme = {
    pcardEnableQuickShop: true,
    ...((rootData?.weaverseTheme as { theme?: object })?.theme ?? {}),
  };

  const entrySource = `
    import { createElement } from "react";
    import { createRoot } from "react-dom/client";
    import { createBrowserRouter, RouterProvider } from "react-router";
    import { TranslationProvider } from "@weaverse/hydrogen";
    import { ${exportName} as Subject } from ${JSON.stringify(new URL(entry, APP_DIR).pathname)};

    const loaderData = ${JSON.stringify({
      ...(rootData ?? {}),
      weaverseTheme: {
        theme,
        staticContent: {},
        merchantOverrides: null,
      },
    })};

    function Mounted() {
      const subject = createElement(Subject, ${JSON.stringify(props)});
      return ${wrapInTranslationProvider}
        ? createElement(TranslationProvider, {
            staticContent: {},
            merchantOverrides: null,
            children: subject,
          })
        : subject;
    }

    // useFetcher().load routes through the data layer, so a fetcher target
    // only reaches the network if a route claims it. These loaders fetch the
    // URL the component asked for, which is precisely what the test observes.
    const router = createBrowserRouter([
      {
        id: "api",
        path: ":locale?/api/*",
        loader: ({ request }) => fetch(request.url),
      },
      { id: "root", path: "*", loader: () => loaderData, Component: Mounted },
    ]);

    createRoot(document.getElementById("root")).render(
      createElement(RouterProvider, { router }),
    );
  `;

  const entryPath = new URL("browser-entry.jsx", CACHE_DIR);
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(entryPath, entrySource);

  // Bundling dominates the cost of a mount and depends only on the entry, the
  // export and the props, so identical mounts across markets reuse it. The
  // pathname is not part of the key: it is supplied by navigation, not the
  // bundle, which is what makes the market a runtime decision here just as it
  // is in production.
  const cacheKey = `${entry}|${exportName}|${JSON.stringify(props)}|${JSON.stringify(rootData ?? {})}|${wrapInTranslationProvider}`;
  const cached = bundleCache.get(cacheKey);
  const out = cached
    ? undefined
    : await build({
        entryPoints: [entryPath.pathname],
        bundle: true,
        write: false,
        format: "iife",
        platform: "browser",
        jsx: "automatic",
        target: "es2022",
        resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
        alias: { "~": new URL(".", APP_DIR).pathname },
        plugins: [stubUnresolvable],
        define: { "process.env.NODE_ENV": '"development"' },
        logLevel: "silent",
      });

  const script =
    cached ??
    Buffer.from(
      (out as NonNullable<typeof out>).outputFiles[0].contents,
    ).toString("utf8");
  bundleCache.set(cacheKey, script);
  const browser = await sharedBrowser();
  const requested: string[] = [];
  const consoleErrors: string[] = [];
  let context: BrowserContext | undefined;

  try {
    // A fresh context per call: cookies, storage and routes cannot leak from
    // one market's assertion into the next.
    context = await browser.newContext();
    const page = await context.newPage();
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.includes("/api/")) {
        requested.push(url.pathname + url.search);
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ count: 0, product: null }),
        });
      }
      if (url.pathname === pathname) {
        return route.fulfill({
          status: 200,
          contentType: "text/html",
          body: '<!doctype html><html><body><div id="root"></div></body></html>',
        });
      }
      return route.fulfill({ status: 200, body: "" });
    });

    page.on("console", (m) => {
      if (m.type() === "error") {
        consoleErrors.push(m.text().slice(0, 200));
      }
    });
    page.on("pageerror", (e) =>
      consoleErrors.push(`pageerror: ${e.message.slice(0, 200)}`),
    );
    await page.goto(`http://pilot.test${pathname}`);
    await page.addScriptTag({ content: script });
    await page.waitForSelector("#root *", { timeout: 5000 }).catch(() => {
      throw new Error(
        `component did not mount: ${consoleErrors.join(" | ") || "no error reported"}`,
      );
    });

    if (click) {
      // Quick shop only fetches once a shopper opens it, which is the
      // behaviour under test: the URL is built during render but requested
      // here, and only the request proves which one the component uses.
      await page.click(click);
    }

    // The request is issued from an effect, and these components have no
    // loading state to wait on. Waiting a fixed time would turn a slow machine
    // into a false pass — the exact failure this suite exists to prevent — so
    // wait for the request itself and only fall through once it is certain
    // none is coming.
    // These components request from an effect and have no loading state, so
    // there is nothing in the DOM to wait for. Waiting a fixed time would make
    // a slow machine a false pass; waiting for a request would make the
    // no-request case cost a full timeout on every run. `networkidle` settles
    // on the page's own activity: it returns as soon as the burst finishes,
    // and just as promptly when there was never going to be one.
    await page.waitForLoadState("networkidle");
    // React Router renders its default error boundary when a component throws,
    // so a crashed component still satisfies `#root *` and would report "made
    // no requests" — indistinguishable from the regression under test.
    const crashed = await page.$("#root h2");
    if (crashed) {
      throw new Error(
        `component crashed instead of rendering: ${consoleErrors[0] ?? (await crashed.textContent())}`,
      );
    }
  } finally {
    await context.close();
  }

  return requested;
}
