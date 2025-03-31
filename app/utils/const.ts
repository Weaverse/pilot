import type { I18nLocale, Localizations } from "~/types/locale";

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
    language: "EN",
    country: "CN",
    currency: "CNY",
  },
  "/en-de": {
    label: "Germany (EUR €)",
    language: "EN",
    country: "DE",
    currency: "EUR",
  },
  "/en-es": {
    label: "Spain (EUR €)",
    language: "EN",
    country: "ES",
    currency: "EUR",
  },
  "/en-fr": {
    label: "France (EUR €)",
    language: "EN",
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
    language: "EN",
    country: "IT",
    currency: "EUR",
  },
  "/en-jp": {
    label: "Japan (JPY ¥)",
    language: "EN",
    country: "JP",
    currency: "JPY",
  },

  "/en-nl": {
    label: "Netherlands (EUR €)",
    language: "EN",
    country: "NL",
    currency: "EUR",
  },
  "/en-vn": {
    label: "Vietnam (VND ₫)",
    language: "EN",
    country: "VN",
    currency: "VND",
  },
};

export const PAGINATION_SIZE = 16;

export const DEFAULT_LOCALE: I18nLocale = Object.freeze({
  ...COUNTRIES.default,
  pathPrefix: "",
});
