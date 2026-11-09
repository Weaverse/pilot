import { WeaverseClient } from "@weaverse/hydrogen/react-router";
import { createCustomerAccount } from "~/.server/customer-account";
import { AppSession } from "~/.server/session";
import {
  createRequestStorefront,
  resolveRequestLocale,
  type Storefront,
} from "~/.server/storefront";
import { components } from "~/weaverse/components";
import { throwRouteFailures } from "~/weaverse/load-failure";
import { themeSchema } from "~/weaverse/schema.server";

/**
 * The per-request values every loader and action reads from `context`.
 *
 * Hydrogen 2026.10 has no `createHydrogenContext()`; Pilot builds the same
 * shape itself and `server.ts` copies it onto React Router's context, so
 * loaders keep reading `context.storefront`, `context.weaverse` and friends
 * (typed in `env.d.ts`).
 */
export async function createAppContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open("hydrogen"),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);
  const storefront = createRequestStorefront({
    request,
    env,
    cache,
    waitUntil,
  });
  const customerAccount = createCustomerAccount({
    env,
    request,
    session,
    storefront,
  });

  // A Weaverse outage must not answer like a missing page: page loads
  // reject on failure and leave the route as a retryable 503 (see
  // `throwRouteFailures`). Missing pages still resolve and stay 404.
  //
  // Weaverse keys Translation Manager overrides by the market's public locale
  // (lowercase `${language}-${country}`), so it gets the canonical market as
  // `locale`. The storefront client keeps Shopify's provider language
  // (`ZH_TW`, not `ZH`): handing it to Weaverse would ask for `zh_tw-hk`,
  // which matches nothing and silently falls back to theme defaults.
  const weaverse = throwRouteFailures(
    new WeaverseClient({
      storefront,
      locale: resolveRequestLocale(request),
      env,
      cache,
      waitUntil,
      request,
      customerAccount,
      themeSchema,
      components,
      throwPageLoadFailures: true,
    }),
  );

  return {
    env,
    cache,
    waitUntil,
    session,
    storefront,
    customerAccount,
    weaverse,
  };
}

export type AppContext = Awaited<ReturnType<typeof createAppContext>>;

export type { Storefront };
