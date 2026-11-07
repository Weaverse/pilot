import {
  type CacheInstance,
  type CachingStrategy,
  createShopifyRequestContext,
  createStorefrontClient,
  type PublicStorefrontClient,
  type RequestScopedPrivateStorefrontClient,
  type ShopifyRequestContext,
} from "@shopify/hydrogen";
import {
  type Locale,
  providerLanguageFor,
  resolveLocale,
} from "~/utils/locale";

// The bare client types default their per-call options to `{}`, which drops
// `cache` from `graphql()`. Every Pilot query passes one, so carry it here.
type StorefrontCallOptions = { cache?: CachingStrategy };

/** The request's market, with Shopify's provider language as `language`. */
export type StorefrontI18n = Locale & { pathPrefix: string };

export type Storefront = (
  | RequestScopedPrivateStorefrontClient<StorefrontCallOptions>
  | PublicStorefrontClient<StorefrontCallOptions>
) & { i18n: StorefrontI18n };

/**
 * Paths Hydrogen's request handlers own. They are matched exactly and never
 * carry a market prefix, so the market comes from the page that called them.
 */
const UNPREFIXED_HANDLER_PATH = /^\/(api\/|account\/(login|logout|refresh)$)/;

/**
 * The market a request is served in.
 *
 * Page requests carry the market in their path. Hydrogen-owned endpoints
 * (`/api/cart`, `/api/predictive-search`, the Customer Account login and
 * logout) are always unprefixed, so for those the market is read from the
 * same-origin `Referer` instead, as Pilot's `/cart` action already did. A
 * missing or foreign `Referer` falls back to the default market.
 */
export function resolveRequestLocale(request: Request): Locale {
  const url = new URL(request.url);
  if (!UNPREFIXED_HANDLER_PATH.test(url.pathname)) {
    return resolveLocale(url.pathname);
  }
  // A login link carries the shopper's page in `return_to`, which survives
  // the redirects into `/account/login` more reliably than the `Referer`.
  if (url.pathname === "/account/login") {
    const returnTo = url.searchParams.get("return_to");
    if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
      return resolveLocale(new URL(returnTo, url).pathname);
    }
  }
  const referer = request.headers.get("Referer");
  if (!referer) return resolveLocale("/");
  try {
    const source = new URL(referer);
    return resolveLocale(source.origin === url.origin ? source.pathname : "/");
  } catch {
    return resolveLocale("/");
  }
}

// Oxygen sets `oxygen-buyer-ip`; the others cover local dev behind a proxy.
const BUYER_IP_HEADERS = [
  "oxygen-buyer-ip",
  "cf-connecting-ip",
  "x-forwarded-for",
] as const;
const DEVELOPMENT_BUYER_IP = "127.0.0.1";

function getBuyerIp(headers: Headers): string | undefined {
  for (const header of BUYER_IP_HEADERS) {
    const ip = headers.get(header)?.split(",")[0]?.trim();
    if (ip) return ip;
  }
  return process.env.NODE_ENV === "production"
    ? undefined
    : DEVELOPMENT_BUYER_IP;
}

/**
 * The request-scoped Storefront API client.
 *
 * Oxygen injects `PRIVATE_STOREFRONT_API_TOKEN` for a linked storefront; the
 * private client then forwards the buyer's IP for Shopify's bot protection.
 * Without a private token, or without a trusted buyer IP, the public token is
 * used, so a merchant running Pilot locally with only the public token keeps a
 * working store.
 */
export function createRequestStorefront({
  request,
  env,
  cache,
  waitUntil,
}: {
  request: Request;
  env: Env;
  cache: CacheInstance;
  waitUntil: ExecutionContext["waitUntil"];
}): Storefront {
  const locale = resolveRequestLocale(request);
  // Shopify gets the provider language (`ZH_TW`, not `ZH`); the rest of the
  // market identity rides along for loaders that read it.
  const i18n = { ...locale, language: providerLanguageFor(locale) };
  const buyerIp = getBuyerIp(request.headers);
  const config = {
    storeDomain: env.PUBLIC_STORE_DOMAIN,
    storefrontId: env.PUBLIC_STOREFRONT_ID || undefined,
    cache,
    waitUntil,
  };

  if (env.PRIVATE_STOREFRONT_API_TOKEN && buyerIp) {
    return createStorefrontClient({
      type: "private",
      requestContext: createShopifyRequestContext({ request, i18n, buyerIp }),
      config: {
        ...config,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
      },
    }) as Storefront;
  }

  return createStorefrontClient({
    type: "public",
    requestContext: createShopifyRequestContext({ request, i18n }),
    config: {
      ...config,
      publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN || undefined,
    },
  }) as Storefront;
}

export type StorefrontRequestContext = ShopifyRequestContext<StorefrontI18n>;
