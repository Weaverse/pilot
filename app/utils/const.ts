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
  "/en-ca": {
    label: "Canada (CAD $)",
    language: "EN",
    country: "CA",
    currency: "CAD",
  },
  "/en-cn": {
    label: "China (CNY ¥)",
    language: "ZH",
    country: "CN",
    currency: "CNY",
  },
  "/en-de": {
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
  "/en-fr": {
    label: "France (EUR €)",
    language: "FR",
    country: "FR",
    currency: "EUR",
  },
  "/en-gb": {
    label: "United Kingdom (GBP £)",
    language: "EN",
    country: "GB",
    currency: "GBP",
  },
  "/en-it": {
    label: "Italy (EUR €)",
    language: "IT",
    country: "IT",
    currency: "EUR",
  },
  "/en-jp": {
    label: "Japan (JPY ¥)",
    language: "JA",
    country: "JP",
    currency: "JPY",
  },
  "/en-nl": {
    label: "Netherlands (EUR €)",
    language: "NL",
    country: "NL",
    currency: "EUR",
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
