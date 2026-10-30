import type { AppContext } from "../../app/.server/context";
import { loadAppModule } from "./render-app";

/**
 * A complete `Env` for exercising the real request context in tests.
 *
 * `createAppContext` and `server.ts` read every one of these, so a partial
 * object would only be usable through a cast — and a cast is exactly what lets
 * a context test drift from the context that ships.
 */
export const TEST_ENV: Env = {
  SESSION_SECRET: "test-session-secret",
  PUBLIC_STOREFRONT_API_TOKEN: "public-token",
  PRIVATE_STOREFRONT_API_TOKEN: "private-token",
  PUBLIC_STORE_DOMAIN: "shop.test",
  PUBLIC_STOREFRONT_ID: "storefront-id",
  PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: "customer-client-id",
  PUBLIC_CHECKOUT_DOMAIN: "checkout.test",
  // Hydrogen validates it: a Shopify shop ID is numeric.
  SHOP_ID: "1",
  PUBLIC_GOOGLE_GTM_ID: "",
  JUDGEME_PRIVATE_API_TOKEN: "",
  CUSTOM_COLLECTION_BANNER_METAFIELD: "",
  METAOBJECT_COLORS_TYPE: "",
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

/** One GraphQL operation as it left the process for Shopify. */
export type StorefrontCall = {
  /** The operation name, e.g. `cartCreate` or `PilotCartBuyerIdentity`. */
  operation: string;
  query: string;
  variables: Record<string, unknown>;
};

/**
 * Records every GraphQL operation sent while `run` executes.
 *
 * `respond` returns the `data` for each operation (default: `{}`); any other
 * request (Weaverse, a CDN) is answered with an empty JSON object. Reading
 * the request body is the only way to observe what the client injected, such
 * as `$country`/`$language`, which no value the app returns reveals.
 */
export async function recordStorefrontCalls<T>(
  run: () => Promise<T>,
  respond: (call: StorefrontCall) => unknown = () => ({}),
): Promise<{ result: T; calls: StorefrontCall[] }> {
  const calls: StorefrontCall[] = [];
  const realFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw =
      init?.body ?? (input instanceof Request ? await input.text() : null);
    const body = typeof raw === "string" ? raw : null;
    if (body?.includes('"query"')) {
      const parsed = JSON.parse(body) as {
        query: string;
        variables?: Record<string, unknown>;
      };
      const call = {
        operation:
          /(?:query|mutation)\s+(\w+)/.exec(parsed.query)?.[1] ?? "anonymous",
        query: parsed.query,
        variables: parsed.variables ?? {},
      };
      calls.push(call);
      return Response.json({ data: respond(call) });
    }
    return Response.json({});
  }) as typeof globalThis.fetch;

  try {
    return { result: await run(), calls };
  } finally {
    globalThis.fetch = realFetch;
  }
}

/**
 * Installs the Cache API the worker runtime provides and Node does not.
 *
 * `createAppContext` opens a cache before it does anything else, so without
 * this the context cannot be built at all and a test would be reduced to
 * re-implementing it. Every entry misses, which is what an uncached cold
 * request does in production.
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

type ServerEntry = {
  createAppContext: (
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ) => Promise<AppContext>;
  server: {
    fetch: (
      request: Request,
      env: Env,
      executionContext: ExecutionContext,
    ) => Promise<Response>;
  };
};

let serverEntry: Promise<ServerEntry> | undefined;

/**
 * The worker's real fetch handler (`server.ts`) and request context, bundled
 * as the app bundles them.
 *
 * Only React Router's build is stubbed: it is a Vite virtual module that does
 * not exist outside a build. A request that falls through Hydrogen's handlers
 * to the router therefore fails loudly (500) instead of rendering, so a test
 * can only pass on the routes Hydrogen and Pilot answer before the app.
 */
function loadServerEntry(): Promise<ServerEntry> {
  serverEntry ??= loadAppModule<ServerEntry>(
    "../tests/support/server-entry.ts",
    { "virtual:react-router/server-build": "export const routes = {};" },
  );
  return serverEntry;
}

/** The real request context for `request`, as `server.ts` builds it. */
export async function createTestContext(
  request: Request | string,
): Promise<AppContext> {
  const { createAppContext } = await loadServerEntry();
  const restoreCaches = installWorkerCaches();
  try {
    return await createAppContext(
      typeof request === "string" ? new Request(request) : request,
      TEST_ENV,
      TEST_EXECUTION_CONTEXT,
    );
  } finally {
    restoreCaches();
  }
}

/** Sends `request` through the worker's fetch handler (`server.ts`). */
export async function serverFetch(request: Request): Promise<Response> {
  const { server } = await loadServerEntry();
  const restoreCaches = installWorkerCaches();
  try {
    return await server.fetch(request, TEST_ENV, TEST_EXECUTION_CONTEXT);
  } finally {
    restoreCaches();
  }
}
