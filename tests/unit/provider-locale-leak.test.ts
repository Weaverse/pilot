import { expect, test } from "@playwright/test";
import type { AppLoadContext } from "react-router";
import { createHydrogenRouterContext } from "../../app/.server/context";
import { getFeaturedProducts } from "../../app/utils/featured-products";
import {
  installWorkerCaches,
  recordFetches,
  TEST_ENV,
  TEST_EXECUTION_CONTEXT,
} from "../support/hydrogen-env";
import { loadAppModule } from "../support/render-app";

/**
 * The two identities must stay apart at the boundary that actually issues
 * requests, not merely in the object that holds them.
 *
 * `weaverse.storefront.i18n` carries the market's public identity because the
 * installed client derives its Translation Manager locale from it. That object
 * is also what section loaders reach for, so any query that copies
 * `i18n.language` into its own variables sends `ZH` to Shopify — and this
 * store resolves bare `ZH` to English, so `/zh-cn` would serve an English
 * catalogue underneath correct Chinese theme copy.
 *
 * Hydrogen fills `$country`/`$language` from the storefront client's own
 * closure, but only for variables the caller left absent, so an explicit
 * variable silently wins. These assert what leaves the process: the `language`
 * in the Storefront POST body, and the `locale` in the translation URL.
 */

type Sent = { shopify: string[]; translation: string[] };

/** Everything `run` sends, split by which provider it was addressed to. */
async function sentBy(
  pathPrefix: string,
  run: (context: AppLoadContext) => Promise<unknown>,
): Promise<Sent> {
  const restoreCaches = installWorkerCaches();
  const shopify: string[] = [];

  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body;
    if (typeof body === "string" && body.includes("$language")) {
      const { variables } = JSON.parse(body) as {
        variables?: { language?: string };
      };
      if (variables?.language) {
        shopify.push(variables.language);
      }
    }
    return new Response(JSON.stringify({ data: {} }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof globalThis.fetch;

  let translation: string[] = [];
  try {
    const context = (await createHydrogenRouterContext(
      new Request(`https://shop.test${pathPrefix}/`),
      TEST_ENV,
      TEST_EXECUTION_CONTEXT,
    )) as unknown as AppLoadContext;

    // The translation fetch is recorded separately: `recordFetches` replaces
    // the same global, so the two observations cannot be interleaved.
    //
    // The stubbed response is empty, so a loader may well throw while shaping
    // it. That happens strictly after the request went out, and the request is
    // what is under test.
    await run(context).catch(() => undefined);
    globalThis.fetch = realFetch;

    const { urls } = await recordFetches(() =>
      context.weaverse.loadThemeSettings(),
    );
    translation = urls
      .filter((url) => url.includes("/api/translation/static"))
      .map((url) => new URL(url).searchParams.get("locale") ?? "");
  } finally {
    globalThis.fetch = realFetch;
    restoreCaches();
  }

  return { shopify, translation };
}

test("featured collections query Shopify with the provider language", async () => {
  const { loader } = await loadAppModule<{
    loader: (args: { data: unknown; weaverse: unknown }) => Promise<unknown>;
  }>("sections/featured-collections/index.tsx");

  const sent = await sentBy("/zh-hk", (context) =>
    loader({
      data: { collections: [{ id: "1" }] },
      weaverse: context.weaverse,
    }),
  );

  expect({
    shopify: [...new Set(sent.shopify)],
    translation: [...new Set(sent.translation)],
  }).toEqual({ shopify: ["ZH_TW"], translation: ["zh-hk"] });
});

test("every featured-products selection mode queries with the provider language", async () => {
  // The section picks one of three queries from `selectionMethod`, and a test
  // that exercises one mode says nothing about the other two: adding an
  // explicit `language` to the manual branch alone stays green against a
  // collection-only test while every manual section on `/zh-cn` sends `ZH`.
  //
  // The `auto` case runs through the real section loader rather than calling
  // its helper directly, because the section hands the helper
  // `weaverse.storefront` — the public identity — while a test calling
  // `getFeaturedProducts(context.storefront)` hands it the provider enum and
  // would pass no matter what the section does.
  const { loader } = await loadAppModule<{
    loader: (args: { data: unknown; weaverse: unknown }) => Promise<unknown>;
  }>("sections/featured-products/index.tsx");

  const modes = [
    {
      mode: "collection",
      data: { selectionMethod: "collection", collection: { handle: "all" } },
    },
    {
      mode: "manual",
      data: { selectionMethod: "manual", products: [{ id: "1" }] },
    },
    { mode: "auto", data: { selectionMethod: "auto" } },
  ];

  const sent: { mode: string; shopify: string[]; translation: string[] }[] = [];
  for (const { mode, data } of modes) {
    const observed = await sentBy("/zh-cn", (context) =>
      loader({ data, weaverse: context.weaverse }),
    );
    sent.push({
      mode,
      shopify: [...new Set(observed.shopify)],
      translation: [...new Set(observed.translation)],
    });
  }

  expect(sent).toEqual([
    { mode: "collection", shopify: ["ZH_CN"], translation: ["zh-cn"] },
    { mode: "manual", shopify: ["ZH_CN"], translation: ["zh-cn"] },
    { mode: "auto", shopify: ["ZH_CN"], translation: ["zh-cn"] },
  ]);
});

test("the collection list route queries with the provider language", async () => {
  const { loader } = await loadAppModule<{
    loader: (args: { context: unknown; request: Request }) => Promise<unknown>;
  }>("routes/collections/list.tsx");

  const sent = await sentBy("/zh-tw", (context) =>
    loader({
      context,
      // The route reads pagination off the request; without it the loader
      // throws before querying and the test would assert on nothing.
      request: new Request("https://shop.test/zh-tw/collections"),
    }),
  );

  expect({
    shopify: [...new Set(sent.shopify)],
    translation: [...new Set(sent.translation)],
  }).toEqual({ shopify: ["ZH_TW"], translation: ["zh-tw"] });
});

test("the featured-products helper keeps the provider language for any caller", async () => {
  // The helper is shared, so it is checked with both clients a caller can hand
  // it. Passing only `context.storefront` would hide an explicit variable
  // added inside the helper, since that client already carries the enum.
  const viaHydrogen = await sentBy("/zh-hk", (context) =>
    getFeaturedProducts(context.storefront),
  );
  const viaWeaverse = await sentBy("/zh-hk", (context) =>
    getFeaturedProducts(
      context.weaverse.storefront as typeof context.storefront,
    ),
  );

  expect({
    viaHydrogen: [...new Set(viaHydrogen.shopify)],
    viaWeaverse: [...new Set(viaWeaverse.shopify)],
  }).toEqual({ viaHydrogen: ["ZH_TW"], viaWeaverse: ["ZH_TW"] });
});

test("every Weaverse section loader queries with the provider language", async () => {
  // The four consumers above are the ones a review named. These are the rest
  // of the same class — a loader reading `weaverse.storefront.i18n` and
  // copying it into its own query variables — so the guard covers the flow
  // rather than the reported instances.
  const cases = [
    {
      entry: "sections/single-product/loader.ts",
      data: { product: { handle: "hoodie" } },
    },
    {
      entry: "sections/hotspots/item.tsx",
      data: { product: { handle: "hoodie" } },
    },
  ];

  const sent: { entry: string; shopify: string[] }[] = [];
  for (const { entry, data } of cases) {
    const { loader } = await loadAppModule<{
      loader: (args: { data: unknown; weaverse: unknown }) => Promise<unknown>;
    }>(entry);

    const observed = await sentBy("/zh-hk", (context) =>
      loader({ data, weaverse: context.weaverse }),
    );
    sent.push({ entry, shopify: [...new Set(observed.shopify)] });
  }

  expect(sent).toEqual([
    { entry: "sections/single-product/loader.ts", shopify: ["ZH_TW"] },
    { entry: "sections/hotspots/item.tsx", shopify: ["ZH_TW"] },
  ]);
});

test("no Shopify query ever collapses to the bare public language", async () => {
  // `ZH` is a valid enum member that this store silently resolves to English,
  // so a leak is invisible in a response and shows up only as an untranslated
  // catalogue. Every Chinese market is checked, not just a spot case.
  const { loader } = await loadAppModule<{
    loader: (args: { data: unknown; weaverse: unknown }) => Promise<unknown>;
  }>("sections/featured-collections/index.tsx");

  const leaked: { market: string; language: string }[] = [];
  for (const market of ["/zh-cn", "/zh-hk", "/zh-tw"]) {
    const sent = await sentBy(market, (context) =>
      loader({
        data: { collections: [{ id: "1" }] },
        weaverse: context.weaverse,
      }),
    );
    for (const language of sent.shopify) {
      if (language === "ZH") {
        leaked.push({ market, language });
      }
    }
  }

  expect(leaked).toEqual([]);
});

test("the page route queries Shopify with the provider language", async () => {
  // `regular-page` destructures its client off `context.weaverse`, so the
  // earlier sweep — which grepped `weaverse.storefront.i18n` — did not see it.
  // The alias makes no difference to what is sent: that object carries the
  // public identity, and copying it into `$language` sends `ZH`.
  const { loader } = await loadAppModule<{
    loader: (args: {
      request: Request;
      params: Record<string, string>;
      context: unknown;
    }) => Promise<unknown>;
  }>("routes/pages/regular-page.tsx");

  const sent = await sentBy("/zh-cn", (context) =>
    loader({
      request: new Request("https://shop.test/zh-cn/pages/about"),
      params: { pageHandle: "about" },
      context,
    }),
  );

  expect({
    shopify: [...new Set(sent.shopify)],
    translation: [...new Set(sent.translation)],
  }).toEqual({ shopify: ["ZH_CN"], translation: ["zh-cn"] });
});

test("the article route queries Shopify with the provider language", async () => {
  const { loader } = await loadAppModule<{
    loader: (args: {
      request: Request;
      params: Record<string, string>;
      context: unknown;
    }) => Promise<unknown>;
  }>("routes/blogs/article.tsx");

  const sent = await sentBy("/zh-hk", (context) =>
    loader({
      request: new Request("https://shop.test/zh-hk/blogs/news/a-post"),
      params: { blogHandle: "news", articleHandle: "a-post" },
      context,
    }),
  );

  expect({
    shopify: [...new Set(sent.shopify)],
    translation: [...new Set(sent.translation)],
  }).toEqual({ shopify: ["ZH_TW"], translation: ["zh-hk"] });
});

test("page and article keep a non-Chinese market unchanged", async () => {
  // The control: German has one identity, so a market where public and
  // provider codes agree must be unaffected by the fix. Without this a loader
  // that hardcoded `ZH_CN` would satisfy the tests above.
  const page = await loadAppModule<{
    loader: (args: {
      request: Request;
      params: Record<string, string>;
      context: unknown;
    }) => Promise<unknown>;
  }>("routes/pages/regular-page.tsx");

  const article = await loadAppModule<{
    loader: (args: {
      request: Request;
      params: Record<string, string>;
      context: unknown;
    }) => Promise<unknown>;
  }>("routes/blogs/article.tsx");

  const sentPage = await sentBy("/de-de", (context) =>
    page.loader({
      request: new Request("https://shop.test/de-de/pages/about"),
      params: { pageHandle: "about" },
      context,
    }),
  );

  const sentArticle = await sentBy("/de-de", (context) =>
    article.loader({
      request: new Request("https://shop.test/de-de/blogs/news/a-post"),
      params: { blogHandle: "news", articleHandle: "a-post" },
      context,
    }),
  );

  expect({
    page: [...new Set(sentPage.shopify)],
    article: [...new Set(sentArticle.shopify)],
    translation: [...new Set(sentPage.translation)],
  }).toEqual({ page: ["DE"], article: ["DE"], translation: ["de-de"] });
});

test("the two clients keep different language identities", async () => {
  // The invariant every test above depends on, asserted directly so a change
  // to `weaverseStorefront` cannot quietly turn them into tautologies. If both
  // clients ever agreed, the leak would be unobservable and the suite would
  // pass while shipping English.
  const restoreCaches = installWorkerCaches();
  try {
    const context = (await createHydrogenRouterContext(
      new Request("https://shop.test/zh-hk/"),
      TEST_ENV,
      TEST_EXECUTION_CONTEXT,
    )) as unknown as AppLoadContext;

    expect({
      shopify: context.storefront.i18n.language,
      weaverse: context.weaverse.storefront.i18n.language,
      country: context.storefront.i18n.country,
    }).toEqual({ shopify: "ZH_TW", weaverse: "ZH", country: "HK" });
  } finally {
    restoreCaches();
  }
});

test("shared product helpers never send the public language", async () => {
  // Helpers are where a caller/callee mismatch hides: the helper looks correct
  // beside a caller that hands it Hydrogen's client, and leaks beside one that
  // hands it Weaverse's. Each is therefore exercised with the client its own
  // callers actually pass.
  const recommended = await loadAppModule<{
    getRecommendedProducts: (
      storefront: unknown,
      productId: string,
    ) => Promise<unknown>;
  }>("routes/products/recommended-product.ts");

  // Both clients, for the same reason the featured-products helper takes both:
  // handing it only Hydrogen's client would pass even if the helper started
  // copying `i18n.language` into its variables, because that client already
  // carries the enum. Weaverse's client is the one that exposes the mistake.
  const viaHydrogen = await sentBy("/zh-cn", (context) =>
    recommended.getRecommendedProducts(
      context.storefront,
      "gid://shopify/Product/1",
    ),
  );
  const viaWeaverse = await sentBy("/zh-cn", (context) =>
    recommended.getRecommendedProducts(
      context.weaverse.storefront,
      "gid://shopify/Product/1",
    ),
  );

  expect({
    viaHydrogen: [...new Set(viaHydrogen.shopify)],
    viaWeaverse: [...new Set(viaWeaverse.shopify)],
  }).toEqual({ viaHydrogen: ["ZH_CN"], viaWeaverse: ["ZH_CN"] });
});

/** The query document and locale variables a run actually sent to Shopify. */
async function shopifyQueryContract(
  pathPrefix: string,
  run: (context: AppLoadContext) => Promise<unknown>,
): Promise<{
  declaresLocale: boolean;
  appliesInContext: boolean;
  language: string | null;
  country: string | null;
}> {
  const restoreCaches = installWorkerCaches();
  const realFetch = globalThis.fetch;
  let sent: { query?: string; variables?: Record<string, string> } | null =
    null;

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body;
    if (typeof body === "string" && body.includes("query ") && !sent) {
      sent = JSON.parse(body);
    }
    return new Response(JSON.stringify({ data: {} }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof globalThis.fetch;

  try {
    const context = (await createHydrogenRouterContext(
      new Request(`https://shop.test${pathPrefix}/`),
      TEST_ENV,
      TEST_EXECUTION_CONTEXT,
    )) as unknown as AppLoadContext;

    await run(context).catch(() => undefined);
  } finally {
    globalThis.fetch = realFetch;
    restoreCaches();
  }

  const query = sent?.query ?? "";

  return {
    declaresLocale: query.includes("$country") && query.includes("$language"),
    appliesInContext: query.includes("@inContext"),
    language: sent?.variables?.language ?? null,
    country: sent?.variables?.country ?? null,
  };
}

test("the our-team section queries Shopify in the shopper's market", async () => {
  // Hydrogen fills `$country`/`$language` from the storefront closure only for
  // documents that declare them — `/\$language/.test(query)` in the installed
  // client. A query that omits the declarations is not merely missing a
  // variable: it reaches Shopify with no market at all and is answered in the
  // shop's default language, so translated metaobject fields come back in the
  // wrong language with a 200 and no error.
  //
  // Both halves are asserted. The variables alone would pass against a
  // document that hardcoded them, and the declarations alone would pass
  // against a document Hydrogen never filled.
  const { loader } = await loadAppModule<{
    loader: (args: { data: unknown; weaverse: unknown }) => Promise<unknown>;
  }>("sections/our-team/index.tsx");

  const run = (market: string) =>
    shopifyQueryContract(market, (context) =>
      loader({
        data: { metaobject: { handle: "team_member" }, membersCount: 4 },
        weaverse: context.weaverse,
      }),
    );

  expect(await run("/zh-cn")).toEqual({
    declaresLocale: true,
    appliesInContext: true,
    language: "ZH_CN",
    country: "CN",
  });

  expect(await run("/zh-tw")).toEqual({
    declaresLocale: true,
    appliesInContext: true,
    language: "ZH_TW",
    country: "TW",
  });

  // A market whose public and provider codes agree, so a hardcoded Chinese
  // enum would satisfy the two cases above and fail here.
  expect(await run("/de-de")).toEqual({
    declaresLocale: true,
    appliesInContext: true,
    language: "DE",
    country: "DE",
  });
});
