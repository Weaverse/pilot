import { expect, test } from "@playwright/test";
import type { AppLoadContext } from "react-router";
import { createHydrogenRouterContext } from "../../app/.server/context";
import { SUPPORTED_LOCALES } from "../../app/utils/locale";
import {
  installWorkerCaches,
  recordFetches,
  TEST_ENV,
  TEST_EXECUTION_CONTEXT,
} from "../support/hydrogen-env";

/**
 * Weaverse and Shopify disagree about what a language code is, and the request
 * context must satisfy both.
 *
 * Shopify's `LanguageCode` enum is script-specific for Chinese — this store
 * resolves bare `ZH` to English — so markets send `ZH_CN` or `ZH_TW`. The
 * installed `WeaverseClient` builds its Translation Manager lookup as
 * lowercase `${language}-${country}` off `storefront.i18n`, so handing it the
 * same object asks for `zh_tw-hk`: a locale the Translation Manager has never
 * heard of. The SDK swallows a missing-override response, so every published
 * Chinese string reverts to the theme default with nothing in the logs.
 *
 * These build the real context and watch which URLs it actually requests.
 */

type ProviderIdentity = { translation: string | null; shopify: string | null };

/** What each provider was asked for while loading `pathPrefix`'s theme. */
async function identitiesFor(pathPrefix: string): Promise<ProviderIdentity> {
  const request = new Request(`https://shop.test${pathPrefix}/`);

  const restoreCaches = installWorkerCaches();
  const { result: context, urls } = await recordFetches(async () => {
    const ctx = await createHydrogenRouterContext(
      request,
      TEST_ENV,
      TEST_EXECUTION_CONTEXT,
    );
    // `weaverse` is attached to the context instance, exactly as loaders read
    // it; `AppLoadContext` is where the app declares that shape.
    const { weaverse, storefront } = ctx as unknown as AppLoadContext;
    await weaverse.loadThemeSettings();
    return { storefront };
  });
  restoreCaches();

  const translation = urls.find((url) =>
    url.includes("/api/translation/static"),
  );

  return {
    translation: translation
      ? new URL(translation).searchParams.get("locale")
      : null,
    // What Hydrogen will put on every `@inContext` query for this request.
    shopify: context.storefront.i18n.language,
  };
}

test("Chinese markets ask Weaverse for their public locale", async () => {
  // `zh_cn-cn` and `zh_tw-hk` are not locales; they are the Shopify enum
  // leaking into a URL that expects BCP-47.
  expect({
    cn: (await identitiesFor("/zh-cn")).translation,
    hk: (await identitiesFor("/zh-hk")).translation,
    tw: (await identitiesFor("/zh-tw")).translation,
  }).toEqual({ cn: "zh-cn", hk: "zh-hk", tw: "zh-tw" });
});

test("Chinese markets still ask Shopify for the script-specific enum", async () => {
  // The Weaverse fix must not walk back the Shopify one: bare `ZH` resolves to
  // English on this store, so the catalogue would silently be untranslated.
  expect({
    cn: (await identitiesFor("/zh-cn")).shopify,
    hk: (await identitiesFor("/zh-hk")).shopify,
    tw: (await identitiesFor("/zh-tw")).shopify,
  }).toEqual({ cn: "ZH_CN", hk: "ZH_TW", tw: "ZH_TW" });
});

test("a market whose identities agree is unaffected", async () => {
  // German sends `DE` to both providers, so the split must not perturb the 30
  // markets that never diverged.
  expect(await identitiesFor("/de-de")).toEqual({
    translation: "de-de",
    shopify: "DE",
  });
});

test("the default market keeps the unprefixed root's identity", async () => {
  expect(await identitiesFor("")).toEqual({
    translation: "en-us",
    shopify: "EN",
  });
});

test("every market's Weaverse locale is its public hreflang", async () => {
  // The Translation Manager keys overrides by the locale the merchant sees in
  // Studio, which is the market's public identity — never a provider enum. One
  // spot-checked market would leave the other 32 free to drift.
  // Sequential: each call swaps the global `fetch` to observe its own request,
  // so overlapping them would let one market read another's recorder.
  const requested: {
    market: string;
    expected: string;
    actual: string | null;
  }[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    requested.push({
      market: locale.pathPrefix || "/",
      expected: locale.hreflang.toLowerCase(),
      actual: (await identitiesFor(locale.pathPrefix)).translation,
    });
  }

  expect(
    requested.filter(({ expected, actual }) => expected !== actual),
  ).toEqual([]);
});
