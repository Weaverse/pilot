import type { I18nLocale, Localizations } from "~/types/others";

export const COUNTRIES: Localizations = {
  default: {
    label: "United States (USD $)",
    language: "EN",
    country: "US",
    currency: "USD",
  },
  "/en-au": {
    label: "Australia (AUD $)",
    language: "EN",
    country: "AU",
    currency: "AUD",
  },
  "/de-at": {
    label: "Austria (EUR €)",
    language: "DE",
    country: "AT",
    currency: "EUR",
  },
  "/fr-be": {
    label: "Belgium (EUR €)",
    language: "FR",
    country: "BE",
    currency: "EUR",
  },
  "/en-ca": {
    label: "Canada (CAD $)",
    language: "EN",
    country: "CA",
    currency: "CAD",
  },
  "/fr-ca": {
    label: "Canada (CAD $)",
    language: "FR",
    country: "CA",
    currency: "CAD",
  },
  "/en-cn": {
    label: "China (CNY ¥)",
    language: "EN",
    country: "CN",
    currency: "CNY",
  },
  "/zh-cn": {
    label: "China (CNY ¥)",
    language: "ZH",
    country: "CN",
    currency: "CNY",
  },
  "/en-fr": {
    label: "France (EUR €)",
    language: "EN",
    country: "FR",
    currency: "EUR",
  },
  "/fr-fr": {
    label: "France (EUR €)",
    language: "FR",
    country: "FR",
    currency: "EUR",
  },
  "/en-de": {
    label: "Germany (EUR €)",
    language: "EN",
    country: "DE",
    currency: "EUR",
  },
  "/de-de": {
    label: "Germany (EUR €)",
    language: "DE",
    country: "DE",
    currency: "EUR",
  },
  "/en-hk": {
    label: "Hong Kong (HKD $)",
    language: "EN",
    country: "HK",
    currency: "HKD",
  },
  "/zh-hk": {
    label: "Hong Kong (HKD $)",
    language: "ZH",
    country: "HK",
    currency: "HKD",
  },
  "/en-it": {
    label: "Italy (EUR €)",
    language: "EN",
    country: "IT",
    currency: "EUR",
  },
  "/it-it": {
    label: "Italy (EUR €)",
    language: "IT",
    country: "IT",
    currency: "EUR",
  },
  "/en-jp": {
    label: "Japan (JPY ¥)",
    language: "EN",
    country: "JP",
    currency: "JPY",
  },
  "/ja-jp": {
    label: "Japan (JPY ¥)",
    language: "JA",
    country: "JP",
    currency: "JPY",
  },
  "/es-mx": {
    label: "Mexico (MXN $)",
    language: "ES",
    country: "MX",
    currency: "MXN",
  },
  "/en-nl": {
    label: "Netherlands (EUR €)",
    language: "EN",
    country: "NL",
    currency: "EUR",
  },
  "/en-es": {
    label: "Spain (EUR €)",
    language: "EN",
    country: "ES",
    currency: "EUR",
  },
  "/es-es": {
    label: "Spain (EUR €)",
    language: "ES",
    country: "ES",
    currency: "EUR",
  },
  "/de-ch": {
    label: "Switzerland (CHF Fr.)",
    language: "DE",
    country: "CH",
    currency: "CHF",
  },
  "/fr-ch": {
    label: "Switzerland (CHF Fr.)",
    language: "FR",
    country: "CH",
    currency: "CHF",
  },
  "/it-ch": {
    label: "Switzerland (CHF Fr.)",
    language: "IT",
    country: "CH",
    currency: "CHF",
  },
  "/zh-tw": {
    label: "Taiwan (TWD $)",
    language: "ZH",
    country: "TW",
    currency: "TWD",
  },
  "/en-gb": {
    label: "United Kingdom (GBP £)",
    language: "EN",
    country: "GB",
    currency: "GBP",
  },
  "/en-vn": {
    label: "Vietnam (VND ₫)",
    language: "EN",
    country: "VN",
    currency: "VND",
  },
};

export const DEFAULT_LOCALE: I18nLocale = Object.freeze({
  ...COUNTRIES.default,
  pathPrefix: "",
});

/**
 * Extract the locale path prefix (e.g. `/en-ca`) from a pathname's first
 * segment, validated against the known `COUNTRIES` map. Returns `""` for the
 * default locale or any non-locale path (e.g. `/products/...`) so a regular
 * page segment is never mistaken for a locale prefix.
 */
export function getLocalePrefixFromPath(pathname: string): string {
  const firstPathPart = `/${pathname.substring(1).split("/")[0].toLowerCase()}`;
  return COUNTRIES[firstPathPart] ? firstPathPart : "";
}

export const FILTER_URL_PREFIX = "filter.";

export const LANGUAGE_LABELS: Record<string, string> = {
  EN: "English",
  DE: "Deutsch",
  FR: "Français",
  ES: "Español",
  IT: "Italiano",
  JA: "日本語",
  ZH: "中文",
};
