import { expect, test } from "@playwright/test";
import type { LoaderFunctionArgs } from "react-router";
import {
  createTestContext,
  recordStorefrontCalls,
  type StorefrontCall,
  serverFetch,
} from "../support/hydrogen-env";
import { loadAppModule } from "../support/render-app";

/**
 * The market a cart is created with or moved into, read off the wire.
 *
 * A cart keeps the country it was created in: Shopify does not move it when
 * the shopper switches market, and only `buyerIdentity.countryCode` survives
 * to checkout. So a cart made on `/de-de` in the default market prices and
 * taxes as the default market however correct the surrounding request context
 * looked. That failure is invisible in the app — the redirect still works,
 * the catalogue still reads German — which is why these assert the outbound
 * mutations rather than any value a route returns.
 *
 * The cart endpoints are the installed Hydrogen handlers plus Pilot's group,
 * reached through the real `server.ts` fetch handler: a mock would assert the
 * mock's ordering, and the ordering is the thing being relied on.
 */
const CART_ID = "gid://shopify/Cart/1";

/** Shopify's answer to every cart operation these flows send. */
function respond({ operation }: StorefrontCall) {
  const cart = { id: CART_ID, checkoutUrl: "https://checkout.test/c/1" };
  const payload = { cart, userErrors: [], warnings: [] };
  return {
    cartCreate: payload,
    cartLinesAdd: payload,
    cartDiscountCodesUpdate: payload,
    cartBuyerIdentityUpdate: payload,
    ...(operation === "PilotCartGiftCards" && {
      cart: { appliedGiftCards: [{ id: "gid://shopify/AppliedGiftCard/1" }] },
    }),
  };
}

/** The country each operation carried, as `operation:country`. */
function countries(calls: StorefrontCall[]) {
  return calls.map(({ operation, variables }) => {
    const input = variables.input as
      | { buyerIdentity?: { countryCode?: string } }
      | undefined;
    const buyerIdentity =
      (variables.buyerIdentity as { countryCode?: string } | undefined) ??
      input?.buyerIdentity;
    return `${operation}:${buyerIdentity?.countryCode ?? "-"}@${variables.country}`;
  });
}

/** Runs a route loader against the real context for `url`. */
async function runLoader(
  entry: string,
  url: string,
  params: Record<string, string>,
) {
  const { loader } = await loadAppModule<{
    loader: (args: LoaderFunctionArgs) => Promise<Response>;
  }>(entry);
  const { calls } = await recordStorefrontCalls(async () => {
    const context = await createTestContext(url);
    await loader({
      request: new Request(url),
      context,
      params,
    } as unknown as LoaderFunctionArgs).catch(() => undefined);
  }, respond);
  return countries(calls);
}

/** Posts to an unprefixed cart endpoint from a page on `fromPath`. */
async function postFrom(
  fromPath: string,
  path: string,
  body: Record<string, unknown> | URLSearchParams,
  { cart = true } = {},
) {
  const isForm = body instanceof URLSearchParams;
  return recordStorefrontCalls(
    () =>
      serverFetch(
        new Request(`https://shop.test${path}`, {
          method: "POST",
          headers: {
            "Content-Type": isForm
              ? "application/x-www-form-urlencoded"
              : "application/json",
            Origin: "https://shop.test",
            Referer: `https://shop.test${fromPath}`,
            ...(cart && { Cookie: "cart=1" }),
          },
          body: isForm ? body : JSON.stringify(body),
        }),
      ),
    respond,
  );
}

const ADD_LINE = {
  lines: [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 }],
};

test("a buy-now cart is created on the shopper's market", async () => {
  // Sequential: each run swaps the global `fetch` to record its own mutation,
  // so overlapping them would let one market's cart land in another's recorder.
  const run = (pathPrefix: string) =>
    runLoader(
      "routes/cart/lines.tsx",
      `https://shop.test${pathPrefix}/cart/41007289663544:1`,
      { lines: "41007289663544:1" },
    );

  expect({
    cn: await run("/zh-cn"),
    tw: await run("/zh-tw"),
    de: await run("/de-de"),
  }).toEqual({
    cn: ["CartCreate:CN@CN"],
    tw: ["CartCreate:TW@TW"],
    de: ["CartCreate:DE@DE"],
  });
});

test("an implicitly created discount cart keeps the shopper's market", async () => {
  // With no cart cookie the discount link creates a cart. It must name the
  // market, not leave the cart to the default one.
  const run = (pathPrefix: string) =>
    runLoader(
      "routes/others/discount-code.tsx",
      `https://shop.test${pathPrefix}/discount/SALE?redirect=/collections/all`,
      { code: "SALE", locale: pathPrefix.slice(1) },
    );

  expect({ cn: await run("/zh-cn"), de: await run("/de-de") }).toEqual({
    cn: ["CartCreate:CN@CN"],
    de: ["CartCreate:DE@DE"],
  });
});

test("a cart change moves the cart into the posting page's market first", async () => {
  // `/api/cart` is unprefixed, so the market is the `Referer`'s. A cart created
  // on `/zh-cn` keeps CN when the shopper moves to `/de-de`, so every change
  // syncs the country before Hydrogen mutates the cart.
  const { result, calls } = await postFrom(
    "/de-de/products/hoodie",
    "/api/cart",
    ADD_LINE,
  );

  expect(result.status).toBe(200);
  expect(countries(calls)).toEqual([
    "PilotCartBuyerIdentity:DE@DE",
    "CartLinesAdd:-@DE",
  ]);
});

test("a first add creates the cart in the posting page's market", async () => {
  // No cart yet: nothing to sync, and the new cart takes its country from the
  // request's `@inContext`.
  const { result, calls } = await postFrom(
    "/zh-tw/products/hoodie",
    "/api/cart",
    ADD_LINE,
    { cart: false },
  );

  expect(result.status).toBe(200);
  expect(countries(calls)).toEqual(["CartCreate:-@TW"]);
});

test("a cart change without a Referer stays on the default market", async () => {
  const { calls } = await recordStorefrontCalls(
    () =>
      serverFetch(
        new Request("https://shop.test/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: "cart=1" },
          body: JSON.stringify(ADD_LINE),
        }),
      ),
    respond,
  );

  expect(countries(calls)).toEqual([
    "PilotCartBuyerIdentity:US@US",
    "CartLinesAdd:-@US",
  ]);
});

test("the country selector's market outranks the posting page's", async () => {
  // Switching market posts the market being switched *to* from a page still on
  // the old one, so the explicit country must win over the `Referer`.
  const { result, calls } = await postFrom(
    "/zh-cn/collections/all",
    "/api/cart/buyer-identity",
    { countryCode: "DE" },
  );

  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({ userErrors: [] });
  expect(countries(calls)).toEqual(["PilotCartBuyerIdentity:DE@CN"]);
});

test("the country selector never sets a country Pilot does not sell in", async () => {
  const { calls } = await postFrom(
    "/zh-cn/collections/all",
    "/api/cart/buyer-identity",
    { countryCode: "XX" },
  );

  expect(countries(calls)).toEqual(["PilotCartBuyerIdentity:CN@CN"]);
});

test("a no-JS country switch lands on its redirect target", async () => {
  const { result, calls } = await postFrom(
    "/zh-cn/collections/all",
    "/api/cart/buyer-identity",
    new URLSearchParams({
      countryCode: "de",
      redirectTo: "/de-de/collections/all",
    }),
  );

  expect({
    status: result.status,
    location: new URL(result.headers.get("Location") ?? "", "https://shop.test")
      .pathname,
    sent: countries(calls),
  }).toEqual({
    status: 303,
    location: "/de-de/collections/all",
    sent: ["PilotCartBuyerIdentity:DE@CN"],
  });
});

test("an invalid gift card code is reported", async () => {
  // Shopify ignores a code it cannot apply without a user error, so the only
  // signal is that `appliedGiftCards` did not grow. The fixture answers one
  // applied card before and one after.
  const { result, calls } = await postFrom(
    "/de-de/cart",
    "/api/cart/gift-cards",
    { intent: "add", giftCardCodes: [" BOGUS "] },
  );

  expect(await result.json()).toEqual({
    userErrors: [
      {
        code: "GIFT_CARD_NOT_APPLIED",
        field: ["giftCardCodes"],
        message: "This gift card code could not be applied.",
      },
    ],
  });
  // Synced into the market first, and the code is sent trimmed.
  expect(countries(calls)).toEqual([
    "PilotCartBuyerIdentity:DE@DE",
    "PilotCartGiftCards:-@DE",
    "PilotCartGiftCardsAdd:-@DE",
  ]);
  expect(calls[2].variables.giftCardCodes).toEqual(["BOGUS"]);
});

test("an applied gift card code reports no error", async () => {
  const { result } = await recordStorefrontCalls(
    () =>
      serverFetch(
        new Request("https://shop.test/api/cart/gift-cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: "cart=1",
          },
          body: JSON.stringify({ intent: "add", giftCardCodes: ["GOOD"] }),
        }),
      ),
    (call) =>
      call.operation === "PilotCartGiftCardsAdd"
        ? {
            cartGiftCardCodesAdd: {
              cart: {
                appliedGiftCards: [
                  { id: "gid://shopify/AppliedGiftCard/1" },
                  { id: "gid://shopify/AppliedGiftCard/2" },
                ],
              },
              userErrors: [],
            },
          }
        : respond(call),
  );

  expect(await result.json()).toEqual({ userErrors: [] });
});

test("removing a gift card sends the applied ids", async () => {
  const { result, calls } = await postFrom(
    "/de-de/cart",
    "/api/cart/gift-cards",
    new URLSearchParams([
      ["intent", "remove"],
      ["appliedGiftCardIds", "gid://shopify/AppliedGiftCard/1"],
    ]),
  );

  // A no-JS form post returns to the market's cart page.
  expect(result.status).toBe(303);
  expect(
    new URL(result.headers.get("Location") ?? "", "https://shop.test").pathname,
  ).toBe("/de-de/cart");
  expect(calls.at(-1)).toMatchObject({
    operation: "PilotCartGiftCardsRemove",
    variables: { appliedGiftCardIds: ["gid://shopify/AppliedGiftCard/1"] },
  });
});

test("gift cards need a cart", async () => {
  const { result, calls } = await postFrom(
    "/cart",
    "/api/cart/gift-cards",
    { intent: "add", giftCardCodes: ["GOOD"] },
    { cart: false },
  );

  expect(result.status).toBe(400);
  expect(calls).toEqual([]);
});
