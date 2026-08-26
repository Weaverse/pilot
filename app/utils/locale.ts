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
    pathPrefix: "/en-au",
    label: "Australia (AUD $)",
    languageLabel: "English",
    language: "EN",
    country: "AU",
    currency: "AUD",
    hreflang: "en-AU",
    direction: "ltr",
  },
  {
    pathPrefix: "/de-at",
    label: "Austria (EUR €)",
    languageLabel: "Deutsch",
    language: "DE",
    country: "AT",
    currency: "EUR",
    hreflang: "de-AT",
    direction: "ltr",
  },
  {
    pathPrefix: "/fr-be",
    label: "Belgium (EUR €)",
    languageLabel: "Français",
    language: "FR",
    country: "BE",
    currency: "EUR",
    hreflang: "fr-BE",
    direction: "ltr",
  },
  {
    pathPrefix: "/en-ca",
    label: "Canada (CAD $)",
    languageLabel: "English",
    language: "EN",
    country: "CA",
    currency: "CAD",
    hreflang: "en-CA",
    direction: "ltr",
  },
  {
    pathPrefix: "/fr-ca",
    label: "Canada (CAD $)",
    languageLabel: "Français",
    language: "FR",
    country: "CA",
    currency: "CAD",
    hreflang: "fr-CA",
    direction: "ltr",
  },
  {
    pathPrefix: "/en-cn",
    label: "China (CNY ¥)",
    languageLabel: "English",
    language: "EN",
    country: "CN",
    currency: "CNY",
    hreflang: "en-CN",
    direction: "ltr",
  },
  {
    pathPrefix: "/zh-cn",
    label: "China (CNY ¥)",
    languageLabel: "中文",
    language: "ZH",
    country: "CN",
    currency: "CNY",
    hreflang: "zh-CN",
    direction: "ltr",
  },
  {
    pathPrefix: "/en-fr",
    label: "France (EUR €)",
    languageLabel: "English",
    language: "EN",
    country: "FR",
    currency: "EUR",
    hreflang: "en-FR",
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
    pathPrefix: "/en-de",
    label: "Germany (EUR €)",
    languageLabel: "English",
    language: "EN",
    country: "DE",
    currency: "EUR",
    hreflang: "en-DE",
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
    pathPrefix: "/en-hk",
    label: "Hong Kong (HKD $)",
    languageLabel: "English",
    language: "EN",
    country: "HK",
    currency: "HKD",
    hreflang: "en-HK",
    direction: "ltr",
  },
  {
    pathPrefix: "/zh-hk",
    label: "Hong Kong (HKD $)",
    languageLabel: "中文",
    language: "ZH",
    country: "HK",
    currency: "HKD",
    hreflang: "zh-HK",
    direction: "ltr",
  },
  {
    pathPrefix: "/en-it",
    label: "Italy (EUR €)",
    languageLabel: "English",
    language: "EN",
    country: "IT",
    currency: "EUR",
    hreflang: "en-IT",
    direction: "ltr",
  },
  {
    pathPrefix: "/it-it",
    label: "Italy (EUR €)",
    languageLabel: "Italiano",
    language: "IT",
    country: "IT",
    currency: "EUR",
    hreflang: "it-IT",
    direction: "ltr",
  },
  {
    pathPrefix: "/en-jp",
    label: "Japan (JPY ¥)",
    languageLabel: "English",
    language: "EN",
    country: "JP",
    currency: "JPY",
    hreflang: "en-JP",
    direction: "ltr",
  },
  {
    pathPrefix: "/ja-jp",
    label: "Japan (JPY ¥)",
    languageLabel: "日本語",
    language: "JA",
    country: "JP",
    currency: "JPY",
    hreflang: "ja-JP",
    direction: "ltr",
  },
  {
    pathPrefix: "/es-mx",
    label: "Mexico (MXN $)",
    languageLabel: "Español",
    language: "ES",
    country: "MX",
    currency: "MXN",
    hreflang: "es-MX",
    direction: "ltr",
  },
  {
    pathPrefix: "/en-nl",
    label: "Netherlands (EUR €)",
    languageLabel: "English",
    language: "EN",
    country: "NL",
    currency: "EUR",
    hreflang: "en-NL",
    direction: "ltr",
  },
  {
    pathPrefix: "/en-es",
    label: "Spain (EUR €)",
    languageLabel: "English",
    language: "EN",
    country: "ES",
    currency: "EUR",
    hreflang: "en-ES",
    direction: "ltr",
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
    pathPrefix: "/de-ch",
    label: "Switzerland (CHF Fr.)",
    languageLabel: "Deutsch",
    language: "DE",
    country: "CH",
    currency: "CHF",
    hreflang: "de-CH",
    direction: "ltr",
  },
  {
    pathPrefix: "/fr-ch",
    label: "Switzerland (CHF Fr.)",
    languageLabel: "Français",
    language: "FR",
    country: "CH",
    currency: "CHF",
    hreflang: "fr-CH",
    direction: "ltr",
  },
  {
    pathPrefix: "/it-ch",
    label: "Switzerland (CHF Fr.)",
    languageLabel: "Italiano",
    language: "IT",
    country: "CH",
    currency: "CHF",
    hreflang: "it-CH",
    direction: "ltr",
  },
  {
    pathPrefix: "/zh-tw",
    label: "Taiwan (TWD $)",
    languageLabel: "中文",
    language: "ZH",
    country: "TW",
    currency: "TWD",
    hreflang: "zh-TW",
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
  {
    pathPrefix: "/en-vn",
    label: "Vietnam (VND ₫)",
    languageLabel: "English",
    language: "EN",
    country: "VN",
    currency: "VND",
    hreflang: "en-VN",
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
 * Paths this theme's route table defines with no dynamic segment, and which
 * therefore address the same page in every market.
 *
 * Every entry is a static `route(...)` or `index(...)` under the `:locale?`
 * prefix in `app/routes.ts`. `/cart` is listed because it renders in every
 * market, even though its contents differ per shopper.
 *
 * Deliberately excluded:
 * - anything with a handle (`/products/<handle>`, `/blogs/<blog>/<article>`,
 *   `/pages/<handle>`, `/policies/<handle>`): Shopify localizes handles — which
 *   is why five routes call `redirectIfHandleIsLocalized` — and a resource can
 *   be unpublished in a market, so the swapped URL may redirect or 404;
 * - `/account/*`: behind auth and noindex;
 * - `/api/*`, sitemaps and `robots.txt`: not indexable pages;
 * - anything served by the `*` catch-all, including Weaverse custom pages: a
 *   custom page is published per project, and nothing here proves it exists in
 *   every market.
 */
const MARKET_INVARIANT_PATHS: Record<string, true> = {
  "/": true,
  "/search": true,
  "/cart": true,
  "/collections": true,
  "/products": true,
  "/policies": true,
};

/**
 * Whether the same path is known to address the same page in every market.
 *
 * This is an exact allowlist, not a heuristic: a path is market-invariant only
 * when the route table proves it. Anything unrecognised — a custom page, an
 * unknown URL, a resource handle — returns `false`, because a wrong `hreflang`
 * tells a search engine a page exists where it does not, which is worse than
 * no `hreflang` at all.
 */
export function isMarketInvariantPath(path: string): boolean {
  const neutral = delocalizePath(path).split(/[?#]/)[0];
  const normalized =
    neutral.length > 1 && neutral.endsWith("/")
      ? neutral.slice(0, -1)
      : neutral;

  return MARKET_INVARIANT_PATHS[normalized.toLowerCase()] === true;
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
