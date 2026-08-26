import { expect, test } from "@playwright/test";
import { CartForm } from "@shopify/hydrogen";
import type {
  ActionFunctionArgs,
  AppLoadContext,
  LoaderFunctionArgs,
} from "react-router";
import { createHydrogenRouterContext } from "../../app/.server/context";
import {
  installWorkerCaches,
  TEST_ENV,
  TEST_EXECUTION_CONTEXT,
} from "../support/hydrogen-env";
import { loadAppModule } from "../support/render-app";

/**
 * The market a cart is created with, read off the wire.
 *
 * Shopify does not persist the `@inContext(country:)` of the mutation into the
 * cart; only `buyerIdentity.countryCode` survives to checkout. So a cart made
 * on `/de-de` with no buyer identity prices and taxes as the default market
 * however correct the surrounding request context looked. That failure is
 * invisible in the app — the redirect still works, the catalogue still reads
 * German — which is why this asserts the outbound mutation rather than any
 * value the route returns.
 *
 * The cart handler under test is the installed Hydrogen one, reached through
 * the real `createHydrogenRouterContext`: a mock would assert the mock's
 * merge order, and the merge order is the thing being relied on.
 */
type CartCreateCall = {
  countryCode?: string | null;
  hasBuyerIdentity: boolean;
  inContextCountry: string | null;
};

/** Runs `use` against a real context for `pathPrefix`, capturing `cartCreate`. */
async function cartCreateFrom(
  pathPrefix: string,
  use: (context: AppLoadContext) => Promise<unknown>,
): Promise<CartCreateCall[]> {
  const restoreCaches = installWorkerCaches();
  const realFetch = globalThis.fetch;
  const calls: CartCreateCall[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body;
    if (typeof body === "string" && body.includes("cartCreate")) {
      const parsed = JSON.parse(body) as {
        query?: string;
        variables?: { input?: { buyerIdentity?: { countryCode?: string } } };
        // Hydrogen sends the storefront locale as top-level GraphQL variables.
        country?: string;
      };
      const input_ = parsed.variables?.input;
      calls.push({
        countryCode: input_?.buyerIdentity?.countryCode ?? null,
        hasBuyerIdentity: input_?.buyerIdentity !== undefined,
        inContextCountry:
          (parsed.variables as { country?: string } | undefined)?.country ??
          null,
      });
    }
    return new Response(
      JSON.stringify({
        data: {
          cartCreate: {
            cart: {
              id: "gid://shopify/Cart/1",
              checkoutUrl: "https://checkout.test/c/1",
            },
            userErrors: [],
            warnings: [],
          },
          cartDiscountCodesUpdate: {
            cart: {
              id: "gid://shopify/Cart/1",
              checkoutUrl: "https://checkout.test/c/1",
            },
            userErrors: [],
            warnings: [],
          },
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof globalThis.fetch;

  try {
    const context = (await createHydrogenRouterContext(
      new Request(`https://shop.test${pathPrefix}/`),
      TEST_ENV,
      TEST_EXECUTION_CONTEXT,
    )) as unknown as AppLoadContext;
    await use(context).catch(() => undefined);
  } finally {
    globalThis.fetch = realFetch;
    restoreCaches();
  }

  return calls;
}

/** The real `/cart/<variant>:<qty>` route, bundled as the app bundles it. */
async function linesRoute() {
  return loadAppModule<{
    loader: (args: LoaderFunctionArgs) => Promise<Response>;
  }>("routes/cart/lines.tsx");
}

test("a buy-now cart is created on the shopper's market", async () => {
  const { loader } = await linesRoute();

  const run = (pathPrefix: string) =>
    cartCreateFrom(pathPrefix, (context) =>
      loader({
        request: new Request(
          `https://shop.test${pathPrefix}/cart/41007289663544:1`,
        ),
        context,
        params: { lines: "41007289663544:1" },
      } as unknown as LoaderFunctionArgs),
    );

  // Sequential: each run swaps the global `fetch` to record its own mutation,
  // so overlapping them would let one market's cart land in another's recorder.
  const cn = await run("/zh-cn");
  const tw = await run("/zh-tw");
  const de = await run("/de-de");

  expect({
    cn: cn.map((call) => call.countryCode),
    tw: tw.map((call) => call.countryCode),
    de: de.map((call) => call.countryCode),
  }).toEqual({ cn: ["CN"], tw: ["TW"], de: ["DE"] });
});

test("an implicitly created discount cart keeps the shopper's market", async () => {
  // `updateDiscountCodes` with no cart id creates one. The route never names a
  // buyer identity, so this is only correct if the default reaches implicit
  // creates too.
  const { loader } = await loadAppModule<{
    loader: (args: LoaderFunctionArgs) => Promise<Response>;
  }>("routes/others/discount-code.tsx");

  const run = (pathPrefix: string) =>
    cartCreateFrom(pathPrefix, (context) =>
      loader({
        request: new Request(
          `https://shop.test${pathPrefix}/discount/SALE?redirect=/collections/all`,
        ),
        context,
        params: { code: "SALE", locale: pathPrefix.slice(1) },
      } as unknown as LoaderFunctionArgs),
    );

  const cn = await run("/zh-cn");
  const de = await run("/de-de");

  expect({
    cn: cn.map((call) => call.countryCode),
    de: de.map((call) => call.countryCode),
  }).toEqual({ cn: ["CN"], de: ["DE"] });
});

test("the cart action's resolved market outranks the context default", async () => {
  // The cart action resolves the country from the URL or the `Referer`, then
  // passes it explicitly. A context default that overwrote it would undo
  // settled behaviour, so this drives the real action through a real context
  // whose own default is a different market.
  const restoreCaches = installWorkerCaches();
  const realFetch = globalThis.fetch;
  const sent: string[] = [];

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body;
    if (typeof body === "string" && body.includes("mutation cart")) {
      const parsed = JSON.parse(body) as {
        query?: string;
        variables?: {
          buyerIdentity?: { countryCode?: string };
          input?: { buyerIdentity?: { countryCode?: string } };
        };
      };
      const name = /mutation (\w+)/.exec(parsed.query ?? "")?.[1] ?? "?";
      const country =
        parsed.variables?.buyerIdentity?.countryCode ??
        parsed.variables?.input?.buyerIdentity?.countryCode ??
        null;
      sent.push(`${name}:${country}`);
    }
    return new Response(
      JSON.stringify({
        data: {
          cartCreate: {
            cart: { id: "gid://shopify/Cart/1", checkoutUrl: "https://c.test" },
            userErrors: [],
            warnings: [],
          },
          cartBuyerIdentityUpdate: {
            cart: { id: "gid://shopify/Cart/1", checkoutUrl: "https://c.test" },
            userErrors: [],
            warnings: [],
          },
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof globalThis.fetch;

  try {
    // The context's own default is CN. Only the action's resolution of the
    // posting page can produce DE, so the two cannot be confused.
    const context = (await createHydrogenRouterContext(
      new Request("https://shop.test/zh-cn/cart"),
      TEST_ENV,
      TEST_EXECUTION_CONTEXT,
    )) as unknown as AppLoadContext;

    const { action } = await loadAppModule<{
      action: (args: ActionFunctionArgs) => Promise<unknown>;
    }>("routes/cart/cart-page.tsx");

    await action({
      request: new Request("https://shop.test/de-de/cart", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          cartFormInput: JSON.stringify({
            action: CartForm.ACTIONS.BuyerIdentityUpdate,
            inputs: { buyerIdentity: {} },
          }),
        }),
      }),
      context,
      params: {},
    } as unknown as ActionFunctionArgs).catch(() => undefined);
  } finally {
    globalThis.fetch = realFetch;
    restoreCaches();
  }

  expect(sent).toEqual(["cartCreate:DE"]);
});

test("an explicit buyer identity still outranks the market default", async () => {
  // The cart action resolves the country from the URL or the `Referer`, so a
  // form posted to an unprefixed `/cart` from a `/de-de` page must stay German.
  // A default that overwrote that would undo settled behaviour.
  const calls = await cartCreateFrom("/zh-cn", (context) =>
    context.cart.create({
      lines: [
        {
          merchandiseId: "gid://shopify/ProductVariant/1",
          quantity: 1,
        },
      ],
      buyerIdentity: { countryCode: "DE" },
    }),
  );

  expect(calls.map((call) => call.countryCode)).toEqual(["DE"]);
});
