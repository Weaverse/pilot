import { WeaverseClient } from "@weaverse/hydrogen/react-router";
import { createCustomerAccount } from "~/.server/customer-account";
import { AppSession } from "~/.server/session";
import {
  createRequestStorefront,
  resolveRequestLocale,
  type Storefront,
} from "~/.server/storefront";
import type { Locale } from "~/utils/locale";
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
  const weaverse = throwRouteFailures(
    new WeaverseClient({
      storefront: weaverseStorefront(storefront, resolveRequestLocale(request)),
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

/**
 * The storefront client as Weaverse should see it.
 *
 * Weaverse keys Translation Manager overrides by the locale a merchant picks
 * in Studio — the market's public BCP-47 identity — and builds that key as
 * lowercase `${language}-${country}` from `i18n`. Shopify wants the opposite
 * for Chinese: a script-specific `LanguageCode` its enum defines. Handing one
 * identity to both asks the translation API for `zh_tw-hk`, which matches
 * nothing and silently resolves to theme defaults.
 *
 * `market` is the canonical entry, whose `language` is the public code; the
 * storefront's own `i18n` already carries the Shopify enum. `graphql()` reads
 * `$country`/`$language` from the request context, not from this property,
 * so re-labelling `i18n` changes what Weaverse reads without weakening what
 * Shopify receives (verified in Weaverse/pilot#207).
 */
export function weaverseStorefront<T extends { i18n: Locale }>(
  storefront: T,
  market: Locale,
): T {
  return { ...storefront, i18n: market };
}

export type { Storefront };
