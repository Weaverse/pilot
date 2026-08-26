import { expect, test } from "@playwright/test";
import type { AppLoadContext } from "react-router";
import { createHydrogenRouterContext } from "../../app/.server/context";
import { apiRequestsFrom, closeSharedBrowser } from "../support/browser-render";
import {
  installWorkerCaches,
  TEST_ENV,
  TEST_EXECUTION_CONTEXT,
} from "../support/hydrogen-env";

/**
 * Internal API requests carry the market in their own URL, or they lose it.
 *
 * With a `url-path` locale strategy the request URL *is* the market: nothing
 * else survives the hop. A shopper on `/zh-cn/collections/all` whose quick-shop
 * button requests an absolute `/api/product/hoodie` sends no market at all, so
 * the API route builds an `EN/US` context and Shopify answers with US copy,
 * pricing, availability and variants — rendered into a Chinese page, with a 200
 * and nothing in any log.
 *
 * `Referer` is not a fallback: it is absent on same-origin requests under
 * several referrer policies and is never authoritative for routing.
 *
 * These mount the real components in a real browser and record the requests
 * that leave the page, then resolve those exact URLs through the real request
 * context. Both halves are needed: a component can compute a localized path and
 * then request a different literal, so only the request itself is evidence.
 */

/** The market an API route resolves for `url`, through the real request context. */
async function localeAtApi(
  url: string,
): Promise<{ language: string; country: string }> {
  const restoreCaches = installWorkerCaches();
  try {
    const context = (await createHydrogenRouterContext(
      new Request(url),
      TEST_ENV,
      TEST_EXECUTION_CONTEXT,
    )) as unknown as AppLoadContext;

    return {
      language: context.storefront.i18n.language,
      country: context.storefront.i18n.country,
    };
  } finally {
    restoreCaches();
  }
}

/** The minimum collection shape the card reads while rendering. */
test.afterAll(closeSharedBrowser);

const COLLECTION = {
  id: "gid://shopify/Collection/1",
  handle: "all",
  title: "All",
  // The card falls back to the first product's media when the collection has
  // no image of its own, so the fixture needs one.
  products: { nodes: [{ id: "1", media: { nodes: [] } }] },
  image: null,
};

test("an unprefixed API url resolves the default market, not the shopper's", async () => {
  // The defect itself, pinned: this is why every caller below must localize.
  expect(await localeAtApi("https://shop.test/api/product/hoodie")).toEqual({
    language: "EN",
    country: "US",
  });

  expect(
    await localeAtApi("https://shop.test/api/collection/all/product-count"),
  ).toEqual({ language: "EN", country: "US" });
});

test("a prefixed API url resolves the shopper's market", async () => {
  // `context.storefront` carries the Shopify provider enum, so Chinese markets
  // read back script-specific: that is the identity the catalog needs.
  expect(
    await localeAtApi("https://shop.test/zh-cn/api/product/hoodie"),
  ).toEqual({ language: "ZH_CN", country: "CN" });

  expect(
    await localeAtApi("https://shop.test/zh-tw/api/product/hoodie"),
  ).toEqual({ language: "ZH_TW", country: "TW" });

  expect(
    await localeAtApi("https://shop.test/de-de/api/product/hoodie"),
  ).toEqual({ language: "DE", country: "DE" });
});

test("quick shop requests the product API on the shopper's market", async () => {
  const requestFrom = (pathname: string) =>
    apiRequestsFrom({
      entry: "components/product-card/quick-shop.tsx",
      exportName: "QuickShopTrigger",
      props: { productHandle: "hoodie", buttonType: "text" },
      pathname,
      // Quick shop fetches only once a shopper opens it.
      click: "button",
    });

  const asked = {
    zhCn: await requestFrom("/zh-cn/collections/all"),
    zhTw: await requestFrom("/zh-tw/collections/all"),
    deDe: await requestFrom("/de-de/collections/all"),
    root: await requestFrom("/collections/all"),
  };

  expect(asked).toEqual({
    zhCn: ["/zh-cn/api/product/hoodie"],
    zhTw: ["/zh-tw/api/product/hoodie"],
    deDe: ["/de-de/api/product/hoodie"],
    // The default market has no prefix, so the bare path is already correct.
    root: ["/api/product/hoodie"],
  });

  // And the URLs it asked for must land on the markets they name.
  const resolved: { language: string; country: string }[] = [];
  for (const url of [asked.zhCn[0], asked.zhTw[0], asked.deDe[0]]) {
    resolved.push(await localeAtApi(`https://shop.test${url}`));
  }

  expect(resolved).toEqual([
    { language: "ZH_CN", country: "CN" },
    { language: "ZH_TW", country: "TW" },
    { language: "DE", country: "DE" },
  ]);
});

test("the collection card requests a product count on the shopper's market", async () => {
  const requestFrom = (pathname: string) =>
    apiRequestsFrom({
      entry: "sections/collection-list/collection-card.tsx",
      exportName: "CollectionCard",
      props: {
        collection: COLLECTION,
        imageAspectRatio: "1/1",
        contentPosition: "below",
        collectionNameColor: "#000",
        showProductCount: true,
      },
      pathname,
    });

  const zhCn = await requestFrom("/zh-cn/collections");
  const deDe = await requestFrom("/de-de/collections");

  expect({ zhCn, deDe }).toEqual({
    zhCn: ["/zh-cn/api/collection/all/product-count"],
    deDe: ["/de-de/api/collection/all/product-count"],
  });

  expect(await localeAtApi(`https://shop.test${zhCn[0]}`)).toEqual({
    language: "ZH_CN",
    country: "CN",
  });
});

test("the collection toolbar requests a total count on the shopper's market", async () => {
  const asked = await apiRequestsFrom({
    entry: "sections/main-collection/toolbar/index.tsx",
    exportName: "default",
    props: { productsCountFormat: "{{displayed_products}}/{{total}}" },
    pathname: "/zh-tw/collections/all",
    // The toolbar reads its collection from the route it renders in.
    rootData: { collection: COLLECTION },
  });

  expect(asked).toEqual(["/zh-tw/api/collection/all/product-count"]);

  expect(await localeAtApi(`https://shop.test${asked[0]}`)).toEqual({
    language: "ZH_TW",
    country: "TW",
  });
});
