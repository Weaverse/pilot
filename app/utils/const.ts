import type { I18nLocale, Localizations } from "~/types/others";

export const COUNTRIES: Localizations = {
  default: {
    label: "United States (USD $)",
    language: "EN",
    country: "US",
    currency: "USD",
  },
  "/zh-cn": {
    label: "China (CNY ¥)",
    language: "ZH",
    country: "CN",
    currency: "CNY",
  },
  "/de-de": {
    label: "Germany (EUR €)",
    language: "DE",
    country: "DE",
    currency: "EUR",
  },
  "/es-es": {
    label: "España (EUR €)",
    language: "ES",
    country: "ES",
    currency: "EUR",
  },
  "/fr-fr": {
    label: "France (EUR €)",
    language: "FR",
    country: "FR",
    currency: "EUR",
  },
  "/ja-jp": {
    label: "Japan (JPY ¥)",
    language: "JA",
    country: "JP",
    currency: "JPY",
  },
  "/vi-vn": {
    label: "Việt Nam (VND ₫)",
    language: "VI",
    country: "VN",
    currency: "VND",
  },
};

export const DEFAULT_LOCALE: I18nLocale = Object.freeze({
  ...COUNTRIES.default,
  pathPrefix: "",
});

export const FILTER_URL_PREFIX = "filter.";
