import { expect, test } from "@playwright/test";
import { createElement, type ReactElement } from "react";
import {
  type AppLoadContext,
  createStaticHandler,
  type LoaderFunctionArgs,
} from "react-router";
import { createHydrogenRouterContext } from "../../app/.server/context";
import { loadCriticalData } from "../../app/.server/root";
import { rootHeaders, routeHeaders } from "../../app/utils/cache";
import { getFullPageCacheControl } from "../../app/utils/full-page-cache";
import { weaverseRouteFailure } from "../../app/weaverse/load-failure";
import { loadComponent, renderInApp } from "../support/render-app";
import {
  installWorkerCaches,
  TEST_ENV,
  TEST_EXECUTION_CONTEXT,
} from "../support/hydrogen-env";

/**
 * What a storefront answers when Weaverse cannot provide a page or the theme
 * settings, driven through the real request context and route loaders.
 *
 * Before this, every page-load failure resolved to `null` — the value a
 * missing page produces — so an outage answered 404, and theme failures
 * rendered Pilot's demo logo and social links as the merchant's own.
 */

type Answer = { status: number; body: unknown };

/** Runs `run` with the Weaverse page API answering `page`. */
async function withWeaverse<T>(page: Answer, run: () => Promise<T>) {
  const realFetch = globalThis.fetch;
  const restoreCaches = installWorkerCaches();
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    const answer = url.endsWith("/api/public/project")
      ? page
      : { status: 200, body: {} };
    return new Response(JSON.stringify(answer.body), {
      status: answer.status,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  try {
    return await run();
  } finally {
    globalThis.fetch = realFetch;
    restoreCaches();
  }
}

const PROJECT = { id: "test-project", name: "P", weaverseShopId: "s" };
const UNAVAILABLE = { status: 503, body: {} };
const MALFORMED = { status: 200, body: { unexpected: true } };
const REFUSED = { status: 403, body: { error: "Forbidden" } };
const NO_PROJECT = { status: 404, body: { error: "Project not found" } };
const UNASSIGNED = {
  status: 200,
  body: { page: null, project: PROJECT, pageAssignment: {} },
};

/** The status and cache policy the home route's loader answers with. */
async function homeLoaderAnswer(
  page: Answer,
  url = "https://shop.test/",
): Promise<{ status: number | "ok"; cacheControl: string | null }> {
  const { loader } = await loadComponent<{
    loader: (args: LoaderFunctionArgs) => Promise<unknown>;
  }>("routes/home.tsx");

  return withWeaverse(page, async () => {
    const request = new Request(url);
    const context = (await createHydrogenRouterContext(
      request,
      TEST_ENV,
      TEST_EXECUTION_CONTEXT,
    )) as unknown as AppLoadContext;
    // Shop query only: the storefront API is not under test here.
    context.storefront.query = (async () => ({
      shop: { name: "Acme", description: "" },
    })) as typeof context.storefront.query;
    try {
      await loader({ request, context, params: {} } as LoaderFunctionArgs);
      return { status: "ok" as const, cacheControl: null };
    } catch (thrown) {
      // React Router's `data()` throws a DataWithResponseInit; a plain
      // `Response` is what the 404 path throws.
      const init =
        thrown instanceof Response
          ? { status: thrown.status, headers: thrown.headers }
          : (thrown as { init: ResponseInit }).init;
      return {
        status: init.status ?? 0,
        cacheControl: new Headers(init.headers).get("Cache-Control"),
      };
    }
  });
}

test("an unavailable page API answers 503 and is never cached", async () => {
  expect(await homeLoaderAnswer(UNAVAILABLE)).toEqual({
    status: 503,
    cacheControl: "no-store",
  });
});

test("a successful response that is not a page answers 503", async () => {
  expect(await homeLoaderAnswer(MALFORMED)).toEqual({
    status: 503,
    cacheControl: "no-store",
  });
});

test("a refused request answers 500, not a retryable outage", async () => {
  expect(await homeLoaderAnswer(REFUSED)).toEqual({
    status: 500,
    cacheControl: "no-store",
  });
});

test("a project that does not exist still answers 404", async () => {
  expect((await homeLoaderAnswer(NO_PROJECT)).status).toBe(404);
});

test("a URL with no assigned page still answers 404", async () => {
  expect((await homeLoaderAnswer(UNASSIGNED)).status).toBe(404);
});

test("an unassigned page still renders in design mode", async () => {
  const answer = await homeLoaderAnswer(
    UNASSIGNED,
    "https://shop.test/?isDesignMode=true&weaverseProjectId=test-project",
  );

  expect(answer.status).toBe("ok");
});

/** A root-loader context whose theme settings failed to load. */
function rootContext(theme: Record<string, unknown>) {
  const shop = {
    id: "gid://shopify/Shop/1",
    name: "Acme",
    description: "",
    primaryDomain: { url: "https://shop.test" },
    brand: null,
  };
  return {
    storefront: {
      i18n: { language: "EN", country: "US", hreflang: "en-US" },
      query: async () => ({
        shop,
        headerMenu: null,
        footerMenu: null,
        localization: {
          language: { isoCode: "EN" },
          country: { currency: { isoCode: "USD" } },
        },
      }),
      CacheLong: () => undefined,
    },
    weaverse: { loadThemeSettings: async () => theme },
    env: {},
  };
}

const FAILED_THEME = {
  theme: {
    logoData: { url: "https://cdn.test/Pilot_logo.png" },
    socialFacebook: "https://www.facebook.com/weaverse",
    newsletterPopupEnabled: true,
  },
  staticContent: {
    footer: { copyright: "© 2024 Weaverse.", storeEmail: "contact@my-store" },
  },
  _error: "HTTP 503: Service Unavailable",
  _loadFailed: true,
};

async function rootData(theme: Record<string, unknown>) {
  return loadCriticalData({
    request: new Request("https://shop.test/"),
    context: rootContext(theme),
    params: {},
  } as unknown as LoaderFunctionArgs);
}

test("unavailable theme settings render without demo branding", async () => {
  const { weaverseTheme } = await rootData(FAILED_THEME);
  const theme = weaverseTheme.theme as Record<string, unknown>;
  const footer = (weaverseTheme.staticContent as Record<string, never>)
    .footer as Record<string, string>;

  expect({
    logo: theme.logoData,
    social: theme.socialFacebook,
    popup: theme.newsletterPopupEnabled,
    copyright: footer.copyright,
    email: footer.storeEmail,
    diagnostic: weaverseTheme._error,
  }).toEqual({
    logo: null,
    social: "",
    popup: false,
    copyright: "",
    email: "",
    diagnostic: undefined,
  });
});

test("loaded theme settings are passed through unchanged", async () => {
  const loaded = { ...FAILED_THEME, _loadFailed: undefined, _error: undefined };

  const { weaverseTheme, themeUnavailable } = await rootData(loaded);

  expect({
    logo: (weaverseTheme.theme as Record<string, unknown>).logoData,
    themeUnavailable,
  }).toEqual({ logo: loaded.theme.logoData, themeUnavailable: false });
});

test("a document rendered without the theme stays out of every cache", async () => {
  // The root answers no-store; the route's own policy and the full-page
  // cache must both keep it.
  const root = new Headers({ "Cache-Control": "no-store" });

  const route = routeHeaders({
    loaderHeaders: new Headers({ "Cache-Control": "public, max-age=3600" }),
    parentHeaders: root,
  })["Cache-Control"];
  const fullPage = getFullPageCacheControl(
    new Request("https://shop.test/"),
    200,
    route,
  );

  expect({ route, fullPage }).toEqual({ route: "no-store", fullPage: null });
});

test("a healthy document keeps its route cache policy", async () => {
  const route = routeHeaders({
    loaderHeaders: new Headers({ "Cache-Control": "public, max-age=3600" }),
    parentHeaders: new Headers(),
  })["Cache-Control"];

  expect({
    route,
    fullPage: getFullPageCacheControl(
      new Request("https://shop.test/"),
      200,
      route,
    ),
  }).toEqual({
    route: "public, max-age=3600",
    fullPage: "public, max-age=300, stale-while-revalidate=86400",
  });
});

/**
 * The document headers React Router builds when a route loader throws the
 * failure response under a root that renders the error boundary.
 */
async function documentHeaders(thrown: unknown): Promise<{
  status: number;
  cacheControl: string | null;
}> {
  const handler = createStaticHandler([
    {
      id: "root",
      path: "/",
      loader: () => ({}),
      hasErrorBoundary: true,
      children: [
        {
          id: "page",
          index: true,
          loader: () => {
            throw thrown;
          },
        },
      ],
    },
  ]);
  const context = await handler.query(new Request("https://shop.test/"));
  if (context instanceof Response) {
    throw new Error("unexpected redirect");
  }
  // The same reduction React Router's server runtime applies with each
  // route's `headers` export: the root is the boundary, the page its child.
  const errorHeaders = context.loaderHeaders.page;
  const headers = rootHeaders({
    loaderHeaders: context.loaderHeaders.root ?? new Headers(),
    errorHeaders,
  });
  return {
    status: context.statusCode,
    cacheControl: new Headers(headers).get("Cache-Control"),
  };
}

test("the failure status and no-store reach the document through the root boundary", async () => {
  const { WeaverseLoadError } = await import("@weaverse/hydrogen");
  const failure = weaverseRouteFailure(
    new WeaverseLoadError("down", "unavailable"),
  );

  expect(await documentHeaders(failure)).toEqual({
    status: 503,
    cacheControl: "no-store",
  });
});

test("the missing-page response keeps the root cache policy untouched", async () => {
  expect(await documentHeaders(new Response(null, { status: 404 }))).toEqual({
    status: 404,
    cacheControl: null,
  });
});

/** The root error boundary's view of a Weaverse failure. */
async function failureView(failure: "unavailable" | "error") {
  const { WeaverseFailure } = await loadComponent<{
    WeaverseFailure: (props: { failure: string }) => ReactElement;
  }>("components/root/generic-error.tsx");
  return renderInApp(
    { weaverseTheme: { theme: {} } },
    () => createElement(WeaverseFailure, { failure }),
    "/collections/wine?page=2",
  );
}

test("an unavailable page offers a full reload of the same URL", async () => {
  const html = await failureView("unavailable");

  expect({
    copy: html.includes("This page is temporarily unavailable."),
    // A plain anchor (no client-router marker) reloads the whole document.
    reload:
      /<a href="\/collections\/wine\?page=2" class="[^"]*">Reload page<\/a>/.test(
        html,
      ),
    label: html.includes("Reload page"),
  }).toEqual({ copy: true, reload: true, label: true });
});

test("a configuration failure shows no internal details", async () => {
  const html = await failureView("error");

  expect({
    generic: html.includes("We found an error while loading this page."),
    reload: html.includes("Reload page"),
    internals: /HTTP|LOAD_FAILURE|Weaverse/.test(html),
  }).toEqual({ generic: true, reload: false, internals: false });
});
