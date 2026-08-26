import type { I18nBase } from "@shopify/hydrogen";
import type {
  CountryCode,
  CurrencyCode,
  LanguageCode,
} from "@shopify/hydrogen/storefront-api-types";

/**
 * A single Shopify market served by this storefront.
 *
 * `language`/`country` are the codes sent to the Storefront API's `@inContext`
 * directive and to Weaverse when resolving localized page content, so they must
 * be real Shopify enum members — not display strings.
 */
export type Locale = I18nBase & {
  language: LanguageCode;
  country: CountryCode;
  /** Leading URL segment for this market; `""` for the default market. */
  pathPrefix: string;
  /** Market label shown in the country selector. */
  label: string;
  /** Language name in its own language, shown when a market sells in several. */
  languageLabel: string;
  currency: CurrencyCode;
  /** BCP-47 tag for `hreflang` and `<html lang>`. */
  hreflang: string;
  direction: "ltr" | "rtl";
};

/**
 * The single source of truth for every localized surface: request context,
 * `themeSchema.i18n`, the country selector, link prefixing, cart buyer
 * identity, checkout, canonical/hreflang tags, and the sitemap.
 *
 * Adding a market is one entry here. Two rules hold, and `tests/unit/
 * locale.test.ts` enforces them:
 *
 * 1. Exactly one entry has `pathPrefix: ""` — the default market, served from
 *    the unprefixed root.
 * 2. Every other `pathPrefix` is `/{language}-{country}` lowercased, so a URL
 *    can never disagree with the Storefront API context it selects.
 *
 * The markets below are Pilot's reference set. They intentionally cover an
 * RTL market (ar-AE) and a non-Latin script (hi-IN) so the theme's
 * bidirectional and font handling stay exercised.
 */
export const SUPPORTED_LOCALES: Locale[] = [
  {
    pathPrefix: "",
    label: "United States (USD $)",
    languageLabel: "English",
    language: "EN",
    country: "US",
    currency: "USD",
    hreflang: "en-US",
    direction: "ltr",
  },
  {
    pathPrefix: "/hi-in",
    label: "India (INR ₹)",
    languageLabel: "हिन्दी",
    language: "HI",
    country: "IN",
    currency: "INR",
    hreflang: "hi-IN",
    direction: "ltr",
  },
  {
    pathPrefix: "/en-in",
    label: "India (INR ₹)",
    languageLabel: "English",
    language: "EN",
    country: "IN",
    currency: "INR",
    hreflang: "en-IN",
    direction: "ltr",
  },
  {
    pathPrefix: "/ar-ae",
    label: "United Arab Emirates (AED د.إ)",
    languageLabel: "العربية",
    language: "AR",
    country: "AE",
    currency: "AED",
    hreflang: "ar-AE",
    direction: "rtl",
  },
  {
    pathPrefix: "/en-ae",
    label: "United Arab Emirates (AED د.إ)",
    languageLabel: "English",
    language: "EN",
    country: "AE",
    currency: "AED",
    hreflang: "en-AE",
    direction: "ltr",
  },
  {
    pathPrefix: "/ar-sa",
    label: "Saudi Arabia (SAR ﷼)",
    languageLabel: "العربية",
    language: "AR",
    country: "SA",
    currency: "SAR",
    hreflang: "ar-SA",
    direction: "rtl",
  },
  {
    pathPrefix: "/es-es",
    label: "Spain (EUR €)",
    languageLabel: "Español",
    language: "ES",
    country: "ES",
    currency: "EUR",
    hreflang: "es-ES",
    direction: "ltr",
  },
  {
    pathPrefix: "/fr-fr",
    label: "France (EUR €)",
    languageLabel: "Français",
    language: "FR",
    country: "FR",
    currency: "EUR",
    hreflang: "fr-FR",
    direction: "ltr",
  },
  {
    pathPrefix: "/de-de",
    label: "Germany (EUR €)",
    languageLabel: "Deutsch",
    language: "DE",
    country: "DE",
    currency: "EUR",
    hreflang: "de-DE",
    direction: "ltr",
  },
  {
    pathPrefix: "/en-gb",
    label: "United Kingdom (GBP £)",
    languageLabel: "English",
    language: "EN",
    country: "GB",
    currency: "GBP",
    hreflang: "en-GB",
    direction: "ltr",
  },
];

/**
 * The market served from the unprefixed root, and the fallback for any request
 * whose first segment is not a configured prefix.
 */
export const DEFAULT_LOCALE: Locale = SUPPORTED_LOCALES[0];

/**
 * Prefix → market. Static, string-keyed, and read on every request, so it is
 * built once at module load rather than scanned per lookup.
 */
const LOCALE_BY_PREFIX: Record<string, Locale> = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale.pathPrefix, locale]),
);

/**
 * Splits a URL path into its first segment and the rest, ignoring the query and
 * React Router's single-fetch `.data` suffix (`/de-de/cart.data`).
 */
function splitLeadingSegment(path: string): [string, string] {
  const queryAt = path.search(/[?#]/);
  const pathname = queryAt === -1 ? path : path.slice(0, queryAt);
  const query = queryAt === -1 ? "" : path.slice(queryAt);
  const withoutData = pathname.endsWith(".data")
    ? pathname.slice(0, -".data".length)
    : pathname;
  const slashAt = withoutData.indexOf("/", 1);

  return slashAt === -1
    ? [withoutData, query]
    : [withoutData.slice(0, slashAt), withoutData.slice(slashAt) + query];
}

/**
 * The market a path belongs to.
 *
 * Matching is whole-segment and case-insensitive: `/HI-IN/cart` resolves to
 * hi-IN, while `/hi-india/cart` and `/collections/hi-in-picks` do not. Any
 * unconfigured market — `/en-xx` — falls back to {@link DEFAULT_LOCALE} rather
 * than throwing, so a malformed or retired URL degrades to the default market's
 * content instead of a 500.
 */
export function resolveLocale(path: string): Locale {
  if (!path || path === "/") {
    return DEFAULT_LOCALE;
  }
  const [segment] = splitLeadingSegment(
    path.startsWith("/") ? path : `/${path}`,
  );

  return LOCALE_BY_PREFIX[segment.toLowerCase()] ?? DEFAULT_LOCALE;
}

/** The market for a request URL. */
export function resolveLocaleFromRequest(request: Request): Locale {
  return resolveLocale(new URL(request.url).pathname);
}

/**
 * An app path localized for the market the request came in on.
 *
 * Server redirects must never build a prefix by hand: `` `${params.locale}/x` ``
 * omits the leading slash, so the browser resolves it against the current
 * directory and the shopper lands somewhere arbitrary. Routing through
 * {@link localizePath} guarantees an absolute, correctly prefixed path and
 * keeps the market on customer-account round trips.
 */
export function localizedPathForRequest(
  request: Request,
  path: string,
): string {
  return localizePath(path, resolveLocaleFromRequest(request));
}

/**
 * Market prefixes this storefront used to serve, listed in
 * `app/utils/const.ts` before the canonical table replaced it.
 *
 * Search engines and inbound links still hold these URLs. Answering them with
 * 404 discards that equity, and serving the default market's page at the old
 * URL would duplicate the catalogue, so they redirect to the equivalent
 * market-neutral path instead. Re-adding any of them is a one-line change to
 * {@link SUPPORTED_LOCALES}; this map exists only so retired URLs stay
 * addressable, and every entry is absent from that table by construction.
 */
const RETIRED_MARKET_PREFIXES: Record<string, true> = {
  "/de-at": true,
  "/de-ch": true,
  "/en-au": true,
  "/en-ca": true,
  "/en-cn": true,
  "/en-de": true,
  "/en-es": true,
  "/en-fr": true,
  "/en-hk": true,
  "/en-it": true,
  "/en-jp": true,
  "/en-nl": true,
  "/en-vn": true,
  "/es-mx": true,
  "/fr-be": true,
  "/fr-ca": true,
  "/fr-ch": true,
  "/it-ch": true,
  "/it-it": true,
  "/ja-jp": true,
  "/zh-cn": true,
  "/zh-hk": true,
  "/zh-tw": true,
};

/**
 * The market-neutral path a retired market's URL should redirect to, or `null`
 * when the path is not a retired market.
 *
 * The query string and React Router's `.data` suffix ride along so a redirected
 * single-fetch navigation stays a single-fetch navigation.
 */
export function retiredMarketPath(path: string): string | null {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  const [segment, rest] = splitLeadingSegment(withSlash);
  if (RETIRED_MARKET_PREFIXES[segment.toLowerCase()] !== true) {
    return null;
  }
  const suffix = withSlash.endsWith(".data") ? ".data" : "";
  const queryAt = rest.search(/[?#]/);
  const base = queryAt === -1 ? rest : rest.slice(0, queryAt);
  const query = queryAt === -1 ? "" : rest.slice(queryAt);
  const target = base.startsWith("/") ? base : `/${base}`;

  return (target === "/" && suffix ? "/" : target) + suffix + query;
}

/**
 * Where to send a shopper who hits an account route without a session.
 *
 * Hydrogen's `defaultAuthStatusHandler` redirects to a fixed `/account/login`,
 * so a shopper bounced out of `/de-de/account` would sign in on the default
 * market and return there. This keeps both the login URL and the `return_to`
 * path on the market the request came in on.
 *
 * The `return_to` normalization matches Hydrogen's own: React Router's
 * single-fetch `.data` suffix and `/_root` segment are stripped, and a trailing
 * slash is dropped, so the value round-trips as a real app path.
 */
export function unauthorizedRedirect(
  request: Request,
  locale: Locale,
): Response {
  const { pathname } = new URL(request.url);
  const returnTo = pathname
    .replace(/\.data$/, "")
    .replace(/\/_root$/, "/")
    .replace(/(.+)\/$/, "$1");
  const login = localizePath("/account/login", locale);
  const query = new URLSearchParams({
    return_to: localizePath(returnTo, locale),
  });

  return new Response(null, {
    status: 302,
    headers: { Location: `${login}?${query.toString()}` },
  });
}

/** The exact shape of a market prefix: `xx-yy`, nothing longer or shorter. */
const MARKET_SHAPED_SEGMENT = /^\/[a-z]{2}-[a-z]{2}$/;

/**
 * Whether a path opens with a market-shaped segment this storefront does not
 * sell in, such as `/en-xx/products/hoodie`.
 *
 * {@link resolveLocale} deliberately falls back to {@link DEFAULT_LOCALE} so
 * that link, redirect and sitemap helpers never throw on a malformed URL. That
 * fallback is wrong for an inbound request: it would serve the default market's
 * page at a non-canonical URL, duplicating the whole catalogue under an
 * unbounded set of invented prefixes. The request boundary refuses those URLs
 * instead.
 *
 * The test is deliberately narrow. Only an exact `xx-yy` segment counts, so a
 * root-level custom page handle (`/about-us`), a longer prefix-like segment
 * (`/hi-india`) and a content path (`/collections/hi-in-specials`) all stay
 * routable. A root-level handle that is itself `xx-yy` shaped is unroutable by
 * construction — it is indistinguishable from a market prefix.
 */
export function isUnsupportedMarketPath(path: string): boolean {
  if (!path || path === "/") {
    return false;
  }
  const [segment] = splitLeadingSegment(
    path.startsWith("/") ? path : `/${path}`,
  );
  const prefix = segment.toLowerCase();

  return (
    MARKET_SHAPED_SEGMENT.test(prefix) && LOCALE_BY_PREFIX[prefix] === undefined
  );
}

/**
 * Rewrites a market-neutral path for `locale`, preserving the query string.
 * Idempotent: a path already prefixed for that market is returned unchanged.
 */
export function localizePath(path: string, locale: Locale): string {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  if (!locale.pathPrefix) {
    return withSlash;
  }
  if (resolveLocale(withSlash) === locale) {
    return withSlash;
  }
  // `/` would otherwise produce a trailing slash (`/de-de/`), which is a
  // separate URL to search engines than the `/de-de` the selector links to.
  const [head, rest] = splitLeadingSegment(withSlash);

  return head === "/"
    ? locale.pathPrefix + rest
    : locale.pathPrefix + withSlash;
}

/**
 * Strips a leading market prefix, yielding the path shared by every market.
 *
 * Only the first segment is considered, so a path that merely contains prefix
 * text (`/collections/hi-in-picks`) is left alone.
 */
export function delocalizePath(path: string): string {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  const locale = resolveLocale(withSlash);
  if (!locale.pathPrefix) {
    return withSlash;
  }
  // Strip the prefix only. React Router's single-fetch `.data` suffix is part
  // of the request protocol, not the market: Hydrogen reads it to decide
  // between a 301 `Location` and a 204 `X-Remix-Redirect`, so dropping it here
  // would answer a client-side navigation with a document redirect.
  const suffix = withSlash.endsWith(".data") ? ".data" : "";
  const [, rest] = splitLeadingSegment(withSlash);
  const base = rest.startsWith("/") ? rest : `/${rest}`;

  return suffix && !base.endsWith(suffix) ? base + suffix : base;
}

/** An `hreflang` entry for Hydrogen's `SeoConfig.alternates`. */
export type AlternateLink = {
  language: string;
  url: string;
};

/**
 * Every localized variant of a page, plus `x-default` for the default market.
 *
 * The query string is dropped: filter and sort permutations of a collection are
 * the same document in every market, and advertising them as distinct localized
 * URLs would duplicate the whole facet space per market.
 */
/**
 * URL namespaces addressed by a Shopify resource handle.
 *
 * A handle is per-market data: Shopify localizes it (hence
 * `redirectIfHandleIsLocalized` on the product, collection, blog, article and
 * page routes), and a resource can be unpublished in a market entirely.
 */
const RESOURCE_NAMESPACE: Record<string, true> = {
  blogs: true,
  collections: true,
  pages: true,
  policies: true,
  products: true,
};

/**
 * Whether the same path is known to address the same page in every market.
 *
 * Swapping the market prefix is only sound for paths the route table defines —
 * `/`, `/search`, `/collections` — because those exist in every market by
 * construction. A path that addresses a resource (`/products/<handle>`) is not
 * provable here: the handle may be localized, and the resource may not be
 * published to that market at all, so the swapped URL can 301 elsewhere or 404.
 *
 * Proving those would need one Storefront query per market per page. Until that
 * data is in hand the alternates are omitted, because a wrong `hreflang` tells
 * a search engine a page exists where it does not, which is worse than no
 * `hreflang` at all.
 */
export function isMarketInvariantPath(path: string): boolean {
  const segments = delocalizePath(path)
    .split("?")[0]
    .split("/")
    .filter(Boolean);

  return segments.length < 2 || RESOURCE_NAMESPACE[segments[0]] !== true;
}

export function alternateLinks(path: string, origin: string): AlternateLink[] {
  if (!isMarketInvariantPath(path)) {
    return [];
  }
  const queryAt = path.search(/[?#]/);
  const neutral = delocalizePath(
    queryAt === -1 ? path : path.slice(0, queryAt),
  );
  const base = origin.endsWith("/") ? origin.slice(0, -1) : origin;
  // `/` localizes to a bare prefix, so the default market's home URL is the
  // origin itself rather than `${origin}/`.
  const href = (locale: Locale) => {
    const localized = localizePath(neutral, locale);
    return localized === "/" ? base : base + localized;
  };

  return [
    ...SUPPORTED_LOCALES.map((locale) => ({
      language: locale.hreflang,
      url: href(locale),
    })),
    // Emitted as a literal `x-default` language rather than via Hydrogen's
    // `default: true` flag, which renders `hreflang="en-US-default"` — not a
    // value any search engine recognises.
    { language: "x-default", url: href(DEFAULT_LOCALE) },
  ];
}
