import { expect, test } from "@playwright/test";
import {
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
} from "@shopify/hydrogen/customer-account";
import type { LoaderFunctionArgs } from "react-router";
import { loader as checkoutLoader } from "../../app/routes/cart/checkout";
import { createTestContext, serverFetch } from "../support/hydrogen-env";

/**
 * The customer and the cart stay in step, as Shopify's Customer Accounts
 * guide (step 4) wires it: signing in or refreshing attaches the customer to
 * the cart, and a session that ends detaches them, so a shared browser never
 * keeps a cart (and its checkout) tied to the previous customer. These run
 * through the real worker, answering Shopify's token endpoint and Storefront
 * API in place of the network.
 */

const CART_ID = "gid://shopify/Cart/c1";
const CART_COOKIE = "cart=c1";

type Tokens = {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresAt: number;
};

const SIGNED_IN: Tokens = {
  accessToken: "token-a",
  refreshToken: "refresh-a",
  idToken: "id-a",
  expiresAt: Date.now() + 3_600_000,
};

/** An access token that has expired, with a refresh token to renew it. */
const EXPIRED: Tokens = { ...SIGNED_IN, expiresAt: Date.now() - 1000 };

/** A Storefront API answer whose buyer identity update succeeded. */
const UPDATED = {
  cartBuyerIdentityUpdate: {
    cart: { id: CART_ID, checkoutUrl: "https://checkout.test/cart/c/c1" },
    userErrors: [],
  },
};

type BuyerIdentityCall = {
  operation: string;
  cartId: unknown;
  buyerIdentity: Record<string, unknown>;
};

/**
 * Answers Shopify while `run` executes: the token endpoint with `token`, and
 * Storefront API operations with `respond`. Records every buyer identity
 * update, Hydrogen's (`CartBuyerIdentityUpdate`) and Pilot's, and the input of
 * every cart Hydrogen creates.
 */
async function withShopify<T>(
  run: () => Promise<T>,
  {
    token = () => new Response(null, { status: 500 }),
    respond = () => UPDATED,
  }: {
    token?: () => Response;
    respond?: (operation: string) => unknown;
  } = {},
) {
  const updates: BuyerIdentityCall[] = [];
  const creates: Record<string, unknown>[] = [];
  const realFetch = globalThis.fetch;
  const realError = console.error;
  // Hydrogen logs failed syncs; the failures here are deliberate.
  console.error = () => {};
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.endsWith("/oauth/token")) return token();
    const body = typeof init?.body === "string" ? init.body : null;
    if (!body?.includes('"query"')) return Response.json({});
    const { query, variables = {} } = JSON.parse(body) as {
      query: string;
      variables?: Record<string, unknown>;
    };
    const operation = /(?:query|mutation)\s+(\w+)/.exec(query)?.[1] ?? "";
    if (query.includes("cartBuyerIdentityUpdate")) {
      updates.push({
        operation,
        cartId: variables.cartId,
        buyerIdentity: variables.buyerIdentity as Record<string, unknown>,
      });
    }
    if (operation === "CartCreate") {
      creates.push(variables.input as Record<string, unknown>);
    }
    return Response.json({ data: respond(operation) });
  }) as typeof globalThis.fetch;
  try {
    return { result: await run(), updates, creates };
  } finally {
    globalThis.fetch = realFetch;
    console.error = realError;
  }
}

/** The `session` cookie of a shopper holding `tokens`. */
async function sessionCookie(tokens: Tokens) {
  const context = await createTestContext("https://shop.test/");
  context.session.setSessionItem("customerAccount", { tokens });
  const headers = await context.session.commit();
  return (headers?.["Set-Cookie"] ?? "").split(";", 1)[0];
}

function signOutRequest(cookie: string) {
  return new Request(`https://shop.test${CUSTOMER_ACCOUNT_LOGOUT_PATH}`, {
    method: "POST",
    headers: {
      Origin: "https://shop.test",
      Referer: "https://shop.test/account",
      Cookie: cookie,
    },
  });
}

function refreshRequest(cookie: string) {
  return new Request(
    `https://shop.test${CUSTOMER_ACCOUNT_REFRESH_PATH}?return_to=/account`,
    { headers: { Cookie: cookie } },
  );
}

/** A Storefront API answer whose buyer identity update failed. */
function failedDetach(operation: string) {
  return operation === "CartBuyerIdentityUpdate"
    ? {
        cartBuyerIdentityUpdate: {
          cart: null,
          userErrors: [{ code: "INVALID", field: null, message: "Nope" }],
        },
      }
    : UPDATED;
}

const DETACH = {
  cartId: CART_ID,
  buyerIdentity: { customerAccessToken: null },
};

function expiresCartCookie(response: Response) {
  return response.headers
    .getSetCookie()
    .some((cookie) => cookie.startsWith("cart=;") && /Max-Age=0/.test(cookie));
}

test("signing in through a refresh attaches the customer to the guest cart", async () => {
  const cookie = `${await sessionCookie(EXPIRED)}; ${CART_COOKIE}`;
  const { updates } = await withShopify(
    () => serverFetch(refreshRequest(cookie)),
    {
      token: () =>
        Response.json({
          access_token: "token-b",
          refresh_token: "refresh-b",
          expires_in: 3600,
        }),
    },
  );

  expect(updates).toContainEqual({
    operation: "CartBuyerIdentityUpdate",
    cartId: CART_ID,
    buyerIdentity: { customerAccessToken: "token-b" },
  });
});

test("checkout right after sign-in carries the customer", async () => {
  const cookie = `${await sessionCookie(SIGNED_IN)}; ${CART_COOKIE}`;
  const request = new Request("https://shop.test/cart/checkout", {
    headers: { Cookie: cookie },
  });
  const { result, updates } = await withShopify(async () =>
    checkoutLoader({
      request,
      context: await createTestContext(request),
      params: {},
    } as unknown as LoaderFunctionArgs),
  );

  expect(updates[0]).toMatchObject({
    operation: "PilotCartBuyerIdentity",
    cartId: CART_ID,
    buyerIdentity: { customerAccessToken: "token-a" },
  });
  expect(result.headers.get("Location")).toBe(
    "https://checkout.test/cart/c/c1",
  );
});

test("a first add while signed in creates the cart with the customer", async () => {
  const cookie = await sessionCookie(SIGNED_IN);
  const { creates } = await withShopify(() =>
    serverFetch(
      new Request("https://shop.test/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({
          intent: "add",
          lines: [
            { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
          ],
        }),
      }),
    ),
  );

  expect(creates[0]?.buyerIdentity).toMatchObject({
    customerAccessToken: "token-a",
  });
});

test("signing out on a shared browser detaches the customer from the cart", async () => {
  const cookie = `${await sessionCookie(SIGNED_IN)}; ${CART_COOKIE}`;
  const { result, updates } = await withShopify(() =>
    serverFetch(signOutRequest(cookie)),
  );

  expect([302, 303]).toContain(result.status);
  expect(updates).toContainEqual(expect.objectContaining(DETACH));
  expect(expiresCartCookie(result)).toBe(false);
});

test("a failed detach on sign-out drops the cart cookie", async () => {
  const cookie = `${await sessionCookie(SIGNED_IN)}; ${CART_COOKIE}`;
  const { result } = await withShopify(
    () => serverFetch(signOutRequest(cookie)),
    { respond: failedDetach },
  );

  expect([302, 303]).toContain(result.status);
  expect(expiresCartCookie(result)).toBe(true);
});

test("a programmatic sign-out detaches the cart like the sign-out form", async () => {
  // `customerAccount.logout()` runs from a loader when the session is
  // unusable; it must not leave the cart behind on the previous customer.
  const cookie = `${await sessionCookie(SIGNED_IN)}; ${CART_COOKIE}`;
  const { result, updates } = await withShopify(
    async () => {
      const context = await createTestContext(
        new Request("https://shop.test/fr-ca/account", {
          headers: { Cookie: cookie },
        }),
      );
      return context.customerAccount.logout();
    },
    { respond: failedDetach },
  );

  expect(updates).toContainEqual(expect.objectContaining(DETACH));
  expect(expiresCartCookie(result)).toBe(true);
  // The session commit rides on the redirect: the tokens are gone.
  expect(
    result.headers.getSetCookie().some((c) => c.startsWith("session=")),
  ).toBe(true);
});

test("an expired refresh token detaches the customer from the cart", async () => {
  const cookie = `${await sessionCookie(EXPIRED)}; ${CART_COOKIE}`;
  const { updates } = await withShopify(
    () => serverFetch(refreshRequest(cookie)),
    { token: () => new Response(null, { status: 400 }) },
  );

  expect(updates).toContainEqual(expect.objectContaining(DETACH));
});

test("a cart change after the session ended detaches the customer", async () => {
  // The session ended outside the account routes (a loader's refresh was
  // rejected): the next cart change must not keep the old customer.
  const { updates } = await withShopify(() =>
    serverFetch(
      new Request("https://shop.test/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: CART_COOKIE },
        body: JSON.stringify({ intent: "note-update", note: "hi" }),
      }),
    ),
  );

  expect(updates[0]).toMatchObject({
    operation: "PilotCartBuyerIdentity",
    buyerIdentity: { customerAccessToken: null },
  });
});

test("a cart change keeps the customer while a refresh fails transiently", async () => {
  const cookie = `${await sessionCookie(EXPIRED)}; ${CART_COOKIE}`;
  const { updates } = await withShopify(() =>
    serverFetch(
      new Request("https://shop.test/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ intent: "note-update", note: "hi" }),
      }),
    ),
  );

  expect(updates[0]?.operation).toBe("PilotCartBuyerIdentity");
  expect(updates[0]?.buyerIdentity).not.toHaveProperty("customerAccessToken");
});
