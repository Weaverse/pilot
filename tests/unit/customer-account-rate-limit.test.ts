import { expect, test } from "@playwright/test";
import { gql } from "@shopify/hydrogen/customer-account";
import { createTestContext } from "../support/hydrogen-env";

/**
 * The Customer Account API answers a burst with HTTP 429 and `Retry-After`.
 * `customerAccount.graphql` retries a query once when the wait is short, and
 * never retries a mutation, which may already have been applied. These run
 * the real client, answering Shopify in place of the network.
 */

const CUSTOMER_QUERY = gql(`#graphql
  query RateLimitCustomer {
    customer {
      firstName
    }
  }
`);

const CUSTOMER_UPDATE_MUTATION = gql(`#graphql
  mutation RateLimitCustomerUpdate($customer: CustomerUpdateInput!) {
    customerUpdate(input: $customer) {
      userErrors {
        message
      }
    }
  }
`);

const SIGNED_IN = {
  accessToken: "token-a",
  refreshToken: "refresh-a",
  expiresAt: Date.now() + 3_600_000,
};

function rateLimited(retryAfter?: string) {
  return new Response(null, {
    status: 429,
    headers: retryAfter ? { "Retry-After": retryAfter } : {},
  });
}

/**
 * Runs `run` with a signed-in customer, answering the Customer Account API
 * with `responses` in turn and Shopify's token endpoint with `token`.
 */
async function withCustomerAccountApi<T>(
  responses: Response[],
  run: (context: Awaited<ReturnType<typeof createTestContext>>) => Promise<T>,
  {
    tokens = SIGNED_IN,
    token = () => new Response(null, { status: 500 }),
  } = {},
) {
  let calls = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.endsWith("/oauth/token")) return token();
    if (!url.includes("/account/customer/api/")) return Response.json({});
    calls += 1;
    return responses.shift() ?? Response.json({ data: {} });
  }) as typeof globalThis.fetch;
  try {
    const context = await createTestContext("https://shop.test/account");
    context.session.setSessionItem("customerAccount", { tokens });
    return { result: await run(context), calls: () => calls };
  } finally {
    globalThis.fetch = realFetch;
  }
}

test("a rate-limited query is retried once after Retry-After", async () => {
  const started = Date.now();
  const { result, calls } = await withCustomerAccountApi(
    [
      rateLimited("1"),
      Response.json({ data: { customer: { firstName: "Ada" } } }),
    ],
    (context) => context.customerAccount.graphql(CUSTOMER_QUERY),
  );

  expect(result.data?.customer?.firstName).toBe("Ada");
  expect(calls()).toBe(2);
  expect(Date.now() - started).toBeGreaterThanOrEqual(1000);
});

test("a query still rate-limited after its retry fails clearly", async () => {
  const { result, calls } = await withCustomerAccountApi(
    [rateLimited("0"), rateLimited("2")],
    (context) =>
      context.customerAccount.graphql(CUSTOMER_QUERY).catch((error) => error),
  );

  expect(calls()).toBe(2);
  expect(result).toBeInstanceOf(Error);
  expect((result as Error).message).toBe(
    "Too many requests, please try again in 2 seconds.",
  );
});

test("a long Retry-After is not waited out", async () => {
  const started = Date.now();
  const { result, calls } = await withCustomerAccountApi(
    [rateLimited("30")],
    (context) =>
      context.customerAccount.graphql(CUSTOMER_QUERY).catch((error) => error),
  );

  expect(calls()).toBe(1);
  expect(Date.now() - started).toBeLessThan(1000);
  expect((result as Error).message).toBe(
    "Too many requests, please try again in 30 seconds.",
  );
});

test("a rate-limited mutation is never retried", async () => {
  const { result, calls } = await withCustomerAccountApi(
    [rateLimited("1")],
    (context) =>
      context.customerAccount
        .graphql(CUSTOMER_UPDATE_MUTATION, {
          variables: { customer: { firstName: "Ada" } },
        })
        .catch((error) => error),
  );

  expect(calls()).toBe(1);
  expect((result as Error).message).toBe(
    "Too many requests, please try again in a moment.",
  );
});

test("a rate-limited token refresh keeps the customer signed in", async () => {
  // Hydrogen treats a 429 from the token endpoint as transient: the tokens
  // stay, so the cart keeps its customer and a later request can refresh.
  let refreshes = 0;
  const { result, calls } = await withCustomerAccountApi(
    [],
    async (context) => ({
      cartToken: await context.customerAccount.getCartCustomerAccessToken(),
      isLoggedIn: await context.customerAccount.isLoggedIn(),
    }),
    {
      tokens: { ...SIGNED_IN, expiresAt: Date.now() - 1000 },
      token: () => {
        refreshes += 1;
        return rateLimited("1");
      },
    },
  );

  expect(refreshes).toBe(1);
  expect(result).toEqual({ cartToken: undefined, isLoggedIn: true });
  expect(calls()).toBe(0);
});
