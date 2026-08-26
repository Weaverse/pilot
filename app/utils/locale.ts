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
  const [, rest] = splitLeadingSegment(withSlash);

  return rest.startsWith("/") ? rest : `/${rest}`;
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
export function alternateLinks(path: string, origin: string): AlternateLink[] {
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
