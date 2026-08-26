/**
 * A complete `Env` for exercising the real request context in tests.
 *
 * `createHydrogenRouterContext` reads every one of these, so a partial object
 * would only be usable through a cast — and a cast is exactly what lets a
 * context test drift from the context that ships.
 */
export const TEST_ENV: Env = {
  SESSION_SECRET: "test-session-secret",
  PUBLIC_STOREFRONT_API_TOKEN: "public-token",
  PRIVATE_STOREFRONT_API_TOKEN: "private-token",
  PUBLIC_STORE_DOMAIN: "shop.test",
  PUBLIC_STOREFRONT_ID: "storefront-id",
  PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: "customer-client-id",
  PUBLIC_CUSTOMER_ACCOUNT_API_URL: "https://customer.test",
  PUBLIC_CHECKOUT_DOMAIN: "checkout.test",
  SHOP_ID: "shop-id",
  PUBLIC_GOOGLE_GTM_ID: "",
  JUDGEME_PRIVATE_API_TOKEN: "",
  CUSTOM_COLLECTION_BANNER_METAFIELD: "",
  METAOBJECT_COLORS_TYPE: "",
  METAOBJECT_COLOR_NAME_KEY: "",
  METAOBJECT_COLOR_VALUE_KEY: "",
  WEAVERSE_API_KEY: "",
  KLAVIYO_PRIVATE_API_TOKEN: "",
  PUBLIC_SHOPIFY_INBOX_SHOP_ID: "",
  WEAVERSE_HOST: "https://weaverse.test",
  WEAVERSE_PROJECT_ID: "test-project",
};

/** An `ExecutionContext` that runs nothing in the background. */
export const TEST_EXECUTION_CONTEXT: ExecutionContext = {
  waitUntil: () => undefined,
  // Typed `never`: reaching it means the worker gave up on the request, which
  // a test should surface rather than silently continue past.
  passThroughOnException: () => {
    throw new Error("passThroughOnException called in a test");
  },
  props: undefined,
};

/**
 * Records every URL fetched while `run` executes, answering each with `body`.
 *
 * The context and its clients reach the network on construction and on load;
 * asserting on the URLs they choose is how a test observes which identity a
 * provider was actually given.
 */
export async function recordFetches<T>(
  run: () => Promise<T>,
  body = "{}",
): Promise<{ result: T; urls: string[] }> {
  const urls: string[] = [];
  const realFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    urls.push(String(input instanceof Request ? input.url : input));
    return new Response(body, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof globalThis.fetch;

  try {
    return { result: await run(), urls };
  } finally {
    globalThis.fetch = realFetch;
  }
}

/**
 * Installs the Cache API the worker runtime provides and Node does not.
 *
 * `createHydrogenRouterContext` opens a cache before it does anything else, so
 * without this the context cannot be built at all and a test would be reduced
 * to re-implementing it. Every entry misses, which is what an uncached
 * cold request does in production.
 */
export function installWorkerCaches(): () => void {
  const globals = globalThis as { caches?: CacheStorage };
  if (globals.caches) {
    return () => undefined;
  }

  const cache: Cache = {
    add: async () => undefined,
    addAll: async () => undefined,
    delete: async () => false,
    keys: async () => [],
    match: async () => undefined,
    matchAll: async () => [],
    put: async () => undefined,
  };

  globals.caches = {
    open: async () => cache,
    delete: async () => false,
    has: async () => false,
    keys: async () => [],
    match: async () => undefined,
  };

  return () => {
    globals.caches = undefined;
  };
}
